const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
    db.get('SELECT id, name, email, branch, semester, streak, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(user);
    });
});

// Get AI history
router.get('/history', authMiddleware, (req, res) => {
    db.all('SELECT * FROM ai_history WHERE userId = ? ORDER BY createdAt DESC', [req.user.id], (err, history) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(history);
    });
});

// Save project
router.post('/projects', authMiddleware, (req, res) => {
    const { title, data } = req.body;
    db.run(
        'INSERT INTO saved_projects (userId, title, data) VALUES (?, ?, ?)',
        [req.user.id, title, JSON.stringify(data)],
        function(err) {
            if (err) return res.status(500).json({ message: 'Error saving project' });
            res.json({ id: this.lastID, title, data });
        }
    );
});

// Get saved projects
router.get('/projects', authMiddleware, (req, res) => {
    db.all('SELECT * FROM saved_projects WHERE userId = ?', [req.user.id], (err, projects) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(projects.map(p => ({ ...p, data: JSON.parse(p.data) })));
    });
});

module.exports = router;
