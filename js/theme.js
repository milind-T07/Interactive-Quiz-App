/* ============================================
   THEME.JS — Theme Persistence & Contrast Management
   ============================================ */

const ThemeManager = (function () {
  const THEME_KEY = "quiz_app_theme";

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#090d16" : "#f8fafc");
    }

    // Trigger icon update in UI
    if (typeof UI !== "undefined" && UI.updateHeaderActions) {
      UI.updateHeaderActions();
    }
  }

  function toggleTheme() {
    const nextTheme = getTheme() === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof SoundEngine !== "undefined") {
      SoundEngine.click();
    }
    return nextTheme;
  }

  function init() {
    const saved = getTheme();
    setTheme(saved);
  }

  return {
    getTheme,
    setTheme,
    toggleTheme,
    init
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  ThemeManager.init();
});
