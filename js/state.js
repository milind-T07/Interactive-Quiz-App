/* ============================================================
   STATE.JS — Quiz Engine State Machine & Mode Orchestrator
   ============================================================ */

const quizState = {
  // Navigation Tabs: 'hub' | 'explore' | 'performance' | 'bookmarks'
  activeTab: "hub",

  // Quiz Hub & Explorer Filters
  hubSearchQuery: "",
  activeCategory: "all",
  activeDifficulty: "all",
  isTimedMode: true,
  timeLimitPerQuestion: 20, // seconds

  // Explore Page State
  exploreSearchQuery: "",
  exploreCategory: "all",
  exploreDifficulty: "all",
  exploreSort: "relevance", // 'relevance' | 'difficulty' | 'topic'
  exploreCurrentPage: 1,
  explorePageSize: 20,

  // Active Quiz Run State
  quizMode: "practice", // 'practice' (instant feedback) | 'exam' (hidden until final submit)
  quizSource: "standard", // 'standard' | 'daily' | 'explore' | 'study_bank' | 'missed'
  quizTitle: "Technical Assessment",
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  currentStreak: 0,
  maxStreak: 0,
  selectedAnswer: null,
  isAnswered: false,
  isFinished: false,
  startTime: null,
  elapsedTimeSec: 0,
  userAnswers: [], // Array of { question, selectedIndex, isCorrect, isUnanswered, hintRevealed, timestamp }
  flaggedIndices: new Set(),

  // Timer
  timerSecondsRemaining: 20,
  timerInterval: null,

  // Lifelines (Practice Mode)
  lifelines: {
    fiftyFifty: true,
    hint: true,
    skip: true
  },
  disabledOptions: [],
  hintVisible: false
};

// Shuffles array in-place (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Resets internal run timers and trackers
function resetQuizRunState() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
    quizState.timerInterval = null;
  }

  quizState.currentQuestionIndex = 0;
  quizState.score = 0;
  quizState.currentStreak = 0;
  quizState.maxStreak = 0;
  quizState.selectedAnswer = null;
  quizState.isAnswered = false;
  quizState.isFinished = false;
  quizState.startTime = Date.now();
  quizState.elapsedTimeSec = 0;
  quizState.flaggedIndices = new Set();
  quizState.disabledOptions = [];
  quizState.hintVisible = false;

  // Initialize placeholder for each question answer
  quizState.userAnswers = quizState.questions.map((q) => ({
    question: q,
    selectedIndex: null,
    isCorrect: false,
    isUnanswered: true,
    hintRevealed: false
  }));

  quizState.lifelines = {
    fiftyFifty: true,
    hint: true,
    skip: true
  };

  quizState.timerSecondsRemaining = quizState.timeLimitPerQuestion;
}

// Prepares standard category quiz run
function initializeStandardQuiz(category = "all", difficulty = "all", count = 10, mode = "practice") {
  let pool = QuestionService.getQuestionsByCategory(category);

  if (difficulty && difficulty !== "all") {
    pool = pool.filter((q) => (q.difficulty || "").toLowerCase() === difficulty.toLowerCase());
  }

  if (pool.length === 0) {
    pool = QuestionService.getAllQuestions();
  }

  const categoryTitle = category !== "all" && CATEGORIES[category] ? CATEGORIES[category].title : "Comprehensive Platform";
  quizState.quizSource = "standard";
  quizState.quizMode = mode;
  quizState.activeCategory = category;
  quizState.activeDifficulty = difficulty;
  quizState.quizTitle = `${categoryTitle} ${mode === "exam" ? "Exam" : "Practice"}`;

  const availableCount = Math.min(pool.length, count === "all" ? pool.length : parseInt(count, 10) || 10);
  quizState.questions = shuffleArray(pool).slice(0, availableCount);

  resetQuizRunState();
}

// Prepares custom configured quiz run from dialog
function initializeConfiguredQuiz({
  category = "all",
  difficulty = "all",
  count = 10,
  isTimed = true,
  timeLimit = 20,
  mode = "practice",
  shuffle = true
} = {}) {
  let pool = QuestionService.getQuestionsByCategory(category);

  if (difficulty && difficulty !== "all") {
    pool = pool.filter((q) => (q.difficulty || "").toLowerCase() === difficulty.toLowerCase());
  }

  if (pool.length === 0) {
    pool = QuestionService.getAllQuestions();
  }

  const categoryTitle = category !== "all" && CATEGORIES[category] ? CATEGORIES[category].title : "All Topics";
  const numQuestions = count === "all" ? pool.length : Math.min(pool.length, parseInt(count, 10) || 10);

  quizState.quizSource = "standard";
  quizState.quizMode = mode;
  quizState.activeCategory = category;
  quizState.activeDifficulty = difficulty;
  quizState.isTimedMode = Boolean(isTimed && timeLimit > 0);
  quizState.timeLimitPerQuestion = parseInt(timeLimit, 10) || 20;
  quizState.quizTitle = `${categoryTitle} (${numQuestions} Qs ${mode === "exam" ? "Exam" : "Practice"})`;

  const selectedPool = shuffle ? shuffleArray(pool) : [...pool];
  quizState.questions = selectedPool.slice(0, numQuestions);

  resetQuizRunState();
}

// Prepares quiz from an arbitrary list of questions (Explore results, Saved questions, Missed items)
function initializeQuizFromQuestions(questionsList, title = "Custom Quiz Drill", mode = "practice", source = "explore") {
  if (!Array.isArray(questionsList) || questionsList.length === 0) {
    console.warn("Cannot initialize quiz from empty questions list.");
    return false;
  }

  quizState.quizSource = source;
  quizState.quizMode = mode;
  quizState.activeCategory = "custom";
  quizState.activeDifficulty = "mixed";
  quizState.quizTitle = title;
  quizState.questions = [...questionsList];

  resetQuizRunState();
  return true;
}

// Prepares 24-Hour Daily Challenge drill
function initializeDailyChallenge() {
  const dailyQs = QuestionService.getDailyChallengeQuestions(5);
  quizState.quizSource = "daily";
  quizState.quizMode = "exam";
  quizState.activeCategory = "daily";
  quizState.activeDifficulty = "mixed";
  quizState.isTimedMode = true;
  quizState.timeLimitPerQuestion = 30;
  quizState.quizTitle = "24-Hour Daily Challenge";
  quizState.questions = dailyQs;

  resetQuizRunState();
}

// Prepares drill targeting missed questions
function initializeMissedQuestionsQuiz(missedQuestions) {
  if (!missedQuestions || missedQuestions.length === 0) return false;
  return initializeQuizFromQuestions(
    missedQuestions,
    `Revision Drill (${missedQuestions.length} Questions)`,
    "practice",
    "missed"
  );
}

// Prepares drill from bookmarked Study Bank questions
function initializeStudyBankQuiz() {
  const bookmarks = Storage.getBookmarks();
  if (bookmarks.length === 0) return false;
  return initializeQuizFromQuestions(
    shuffleArray(bookmarks),
    `Study Bank Drill (${bookmarks.length} Saved Qs)`,
    "practice",
    "study_bank"
  );
}
