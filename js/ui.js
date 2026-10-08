/* ============================================
   UI.JS — Quiz App DOM Rendering
   ============================================
   Purpose: Handles ALL visual updates for the quiz.
   
   This file reads data from state.js and updates the DOM.
   It does NOT modify the quiz state directly.
   ============================================ */

// renderQuestion() - Displays the current question and its options on screen
function renderQuestion() {
  const quizContainer = document.getElementById("quiz-container");
  const currentQuestion = getCurrentQuestion();
  const questionNumber = quizState.currentQuestionIndex + 1;
  const totalQuestions = quizQuestions.length;

  // Build the question HTML
  let optionsHTML = "";
  for (let i = 0; i < currentQuestion.options.length; i++) {
    // Escape HTML characters so tags like <a> render as text, not actual DOM elements
    const safeText = currentQuestion.options[i].replace(/</g, "&lt;").replace(/>/g, "&gt;");
    optionsHTML += `
      <button class="option-btn" data-index="${i}">
        ${safeText}
      </button>
    `;
  }

  quizContainer.innerHTML = `
    <div class="quiz-progress">
      Question ${questionNumber} of ${totalQuestions}
    </div>
    <div class="quiz-score">
      Score: ${quizState.score}
    </div>
    <h2 class="quiz-question">${currentQuestion.question}</h2>
    <div class="options-container">
      ${optionsHTML}
    </div>
    <button class="btn btn-primary next-btn" id="next-btn" style="display: none;">
      Next Question →
    </button>
  `;

  // Add click listeners to each option button
  const optionButtons = quizContainer.querySelectorAll(".option-btn");
  optionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      handleAnswerClick(button);
    });
  });
}

// handleAnswerClick() - Handles when user clicks an answer option
function handleAnswerClick(button) {
  // Get which option was clicked (0, 1, 2, or 3)
  const selectedIndex = parseInt(button.getAttribute("data-index"));

  // Record the answer in state (returns true if correct)
  const isCorrect = selectAnswer(selectedIndex);

  // Get all option buttons to highlight correct/incorrect
  const allButtons = document.querySelectorAll(".option-btn");
  const currentQuestion = getCurrentQuestion();

  // Loop through all options and add visual feedback
  allButtons.forEach(function (btn) {
    const btnIndex = parseInt(btn.getAttribute("data-index"));

    // Disable all buttons after answering
    btn.disabled = true;

    // Highlight the correct answer in green
    if (btnIndex === currentQuestion.correctAnswer) {
      btn.classList.add("correct");
    }

    // If user selected a wrong answer, highlight it in red
    if (btnIndex === selectedIndex && !isCorrect) {
      btn.classList.add("incorrect");
    }
  });

  // Update the score display
  const scoreDisplay = document.querySelector(".quiz-score");
  scoreDisplay.textContent = "Score: " + quizState.score;

  // Show the "Next Question" button (or "See Results" if last question)
  const nextButton = document.getElementById("next-btn");
  nextButton.style.display = "block";

  // Change button text if this is the last question
  if (quizState.currentQuestionIndex === quizQuestions.length - 1) {
    nextButton.textContent = "See Results →";
  }

  // Add click listener to the Next button
  nextButton.addEventListener("click", function () {
    moveToNextQuestion();

    if (quizState.isFinished) {
      renderResults();
    } else {
      renderQuestion();
    }
  });
}

// renderResults() - Displays the final quiz results screen
function renderResults() {
  const quizContainer = document.getElementById("quiz-container");
  const percentage = calculatePercentage();
  const totalQuestions = quizQuestions.length;

  // Choose a message based on the score
  let message = "";
  if (percentage >= 80) {
    message = "Excellent! You really know your stuff!";
  } else if (percentage >= 60) {
    message = "Good job! Keep learning!";
  } else if (percentage >= 40) {
    message = "Not bad! Review the topics and try again.";
  } else {
    message = "Keep practicing! You will get better.";
  }

  quizContainer.innerHTML = `
    <div class="results-container">
      <h2>Quiz Complete!</h2>
      <div class="results-score">
        ${quizState.score} / ${totalQuestions}
      </div>
      <div class="results-percentage">
        ${percentage}%
      </div>
      <p class="results-message">${message}</p>
      <button class="btn btn-primary" id="restart-btn">
        Restart Quiz
      </button>
    </div>
  `;

  // Add click listener to restart button
  const restartButton = document.getElementById("restart-btn");
  restartButton.addEventListener("click", function () {
    // Reset the state and re-render the first question
    resetQuizState();
    renderQuestion();
  });
}

// renderStartScreen() - Displays the initial start screen before the quiz begins
function renderStartScreen() {
  const quizContainer = document.getElementById("quiz-container");

  quizContainer.innerHTML = `
    <div class="start-screen">
      <h2>Welcome to the Quiz!</h2>
      <p>Test your knowledge of HTML, CSS, and JavaScript fundamentals.</p>
      <p><strong>${quizQuestions.length} questions</strong> • Multiple choice</p>
      <button class="btn btn-primary" id="start-btn">
        Start Quiz
      </button>
    </div>
  `;

  const startButton = document.getElementById("start-btn");
  startButton.addEventListener("click", function () {
    resetQuizState();
    renderQuestion();
  });
}
