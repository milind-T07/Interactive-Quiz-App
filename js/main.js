/* ============================================================
   MAIN.JS — Application Entry Point & Global Event Orchestrator
   ============================================================ */

document.addEventListener("DOMContentLoaded", async function () {
  console.log("[QuizePro] Initializing application...");

  // 1. Initialize Question Bank from local JSON files
  try {
    await QuestionService.init();
  } catch (err) {
    console.error("[QuizePro] Failed to initialize QuestionService:", err);
  }

  // 2. Render Navigation and Initial View
  UI.renderNavigation();
  UI.renderActiveView();

  // 3. Brand Link Home Navigation
  const brandLink = document.getElementById("brand-home-link");
  if (brandLink) {
    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      UI.switchTab("hub");
    });
  }

  // 4. Sound Effects Toggle
  const soundBtn = document.getElementById("sound-toggle-btn");
  if (soundBtn && typeof SoundEngine !== "undefined") {
    soundBtn.addEventListener("click", () => {
      const isMuted = SoundEngine.toggleMute();
      UI.updateHeaderActions();
      UI.showToast(isMuted ? "Sound effects muted" : "Sound effects enabled", "info");
      if (!isMuted) {
        SoundEngine.click();
      }
    });
  }

  // 5. Theme Toggle
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn && typeof ThemeManager !== "undefined") {
    themeBtn.addEventListener("click", () => {
      const nextTheme = ThemeManager.toggleTheme();
      UI.updateHeaderActions();
      UI.showToast(`Switched to ${nextTheme} theme`, "info");
    });
  }

  // 6. Mobile Navigation Drawer
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

  // 7. Footer Navigation Links & Dynamic Copyright Year
  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  document.querySelectorAll(".footer-link[data-footer-tab]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.getAttribute("data-footer-tab");
      UI.switchTab(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // 8. Global Keyboard Shortcuts Handler
  document.addEventListener("keydown", function (e) {
    // Avoid intercepting input elements
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    // Escape closes modals or mobile drawer
    if (e.key === "Escape") {
      if (mobileDrawerOverlay && mobileDrawerOverlay.classList.contains("open")) {
        mobileDrawerOverlay.classList.remove("open");
        return;
      }
      const dialogs = ["confirm-dialog", "quiz-config-dialog", "goal-dialog", "backup-dialog"];
      for (const dId of dialogs) {
        const d = document.getElementById(dId);
        if (d && d.open) {
          d.close();
          return;
        }
      }
      return;
    }

    // Active Quiz Shortcuts
    if (quizState.questions.length > 0 && !quizState.isFinished) {
      // 1, 2, 3, 4 or A, B, C, D to pick options
      const keyUpper = e.key.toUpperCase();
      let optionIndex = -1;

      if (e.key === "1" || keyUpper === "A") optionIndex = 0;
      else if (e.key === "2" || keyUpper === "B") optionIndex = 1;
      else if (e.key === "3" || keyUpper === "C") optionIndex = 2;
      else if (e.key === "4" || keyUpper === "D") optionIndex = 3;

      if (optionIndex !== -1) {
        const optBtn = document.querySelector(`.quiz-opt-btn[data-opt-idx="${optionIndex}"]`);
        if (optBtn && !optBtn.disabled) {
          optBtn.click();
        }
        return;
      }

      // Enter or Space to advance or submit
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const nextBtn = document.getElementById("next-question-btn");
        const finishBtn = document.getElementById("finish-quiz-btn");
        if (nextBtn) nextBtn.click();
        else if (finishBtn) finishBtn.click();
        return;
      }

      // 'P' for previous question
      if (keyUpper === "P") {
        const prevBtn = document.getElementById("prev-question-btn");
        if (prevBtn && !prevBtn.disabled) prevBtn.click();
        return;
      }

      // 'F' to flag question
      if (keyUpper === "F") {
        const flagBtn = document.getElementById("flag-question-btn");
        if (flagBtn) flagBtn.click();
        return;
      }

      // 'H' for hint
      if (keyUpper === "H") {
        const hintBtn = document.getElementById("lifeline-hint-btn");
        if (hintBtn && !hintBtn.disabled) hintBtn.click();
        return;
      }
    }
  });

  console.log("[QuizePro] Application ready. 5,200+ offline questions loaded.");
});
