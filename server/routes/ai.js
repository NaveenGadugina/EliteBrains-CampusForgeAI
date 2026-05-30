const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const callGemini = async (systemPrompt, userMessage, userContext) => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const fullPrompt = `System Instructions:${systemPrompt}
User Context: ${userContext}
User Message:${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    // Clean JSON response if AI wraps it in code blocks
    const clean = text.replace(/```json|```/g, "").trim();
    try {
    return JSON.parse(clean);
} catch {
    return { response: clean };
}
};

// Route for all AI features
router.post('/:feature', authMiddleware, async (req, res) => {
    const { feature } = req.params;
    const { prompt, systemPrompt } = req.body;
    const userId = req.user.id;

    try {
        // Fetch user data for context
        db.get('SELECT name, branch, semester FROM users WHERE id = ?', [userId], async (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const userContext = `The user is ${user.name}, studying ${user.branch} in semester ${user.semester}.`;

            try {
                const aiResponse = await callGemini(systemPrompt, prompt, userContext);

                // Save to AI History
                db.run(
                    'INSERT INTO ai_history (userId, feature, prompt, response) VALUES (?, ?, ?, ?)',
                    [userId, feature, prompt, JSON.stringify(aiResponse)],
                    (err) => {
                        if (err) console.error('Error saving AI history:', err);
                    }
                );

                res.json(aiResponse);
            } catch (err) {
                console.error('Gemini API Error:', err);
                res.status(500).json({ message: 'AI processing failed' });
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
