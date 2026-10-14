/* ============================================================
   QUESTIONS.JS — QuizePro 5,200+ Validated Technical Question Bank
   ============================================================ */

// 20 Recommended Platform Categories with curated metadata & icons
const CATEGORIES = {
  html: {
    id: "html",
    title: "HTML",
    file: "html.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`,
    description: "Semantic elements, modern HTML5 APIs, Forms, SEO & Accessibility",
    color: "#e34f26",
    difficulty: "Foundational"
  },
  css: {
    id: "css",
    title: "CSS",
    file: "css.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16l-2 16-6 2-6-2L4 3z"/><path d="M16 8H8l.5 4H15l-.5 4-2.5 1-2.5-1-.2-2"/></svg>`,
    description: "Flexbox, CSS Grid, Cascade, Specificity, Animations & Modern Layouts",
    color: "#264de4",
    difficulty: "Core"
  },
  "js-fundamentals": {
    id: "js-fundamentals",
    title: "JavaScript Fundamentals",
    file: "javascript.json",
    filter: (q) => q.difficulty === "easy" || ["Types & Coercion", "Scopes & Closures", "Functions & 'this'", "Math & Numbers", "Arrays"].includes(q.subtopic),
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M16 8v5a3 3 0 0 1-6 0"/><path d="M8 8v8"/></svg>`,
    description: "Primitives, Coercion, Scopes, Closures, Array & Object Fundamentals",
    color: "#f7df1e",
    difficulty: "Core"
  },
  "js-advanced": {
    id: "js-advanced",
    title: "Advanced JavaScript",
    file: "javascript.json",
    filter: (q) => q.difficulty === "hard" || ["Event Loop & Async", "Proxy & Reflect", "Memory & Buffers", "Iterators & Generators", "Web APIs"].includes(q.subtopic),
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><circle cx="12" cy="12" r="3"/></svg>`,
    description: "Event Loop, Microtasks, Proxies, Memory Buffers, Web APIs & Async Engines",
    color: "#eab308",
    difficulty: "Advanced"
  },
  typescript: {
    id: "typescript",
    title: "TypeScript",
    file: "typescript.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h6"/><path d="M10 8v8"/><path d="M17 10c0-1.5-1-2-2-2s-2 .5-2 1.5c0 2 4 1.5 4 3.5 0 1-1 2-2 2s-2-.5-2-1.5"/></svg>`,
    description: "Generics, Utility Types, Type Narrowing, Discriminated Unions & tsconfig",
    color: "#3178c6",
    difficulty: "Advanced"
  },
  react: {
    id: "react",
    title: "React & Hooks",
    file: "react.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>`,
    description: "React 19, Custom Hooks, Reconciliation, State Management & Suspense",
    color: "#61dafb",
    difficulty: "Core"
  },
  nextjs: {
    id: "nextjs",
    title: "Next.js",
    file: "nextjs.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10 12V6"/></svg>`,
    description: "App Router, Server Components, SSR, SSG, Route Handlers & Optimization",
    color: "#000000",
    difficulty: "Specialized"
  },
  dsa: {
    id: "dsa",
    title: "Data Structures",
    file: "dsa.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>`,
    description: "Arrays, Linked Lists, Stacks, Queues, Binary Trees, Heaps & Graphs",
    color: "#8b5cf6",
    difficulty: "Foundational"
  },
  algorithms: {
    id: "algorithms",
    title: "Algorithms",
    file: "algorithms.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="m15 5 7 7-7 7"/><path d="m9 5-7 7 7 7"/></svg>`,
    description: "Sorting, Searching, Dynamic Programming, Greedy, Graph Algorithms & Big-O",
    color: "#ec4899",
    difficulty: "Advanced"
  },
  "problem-solving": {
    id: "problem-solving",
    title: "Problem Solving",
    files: ["dsa.json", "algorithms.json"],
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
    description: "Technical interview patterns, algorithmic puzzles, complexity & optimization",
    color: "#f59e0b",
    difficulty: "Advanced"
  },
  python: {
    id: "python",
    title: "Python",
    file: "python.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    description: "Pythonic idioms, Generators, Decorators, Concurrency, Asyncio & GIL",
    color: "#3776ab",
    difficulty: "Core"
  },
  java: {
    id: "java",
    title: "Java",
    file: "java.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>`,
    description: "JVM internals, Collections, Multithreading, Generics, Lambdas & Streams",
    color: "#e76f00",
    difficulty: "Core"
  },
  backend: {
    id: "backend",
    title: "Backend Development",
    file: "backend.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,
    description: "Architecture patterns, Caching, Message Queues, Authentication & Microservices",
    color: "#10b981",
    difficulty: "Specialized"
  },
  "rest-apis": {
    id: "rest-apis",
    title: "REST APIs",
    file: "backend.json",
    filter: (q) => q.subtopic === "REST Architecture" || (q.question && (q.question.includes("HTTP") || q.question.includes("REST") || q.question.includes("Status") || q.question.includes("Endpoint"))),
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`,
    description: "HTTP verbs, Status codes, Idempotency, Rate limiting, CORS & API design",
    color: "#06b6d4",
    difficulty: "Core"
  },
  sql: {
    id: "sql",
    title: "SQL and Databases",
    file: "sql.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
    description: "Complex queries, Indexes, Normalization, ACID transactions & Query optimization",
    color: "#00758f",
    difficulty: "Core"
  },
  os: {
    id: "os",
    title: "Operating Systems",
    file: "os.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
    description: "Processes, Threads, Virtual Memory, Paging, Deadlocks & File Systems",
    color: "#6366f1",
    difficulty: "Foundational"
  },
  networks: {
    id: "networks",
    title: "Computer Networks",
    file: "networks.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    description: "OSI model, TCP/IP, DNS, TLS Handshake, WebSockets & CDN routing",
    color: "#3b82f6",
    difficulty: "Core"
  },
  oop: {
    id: "oop",
    title: "Object-Oriented Programming",
    file: "oop.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    description: "Encapsulation, Polymorphism, Inheritance, SOLID principles & Design patterns",
    color: "#a855f7",
    difficulty: "Core"
  },
  cybersecurity: {
    id: "cybersecurity",
    title: "Cybersecurity",
    file: "security.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    description: "OWASP Top 10, XSS, CSRF, Cryptography, JWT, OAuth 2.0 & Defense in depth",
    color: "#ef4444",
    difficulty: "Specialized"
  },
  devops: {
    id: "devops",
    title: "Git and DevOps",
    file: "devops.json",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/></svg>`,
    description: "Git branching, Rebasing, Docker containers, CI/CD pipelines & Infrastructure",
    color: "#14b8a6",
    difficulty: "Specialized"
  }
};

