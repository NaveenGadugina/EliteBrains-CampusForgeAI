const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            branch TEXT,
            semester TEXT,
            streak INTEGER DEFAULT 0,
            lastLogin TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // AI History table
        db.run(`CREATE TABLE IF NOT EXISTS ai_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            feature TEXT,
            prompt TEXT,
            response TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`);

        // Saved Projects table
        db.run(`CREATE TABLE IF NOT EXISTS saved_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT,
            data TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`);

        // LinkedIn Style Profile table
        db.run(`CREATE TABLE IF NOT EXISTS linkedin_style_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            tone TEXT,
            vocabularyStyle TEXT,
            storytellingStyle TEXT,
            emojiUsage TEXT,
            sentenceLength TEXT,
            technicalDepth TEXT,
            hookStyle TEXT,
            formattingStyle TEXT,
            sampleTexts TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`);

        // GitHub Integrations table
        db.run(`CREATE TABLE IF NOT EXISTS github_integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            githubUsername TEXT,
            accessToken TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`);

        // GitHub Projects table
        db.run(`CREATE TABLE IF NOT EXISTS github_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            repoName TEXT,
            repoUrl TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`);
    });
}

module.exports = db;
