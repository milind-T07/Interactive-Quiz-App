/* ============================================
   UI.JS — QuizePro Modern Interface Renderer
   ============================================ */

const UI = (function () {
  // --- HTML Entity Escaper for safe rendering of code / tags ---
  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Toast Notification Helper ---
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const iconSvg = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === "danger"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `<span>${iconSvg}</span><span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastOut 0.25s forwards";
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // --- Native Accessible Confirmation Modal ---
  function showConfirmModal({ title, message, confirmText = "Confirm", isDanger = false, onConfirm }) {
    const dialog = document.getElementById("confirm-dialog");
    const titleEl = document.getElementById("dialog-title");
    const descEl = document.getElementById("dialog-desc");
    const confirmBtn = document.getElementById("dialog-confirm-btn");
    const cancelBtn = document.getElementById("dialog-cancel-btn");
    const iconWrap = document.getElementById("dialog-icon-wrap");

    if (!dialog || !confirmBtn || !cancelBtn) {
      if (confirm(message)) {
        if (onConfirm) onConfirm();
      }
      return;
    }

    titleEl.textContent = title;
    descEl.textContent = message;
    confirmBtn.textContent = confirmText;

    if (isDanger) {
      confirmBtn.className = "btn btn-danger";
      iconWrap.style.background = "var(--color-danger-bg)";
      iconWrap.style.color = "var(--color-danger)";
    } else {
      confirmBtn.className = "btn btn-primary";
      iconWrap.style.background = "var(--accent-glow)";
      iconWrap.style.color = "var(--accent-primary)";
    }

    const handleConfirm = () => {
      cleanup();
      dialog.close();
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      cleanup();
      dialog.close();
    };

    function cleanup() {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
    }

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);

    dialog.showModal();
  }

  // --- Navigation & Header Actions ---
  function renderNavigation() {
    const desktopNav = document.getElementById("desktop-nav");
    const mobileLinks = document.getElementById("mobile-nav-links");
    const bookmarksCount = Storage.getBookmarks().length;

    const navItems = [
      { id: "hub", label: "Dashboard", icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>` },
      { id: "explore", label: "Explore", icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
      { id: "performance", label: "Performance", icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>` },
      { id: "bookmarks", label: "Study Bank", badge: bookmarksCount, icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>` }
    ];

    if (desktopNav) {
      desktopNav.innerHTML = navItems.map((item) => `
        <button type="button" class="nav-tab-btn ${quizState.activeTab === item.id ? 'active' : ''}" data-tab="${item.id}">
          ${item.icon}
          <span>${item.label}</span>
          ${item.badge > 0 ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </button>
      `).join("");

      desktopNav.querySelectorAll(".nav-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          switchTab(btn.getAttribute("data-tab"));
        });
      });
    }

    if (mobileLinks) {
      mobileLinks.innerHTML = navItems.map((item) => `
        <button type="button" class="mobile-nav-tab ${quizState.activeTab === item.id ? 'active' : ''}" data-tab="${item.id}">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            ${item.icon}
            <span>${item.label}</span>
          </div>
          ${item.badge > 0 ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </button>
      `).join("");

      mobileLinks.querySelectorAll(".mobile-nav-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          closeMobileDrawer();
          switchTab(btn.getAttribute("data-tab"));
        });
      });
    }

    updateHeaderActions();
  }

  function updateHeaderActions() {
    const soundBtn = document.getElementById("sound-toggle-btn");
    const themeBtn = document.getElementById("theme-toggle-btn");

    if (soundBtn && typeof SoundEngine !== "undefined") {
      soundBtn.innerHTML = SoundEngine.isMuted()
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v6a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>`;
      soundBtn.setAttribute("aria-label", SoundEngine.isMuted() ? "Unmute Sound FX" : "Mute Sound FX");
    }

    if (themeBtn && typeof ThemeManager !== "undefined") {
      const isDark = ThemeManager.getTheme() === "dark";
      themeBtn.innerHTML = isDark
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
      themeBtn.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
    }
  }

  function switchTab(tabId) {
    if (typeof SoundEngine !== "undefined") SoundEngine.click();

    // If leaving an active unfinished quiz in hub, ask confirmation
    if (quizState.activeTab === "hub" && quizState.questions.length > 0 && !quizState.isFinished && tabId !== "hub") {
      showConfirmModal({
        title: "Leave Active Quiz?",
        message: "You have a quiz in progress. Leaving will forfeit your current run progress.",
        confirmText: "Leave Quiz",
        isDanger: true,
        onConfirm: () => {
          stopQuizTimer();
          quizState.questions = [];
          quizState.activeTab = tabId;
          renderNavigation();
          renderActiveView();
        }
      });
      return;
    }

    quizState.activeTab = tabId;
    renderNavigation();
    renderActiveView();
  }

  function closeMobileDrawer() {
    const overlay = document.getElementById("mobile-drawer-overlay");
    if (overlay) overlay.classList.remove("open");
  }

  // --- Active View Router ---
  function renderActiveView() {
    const root = document.getElementById("app-root");
    if (!root) return;

    if (quizState.activeTab === "hub") {
      if (quizState.isFinished) {
        renderResultsView(root);
      } else if (quizState.questions.length > 0) {
        renderQuizRunnerView(root);
      } else {
        renderHubView(root);
      }
    } else if (quizState.activeTab === "explore") {
      renderExploreView(root);
    } else if (quizState.activeTab === "performance") {
      renderPerformanceView(root);
    } else if (quizState.activeTab === "bookmarks") {
      renderStudyBankView(root);
    }
  }

  // ============================================
  // 1. DASHBOARD / HOMEPAGE VIEW
  // ============================================
  function renderHubView(container) {
    const analytics = Storage.getAnalytics();
    const categories = QuestionService.getCategories();
    const allQuestions = QuestionService.getAllQuestions();

    // Filter categories based on search query and active difficulty
    let catEntries = Object.entries(categories);

    if (quizState.hubSearchQuery && quizState.hubSearchQuery.trim()) {
      const q = quizState.hubSearchQuery.toLowerCase().trim();
      catEntries = catEntries.filter(([id, cat]) => 
        cat.title.toLowerCase().includes(q) || 
        cat.description.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q)
      );
    }

    if (quizState.activeDifficulty !== "all") {
      // Keep categories that have questions for this difficulty
      catEntries = catEntries.filter(([id]) => {
        const catQs = allQuestions.filter((item) => item.category === id && item.difficulty === quizState.activeDifficulty);
        return catQs.length > 0;
      });
    }

    // Build Topic Cards HTML
    let topicCardsHTML = catEntries.map(([id, cat]) => {
      const catQs = allQuestions.filter((item) => item.category === id);
      const stats = QuestionService.getCategoryStats(id);

      return `
        <div class="topic-card fade-in" style="--topic-accent: ${cat.color};" data-cat-id="${id}">
          <div class="topic-card-top">
            <div class="topic-icon-box">${cat.icon}</div>
            <span class="badge badge-neutral">${catQs.length} Questions</span>
          </div>

          <div class="topic-card-body">
            <h3 class="topic-card-title">${escapeHTML(cat.title)}</h3>
            <p class="topic-card-desc">${escapeHTML(cat.description)}</p>
          </div>

          <div class="topic-meta-row">
            <span>${stats.easy} Easy • ${stats.medium} Med • ${stats.hard} Hard</span>
          </div>

          <div class="topic-card-actions">
            <button type="button" class="btn btn-primary topic-start-btn" data-cat-id="${id}">
              Start Quiz
            </button>
            <button type="button" class="btn btn-secondary topic-gear-btn" data-cat-id="${id}" title="Configure custom options" aria-label="Configure ${escapeHTML(cat.title)} quiz">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join("");

    if (!topicCardsHTML) {
      topicCardsHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3 class="empty-state-title">No Topics Found</h3>
            <p class="empty-state-desc">No technical domains matched your search criteria. Reset filters to explore all available skills.</p>
            <button type="button" class="btn btn-secondary" id="empty-reset-filters-btn">Reset All Filters</button>
          </div>
        </div>
      `;
    }

    // Hero Streak Widget Configuration
    const isStreakActive = (analytics.streak || 0) > 0;
    const miniTrackHTML = (analytics.weeklyActivity || []).map((day) => `
      <div class="streak-day-cell ${day.questionsCount > 0 ? 'active' : ''} ${day.isToday ? 'today' : ''}" title="${day.dayLabel}: ${day.questionsCount} questions">
        <span class="streak-day-char">${day.dayLabel.charAt(0)}</span>
        <span class="streak-dot-mark"></span>
      </div>
    `).join("");

    const heroStreakHTML = `
      <div class="hero-streak-card fade-in" aria-label="Learning Streak Tracker">
        <div class="streak-flame-box ${isStreakActive ? 'burning' : 'idle'}">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="streak-flame-svg" aria-hidden="true">
            <defs>
              <linearGradient id="streakFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="55%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#fef08a" />
              </linearGradient>
            </defs>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="url(#streakFlameGrad)" />
          </svg>
        </div>

        <div class="streak-details">
          <div class="streak-badge-row">
            <span class="streak-active-pill ${isStreakActive ? 'on-fire' : 'standby'}">
              <span class="streak-pulse-dot"></span>
              ${isStreakActive ? 'Active Streak' : 'Daily Streak'}
            </span>
            <span class="streak-status-text">
              ${isStreakActive ? 'Consistency on track' : 'Start streak today'}
            </span>
          </div>

          <div class="streak-val-row">
            <span class="streak-number">${analytics.streak}</span>
            <span class="streak-unit">${analytics.streak === 1 ? 'Day Streak' : 'Days Streak'}</span>
          </div>

          <div class="streak-week-track" aria-label="Past 7 days activity">
            ${miniTrackHTML}
          </div>
        </div>
      </div>
    `;

    const isFiltersActive = quizState.hubSearchQuery.trim() !== "" || quizState.activeDifficulty !== "all";

    container.innerHTML = `
      <div class="fade-in">
        <!-- 1. Refined Compact Hero -->
        <section class="hero-banner" aria-label="Welcome Overview">
          <div class="hero-content">
            <h1 class="hero-heading">Master Your Next Concept.</h1>
            <p class="hero-subtitle">Practice technical concepts and algorithm drills through focused interactive quizzes with instant explanations.</p>
          </div>

          <div class="hero-streak-container">
            ${heroStreakHTML}
          </div>
        </section>

        <!-- Real-Time AI Generation Hero Banner -->
        <div class="hub-ai-banner fade-in">
          <div class="hub-ai-left">
            <div class="hub-ai-icon-box">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <div>
              <h3 class="hub-ai-title">
                <span>Gemini AI Real-Time Questions</span>
                <span class="badge badge-sm ${Storage.hasApiKey() ? 'badge-success' : 'badge-warning'}" style="font-size:0.7rem;">
                  ${Storage.hasApiKey() ? '● Live API Active' : '⚡ Key Required'}
                </span>
              </h3>
              <p class="hub-ai-desc">
                Generate custom live interview questions, coding scenarios, and algorithmic drills on any language or framework in real time using Gemini AI.
              </p>
            </div>
          </div>
          <div class="hub-ai-actions">
            <button type="button" class="btn btn-primary btn-glow" id="hub-start-ai-drill-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Generate AI Drill</span>
            </button>
            <button type="button" class="btn btn-secondary" id="hub-config-ai-key-btn">
              <span>API Key Settings</span>
            </button>
          </div>
        </div>

        <!-- 2. Technical Domains Section -->
        <section class="topics-section" id="topics-catalog" aria-label="Explore Technical Topics">
          <div class="topics-header-wrap">
            <div class="topics-title-group">
              <h2>Explore Technical Topics</h2>
              <p>Choose a skill and start practicing.</p>
            </div>
          </div>

          <!-- Toolbar -->
          <div class="topics-toolbar">
            <div class="toolbar-left">
              <!-- Search Input -->
              <div class="search-box">
                <span class="search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" id="hub-search-input" class="form-control search-input" placeholder="Search topics or skills..." value="${escapeHTML(quizState.hubSearchQuery)}" aria-label="Search technical topics" />
              </div>

              <!-- Difficulty Segmented Control -->
              <div class="segmented-control" role="group" aria-label="Filter topics by difficulty">
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
            </div>

            <div class="toolbar-right">
              ${isFiltersActive ? `
                <button type="button" class="btn btn-ghost btn-sm" id="hub-reset-btn" style="color: var(--text-muted);">
                  Reset Filters
                </button>
              ` : ''}

              <button type="button" class="btn btn-secondary btn-sm" id="hub-open-config-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>Customize Quiz</span>
              </button>
            </div>
          </div>

          <!-- Topics Grid -->
          <div class="topics-grid" id="topics-grid-container">
            ${topicCardsHTML}
          </div>
        </section>
      </div>
    `;

    // --- Wire Event Listeners ---
    // Search and Filters
    const searchInput = document.getElementById("hub-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        quizState.hubSearchQuery = e.target.value;
        renderHubView(container);
        // Maintain focus on search input after re-render
        const reSearch = document.getElementById("hub-search-input");
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(reSearch.value.length, reSearch.value.length);
        }
      });
    }

    const resetBtn = document.getElementById("hub-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        quizState.hubSearchQuery = "";
        quizState.activeDifficulty = "all";
        renderHubView(container);
      });
    }

    const emptyResetBtn = document.getElementById("empty-reset-filters-btn");
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener("click", () => {
        quizState.hubSearchQuery = "";
        quizState.activeDifficulty = "all";
        renderHubView(container);
      });
    }

    container.querySelectorAll(".segment-btn[data-diff]").forEach((btn) => {
      btn.addEventListener("click", () => {
        quizState.activeDifficulty = btn.getAttribute("data-diff");
        renderHubView(container);
      });
    });

    // Customize Quiz Modal
    const customizeBtn = document.getElementById("hub-open-config-btn");
    if (customizeBtn) {
      customizeBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    // Hub AI Banner Action Buttons
    const aiDrillBtn = document.getElementById("hub-start-ai-drill-btn");
    if (aiDrillBtn) {
      aiDrillBtn.addEventListener("click", () => {
        showQuizConfigModal("all", "ai");
      });
    }

    const aiKeyBtn = document.getElementById("hub-config-ai-key-btn");
    if (aiKeyBtn) {
      aiKeyBtn.addEventListener("click", () => {
        showAiConfigModal();
      });
    }

    // Topic Cards Actions
    container.querySelectorAll(".topic-start-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const catId = btn.getAttribute("data-cat-id");
        startStandardQuizRun(catId, quizState.activeDifficulty);
      });
    });

    container.querySelectorAll(".topic-gear-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const catId = btn.getAttribute("data-cat-id");
        showQuizConfigModal(catId);
      });
    });

    container.querySelectorAll(".topic-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // If clicking a button inside, let button handler execute
        if (e.target.closest("button")) return;
        const catId = card.getAttribute("data-cat-id");
        startStandardQuizRun(catId, quizState.activeDifficulty);
      });
    });
  }

  // --- Modal Helpers ---
  function showGoalModal() {
    const dialog = document.getElementById("goal-dialog");
    const input = document.getElementById("goal-input");
    const saveBtn = document.getElementById("goal-save-btn");
    const cancelBtn = document.getElementById("goal-cancel-btn");

    if (!dialog || !input || !saveBtn || !cancelBtn) {
      const cur = Storage.getDailyGoal();
      const val = prompt("Set daily question target:", cur);
      if (val !== null) {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0) {
          Storage.setDailyGoal(num);
          showToast(`Daily target set to ${num} questions`, "success");
          renderActiveView();
        }
      }
      return;
    }

    input.value = Storage.getDailyGoal();

    const handleSave = () => {
      const num = parseInt(input.value, 10);
      if (!isNaN(num) && num >= 1 && num <= 100) {
        Storage.setDailyGoal(num);
        cleanup();
        dialog.close();
        showToast(`Daily target updated to ${num} questions`, "success");
        renderActiveView();
      } else {
        showToast("Please enter a valid target between 1 and 100", "danger");
      }
    };

    const handleCancel = () => {
      cleanup();
      dialog.close();
    };

    function cleanup() {
      saveBtn.removeEventListener("click", handleSave);
      cancelBtn.removeEventListener("click", handleCancel);
    }

    saveBtn.addEventListener("click", handleSave);
    cancelBtn.addEventListener("click", handleCancel);

    dialog.showModal();
  }

  // ============================================
  // GEMINI AI SETTINGS MODAL & LOGIC
  // ============================================
  function updateAiHeaderStatus() {
    const dot = document.getElementById("header-ai-status-dot");
    if (!dot) return;
    if (Storage.hasApiKey()) {
      dot.classList.add("active");
      dot.setAttribute("title", "Gemini API Key Active");
    } else {
      dot.classList.remove("active");
      dot.setAttribute("title", "No API Key Set (Click to Configure)");
    }
  }

  function initAiSettings() {
    const btn = document.getElementById("ai-settings-toggle-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        showAiConfigModal();
      });
    }
    updateAiHeaderStatus();
  }

  function showAiConfigModal() {
    const dialog = document.getElementById("ai-config-dialog");
    const input = document.getElementById("ai-api-key-input");
    const toggleVisBtn = document.getElementById("toggle-key-visibility-btn");
    const testBtn = document.getElementById("test-api-key-btn");
    const saveBtn = document.getElementById("ai-save-btn");
    const removeBtn = document.getElementById("remove-api-key-btn");
    const cancelBtn = document.getElementById("ai-cancel-btn");
    const statusPill = document.getElementById("ai-modal-status-pill");
    const feedback = document.getElementById("ai-test-feedback");

    if (!dialog || !input) return;

    // Reset fields
    const currentKey = Storage.getApiKey();
    input.value = currentKey;
    input.type = "password";
    if (feedback) {
      feedback.style.display = "none";
      feedback.textContent = "";
    }

    function updatePill() {
      if (!statusPill) return;
      if (Storage.hasApiKey()) {
        statusPill.textContent = "● Key Connected";
        statusPill.className = "badge badge-sm badge-success";
      } else {
        statusPill.textContent = "No Key Set";
        statusPill.className = "badge badge-sm badge-secondary";
      }
    }

    updatePill();

    // Toggle password visibility
    const handleToggleVis = () => {
      input.type = input.type === "password" ? "text" : "password";
    };

    // Ping & Test Key
    const handleTestKey = async () => {
      const keyVal = input.value.trim();
      if (!keyVal) {
        showToast("Please enter an API key to test.", "warning");
        return;
      }
      testBtn.disabled = true;
      testBtn.textContent = "Testing...";
      if (feedback) {
        feedback.style.display = "block";
        feedback.style.background = "var(--bg-subtle)";
        feedback.style.color = "var(--text-secondary)";
        feedback.textContent = "Connecting to Google Gemini API endpoint...";
      }

      try {
        const result = await AIService.testApiKey(keyVal);
        if (result.ok) {
          if (feedback) {
            feedback.style.background = "rgba(16, 185, 129, 0.15)";
            feedback.style.color = "#34d399";
            feedback.innerHTML = "✅ <strong>Success!</strong> Gemini API key verified and operational.";
          }
          showToast("Gemini API key verified successfully!", "success");
        } else {
          if (feedback) {
            feedback.style.background = "rgba(239, 68, 68, 0.15)";
            feedback.style.color = "#f87171";
            feedback.innerHTML = `❌ <strong>Verification Failed:</strong> ${escapeHTML(result.error)}`;
          }
          showToast(result.error || "API Key verification failed.", "danger");
        }
      } catch (err) {
        if (feedback) {
          feedback.style.background = "rgba(239, 68, 68, 0.15)";
          feedback.style.color = "#f87171";
          feedback.innerHTML = `❌ <strong>Error:</strong> ${escapeHTML(err.message)}`;
        }
      } finally {
        testBtn.disabled = false;
        testBtn.textContent = "⚡ Ping & Test Key";
      }
    };

    // Save key
    const handleSave = () => {
      const val = input.value.trim();
      if (!val) {
        showToast("Please enter an API key or click Remove Key", "warning");
        return;
      }
      Storage.saveApiKey(val);
      updateAiHeaderStatus();
      updatePill();
      showToast("Gemini API key saved to local storage!", "success");
      renderActiveView();
      cleanup();
      dialog.close();
    };

    // Remove key
    const handleRemove = () => {
      Storage.saveApiKey("");
      input.value = "";
      updateAiHeaderStatus();
      updatePill();
      if (feedback) feedback.style.display = "none";
      showToast("Gemini API key removed", "info");
      renderActiveView();
      cleanup();
      dialog.close();
    };

    const handleCancel = () => {
      cleanup();
      dialog.close();
    };

    function cleanup() {
      if (toggleVisBtn) toggleVisBtn.removeEventListener("click", handleToggleVis);
      if (testBtn) testBtn.removeEventListener("click", handleTestKey);
      if (saveBtn) saveBtn.removeEventListener("click", handleSave);
      if (removeBtn) removeBtn.removeEventListener("click", handleRemove);
      if (cancelBtn) cancelBtn.removeEventListener("click", handleCancel);
    }

    if (toggleVisBtn) toggleVisBtn.addEventListener("click", handleToggleVis);
    if (testBtn) testBtn.addEventListener("click", handleTestKey);
    if (saveBtn) saveBtn.addEventListener("click", handleSave);
    if (removeBtn) removeBtn.removeEventListener("click", handleRemove);
    if (cancelBtn) cancelBtn.addEventListener("click", handleCancel);

    dialog.showModal();
  }

  function showQuizConfigModal(preselectedCategory = "all", initialMode = "bank") {
    const dialog = document.getElementById("quiz-config-dialog");
    const tabBankBtn = document.getElementById("config-mode-tab-bank");
    const tabAiBtn = document.getElementById("config-mode-tab-ai");
    const standardGroup = document.getElementById("config-standard-topic-group");
    const aiGroup = document.getElementById("config-ai-topic-group");
    const topicSelect = document.getElementById("config-topic-select");
    const aiTopicInput = document.getElementById("config-ai-topic-input");
    const aiKeyBadge = document.getElementById("config-ai-key-badge");
    const diffSelect = document.getElementById("config-diff-select");
    const countSelect = document.getElementById("config-count-select");
    const timerSelect = document.getElementById("config-timer-select");
    const poolLabel = document.getElementById("config-pool-label");
    const poolCount = document.getElementById("config-pool-count");
    const countOptAll = document.getElementById("config-count-opt-all");
    const startBtn = document.getElementById("config-start-btn");
    const cancelBtn = document.getElementById("config-cancel-btn");

    if (!dialog || !topicSelect || !startBtn) return;

    let activeConfigMode = initialMode === "ai" ? "ai" : "bank";

    // Populate standard topic dropdown
    const categories = QuestionService.getCategories();
    topicSelect.innerHTML = `
      <option value="all">All Domains (Comprehensive Drill)</option>
      ${Object.values(categories).map((c) => `
        <option value="${c.id}" ${preselectedCategory === c.id ? 'selected' : ''}>${escapeHTML(c.title)}</option>
      `).join("")}
    `;

    diffSelect.value = quizState.activeDifficulty;

    function updateAiKeyBadge() {
      if (!aiKeyBadge) return;
      if (Storage.hasApiKey()) {
        aiKeyBadge.textContent = "● API Key Connected";
        aiKeyBadge.className = "badge badge-sm badge-success";
      } else {
        aiKeyBadge.textContent = "⚠️ Key Needed (Setup)";
        aiKeyBadge.className = "badge badge-sm badge-warning";
      }
    }

    function setConfigMode(mode) {
      activeConfigMode = mode;
      if (mode === "ai") {
        if (tabAiBtn) tabAiBtn.classList.add("active");
        if (tabBankBtn) tabBankBtn.classList.remove("active");
        if (aiGroup) aiGroup.style.display = "block";
        if (standardGroup) standardGroup.style.display = "none";
        if (poolLabel) poolLabel.textContent = "Generation Engine:";
        if (poolCount) poolCount.innerHTML = `<span style="color:#c084fc;">Gemini AI Real-Time Questions</span>`;
        if (countOptAll) countOptAll.disabled = true;
        if (countSelect.value === "all") countSelect.value = "5";
        updateAiKeyBadge();
        if (aiTopicInput && !aiTopicInput.value && preselectedCategory !== "all" && categories[preselectedCategory]) {
          aiTopicInput.value = categories[preselectedCategory].title;
        }
      } else {
        if (tabBankBtn) tabBankBtn.classList.add("active");
        if (tabAiBtn) tabAiBtn.classList.remove("active");
        if (standardGroup) standardGroup.style.display = "block";
        if (aiGroup) aiGroup.style.display = "none";
        if (poolLabel) poolLabel.textContent = "Available Questions:";
        if (countOptAll) countOptAll.disabled = false;
        updatePoolCount();
      }
    }

    // Update pool count feedback for static bank
    function updatePoolCount() {
      if (activeConfigMode === "ai") return;
      const cat = topicSelect.value;
      const diff = diffSelect.value;
      let pool = QuestionService.getAllQuestions();
      if (cat !== "all") pool = pool.filter((q) => q.category === cat);
      if (diff !== "all") pool = pool.filter((q) => q.difficulty === diff);
      if (poolCount) poolCount.textContent = `${pool.length} Questions in pool`;
    }

    setConfigMode(activeConfigMode);

    const onTabBank = () => setConfigMode("bank");
    const onTabAi = () => setConfigMode("ai");
    const onKeyBadgeClick = () => {
      cleanup();
      dialog.close();
      showAiConfigModal();
    };

    if (tabBankBtn) tabBankBtn.addEventListener("click", onTabBank);
    if (tabAiBtn) tabAiBtn.addEventListener("click", onTabAi);
    if (aiKeyBadge) aiKeyBadge.addEventListener("click", onKeyBadgeClick);
    topicSelect.addEventListener("change", updatePoolCount);
    diffSelect.addEventListener("change", updatePoolCount);

    // Quick chips
    const chipBtns = dialog.querySelectorAll(".ai-quick-topic-chip");
    const onChipClick = (e) => {
      const topicVal = e.target.getAttribute("data-topic");
      if (aiTopicInput && topicVal) {
        aiTopicInput.value = topicVal;
      }
    };
    chipBtns.forEach((b) => b.addEventListener("click", onChipClick));

    const handleStart = async (e) => {
      e.preventDefault();
      const diff = diffSelect.value;
      const countVal = countSelect.value;
      const timerVal = parseInt(timerSelect.value, 10);
      const isTimed = timerVal > 0;

      if (activeConfigMode === "ai") {
        // Real-time AI Generation Mode
        if (!Storage.hasApiKey()) {
          showToast("Please enter your Gemini API Key to generate real-time questions", "warning");
          cleanup();
          dialog.close();
          showAiConfigModal();
          return;
        }

        const topicText = (aiTopicInput && aiTopicInput.value.trim()) 
          ? aiTopicInput.value.trim() 
          : (topicSelect.value !== "all" && categories[topicSelect.value] ? categories[topicSelect.value].title : "Full-Stack Web Development & Modern Algorithms");

        const qCount = parseInt(countVal, 10) || 5;

        cleanup();
        dialog.close();

        // Show AI Loading Modal
        const loadingDialog = document.getElementById("ai-loading-dialog");
        const topicPill = document.getElementById("ai-loading-topic-pill");
        if (topicPill) topicPill.textContent = `Topic: ${topicText}`;
        if (loadingDialog) loadingDialog.showModal();

        try {
          const aiQuestions = await AIService.generateQuestions({
            topic: topicText,
            categoryId: "ai_drill",
            categoryTitle: topicText,
            difficulty: diff === "all" ? "medium" : diff,
            count: qCount
          });

          if (loadingDialog) loadingDialog.close();

          if (aiQuestions && aiQuestions.length > 0) {
            initializeAiQuiz({
              questions: aiQuestions,
              topic: topicText,
              difficulty: diff === "all" ? "medium" : diff,
              isTimed,
              timeLimit: isTimed ? timerVal : 20
            });
            if (typeof SoundEngine !== "undefined") SoundEngine.click();
            renderActiveView();
            if (quizState.isTimedMode) startActiveQuestionTimer();
            showToast(`✨ Generated ${aiQuestions.length} real-time questions via Gemini AI!`, "success");
          } else {
            showToast("Gemini did not return any valid questions. Please try a different topic.", "danger");
          }
        } catch (genError) {
          if (loadingDialog) loadingDialog.close();
          console.error("AI Generation failed:", genError);
          showToast(genError.message || "Failed to generate AI questions.", "danger");
        }
      } else {
        // Standard Bank Mode
        const cat = topicSelect.value;
        const loaded = initializeConfiguredQuiz({
          category: cat,
          difficulty: diff,
          count: countVal,
          isTimed: isTimed,
          timeLimit: isTimed ? timerVal : 20,
          shuffle: true
        });

        cleanup();
        dialog.close();

        if (loaded > 0) {
          if (typeof SoundEngine !== "undefined") SoundEngine.click();
          renderActiveView();
          if (quizState.isTimedMode) startActiveQuestionTimer();
        } else {
          showToast("No questions available for this configuration.", "danger");
        }
      }
    };

    const handleCancel = () => {
      cleanup();
      dialog.close();
    };

    function cleanup() {
      startBtn.removeEventListener("click", handleStart);
      cancelBtn.removeEventListener("click", handleCancel);
      if (tabBankBtn) tabBankBtn.removeEventListener("click", onTabBank);
      if (tabAiBtn) tabAiBtn.removeEventListener("click", onTabAi);
      if (aiKeyBadge) aiKeyBadge.removeEventListener("click", onKeyBadgeClick);
      topicSelect.removeEventListener("change", updatePoolCount);
      diffSelect.removeEventListener("change", updatePoolCount);
      chipBtns.forEach((b) => b.removeEventListener("click", onChipClick));
    }

    startBtn.addEventListener("click", handleStart);
    cancelBtn.addEventListener("click", handleCancel);

    dialog.showModal();
  }

  function startStandardQuizRun(category = "all", difficulty = "all") {
    if (typeof SoundEngine !== "undefined") SoundEngine.click();
    initializeStandardQuiz(category, difficulty, 10);
    renderActiveView();
    if (quizState.isTimedMode) {
      startActiveQuestionTimer();
    }
  }

  // ============================================
  // 2. EXPLORE VIEW (Dedicated Discovery)
  // ============================================
  function renderExploreView(container) {
    const categories = QuestionService.getCategories();
    let allQuestions = QuestionService.getAllQuestions();

    // Independent Filter state
    let filteredQuestions = [...allQuestions];

    if (quizState.exploreCategory !== "all") {
      filteredQuestions = filteredQuestions.filter((q) => q.category === quizState.exploreCategory);
    }

    if (quizState.exploreDifficulty !== "all") {
      filteredQuestions = filteredQuestions.filter((q) => q.difficulty === quizState.exploreDifficulty);
    }

    if (quizState.exploreSearchQuery.trim()) {
      const q = quizState.exploreSearchQuery.toLowerCase();
      filteredQuestions = filteredQuestions.filter((item) => 
        item.question.toLowerCase().includes(q) ||
        (item.hint && item.hint.toLowerCase().includes(q)) ||
        (item.explanation && item.explanation.toLowerCase().includes(q)) ||
        item.options.some((opt) => opt.toLowerCase().includes(q))
      );
    }

    // Sort questions
    if (quizState.exploreSort === "difficulty") {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      filteredQuestions.sort((a, b) => (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0));
    } else if (quizState.exploreSort === "question") {
      filteredQuestions.sort((a, b) => a.question.localeCompare(b.question));
    }

    // Category chips HTML
    const categoryChips = [
      { id: "all", title: "All Topics" },
      ...Object.values(categories)
    ].map((cat) => `
      <button type="button" class="chip-btn ${quizState.exploreCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
        ${escapeHTML(cat.title)}
      </button>
    `).join("");

    // Difficulty chips HTML
    const diffChips = [
      { id: "all", label: "All Levels" },
      { id: "easy", label: "Easy" },
      { id: "medium", label: "Medium" },
      { id: "hard", label: "Hard" }
    ].map((d) => `
      <button type="button" class="chip-btn ${quizState.exploreDifficulty === d.id ? 'active' : ''}" data-diff="${d.id}">
        ${escapeHTML(d.label)}
      </button>
    `).join("");

    // Questions Grid HTML
    let questionsListHTML = "";
    if (filteredQuestions.length === 0) {
      questionsListHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 class="empty-state-title">No Matching Questions</h3>
          <p class="empty-state-desc">Try adjusting your keyword search, technology filters, or difficulty criteria.</p>
          <button type="button" class="btn btn-secondary" id="reset-explore-filters-btn">Reset All Filters</button>
        </div>
      `;
    } else {
      questionsListHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${filteredQuestions.map((q, idx) => {
            const catObj = categories[q.category] || { title: q.category };
            const isSaved = Storage.isBookmarked(q.id);
            return `
              <div class="card card-hover review-card fade-in" style="border-left-color: var(--accent-primary);">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.6rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span class="badge badge-neutral">${escapeHTML(catObj.title)}</span>
                    <span class="badge badge-${q.difficulty}">${q.difficulty}</span>
                  </div>
                  <button type="button" class="btn btn-ghost btn-sm bookmark-toggle-btn" data-qid="${q.id}" title="${isSaved ? 'Remove bookmark' : 'Save to Study Bank'}">
                    ${isSaved ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
                <h4 style="margin-bottom: 0.75rem; font-size: 1rem;">${idx + 1}. ${escapeHTML(q.question)}</h4>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                  ${q.options.map((opt, i) => `
                    <span style="font-size: 0.8rem; padding: 0.2rem 0.5rem; background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); color: var(--text-secondary);">
                      ${['A', 'B', 'C', 'D'][i]}: ${escapeHTML(opt)}
                    </span>
                  `).join("")}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.825rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
                  <span>💡 ${q.hint ? escapeHTML(q.hint) : 'Standard knowledge question'}</span>
                  <button type="button" class="btn btn-ghost btn-sm practice-single-btn" data-cat="${q.category}">
                    Practice Similar →
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="fade-in">
        <div class="explore-header">
          <h1 style="margin-bottom: 0.4rem;">Explore Question Bank</h1>
          <p>Search, filter, and discover technical questions across all developer topics.</p>
        </div>

        <!-- Search Bar -->
        <div class="explore-search-bar">
          <span style="color: var(--text-muted); display: flex;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="explore-search-input" class="explore-search-input" placeholder="Search by technology, question text, keyword, or concept..." value="${escapeHTML(quizState.exploreSearchQuery)}" />
          ${quizState.exploreSearchQuery ? `
            <button type="button" class="btn btn-ghost btn-sm" id="clear-explore-search-btn">✕</button>
          ` : ''}
        </div>

        <!-- Filter Bar -->
        <div class="explore-filter-bar">
          <div style="display: flex; flex-direction: column; gap: 0.6rem; flex: 1;">
            <div class="chip-group">${categoryChips}</div>
            <div class="chip-group">${diffChips}</div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <select id="explore-sort-select" class="filter-select">
              <option value="count" ${quizState.exploreSort === 'count' ? 'selected' : ''}>Default Order</option>
              <option value="difficulty" ${quizState.exploreSort === 'difficulty' ? 'selected' : ''}>Sort by Difficulty</option>
              <option value="question" ${quizState.exploreSort === 'question' ? 'selected' : ''}>Sort Alphabetically</option>
            </select>
          </div>
        </div>

        <!-- Results Meta -->
        <div class="explore-results-meta">
          <span>Showing <strong>${filteredQuestions.length}</strong> matching questions</span>
          <div style="display: flex; gap: 0.5rem;">
            ${(quizState.exploreCategory !== "all" || quizState.exploreDifficulty !== "all" || quizState.exploreSearchQuery) ? `
              <button type="button" class="btn btn-ghost btn-sm" id="reset-explore-filters-top-btn">Reset Filters</button>
            ` : ''}
            ${filteredQuestions.length > 0 ? `
              <button type="button" class="btn btn-primary btn-sm" id="launch-filtered-quiz-btn">
                ⚡ Quiz These ${filteredQuestions.length} Questions
              </button>
            ` : ''}
          </div>
        </div>

        <!-- List -->
        ${questionsListHTML}
      </div>
    `;

    // Event Listeners for Explore
    const expSearchInput = document.getElementById("explore-search-input");
    if (expSearchInput) {
      expSearchInput.addEventListener("input", (e) => {
        quizState.exploreSearchQuery = e.target.value;
        renderExploreView(container);
      });
    }

    const clearExpSearch = document.getElementById("clear-explore-search-btn");
    if (clearExpSearch) {
      clearExpSearch.addEventListener("click", () => {
        quizState.exploreSearchQuery = "";
        renderExploreView(container);
      });
    }

    const resetFiltersTop = document.getElementById("reset-explore-filters-top-btn");
    if (resetFiltersTop) {
      resetFiltersTop.addEventListener("click", () => {
        resetExploreFilters(container);
      });
    }

    const resetFiltersBottom = document.getElementById("reset-explore-filters-btn");
    if (resetFiltersBottom) {
      resetFiltersBottom.addEventListener("click", () => {
        resetExploreFilters(container);
      });
    }

    const sortSelect = document.getElementById("explore-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        quizState.exploreSort = e.target.value;
        renderExploreView(container);
      });
    }

    container.querySelectorAll(".chip-btn[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        quizState.exploreCategory = btn.getAttribute("data-cat");
        renderExploreView(container);
      });
    });

    container.querySelectorAll(".chip-btn[data-diff]").forEach((btn) => {
      btn.addEventListener("click", () => {
        quizState.exploreDifficulty = btn.getAttribute("data-diff");
        renderExploreView(container);
      });
    });

    const launchFilteredBtn = document.getElementById("launch-filtered-quiz-btn");
    if (launchFilteredBtn) {
      launchFilteredBtn.addEventListener("click", () => {
        quizState.questions = shuffleArray(filteredQuestions).slice(0, 10);
        quizState.quizMode = "standard";
        quizState.quizTitle = "Filtered Practice Quiz";
        resetQuizRunState();
        quizState.activeTab = "hub";
        renderNavigation();
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    container.querySelectorAll(".bookmark-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const targetQ = allQuestions.find((q) => q.id === qid);
        if (targetQ) {
          const isSaved = Storage.toggleBookmark(targetQ);
          showToast(isSaved ? "Saved to Study Bank" : "Removed from Study Bank", "info");
          renderExploreView(container);
          renderNavigation();
        }
      });
    });

    container.querySelectorAll(".practice-single-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-cat");
        startStandardQuizRun(cat, "all");
      });
    });
  }

  function resetExploreFilters(container) {
    quizState.exploreCategory = "all";
    quizState.exploreDifficulty = "all";
    quizState.exploreSearchQuery = "";
    quizState.exploreSort = "count";
    renderExploreView(container);
  }

  // ============================================
  // 3. DISTRACTION-FREE QUIZ RUNNER VIEW
  // ============================================
  function renderQuizRunnerView(container) {
    const currentQ = getCurrentQuestion();
    if (!currentQ) return;

    const qNum = quizState.currentQuestionIndex + 1;
    const totalQ = quizState.questions.length;
    const progressPct = Math.round((qNum / totalQ) * 100);
    const isSaved = Storage.isBookmarked(currentQ.id);

    const categories = QuestionService.getCategories();
    const catObj = categories[currentQ.category] || { title: currentQ.category || "General" };

    const letters = ["A", "B", "C", "D"];
    let optionsHTML = currentQ.options.map((optText, idx) => {
      const safeText = escapeHTML(optText);
      const isSelected = quizState.selectedAnswer === idx;
      const isCorrectOpt = idx === currentQ.correctAnswer;
      const isDisabledFifty = quizState.disabledOptions.includes(idx);

      let optionClasses = ["option-btn"];
      if (isDisabledFifty) {
        optionClasses.push("disabled-fifty");
      }
      if (quizState.isAnswered) {
        if (isCorrectOpt) {
          optionClasses.push("correct");
        } else if (isSelected && !isCorrectOpt) {
          optionClasses.push("incorrect");
        }
      } else if (isSelected) {
        optionClasses.push("selected");
      }

      return `
        <button type="button" class="${optionClasses.join(" ")}" data-index="${idx}" ${quizState.isAnswered || isDisabledFifty ? 'disabled' : ''}>
          <span class="option-letter-badge">${letters[idx]}</span>
          <span class="option-text-wrap">${safeText}</span>
          ${quizState.isAnswered && isCorrectOpt ? `
            <span style="color: var(--color-success); margin-left: auto;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          ` : ''}
          ${quizState.isAnswered && isSelected && !isCorrectOpt ? `
            <span style="color: var(--color-danger); margin-left: auto;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </span>
          ` : ''}
        </button>
      `;
    }).join("");

    container.innerHTML = `
      <div class="quiz-runner-wrap fade-in">
        <div class="card quiz-runner-card">
          <!-- Quiz Top Info -->
          <div class="quiz-runner-top">
            <div class="quiz-meta-group">
              <span class="quiz-num-pill">Question ${qNum} of ${totalQ}</span>
              <span class="badge badge-neutral">${escapeHTML(catObj.title)}</span>
              <span class="badge badge-${currentQ.difficulty}">${currentQ.difficulty}</span>
            </div>

            <div class="quiz-meta-group">
              ${quizState.currentStreak >= 2 ? `
                <span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: var(--color-warning);">
                  🔥 ${quizState.currentStreak}x Streak
                </span>
              ` : ''}

              ${quizState.isTimedMode ? `
                <div class="timer-pill ${quizState.timerSecondsRemaining <= 5 ? 'warning' : ''}" id="quiz-timer-display">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>${quizState.timerSecondsRemaining}s</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="quiz-progress-track">
            <div class="quiz-progress-fill" style="width: ${progressPct}%;"></div>
          </div>

          <!-- Lifelines Toolbar -->
          <div class="lifelines-row">
            <button type="button" class="lifeline-pill-btn" id="lifeline-fifty-btn" ${!quizState.lifelines.fiftyFifty || quizState.isAnswered ? 'disabled' : ''} title="Eliminate 2 wrong answers">
              🪄 50:50
            </button>
            <button type="button" class="lifeline-pill-btn" id="lifeline-hint-btn" ${!quizState.lifelines.hint || quizState.isAnswered ? 'disabled' : ''} title="Reveal question hint">
              💡 Hint
            </button>
            <button type="button" class="lifeline-pill-btn" id="lifeline-skip-btn" ${!quizState.lifelines.skip || quizState.isAnswered ? 'disabled' : ''} title="Skip this question">
              ⏭️ Skip
            </button>
          </div>

          <!-- Question Prompt -->
          <h2 class="question-heading">${escapeHTML(currentQ.question)}</h2>

          <!-- Hint Reveal Card -->
          ${quizState.hintVisible && currentQ.hint ? `
            <div class="hint-callout fade-in">
              <span style="display: flex;">💡</span>
              <div>
                <strong>Hint:</strong> ${escapeHTML(currentQ.hint)}
              </div>
            </div>
          ` : ''}

          <!-- Options Grid -->
          <div class="options-stack">
            ${optionsHTML}
          </div>

          <!-- Answer Explanation Callout (Shown after answering) -->
          ${quizState.isAnswered && currentQ.explanation ? `
            <div class="explanation-callout fade-in">
              <span class="explanation-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Key Takeaway & Concept Explanation
              </span>
              <p>${escapeHTML(currentQ.explanation)}</p>
            </div>
          ` : ''}

          <!-- Controls Footer -->
          <div class="quiz-controls-row">
            <button type="button" class="bookmark-action-btn ${isSaved ? 'saved' : ''}" id="quiz-bookmark-btn">
              ${isSaved ? '★ Bookmarked' : '☆ Save to Study Bank'}
            </button>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <button type="button" class="btn btn-ghost" id="quiz-quit-btn">Quit Quiz</button>

              ${quizState.isAnswered ? `
                <button type="button" class="btn btn-primary" id="quiz-next-btn">
                  ${qNum === totalQ ? 'See Final Results 🎉' : 'Next Question →'}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        handleOptionSelection(idx);
      });
    });

    const fiftyBtn = document.getElementById("lifeline-fifty-btn");
    if (fiftyBtn) {
      fiftyBtn.addEventListener("click", () => {
        if (useFiftyFiftyLifeline()) {
          if (typeof SoundEngine !== "undefined") SoundEngine.lifeline();
          renderActiveView();
        }
      });
    }

    const hintBtn = document.getElementById("lifeline-hint-btn");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        if (useHintLifeline()) {
          if (typeof SoundEngine !== "undefined") SoundEngine.lifeline();
          renderActiveView();
        }
      });
    }

    const skipBtn = document.getElementById("lifeline-skip-btn");
    if (skipBtn) {
      skipBtn.addEventListener("click", () => {
        if (useSkipLifeline()) {
          if (typeof SoundEngine !== "undefined") SoundEngine.click();
          renderActiveView();
          if (!quizState.isFinished && quizState.isTimedMode) {
            startActiveQuestionTimer();
          }
        }
      });
    }

    const bookmarkBtn = document.getElementById("quiz-bookmark-btn");
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", () => {
        const isNowSaved = Storage.toggleBookmark(currentQ);
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        showToast(isNowSaved ? "Saved to Study Bank" : "Removed from Study Bank", "info");
        renderActiveView();
        renderNavigation();
      });
    }

    const nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        advanceToNextQuestionOrFinish();
      });
    }

    const quitBtn = document.getElementById("quiz-quit-btn");
    if (quitBtn) {
      quitBtn.addEventListener("click", () => {
        showConfirmModal({
          title: "Quit Active Quiz?",
          message: "Are you sure you want to exit? Your progress in this quiz session will not be saved.",
          confirmText: "Quit Session",
          isDanger: true,
          onConfirm: () => {
            stopQuizTimer();
            quizState.questions = [];
            renderActiveView();
          }
        });
      });
    }
  }

  function handleOptionSelection(selectedIndex) {
    const isCorrect = selectAnswer(selectedIndex);
    if (typeof SoundEngine !== "undefined") {
      if (isCorrect) {
        if (quizState.currentStreak >= 3) {
          SoundEngine.streak();
        } else {
          SoundEngine.correct();
        }
      } else {
        SoundEngine.incorrect();
      }
    }
    renderActiveView();
  }

  function startActiveQuestionTimer() {
    startQuizTimer(
      (remSec) => {
        const timerDisplay = document.getElementById("quiz-timer-display");
        if (timerDisplay) {
          timerDisplay.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${remSec}s</span>
          `;
          if (remSec <= 5) {
            timerDisplay.classList.add("warning");
            if (typeof SoundEngine !== "undefined") SoundEngine.timerTick();
          }
        }
      },
      () => {
        // Time expired! Register timed-out answer
        handleOptionSelection(-1);
      }
    );
  }

  function advanceToNextQuestionOrFinish() {
    if (typeof SoundEngine !== "undefined") SoundEngine.click();
    moveToNextQuestion();

    if (quizState.isFinished) {
      finishAndSaveQuizRun();
    } else {
      renderActiveView();
      if (quizState.isTimedMode) {
        startActiveQuestionTimer();
      }
    }
  }

  function finishAndSaveQuizRun() {
    stopQuizTimer();
    const pct = calculatePercentage();
    const catTitle = CATEGORIES[quizState.activeCategory] 
      ? CATEGORIES[quizState.activeCategory].title 
      : (quizState.quizTitle || "Comprehensive Tech");

    const savedEntry = Storage.saveQuizResult({
      category: quizState.activeCategory,
      categoryTitle: catTitle,
      score: quizState.score,
      total: quizState.questions.length,
      percentage: pct,
      timeTakenSec: quizState.elapsedTimeSec,
      difficulty: quizState.activeDifficulty,
      mode: quizState.quizMode
    });

    if (pct >= 70) {
      if (typeof Confetti !== "undefined") Confetti.launch(110);
      if (typeof SoundEngine !== "undefined") SoundEngine.finish();
    }

    renderActiveView();
  }

  // ============================================
  // 4. RESULTS VIEW
  // ============================================
  function renderResultsView(container) {
    const totalQ = quizState.questions.length;
    const score = quizState.score;
    const pct = calculatePercentage();
    const incorrectAnswers = quizState.userAnswers.filter((a) => !a.isCorrect);

    let grade = "C";
    let titleMsg = "Good Effort!";
    let subMsg = "Review your missed questions below and retake the quiz to solidify your understanding.";

    if (pct === 100) {
      grade = "S";
      titleMsg = "Flawless Mastery! 🏆";
      subMsg = "Incredible performance! You answered every question correctly.";
    } else if (pct >= 85) {
      grade = "A";
      titleMsg = "Outstanding Performance! 🌟";
      subMsg = "You demonstrated strong mastery of the concepts covered.";
    } else if (pct >= 70) {
      grade = "B";
      titleMsg = "Solid Understanding! 👍";
      subMsg = "Well done! A few areas need review to reach complete mastery.";
    }

    const letters = ["A", "B", "C", "D"];

    // Question Review HTML
    let reviewHTML = quizState.userAnswers.map((ans, idx) => {
      const q = ans.question;
      const isSaved = Storage.isBookmarked(q.id);
      const userChoiceStr = ans.selectedIndex >= 0 
        ? `${letters[ans.selectedIndex]}. ${escapeHTML(q.options[ans.selectedIndex])}` 
        : "(Timed out / Skipped)";
      const correctStr = `${letters[q.correctAnswer]}. ${escapeHTML(q.options[q.correctAnswer])}`;

      return `
        <div class="card review-card ${ans.isCorrect ? 'correct-item' : 'incorrect-item'} fade-in" data-review-idx="${idx}" data-is-correct="${ans.isCorrect}">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
            <div class="review-q-title">Q${idx + 1}: ${escapeHTML(q.question)}</div>
            <button type="button" class="btn btn-ghost btn-sm result-bookmark-btn" data-qid="${q.id}">
              ${isSaved ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          </div>

          <div class="review-ans-row">
            Your Choice: <strong>${userChoiceStr}</strong> ${ans.isCorrect ? '✅' : '❌'}
          </div>

          ${!ans.isCorrect ? `
            <div class="review-ans-row" style="color: var(--color-success);">
              Correct Answer: <strong>${correctStr}</strong>
            </div>
          ` : ''}

          ${q.explanation ? `
            <div class="review-explanation">
              <strong>Key Explanation:</strong> ${escapeHTML(q.explanation)}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="results-container fade-in">
        <div class="card results-summary-card">
          <!-- Grade Ring -->
          <div class="grade-badge-ring">
            <div class="grade-badge-center">
              <div class="grade-letter">${grade}</div>
              <div class="grade-pct">${pct}%</div>
            </div>
          </div>

          <h2 class="results-title">${titleMsg}</h2>
          <p class="results-subtitle">${subMsg}</p>

          <!-- Metrics Row -->
          <div class="results-metrics-grid">
            <div class="metric-card">
              <div class="metric-card-val">${score} / ${totalQ}</div>
              <div class="metric-card-label">Score</div>
            </div>
            <div class="metric-card">
              <div class="metric-card-val">${pct}%</div>
              <div class="metric-card-label">Accuracy</div>
            </div>
            <div class="metric-card">
              <div class="metric-card-val">${quizState.elapsedTimeSec}s</div>
              <div class="metric-card-label">Time Taken</div>
            </div>
            <div class="metric-card">
              <div class="metric-card-val">${quizState.maxStreak}x</div>
              <div class="metric-card-label">Max Streak</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="results-actions-row">
            <button type="button" class="btn btn-primary" id="retake-quiz-btn">
              🔄 Retake Quiz
            </button>

            ${incorrectAnswers.length > 0 ? `
              <button type="button" class="btn btn-secondary" id="practice-mistakes-btn">
                ⚡ Practice Missed (${incorrectAnswers.length})
              </button>
            ` : ''}

            <button type="button" class="btn btn-ghost" id="return-hub-btn">
              🏠 Back to Quiz Hub
            </button>

            <button type="button" class="btn btn-ghost" id="share-summary-btn">
              📋 Copy Summary
            </button>
          </div>
        </div>

        <!-- Question Review Accordion -->
        <div class="review-section">
          <div class="review-header">
            <h3>Question-by-Question Review</h3>
            <div class="chip-group">
              <button type="button" class="chip-btn active" data-filter-review="all">All (${totalQ})</button>
              <button type="button" class="chip-btn" data-filter-review="correct">Correct (${score})</button>
              <button type="button" class="chip-btn" data-filter-review="incorrect">Incorrect (${incorrectAnswers.length})</button>
            </div>
          </div>

          <div id="review-cards-list">
            ${reviewHTML}
          </div>
        </div>
      </div>
    `;

    // Event Listeners for Results
    const retakeBtn = document.getElementById("retake-quiz-btn");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        if (quizState.quizMode === "daily") {
          initializeDailyChallengeQuiz();
        } else if (quizState.quizMode === "study_bank") {
          initializeStudyBankQuiz();
        } else {
          initializeStandardQuiz(quizState.activeCategory, quizState.activeDifficulty);
        }
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    const mistakesBtn = document.getElementById("practice-mistakes-btn");
    if (mistakesBtn) {
      mistakesBtn.addEventListener("click", () => {
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        const missedQs = incorrectAnswers.map((a) => a.question);
        initializePracticeIncorrectQuiz(missedQs);
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    const returnHubBtn = document.getElementById("return-hub-btn");
    if (returnHubBtn) {
      returnHubBtn.addEventListener("click", () => {
        quizState.isFinished = false;
        quizState.questions = [];
        renderActiveView();
      });
    }

    const shareBtn = document.getElementById("share-summary-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        const text = `🎯 I scored ${score}/${totalQ} (${pct}%) on QuizePro ${quizState.quizTitle}!`;
        navigator.clipboard.writeText(text).then(() => {
          showToast("Summary copied to clipboard!", "success");
        }).catch(() => {
          showToast("Unable to copy to clipboard", "danger");
        });
      });
    }

    // Review Filters
    container.querySelectorAll(".chip-btn[data-filter-review]").forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".chip-btn[data-filter-review]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.getAttribute("data-filter-review");
        const cards = container.querySelectorAll(".review-card");

        cards.forEach((card) => {
          const isCorrect = card.getAttribute("data-is-correct") === "true";
          if (filter === "all") {
            card.style.display = "block";
          } else if (filter === "correct") {
            card.style.display = isCorrect ? "block" : "none";
          } else if (filter === "incorrect") {
            card.style.display = !isCorrect ? "block" : "none";
          }
        });
      });
    });

    container.querySelectorAll(".result-bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const targetAns = quizState.userAnswers.find((a) => a.question.id === qid);
        if (targetAns) {
          const isSaved = Storage.toggleBookmark(targetAns.question);
          btn.textContent = isSaved ? "★ Bookmarked" : "☆ Bookmark";
          showToast(isSaved ? "Saved to Study Bank" : "Removed from Study Bank", "info");
          renderNavigation();
        }
      });
    });
  }

  // ============================================
  // 5. PERFORMANCE VIEW (Analytics & History)
  // ============================================
  function renderPerformanceView(container) {
    const analytics = Storage.getAnalytics();
    let history = Storage.getHistory();
    const categories = QuestionService.getCategories();

    // 1. Last 5 Exam Telemetry Calculation (Fit in single row)
    const recent5 = history.slice(0, 5); // Index 0 is newest
    const recentAvgAcc = recent5.length > 0 
      ? Math.round(recent5.reduce((sum, h) => sum + (h.percentage || 0), 0) / recent5.length)
      : 0;

    const examCardsHTML = Array.from({ length: 5 }, (_, i) => {
      const exam = recent5[i];
      if (exam) {
        const radius = 18;
        const circ = 2 * Math.PI * radius; // ~113.1
        const pct = Math.min(100, Math.max(0, Math.round(exam.percentage || 0)));
        const offset = (circ * (1 - pct / 100)).toFixed(2);
        
        let strokeColor = "#10b981"; // emerald
        if (pct < 60) strokeColor = "#f43f5e"; // rose
        else if (pct < 80) strokeColor = "#f59e0b"; // amber

        const isLatest = i === 0;
        const examNum = history.length - i;
        const catObj = categories[exam.category] || null;
        const diffBadgeClass = `badge-${exam.difficulty || 'medium'}`;

        return `
          <div class="card exam-stat-card ${isLatest ? 'is-latest' : ''} fade-in">
            <div class="exam-card-head">
              <span class="exam-number-tag">Exam #${examNum}</span>
              <div style="display:flex; align-items:center; gap: 4px;">
                ${isLatest ? `<span class="badge badge-sm badge-latest">Latest</span>` : ''}
                <span class="badge badge-sm ${diffBadgeClass}">${escapeHTML(exam.difficulty || 'med')}</span>
              </div>
            </div>

            <!-- SVG Gauge Meter -->
            <div class="exam-gauge-wrap">
              <svg class="exam-gauge-svg" viewBox="0 0 48 48">
                <circle class="exam-gauge-track" cx="24" cy="24" r="${radius}" />
                <circle class="exam-gauge-bar" cx="24" cy="24" r="${radius}" 
                  stroke="${strokeColor}" 
                  stroke-dasharray="${circ.toFixed(2)}" 
                  stroke-dashoffset="${offset}" />
              </svg>
              <div class="exam-gauge-center-text">
                <span class="exam-gauge-pct">${pct}%</span>
                <span class="exam-gauge-sub">ACC</span>
              </div>
            </div>

            <div class="exam-topic-tag" title="${escapeHTML(exam.categoryTitle || 'General')}">
              <span class="exam-topic-dot" style="background: ${catObj ? catObj.color : 'var(--accent-primary)'};"></span>
              <span class="exam-topic-name">${escapeHTML(exam.categoryTitle || 'General')}</span>
            </div>

            <div class="exam-stats-strip">
              <div class="exam-strip-stat">
                <span class="exam-stat-value">${exam.score}/${exam.total}</span>
                <span class="exam-stat-label">Score</span>
              </div>
              <div class="exam-strip-div"></div>
              <div class="exam-strip-stat">
                <span class="exam-stat-value">${exam.timeTakenSec}s</span>
                <span class="exam-stat-label">Time</span>
              </div>
              <div class="exam-strip-div"></div>
              <div class="exam-strip-stat">
                <span class="exam-stat-value">${escapeHTML(exam.date.split(',')[0] || exam.date)}</span>
                <span class="exam-stat-label">Date</span>
              </div>
            </div>
          </div>
        `;
      } else {
        const slotNum = i + 1;
        return `
          <div class="card exam-stat-card is-empty fade-in">
            <div class="exam-card-head">
              <span class="exam-number-tag muted">Slot #${slotNum}</span>
              <span class="badge badge-sm badge-slot-pending">Awaiting</span>
            </div>

            <div class="exam-gauge-wrap is-empty">
              <svg class="exam-gauge-svg" viewBox="0 0 48 48">
                <circle class="exam-gauge-track-empty" cx="24" cy="24" r="18" />
              </svg>
              <div class="exam-gauge-center-text">
                <span class="exam-gauge-empty-dash">—</span>
              </div>
            </div>

            <div class="exam-topic-tag muted">
              <span class="exam-topic-dot muted"></span>
              <span class="exam-topic-name">Unattempted Slot</span>
            </div>

            <div class="exam-empty-cta">
              <button type="button" class="btn-slot-practice launch-exam-slot-btn" data-slot="${slotNum}">
                <span>Practice Drill</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        `;
      }
    }).join("");

    // 2. GitHub Contribution Calendar Calculation (BASED ON TESTS / QUIZZES COMPLETED)
    const monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const numWeeks = 52;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - todayDayOfWeek - ((numWeeks - 1) * 7));
    startDate.setHours(0, 0, 0, 0);

    const historyByDate = {};
    history.forEach((h) => {
      if (!h.timestamp) return;
      const d = new Date(h.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      historyByDate[key] = (historyByDate[key] || 0) + 1; // 1 test / quiz completed
    });

    let totalYearTests = 0;
    let activeDaysCount = 0;
    let lastMonth = -1;
    const monthHeaderCols = {};

    let scanDate = new Date(startDate);
    for (let w = 0; w < numWeeks; w++) {
      const m = scanDate.getMonth();
      if (m !== lastMonth && scanDate.getDate() <= 14) {
        monthHeaderCols[w] = monthsArr[m];
        lastMonth = m;
      }
      scanDate.setDate(scanDate.getDate() + 7);
    }

    const monthsHeaderHTML = Array.from({ length: numWeeks }, (_, w) => `
      <div class="contrib-month-cell">
        ${monthHeaderCols[w] ? `<span class="contrib-month-text">${monthHeaderCols[w]}</span>` : ''}
      </div>
    `).join("");

    let currDate = new Date(startDate);
    const weeksColumnsHTML = Array.from({ length: numWeeks }, () => {
      const daysHTML = Array.from({ length: 7 }, () => {
        const key = `${currDate.getFullYear()}-${String(currDate.getMonth() + 1).padStart(2, "0")}-${String(currDate.getDate()).padStart(2, "0")}`;
        const count = historyByDate[key] || 0;
        const isFuture = currDate > today;
        const isToday = currDate.toDateString() === today.toDateString();
        const formattedDate = currDate.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        if (!isFuture && count > 0) {
          totalYearTests += count;
          activeDaysCount++;
        }

        let level = 0;
        if (count > 0) {
          if (count === 1) level = 1;
          else if (count === 2) level = 2;
          else if (count <= 4) level = 3;
          else level = 4;
        }

        const tooltip = isFuture 
          ? '' 
          : (count > 0 
              ? `${count} ${count === 1 ? 'test' : 'tests'} completed on ${formattedDate}` 
              : `No tests on ${formattedDate}`);

        const cellHTML = isFuture
          ? `<div class="contrib-cell is-future"></div>`
          : `<div class="contrib-cell level-${level} ${isToday ? 'is-today' : ''}" data-tooltip="${escapeHTML(tooltip)}"></div>`;

        currDate.setDate(currDate.getDate() + 1);
        return cellHTML;
      }).join("");

      return `<div class="contrib-week-col">${daysHTML}</div>`;
    }).join("");

    // 3. Achievements with Difficulty Tiers
    const ACH_ICONS = {
      zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      compass: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      flame: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
      timer: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      trophy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
      target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      crown: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`
    };

    const unlockedCount = analytics.achievements.filter((a) => a.unlocked).length;
    const bronzeCount = analytics.achievements.filter((a) => a.tier === "bronze").length;
    const silverCount = analytics.achievements.filter((a) => a.tier === "silver").length;
    const goldCount = analytics.achievements.filter((a) => a.tier === "gold").length;
    const diamondCount = analytics.achievements.filter((a) => a.tier === "diamond").length;

    const achievementsHTML = analytics.achievements.map((ach) => {
      const iconSvg = ACH_ICONS[ach.iconType] || ACH_ICONS.zap;
      const pct = Math.round(ach.progress * 100);
      return `
        <div class="card achievement-card tier-${ach.tier} ${ach.unlocked ? 'unlocked' : 'locked'} fade-in" data-tier="${ach.tier}">
          <div class="ach-card-top">
            <div class="ach-icon-container ${ach.unlocked ? 'unlocked' : ''}">
              ${iconSvg}
              ${ach.unlocked ? `<span class="ach-badge-check" title="Unlocked">✓</span>` : `<span class="ach-badge-lock" title="Locked"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>`}
            </div>
            <div class="ach-badges-stack">
              <span class="ach-tier-pill tier-${ach.tier}">${ach.tierLabel}</span>
              ${ach.unlocked 
                ? `<span class="badge badge-sm badge-success" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">Unlocked</span>` 
                : `<span class="badge badge-sm badge-muted" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">In Progress</span>`}
            </div>
          </div>
          <div class="ach-body">
            <h4 class="ach-title">${escapeHTML(ach.title)}</h4>
            <p class="ach-desc">${escapeHTML(ach.desc)}</p>
          </div>
          <div class="ach-progress-section">
            <div class="ach-metric-labels">
              <span class="ach-metric-val">${escapeHTML(ach.metric)}</span>
              <span class="ach-metric-pct">${pct}%</span>
            </div>
            <div class="ach-prog-bar">
              <div class="ach-prog-fill tier-${ach.tier}" style="width: ${pct}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // History Table Rows
    let historyRowsHTML = "";
    if (history.length === 0) {
      historyRowsHTML = "";
    } else {
      historyRowsHTML = history.map((h) => {
        const catObj = categories[h.category] || null;
        const catColor = catObj ? catObj.color : 'var(--accent-primary)';
        let scoreBadgeClass = "badge-success";
        if (h.percentage < 60) scoreBadgeClass = "badge-danger";
        else if (h.percentage < 80) scoreBadgeClass = "badge-warning";
        return `
        <tr data-history-cat="${h.category}">
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="width:8px; height:8px; border-radius:50%; background:${catColor}; flex-shrink:0;"></span>
              <strong>${escapeHTML(h.categoryTitle)}</strong>
            </div>
          </td>
          <td><span class="badge badge-${h.difficulty}">${h.difficulty}</span></td>
          <td>
            <div style="display:flex; align-items:center; gap:6px;">
              <strong>${h.score}/${h.total}</strong>
              <span class="badge badge-sm ${scoreBadgeClass}" style="font-size:0.7rem; padding:0.15rem 0.45rem;">${h.percentage}%</span>
            </div>
          </td>
          <td>
            <span style="display:inline-flex; align-items:center; gap:4px; font-family:var(--font-mono); font-size:0.8rem; color:var(--text-secondary);">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${h.timeTakenSec}s
            </span>
          </td>
          <td><span style="font-size:0.82rem; color:var(--text-secondary);">${escapeHTML(h.date)} ${escapeHTML(h.time || '')}</span></td>
          <td>
            <button type="button" class="btn btn-ghost btn-sm delete-history-entry-btn" data-id="${h.id}" title="Delete entry" style="color: var(--color-danger); padding: 0.2rem 0.5rem;">
              ✕
            </button>
          </td>
        </tr>
      `;
      }).join("");
    }

    container.innerHTML = `
      <div class="fade-in perf-view-wrapper">
        <!-- 1. Hero Header Banner with Atmospheric Glow & Quick Actions -->
        <div class="perf-hero-header fade-in">
          <div class="perf-hero-header-text">
            <div class="perf-status-badge">
              <span class="perf-pulse-dot"></span>
              <span>LIVE TELEMETRY & DRILL STATS</span>
            </div>
            <h1 class="perf-page-heading">Performance & <span class="text-gradient-brand">Analytics</span></h1>
            <p class="perf-page-lead">Real-time metrics, comprehensive question telemetry, and historical mastery logs calculated directly from your practice sessions.</p>
          </div>
          <div class="perf-hero-actions">
            <button type="button" class="btn btn-primary btn-glow" id="perf-start-quiz-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Start Practice Drill</span>
            </button>
            <button type="button" class="btn btn-secondary" id="perf-config-quiz-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>Custom Drill</span>
            </button>
          </div>
        </div>

        <!-- 2. Overview Metric Cards (Total Questions Solved, Completed Quizzes, Average Accuracy) -->
        <div class="analytics-overview-grid">
          <!-- Card 1: Total Questions Solved -->
          <div class="card stat-widget perf-stat-widget perf-stat-cyan">
            <div class="perf-stat-bg-glow"></div>
            <div class="stat-widget-top">
              <div class="stat-widget-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="m9 15 2 2 4-4"/>
                </svg>
              </div>
              <span class="perf-stat-badge-chip cyan">
                <span class="perf-chip-dot"></span>
                <span>Drill Volume</span>
              </span>
            </div>
            <div class="stat-widget-body">
              <div class="stat-widget-val">${analytics.totalQuestions}</div>
              <div class="stat-widget-lbl">Total Questions Solved</div>
            </div>
            <div class="stat-widget-footer">
              <div class="stat-sub-text">
                <span class="sub-correct-count"><strong>${analytics.totalCorrect}</strong> correct</span>
                <span class="sub-sep">•</span>
                <span class="sub-acc-count">${analytics.averageAccuracy}% accuracy</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Completed Quizzes -->
          <div class="card stat-widget perf-stat-widget perf-stat-purple">
            <div class="perf-stat-bg-glow"></div>
            <div class="stat-widget-top">
              <div class="stat-widget-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              </div>
              <span class="perf-stat-badge-chip purple">
                <span>Quiz Sessions</span>
              </span>
            </div>
            <div class="stat-widget-body">
              <div class="stat-widget-val">${analytics.totalQuizzes}</div>
              <div class="stat-widget-lbl">Completed Quizzes</div>
            </div>
            <div class="stat-widget-footer">
              <div class="stat-sub-text">
                <span>${analytics.totalQuizzes === 1 ? '1 full test completed' : `${analytics.totalQuizzes} full tests completed`}</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Average Accuracy -->
          <div class="card stat-widget perf-stat-widget perf-stat-emerald">
            <div class="perf-stat-bg-glow"></div>
            <div class="stat-widget-top">
              <div class="stat-widget-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <span class="perf-stat-badge-chip emerald">
                <span>Precision</span>
              </span>
            </div>
            <div class="stat-widget-body">
              <div class="stat-widget-val">${analytics.averageAccuracy}%</div>
              <div class="stat-widget-lbl">Average Accuracy</div>
            </div>
            <div class="stat-widget-footer">
              <div class="accuracy-mini-track">
                <div class="accuracy-mini-fill" style="width: ${analytics.averageAccuracy}%;"></div>
              </div>
              <div class="stat-sub-text">
                <span>${analytics.averageAccuracy >= 80 ? '🌟 Mastery Level' : analytics.averageAccuracy >= 60 ? '⚡ Good Progress' : '🌱 Foundational'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Recent Exam Performance (Last 5 Sessions in Single Row) -->
        <div class="last-exams-section fade-in" style="margin-bottom: 2rem;">
          <div class="last-exams-header">
            <div>
              <div class="last-exams-title-row">
                <span class="last-exams-header-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </span>
                <h3 style="margin: 0; font-size: 1.15rem;">Recent Exam Performance (Last 5 Quizzes)</h3>
              </div>
              <p style="font-size: 0.83rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">
                Direct telemetry and accuracy metrics across your latest 5 exam attempts.
              </p>
            </div>
            ${recent5.length > 0 ? `
              <div class="last-exams-avg-badge">
                <span class="exam-avg-label">Recent Average:</span>
                <span class="exam-avg-val">${recentAvgAcc}%</span>
              </div>
            ` : ''}
          </div>

          <div class="last-exams-grid">
            ${examCardsHTML}
          </div>
        </div>

        <!-- 4. GitHub-Style Practice Activity Calendar -->
        <div class="card contribution-chart-card fade-in" style="margin-bottom: 2rem; position: relative;">
          <!-- Floating Interactive Tooltip Bubble -->
          <div class="contrib-floating-tooltip" id="contrib-floating-tooltip"></div>

          <div class="contribution-chart-header">
            <div>
              <div class="contribution-title-row">
                <span class="contrib-github-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <h3 style="margin: 0; font-size: 1.15rem;">Practice Activity Calendar</h3>
              </div>
              <p class="contribution-subtitle">${totalYearTests} ${totalYearTests === 1 ? 'test' : 'tests'} completed in the last year</p>
            </div>

            <div class="contribution-header-stats">
              <span class="contrib-stat-badge">
                <span class="contrib-stat-num">${activeDaysCount}</span> active days
              </span>
              <span class="contrib-stat-badge">
                <span class="contrib-stat-num">${analytics.totalQuestions}</span> questions solved
              </span>
            </div>
          </div>

          <div class="contribution-graph-scroll">
            <div class="contribution-graph-wrap">
              <!-- Months header row -->
              <div class="contrib-months-track">
                <div class="contrib-axis-spacer"></div>
                <div class="contrib-months-row">
                  ${monthsHeaderHTML}
                </div>
              </div>

              <!-- Main grid: weekday labels + 52 week columns -->
              <div class="contrib-grid-body">
                <div class="contrib-weekdays-col">
                  <span></span>
                  <span>Mon</span>
                  <span></span>
                  <span>Wed</span>
                  <span></span>
                  <span>Fri</span>
                  <span></span>
                </div>

                <div class="contrib-weeks-container">
                  ${weeksColumnsHTML}
                </div>
              </div>
            </div>
          </div>

          <div class="contribution-chart-footer">
            <div class="contribution-footnote">
              ${analytics.totalQuestions > 0 
                ? `🎯 <strong>${analytics.totalQuestions} questions solved</strong> across completed practice sessions. Keep drilling daily!` 
                : 'Complete quiz tests daily to build your practice activity calendar.'}
            </div>

            <div class="contribution-legend">
              <span class="legend-label">Less</span>
              <span class="contrib-cell level-0" data-tooltip="0 tests"></span>
              <span class="contrib-cell level-1" data-tooltip="1 test"></span>
              <span class="contrib-cell level-2" data-tooltip="2 tests"></span>
              <span class="contrib-cell level-3" data-tooltip="3-4 tests"></span>
              <span class="contrib-cell level-4" data-tooltip="5+ tests"></span>
              <span class="legend-label">More</span>
            </div>
          </div>
        </div>

        <!-- 5. Achievements & Milestones (Categorized by Difficulty Tiers) -->
        <div class="achievements-section fade-in" style="margin-bottom: 2.5rem;">
          <div class="achievements-header-bar">
            <div>
              <div class="achievements-title-row">
                <span class="achievements-header-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                </span>
                <h3 style="margin: 0; font-size: 1.15rem;">Achievements & Milestones</h3>
              </div>
              <p style="font-size: 0.83rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">
                Unlock milestone badges across 4 difficulty tiers as you progress in technical mastery.
              </p>
            </div>

            <!-- Stats Summary Pill -->
            <div class="achievements-stats-pill">
              <div class="ach-summary-text">
                <strong>${unlockedCount} of ${analytics.achievements.length}</strong> Unlocked
              </div>
              <div class="ach-summary-track">
                <div class="ach-summary-fill" style="width: ${Math.round((unlockedCount / analytics.achievements.length) * 100)}%;"></div>
              </div>
            </div>
          </div>

          <!-- Difficulty Tier Filter Tabs -->
          <div class="ach-tier-tabs" id="ach-tier-tabs">
            <button type="button" class="ach-tab-btn active" data-filter="all">All Tiers <span class="tab-count">${analytics.achievements.length}</span></button>
            <button type="button" class="ach-tab-btn" data-filter="bronze"><span class="tier-dot bronze"></span> Bronze <span class="tab-count">${bronzeCount}</span></button>
            <button type="button" class="ach-tab-btn" data-filter="silver"><span class="tier-dot silver"></span> Silver <span class="tab-count">${silverCount}</span></button>
            <button type="button" class="ach-tab-btn" data-filter="gold"><span class="tier-dot gold"></span> Gold <span class="tab-count">${goldCount}</span></button>
            <button type="button" class="ach-tab-btn" data-filter="diamond"><span class="tier-dot diamond"></span> Diamond <span class="tab-count">${diamondCount}</span></button>
          </div>

          <!-- Achievements Grid -->
          <div class="achievements-grid" id="achievements-grid">
            ${achievementsHTML}
          </div>
        </div>

        <!-- 6. Quiz History Table & Showcase -->
        <div class="card perf-history-card" style="padding: 1.6rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span style="color:var(--accent-primary); display:flex;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                </span>
                <h3 style="margin: 0; font-size: 1.15rem;">Attempt History Logs</h3>
              </div>
              <p style="font-size: 0.83rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">Complete record of your completed quiz sessions and telemetry.</p>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <select id="history-filter-cat" class="filter-select">
                <option value="all">All Topics</option>
                ${Object.values(categories).map((c) => `<option value="${c.id}">${escapeHTML(c.title)}</option>`).join("")}
              </select>

              ${history.length > 0 ? `
                <button type="button" class="btn btn-ghost btn-sm" id="clear-history-action-btn" style="color: var(--color-danger);">
                  Clear History Logs
                </button>
              ` : ''}
            </div>
          </div>

          ${history.length === 0 ? `
            <div class="empty-history-showcase fade-in">
              <div class="empty-history-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h4 class="empty-history-title">No Quiz Attempts Recorded Yet</h4>
              <p class="empty-history-desc">Start answering interactive question drills across technical domains to build your personal telemetry.</p>
              <button type="button" class="btn btn-primary btn-sm" id="empty-history-start-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Take Your First Quiz</span>
              </button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="app-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Difficulty</th>
                    <th>Score</th>
                    <th>Duration</th>
                    <th>Timestamp</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="history-table-body">
                  ${historyRowsHTML}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    // 4. Interactive Listeners for Performance View
    // Performance Header Quick Action Buttons
    const startDrillBtn = container.querySelector("#perf-start-quiz-btn");
    if (startDrillBtn) {
      startDrillBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    const configDrillBtn = container.querySelector("#perf-config-quiz-btn");
    if (configDrillBtn) {
      configDrillBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    const emptyHistoryBtn = container.querySelector("#empty-history-start-btn");
    if (emptyHistoryBtn) {
      emptyHistoryBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    // Exam slot empty buttons
    container.querySelectorAll(".launch-exam-slot-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    });

    // Setup interactive floating tooltip for Contribution Heatmap
    const tooltipBubble = container.querySelector("#contrib-floating-tooltip");
    const chartCard = container.querySelector(".contribution-chart-card");
    if (tooltipBubble && chartCard) {
      container.querySelectorAll(".contrib-cell[data-tooltip]").forEach((cell) => {
        cell.addEventListener("mouseenter", () => {
          const text = cell.getAttribute("data-tooltip");
          if (!text) return;
          tooltipBubble.textContent = text;
          tooltipBubble.classList.add("visible");
          const cellRect = cell.getBoundingClientRect();
          const cardRect = chartCard.getBoundingClientRect();
          tooltipBubble.style.left = Math.round(cellRect.left - cardRect.left + cellRect.width / 2) + "px";
          tooltipBubble.style.top = Math.round(cellRect.top - cardRect.top - 34) + "px";
        });
        cell.addEventListener("mouseleave", () => {
          tooltipBubble.classList.remove("visible");
        });
      });
      chartCard.addEventListener("mouseleave", () => {
        tooltipBubble.classList.remove("visible");
      });
      window.addEventListener("resize", () => {
        tooltipBubble.classList.remove("visible");
      }, { passive: true });
    }

    // Setup difficulty tier filter tabs for Achievements
    const achGrid = container.querySelector("#achievements-grid");
    const achTabs = container.querySelectorAll(".ach-tab-btn");
    achTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        achTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const filter = tab.getAttribute("data-filter");
        if (achGrid) {
          const cards = achGrid.querySelectorAll(".achievement-card");
          cards.forEach((card) => {
            const cardTier = card.getAttribute("data-tier");
            card.style.display = (filter === "all" || cardTier === filter) ? "" : "none";
          });
        }
      });
    });

    // History table filters
    const filterCatSelect = document.getElementById("history-filter-cat");
    if (filterCatSelect) {
      filterCatSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        const rows = container.querySelectorAll("#history-table-body tr[data-history-cat]");
        rows.forEach((r) => {
          const rowCat = r.getAttribute("data-history-cat");
          r.style.display = (val === "all" || rowCat === val) ? "" : "none";
        });
      });
    }

    const clearHistoryBtn = document.getElementById("clear-history-action-btn");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => {
        showConfirmModal({
          title: "Clear All Quiz Logs?",
          message: "This will permanently remove your quiz attempt history and reset your dependent progress analytics. Are you sure?",
          confirmText: "Clear All Logs",
          isDanger: true,
          onConfirm: () => {
            Storage.clearHistory();
            showToast("Quiz history logs cleared", "info");
            renderPerformanceView(container);
          }
        });
      });
    }

    container.querySelectorAll(".delete-history-entry-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        Storage.deleteHistoryEntry(id);
        showToast("Log entry removed", "info");
        renderPerformanceView(container);
      });
    });
  }

  // ============================================
  // 6. STUDY BANK VIEW (Personal Revision)
  // ============================================
  let studyBankSearchQuery = "";
  let studyBankCatFilter = "all";
  let studyBankDiffFilter = "all";

  function renderStudyBankView(container) {
    let bookmarks = Storage.getBookmarks();
    const categories = QuestionService.getCategories();

    // Filters
    if (studyBankCatFilter !== "all") {
      bookmarks = bookmarks.filter((q) => q.category === studyBankCatFilter);
    }
    if (studyBankDiffFilter !== "all") {
      bookmarks = bookmarks.filter((q) => q.difficulty === studyBankDiffFilter);
    }
    if (studyBankSearchQuery.trim()) {
      const q = studyBankSearchQuery.toLowerCase();
      bookmarks = bookmarks.filter((item) =>
        item.question.toLowerCase().includes(q) ||
        (item.explanation && item.explanation.toLowerCase().includes(q)) ||
        (item.hint && item.hint.toLowerCase().includes(q))
      );
    }

    let itemsHTML = "";
    if (bookmarks.length === 0) {
      itemsHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </div>
          <h3 class="empty-state-title">Your Study Bank is Empty</h3>
          <p class="empty-state-desc">Bookmark tricky questions during active quizzes or in Explore to save them here for targeted review and revision drills.</p>
          <button type="button" class="btn btn-primary" id="study-bank-explore-btn">Browse Questions in Explore</button>
        </div>
      `;
    } else {
      const letters = ["A", "B", "C", "D"];
      itemsHTML = bookmarks.map((q, idx) => {
        const catObj = categories[q.category] || { title: q.category || "General" };
        const correctStr = `${letters[q.correctAnswer]}. ${escapeHTML(q.options[q.correctAnswer])}`;
        const isReviewed = !!q.reviewed;

        return `
          <div class="card study-item-card fade-in" style="${isReviewed ? 'opacity: 0.8;' : ''}">
            <div class="study-item-top">
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <span class="badge badge-neutral">${escapeHTML(catObj.title)}</span>
                <span class="badge badge-${q.difficulty}">${q.difficulty}</span>
                ${isReviewed ? `<span class="badge badge-easy">✓ Reviewed</span>` : `<span class="badge badge-warning">Needs Review</span>`}
              </div>

              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <button type="button" class="btn btn-ghost btn-sm toggle-reviewed-btn" data-qid="${q.id}">
                  ${isReviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}
                </button>
                <button type="button" class="btn btn-ghost btn-sm remove-bookmark-action-btn" data-qid="${q.id}" style="color: var(--color-danger);">
                  Remove
                </button>
              </div>
            </div>

            <h4 class="study-q-text">${idx + 1}. ${escapeHTML(q.question)}</h4>

            <div class="study-correct-box">
              <strong>Correct Answer:</strong> ${correctStr}
            </div>

            ${q.hint ? `
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">
                💡 <strong>Hint:</strong> ${escapeHTML(q.hint)}
              </div>
            ` : ''}

            ${q.explanation ? `
              <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">
                📖 <strong>Explanation:</strong> ${escapeHTML(q.explanation)}
              </div>
            ` : ''}
          </div>
        `;
      }).join("");
    }

    container.innerHTML = `
      <div class="fade-in">
        <div class="study-bank-header">
          <div>
            <h1 style="margin-bottom: 0.35rem;">Study Bank & Bookmarks</h1>
            <p>Your revision workspace for reviewing challenging concepts and targeted practice.</p>
          </div>

          ${bookmarks.length > 0 ? `
            <button type="button" class="btn btn-primary" id="practice-study-bank-btn">
              ⚡ Practice Saved Questions (${bookmarks.length})
            </button>
          ` : ''}
        </div>

        <!-- Filter bar for Study Bank -->
        <div class="card" style="padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div class="search-box" style="flex: 1; max-width: 320px;">
            <span class="search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" id="sb-search-input" class="form-control search-input" placeholder="Search saved questions..." value="${escapeHTML(studyBankSearchQuery)}" />
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <select id="sb-cat-select" class="filter-select">
              <option value="all" ${studyBankCatFilter === 'all' ? 'selected' : ''}>All Categories</option>
              ${Object.values(categories).map((c) => `<option value="${c.id}" ${studyBankCatFilter === c.id ? 'selected' : ''}>${escapeHTML(c.title)}</option>`).join("")}
            </select>

            <select id="sb-diff-select" class="filter-select">
              <option value="all" ${studyBankDiffFilter === 'all' ? 'selected' : ''}>All Difficulties</option>
              <option value="easy" ${studyBankDiffFilter === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="medium" ${studyBankDiffFilter === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="hard" ${studyBankDiffFilter === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
          </div>
        </div>

        <div>
          ${itemsHTML}
        </div>
      </div>
    `;

    // Event listeners for Study Bank
    const sbSearch = document.getElementById("sb-search-input");
    if (sbSearch) {
      sbSearch.addEventListener("input", (e) => {
        studyBankSearchQuery = e.target.value;
        renderStudyBankView(container);
      });
    }

    const sbCat = document.getElementById("sb-cat-select");
    if (sbCat) {
      sbCat.addEventListener("change", (e) => {
        studyBankCatFilter = e.target.value;
        renderStudyBankView(container);
      });
    }

    const sbDiff = document.getElementById("sb-diff-select");
    if (sbDiff) {
      sbDiff.addEventListener("change", (e) => {
        studyBankDiffFilter = e.target.value;
        renderStudyBankView(container);
      });
    }

    const practiceBankBtn = document.getElementById("practice-study-bank-btn");
    if (practiceBankBtn) {
      practiceBankBtn.addEventListener("click", () => {
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeStudyBankQuiz();
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    const exploreBtn = document.getElementById("study-bank-explore-btn");
    if (exploreBtn) {
      exploreBtn.addEventListener("click", () => {
        switchTab("explore");
      });
    }

    container.querySelectorAll(".toggle-reviewed-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        Storage.toggleBookmarkReviewed(qid);
        renderStudyBankView(container);
      });
    });

    container.querySelectorAll(".remove-bookmark-action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        Storage.removeBookmark(qid);
        showToast("Removed from Study Bank", "info");
        renderNavigation();
        renderStudyBankView(container);
      });
    });
  }

  return {
    renderNavigation,
    renderActiveView,
    updateHeaderActions,
    switchTab,
    showToast,
    showConfirmModal,
    showQuizConfigModal,
    showAiConfigModal,
    initAiSettings,
    updateAiHeaderStatus
  };
})();
