# Interactive Quiz App
An interactive and responsive quiz application built using **HTML, CSS, and JavaScript**. The application allows users to test their knowledge through multiple-choice questions, receive instant feedback, track their score, and switch between light and dark themes.

---

## Features

- Interactive multiple-choice quiz
- Real-time score tracking
- Question progress indicator
- Instant answer validation
- Final results screen
- Restart quiz functionality
- Dark/Light theme toggle
- Theme preference saved using Local Storage
- Responsive design for desktop and mobile devices
- Mobile navigation menu support

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Local Storage API

---

## Project Structure

```text
interactive-quiz-app-main/
│
├── index.html
│
├── css/
│   ├── global.css
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── state.js
│   ├── theme.js
│   └── ui.js
│
└── README.md
```

---

## File Description

### index.html
Main entry point of the application containing the page structure, navigation bar, and quiz container.

### css/global.css
Contains:
- CSS reset
- Global variables
- Theme colors
- Utility classes
- Responsive styles

### css/style.css
Contains styling for:
- Quiz interface
- Question cards
- Option buttons
- Result screen
- Progress indicators

### js/state.js
Manages:
- Quiz questions
- Current question index
- User score
- Quiz state

### js/ui.js
Handles:
- Rendering quiz screens
- Displaying questions
- Updating UI components
- Showing results

### js/theme.js
Provides:
- Dark/Light mode functionality
- Theme persistence using Local Storage
- Mobile menu interactions

### js/main.js
Initializes the application when the page loads.

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/interactive-quiz-app.git
```

### 2. Navigate to the Project Directory

```bash
cd interactive-quiz-app
```

### 3. Open the Application

Simply open:

```text
index.html
```

in any modern web browser.

No additional installation or dependencies are required.

---

## Quiz Workflow

1. User opens the application.
2. Start screen is displayed.
3. User clicks **Start Quiz**.
4. Questions appear one by one.
5. User selects an answer.
6. The application validates the answer instantly.
7. Score and progress are updated.
8. Final results are shown after all questions are completed.
9. User can restart the quiz and try again.

---

## Key Concepts Demonstrated

- DOM Manipulation
- Event Handling
- State Management
- Modular JavaScript Architecture
- Responsive Web Design
- Local Storage Integration
- Theme Switching

---

## Future Enhancements

- Timer for each question
- Difficulty levels
- Randomized questions
- Category-based quizzes
- Leaderboard system
- User authentication
- API-based question fetching

---

## Author

Zahid Shaikh

---

## License

This project is licensed under the MIT License.
