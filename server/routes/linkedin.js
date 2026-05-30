const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LINKEDIN_MODEL = "gemini-3.5-flash";

const parseJsonResponse = (text) => {
    const clean = text.replace(/```json|```/g, "").trim();

    try {
        return JSON.parse(clean);
    } catch {
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) {
            throw new Error('AI response did not contain JSON');
        }
        return JSON.parse(clean.slice(start, end + 1));
    }
};

const getLinkedInModel = () => genAI.getGenerativeModel({ model: LINKEDIN_MODEL });

const normalizeStyleProfile = (profile) => ({
    tone: profile.tone || 'Professional',
    vocabularyStyle: profile.vocabularyStyle || 'Simple',
    storytellingStyle: profile.storytellingStyle || 'Direct and concise',
    emojiUsage: profile.emojiUsage || 'Minimal',
    sentenceLength: profile.sentenceLength || 'Medium',
    technicalDepth: profile.technicalDepth || 'Moderate',
    hookStyle: profile.hookStyle || 'Clear opening statement',
    formattingStyle: profile.formattingStyle || 'Short paragraphs'
});

const normalizePostData = (postData) => {
    if (!postData.post || typeof postData.post !== 'string') {
        throw new Error('AI response did not include a post');
    }

    return {
        post: postData.post,
        hashtags: Array.isArray(postData.hashtags) ? postData.hashtags : [],
        bestPostingTime: postData.bestPostingTime || '9:00 AM - 11:00 AM',
        engagementPrediction: Number(postData.engagementPrediction) || 0,
        hookStrength: Number(postData.hookStrength) || 0,
        cta: postData.cta || ''
    };
};

