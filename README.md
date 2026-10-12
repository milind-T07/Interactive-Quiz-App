# QuizePro — Interactive Tech Quiz Platform

**QuizePro** is a modern, interactive learning platform designed for software engineers, computer science students, and technical learners to practice core concepts, sharpen problem-solving skills, and track learning progress over time.

Built with a dark-first SaaS developer interface, high-contrast light theme, Web Audio sound synthesis, distraction-free quiz mode, and genuine analytics.

---

## ✨ Key Features

### 1. 🎯 Quiz Hub Dashboard
- **8 Technical Domains**:
  - Web Development (HTML5 semantics, modern CSS, Grid/Flexbox, browser APIs)
  - JavaScript & TypeScript (ES6+, closures, event loop, async microtasks, types)
  - React & Frontend Frameworks (React 19, hooks, Virtual DOM, state architecture)
  - Data Structures & Algorithms (trees, graphs, sorting, Big-O complexity)
  - Python & Backend (patterns, generators, concurrency, RESTful APIs)
  - Databases & SQL (relational design, indexing, ACID, joins, NoSQL)
  - Computer Science Fundamentals (OS processes/threads, memory, networking)
  - Security & DevOps (OWASP, HTTPS/CORS, Docker, CI/CD)
- **Daily Challenge**: Fresh 5-question multi-discipline drill updated every 24 hours.
- **Daily Learning Goal**: Real-time progress bar tracking daily answered questions towards a configurable goal (e.g. 10 questions/day).
- **Continue Practicing**: Contextual resume card reflecting your latest attempted domain.
- **Summary Metrics**: Real completed quiz counts, accuracy percentage, and active streak days.

### 2. 🔍 Dedicated Explore Discovery
- Keyword search across question text, options, and explanations.
- Filter by topic domain and difficulty level (Easy, Medium, Hard).
- Sort alphabetically or by difficulty.
- Quick action to launch targeted quizzes directly from filtered results.
- Independent filter state preserving your Quiz Hub selections.

### 3. ⚡ Distraction-Free Quiz Experience
- Clean, focused interface with timer countdown (20s per question) and progress bar.
- Accessible multiple-choice options with keyboard shortcuts (`1`-`4` or `A`-`D`).
- Strategic lifelines:
  - **50:50**: Eliminates two incorrect options.
  - **Hint**: Reveals contextual concept hints.
  - **Skip**: Advances past difficult questions without penalty.
- Instant feedback with color-coded answers, icons, and **in-depth concept explanations**.
- One-click **Save to Study Bank** bookmarking.
- Native confirmation modal preventing accidental quiz exits.

### 4. 🏆 Polished Results & Mistake Revision
- Overall performance grade (`S`, `A`, `B`, `C`) and percentage accuracy.
- Breakdown of correct answers, time taken, and maximum streak.
- **Practice Missed Questions**: One-click drill targeting only the questions you got wrong.
- Filterable question-by-question review (`All`, `Correct`, `Incorrect`).
- Lightweight confetti celebration for high scores (>= 70%).
- Copy result summary to clipboard for sharing.

### 5. 📊 Real Performance Analytics
- Calculated entirely from real quiz attempts in LocalStorage:
  - Total Quizzes Completed
  - Average Accuracy (%)
  - Best Score (%)
  - Continuous Practice Streak (Days)
- **7-Day Practice Activity Chart**: Visual bar visualization of questions completed each day over the past week.
- **Accuracy by Topic**: Real breakdown bars showing mastery across each technical domain.
- **Strongest & Weakest Topic Identification**: Highlights areas of strength and recommended revision.
- **Achievements & Milestones**: Tracked badges (First Step, Perfectionist, Consistent Learner, Quiz Veteran, Speed Demon, Centurion).
- **Attempt History Table**: Filterable by topic with timestamp, duration, score, and individual deletion.
- Clean "Clear All Logs" action that updates all dependent metrics consistently.

### 6. 📚 Study Bank Revision Workspace
- Personal repository of bookmarked challenging questions.
- Search and filter by topic or difficulty.
- Toggle review status (**Mark Reviewed** / **Needs Review**).
- One-click **Practice Saved Questions** drill.
- Bookmark questions during a quiz or from Explore.

### 7. 🎨 Design System & Accessibility
- **Dark-First Theme**: Sophisticated near-black/obsidian navy (`#090d16`) surfaces with violet/purple (`#8b5cf6`) primary accents and restrained cyan (`#06b6d4`) highlights.
- **Refined Light Theme**: Crisp slate surfaces with high-contrast text.
- Theme preference persisted in LocalStorage.
- Web Audio API synthesizer for clean sound feedback (clicks, correct/incorrect tones, streaks, fanfare) with a mute toggle.
- Keyboard shortcuts:
  - `1`, `2`, `3`, `4` or `A`, `B`, `C`, `D` to pick answers.
  - `Enter` or `Space` to advance to the next question.
  - `Esc` to close modals and mobile drawers.
- Semantic HTML5, accessible ARIA attributes, and native `<dialog>` modals.
- Fully responsive across desktop, tablet, and mobile devices.

---

## 💻 Tech Stack

- **HTML5**: Semantic tags, native `<dialog>`, and accessibility attributes.
- **CSS3**: Custom properties (tokens), Flexbox, CSS Grid, animations, dark/light themes.
- **JavaScript (ES6+)**: Modular architecture (`Storage`, `SoundEngine`, `Confetti`, `ThemeManager`, `QuestionService`, `UI`).
- **Web Audio API**: Synthesized procedural sound effects without external audio assets.
- **LocalStorage API**: Reliable client-side persistence for history, bookmarks, custom quizzes, and preferences.

---

## 📁 Project Structure

```text
interactive-quiz-app-main/
│
├── index.html          # Main HTML structure, navigation, and modal containers
│
├── css/
│   ├── global.css      # Design tokens, color themes, buttons, cards, typography
│   └── style.css       # View-specific components (Hub, Explore, Runner, Analytics, Study Bank)
│
├── js/
│   ├── questions.js    # Comprehensive questions database across 8 domains
│   ├── audio.js        # Web Audio API sound synthesizer
│   ├── confetti.js     # Lightweight canvas confetti engine
│   ├── storage.js      # LocalStorage persistence & real-time analytics calculations
│   ├── theme.js        # Dark/Light theme manager & preference persistence
│   ├── state.js        # Quiz state machine, lifelines, timers, and modes
│   ├── ui.js           # Modular view renderer and interaction handlers
│   └── main.js         # Application initialization and keyboard shortcut listeners
│
└── README.md
```

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser, or serve using any static web server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js npx
npx serve .
```

Open `http://localhost:8080` in your browser.

---

## 📄 License

This project is licensed under the MIT License.
