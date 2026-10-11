/* ============================================
   STATE.JS — QuizePro State Management
   ============================================ */

const quizState = {
  // Navigation Tabs: 'hub' | 'explore' | 'performance' | 'custom' | 'bookmarks'
  activeTab: "hub",

  // Quiz Hub Filters & Config
  hubSearchQuery: "",
  activeCategory: "all",
  activeDifficulty: "all",
  isTimedMode: true,
  timeLimitPerQuestion: 20, // seconds

  // Explore Page Independent Filters
  exploreSearchQuery: "",
  exploreCategory: "all",
  exploreDifficulty: "all",
  exploreSort: "count", // 'count' | 'name' | 'difficulty'

  // Active Quiz Run State
  quizMode: "standard", // 'standard' | 'daily' | 'practice_incorrect' | 'study_bank' | 'custom'
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
  userAnswers: [], // Array of { question, selectedIndex, isCorrect, timedOut, skipped }

  // Timer
  timerSecondsRemaining: 20,
  timerInterval: null,

  // Lifelines
  lifelines: {
    fiftyFifty: true,
    hint: true,
    skip: true
  },
  disabledOptions: [],
  hintVisible: false,

  // Custom Quiz Builder State
  editingCustomId: null
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

// Prepares questions for a new standard quiz run
function initializeStandardQuiz(category = "all", difficulty = "all", count = 10) {
  let pool = QuestionService.getAllQuestions();

  if (category && category !== "all") {
    pool = pool.filter((q) => q.category === category);
  }

  if (difficulty && difficulty !== "all") {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  if (pool.length === 0) {
    pool = QuestionService.getAllQuestions();
  }

  quizState.quizMode = "standard";
  quizState.quizTitle = category !== "all" && CATEGORIES[category] 
    ? `${CATEGORIES[category].title} Quiz` 
    : "Comprehensive Tech Quiz";
  quizState.questions = shuffleArray(pool).slice(0, count);
  resetQuizRunState();
}

// Prepares Daily Challenge
function initializeDailyChallengeQuiz() {
  const dailyQs = QuestionService.getDailyChallengeQuestions();
  quizState.quizMode = "daily";
  quizState.quizTitle = "Daily Code Challenge";
  quizState.questions = dailyQs;
  resetQuizRunState();
}

// Prepares Practice Incorrect Quiz from missed questions
function initializePracticeIncorrectQuiz(missedQuestions) {
  if (!missedQuestions || missedQuestions.length === 0) return false;
  quizState.quizMode = "practice_incorrect";
  quizState.quizTitle = "Mistake Revision Drill";
  quizState.questions = shuffleArray(missedQuestions);
  resetQuizRunState();
  return true;
}

// Prepares Study Bank Quiz from bookmarked questions
function initializeStudyBankQuiz() {
  const bookmarks = Storage.getBookmarks();
  if (bookmarks.length === 0) return false;
  quizState.quizMode = "study_bank";
  quizState.quizTitle = "Study Bank Revision";
  quizState.questions = shuffleArray(bookmarks);
  resetQuizRunState();
  return true;
}

// Prepares Custom Quiz from user questions
function initializeCustomQuiz() {
  const customQs = Storage.getCustomQuestions();
  if (customQs.length === 0) return false;
  quizState.quizMode = "custom";
  quizState.quizTitle = "Custom User Quiz";
  quizState.questions = shuffleArray(customQs);
  resetQuizRunState();
  return true;
}

function resetQuizRunState() {
  quizState.currentQuestionIndex = 0;
  quizState.score = 0;
  quizState.currentStreak = 0;
  quizState.maxStreak = 0;
  quizState.selectedAnswer = null;
  quizState.isAnswered = false;
  quizState.isFinished = false;
  quizState.startTime = Date.now();
  quizState.elapsedTimeSec = 0;
  quizState.userAnswers = [];

  quizState.lifelines = {
    fiftyFifty: true,
    hint: true,
    skip: true
  };
  quizState.disabledOptions = [];
  quizState.hintVisible = false;

  stopQuizTimer();
  quizState.timerSecondsRemaining = quizState.timeLimitPerQuestion;
}

function startQuizTimer(onTick, onTimeOut) {
  stopQuizTimer();
  if (!quizState.isTimedMode) return;

  quizState.timerSecondsRemaining = quizState.timeLimitPerQuestion;
  if (onTick) onTick(quizState.timerSecondsRemaining);

  quizState.timerInterval = setInterval(() => {
    quizState.timerSecondsRemaining -= 1;
    if (onTick) onTick(quizState.timerSecondsRemaining);

    if (quizState.timerSecondsRemaining <= 0) {
      stopQuizTimer();
      if (onTimeOut) onTimeOut();
    }
  }, 1000);
}

function stopQuizTimer() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
    quizState.timerInterval = null;
  }
}

