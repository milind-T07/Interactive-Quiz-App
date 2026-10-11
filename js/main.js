/* ============================================
   MAIN.JS — Application Entry Point & Event Wiring
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Initialize Navigation and View
  UI.renderNavigation();
  UI.renderActiveView();

  // 2. Brand Link Home Navigation
  const brandLink = document.getElementById("brand-home-link");
  if (brandLink) {
    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      UI.switchTab("hub");
    });
  }

  // 3. Sound Effects Toggle
  const soundBtn = document.getElementById("sound-toggle-btn");
  if (soundBtn && typeof SoundEngine !== "undefined") {
    soundBtn.addEventListener("click", () => {
      const isMuted = SoundEngine.toggleMute();
      UI.updateHeaderActions();
      UI.showToast(isMuted ? "Sound muted" : "Sound effects enabled", "info");
      if (!isMuted) {
        SoundEngine.click();
      }
    });
  }

  // 4. Theme Toggle
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn && typeof ThemeManager !== "undefined") {
    themeBtn.addEventListener("click", () => {
      const next = ThemeManager.toggleTheme();
      UI.showToast(`Switched to ${next} theme`, "info");
    });
  }

  // 5. Mobile Navigation Drawer
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawerOverlay = document.getElementById("mobile-drawer-overlay");
  const mobileCloseBtn = document.getElementById("mobile-close-btn");

  if (mobileMenuBtn && mobileDrawerOverlay) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileDrawerOverlay.classList.add("open");
      mobileMenuBtn.setAttribute("aria-expanded", "true");
    });
  }

  if (mobileCloseBtn && mobileDrawerOverlay) {
    mobileCloseBtn.addEventListener("click", () => {
      mobileDrawerOverlay.classList.remove("open");
      if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
    });
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener("click", (e) => {
      if (e.target === mobileDrawerOverlay) {
        mobileDrawerOverlay.classList.remove("open");
        if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 6. Keyboard Shortcuts Handler
  document.addEventListener("keydown", function (e) {
    // Escape key closes mobile drawer or active modals if open
    if (e.key === "Escape") {
      if (mobileDrawerOverlay && mobileDrawerOverlay.classList.contains("open")) {
        mobileDrawerOverlay.classList.remove("open");
        return;
      }
      const dialog = document.getElementById("confirm-dialog");
      if (dialog && dialog.open) {
        dialog.close();
        return;
      }
    }

    // Quiz Runner Keyboard navigation
    const isQuizActive = quizState.activeTab === "hub" && 
      quizState.questions.length > 0 && 
      !quizState.isFinished;

    if (!isQuizActive) return;

    // Do not capture keyboard if user is typing in an input or textarea
    const activeTagName = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (activeTagName === "input" || activeTagName === "textarea") return;

    const key = e.key;
    const currentQ = getCurrentQuestion();
    if (!currentQ) return;

    // Keys 1, 2, 3, 4 or A, B, C, D to select answers
    if (!quizState.isAnswered) {
      let selectedIdx = -1;
      if (key === "1" || key === "a" || key === "A") selectedIdx = 0;
      else if (key === "2" || key === "b" || key === "B") selectedIdx = 1;
      else if (key === "3" || key === "c" || key === "C") selectedIdx = 2;
      else if (key === "4" || key === "d" || key === "D") selectedIdx = 3;

      if (selectedIdx >= 0 && selectedIdx < currentQ.options.length) {
        if (!quizState.disabledOptions.includes(selectedIdx)) {
          e.preventDefault();
          const optionBtn = document.querySelector(`.option-btn[data-index="${selectedIdx}"]`);
          if (optionBtn) optionBtn.click();
        }
      }
    } else {
      // Space or Enter key to proceed to Next Question
      if (key === " " || key === "Enter") {
        e.preventDefault();
        const nextBtn = document.getElementById("quiz-next-btn");
        if (nextBtn) nextBtn.click();
      }
    }
  });
});