const ALL_DATA_FILES = [
  "html.json",
  "css.json",
  "javascript.json",
  "typescript.json",
  "react.json",
  "nextjs.json",
  "python.json",
  "java.json",
  "dsa.json",
  "algorithms.json",
  "sql.json",
  "backend.json",
  "os.json",
  "networks.json",
  "oop.json",
  "security.json",
  "devops.json",
  "cs-fundamentals.json"
];

const QuestionService = (function () {
  // In-memory cache of parsed questions
  let _fileCache = {};
  let _allQuestions = [];
  let _questionMap = new Map();
  let _categoryCache = {};
  let _isInitialized = false;
  let _loadPromise = null;

  async function loadData() {
    if (_isInitialized) return _allQuestions;
    if (_loadPromise) return _loadPromise;

    _loadPromise = (async () => {
      try {
        const fetchPromises = ALL_DATA_FILES.map(async (filename) => {
          try {
            const res = await fetch(`./data/${filename}`);
            if (!res.ok) {
              console.warn(`Failed to fetch ./data/${filename}: HTTP ${res.status}`);
              return { filename, data: [] };
            }
            const data = await res.json();
            return { filename, data: Array.isArray(data) ? data : [] };
          } catch (err) {
            console.warn(`Error loading ./data/${filename}:`, err);
            return { filename, data: [] };
          }
        });

        const results = await Promise.all(fetchPromises);
        _allQuestions = [];
        _questionMap.clear();
        _fileCache = {};
        _categoryCache = {};

        results.forEach(({ filename, data }) => {
          _fileCache[filename] = data;
          data.forEach((q) => {
            // Normalize category ID reference
            const normQ = {
              ...q,
              category: getCategoryIdForQuestion(q)
            };
            _allQuestions.push(normQ);
            _questionMap.set(normQ.id, normQ);
          });
        });

        _isInitialized = true;
        console.log(`[QuestionService] Successfully initialized ${_allQuestions.length} technical questions across ${ALL_DATA_FILES.length} datasets.`);
        return _allQuestions;
      } catch (err) {
        console.error("[QuestionService] Initialization failure:", err);
        return [];
      }
    })();

    return _loadPromise;
  }

  function getCategoryIdForQuestion(q) {
    if (!q || !q.topic) return "other";
    const topic = q.topic.toLowerCase();
    if (topic.includes("html")) return "html";
    if (topic === "css") return "css";
    if (topic.includes("javascript")) {
      return (q.difficulty === "hard" || (q.subtopic && q.subtopic.includes("Event Loop"))) ? "js-advanced" : "js-fundamentals";
    }
    if (topic.includes("typescript")) return "typescript";
    if (topic.includes("react")) return "react";
    if (topic.includes("next")) return "nextjs";
    if (topic.includes("data structure")) return "dsa";
    if (topic.includes("algorithm")) return "algorithms";
    if (topic.includes("python")) return "python";
    if (topic.includes("java") && !topic.includes("script")) return "java";
    if (topic.includes("sql") || topic.includes("database")) return "sql";
    if (topic.includes("operating system")) return "os";
    if (topic.includes("network")) return "networks";
    if (topic.includes("oop")) return "oop";
    if (topic.includes("security") || topic.includes("cyber")) return "cybersecurity";
    if (topic.includes("devops") || topic.includes("git")) return "devops";
    if (topic.includes("backend")) return "backend";
    return "other";
  }

  function getAllQuestions() {
    return _allQuestions;
  }

  function getCategories() {
    return CATEGORIES;
  }

  function getQuestionsByCategory(categoryId) {
    if (!categoryId || categoryId === "all") return _allQuestions;

    if (_categoryCache[categoryId]) {
      return _categoryCache[categoryId];
    }

    const conf = CATEGORIES[categoryId];
    if (!conf) {
      // Fallback: search by question's mapped category property
      const matched = _allQuestions.filter((q) => q.category === categoryId);
      _categoryCache[categoryId] = matched;
      return matched;
    }

    let result = [];
    if (conf.files) {
      conf.files.forEach((f) => {
        if (_fileCache[f]) result.push(..._fileCache[f]);
      });
    } else if (conf.file && _fileCache[conf.file]) {
      result = [..._fileCache[conf.file]];
    } else {
      result = _allQuestions.filter((q) => q.category === categoryId);
    }

    if (conf.filter && typeof conf.filter === "function") {
      result = result.filter(conf.filter);
    }

    _categoryCache[categoryId] = result;
    return result;
  }

  function getCategoryStats(categoryId) {
    const list = getQuestionsByCategory(categoryId);
    const total = list.length;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    list.forEach((q) => {
      const diff = (q.difficulty || "medium").toLowerCase();
      if (diff === "easy") easy++;
      else if (diff === "hard") hard++;
      else medium++;
    });

    return { total, easy, medium, hard };
  }

  function getQuestionById(id) {
    return _questionMap.get(id) || null;
  }

  function getDailyChallengeQuestions(count = 5) {
    if (_allQuestions.length === 0) return [];
    // Seed random selection based on current calendar date string
    const todayStr = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }

    const shuffled = [..._allQuestions].sort((a, b) => {
      const hA = (hash ^ a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
      const hB = (hash ^ b.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
      return hA - hB;
    });

    return shuffled.slice(0, count);
  }

  function getQuestionsByFilter({ topic = "all", difficulty = "all", search = "", subtopic = "all", type = "all" } = {}) {
    let pool = getQuestionsByCategory(topic);

    if (difficulty && difficulty !== "all") {
      const diffLower = difficulty.toLowerCase();
      pool = pool.filter((q) => (q.difficulty || "").toLowerCase() === diffLower);
    }

    if (subtopic && subtopic !== "all") {
      pool = pool.filter((q) => q.subtopic === subtopic);
    }

    if (type && type !== "all") {
      pool = pool.filter((q) => (q.type || "mcq") === type);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      pool = pool.filter((item) => {
        return (
          item.question.toLowerCase().includes(q) ||
          (item.explanation && item.explanation.toLowerCase().includes(q)) ||
          (item.topic && item.topic.toLowerCase().includes(q)) ||
          (item.subtopic && item.subtopic.toLowerCase().includes(q)) ||
          (Array.isArray(item.options) && item.options.some((opt) => opt.toLowerCase().includes(q)))
        );
      });
    }

    return pool;
  }

  // Check external provider / backend status
  async function checkProviderStatus() {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        configured: false,
        provider: "none",
        message: "Server running in local mode (using 5,200 verified questions)"
      };
    }
  }

  // Request live fresh technical questions from backend (Groq LLaMA / QuizAPI)
  async function generateLiveQuestions({ topic = "JavaScript", difficulty = "Medium", count = 5, subtopic = "" } = {}) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count, subtopic })
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        return {
          success: false,
          code: data.code || "API_ERROR",
          message: data.message || (data.error ? `Generation error: ${data.error}` : "Unable to generate questions from external service."),
          fallbackAvailable: true
        };
      }

      const generated = data.questions || [];
      // Normalize and add to memory map
      const normalized = generated.map((q, idx) => {
        const normQ = {
          ...q,
          id: q.id || `live-${Date.now()}-${idx}`,
          category: getCategoryIdForQuestion(q),
          isLiveGenerated: true
        };
        _questionMap.set(normQ.id, normQ);
        return normQ;
      });

      return {
        success: true,
        provider: data.provider || "groq",
        model: data.model || "",
        questions: normalized
      };
    } catch (err) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: `Connection error: ${err.message}. Ensure the local server is running.`,
        fallbackAvailable: true
      };
    }
  }

  return {
    init: loadData,
    isLoaded: () => _isInitialized,
    getAllQuestions,
    getCategories,
    getQuestionsByCategory,
    getCategoryStats,
    getQuestionById,
    getDailyChallengeQuestions,
    getQuestionsByFilter,
    checkProviderStatus,
    generateLiveQuestions
  };
})();

