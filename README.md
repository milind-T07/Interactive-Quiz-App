# QuizePro — 5,200+ Developer Questions & Offline Assessment Engine

**QuizePro** is a modern, high-performance developer quiz and learning platform featuring **5,200 unique, technically rigorous technical questions** stored locally across 18 specialized computer science and engineering disciplines.

Zero API keys, zero external network calls, zero AI vendor lock-in, and zero backend configuration. Everything operates 100% locally in the browser.

---

## ✨ Key Features

### 1. 🎯 Master Your Next Concept — Discovery Dashboard
- **20 Curated Technical Categories** dynamically computed from local JSON files:
  - HTML, CSS, JavaScript Fundamentals, Advanced JavaScript, TypeScript
  - React & Hooks, Next.js, Data Structures, Algorithms, Problem Solving
  - Python, Java, Backend Development, REST APIs, SQL & Databases
  - Operating Systems, Computer Networks, Object-Oriented Programming, Cybersecurity, Git & DevOps
- Real-time question distribution counts (Easy, Medium, Hard breakdown).
- **Daily Challenge Drill**: 5 questions randomized daily across multi-discipline domains.
- **Daily Learning Goal**: Visual streak tracking and questions solved counter.
- **Resume Practice**: Instant continuation card from the most recently attempted domain.

### 2. 🔍 Instant Offline Explore & Question Search
- Fast client-side search across all 5,200 questions by title, keywords, subtopics, and explanations.
- Multi-dimensional filtering by Category, Difficulty (Easy, Medium, Hard), and Question Type.
- Paginated rendering preventing DOM lockups with thousands of questions.
- Concept hints and in-depth explanations expandable on demand.
- **Create Quiz from Results**: Automatically generate an assessment from your active search filters.
- Direct bookmarking to Study Bank from any question card.

### 3. ⚡ Comprehensive Quiz Engine (Practice & Exam Modes)
- **Practice Mode**: Immediate feedback upon selection with clear explanations and concept hints.
- **Exam Mode**: Formal test environment where correct answers are hidden until submission.
- **Interactive Question Palette**: Fast navigation between questions with status indicators (unvisited, answered, current, flagged).
- **Question Flagging**: Mark tricky questions to review before final submission.
- **Optional Timers**: Configurable time constraints or relaxed untimed practice.
- **Deterministic Scoring**: Accurately tracks answered, correct, incorrect, and unanswered totals.
- **Full Keyboard Navigation**:
  - `1`-`4` or `A`-`D`: Select answer option
  - `Enter` / `Space`: Confirm / Next question
  - `P`: Previous question
  - `F`: Toggle question flag
  - `H`: Reveal hint (in Practice Mode)
  - `Esc`: Close modals

### 4. 📊 Dedicated Analytics & 8-Tier Progression
- **Overview Metrics**: Total questions attempted, unique questions solved, overall accuracy %, completed quizzes, and continuous practice streak.
- **8-Level Progression Rank**:
  1. Beginner (Complete 1 quiz)
  2. Learner (Solve 25 questions with 60% accuracy)
  3. Intermediate (Solve 75 questions across 3 topics)
  4. Advanced (Solve 150 questions with 75% accuracy)
  5. Expert (Solve 300 questions, 3-day streak, 80% accuracy)
  6. Master (Solve 600 questions across 8 topics, 85% accuracy)
  7. Grandmaster (Solve 1,200 questions, 7-day streak, 88% accuracy)
  8. Legend (Solve 2,500 questions, 14-day streak, 90% accuracy)
- **Quiz History Table**: Detailed timestamped logs of every quiz session with score breakdowns and duration.
- **Data Portability**: Full JSON export and validated import for backup and progress restoration.

### 5. 📚 Persistent Study Bank
- Store bookmarked questions locally in browser storage.
- Filter saved items by topic and difficulty.
- Launch a targeted "Practice Saved Questions" quiz anytime.
- Clear bookmarks with confirmation dialog.

### 6. 💎 Modern Glassmorphic Navigation & Streak Tracker
- **Floating Island Navigation Dock**: Segmented capsule tabs with luminous active pill indicators and ambient glow.
- **Ambient Header Line**: OkLab violet-indigo-blue gradient highlight with passive scroll-reactive elevation depth.
- **Interactive Streak Pill Chip**: Dynamic `🔥 Streak` tracker showing daily continuous practice count with one-click jump to performance analytics.
- **Micro-Interactions**: Brand squircle rotation, glowing active dots, and tactile glass action buttons for theme and sound toggles.