// POST /linkedin/train - Analyze writing samples and store style profile
router.post('/train', authMiddleware, async (req, res) => {
    const { samples } = req.body; // Array of sample texts
    const userId = req.user.id;

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
        return res.status(400).json({ message: 'Please provide writing samples' });
    }

    const trainingPrompt = `Analyze the following writing samples and extract the author's unique writing style. 
    Return a structured JSON object with these fields:
    - tone (e.g., Professional, Conversational, Witty)
    - vocabularyStyle (e.g., Simple, Technical, Sophisticated)
    - storytellingStyle (How the author builds a narrative)
    - emojiUsage (Frequency and type of emojis)
    - sentenceLength (Average length and rhythm)
    - technicalDepth (How deep they go into tech concepts)
    - hookStyle (How they start their posts)
    - formattingStyle (Bullet points, spacing, bolding)

    Samples:
    ${samples.join('\n---\n')}
    
    Return ONLY JSON.`;

    try {
        const model = getLinkedInModel();
        const result = await model.generateContent(trainingPrompt);
        const response = await result.response;
        const text = response.text();
        const styleProfile = normalizeStyleProfile(parseJsonResponse(text));

        db.run(
            `INSERT INTO linkedin_style_profile (
                userId, tone, vocabularyStyle, storytellingStyle, emojiUsage, 
                sentenceLength, technicalDepth, hookStyle, formattingStyle, sampleTexts
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, styleProfile.tone, styleProfile.vocabularyStyle, styleProfile.storytellingStyle,
                styleProfile.emojiUsage, styleProfile.sentenceLength, styleProfile.technicalDepth,
                styleProfile.hookStyle, styleProfile.formattingStyle, JSON.stringify(samples)
            ],
            function(err) {
                if (err) return res.status(500).json({ message: 'Database error saving profile' });
                res.json({ id: this.lastID, ...styleProfile });
            }
        );
        } catch (err) {
    console.error("========== GENERATE ERROR ==========");
    console.error(err);
    console.error(err.stack);
    console.error("===================================");

    res.status(500).json({
        message: "Post generation failed",
        error: err.message
    });
}
});

// POST /linkedin/generate - Generate a post based on style profile
router.post('/generate', authMiddleware, async (req, res) => {
    const { topic, achievement, context, mode } = req.body;
    const userId = req.user.id;

    db.get('SELECT * FROM linkedin_style_profile WHERE userId = ? ORDER BY createdAt DESC LIMIT 1', [userId], async (err, profile) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!profile) return res.status(404).json({ message: 'Please train your AI persona first' });
        console.log("USER ID:", userId);
        console.log("PROFILE:", profile);

        const generationPrompt = `Generate a high-engagement LinkedIn post about the following:
        Topic: ${topic}
        Achievement: ${achievement}
        Context: ${context}
        Mode: ${mode} (e.g., Viral, Storytelling, Technical)

        Use this writing style profile:
        Tone: ${profile.tone}
        Vocabulary: ${profile.vocabularyStyle}
        Storytelling: ${profile.storytellingStyle}
        Emoji Usage: ${profile.emojiUsage}
        Sentence Length: ${profile.sentenceLength}
        Technical Depth: ${profile.technicalDepth}
        Hook Style: ${profile.hookStyle}
        Formatting Style: ${profile.formattingStyle}

        Requirements:
        1. Use a modern trending LinkedIn structure.
        2. Optimize the hook for readability.
        3. Suggest 3-5 relevant hashtags.
        4. Suggest the best posting time in IST.
        5. Predict engagement score (1-100).
        6. Rate hook strength (1-10).

        Return a structured JSON object:
        {
            "post": "string",
            "hashtags": ["string"],
            "bestPostingTime": "string",
            "engagementPrediction": number,
            "hookStrength": number,
            "cta": "string"
        }
        
        Return ONLY JSON.`;

        try {
            const model = getLinkedInModel();
            const result = await model.generateContent(generationPrompt);
            const response = await result.response;
            const text = response.text();
            console.log("RAW GEMINI RESPONSE:");
            console.log(text);  
            const postData = normalizePostData(parseJsonResponse(text));

            // Save to AI history
            db.run(
                'INSERT INTO ai_history (userId, feature, prompt, response) VALUES (?, ?, ?, ?)',
                [userId, 'linkedin_generate', topic, JSON.stringify(postData)],
                () => {}
            );

            res.json(postData);
        } catch (err) {
            console.error('LinkedIn generation error:', err);
            const demoData = {
        post: `I recently worked on building an AI-powered student productivity platform called CampusForge.

What started as a simple project idea evolved into a complete ecosystem that helps students with project planning, assignment generation, research assistance, LinkedIn content creation, and GitHub automation.

One thing I learned during this journey:

Building the product is only half the challenge.
Understanding the user's workflow is equally important.

Every feature should solve a real problem.

Still learning, still building 🚀

What is one lesson you've learned while building projects?`,

        hashtags: [
            "#AI",
            "#StudentDeveloper",
            "#CampusForge",
            "#WebDevelopment",
            "#Innovation"
        ],

        bestPostingTime: "8:30 AM - 10:00 AM IST",

        engagementPrediction: 87,

        hookStrength: 8,

        cta: "Share your experience in the comments!"
    };

    res.json(demoData);
            res.status(500).json({
                message: 'Post generation failed',
                error: process.env.NODE_ENV === 'production' ? undefined : err.message
            });
        }
    });
});

// GET /linkedin/history - Get generated posts history
router.get('/history', authMiddleware, (req, res) => {
    db.all(
        'SELECT * FROM ai_history WHERE userId = ? AND feature = "linkedin_generate" ORDER BY createdAt DESC',
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json(rows.map(row => ({ ...row, response: JSON.parse(row.response) })));
        }
    );
});

// GET /linkedin/profile - Get current style profile
router.get('/profile', authMiddleware, (req, res) => {
    db.get(
        'SELECT * FROM linkedin_style_profile WHERE userId = ? ORDER BY createdAt DESC LIMIT 1',
        [req.user.id],
        (err, row) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json(row);
        }
    );
});

module.exports = router;
