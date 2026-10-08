/* ============================================
   STATE.JS — Quiz Application State
   ============================================
   Purpose: Contains the quiz data (questions) and manages
            the quiz state (current question, score, etc.)
   
   This file is the "brain" of the quiz.
   It stores data but does NOT touch the DOM.
   ============================================ */

// quizQuestions - Array of quiz question objects
// Each question has: question (text), options (array of 4), correctAnswer (index 0-3)
const quizQuestions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correctAnswer: 0
  },
  {
    question: "Which CSS property is used to change text color?",
    options: [
      "font-color",
      "text-color",
      "color",
      "foreground-color"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the correct way to declare a JavaScript variable?",
    options: [
      "variable name = value;",
      "var name = value;",
      "v name = value;",
      "declare name = value;"
    ],
    correctAnswer: 1
  },
  {
    question: "Which HTML tag is used to create a hyperlink?",
    options: [
      "<link>",
      "<href>",
      "<a>",
      "<url>"
    ],
    correctAnswer: 2
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Cascading Style Sheets",
      "Creative Style System",
      "Colorful Style Sheets"
    ],
    correctAnswer: 1
  },
  {
    question: "Which JavaScript method is used to select an element by its ID?",
    options: [
      "getElement()",
      "querySelector()",
      "getElementById()",
      "findElement()"
    ],
    correctAnswer: 2
  },
  {
    question: "What is the correct CSS syntax to make text bold?",
    options: [
      "text-weight: bold;",
      "font-weight: bold;",
      "text-style: bold;",
      "font-bold: true;"
    ],
    correctAnswer: 1
  },
  {
    question: "Which event fires when a user clicks on an HTML element?",
    options: [
      "onhover",
      "onchange",
      "onclick",
      "onpress"
    ],
    correctAnswer: 2
  },
  {
    question: "What is localStorage in JavaScript?",
    options: [
      "A server-side database",
      "A way to store data in the browser that persists",
      "A temporary variable storage",
      "A type of cookie"
    ],
    correctAnswer: 1
  },
  {
    question: "Which array method creates a new array with filtered elements?",
    options: [
      "map()",
      "forEach()",
      "reduce()",
      "filter()"
    ],
    correctAnswer: 3
  }
];

// quizState - Object that tracks the current state of the quiz
// currentQuestionIndex: which question we're on (starts at 0)
// score: how many correct answers so far
// selectedAnswer: which option the user clicked (null if none yet)
// isAnswered: whether the current question has been answered
// isFinished: whether the quiz is complete
let quizState = {
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswer: null,
  isAnswered: false,
  isFinished: false
};

// resetQuizState() - Resets the quiz state to start over
function resetQuizState() {
  quizState.currentQuestionIndex = 0;
  quizState.score = 0;
  quizState.selectedAnswer = null;
  quizState.isAnswered = false;
  quizState.isFinished = false;
}

// getCurrentQuestion() - Gets the current question object
function getCurrentQuestion() {
  return quizQuestions[quizState.currentQuestionIndex];
}

// selectAnswer() - Records the user's answer and checks if it's correct
function selectAnswer(selectedIndex) {
  // Don't allow changing answer after already answered
  if (quizState.isAnswered) {
    return false;
  }

  quizState.selectedAnswer = selectedIndex;
  quizState.isAnswered = true;

  // Check if the selected answer matches the correct answer
  const currentQuestion = getCurrentQuestion();
  const isCorrect = selectedIndex === currentQuestion.correctAnswer;

  // If correct, add 1 to the score
  if (isCorrect) {
    quizState.score = quizState.score + 1;
  }

  return isCorrect;
}

// moveToNextQuestion() - Advances to the next question
function moveToNextQuestion() {
  quizState.currentQuestionIndex = quizState.currentQuestionIndex + 1;
  quizState.selectedAnswer = null;
  quizState.isAnswered = false;

  // Check if we've reached the end of the questions
  if (quizState.currentQuestionIndex >= quizQuestions.length) {
    quizState.isFinished = true;
  }
}

// calculatePercentage() - Calculates the final score as a percentage
function calculatePercentage() {
  const totalQuestions = quizQuestions.length;
  const percentage = (quizState.score / totalQuestions) * 100;
  return Math.round(percentage);
}
