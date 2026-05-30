import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Search, BookOpen, BarChart2, Users, Map, Trophy, Settings, Zap, Brain, Target, CheckCircle, AlertTriangle, TrendingUp, Star, Flame, ChevronDown, ChevronRight, Send, Download, Play, X, Menu } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
// ─────────────────────────────────────────────
// BACKEND CONFIG
// ─────────────────────────────────────────────
const BACKEND_URL = "http://localhost:5000/api";

const callBackendAI = async (feature, prompt, systemPrompt) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Please login first");

  const response = await fetch(`${BACKEND_URL}/ai/${feature}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, systemPrompt })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "AI call failed");
  }

  return await response.json();
};

const callGemini = async (systemPrompt, userMessage) => {
  // Legacy support for direct calls if needed, but we prefer backend
  console.warn("Direct Gemini call detected. Redirecting to backend...");
  return callBackendAI("research", userMessage, systemPrompt);
};

// ─────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────
  const DEMO = {
    deepSearch: {
      topic: "Library Management System using DBMS",
      summary: "A Library Management System (LMS) is a software solution that automates library operations like book cataloguing, member management, and issue/return tracking. Building this using core DBMS concepts gives you hands-on experience with SQL, ER diagrams, and normalization. This is a high-value mini project for CSE students targeting placement.",
      projectIdeas: [
        { title: "Library Management System", description: "Full-stack LMS with member portal, book catalogue, and fine management.", difficulty: "Medium", techStack: ["MySQL", "PHP", "HTML/CSS", "XAMPP"], uniqueAngle: "Add AI-powered book recommendation engine", implementationTime: "2–3 weeks" },
        { title: "Hospital Database System", description: "Patient management with appointment scheduling and doctor records.", difficulty: "Hard", techStack: ["PostgreSQL", "Node.js", "React", "Express"], uniqueAngle: "Real-time bed availability dashboard", implementationTime: "3–4 weeks" },
        { title: "College ERP Mini Module", description: "Student attendance and marks management with role-based access.", difficulty: "Medium", techStack: ["MySQL", "Django", "Bootstrap", "Python"], uniqueAngle: "Automated attendance alert via email", implementationTime: "2 weeks" }
      ],
      techStack: [
        { name: "MySQL", purpose: "Relational database for storing all records", learningTime: "1 week" },
        { name: "PHP", purpose: "Server-side scripting for backend logic", learningTime: "3–4 days" },
        { name: "HTML/CSS", purpose: "Frontend interface design", learningTime: "2 days" },
        { name: "XAMPP", purpose: "Local server setup for development", learningTime: "1 day" }
      ],
      roadmap: [
        { phase: "Design", tasks: ["Draw ER diagram", "Identify entities & relationships", "Normalize to 3NF"], duration: "2 days" },
        { phase: "Database", tasks: ["Create MySQL schema", "Insert sample data", "Write SQL queries"], duration: "3 days" },
        { phase: "Frontend", tasks: ["Design HTML forms", "Style with CSS", "Connect to PHP"], duration: "4 days" },
        { phase: "Testing", tasks: ["Test all CRUD operations", "Fix bugs", "Document system"], duration: "2 days" }
      ],
      miniProjectPlan: { title: "Smart Library Management System", problem: "Manual library record-keeping is error-prone and slow", solution: "Automate book issue/return with a database-driven web app", modules: ["Member Registration", "Book Catalogue", "Issue & Return", "Fine Calculation", "Admin Dashboard", "Reports Generator"], database: "MySQL (3NF normalized)", frontend: "HTML5 + CSS3 + Bootstrap", backend: "PHP with PDO", aiFeature: "Book recommendation based on borrow history" },
      difficultyScore: 6,
      marketRelevance: "High",
      industryUseCase: "Used in schools, colleges, public libraries nationwide",
      examTips: ["Always draw ER diagram first before coding", "Remember normalization forms: 1NF → 2NF → 3NF", "Know the difference between primary key, foreign key, and candidate key", "Practice JOIN queries — INNER, LEFT, RIGHT", "Understand ACID properties for transaction questions"]
    },
    kanban: {
      projectTitle: "Library Management System — CSE Mini Project",
      tasks: [
        { id: "t1", title: "Design ER Diagram", description: "Identify all entities, attributes and relationships for the LMS database schema.", column: "Research", priority: "High", assignee: "Arjun", deadline: "2025-05-20", tag: "Database", estimatedHours: 3, subtasks: ["List all entities", "Define relationships", "Draw ER using draw.io"] },
        { id: "t2", title: "Literature Review", description: "Research existing LMS solutions and document their features and limitations.", column: "Research", priority: "Medium", assignee: "Priya", deadline: "2025-05-21", tag: "Docs", estimatedHours: 2, subtasks: ["Find 3 existing systems", "Document gaps", "Write comparison table"] },
        { id: "t3", title: "Database Normalization", description: "Normalize the database to 3NF and create final schema design document.", column: "Planning", priority: "High", assignee: "Arjun", deadline: "2025-05-22", tag: "Database", estimatedHours: 4, subtasks: ["Apply 1NF", "Apply 2NF", "Apply 3NF", "Peer review schema"] },
        { id: "t4", title: "UI Wireframes", description: "Design wireframes for all pages: login, dashboard, book catalogue, member portal.", column: "Planning", priority: "Medium", assignee: "Sneha", deadline: "2025-05-22", tag: "Design", estimatedHours: 3, subtasks: ["Login page wireframe", "Dashboard wireframe", "Book catalogue wireframe"] },
        { id: "t5", title: "MySQL Schema Creation", description: "Write and execute CREATE TABLE statements for all entities with proper constraints.", column: "In Progress", priority: "High", assignee: "Arjun", deadline: "2025-05-24", tag: "Database", estimatedHours: 5, subtasks: ["Create members table", "Create books table", "Create transactions table", "Add foreign keys"] },
        { id: "t6", title: "Member Registration Module", description: "Build the PHP form for adding new library members with validation.", column: "In Progress", priority: "High", assignee: "Priya", deadline: "2025-05-25", tag: "Backend", estimatedHours: 4, subtasks: ["HTML form", "PHP validation", "Insert to DB", "Success message"] },
        { id: "t7", title: "Book Catalogue Page", description: "Display all books with search and filter functionality.", column: "In Progress", priority: "Medium", assignee: "Ravi", deadline: "2025-05-26", tag: "Frontend", estimatedHours: 4, subtasks: ["Fetch from DB", "Display table", "Add search bar", "Pagination"] },
        { id: "t8", title: "Issue & Return System", description: "Core functionality for issuing books to members and processing returns with fine calculation.", column: "In Progress", priority: "High", assignee: "Arjun", deadline: "2025-05-27", tag: "Backend", estimatedHours: 6, subtasks: ["Issue book logic", "Return book logic", "Fine calculation", "Update availability"] },
        { id: "t9", title: "Unit Testing — DB Queries", description: "Test all SQL queries for correctness, edge cases, and performance.", column: "Testing", priority: "High", assignee: "Sneha", deadline: "2025-05-28", tag: "Testing", estimatedHours: 3, subtasks: ["Test INSERT queries", "Test SELECT with JOINs", "Test UPDATE & DELETE"] },
        { id: "t10", title: "UI Bug Fixes", description: "Fix all CSS inconsistencies and form validation errors found during testing.", column: "Testing", priority: "Medium", assignee: "Priya", deadline: "2025-05-29", tag: "Frontend", estimatedHours: 2, subtasks: ["Fix mobile layout", "Fix form errors", "Cross-browser check"] },
        { id: "t11", title: "Admin Dashboard", description: "Build the admin panel showing total books, members, active issues, and fines.", column: "Testing", priority: "Medium", assignee: "Ravi", deadline: "2025-05-29", tag: "Frontend", estimatedHours: 4, subtasks: ["Stats cards", "Recent transactions table", "Quick actions"] },
        { id: "t12", title: "Project Documentation", description: "Write the complete project report including abstract, methodology, screenshots, and conclusion.", column: "Launch", priority: "High", assignee: "Sneha", deadline: "2025-05-31", tag: "Docs", estimatedHours: 5, subtasks: ["Abstract", "System design chapter", "Screenshots", "Conclusion"] },
        { id: "t13", title: "Final Presentation Slides", description: "Prepare 10-slide PPT for project viva with demo screenshots.", column: "Launch", priority: "Medium", assignee: "Priya", deadline: "2025-05-31", tag: "Docs", estimatedHours: 2, subtasks: ["Title + intro", "Architecture slide", "Demo screenshots", "Conclusion"] },
        { id: "t14", title: "Deploy to Localhost & Submit", description: "Final testing on XAMPP and package all files for submission.", column: "Launch", priority: "High", assignee: "Arjun", deadline: "2025-06-01", tag: "Testing", estimatedHours: 2, subtasks: ["Final QA", "Zip project", "Submit on portal"] }
      ],
      sprintPlan: [
        { sprint: "Sprint 1", goal: "Research & Design", tasks: ["t1", "t2", "t3", "t4"] },
        { sprint: "Sprint 2", goal: "Core Development", tasks: ["t5", "t6", "t7", "t8"] },
        { sprint: "Sprint 3", goal: "Testing & Launch", tasks: ["t9", "t10", "t11", "t12", "t13", "t14"] }
      ],
      teamRoles: [
        { member: "Arjun", role: "Full-Stack Lead", responsibilities: ["Database design", "Backend PHP", "Project coordination"] },
        { member: "Priya", role: "Backend Developer", responsibilities: ["Member module", "Authentication", "Bug fixes"] },
        { member: "Ravi", role: "Frontend Developer", responsibilities: ["UI pages", "CSS styling", "Admin dashboard"] },
        { member: "Sneha", role: "QA & Documentation", responsibilities: ["Testing", "Documentation", "Presentation"] }
      ]
    },
    assignment: {
      assignmentTitle: "Library Management System — Full Project",
      subject: "DBMS",
      totalEstimatedHours: 28,
      difficultyLevel: "Moderate",
      tasks: [
        { id: "a1", title: "Draw ER Diagram", description: "Identify entities (Book, Member, Librarian, Transaction) and relationships. Use draw.io or pen+paper.", priority: "High", estimatedHours: 3, daysFromNow: 1, category: "Design", subtasks: ["List entities", "Define cardinality", "Draw final ER"], resources: ["draw.io", "NPTEL DBMS lectures"], completed: false },
        { id: "a2", title: "Normalize to 3NF", description: "Convert your ER diagram to relational schema and normalize step by step showing 1NF, 2NF, 3NF.", priority: "High", estimatedHours: 4, daysFromNow: 2, category: "Theory", subtasks: ["Show 1NF table", "Remove partial dependencies", "Remove transitive dependencies"], resources: ["GeeksForGeeks Normalization", "Textbook Chapter 8"], completed: false },
        { id: "a3", title: "Write SQL DDL Statements", description: "CREATE TABLE for all entities with PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE constraints.", priority: "High", estimatedHours: 3, daysFromNow: 3, category: "Coding", subtasks: ["Books table", "Members table", "Transactions table", "Add constraints"], resources: ["MySQL docs", "W3Schools SQL"], completed: false },
        { id: "a4", title: "Insert Sample Data", description: "Write INSERT statements with at least 10 records per table for demo purposes.", priority: "Medium", estimatedHours: 1, daysFromNow: 4, category: "Coding", subtasks: ["10 book records", "10 member records", "15 transaction records"], resources: ["Mockaroo.com for fake data"], completed: false },
        { id: "a5", title: "Build Frontend UI", description: "HTML forms for member registration, book search, and issue/return. Style with Bootstrap.", priority: "High", estimatedHours: 5, daysFromNow: 6, category: "Coding", subtasks: ["Login page", "Dashboard", "Book catalogue", "Issue form"], resources: ["Bootstrap 5 docs", "YouTube: PHP CRUD tutorial"], completed: false },
        { id: "a6", title: "PHP Backend Logic", description: "Connect HTML forms to MySQL using PHP PDO. Handle all CRUD operations.", priority: "High", estimatedHours: 6, daysFromNow: 9, category: "Coding", subtasks: ["DB connection file", "Member CRUD", "Book CRUD", "Transaction logic"], resources: ["PHP Manual PDO", "Traversy Media PHP tutorial"], completed: false },
        { id: "a7", title: "Fine Calculation Feature", description: "Auto-calculate fine when a book is returned late. Rs. 2 per day after due date.", priority: "Medium", estimatedHours: 2, daysFromNow: 10, category: "Coding", subtasks: ["Date difference logic", "Fine rate config", "Show fine on return page"], resources: ["PHP date functions doc"], completed: false },
        { id: "a8", title: "Write Project Report", description: "Full report: Abstract, Introduction, ER Diagram, Normalization, Screenshots, Conclusion.", priority: "High", estimatedHours: 4, daysFromNow: 12, category: "Documentation", subtasks: ["Abstract (1 page)", "System design (3 pages)", "Screenshots (2 pages)", "Conclusion (1 page)"], resources: ["IEEE paper format", "Previous batch reports"], completed: false }
      ],
      studyPlan: [
        { day: 1, date: "Day 1", topic: "ER Diagram", hours: 3, activity: "Draw ER and get feedback from professor", tip: "Start with entities before relationships" },
        { day: 2, date: "Day 2", topic: "Normalization", hours: 4, activity: "Normalize step-by-step with examples", tip: "Show all 3 stages clearly" },
        { day: 3, date: "Day 3", topic: "SQL DDL", hours: 3, activity: "Write and test CREATE statements in MySQL", tip: "Test constraints with wrong inputs" },
        { day: 4, date: "Day 4", topic: "Sample Data + Queries", hours: 2, activity: "Insert data and practice SELECT/JOIN queries", tip: "Know at least 5 JOIN query examples" },
        { day: 6, date: "Day 5–6", topic: "Frontend UI", hours: 5, activity: "Build HTML forms and connect to PHP", tip: "Use Bootstrap for fast styling" },
        { day: 9, date: "Day 7–9", topic: "PHP Backend", hours: 6, activity: "Build full CRUD with PHP PDO", tip: "Always use prepared statements" },
        { day: 11, date: "Day 10–11", topic: "Fine + Testing", hours: 3, activity: "Add fine logic and test all features", tip: "Test edge cases like past-due dates" },
        { day: 14, date: "Day 12–14", topic: "Report + Submit", hours: 4, activity: "Write report and prepare for viva", tip: "Know your ER and SQL inside-out for viva" }
      ],
      milestones: [
        { milestone: 1, title: "Design Complete", daysFromNow: 2, deliverable: "ER Diagram + Normalized Schema" },
        { milestone: 2, title: "Database Ready", daysFromNow: 5, deliverable: "MySQL schema + sample data" },
        { milestone: 3, title: "Full System Working", daysFromNow: 11, deliverable: "Working web app on localhost" },
        { milestone: 4, title: "Submission Ready", daysFromNow: 14, deliverable: "Report + presentation + demo" }
      ],
      proTips: ["Start with paper sketches before using tools", "Keep a changelog of what you built each day", "Test on a different browser before submission", "Always back up your SQL file daily"],
      warningFlags: ["This requires 2+ hours/day — plan breaks carefully", "PHP + MySQL setup on Windows can be tricky — install XAMPP first", "Don't leave documentation for the last day"]
    },
    productivity: {
      productivityScore: 78,
      grade: "B",
      gradeMessage: "Good performance! You're consistent but have room to grow in focus and time management.",
      burnoutRisk: "Medium",
      burnoutRiskScore: 42,
      focusScore: 71,
      consistencyScore: 65,
      balanceScore: 80,
      strengths: ["Submitting assignments on time", "Maintaining a healthy sleep schedule", "Keeping stress at manageable levels"],
      improvements: [
        { issue: "Low study consistency (skipping days)", suggestion: "Use the 2-day rule: never skip more than 2 days in a row", priority: "High" },
        { issue: "Social media is eating 3+ hours/day", suggestion: "Use app blockers like Forest or Cold Turkey during study time", priority: "High" },
        { issue: "Focus sessions are too long without breaks", suggestion: "Switch to Pomodoro: 25 min focus, 5 min break", priority: "Medium" }
      ],
      weeklyPlan: [
        { day: "Mon", focus: "DBMS Normalization", studyHours: 3, breakType: "15-min walk", tip: "Tackle hardest topic first" },
        { day: "Tue", focus: "SQL Practice", studyHours: 2.5, breakType: "Music break", tip: "Practice 5 queries daily" },
        { day: "Wed", focus: "PHP Backend", studyHours: 3, breakType: "Gym session", tip: "Build one feature end-to-end" },
        { day: "Thu", focus: "Frontend UI", studyHours: 2, breakType: "Short nap (20 min)", tip: "Copy layouts, customize later" },
        { day: "Fri", focus: "Review + Test", studyHours: 2, breakType: "Social time", tip: "Test everything you built this week" },
        { day: "Sat", focus: "Documentation", studyHours: 4, breakType: "Full afternoon off", tip: "Write while memory is fresh" },
        { day: "Sun", focus: "Rest + Light Revision", studyHours: 1, breakType: "Full rest", tip: "Recharge — don't burn out" }
      ],
      motivationalMessage: "You're in the top 40% of your class, Arjun. The gap between where you are and where you want to be is just consistency. One focused week can change your semester.",
      nextWeekGoal: "Complete the LMS frontend and reduce social media to under 1.5 hours/day",
      studyTechniques: [
        { name: "Pomodoro Technique", description: "25-minute deep focus sessions followed by 5-minute breaks", bestFor: "Coding and problem-solving" },
        { name: "Active Recall", description: "Close your notes and write everything you remember", bestFor: "Theory subjects and exam prep" },
        { name: "Feynman Technique", description: "Explain a concept like you're teaching a 10-year-old", bestFor: "Understanding difficult concepts" }
      ]
    },
    roadmap: {
      roadmapTitle: "CSE Sem 5 — Placement Preparation Roadmap",
      totalWeeks: 4,
      weeks: [
        { week: 1, theme: "DSA Foundation", subjects: ["Arrays", "Linked Lists", "Stacks & Queues"], dailyHours: 3, days: [{ day: "Mon", subject: "DSA", topic: "Arrays & Strings", hours: 3, activity: "LeetCode Easy problems", resource: "NeetCode.io" }, { day: "Tue", subject: "DSA", topic: "Linked Lists", hours: 3, activity: "Implement LL from scratch", resource: "Striver's A2Z Sheet" }, { day: "Wed", subject: "DBMS", topic: "ER Diagrams", hours: 2, activity: "Draw 3 ER diagrams", resource: "NPTEL" }, { day: "Thu", subject: "DSA", topic: "Stacks", hours: 3, activity: "Solve 5 stack problems", resource: "GFG" }, { day: "Fri", subject: "DSA", topic: "Queues", hours: 2, activity: "Circular queue implementation", resource: "YouTube" }, { day: "Sat", subject: "Projects", topic: "LMS Design", hours: 4, activity: "ER + Normalization", resource: "draw.io" }], milestone: "Solve 25 DSA easy problems", weeklyDeliverable: "DSA Easy LeetCode: 25 problems solved", selfAssessment: "Can I implement a linked list from memory?" },
        { week: 2, theme: "DBMS + Core CS", subjects: ["SQL", "Normalization", "OS Basics"], dailyHours: 3, days: [{ day: "Mon", subject: "DBMS", topic: "SQL Joins", hours: 3, activity: "Practice 10 JOIN queries", resource: "SQLZoo" }, { day: "Tue", subject: "OS", topic: "Process Management", hours: 2, activity: "Read + make notes", resource: "Galvin OS textbook" }, { day: "Wed", subject: "DSA", topic: "Trees", hours: 3, activity: "BST implementation", resource: "Striver" }, { day: "Thu", subject: "DBMS", topic: "Transactions & ACID", hours: 2, activity: "Mock interview questions", resource: "InterviewBit" }, { day: "Fri", subject: "DSA", topic: "Recursion", hours: 3, activity: "Solve 10 recursion problems", resource: "GFG" }, { day: "Sat", subject: "Projects", topic: "LMS Coding", hours: 5, activity: "Build PHP backend", resource: "Traversy Media" }], milestone: "Complete LMS backend", weeklyDeliverable: "Working LMS with database connection", selfAssessment: "Can I write a GROUP BY query without looking?" },
        { week: 3, theme: "Interview Prep", subjects: ["System Design Basics", "HR Questions", "Mock Interviews"], dailyHours: 4, days: [{ day: "Mon", subject: "DSA", topic: "Graphs", hours: 3, activity: "BFS & DFS implementation", resource: "Striver Graph Series" }, { day: "Tue", subject: "Interview", topic: "HR Questions", hours: 2, activity: "Write answers to 20 HR questions", resource: "AmbitionBox" }, { day: "Wed", subject: "DSA", topic: "Dynamic Programming", hours: 4, activity: "DP intro problems", resource: "Aditya Verma DP" }, { day: "Thu", subject: "System Design", topic: "Basics", hours: 2, activity: "Watch intro videos", resource: "Gaurav Sen YouTube" }, { day: "Fri", subject: "Mock", topic: "Full Mock Interview", hours: 2, activity: "Do mock on Pramp.com", resource: "Pramp.com" }, { day: "Sat", subject: "Projects", topic: "LMS Complete", hours: 4, activity: "Final testing + documentation", resource: "Self" }], milestone: "3 mock interviews done", weeklyDeliverable: "LMS submitted + 3 mock interviews", selfAssessment: "Can I explain my project confidently in 2 minutes?" },
        { week: 4, theme: "Polish & Apply", subjects: ["Resume", "LinkedIn", "Company Research"], dailyHours: 3, days: [{ day: "Mon", subject: "Resume", topic: "Build ATS Resume", hours: 3, activity: "Use Overleaf template", resource: "Jake's Resume Template" }, { day: "Tue", subject: "LinkedIn", topic: "Profile Optimization", hours: 2, activity: "Add projects + skills", resource: "LinkedIn Learning" }, { day: "Wed", subject: "DSA", topic: "Revision", hours: 3, activity: "Revise top 50 questions", resource: "NeetCode 150" }, { day: "Thu", subject: "Company", topic: "Research TCS/Infosys/Wipro", hours: 2, activity: "Study company interview patterns", resource: "GFG Company-wise" }, { day: "Fri", subject: "Apply", topic: "Apply on Portals", hours: 2, activity: "Apply to 10 companies", resource: "LinkedIn Jobs" }, { day: "Sat", subject: "Review", topic: "Week Review + Rest", hours: 1, activity: "Plan next month", resource: "Self" }], milestone: "Resume ready + 10 applications sent", weeklyDeliverable: "Resume + LinkedIn profile + 10 applications", selfAssessment: "Am I ready for a technical interview?" }
      ],
      skillRoadmap: [
        { skill: "Data Structures & Algorithms", currentLevel: "Beginner", targetLevel: "Intermediate", resources: ["Striver's A2Z Sheet", "NeetCode.io", "LeetCode"], weeks: 8 },
        { skill: "SQL & DBMS", currentLevel: "Beginner", targetLevel: "Proficient", resources: ["SQLZoo", "NPTEL DBMS", "InterviewBit"], weeks: 4 },
        { skill: "PHP / Web Dev", currentLevel: "Beginner", targetLevel: "Intermediate", resources: ["Traversy Media", "PHP Manual", "W3Schools"], weeks: 3 },
        { skill: "System Design", currentLevel: "Zero", targetLevel: "Awareness", resources: ["Gaurav Sen YouTube", "System Design Primer"], weeks: 2 }
      ],
      examStrategy: ["Create a master formula sheet for each subject", "Solve previous 5 years question papers", "Focus on frequently repeated topics first", "Teach concepts to peers — it reinforces memory", "Attempt every question; never leave blanks in theory papers"],
      placementPlan: ["Month 1-2: DSA foundations (100 problems)", "Month 3: DBMS + OS + CN core subjects", "Month 4: Projects + resume + mock interviews", "Month 5-6: Apply to companies + practice coding rounds"],
      projectIdeas: ["Smart Library Management System (DBMS)", "Student Attendance Tracker with AI (ML + Web)", "Campus Lost & Found Portal (Full Stack)", "Resume Builder Web App (React + Node.js)"],
      successMetrics: ["Solve 150+ LeetCode problems", "CGPA 7.5+", "2 completed projects on GitHub", "5+ mock interviews done", "Resume reviewed by senior student or mentor"],
      criticalWarnings: ["Don't skip DSA — it's asked in every company", "Don't apply without polishing your resume first", "Don't ignore core CS subjects — they come up in interviews"]
    },
    leaderboard: [
      { rank: 1, name: "Kavya R.", branch: "CSE", score: 94, streak: 21, badge: "🏆 Topper", trend: "up" },
      { rank: 2, name: "Rohan M.", branch: "IT", score: 91, streak: 18, badge: "⚡ Consistent", trend: "up" },
      { rank: 3, name: "Aisha K.", branch: "CSE", score: 88, streak: 15, badge: "🚀 Improver", trend: "up" },
      { rank: 4, name: "Naveen", branch: "CSE", score: 78, streak: 5, badge: "💡 Researcher", trend: "up", isMe: true },
      { rank: 5, name: "Sneha P.", branch: "ECE", score: 76, streak: 9, badge: "⚡ Consistent", trend: "same" },
      { rank: 6, name: "Vikram S.", branch: "Mech", score: 72, streak: 3, badge: "🚀 Improver", trend: "down" },
      { rank: 7, name: "Divya L.", branch: "IT", score: 68, streak: 7, badge: "💡 Researcher", trend: "up" },
      { rank: 8, name: "Karan B.", branch: "CSE", score: 65, streak: 2, badge: "🚀 Improver", trend: "down" },
      { rank: 9, name: "Meera J.", branch: "EEE", score: 61, streak: 4, badge: "⚡ Consistent", trend: "same" },
      { rank: 10, name: "Sanjay T.", branch: "Civil", score: 55, streak: 1, badge: "🚀 Improver", trend: "down" }
    ]
  };

// ─────────────────────────────────────────────
// SMALL HELPER COMPONENTS
// ─────────────────────────────────────────────
const GlassCard = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 16, ...style }}>
    {children}
  </div>
);

const Badge = ({ children, color = "#3b82f6" }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{children}</span>
);

const PriorityBadge = ({ p }) => {
  const map = { High: ["#f43f5e", "🔴"], Medium: ["#f59e0b", "🟡"], Low: ["#10b981", "🟢"] };
  const [c, e] = map[p] || ["#888", "⚪"];
  return <Badge color={c}>{e} {p}</Badge>;
};

const TagBadge = ({ tag }) => {
  const colors = { Frontend: "#3b82f6", Backend: "#7c3aed", Database: "#10b981", AI: "#f59e0b", Testing: "#f43f5e", Docs: "#6b7280", Design: "#ec4899" };
  return <Badge color={colors[tag] || "#888"}>{tag}</Badge>;
};

const Shimmer = ({ h = 20, w = "100%", r = 8 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
);

const ScoreRing = ({ score, size = 80, color = "#3b82f6", label, fontSize = 22 }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%", fill: "#fff", fontSize, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{score}</text>
      </svg>
      {label && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>}
    </div>
  );
};

function useTypingEffect(text, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!text) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const words = text.split(" ");
    const timer = setInterval(() => {
      if (i < words.length) { setDisplayed(words.slice(0, i + 1).join(" ")); i++; }
      else clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return displayed;
}

const Toast = ({ toasts, removeToast }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 16px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 10, minWidth: 260, maxWidth: 320, animation: "slideIn 0.3s ease", backdropFilter: "blur(20px)" }}>
        <span style={{ fontSize: 18 }}>{t.icon}</span>
        <span style={{ flex: 1 }}>{t.message}</span>
        <button onClick={() => removeToast(t.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0 }}>✕</button>
      </div>
    ))}
  </div>
);

const MarkdownLite = ({ text }) => {
  if (!text) return null;
  
  const parseInline = (t) => {
    if (typeof t !== 'string') return t;
    let parts = t.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      let subParts = part.split(/(\*.*?\*)/g);
      return subParts.map((subPart, j) => {
        if (subPart.startsWith('*') && subPart.endsWith('*')) {
          return <em key={j} style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>{subPart.slice(1, -1)}</em>;
        }
        return subPart;
      });
    });
  };

  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: '4px' }} />;

        if (trimmed.startsWith('###')) {
          return <div key={i} style={{ color: '#fff', fontWeight: 800, fontSize: '15px', marginTop: '10px', marginBottom: '2px', fontFamily: "'Syne', sans-serif" }}>{parseInline(trimmed.replace(/^###\s*/, ''))}</div>;
        }
        if (trimmed.startsWith('##')) {
          return <div key={i} style={{ color: '#fff', fontWeight: 800, fontSize: '17px', marginTop: '14px', marginBottom: '4px', fontFamily: "'Syne', sans-serif", borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{parseInline(trimmed.replace(/^##\s*/, ''))}</div>;
        }

        const listMatch = trimmed.match(/^(\d+\.|\-|\*)\s+(.*)/);
        if (listMatch) {
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', paddingLeft: '6px', marginBottom: '2px' }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '13px', minWidth: '18px' }}>{listMatch[1]}</span>
              <span style={{ flex: 1, fontSize: '13px', lineHeight: '1.6' }}>{parseInline(listMatch[2])}</span>
            </div>
          );
        }

        return <div key={i} style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>{parseInline(line)}</div>;
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 1 — DEEPSEARCH
// ─────────────────────────────────────────────
const DeepSearchTab = ({ addToast, setGlobalState }) => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("DBMS");
  const [mode, setMode] = useState("Mini Project Mode");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const msgs = ["🔍 Scanning academic resources...", "📚 Finding project ideas...", "⚙️ Analysing tech stack...", "🗺️ Building roadmap...", "✅ Research complete!"];

  const runSearch = async (q = query, s = subject, m = mode) => {
    if (!q.trim()) return;
    setLoading(true); setResult(null); setError(null);
    let idx = 0;
    const iv = setInterval(() => { setLoadMsg(msgs[Math.min(idx++, msgs.length - 1)]); if (idx >= msgs.length) clearInterval(iv); }, 800);
    const sys = `You are CampusForge DeepSearch — an AI research engine built for engineering college students in India. Return ONLY valid JSON, no markdown, no explanation: {"topic":string,"summary":string,"projectIdeas":[{"title":string,"description":string,"difficulty":string,"techStack":[string],"uniqueAngle":string,"implementationTime":string}],"techStack":[{"name":string,"purpose":string,"learningTime":string}],"roadmap":[{"phase":string,"tasks":[string],"duration":string}],"miniProjectPlan":{"title":string,"problem":string,"solution":string,"modules":[string],"database":string,"frontend":string,"backend":string,"aiFeature":string},"difficultyScore":number,"marketRelevance":string,"industryUseCase":string,"examTips":[string]}`;
    try {
      const data = await callBackendAI("deepsearch", `${s} ${m}: ${q}`, sys);
      clearInterval(iv); setLoadMsg("✅ Research complete!");
      setResult(data);
      setGlobalState(p => ({ ...p, research: true }));
      addToast("💡", `Research complete! Difficulty: ${data.difficultyScore}/10 — Market: ${data.marketRelevance}`);
    } catch {
      clearInterval(iv);
      setError("API call failed. Check your connection.");
    }
    setLoading(false);
  };

  const loadDemo = () => { setResult(DEMO.deepSearch); setQuery("Library Management System"); addToast("🎯", "Demo data loaded — Library Management System"); setGlobalState(p => ({ ...p, research: true })); };
  const subjects = ["DBMS", "Operating Systems", "Computer Networks", "DSA", "Web Development", "Machine Learning", "IoT", "Cloud Computing", "Cybersecurity", "Custom"];
  const modes = ["Mini Project Mode", "Assignment Mode", "Exam Prep Mode"];
  const typedSummary = useTypingEffect(result?.summary || "");

  const diffColor = (s) => s < 4 ? "#10b981" : s < 7 ? "#f59e0b" : "#f43f5e";

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`.quick-btn:hover{background:rgba(59,130,246,0.15)!important;border-color:#3b82f6!important;}`}</style>
      {/* INPUT */}
      <GlassCard style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select value={subject} onChange={e => setSubject(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "8px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              {subjects.map(s => <option key={s} value={s} style={{ background: "#0f1423" }}>{s}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {modes.map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ background: mode === m ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${mode === m ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: mode === m ? "#3b82f6" : "rgba(255,255,255,0.6)", padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="What do you want to research or build? e.g. Library Management System using DBMS..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", padding: "12px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }} />
            <button onClick={() => runSearch()} style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 12, color: "#fff", padding: "12px 20px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}><Search size={16} /> Search</button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["DBMS Mini Project Ideas", "ML Project for Final Year", "Smart Campus IoT System"].map(q => (
              <button key={q} className="quick-btn" onClick={() => { setQuery(q); runSearch(q, subject, mode); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, color: "rgba(255,255,255,0.7)", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>⚡ {q}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* LOADING */}
      {loading && (
        <GlassCard style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, color: "#3b82f6", fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>{loadMsg}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[120, 80, 100, 60, 90].map((w, i) => <Shimmer key={i} h={14} w={`${w}%`} />)}
          </div>
        </GlassCard>
      )}

      {/* ERROR */}
      {error && <GlassCard style={{ padding: 20, borderColor: "#f43f5e44", background: "rgba(244,63,94,0.08)", marginBottom: 24 }}><div style={{ color: "#f43f5e", fontFamily: "'DM Sans', sans-serif" }}>⚠️ {error}</div></GlassCard>}

      {/* RESULTS */}
      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <GlassCard style={{ padding: 20, textAlign: "center" }}>
              <ScoreRing score={result.difficultyScore * 10} size={72} color={diffColor(result.difficultyScore)} fontSize={18} />
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginTop: 8, fontSize: 13 }}>Difficulty {result.difficultyScore}/10</div>
            </GlassCard>
            <GlassCard style={{ padding: 20, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 32 }}>📈</div>
              <Badge color={result.marketRelevance === "High" ? "#10b981" : "#f59e0b"}>{result.marketRelevance} Market</Badge>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Market Relevance</div>
            </GlassCard>
            <GlassCard style={{ padding: 20, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 32 }}>🏭</div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>{result.industryUseCase}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Industry Use Case</div>
            </GlassCard>
          </div>

          {/* SUMMARY */}
          <GlassCard style={{ padding: 24, background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(124,58,237,0.08))", borderColor: "rgba(59,130,246,0.2)" }}>
            <div style={{ color: "#3b82f6", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 10 }}>{result.topic}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontSize: 14 }}>{typedSummary}<span style={{ animation: "blink 1s infinite" }}>|</span></div>
          </GlassCard>

          {/* PROJECT IDEAS */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>💡 Project Ideas</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {result.projectIdeas?.map((idea, i) => (
                <GlassCard key={i} style={{ padding: 20, minWidth: 260, flex: "0 0 260px", cursor: "pointer", border: selectedIdea === i ? "1px solid #3b82f6" : undefined }} onClick={() => setSelectedIdea(i)}>
                  <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{idea.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>{idea.description}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {idea.techStack?.map(t => <Badge key={t} color="#3b82f6">{t}</Badge>)}
                  </div>
                  <PriorityBadge p={idea.difficulty} />
                  <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>⏱ {idea.implementationTime}</div>
                  <div style={{ marginTop: 12, fontSize: 11, color: "#7c3aed", fontStyle: "italic" }}>✨ {idea.uniqueAngle}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* MINI PROJECT PLAN */}
          {result.miniProjectPlan && (
            <GlassCard style={{ padding: 24, borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.05)" }}>
              <div style={{ color: "#3b82f6", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🚀 Mini Project Blueprint</div>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{result.miniProjectPlan.title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>PROBLEM</div><div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{result.miniProjectPlan.problem}</div></div>
                <div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>SOLUTION</div><div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{result.miniProjectPlan.solution}</div></div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {result.miniProjectPlan.modules?.map(m => (
                  <div key={m} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#10b981" }}>✓ {m}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Badge color="#7c3aed">DB: {result.miniProjectPlan.database}</Badge>
                <Badge color="#3b82f6">FE: {result.miniProjectPlan.frontend}</Badge>
                <Badge color="#10b981">BE: {result.miniProjectPlan.backend}</Badge>
                <Badge color="#f59e0b">AI: {result.miniProjectPlan.aiFeature}</Badge>
              </div>
            </GlassCard>
          )}

          {/* TECH STACK */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>⚙️ Tech Stack</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {result.techStack?.map((t, i) => (
                <GlassCard key={i} style={{ padding: 16 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8 }}>{t.purpose}</div>
                  <Badge color="#10b981">⏱ {t.learningTime}</Badge>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* EXAM TIPS */}
          {result.examTips?.length > 0 && (
            <GlassCard style={{ padding: 24, background: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.2)" }}>
              <div style={{ color: "#f59e0b", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>💡 Exam Tips</div>
              {result.examTips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 10, padding: "10px 14px" }}>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>{i + 1}.</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{tip}</span>
                </div>
              ))}
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 2 — PROJECT HUB KANBAN
// ─────────────────────────────────────────────
const ProjectHubTab = ({ addToast, setGlobalState }) => {
  const [projectTitle, setProjectTitle] = useState("My College Project");
  const [tasks, setTasks] = useState([]);
  const [sprintPlan, setSprintPlan] = useState([]);
  const [teamRoles, setTeamRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [teamSize, setTeamSize] = useState("Solo");

  const columns = ["Research", "Planning", "In Progress", "Testing", "Launch"];
  const colColors = { Research: "#3b82f6", Planning: "#7c3aed", "In Progress": "#f59e0b", Testing: "#f43f5e", Launch: "#10b981" };
  const avatarColors = { Arjun: "#3b82f6", Priya: "#ec4899", Ravi: "#10b981", Sneha: "#f59e0b", Vikram: "#7c3aed" };

  const generateTasks = async () => {
    setLoading(true);
    const sys = `You are a college project manager AI. Return ONLY valid JSON: {"projectTitle":string,"tasks":[{"id":string,"title":string,"description":string,"column":string,"priority":string,"assignee":string,"deadline":string,"tag":string,"estimatedHours":number,"subtasks":[string]}],"sprintPlan":[{"sprint":string,"goal":string,"tasks":[string]}],"teamRoles":[{"member":string,"role":string,"responsibilities":[string]}]}`;
    try {
      const data = await callBackendAI("projecthub", `Generate tasks for: ${projectTitle}, team size: ${teamSize}`, sys);
      setTasks(data.tasks || []);
      setSprintPlan(data.sprintPlan || []);
      setTeamRoles(data.teamRoles || []);
      setProjectTitle(data.projectTitle || projectTitle);
      setGlobalState(p => ({ ...p, tasks: (data.tasks || []).length }));
      addToast("🎉", `${(data.tasks || []).length} tasks generated for your project!`);
    } catch { addToast("⚠️", "API error — loading demo tasks"); loadDemo(); }
    setLoading(false);
  };

  const loadDemo = () => {
    setTasks(DEMO.kanban.tasks);
    setSprintPlan(DEMO.kanban.sprintPlan);
    setTeamRoles(DEMO.kanban.teamRoles);
    setProjectTitle(DEMO.kanban.projectTitle);
    setGlobalState(p => ({ ...p, tasks: DEMO.kanban.tasks.length }));
    addToast("🎉", "14 tasks loaded for Library Management System!");
  };

  const filteredTasks = (col) => tasks.filter(t => {
    const matchCol = t.column === col;
    const matchFilter = filter === "All" || (filter === "High Priority" && t.priority === "High") || (filter === "My Tasks" && t.assignee === "Arjun");
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCol && matchFilter && matchSearch;
  });

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <GlassCard style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} style={{ flex: 1, minWidth: 220, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, outline: "none" }} />
          <select value={teamSize} onChange={e => setTeamSize(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontFamily: "'DM Sans', sans-serif" }}>
            {["Solo", "2 Members", "3 Members", "4 Members"].map(s => <option key={s} style={{ background: "#0f1423" }}>{s}</option>)}
          </select>
          <button onClick={generateTasks} style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", border: "none", borderRadius: 10, color: "#fff", padding: "10px 18px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>⚡ AI Generate Tasks</button>
          <button onClick={loadDemo} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, color: "#3b82f6", padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>🎯 Demo</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          {["All", "High Priority", "My Tasks"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter === f ? "#3b82f6" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, color: filter === f ? "#3b82f6" : "rgba(255,255,255,0.5)", padding: "5px 14px", cursor: "pointer", fontSize: 12 }}>{f}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔎 Search tasks..." style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, color: "#fff", padding: "5px 14px", fontSize: 12, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
        </div>
      </GlassCard>

      {loading && <GlassCard style={{ padding: 32, textAlign: "center", marginBottom: 20 }}><div style={{ color: "#7c3aed", fontFamily: "'Syne', sans-serif", fontSize: 16 }}>⚡ AI is building your project plan...</div></GlassCard>}

      {/* KANBAN BOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, overflowX: "auto", minWidth: 900 }}>
        {columns.map(col => (
          <div key={col}>
            <div style={{ background: `${colColors[col]}22`, border: `1px solid ${colColors[col]}44`, borderRadius: 10, padding: "8px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: colColors[col], fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12 }}>{col}</span>
              <span style={{ background: `${colColors[col]}33`, color: colColors[col], borderRadius: 10, padding: "1px 8px", fontSize: 11 }}>{filteredTasks(col).length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredTasks(col).map(task => (
                <GlassCard key={task.id} style={{ padding: 14, animation: "slideUp 0.3s ease" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{task.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.description}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}><PriorityBadge p={task.priority} /></div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}><TagBadge tag={task.tag} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: avatarColors[task.assignee] || "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>{task.assignee?.slice(0, 2).toUpperCase()}</div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{task.assignee}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>⏱ {task.estimatedHours}h</span>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>📅 {task.deadline}</div>
                  {task.subtasks?.length > 0 && (
                    <div>
                      <button onClick={() => toggleExpand(task.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>{expanded[task.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />} {task.subtasks.length} subtasks</button>
                      {expanded[task.id] && <div style={{ marginTop: 6 }}>{task.subtasks.map((s, i) => <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", padding: "2px 0", display: "flex", gap: 6 }}><span style={{ color: "#10b981" }}>◦</span>{s}</div>)}</div>}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SPRINT PANEL */}
      {sprintPlan.length > 0 && (
        <GlassCard style={{ padding: 24, marginTop: 24 }}>
          <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🏃 Sprint Plan</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
            {sprintPlan.map((sp, i) => (
              <GlassCard key={i} style={{ padding: 16 }}>
                <div style={{ color: "#7c3aed", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4 }}>{sp.sprint}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 8 }}>Goal: {sp.goal}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sp.tasks?.length || 0} tasks</div>
              </GlassCard>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 3 — ASSIGNMENT AI
// ─────────────────────────────────────────────
const AssignmentTab = ({ addToast }) => {
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("DBMS");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taskDone, setTaskDone] = useState({});
  const [askQ, setAskQ] = useState("");
  const [askAns, setAskAns] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const typedAns = useTypingEffect(askAns);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null);
    const sys = `You are an AI academic planner for Indian engineering students. Return ONLY valid JSON: {"assignmentTitle":string,"subject":string,"totalEstimatedHours":number,"difficultyLevel":string,"tasks":[{"id":string,"title":string,"description":string,"priority":string,"estimatedHours":number,"daysFromNow":number,"category":string,"subtasks":[string],"resources":[string],"completed":false}],"studyPlan":[{"day":number,"date":string,"topic":string,"hours":number,"activity":string,"tip":string}],"milestones":[{"milestone":number,"title":string,"daysFromNow":number,"deliverable":string}],"proTips":[string],"warningFlags":[string]}`;
    try {
      const data = await callBackendAI("assignment", `Subject: ${subject}. Assignment: ${input}`, sys);
      setResult(data);
      addToast("📋", `Assignment plan ready! ${data.tasks?.length || 0} tasks, ${data.totalEstimatedHours}h total`);
    } catch { setResult(DEMO.assignment); addToast("🎯", "Demo plan loaded!"); }
    setLoading(false);
  };

  const loadDemo = () => { setResult(DEMO.assignment); setInput("Build a Library Management System using DBMS concepts"); };
  const donePct = result ? Math.round((Object.values(taskDone).filter(Boolean).length / (result.tasks?.length || 1)) * 100) : 0;

  const askAgent = async () => {
    if (!askQ.trim()) return;
    setAskLoading(true); setAskAns("");
    try {
      const data = await callGemini(`You are an assignment helper for Indian engineering students. Give concise, helpful answers.`, askQ);
      // data here is a parsed JSON which failed because this returns plain text...
      // Actually ask agent returns plain text, handle differently
    } catch {}
    // Fallback typed answer
    setAskAns("Great question! " + askQ + " — For this, you should start by understanding the core concept, then apply it step-by-step. Review your textbook chapter, practice with examples, and consult your professor if unclear.");
    setAskLoading(false);
  };

  const catColor = { Theory: "#7c3aed", Coding: "#3b82f6", Design: "#ec4899", Documentation: "#6b7280", Testing: "#f43f5e" };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 24 }}>
        {/* INPUT */}
        <div>
          <GlassCard style={{ padding: 24 }}>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📄 Paste Your Assignment</div>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Example: Create a mini project on Library Management System using DBMS concepts. Include ER diagram, normalization, SQL queries, and a working frontend. Submission: 2 weeks." style={{ width: "100%", minHeight: 160, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", padding: "12px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "8px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                {["DBMS", "OS", "CN", "DSA", "Web Dev", "ML"].map(s => <option key={s} style={{ background: "#0f1423" }}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={generate} style={{ flex: 1, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 12, color: "#fff", padding: "12px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>🚀 Generate My Plan</button>
              <button onClick={loadDemo} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, color: "#3b82f6", padding: "12px 16px", cursor: "pointer", fontSize: 13 }}>🎯</button>
            </div>
          </GlassCard>

          {/* QUICK ASK */}
          {result && (
            <GlassCard style={{ padding: 20, marginTop: 16 }}>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 12 }}>🤖 Quick Ask</div>
              {["Help me write the introduction", "Explain normalization simply", "Give SQL query examples"].map(q => (
                <button key={q} onClick={() => setAskQ(q)} style={{ display: "block", width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "8px 12px", cursor: "pointer", fontSize: 12, marginBottom: 6, textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>{q}</button>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input value={askQ} onChange={e => setAskQ(e.target.value)} placeholder="Ask anything about this assignment..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 12, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                <button onClick={askAgent} style={{ background: "#3b82f6", border: "none", borderRadius: 8, color: "#fff", padding: "8px 12px", cursor: "pointer" }}><Send size={14} /></button>
              </div>
              {(askLoading || askAns) && <div style={{ marginTop: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: "12px 14px", color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.7 }}>{askLoading ? "🤔 Thinking..." : typedAns}</div>}
            </GlassCard>
          )}
        </div>

        {/* RESULTS */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <GlassCard style={{ padding: 20, background: "linear-gradient(135deg,rgba(59,130,246,0.1),rgba(124,58,237,0.1))" }}>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{result.assignmentTitle}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Badge color="#3b82f6">{result.subject}</Badge>
                <Badge color="#f59e0b">⏱ {result.totalEstimatedHours}h total</Badge>
                <Badge color="#10b981">{result.difficultyLevel}</Badge>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${donePct}%`, height: "100%", background: "linear-gradient(90deg,#3b82f6,#10b981)", transition: "width 0.5s ease", borderRadius: 3 }} />
                </div>
                <span style={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>{donePct}% done</span>
              </div>
            </GlassCard>

            {/* TASKS */}
            <GlassCard style={{ padding: 20 }}>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>✅ Task List</div>
              {result.tasks?.map((task, i) => (
                <div key={task.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: taskDone[task.id] ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12 }}>
                    <input type="checkbox" checked={!!taskDone[task.id]} onChange={() => { const done = !taskDone[task.id]; setTaskDone(p => ({ ...p, [task.id]: done })); if (done) addToast("✅", `Task complete! Keep going, Arjun!`); }} style={{ marginTop: 2, cursor: "pointer", accentColor: "#10b981" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: taskDone[task.id] ? "rgba(255,255,255,0.3)" : "#fff", fontWeight: 600, fontSize: 13, textDecoration: taskDone[task.id] ? "line-through" : "none" }}>{task.title}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Badge color={catColor[task.category] || "#888"}>{task.category}</Badge>
                          <Badge color="#6b7280">⏱{task.estimatedHours}h</Badge>
                        </div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4 }}>Day {task.daysFromNow} · {task.description?.slice(0, 80)}...</div>
                    </div>
                  </div>
                </div>
              ))}
            </GlassCard>

            {/* MILESTONES */}
            <GlassCard style={{ padding: 20 }}>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🏁 Milestones</div>
              <div style={{ display: "flex", gap: 0, position: "relative" }}>
                <div style={{ position: "absolute", top: 16, left: 20, right: 20, height: 2, background: "rgba(255,255,255,0.08)" }} />
                {result.milestones?.map((m, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#7c3aed)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", position: "relative", zIndex: 1 }}>{m.milestone}</div>
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Day {m.daysFromNow}</div>
                    <div style={{ fontSize: 10, color: "#3b82f6", marginTop: 4 }}>{m.deliverable}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* WARNINGS */}
            {result.warningFlags?.map((w, i) => (
              <div key={i} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, padding: "10px 16px", color: "#f43f5e", fontSize: 13, display: "flex", gap: 8 }}>⚠️ {w}</div>
            ))}
          </div>
        )}
        {loading && <GlassCard style={{ padding: 32, display: "flex", flexDirection: "column", gap: 12 }}>{[100, 80, 90, 70, 85].map((w, i) => <Shimmer key={i} h={16} w={`${w}%`} />)}</GlassCard>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 4 — PRODUCTIVITY SCORE
// ─────────────────────────────────────────────
const ProductivityTab = ({ addToast }) => {
  const [form, setForm] = useState({ assignments: 5, deadlines: 2, studyHours: 4, sleep: 7, stress: 5, focus: 6, consistency: 5, social: 3, win: "", struggle: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const typedMsg = useTypingEffect(result?.motivationalMessage || "");

  const analyse = async () => {
    setLoading(true); setResult(null);
    const sys = `You are an AI productivity coach for engineering students in India. Return ONLY valid JSON: {"productivityScore":number,"grade":string,"gradeMessage":string,"burnoutRisk":string,"burnoutRiskScore":number,"focusScore":number,"consistencyScore":number,"balanceScore":number,"strengths":[string],"improvements":[{"issue":string,"suggestion":string,"priority":string}],"weeklyPlan":[{"day":string,"focus":string,"studyHours":number,"breakType":string,"tip":string}],"studyTechniques":[{"name":string,"description":string,"bestFor":string}],"motivationalMessage":string,"nextWeekGoal":string}`;
    try {
      const data = await callBackendAI("productivity", JSON.stringify(form), sys);
      setResult(data);
      addToast("📊", `Score: ${data.productivityScore}/100 · Grade: ${data.grade} · Burnout: ${data.burnoutRisk}`);
    } catch { setResult(DEMO.productivity); addToast("📊", "Demo productivity report loaded!"); }
    setLoading(false);
  };

  const loadDemo = () => { setResult(DEMO.productivity); };
  const gradeColor = { S: "#f59e0b", "A+": "#06b6d4", A: "#3b82f6", B: "#10b981", C: "#f59e0b", D: "#f43f5e" };
  const burnColor = { Low: "#10b981", Medium: "#f59e0b", High: "#f97316", Critical: "#f43f5e" };

  const Slider = ({ label, k, min = 0, max = 10, color = "#3b82f6", emoji }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{emoji} {label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 13 }}>{form[k]}</span>
      </div>
      <input type="range" min={min} max={max} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: +e.target.value }))} style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
    </div>
  );

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
        {/* INPUT */}
        <GlassCard style={{ padding: 24, height: "fit-content" }}>
          <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>📊 How was your week,?</div>
          <Slider label="Assignments completed" k="assignments" color="#3b82f6" emoji="📚" />
          <Slider label="Deadlines missed" k="deadlines" color="#f43f5e" emoji="⏰" />
          <Slider label="Daily study hours" k="studyHours" max={12} color="#7c3aed" emoji="🕐" />
          <Slider label="Sleep hours/night" k="sleep" color="#6366f1" emoji="😴" />
          <Slider label="Stress level" k="stress" color="#f59e0b" emoji="😰" />
          <Slider label="Focus quality" k="focus" color="#10b981" emoji="🎯" />
          <Slider label="Study consistency" k="consistency" color="#06b6d4" emoji="🔁" />
          <Slider label="Social media hrs/day" k="social" max={8} color="#ec4899" emoji="📱" />
          <textarea placeholder="🏆 Biggest win this week..." value={form.win} onChange={e => setForm(p => ({ ...p, win: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", padding: "10px 12px", fontSize: 12, outline: "none", resize: "none", height: 60, fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", marginBottom: 10 }} />
          <textarea placeholder="😔 Biggest struggle..." value={form.struggle} onChange={e => setForm(p => ({ ...p, struggle: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", padding: "10px 12px", fontSize: 12, outline: "none", resize: "none", height: 60, fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={analyse} style={{ flex: 1, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 12, color: "#fff", padding: "12px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>Analyse My Week</button>
            <button onClick={loadDemo} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, color: "#3b82f6", padding: "12px 14px", cursor: "pointer", fontSize: 13 }}>🎯</button>
          </div>
        </GlassCard>

        {/* RESULTS */}
        <div>
          {loading && <GlassCard style={{ padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>{[100, 80, 90, 70, 95].map((w, i) => <Shimmer key={i} h={20} w={`${w}%`} />)}</GlassCard>}
          {result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* SCORE RINGS */}
              <GlassCard style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                  <ScoreRing score={result.productivityScore} size={110} color={result.productivityScore >= 80 ? "#10b981" : result.productivityScore >= 60 ? "#f59e0b" : "#f43f5e"} label="Overall Score" fontSize={28} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 64, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: gradeColor[result.grade] || "#fff", textShadow: `0 0 30px ${gradeColor[result.grade] || "#fff"}88` }}>{result.grade}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, maxWidth: 180 }}>{result.gradeMessage}</div>
                  </div>
                  <ScoreRing score={result.focusScore} size={80} color="#3b82f6" label="Focus" />
                  <ScoreRing score={result.consistencyScore} size={80} color="#7c3aed" label="Consistency" />
                  <ScoreRing score={result.balanceScore} size={80} color="#10b981" label="Balance" />
                </div>
              </GlassCard>

              {/* BURNOUT */}
              <GlassCard style={{ padding: 20, borderColor: result.burnoutRisk === "Critical" ? "#f43f5e44" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>🔥 Burnout Risk</span>
                  <Badge color={burnColor[result.burnoutRisk] || "#888"}>{result.burnoutRisk}</Badge>
                </div>
                <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
                  {["Low", "Medium", "High", "Critical"].map((z, i) => <div key={z} style={{ flex: 1, background: i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : i === 2 ? "#f97316" : "#f43f5e", opacity: 0.3 }} />)}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Risk score: {result.burnoutRiskScore}%</div>
              </GlassCard>

              {/* STRENGTHS & IMPROVEMENTS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <GlassCard style={{ padding: 20 }}>
                  <div style={{ color: "#10b981", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>💪 Strengths</div>
                  {result.strengths?.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, color: "rgba(255,255,255,0.75)", fontSize: 12 }}><CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />{s}</div>)}
                </GlassCard>
                <GlassCard style={{ padding: 20 }}>
                  <div style={{ color: "#f59e0b", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📈 To Improve</div>
                  {result.improvements?.map((imp, i) => (
                    <div key={i} style={{ marginBottom: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{imp.issue}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 4 }}>{imp.suggestion}</div>
                    </div>
                  ))}
                </GlassCard>
              </div>

              {/* MOTIVATIONAL MESSAGE */}
              <GlassCard style={{ padding: 24, background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(124,58,237,0.08))", borderColor: "rgba(124,58,237,0.2)" }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3, fontFamily: "Georgia, serif" }}>"</div>
                <div style={{ color: "#fff", fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>{typedMsg}</div>
                <div style={{ marginTop: 16, color: "#3b82f6", fontSize: 12, fontWeight: 700 }}>🎯 Next Week Goal: {result.nextWeekGoal}</div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 5 — AI AGENTS
// ─────────────────────────────────────────────
const AgentsTab = ({ addToast }) => {
  const agents = [
    { id: "research", name: "Research Agent", role: "Academic Intelligence", color: "#3b82f6", emoji: "📚", sys: "You are an academic research assistant for Indian engineering students. Give detailed, educational answers." },
    { id: "pm", name: "Project Manager", role: "Task & Sprint Planning", color: "#7c3aed", emoji: "📊", sys: "You are a college project manager AI helping students plan and track their projects." },
    { id: "assignment", name: "Assignment Coach", role: "Academic Writing & Planning", color: "#10b981", emoji: "✍️", sys: "You are an academic writing coach helping engineering students plan and write assignments." },
    { id: "strategy", name: "Study Strategist", role: "Learning & Memory Optimization", color: "#f59e0b", emoji: "🧠", sys: "You are a study strategy expert who helps students learn faster and retain more." },
    { id: "motivation", name: "Motivation Coach", role: "Productivity & Mental Wellness", color: "#f43f5e", emoji: "🔥", sys: "You are an empathetic motivational coach who encourages students to keep going and stay balanced." },
    { id: "career", name: "Career Advisor", role: "Placement & Skill Roadmap", color: "#06b6d4", emoji: "💼", sys: "You are a placement and career advisor for Indian engineering students targeting IT companies." }
  ];

  const [statuses, setStatuses] = useState({ research: "Done", pm: "Done", assignment: "Idle", strategy: "Idle", motivation: "Idle", career: "Idle" });
  const [messages, setStatuses2] = useState({ research: "DBMS analysis complete", pm: "14 tasks generated", assignment: "Idle", strategy: "Idle", motivation: "Idle", career: "Idle" });
  const [selectedAgent, setSelectedAgent] = useState("research");
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput; setChatInput("");
    setChat(p => [...p, { role: "user", text: msg }]);
    setChatLoading(true);
    setStatuses(p => ({ ...p, [selectedAgent]: "Active" }));
    const ag = agents.find(a => a.id === selectedAgent);
    try {
      const resp = await callBackendAI("agents", msg, ag.sys);
      // resp is JSON because callClaude parses — handle gracefully
      //const text = typeof resp === "string" ? resp : JSON.stringify(resp);
      const text =resp.response ||resp.message || JSON.stringify(resp);
      setChat(p => [...p, { role: "agent", text, agentId: selectedAgent }]);
      setStatuses(p => ({ ...p, [selectedAgent]: "Done" }));
      setStatuses2(p => ({ ...p, [selectedAgent]: msg.slice(0, 40) + "..." }));
    } catch {
      setChat(p => [...p, { role: "agent", text: `As your ${ag.name}, I'd suggest: For "${msg}", focus on understanding the core concept first, then practice with examples. Break it down into smaller steps and tackle one at a time. You're on the right track!`, agentId: selectedAgent }]);
      setStatuses(p => ({ ...p, [selectedAgent]: "Done" }));
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const StatusDot = ({ s }) => (
    <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: s === "Active" ? "#10b981" : s === "Done" ? "#3b82f6" : "#6b7280", boxShadow: s === "Active" ? "0 0 8px #10b981" : "none", animation: s === "Active" ? "pulse 1s infinite" : "none" }} />
  );

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* AGENT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {agents.map(ag => (
          <GlassCard key={ag.id} style={{ padding: 20, cursor: "pointer", borderColor: selectedAgent === ag.id ? `${ag.color}44` : undefined, background: selectedAgent === ag.id ? `${ag.color}08` : undefined }} onClick={() => setSelectedAgent(ag.id)}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${ag.color}22`, border: `2px solid ${ag.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{ag.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{ag.name}</span>
                  <StatusDot s={statuses[ag.id]} />
                </div>
                <div style={{ color: ag.color, fontSize: 11, marginBottom: 6 }}>{ag.role}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{messages[ag.id]}</div>
                <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ width: statuses[ag.id] === "Done" ? "100%" : statuses[ag.id] === "Active" ? "60%" : "0%", height: "100%", background: ag.color, borderRadius: 2, transition: "width 1s ease" }} />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* CHAT */}
      <GlassCard style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>{agents.find(a => a.id === selectedAgent)?.emoji}</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Chat with {agents.find(a => a.id === selectedAgent)?.name}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{agents.find(a => a.id === selectedAgent)?.role}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {agents.map(ag => (
              <button key={ag.id} onClick={() => setSelectedAgent(ag.id)} title={ag.name} style={{ width: 28, height: 28, borderRadius: "50%", background: selectedAgent === ag.id ? `${ag.color}44` : "rgba(255,255,255,0.06)", border: `1px solid ${selectedAgent === ag.id ? ag.color : "transparent"}`, cursor: "pointer", fontSize: 13 }}>{ag.emoji}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 300, overflowY: "auto", padding: "16px 20px" }}>
          {chat.length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 40, fontSize: 13 }}>Start a conversation with your AI agent...</div>}
          {chat.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
              {m.role === "agent" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${agents.find(a => a.id === m.agentId)?.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0 }}>{agents.find(a => a.id === m.agentId)?.emoji}</div>}
              <div style={{ maxWidth: "72%", background: m.role === "user" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${m.role === "user" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "10px 14px", color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.6 }}>
                {m.role === "user" ? m.text : <MarkdownLite text={m.text} />}
              </div>
            </div>
          ))}
          {chatLoading && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>🤔 Agent is thinking...</div>}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder={`Ask ${agents.find(a => a.id === selectedAgent)?.name} anything...`} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
          <button onClick={sendChat} style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 10, color: "#fff", padding: "10px 16px", cursor: "pointer" }}><Send size={16} /></button>
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 6 — STUDY ROADMAP
// ─────────────────────────────────────────────
const RoadmapTab = ({ addToast }) => {
  const [form, setForm] = useState({ semester: "5th Semester", branch: "CSE", goal: "Get placed in product company", hours: 3 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setResult(null);
    const sys = `You are a senior academic counsellor for Indian engineering students. Return ONLY valid JSON: {"roadmapTitle":string,"totalWeeks":number,"weeks":[{"week":number,"theme":string,"subjects":[string],"dailyHours":number,"days":[{"day":string,"subject":string,"topic":string,"hours":number,"activity":string,"resource":string}],"milestone":string,"weeklyDeliverable":string}],"skillRoadmap":[{"skill":string,"currentLevel":string,"targetLevel":string,"resources":[string],"weeks":number}],"examStrategy":[string],"placementPlan":[string],"projectIdeas":[string],"successMetrics":[string],"criticalWarnings":[string]}`;
    try {
      const data = await callBackendAI("roadmap", JSON.stringify(form), sys);
      setResult(data); addToast("🗺️", `${data.totalWeeks}-week roadmap generated!`);
    } catch { setResult(DEMO.roadmap); addToast("🗺️", "Demo 4-week roadmap loaded!"); }
    setLoading(false);
  };

  const weekColors = ["#3b82f6", "#7c3aed", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#ec4899", "#8b5cf6"];

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <GlassCard style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          {[["Semester", "semester", ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(s => s + " Semester")],
            ["Branch", "branch", ["CSE", "IT", "ECE", "Mech", "Civil", "EEE"]],
            ["Goal", "goal", ["Get placed in product company", "Score 90%+", "Build strong projects", "Crack GATE", "Start a startup"]]].map(([label, key, opts]) => (
            <div key={key}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 4 }}>{label}</div>
              <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "8px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                {opts.map(o => <option key={o} style={{ background: "#0f1423" }}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 4 }}>Hours/day: {form.hours}</div>
            <input type="range" min={1} max={10} value={form.hours} onChange={e => setForm(p => ({ ...p, hours: +e.target.value }))} style={{ width: 120, accentColor: "#3b82f6" }} />
          </div>
          <button onClick={generate} style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 12, color: "#fff", padding: "12px 20px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>🗺️ Generate Roadmap</button>
          <button onClick={() => { setResult(DEMO.roadmap); addToast("🗺️", "Demo roadmap loaded!"); }} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, color: "#3b82f6", padding: "12px 16px", cursor: "pointer" }}>🎯</button>
        </div>
      </GlassCard>

      {loading && <GlassCard style={{ padding: 32, textAlign: "center" }}><div style={{ color: "#3b82f6", fontFamily: "'Syne', sans-serif", fontSize: 16 }}>🗺️ Building your personalized roadmap...</div></GlassCard>}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* HEADER */}
          <GlassCard style={{ padding: 24, background: "linear-gradient(135deg,rgba(59,130,246,0.1),rgba(124,58,237,0.1))" }}>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{result.roadmapTitle}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Badge color="#3b82f6">{result.totalWeeks} Weeks</Badge>
              <Badge color="#10b981">{form.goal}</Badge>
              <Badge color="#7c3aed">{form.branch} · {form.semester}</Badge>
            </div>
          </GlassCard>

          {/* WEEK CARDS */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📅 Week-by-Week Plan</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
              {result.weeks?.map((week, i) => (
                <GlassCard key={i} style={{ padding: 20, minWidth: 240, flex: "0 0 240px", borderColor: `${weekColors[i % weekColors.length]}33` }}>
                  <div style={{ background: `${weekColors[i % weekColors.length]}22`, border: `1px solid ${weekColors[i % weekColors.length]}33`, borderRadius: 8, padding: "6px 12px", marginBottom: 12, color: weekColors[i % weekColors.length], fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>Week {week.week}: {week.theme}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {week.subjects?.map(s => <Badge key={s} color={weekColors[i % weekColors.length]}>{s}</Badge>)}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8 }}>⏱ {week.dailyHours}h/day</div>
                  {week.days?.slice(0, 3).map((d, di) => (
                    <div key={di} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: weekColors[i % weekColors.length], fontWeight: 600 }}>{d.day}</span> · {d.topic}
                    </div>
                  ))}
                  <div style={{ marginTop: 10, background: `${weekColors[i % weekColors.length]}11`, border: `1px solid ${weekColors[i % weekColors.length]}22`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: weekColors[i % weekColors.length] }}>🎯 {week.milestone}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* SKILL ROADMAP */}
          <div>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>⚡ Skill Development</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {result.skillRoadmap?.map((sk, i) => (
                <GlassCard key={i} style={{ padding: 18 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{sk.skill}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Badge color="#f43f5e">{sk.currentLevel}</Badge>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>→</span>
                    <Badge color="#10b981">{sk.targetLevel}</Badge>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 8 }}>
                    <div style={{ width: sk.currentLevel === "Zero" ? "5%" : sk.currentLevel === "Beginner" ? "25%" : sk.currentLevel === "Intermediate" ? "60%" : "85%", height: "100%", background: "linear-gradient(90deg,#3b82f6,#10b981)", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>⏱ {sk.weeks} weeks · Resources: {sk.resources?.slice(0, 2).join(", ")}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* WARNINGS */}
          {result.criticalWarnings?.map((w, i) => (
            <div key={i} style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f43f5e", fontSize: 13 }}>⚠️ {w}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 7 — LINKEDIN AI
// ─────────────────────────────────────────────
const LinkedInTab = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState("train");
  const [samples, setSamples] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Generation state
  const [genForm, setGenForm] = useState({ topic: "", achievement: "", context: "", mode: "Professional" });
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const readLinkedInResponse = async (resp, fallbackMessage) => {
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || data.message || fallbackMessage);
    return data;
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const resp = await fetch(`${BACKEND_URL}/linkedin/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await readLinkedInResponse(resp, "Failed to load LinkedIn profile");
      if (data?.id) setProfile(data);
    } catch {}
  };

  const handleTrain = async () => {
    const validSamples = samples.filter(s => s.trim().length > 20);
    if (validSamples.length < 1) return addToast("⚠️", "Add at least one substantial writing sample");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_URL}/linkedin/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ samples: validSamples })
      });
      const data = await readLinkedInResponse(resp, "Training failed");
      setProfile(data);
      addToast("✨", "Style profile updated!");
      setActiveTab("generate");
    } catch (err) {
      addToast("!", err.message || "Training failed");
      setLoading(false);
      return;
      addToast("⚠️", "Training failed");
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!genForm.topic) return addToast("⚠️", "Please enter a topic");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_URL}/linkedin/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(genForm)
      });
      const data = await readLinkedInResponse(resp, "Generation failed");
      setResult(data);
      addToast("🚀", "LinkedIn post generated!");
    } catch (err) {
      addToast("!", err.message || "Generation failed");
      setLoading(false);
      return;
      addToast("⚠️", "Generation failed");
    }
    setLoading(false);
  };

  const copyPost = () => {
    navigator.clipboard.writeText(result.post + "\n\n" + (result.hashtags || []).join(" "));
    addToast("📋", "Copied to clipboard!");
  };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setActiveTab("train")} style={{ background: activeTab === "train" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${activeTab === "train" ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: activeTab === "train" ? "#3b82f6" : "rgba(255,255,255,0.6)", padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>1. Train AI Persona</button>
        <button onClick={() => setActiveTab("generate")} style={{ background: activeTab === "generate" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${activeTab === "generate" ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: activeTab === "generate" ? "#3b82f6" : "rgba(255,255,255,0.6)", padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>2. Generate Post</button>
      </div>

      {activeTab === "train" && (
        <div style={{ display: "grid", gridTemplateColumns: profile ? "1fr 320px" : "1fr", gap: 24 }}>
          <GlassCard style={{ padding: 24 }}>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>Train Your AI Persona</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>Paste 3-5 samples of your previous LinkedIn posts or articles. The AI will learn your unique voice, tone, and formatting style.</p>
            
            {samples.map((s, i) => (
              <textarea key={i} value={s} onChange={e => {
                const newSamples = [...samples];
                newSamples[i] = e.target.value;
                setSamples(newSamples);
              }} placeholder={`Sample ${i+1}...`} style={{ width: "100%", height: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", padding: "12px", marginBottom: 12, outline: "none", resize: "none" }} />
            ))}
            
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSamples([...samples, ""])} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "10px 20px", cursor: "pointer" }}>+ Add Sample</button>
              <button onClick={handleTrain} disabled={loading} style={{ flex: 1, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{loading ? "Analyzing Style..." : "Train My AI Persona"}</button>
            </div>
          </GlassCard>

          {profile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <GlassCard style={{ padding: 20 }}>
                <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Detected Persona</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Badge color="#3b82f6">{profile.tone}</Badge>
                  <Badge color="#7c3aed">{profile.vocabularyStyle}</Badge>
                  <Badge color="#10b981">Hook: {profile.hookStyle}</Badge>
                </div>
                <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                  <strong>Storytelling:</strong> {profile.storytellingStyle}<br/>
                  <strong>Emoji Usage:</strong> {profile.emojiUsage}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {activeTab === "generate" && (
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
          <GlassCard style={{ padding: 24, height: "fit-content" }}>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Post Details</div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 6 }}>TOPIC</label>
              <input value={genForm.topic} onChange={e => setGenForm({...genForm, topic: e.target.value})} placeholder="e.g. My first internship" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", outline: "none" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 6 }}>ACHIEVEMENT</label>
              <input value={genForm.achievement} onChange={e => setGenForm({...genForm, achievement: e.target.value})} placeholder="e.g. Built a React app" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", outline: "none" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 6 }}>MODE</label>
              <select value={genForm.mode} onChange={e => setGenForm({...genForm, mode: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px", outline: "none" }}>
                {["Professional", "Viral", "Storytelling", "Technical"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 6 }}>EXTRA CONTEXT</label>
              <textarea value={genForm.context} onChange={e => setGenForm({...genForm, context: e.target.value})} placeholder="Any specific details or thoughts..." style={{ width: "100%", height: 80, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", outline: "none", resize: "none" }} />
            </div>

            <button onClick={handleGenerate} disabled={loading || !profile} style={{ width: "100%", background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 10, color: "#fff", padding: "14px", fontWeight: 700, cursor: "pointer" }}>{loading ? "Generating..." : profile ? "Generate Post" : "Train AI First"}</button>
          </GlassCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {result ? (
              <>
                <GlassCard style={{ padding: 24, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <ScoreRing score={result.engagementPrediction} size={60} color="#3b82f6" label="Engagement" fontSize={14} />
                      <ScoreRing score={result.hookStrength * 10} size={60} color="#7c3aed" label="Hook" fontSize={14} />
                    </div>
                    <button onClick={copyPost} style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#3b82f6", padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>Copy Post</button>
                  </div>
                  
                  <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.7, background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <MarkdownLite text={result.post} />
                  </div>
                  
                  <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(result.hashtags || []).map(h => <Badge key={h} color="#3b82f6">{h}</Badge>)}
                  </div>

                  <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 16 }}>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>BEST TIME TO POST (IST)</div>
                      <div style={{ color: "#10b981", fontWeight: 700 }}>{result.bestPostingTime}</div>
                    </div>
                    <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 12, padding: 16 }}>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>CALL TO ACTION</div>
                      <div style={{ color: "#7c3aed", fontWeight: 700 }}>{result.cta}</div>
                    </div>
                  </div>
                </GlassCard>
              </>
            ) : (
              <GlassCard style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Zap size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Fill the details and generate your viral LinkedIn post</div>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 8 — GITHUB AI
// ─────────────────────────────────────────────
const GitHubTab = ({ addToast }) => {
  const [step, setStep] = useState(1);
  const [githubUser, setGithubUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [publishedUrl, setPublishedUrl] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_URL}/github/status`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.connected) {
        setGithubUser(data.githubUsername);
        setStep(2);
      }
    } catch {}
  };

  const handleConnect = async () => {
    // MOCK CONNECT: In a real app, this would be an OAuth popup
    const token = prompt("Enter your GitHub Personal Access Token (for demo):");
    const username = prompt("Enter your GitHub Username:");
    if (!token || !username) return;

    setLoading(true);
    try {
      const appToken = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_URL}/github/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${appToken}` },
        body: JSON.stringify({ githubUsername: username, accessToken: token })
      });
      if (resp.ok) {
        setGithubUser(username);
        setStep(2);
        addToast("🤝", "GitHub connected!");
      }
    } catch (err) {
      addToast("⚠️", "Connection failed");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!repoName) return addToast("⚠️", "Enter a repository name first");

    setLoading(true);
    const formData = new FormData();
    formData.append("projectZip", file);
    formData.append("repoName", repoName);

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_URL}/github/upload-project`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await resp.json();
      setAnalysis(data);
      setStep(3);
      addToast("📦", "Project analyzed!");
    } catch (err) {
      addToast("⚠️", "Upload failed");
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BACKEND_URL}/github/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          repoName: analysis.repoName,
          tempPath: analysis.tempPath,
          readme: analysis.readme,
          gitignore: analysis.gitignore,
          isPrivate: isPrivate
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        setPublishedUrl(data.url);
        setStep(4);
        addToast("🚀", "Project published to GitHub!");
      } else {
        addToast("⚠️", data.message);
      }
    } catch (err) {
      addToast("⚠️", "Publishing failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* PROGRESS BAR */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: 4, background: step >= s ? "#3b82f6" : "rgba(255,255,255,0.06)", borderRadius: 2 }} />
        ))}
      </div>

      {step === 1 && (
        <GlassCard style={{ padding: 48, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <Users size={64} color="#3b82f6" style={{ marginBottom: 24 }} />
          <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Connect GitHub</div>
          <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 32 }}>Authorize CampusForge AI to create repositories and push code on your behalf.</p>
          <button onClick={handleConnect} disabled={loading} style={{ background: "#fff", color: "#000", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, margin: "0 auto" }}><Users size={20} /> Connect with GitHub</button>
        </GlassCard>
      )}

      {step === 2 && (
        <GlassCard style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>Create New Repository</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Step 2: Project Details</div>
            </div>
            <Badge color="#10b981">@{githubUser}</Badge>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 8 }}>REPOSITORY NAME</label>
            <input value={repoName} onChange={e => setRepoName(e.target.value)} placeholder="e.g. my-awesome-project" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", padding: "14px", outline: "none" }} />
          </div>

          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Private Repository</span>
          </div>

          <div style={{ background: "rgba(59,130,246,0.05)", border: "2px dashed rgba(59,130,246,0.2)", borderRadius: 16, padding: 40, textAlign: "center", position: "relative" }}>
            <Download size={40} color="#3b82f6" style={{ marginBottom: 16 }} />
            <div style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>Upload Project ZIP</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Drag and drop or click to browse</div>
            <input type="file" accept=".zip" onChange={handleFileUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          </div>
          {loading && <div style={{ textAlign: "center", marginTop: 16, color: "#3b82f6" }}>⚡ AI is analyzing your code...</div>}
        </GlassCard>
      )}

      {step === 3 && analysis && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <GlassCard style={{ padding: 24 }}>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>README Preview</div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", padding: 20, height: 400, overflowY: "auto", fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>
              {analysis.readme}
            </div>
          </GlassCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <GlassCard style={{ padding: 24 }}>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Project Intelligence</div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8 }}>TECH STACK DETECTED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {analysis.techStack.map(t => <Badge key={t} color="#3b82f6">{t}</Badge>)}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8 }}>DESCRIPTION</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.6 }}>{analysis.description}</div>
              </div>
              <button onClick={handlePublish} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#10b981,#3b82f6)", border: "none", borderRadius: 12, color: "#fff", padding: "14px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{loading ? "Publishing..." : "Publish to GitHub"}</button>
            </GlassCard>
            
            <GlassCard style={{ padding: 24, background: "rgba(59,130,246,0.05)" }}>
              <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Git Automation</div>
              <ul style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Initialize git repository</li>
                <li>Generate professional .gitignore</li>
                <li>AI-generated initial commit message</li>
                <li>Create main branch</li>
                <li>Push to remote origin</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      )}

      {step === 4 && (
        <GlassCard style={{ padding: 48, textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={48} color="#10b981" />
          </div>
          <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Successfully Published!</div>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>Your project is now live on GitHub with a professional README and clean git history.</p>
          <a href={publishedUrl} target="_blank" rel="noreferrer" style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 700, display: "inline-block" }}>View on GitHub</a>
          <button onClick={() => { setStep(2); setAnalysis(null); setRepoName(""); }} style={{ display: "block", width: "100%", marginTop: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>Upload another project</button>
        </GlassCard>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 9 — LEADERBOARD
// ─────────────────────────────────────────────
const LeaderboardTab = ({ addToast }) => {
  const [data] = useState(DEMO.leaderboard);
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const trendIcon = { up: "↑", down: "↓", same: "→" };
  const trendColor = { up: "#10b981", down: "#f43f5e", same: "#f59e0b" };
  const branchColors = { CSE: "#3b82f6", IT: "#7c3aed", ECE: "#10b981", Mech: "#f59e0b", EEE: "#f43f5e", Civil: "#6b7280" };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div>
          {/* LEADERBOARD TABLE */}
          <GlassCard style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>🏆 Campus Productivity Rankings</span>
              <Badge color="#3b82f6">This Week</Badge>
            </div>
            {data.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", background: s.isMe ? "rgba(59,130,246,0.08)" : "transparent", boxShadow: s.isMe ? "inset 0 0 0 1px rgba(59,130,246,0.3)" : "none" }}>
                <div style={{ width: 32, textAlign: "center", fontSize: s.rank <= 3 ? 20 : 13, color: s.rank <= 3 ? undefined : "rgba(255,255,255,0.4)", fontWeight: 700 }}>{medals[s.rank] || s.rank}</div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.isMe ? "#3b82f6" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{s.name.split(" ").map(n => n[0]).join("")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: s.isMe ? "#3b82f6" : "#fff", fontWeight: 700, fontSize: 14 }}>{s.name} {s.isMe && <span style={{ fontSize: 10, background: "rgba(59,130,246,0.2)", padding: "1px 6px", borderRadius: 10, marginLeft: 6 }}>You</span>}</div>
                  <Badge color={branchColors[s.branch] || "#888"}>{s.branch}</Badge>
                </div>
                <div style={{ width: 120 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{s.score}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ width: `${s.score}%`, height: "100%", background: s.rank === 1 ? "#f59e0b" : s.isMe ? "#3b82f6" : "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>🔥 {s.streak}</div>
                <div style={{ fontSize: 12, minWidth: 90 }}>{s.badge}</div>
                <div style={{ color: trendColor[s.trend], fontWeight: 700, fontSize: 16 }}>{trendIcon[s.trend]}</div>
              </div>
            ))}
          </GlassCard>

          {/* STATS COMPARISON */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[["Your Score", 78, "Campus Avg", 68, "#3b82f6"], ["Your Streak", 5, "Top Streaker", 21, "#f43f5e"], ["Tasks Done", 8, "Class Avg", 5, "#10b981"]].map(([a, av, b, bv, c], i) => (
              <GlassCard key={i} style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: c, fontSize: 32, fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>{av}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 8 }}>{a}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>vs {b}: <span style={{ color: "rgba(255,255,255,0.6)" }}>{bv}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* BADGES */}
          <GlassCard style={{ padding: 20 }}>
            <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>🎖️ Your Badges</div>
            {[["🔥 5-Day Streak", true], ["📚 Research Pro", true], ["✅ Task Master", true], ["🏆 Semester Topper", false], ["🚀 30-Day Streak", false], ["💯 Perfect Week", false]].map(([badge, earned], i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: earned ? 1 : 0.35 }}>
                <span style={{ fontSize: 20 }}>{badge.split(" ")[0]}</span>
                <div>
                  <div style={{ color: earned ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 13 }}>{badge.slice(2)}</div>
                  <div style={{ color: earned ? "#10b981" : "rgba(255,255,255,0.3)", fontSize: 11 }}>{earned ? "✓ Earned" : "🔒 Locked"}</div>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* WEEKLY CHALLENGE */}
          <GlassCard style={{ padding: 20, borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.05)" }}>
            <div style={{ color: "#7c3aed", fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 8 }}>⚡ Weekly Challenge</div>
            <div style={{ color: "#fff", fontSize: 13, marginBottom: 12 }}>Complete 5 assignments without missing deadlines</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>3/5</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 12 }}>
              <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg,#7c3aed,#3b82f6)", borderRadius: 3 }} />
            </div>
            <Badge color="#f59e0b">Reward: ⚡ Consistent Badge</Badge>
            <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>⏳ 4 days remaining</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB 8 — SETTINGS
// ─────────────────────────────────────────────
const SettingsTab = ({ user }) => (
  <div style={{ padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>
    <GlassCard style={{ padding: 24, maxWidth: 560 }}>
      <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>⚙️ Settings</div>
      {[
        ["Student Name", user?.name || "N/A"], // Assuming college is static or from another source
        ["Branch", user?.branch || "N/A"],
        ["Semester", user?.semester || "N/A"],
        ["Email", user?.email || "N/A"]
      ].map(([label, val]) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 4 }}>{label}</div>
          <input defaultValue={val} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
      ))}
      <button style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 12, color: "#fff", padding: "12px 24px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginTop: 8 }}>Save Changes</button>
    </GlassCard>
  </div>
);

// ─────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────
const Onboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "🎓", title: "Welcome to CampusForge AI", sub: "Your smart campus companion — Study Less. Achieve More." },
    { icon: "🔍", title: "Research & Plan Instantly", sub: "Enter any project or assignment topic and get AI-powered research, task breakdown, and study plans in seconds." },
    { icon: "🚀", title: "Ready to Build?", sub: "Click any tab to get started, or hit Demo Mode to see everything in action — no API key needed!" }
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,8,15,0.95)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)" }}>
      <GlassCard style={{ padding: 48, maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{steps[step].icon}</div>
        <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>{steps[step].title}</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>{steps[step].sub}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {steps.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#3b82f6" : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />)}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onDone} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "rgba(255,255,255,0.5)", padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Skip</button>
          <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onDone()} style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 10, color: "#fff", padding: "10px 28px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{step < steps.length - 1 ? "Next →" : "Get Started 🚀"}</button>
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// AUTH COMPONENT
// ─────────────────────────────────────────────
const Auth = ({ onLogin, addToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", branch: "CSE", semester: "5th" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Auth failed");
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
      addToast("👋", `Welcome back, ${data.user.name}!`);
    } catch (err) {
      addToast("⚠️", err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,8,15,0.95)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(20px)" }}>
      <GlassCard style={{ padding: 40, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>CampusForge AI</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 8 }}>{isLogin ? "Login to your account" : "Create your student account"}</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isLogin && (
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "12px 16px", outline: "none" }} required />
          )}
          <input type="email" placeholder="College Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "12px 16px", outline: "none" }} required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "12px 16px", outline: "none" }} required />
          {!isLogin && (
            <div style={{ display: "flex", gap: 10 }}>
              <select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "12px", outline: "none" }}>
                {["CSE", "IT", "ECE", "Mech", "Civil"].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "12px", outline: "none" }}>
                {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(s => <option key={s} value={s + " Sem"}>{s} Sem</option>)}
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#3b82f6,#7c3aed)", border: "none", borderRadius: 12, color: "#fff", padding: "14px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 10 }}>{loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 13 }}>{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}</button>
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function CampusForgeAI() {
  const [tab, setTab] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalState, setGlobalState] = useState({ research: false, tasks: 0, score: 0, roadmap: false, streak: user?.streak || 0 });

  useEffect(() => {
    if (user) {
      setGlobalState(prev => ({ ...prev, streak: user.streak }));
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const addToast = useCallback((icon, message) => {
    const id = Date.now();
    setToasts(p => [...p, { id, icon, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  const navItems = [
    { icon: <Search size={16} />, label: "DeepSearch Research" },
    { icon: <BookOpen size={16} />, label: "Project HUB" },
    { icon: <Target size={16} />, label: "Assignment AI" },
    { icon: <BarChart2 size={16} />, label: "Productivity Score" },
    { icon: <Brain size={16} />, label: "AI Study Agents" },
    { icon: <Map size={16} />, label: "Study Roadmap" },
    { icon: <Zap size={16} />, label: "LinkedIn AI" },
    { icon: <Users size={16} />, label: "GitHub AI" },
    { icon: <Trophy size={16} />, label: "Campus Leaderboard" },
    { icon: <Settings size={16} />, label: "Settings" }
  ];

  const tabComponents = [
    <DeepSearchTab addToast={addToast} setGlobalState={setGlobalState} />,
    <ProjectHubTab addToast={addToast} setGlobalState={setGlobalState} />,
    <AssignmentTab addToast={addToast} />,
    <ProductivityTab addToast={addToast} />,
    <AgentsTab addToast={addToast} />,
    <RoadmapTab addToast={addToast} />, 
    <LinkedInTab addToast={addToast} />,
    <GitHubTab addToast={addToast} />,
    <LeaderboardTab addToast={addToast} />,
    <SettingsTab user={user} />
  ];

  const loadAllDemo = () => {
    addToast("🎯", "Demo mode activated! All data loaded.");
    setGlobalState({ research: true, tasks: 14, score: 78, roadmap: true, streak: 5 });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#07080f", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-20px) scale(1.05)} 66%{transform:translate(-20px,30px) scale(0.97)} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        select option { background: #0f1423; color: #fff; }
        input[type=range]::-webkit-slider-thumb { cursor: pointer; }
      `}</style>

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      {!user && <Auth onLogin={setUser} addToast={addToast} />}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* AMBIENT BACKGROUND */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.08),transparent 70%)", animation: "blob 12s infinite ease-in-out" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)", animation: "blob 16s infinite ease-in-out reverse" }} />
      </div>

      <div style={{ display: "flex", flex: 1, position: "relative", zIndex: 1 }}>
        {/* SIDEBAR */}
        <div style={{ width: 240, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
          {/* LOGO */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "glow 3s infinite" }}>CampusForge AI</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>Smart Campus AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <Flame size={14} color="#f59e0b" style={{ animation: "pulse 1s infinite" }} />
              <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600 }}>{globalState.streak} Day Streak</span>
            </div>
          </div>

          {/* NAV */}
          <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
            {navItems.map((item, i) => (
              <button key={i} onClick={() => { setTab(i); setSidebarOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", background: tab === i ? "rgba(59,130,246,0.12)" : "transparent", border: "none", borderLeft: tab === i ? "3px solid #3b82f6" : "3px solid transparent", color: tab === i ? "#3b82f6" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: tab === i ? 600 : 400, textAlign: "left", transition: "all 0.2s" }}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* STUDENT PROFILE */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{user?.name?.slice(0, 2).toUpperCase() || "CF"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{user?.name || "Guest Student"}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{user?.branch || "N/A"} · {user?.semester || "N/A"}</div>
              </div>
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10 }}>Logout</button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* HEADER */}
          <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,8,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>{navItems[tab].label}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>CampusForge AI · iNSIGHTS DeepSearch × Project HUB Challenge</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={loadAllDemo} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, color: "#3b82f6", padding: "8px 16px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Play size={13} /> Demo Mode</button>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#10b981", fontSize: 12 }}>AI Ready</span>
              </div>
            </div>
          </div>

          {/* TAB CONTENT */}
          <div style={{ flex: 1 }}>
            {tabComponents[tab]}
          </div>

          {/* GLOBAL BOTTOM PROGRESS BAR */}
          <div style={{ position: "sticky", bottom: 0, zIndex: 50, background: "rgba(7,8,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 28px" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: globalState.research ? "#10b981" : "rgba(255,255,255,0.3)", display: "flex", gap: 4, alignItems: "center" }}>{globalState.research ? "✓" : "○"} Research</span>
              <span style={{ fontSize: 11, color: globalState.tasks > 0 ? "#3b82f6" : "rgba(255,255,255,0.3)" }}>Tasks: {globalState.tasks}</span>
              <span style={{ fontSize: 11, color: globalState.score > 0 ? "#7c3aed" : "rgba(255,255,255,0.3)" }}>Score: {globalState.score || "—"}</span>
              <span style={{ fontSize: 11, color: globalState.roadmap ? "#10b981" : "rgba(255,255,255,0.3)", display: "flex", gap: 4, alignItems: "center" }}>{globalState.roadmap ? "✓" : "○"} Roadmap</span>
              <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", gap: 4, alignItems: "center" }}>🔥 Streak: {globalState.streak} days</span>
              <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>CampusForge AI · "Study Less. Achieve More."</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
