# 🚀 CampusForge AI - Engineering Students' AI Companion

> **AI-powered research, project management, and career acceleration for engineering students**

---

## 🎯 Overview

CampusForge AI is an AI-powered platform designed for engineering college students. It helps you find project ideas, manage team projects, organize assignments, track productivity, build your LinkedIn presence, and analyze your GitHub code - all powered by Google Gemini AI.

---

## ✨ Main Features

### 1. **🔍 DeepSearch AI** - Research & Project Ideas
Find comprehensive project ideas with difficulty levels, tech stacks, and implementation roadmaps for subjects like DBMS, DSA, Operating Systems, etc.

### 2. **📋 Assignment AI** - Smart Task Breakdown
Transform assignments into structured plans with subtasks, study schedules, milestones, and resources with specialised functionality for each subjects like ML, Web Dev, DBMS etc.

### 3. **📊 Project Hub** - Kanban Board
Manage team projects with visual Kanban boards (Research → Planning → In Progress → Testing → Launch). Assign tasks, set deadlines, and track progress.

### 4. **📈 Productivity Dashboard** - Analytics & Insights
Track your productivity score, focus level, consistency, burnout risk, and get personalized study recommendations.

### 5. **💬 LinkedIn AI Persona** - Content Generation (Unique feature)
Define your unique voice and generate LinkedIn posts with hashtags, optimal posting times, and engagement predictions.

### 6. **🔧 GitHub AI Assistant** - Code Analysis ( Unique feature )
Upload your projects, get AI analysis for architecture quality, security issues, performance tips, and refactoring suggestions. Upload project zip:
1.Give the github personal access token and username
2.Give repo-name and upload zip file   
3.Model analyses zip and generates Readme File.
4.Pushes the project to remote github repository with self-generated readme.md

---

## 🛠️ Tech Stack

**Frontend**: React 18 + Vite + Lucide Icons + Recharts  
**Backend**: Node.js + Express + SQLite  
**AI**: Google Gemini 3.5 Flash API  
**Security**: JWT Authentication + bcryptjs Password Hashing

---

## 📦 Installation

### **Prerequisites**
- Node.js 20+ ([Download](https://nodejs.org/))
- Google Gemini API Key (Free at [Google AI Studio](https://ai.google.dev/))

### **Step 1: Clone & Setup Backend**

```bash
git clone https://github.com/yourusername/campusforge-ai.git
cd campusforge-ai/server

npm install

# Create .env file
cat > .env << EOF
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EOF

npm start
```

**Expected Output**:
```
Connected to SQLite database.
Server is running on port 5000
```

### **Step 2: Setup Frontend**

```bash
cd ../Client

npm install

# Create .env file
cat > .env << EOF
VITE_BACKEND_URL=http://localhost:5000/api
EOF

npm run dev
```

**Expected Output**:
```
VITE v5.1.0 ready in 289 ms
➜ Local: http://localhost:5173/
```

### **Step 3: Access Application**

Open browser and go to: `http://localhost:5173/`

---

## 🔐 Environment Variables

### Backend `.env`:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`:
```env
VITE_BACKEND_URL=http://localhost:5000/api
```

**Get Gemini API Key**:
- Visit [Google AI Studio](https://ai.google.dev/)
- Click "Get API Key" → "Create API Key"
- Free tier: 60 requests/minute

---

## 📂 Project Structure

```
campusforge-ai/
├── Client/                    # React Frontend
│   ├── src/
│   │   ├── App.jsx           # Main component (6 tabs)
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express Backend
│   ├── server.js             # Main server
│   ├── db.js                 # Database setup
│   ├── middleware/
│   │   └── authMiddleware.js # JWT validation
│   ├── routes/
│   │   ├── auth.js           # Auth endpoints
│   │   ├── ai.js             # AI features
│   │   ├── user.js           # User profile
│   │   ├── linkedin.js       # LinkedIn AI
│   │   └── github.js         # GitHub AI
│   └── package.json
│
└── README.md
```

---

## 🚀 Usage Guide

### **DeepSearch AI**
1. Select subject (DBMS, DSA, OS, etc.)
2. Choose mode (Mini Project / Assignment / Exam Prep)
3. Enter your topic
4. Get project ideas, tech stack, roadmap, and exam tips

### **Project Hub**
1. Enter project name and team size
2. Click "AI Generate Tasks"
3. Manage tasks in Kanban board
4. Assign team members and track progress

### **Assignment AI**
1. Paste assignment description
2. Get breakdown into subtasks
3. View study schedule and deadlines
4. Download as reference

### **Productivity Dashboard**
1. View productivity score (0-100)
2. Check focus, consistency, burnout risk
3. Get weekly study recommendations
4. Compare on leaderboard

### **LinkedIn AI**
1. Create your persona (tone, style, vocabulary)
2. Generate posts matching your voice
3. Get hashtags and posting times
4. Share on LinkedIn

### **GitHub AI**
1. Connect GitHub account
2. Upload your project (ZIP)
3. Get code analysis report
4. View refactoring suggestions
5. Push automatically to github

---

## 📡 API Endpoints

```
POST   /api/auth/signup             → Register
POST   /api/auth/login              → Login

POST   /api/ai/deepsearch           → Research
POST   /api/ai/assignment           → Assignment plan
POST   /api/ai/projecthub           → Kanban tasks

POST   /api/linkedin/profile        → Save persona
POST   /api/linkedin/generate       → Generate post

POST   /api/github/connect          → Connect account
POST   /api/github/upload-project   → Upload & analyze

GET    /api/user/profile            → Get profile
```

---

## 🤝 How to Contribute

### **1. Fork & Clone**
```bash
git clone https://github.com/yourusername/campusforge-ai.git
cd campusforge-ai
```

### **2. Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

### **3. Make Changes & Test**
```bash
# Make your changes
# Test locally
npm run dev  # Frontend
npm start    # Backend
```

### **4. Commit & Push**
```bash
git add .
git commit -m "✨ feat: add awesome feature"
git push origin feature/your-feature-name
```

### **5. Create Pull Request**
- Provide clear description of changes
- Include screenshots if UI changes
- Follow existing code style

## ⭐ If you find this helpful, please star this repo!

**Together, let's transform engineering education with AI! 🚀**