function getCurrentQuestion() {
  if (!quizState.questions || quizState.questions.length === 0) return null;
  return quizState.questions[quizState.currentQuestionIndex] || null;
}

function selectAnswer(selectedIndex) {
  if (quizState.isAnswered) return null;

  stopQuizTimer();
  quizState.selectedAnswer = selectedIndex;
  quizState.isAnswered = true;

  const currentQ = getCurrentQuestion();
  if (!currentQ) return false;

  const isCorrect = selectedIndex === currentQ.correctAnswer;

  if (isCorrect) {
    quizState.score += 1;
    quizState.currentStreak += 1;
    if (quizState.currentStreak > quizState.maxStreak) {
      quizState.maxStreak = quizState.currentStreak;
    }
  } else {
    quizState.currentStreak = 0;
  }

  // Record user answer
  quizState.userAnswers.push({
    question: currentQ,
    selectedIndex: selectedIndex,
    isCorrect: isCorrect,
    timedOut: selectedIndex === -1
  });

  return isCorrect;
}

function useFiftyFiftyLifeline() {
  if (!quizState.lifelines.fiftyFifty || quizState.isAnswered) return false;
  const currentQ = getCurrentQuestion();
  if (!currentQ || !currentQ.options || currentQ.options.length < 4) return false;

  const wrongIndices = [];
  for (let i = 0; i < currentQ.options.length; i++) {
    if (i !== currentQ.correctAnswer) {
      wrongIndices.push(i);
    }
  }

  const shuffledWrong = shuffleArray(wrongIndices);
  quizState.disabledOptions = shuffledWrong.slice(0, 2);
  quizState.lifelines.fiftyFifty = false;
  return true;
}

function useHintLifeline() {
  if (!quizState.lifelines.hint || quizState.isAnswered) return false;
  quizState.hintVisible = true;
  quizState.lifelines.hint = false;
  return true;
}

function useSkipLifeline() {
  if (!quizState.lifelines.skip || quizState.isAnswered) return false;
  quizState.lifelines.skip = false;
  const currentQ = getCurrentQuestion();
  if (currentQ) {
    quizState.userAnswers.push({
      question: currentQ,
      selectedIndex: -1,
      isCorrect: false,
      skipped: true
    });
  }
  moveToNextQuestion();
  return true;
}

function moveToNextQuestion() {
  stopQuizTimer();
  quizState.currentQuestionIndex += 1;
  quizState.selectedAnswer = null;
  quizState.isAnswered = false;
  quizState.disabledOptions = [];
  quizState.hintVisible = false;

  if (quizState.currentQuestionIndex >= quizState.questions.length) {
    quizState.isFinished = true;
    quizState.elapsedTimeSec = Math.round((Date.now() - quizState.startTime) / 1000);
  }
}

function calculatePercentage() {
  if (!quizState.questions || quizState.questions.length === 0) return 0;
  return Math.round((quizState.score / quizState.questions.length) * 100);
}
