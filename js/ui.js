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
      { id: "hub", label: "Quiz Hub", icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
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
  // 1. QUIZ HUB VIEW
  // ============================================
  function renderHubView(container) {
    const analytics = Storage.getAnalytics();
    const categories = QuestionService.getCategories();
    const allQuestions = QuestionService.getAllQuestions();

    // Goal progress calculation
    const dailyGoal = analytics.dailyGoal || 10;
    const todayAnswered = analytics.todayQuestionsCount;
    const goalPct = Math.min(100, Math.round((todayAnswered / dailyGoal) * 100));

    // Filter categories based on hub filter/search query
    let catEntries = Object.entries(categories);

    if (quizState.activeCategory !== "all") {
      catEntries = catEntries.filter(([id]) => id === quizState.activeCategory);
    }

    if (quizState.hubSearchQuery) {
      const q = quizState.hubSearchQuery.toLowerCase();
      catEntries = catEntries.filter(([id, cat]) => 
        cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)
      );
    }

    // Build Topic Cards HTML
    let topicCardsHTML = catEntries.map(([id, cat]) => {
      const catQs = allQuestions.filter((item) => item.category === id);
      const stats = QuestionService.getCategoryStats(id);

      return `
        <div class="card card-hover topic-card fade-in" style="--topic-color: ${cat.color};" data-cat-id="${id}">
          <div>
            <div class="topic-card-header">
              <div class="topic-icon-wrap">${cat.icon}</div>
              <span class="badge badge-neutral">${catQs.length} Questions</span>
            </div>
            <h3 class="topic-title" style="margin-top: 0.85rem;">${escapeHTML(cat.title)}</h3>
            <p class="topic-desc">${escapeHTML(cat.description)}</p>
          </div>

          <div>
            <div class="topic-meta-row">
              <div class="topic-difficulty-pills">
                <span class="diff-badge badge-easy">${stats.easy} Easy</span>
                <span class="diff-badge badge-medium">${stats.medium} Med</span>
                <span class="diff-badge badge-hard">${stats.hard} Hard</span>
              </div>
              <span class="start-action-link">
                Start Quiz
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
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
            <p class="empty-state-desc">No quiz topics matched your search "${escapeHTML(quizState.hubSearchQuery)}".</p>
            <button type="button" class="btn btn-secondary" id="clear-hub-search-btn">Reset Search</button>
          </div>
        </div>
      `;
    }

    // Continue Practicing card content
    let continueHTML = "";
    if (analytics.lastAttempt) {
      continueHTML = `
        <div class="card highlight-card continue-card fade-in">
          <div class="highlight-card-top">
            <div>
              <span class="highlight-badge highlight-badge-daily">Continue Practicing</span>
              <h3 class="highlight-title">Previous: ${escapeHTML(analytics.lastAttempt.categoryTitle)}</h3>
              <p class="highlight-desc">Last scored <strong>${analytics.lastAttempt.score}/${analytics.lastAttempt.total} (${analytics.lastAttempt.percentage}%)</strong> on ${escapeHTML(analytics.lastAttempt.date)}. Ready to beat your score?</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button type="button" class="btn btn-primary btn-sm" id="resume-last-btn" data-cat="${escapeHTML(analytics.lastAttempt.category)}">
              ⚡ Practice ${escapeHTML(analytics.lastAttempt.categoryTitle)}
            </button>
          </div>
        </div>
      `;
    } else {
      continueHTML = `
        <div class="card highlight-card continue-card fade-in">
          <div class="highlight-card-top">
            <div>
              <span class="highlight-badge highlight-badge-daily">Quick Start</span>
              <h3 class="highlight-title">JavaScript & TypeScript</h3>
              <p class="highlight-desc">Test your understanding of closures, async microtasks, and TypeScript type systems.</p>
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-primary btn-sm" id="quick-start-js-btn">
              ⚡ Start JavaScript Quiz
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="fade-in">
        <!-- Welcome Hero -->
        <div class="hub-header">
          <div class="welcome-row">
            <div class="welcome-text">
              <h1>Level Up Your Tech Mastery</h1>
              <p>Practice web architecture, algorithms, and full-stack technical concepts with focused, timed developer quizzes.</p>
            </div>

            <!-- Stats Summary Strip -->
            <div class="stats-summary-strip">
              <div class="stat-pill">
                <span class="stat-pill-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                </span>
                <div>
                  <span class="stat-pill-val">${analytics.totalQuizzes}</span>
                  <span class="stat-pill-label"> Quizzes</span>
                </div>
              </div>

              <div class="stat-pill">
                <span class="stat-pill-icon" style="color: var(--color-success);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </span>
                <div>
                  <span class="stat-pill-val">${analytics.averageAccuracy}%</span>
                  <span class="stat-pill-label"> Accuracy</span>
                </div>
              </div>

              <div class="stat-pill">
                <span class="stat-pill-icon" style="color: var(--color-warning);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </span>
                <div>
                  <span class="stat-pill-val">${analytics.streak}</span>
                  <span class="stat-pill-label"> Day Streak</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Highlight Widgets: Daily Challenge & Daily Goal -->
          <div class="highlight-grid">
            <!-- Daily Challenge -->
            <div class="card highlight-card fade-in">
              <div class="highlight-card-top">
                <div>
                  <span class="highlight-badge highlight-badge-daily">Daily Challenge</span>
                  <h3 class="highlight-title">Today's 5-Question Drill</h3>
                  <p class="highlight-desc">Curated multi-discipline questions updated every 24 hours. Test your breadth of knowledge.</p>
                </div>
              </div>
              <div>
                <button type="button" class="btn btn-primary btn-sm" id="start-daily-challenge-btn">
                  ⚡ Launch Daily Challenge
                </button>
              </div>
            </div>

            <!-- Daily Goal Tracker -->
            <div class="card highlight-card fade-in">
              <div class="highlight-card-top">
                <div>
                  <span class="highlight-badge highlight-badge-goal">Daily Learning Goal</span>
                  <h3 class="highlight-title">${todayAnswered} / ${dailyGoal} Questions</h3>
                  <p class="highlight-desc">Progress towards your daily learning objective.</p>
                </div>
                <button type="button" class="btn btn-ghost btn-sm" id="edit-goal-btn" title="Adjust daily goal">
                  Edit Goal
                </button>
              </div>
              <div class="goal-progress-wrap">
                <div class="goal-progress-header">
                  <span>${goalPct}% Achieved</span>
                  <span>${Math.max(0, dailyGoal - todayAnswered)} remaining</span>
                </div>
                <div class="goal-progress-bar">
                  <div class="goal-progress-fill" style="width: ${goalPct}%;"></div>
                </div>
              </div>
            </div>

            <!-- Continue Practicing -->
            ${continueHTML}
          </div>
        </div>

        <!-- Catalog Toolbar -->
        <div class="section-toolbar">
          <div class="section-title-wrap">
            <h2>Technical Domains</h2>
            <p>Select a topic to start an assessment or configure custom options below.</p>
          </div>

          <div class="hub-filter-controls">
            <!-- Search -->
            <div class="search-box">
              <span class="search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" id="hub-search-input" class="form-control search-input" placeholder="Search topics..." value="${escapeHTML(quizState.hubSearchQuery)}" />
            </div>

            <!-- Difficulty Filter -->
            <select id="hub-difficulty-select" class="filter-select">
              <option value="all" ${quizState.activeDifficulty === 'all' ? 'selected' : ''}>All Difficulties</option>
              <option value="easy" ${quizState.activeDifficulty === 'easy' ? 'selected' : ''}>Easy Only</option>
              <option value="medium" ${quizState.activeDifficulty === 'medium' ? 'selected' : ''}>Medium Only</option>
              <option value="hard" ${quizState.activeDifficulty === 'hard' ? 'selected' : ''}>Hard Only</option>
            </select>

            <!-- Timed Switch -->
            <label class="timed-toggle-label" title="20s countdown per question">
              <input type="checkbox" id="hub-timed-toggle" class="timed-checkbox" ${quizState.isTimedMode ? 'checked' : ''} />
              <span class="timed-slider"></span>
              <span>Timed (20s)</span>
            </label>

            <!-- Quick Start -->
            <button type="button" class="btn btn-primary btn-sm" id="hub-start-now-btn">
              ⚡ Start Quiz
            </button>
          </div>
        </div>

        <!-- Topic Cards Grid -->
        <div class="topic-grid">
          ${topicCardsHTML}
        </div>
      </div>
    `;

    // Attach Event Listeners
    const searchInput = document.getElementById("hub-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        quizState.hubSearchQuery = e.target.value;
        renderHubView(container);
      });
    }

    const clearSearchBtn = document.getElementById("clear-hub-search-btn");
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        quizState.hubSearchQuery = "";
        renderHubView(container);
      });
    }

    const diffSelect = document.getElementById("hub-difficulty-select");
    if (diffSelect) {
      diffSelect.addEventListener("change", (e) => {
        quizState.activeDifficulty = e.target.value;
        renderHubView(container);
      });
    }

    const timedToggle = document.getElementById("hub-timed-toggle");
    if (timedToggle) {
      timedToggle.addEventListener("change", (e) => {
        quizState.isTimedMode = e.target.checked;
      });
    }

    const startDailyBtn = document.getElementById("start-daily-challenge-btn");
    if (startDailyBtn) {
      startDailyBtn.addEventListener("click", () => {
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeDailyChallengeQuiz();
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    const resumeBtn = document.getElementById("resume-last-btn");
    if (resumeBtn) {
      resumeBtn.addEventListener("click", () => {
        const cat = resumeBtn.getAttribute("data-cat") || "all";
        startStandardQuizRun(cat, quizState.activeDifficulty);
      });
    }

    const quickStartJsBtn = document.getElementById("quick-start-js-btn");
    if (quickStartJsBtn) {
      quickStartJsBtn.addEventListener("click", () => {
        startStandardQuizRun("javascript", "all");
      });
    }

    const startNowBtn = document.getElementById("hub-start-now-btn");
    if (startNowBtn) {
      startNowBtn.addEventListener("click", () => {
        startStandardQuizRun(quizState.activeCategory, quizState.activeDifficulty);
      });
    }

    const editGoalBtn = document.getElementById("edit-goal-btn");
    if (editGoalBtn) {
      editGoalBtn.addEventListener("click", () => {
        const input = prompt("Set your daily learning goal (number of questions):", dailyGoal);
        if (input !== null) {
          const num = parseInt(input, 10);
          if (!isNaN(num) && num > 0) {
            Storage.setDailyGoal(num);
            showToast(`Daily goal updated to ${num} questions`, "success");
            renderHubView(container);
          }
        }
      });
    }

    container.querySelectorAll(".topic-card").forEach((card) => {
      card.addEventListener("click", () => {
        const catId = card.getAttribute("data-cat-id");
        startStandardQuizRun(catId, quizState.activeDifficulty);
      });
    });
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

    // Weekly activity chart
    const maxDayQuestions = Math.max(1, ...analytics.weeklyActivity.map((w) => w.questionsCount));
    const weeklyBarsHTML = analytics.weeklyActivity.map((d) => {
      const heightPct = Math.max(8, Math.round((d.questionsCount / maxDayQuestions) * 100));
      return `
        <div class="bar-col" title="${d.dayLabel} (${d.dateLabel}): ${d.questionsCount} questions, ${d.quizzesCount} quizzes">
          <span class="bar-val-hint">${d.questionsCount > 0 ? d.questionsCount : ''}</span>
          <div class="bar-pill ${d.questionsCount > 0 ? 'has-activity' : ''} ${d.isToday ? 'today' : ''}" style="height: ${heightPct}%;"></div>
          <span class="bar-label">${d.dayLabel}</span>
        </div>
      `;
    }).join("");

    // Category breakdown bars
    let categoryBarsHTML = "";
    if (analytics.categoryBreakdown.length === 0) {
      categoryBarsHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem 0;">No category attempts recorded yet. Take a quiz to populate topic mastery analytics!</p>`;
    } else {
      categoryBarsHTML = analytics.categoryBreakdown.map((c) => `
        <div>
          <div class="breakdown-row-header">
            <span>${escapeHTML(c.title)}</span>
            <span><strong>${c.accuracy}%</strong> (${c.attempts} ${c.attempts === 1 ? 'quiz' : 'quizzes'})</span>
          </div>
          <div class="topic-prog-track">
            <div class="topic-prog-fill" style="width: ${c.accuracy}%;"></div>
          </div>
        </div>
      `).join("");
    }

    // Achievements cards
    const achievementsHTML = analytics.achievements.map((ach) => `
      <div class="card achievement-card ${ach.unlocked ? 'unlocked' : ''} fade-in">
        <div class="achievement-icon">
          ${ach.unlocked ? `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 15l-2 5l9-13h-6l2-5l-9 13h6z"/></svg>
          ` : `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          `}
        </div>
        <div class="achievement-info" style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4>${escapeHTML(ach.title)}</h4>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">${escapeHTML(ach.metric)}</span>
          </div>
          <p>${escapeHTML(ach.desc)}</p>
          <div class="topic-prog-track" style="height: 4px;">
            <div class="topic-prog-fill" style="width: ${Math.round(ach.progress * 100)}%;"></div>
          </div>
        </div>
      </div>
    `).join("");

    // History Table Rows
    let historyRowsHTML = "";
    if (history.length === 0) {
      historyRowsHTML = `<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">No quiz logs recorded yet. Start practicing from Quiz Hub!</td></tr>`;
    } else {
      historyRowsHTML = history.map((h) => `
        <tr data-history-cat="${h.category}">
          <td><strong>${escapeHTML(h.categoryTitle)}</strong></td>
          <td><span class="badge badge-${h.difficulty}">${h.difficulty}</span></td>
          <td><strong>${h.score} / ${h.total}</strong> (${h.percentage}%)</td>
          <td>${h.timeTakenSec}s</td>
          <td>${escapeHTML(h.date)} ${escapeHTML(h.time || '')}</td>
          <td>
            <button type="button" class="btn btn-ghost btn-sm delete-history-entry-btn" data-id="${h.id}" title="Delete entry" style="color: var(--color-danger); padding: 0.2rem 0.5rem;">
              ✕
            </button>
          </td>
        </tr>
      `).join("");
    }

    container.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h1 style="margin-bottom: 0.4rem;">Performance & Analytics</h1>
          <p>Real-time metrics and historical breakdown calculated directly from your quiz attempts.</p>
        </div>

        <!-- Overview Metric Cards -->
        <div class="analytics-overview-grid">
          <div class="card stat-widget">
            <div class="stat-widget-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <div>
              <div class="stat-widget-val">${analytics.totalQuizzes}</div>
              <div class="stat-widget-lbl">Completed Quizzes</div>
            </div>
          </div>

          <div class="card stat-widget">
            <div class="stat-widget-icon" style="color: var(--color-success);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            </div>
            <div>
              <div class="stat-widget-val">${analytics.averageAccuracy}%</div>
              <div class="stat-widget-lbl">Average Accuracy</div>
            </div>
          </div>

          <div class="card stat-widget">
            <div class="stat-widget-icon" style="color: var(--accent-purple);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <div class="stat-widget-val">${analytics.bestScore}%</div>
              <div class="stat-widget-lbl">Best Score</div>
            </div>
          </div>

          <div class="card stat-widget">
            <div class="stat-widget-icon" style="color: var(--color-warning);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
            <div>
              <div class="stat-widget-val">${analytics.streak} Days</div>
              <div class="stat-widget-lbl">Learning Streak</div>
            </div>
          </div>
        </div>

        <!-- Strongest / Weakest Topics Callout -->
        ${analytics.strongestTopic ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="card" style="padding: 1.25rem; border-left: 3px solid var(--color-success);">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-success);">Strongest Domain</span>
              <h4 style="margin: 0.25rem 0;">${escapeHTML(analytics.strongestTopic.title)}</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${analytics.strongestTopic.accuracy}% accuracy over ${analytics.strongestTopic.totalQuestions} questions</p>
            </div>

            ${analytics.weakestTopic ? `
              <div class="card" style="padding: 1.25rem; border-left: 3px solid var(--color-warning);">
                <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-warning);">Recommended Revision</span>
                <h4 style="margin: 0.25rem 0;">${escapeHTML(analytics.weakestTopic.title)}</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${analytics.weakestTopic.accuracy}% accuracy — practice this topic to strengthen your baseline</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Charts: 7-Day Activity & Category Accuracy -->
        <div class="charts-grid">
          <div class="card chart-card">
            <div class="chart-header">
              <h3>7-Day Practice Activity</h3>
              <span style="font-size: 0.78rem; color: var(--text-muted);">Questions Answered</span>
            </div>
            <div class="weekly-bars">${weeklyBarsHTML}</div>
          </div>

          <div class="card chart-card">
            <div class="chart-header">
              <h3>Accuracy by Topic</h3>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${analytics.categoryBreakdown.length} Domains Tested</span>
            </div>
            <div class="topic-breakdown-list">${categoryBarsHTML}</div>
          </div>
        </div>

        <!-- Achievements Grid -->
        <div style="margin-bottom: 2.5rem;">
          <h3 style="margin-bottom: 1rem;">Achievements & Milestones</h3>
          <div class="achievements-grid">${achievementsHTML}</div>
        </div>

        <!-- Quiz History Table -->
        <div class="card" style="padding: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <h3>Attempt History</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Complete record of your completed quizzes</p>
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
        </div>
      </div>
    `;

    // Event listeners for Performance
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
    showConfirmModal
  };
})();
