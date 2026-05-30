const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const multer = require('multer');
const admZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ dest: 'uploads/' });

// POST /github/connect - Store GitHub token (In a real app, this would be the OAuth callback)
router.post('/connect', authMiddleware, (req, res) => {
    const { githubUsername, accessToken } = req.body;
    const userId = req.user.id;

    if (!githubUsername || !accessToken) {
        return res.status(400).json({ message: 'Missing GitHub details' });
    }

    db.run(
        'INSERT OR REPLACE INTO github_integrations (userId, githubUsername, accessToken) VALUES (?, ?, ?)',
        [userId, githubUsername, accessToken],
        (err) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'GitHub connected successfully', githubUsername });
        }
    );
});

// GET /github/status - Check if GitHub is connected
router.get('/status', authMiddleware, (req, res) => {
    db.get('SELECT githubUsername FROM github_integrations WHERE userId = ?', [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ connected: !!row, githubUsername: row ? row.githubUsername : null });
    });
});

// POST /github/upload-project - Upload ZIP, extract, and analyze
router.post('/upload-project', authMiddleware, upload.single('projectZip'), async (req, res) => {
    const userId = req.user.id;
    const { repoName } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const zip = new admZip(file.path);
    const extractPath = path.join(__dirname, '../uploads', `project_${userId}_${Date.now()}`);
    zip.extractAllTo(extractPath, true);

    // List files to help AI understand structure
    const files = fs.readdirSync(extractPath);
    const structure = files.join(', ');

    const analysisPrompt = `Analyze this project structure and files to generate a professional README.md and .gitignore.
    Repo Name: ${repoName}
    Files: ${structure}

    Return a JSON object:
    {
        "readme": "string (markdown content)",
        "gitignore": "string (content)",
        "techStack": ["string"],
        "description": "string"
    }
    
    Return ONLY JSON.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await model.generateContent(analysisPrompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const projectInfo = JSON.parse(cleanJson);

        // Store temporary project info in memory or DB? Let's send to frontend to review
        res.json({ 
            tempPath: extractPath,
            repoName,
            ...projectInfo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Project analysis failed' });
    }
});

// POST /github/publish - Create repo and push code
router.post('/publish', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { repoName, tempPath, readme, gitignore, isPrivate } = req.body;

    console.log(`[Publish] Starting publish for user ${userId}, repo: ${repoName}`);

    db.get('SELECT accessToken FROM github_integrations WHERE userId = ?', [userId], async (err, integration) => {
        if (err) {
            console.error('[Publish] Database error fetching token:', err);
            return res.status(500).json({ message: 'Database error fetching GitHub token' });
        }
        if (!integration || !integration.accessToken) {
            console.error('[Publish] GitHub not connected for user:', userId);
            return res.status(401).json({ message: 'GitHub not connected. Please connect your account first.' });
        }

        const octokit = new Octokit({ auth: integration.accessToken });

        try {
            // 1. Create Repo on GitHub
            console.log('[Publish] Creating repository on GitHub...');
            let repo;
            try {
                const { data } = await octokit.repos.createForAuthenticatedUser({
                    name: repoName,
                    private: isPrivate === true || isPrivate === 'true',
                    auto_init: false
                });
                repo = data;
                console.log('[Publish] Repository created:', repo.full_name);
            } catch (createErr) {
                console.error('[Publish] Failed to create repository:', createErr);
                if (createErr.status === 422) {
                    return res.status(422).json({ message: `Repository "${repoName}" already exists on your GitHub account.` });
                }
                if (createErr.status === 401) {
                    return res.status(401).json({ message: 'Invalid GitHub token. Please reconnect your account.' });
                }
                throw createErr;
            }

            // 2. Handle Nested Folders and Prepare Files
            console.log('[Publish] Checking for nested folders in:', tempPath);
            let workDir = tempPath;
            const topLevelFiles = fs.readdirSync(tempPath);
            if (topLevelFiles.length === 1 && fs.statSync(path.join(tempPath, topLevelFiles[0])).isDirectory()) {
                workDir = path.join(tempPath, topLevelFiles[0]);
                console.log('[Publish] Found nested folder, using as workDir:', workDir);
            }

            console.log('[Publish] Writing README.md and .gitignore...');
            fs.writeFileSync(path.join(workDir, 'README.md'), readme || '# ' + repoName);
            fs.writeFileSync(path.join(workDir, '.gitignore'), gitignore || 'node_modules\n.env\n.DS_Store');

            // 3. Git operations
            console.log('[Publish] Initializing local git in:', workDir);
            const git = simpleGit(workDir);
            
            try {
                await git.init();
                console.log('[Publish] Git initialized');

                // Configure temporary user for commit
                await git.addConfig('user.name', 'CampusForge AI');
                await git.addConfig('user.email', 'ai@campusforge.com');

                await git.add('.');
                console.log('[Publish] Files added to staging');
                
                // AI Commit message
                console.log('[Publish] Generating commit message...');
                let commitMsg = 'Initial commit from CampusForge AI';
                try {
                    const commitPrompt = `Generate a concise git commit message (max 50 chars) for the initial commit of project: ${repoName}`;
                    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
                    const commitResult = await model.generateContent(commitPrompt);
                    commitMsg = commitResult.response.text().trim().replace(/^"|"$/g, '');
                } catch (aiErr) {
                    console.warn('[Publish] Gemini commit message failed, using default:', aiErr.message);
                }

                await git.commit(commitMsg);
                console.log('[Publish] Committed with message:', commitMsg);

                await git.branch(['-M', 'main']);
                console.log('[Publish] Switched to main branch');
                
                // Add remote with token for auth
                const remoteUrl = `https://x-access-token:${integration.accessToken}@github.com/${repo.full_name}.git`;
                
                // Check if remote already exists (unlikely in fresh temp dir but safe)
                const remotes = await git.getRemotes();
                if (remotes.find(r => r.name === 'origin')) {
                    await git.removeRemote('origin');
                }
                
                await git.addRemote('origin', remoteUrl);
                console.log('[Publish] Remote origin added');

                console.log('[Publish] Pushing to GitHub main branch...');
                await git.push('origin', 'main');
                console.log('[Publish] Push successful');

            } catch (gitErr) {
                console.error('[Publish] Git operation failed:', gitErr);
                return res.status(500).json({ 
                    message: 'Git operations failed during publishing', 
                    error: gitErr.message,
                    step: 'git'
                });
            }

            // 4. Save to Database
            db.run(
                'INSERT INTO github_projects (userId, repoName, repoUrl) VALUES (?, ?, ?)',
                [userId, repoName, repo.html_url],
                (dbErr) => {
                    if (dbErr) console.error('[Publish] Error saving project to DB:', dbErr);
                }
            );

            console.log('[Publish] All steps completed successfully for:', repo.full_name);
            res.json({ 
                message: 'Project successfully published to GitHub!', 
                url: repo.html_url,
                repoName: repo.full_name
            });

        } catch (err) {
            console.error('[Publish] Unexpected error:', err);
            res.status(500).json({ 
                message: 'An unexpected error occurred during publishing', 
                error: err.message 
            });
        }
    });
});

module.exports = router;