---

## 📊 Question Bank Distribution (5,200 Validated Questions)

| Topic | Target | Actual Validated | Easy | Medium | Hard |
|---|---:|---:|---:|---:|---:|
| HTML | 250 | 250 | 85 | 95 | 70 |
| CSS | 300 | 300 | 100 | 115 | 85 |
| JavaScript | 500 | 500 | 170 | 190 | 140 |
| TypeScript | 250 | 250 | 85 | 95 | 70 |
| React | 350 | 350 | 120 | 130 | 100 |
| Next.js | 200 | 200 | 70 | 75 | 55 |
| Python | 450 | 450 | 150 | 170 | 130 |
| Java | 350 | 350 | 120 | 130 | 100 |
| Data Structures | 400 | 400 | 135 | 150 | 115 |
| Algorithms | 400 | 400 | 135 | 150 | 115 |
| SQL & Databases | 350 | 350 | 120 | 130 | 100 |
| Backend & REST APIs | 300 | 300 | 100 | 115 | 85 |
| Operating Systems | 200 | 200 | 70 | 75 | 55 |
| Computer Networks | 200 | 200 | 70 | 75 | 55 |
| OOP | 200 | 200 | 70 | 75 | 55 |
| Cybersecurity | 150 | 150 | 52 | 56 | 42 |
| Git & DevOps | 150 | 150 | 52 | 56 | 42 |
| CS Fundamentals | 200 | 200 | 70 | 75 | 55 |
| **Total** | **5,200** | **5,200** | **1,764** | **1,956** | **1,480** |

All 5,200 questions are verified for schema consistency, unique IDs, non-empty options, single correct answers, and thorough concept explanations via `scripts/validate-questions.js`.

---

## 📁 Project Structure

```text
interactive-quiz-app-main/
│
├── index.html                # Main application markup & accessible modal containers
├── data/                     # 18 JSON datasets containing 5,200 questions
│   ├── algorithms.json
│   ├── backend.json
│   ├── cs-fundamentals.json
│   ├── css.json
│   ├── devops.json
│   ├── dsa.json
│   ├── html.json
│   ├── java.json
│   ├── javascript.json
│   ├── networks.json
│   ├── nextjs.json
│   ├── oop.json
│   ├── os.json
│   ├── python.json
│   ├── react.json
│   ├── security.json
│   ├── sql.json
│   └── typescript.json
│
├── css/
│   ├── global.css            # Color tokens, typography, dark/light theme variables
│   └── style.css             # Component layout, runner palette, analytics, cards
│
├── js/
│   ├── questions.js          # Asynchronous JSON question bank loader & query service
│   ├── state.js              # Quiz state engine (practice vs exam, palette, answers)
│   ├── storage.js            # LocalStorage persistence, progression rank & telemetry
│   ├── audio.js              # Synthesized procedural audio effects (Web Audio API)
│   ├── confetti.js           # Canvas celebratory particle system
│   ├── theme.js              # Theme switcher (Dark / Light)
│   ├── ui.js                 # Dynamic view controller (Hub, Explore, Runner, Analytics, Bank)
│   └── main.js               # Entry point and global keyboard shortcut handlers
│
├── scripts/
│   ├── question-helper.js    # Standardized question generation helper
│   ├── gen-css.js            # CSS question generator (300 questions)
│   ├── gen-js.js             # JavaScript question generator (500 questions)
│   ├── gen-ts.js             # TypeScript question generator (250 questions)
│   ├── generate-all.js       # Complete batch generation pipeline
│   └── validate-questions.js # Rigorous schema & uniqueness validation script
│
└── README.md
```

---

## 🚀 Running the Project

Start any local static HTTP server from the project directory:

```bash
# Using Python (standard local setup)
python3 -m http.server 4173

# Or using Node.js npx
npx serve -l 4173 .
```

Open your browser and navigate to:
```
http://localhost:4173/
```

To run the question validation suite at any time:
```bash
node scripts/validate-questions.js
```
