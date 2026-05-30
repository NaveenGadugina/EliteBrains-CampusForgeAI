const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, branch, semester } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check for existing user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (user) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run(
                'INSERT INTO users (name, email, password, branch, semester, lastLogin) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, hashedPassword, branch, semester, new Date().toISOString()],
                function(err) {
                    if (err) return res.status(500).json({ message: 'Error creating user' });

                    const token = jwt.sign({ id: this.lastID }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
                    res.json({
                        token,
                        user: { id: this.lastID, name, email, branch, semester, streak: 0 }
                    });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (!user) return res.status(400).json({ message: 'User does not exist' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            // Update streak and lastLogin
            const now = new Date();
            const lastLogin = new Date(user.lastLogin);
            let newStreak = user.streak;

            const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1; // Reset streak if missed a day
            } else if (user.streak === 0) {
                newStreak = 1;
            }

            db.run(
                'UPDATE users SET streak = ?, lastLogin = ? WHERE id = ?',
                [newStreak, now.toISOString(), user.id],
                (err) => {
                    if (err) console.error('Error updating streak:', err);

                    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
                    res.json({
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            branch: user.branch,
                            semester: user.semester,
                            streak: newStreak
                        }
                    });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
