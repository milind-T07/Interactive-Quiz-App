/* ============================================================
   UI.JS — QuizPro Clean, Minimal & Professional Interface Controller
   ============================================================ */

const UI = (function () {
  // --- HTML Entity Escaper for safe rendering ---
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
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === "danger"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `<span>${iconSvg}</span><span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastOut 0.2s forwards";
      setTimeout(() => toast.remove(), 200);
    }, 2600);
  }

  // --- Native Confirmation Modal Helper ---
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
      if (iconWrap) {
        iconWrap.style.background = "var(--color-danger-bg)";
        iconWrap.style.color = "var(--color-danger)";
      }
    } else {
      confirmBtn.className = "btn btn-primary";
      if (iconWrap) {
        iconWrap.style.background = "var(--accent-subtle)";
        iconWrap.style.color = "var(--accent-primary)";
      }
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

  // ============================================================
  // NAVIGATION BAR (Header & Mobile Drawer)
  // ============================================================
  function renderNavigation() {
    const desktopNav = document.getElementById("desktop-nav");
    const mobileLinks = document.getElementById("mobile-nav-links");
    const bookmarksCount = Storage.getBookmarks().length;

    const navItems = [
      { id: "hub", label: "Dashboard", icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>` },
      { id: "explore", label: "Explore", icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
      { id: "performance", label: "Performance", icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>` },
      { id: "bookmarks", label: "Study Bank", count: bookmarksCount, icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>` }
    ];

    if (desktopNav) {
      desktopNav.innerHTML = navItems.map((item) => {
        const isActive = quizState.activeTab === item.id;
        const hasBadge = typeof item.count === "number" && item.count > 0;
        return `
          <button type="button" class="nav-tab ${isActive ? 'active' : ''}" data-tab="${item.id}" aria-selected="${isActive}">
            ${item.icon}
            <span>${item.label}</span>
            ${hasBadge ? `<span class="badge badge-primary">${item.count}</span>` : ''}
          </button>
        `;
      }).join("");

      desktopNav.querySelectorAll(".nav-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.getAttribute("data-tab");
          switchTab(tab);
        });
      });
    }

    if (mobileLinks) {
      mobileLinks.innerHTML = navItems.map((item) => {
        const isActive = quizState.activeTab === item.id;
        const hasBadge = typeof item.count === "number" && item.count > 0;
        return `
          <button type="button" class="mobile-nav-link ${isActive ? 'active' : ''}" data-tab="${item.id}">
            ${item.icon}
            <span>${item.label}</span>
            ${hasBadge ? `<span class="badge badge-primary" style="margin-left: auto;">${item.count}</span>` : ''}
          </button>
        `;
      }).join("");

      mobileLinks.querySelectorAll(".mobile-nav-link").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.getAttribute("data-tab");
          switchTab(tab);
          const overlay = document.getElementById("mobile-drawer-overlay");
          if (overlay) overlay.classList.remove("open");
        });
      });
    }

    updateHeaderActions();
  }

  function updateHeaderActions() {
    const soundBtn = document.getElementById("sound-toggle-btn");
    if (soundBtn && typeof SoundEngine !== "undefined") {
      const muted = SoundEngine.isMuted();
      soundBtn.innerHTML = muted
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
      soundBtn.setAttribute("aria-label", muted ? "Unmute Sound Effects" : "Mute Sound Effects");
      soundBtn.setAttribute("title", muted ? "Unmute Sound Effects" : "Mute Sound Effects");
    }

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn && typeof ThemeManager !== "undefined") {
      const isDark = ThemeManager.getTheme() === "dark";
      themeBtn.innerHTML = isDark
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      themeBtn.setAttribute("aria-label", isDark ? "Switch to Light Theme" : "Switch to Dark Theme");
      themeBtn.setAttribute("title", isDark ? "Switch to Light Theme" : "Switch to Dark Theme");
    }
  }

  function switchTab(tabId) {
    if (quizState.activeTab === tabId && !quizState.isFinished && quizState.questions.length === 0) return;
    
    // Warn if leaving an active ongoing quiz
    if (quizState.questions.length > 0 && !quizState.isFinished) {
      showConfirmModal({
        title: "Exit Current Assessment?",
        message: "You have an active quiz session in progress. Exiting now will discard your current attempt.",
        confirmText: "Exit Quiz",
        isDanger: true,
        onConfirm: () => {
          if (quizState.timerInterval) clearInterval(quizState.timerInterval);
          quizState.questions = [];
          quizState.isFinished = false;
          quizState.activeTab = tabId;
          renderNavigation();
          renderActiveView();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      return;
    }

    quizState.activeTab = tabId;
    renderNavigation();
    renderActiveView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderActiveView() {
    const root = document.getElementById("app-root");
    if (!root) return;

    if (quizState.isFinished) {
      renderResultsView(root);
      return;
    }

    if (quizState.questions.length > 0) {
      renderQuizRunnerView(root);
      return;
    }

    if (quizState.activeTab === "hub") {
      renderHubView(root);
    } else if (quizState.activeTab === "explore") {
      renderExploreView(root);
    } else if (quizState.activeTab === "performance") {
      renderPerformanceView(root);
    } else if (quizState.activeTab === "bookmarks") {
      renderStudyBankView(root);
    }
  }

  // ============================================================
  // 1. DASHBOARD VIEW (Clean, Minimal, Focused)
  // ============================================================
  function renderHubView(container) {
    const analytics = Storage.getAnalytics();
    const categories = QuestionService.getCategories();
    const allQuestions = QuestionService.getAllQuestions();

    let catEntries = Object.entries(categories);

    // Topic search filter
    if (quizState.hubSearchQuery && quizState.hubSearchQuery.trim()) {
      const q = quizState.hubSearchQuery.toLowerCase().trim();
      catEntries = catEntries.filter(([id, cat]) => 
        cat.title.toLowerCase().includes(q) || 
        cat.description.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q)
      );
    }

    // Difficulty filter
    if (quizState.activeDifficulty !== "all") {
      catEntries = catEntries.filter(([id]) => {
        const catQs = QuestionService.getQuestionsByCategory(id);
        return catQs.some((item) => (item.difficulty || "").toLowerCase() === quizState.activeDifficulty.toLowerCase());
      });
    }

    // Popular Topics Selection (HTML, CSS, JS Fundamentals, Python, Java, Data Structures)
    const popularKeys = ["html", "css", "js-fundamentals", "python", "java", "dsa"];
    const popularTopics = popularKeys
      .map((key) => categories[key])
      .filter(Boolean);

    // Render Popular Topics Cards
    const popularTopicsHTML = popularTopics.map((cat) => {
      const qCount = QuestionService.getQuestionsByCategory(cat.id).length;
      return `
        <div class="popular-card" data-cat-id="${cat.id}">
          <div>
            <h3 class="popular-card-title">${escapeHTML(cat.title)}</h3>
            <p class="popular-card-desc">${escapeHTML(cat.description)}</p>
          </div>
          <div class="popular-card-footer">
            <span class="popular-q-count">${qCount} Questions</span>
            <button type="button" class="btn btn-primary btn-sm topic-start-btn" data-cat-id="${cat.id}">
              Start Quiz
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Render Full 20 Topic Cards for Topics Directory
    let topicCardsHTML = catEntries.map(([id, cat]) => {
      const catQs = QuestionService.getQuestionsByCategory(id);

      return `
        <div class="topic-card" data-cat-id="${id}">
          <div class="topic-card-body">
            <h3 class="topic-card-title">${escapeHTML(cat.title)}</h3>
            <p class="topic-card-desc">${escapeHTML(cat.description)}</p>
          </div>

          <div class="topic-card-footer">
            <span class="topic-card-count">${catQs.length} Questions</span>
            <div class="topic-card-actions">
              <button type="button" class="icon-btn topic-gear-btn" data-cat-id="${id}" title="Configure Custom Options" aria-label="Configure ${escapeHTML(cat.title)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button type="button" class="btn btn-primary btn-sm topic-start-btn" data-cat-id="${id}">
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (!topicCardsHTML) {
      topicCardsHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="empty-state">
            <h3 class="empty-state-title">No Topics Match Your Filter</h3>
            <p class="empty-state-desc">Try resetting your search query or difficulty selector to explore all 20 technical topics.</p>
            <button type="button" class="btn btn-secondary btn-sm" id="empty-reset-filters-btn">Reset Filters</button>
          </div>
        </div>
      `;
    }

    // Continue Learning State
    let continueLearningHTML = "";
    if (analytics.lastAttempt && analytics.lastAttempt.categoryTitle) {
      continueLearningHTML = `
        <div class="continue-card">
          <div class="continue-info">
            <span class="continue-label">Continue Learning</span>
            <div class="continue-topic">${escapeHTML(analytics.lastAttempt.categoryTitle)}</div>
            <div class="continue-meta">Last attempt score: ${analytics.lastAttempt.score}/${analytics.lastAttempt.total} (${analytics.lastAttempt.percentage}%)</div>
          </div>
          <button type="button" class="btn btn-secondary" id="dashboard-continue-btn">
            Continue Practicing
          </button>
        </div>
      `;
    } else {
      continueLearningHTML = `
        <div class="continue-card" style="border-style: dashed;">
          <div class="continue-info">
            <span class="continue-label">Ready to start?</span>
            <div class="continue-topic">Take your first practice drill</div>
            <div class="continue-meta">Choose from 20 technical domains below or start with recommended fundamentals.</div>
          </div>
          <button type="button" class="btn btn-primary" id="dashboard-first-quiz-btn">
            Start Your First Quiz
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="fade-in">
        <!-- 1. Welcome Section -->
        <section class="welcome-section" aria-label="Welcome">
          <div class="welcome-content">
            <h1 class="welcome-title">Welcome to QuizPro</h1>
            <p class="welcome-desc">
              Practice technical concepts, improve your problem-solving skills, and track your progress.
            </p>
            <div class="welcome-actions">
              <button type="button" class="btn btn-primary" id="welcome-start-btn">
                Start Practicing
              </button>
              <button type="button" class="btn btn-secondary" id="welcome-explore-btn">
                Explore Questions
              </button>
            </div>
            <div class="welcome-meta">
              ${allQuestions.length > 0 ? `${allQuestions.length.toLocaleString()}+ Questions` : '5,200+ Questions'} • 20 Technical Topics • 100% Free & Local
            </div>
          </div>
        </section>

        <!-- 2. Progress Summary (3 Compact Statistics) -->
        <section class="progress-summary-row" aria-label="Progress Summary">
          <div class="stat-block">
            <div class="stat-label">Questions Attempted</div>
            <div class="stat-value">${analytics.totalQuestions}</div>
            <div class="stat-subtext">${analytics.uniqueQuestionsSolved} unique answered</div>
          </div>

          <div class="stat-block">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value" style="color: ${analytics.averageAccuracy >= 70 ? 'var(--color-success)' : 'var(--text-primary)'};">
              ${analytics.averageAccuracy}%
            </div>
            <div class="stat-subtext">${analytics.totalCorrect} correct answers</div>
          </div>

          <div class="stat-block">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">
              ${analytics.currentStreak} ${analytics.currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div class="stat-subtext">Best: ${analytics.bestStreak} ${analytics.bestStreak === 1 ? 'day' : 'days'}</div>
          </div>
        </section>

        <!-- 3. Continue Learning -->
        ${continueLearningHTML}

        <!-- 4. Popular Topics (Compact Grid) -->
        <section class="popular-topics-section" aria-label="Popular Topics">
          <div class="popular-header-row">
            <div>
              <h2 class="section-title">Popular Topics</h2>
              <p class="section-desc">Quick drills in core technical subjects.</p>
            </div>
            <a href="#topics-directory" class="btn btn-ghost btn-sm" id="view-all-topics-link">
              View All Topics (${catEntries.length}) →
            </a>
          </div>

          <div class="popular-grid">
            ${popularTopicsHTML}
          </div>
        </section>

        <!-- 5. Complete Topics Directory -->
        <section class="topics-directory-section" id="topics-directory" aria-label="Topics Directory">
          <div class="section-header">
            <h2 class="section-title">Topics Directory</h2>
            <p class="section-desc">Browse all 20 developer domains and technical categories.</p>
          </div>

          <!-- Compact Filtering Toolbar -->
          <div class="topics-toolbar">
            <div class="toolbar-left">
              <div class="search-box">
                <span class="search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" id="hub-search-input" class="form-control search-input" placeholder="Search topics or skills..." value="${escapeHTML(quizState.hubSearchQuery)}" aria-label="Search technical topics" />
              </div>

              <!-- Difficulty filter -->
              <div class="segmented-control" role="group" aria-label="Filter topics by difficulty">
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="segment-btn ${quizState.activeDifficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
            </div>

            <div class="toolbar-right">
              ${quizState.hubSearchQuery || quizState.activeDifficulty !== 'all' ? `
                <button type="button" class="btn btn-ghost btn-sm" id="hub-reset-btn">Reset Filters</button>
              ` : ''}
              <button type="button" class="btn btn-secondary btn-sm" id="hub-custom-quiz-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>Custom Quiz</span>
              </button>
            </div>
          </div>

          <!-- 20 Topics Grid (4 cols desktop, 2 cols tablet, 1 col mobile) -->
          <div class="topics-grid" id="topics-grid-container">
            ${topicCardsHTML}
          </div>
        </section>
      </div>
    `;

    // Event Listeners for Dashboard
    const welcomeStartBtn = document.getElementById("welcome-start-btn");
    if (welcomeStartBtn) {
      welcomeStartBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    const welcomeExploreBtn = document.getElementById("welcome-explore-btn");
    if (welcomeExploreBtn) {
      welcomeExploreBtn.addEventListener("click", () => {
        switchTab("explore");
      });
    }

    const continueBtn = document.getElementById("dashboard-continue-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        const cat = analytics.lastAttempt ? analytics.lastAttempt.category : "all";
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeStandardQuiz(cat, "all", 10, "practice");
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    const firstQuizBtn = document.getElementById("dashboard-first-quiz-btn");
    if (firstQuizBtn) {
      firstQuizBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    const viewAllLink = document.getElementById("view-all-topics-link");
    if (viewAllLink) {
      viewAllLink.addEventListener("click", (e) => {
        e.preventDefault();
        const dirEl = document.getElementById("topics-directory");
        if (dirEl) {
          dirEl.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    const searchInput = document.getElementById("hub-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        quizState.hubSearchQuery = e.target.value;
        renderHubView(container);
      });
    }

    container.querySelectorAll(".segment-btn[data-diff]").forEach((btn) => {
      btn.addEventListener("click", () => {
        quizState.activeDifficulty = btn.getAttribute("data-diff");
        renderHubView(container);
      });
    });

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

    const customQuizBtn = document.getElementById("hub-custom-quiz-btn");
    if (customQuizBtn) {
      customQuizBtn.addEventListener("click", () => {
        showQuizConfigModal("all");
      });
    }

    // Start Quiz from topic cards
    container.querySelectorAll(".topic-start-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const catId = btn.getAttribute("data-cat-id");
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeStandardQuiz(catId, "all", 10, "practice");
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    });

    // Topic Gear configuration
    container.querySelectorAll(".topic-gear-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const catId = btn.getAttribute("data-cat-id");
        showQuizConfigModal(catId);
      });
    });
  }

  // ============================================================
  // 2. EXPLORE VIEW (Question Discovery & Interactive Practice)
  // ============================================================
  function renderExploreView(container) {
    const categories = QuestionService.getCategories();
    let allQuestions = QuestionService.getAllQuestions();

    // Filtering
    let filteredQuestions = [...allQuestions];

    if (quizState.exploreCategory !== "all") {
      filteredQuestions = QuestionService.getQuestionsByCategory(quizState.exploreCategory);
    }

    if (quizState.exploreDifficulty !== "all") {
      filteredQuestions = filteredQuestions.filter(
        (q) => (q.difficulty || "").toLowerCase() === quizState.exploreDifficulty.toLowerCase()
      );
    }

    if (quizState.exploreSearchQuery.trim()) {
      const q = quizState.exploreSearchQuery.toLowerCase().trim();
      filteredQuestions = filteredQuestions.filter((item) =>
        item.question.toLowerCase().includes(q) ||
        (item.explanation && item.explanation.toLowerCase().includes(q)) ||
        (item.hint && item.hint.toLowerCase().includes(q)) ||
        (item.subtopic && item.subtopic.toLowerCase().includes(q)) ||
        (Array.isArray(item.options) && item.options.some((opt) => opt.toLowerCase().includes(q)))
      );
    }

    // Sorting
    if (quizState.exploreSort === "difficulty") {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      filteredQuestions.sort((a, b) => (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0));
    } else if (quizState.exploreSort === "topic") {
      filteredQuestions.sort((a, b) => (a.topic || "").localeCompare(b.topic || ""));
    }

    // Pagination (20 items per page)
    const pageSize = quizState.explorePageSize || 20;
    const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
    if (quizState.exploreCurrentPage > totalPages) quizState.exploreCurrentPage = 1;
    const startIndex = (quizState.exploreCurrentPage - 1) * pageSize;
    const pageQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

    // Topic select options
    const topicOptionsHTML = `
      <option value="all" ${quizState.exploreCategory === 'all' ? 'selected' : ''}>All Topics</option>
      ${Object.values(categories).map((c) => `
        <option value="${c.id}" ${quizState.exploreCategory === c.id ? 'selected' : ''}>${escapeHTML(c.title)}</option>
      `).join("")}
    `;

    // Question cards list
    let questionsListHTML = "";
    if (filteredQuestions.length === 0) {
      questionsListHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">No Matching Questions Found</h3>
          <p class="empty-state-desc">Try modifying your search keywords or broadening your topic and difficulty filters.</p>
          <button type="button" class="btn btn-secondary btn-sm" id="reset-explore-filters-btn">Clear All Filters</button>
        </div>
      `;
    } else {
      const letters = ["A", "B", "C", "D"];
      questionsListHTML = pageQuestions.map((q, idx) => {
        const catObj = categories[q.category] || { title: q.topic || "General" };
        const isSaved = Storage.isBookmarked(q.id);
        const globalIdx = startIndex + idx + 1;

        return `
          <div class="question-card fade-in" data-qid="${q.id}">
            <div class="question-card-top">
              <div class="question-meta-tags">
                <span class="badge badge-neutral">${escapeHTML(catObj.title)}</span>
                <span class="badge badge-${q.difficulty}">${q.difficulty}</span>
                ${q.subtopic ? `<span class="badge badge-neutral" style="font-size: 0.7rem;">${escapeHTML(q.subtopic)}</span>` : ''}
              </div>

              <div class="question-actions-right">
                <button type="button" class="btn btn-ghost btn-sm bookmark-toggle-btn" data-qid="${q.id}" title="${isSaved ? 'Remove from Study Bank' : 'Save to Study Bank'}">
                  ${isSaved ? '★ Saved' : '☆ Save to Bank'}
                </button>
                <button type="button" class="btn btn-secondary btn-sm practice-similar-btn" data-cat="${q.category}">
                  Practice Similar
                </button>
              </div>
            </div>

            <h3 class="question-text">
              <span class="question-num">#${globalIdx}</span>
              ${escapeHTML(q.question)}
            </h3>

            ${q.codeSnippet ? `
              <pre class="code-snippet-box"><code>${escapeHTML(q.codeSnippet)}</code></pre>
            ` : ''}

            <!-- 4 MCQ Options (Interactive) -->
            <div class="options-grid" data-qid="${q.id}">
              ${q.options.map((opt, i) => `
                <button type="button" class="explore-opt-btn" data-qid="${q.id}" data-opt-idx="${i}" aria-label="Option ${letters[i]}: ${escapeHTML(opt)}">
                  <span class="opt-key">${letters[i]}.</span>
                  <span>${escapeHTML(opt)}</span>
                </button>
              `).join("")}
            </div>

            <!-- Reveal Answer & Hint Controls -->
            <div class="question-actions-row">
              <div class="question-actions-left">
                ${q.hint ? `
                  <button type="button" class="btn btn-ghost btn-sm toggle-hint-btn" data-qid="${q.id}">
                    💡 Hint
                  </button>
                ` : ''}
                <button type="button" class="btn btn-ghost btn-sm toggle-expl-btn" data-qid="${q.id}">
                  Reveal Answer & Explanation
                </button>
              </div>
            </div>

            <!-- Expandable Explanation Drawer -->
            <div class="answer-drawer" id="details-${q.id}" style="display: none;">
              <div class="answer-drawer-correct">
                ✓ Correct Answer: ${letters[q.correctAnswer]}. ${escapeHTML(q.options[q.correctAnswer])}
              </div>
              <div style="color: var(--text-secondary);">
                ${escapeHTML(q.explanation)}
              </div>
            </div>

            ${q.hint ? `
              <div class="hint-drawer" id="hint-${q.id}" style="display: none;">
                <strong>Hint:</strong> ${escapeHTML(q.hint)}
              </div>
            ` : ''}
          </div>
        `;
      }).join("");
    }

    const showingStart = filteredQuestions.length > 0 ? startIndex + 1 : 0;
    const showingEnd = Math.min(filteredQuestions.length, startIndex + pageSize);

    container.innerHTML = `
      <div class="fade-in">
        <div class="explore-header">
          <h1 class="section-title" style="font-size: 1.6rem;">Explore Questions</h1>
          <p class="section-desc">Discover, search, and practice individual technical questions.</p>
        </div>

        <!-- Compact Search & Filter Toolbar -->
        <div class="explore-toolbar">
          <div class="search-box">
            <span class="search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" id="explore-search-input" class="form-control search-input" placeholder="Search keywords, concepts, syntax..." value="${escapeHTML(quizState.exploreSearchQuery)}" />
          </div>

          <select id="explore-topic-select" class="form-select" style="width: auto; min-width: 170px;">
            ${topicOptionsHTML}
          </select>

          <select id="explore-diff-select" class="form-select" style="width: auto; min-width: 130px;">
            <option value="all" ${quizState.exploreDifficulty === 'all' ? 'selected' : ''}>All Difficulties</option>
            <option value="easy" ${quizState.exploreDifficulty === 'easy' ? 'selected' : ''}>Easy</option>
            <option value="medium" ${quizState.exploreDifficulty === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="hard" ${quizState.exploreDifficulty === 'hard' ? 'selected' : ''}>Hard</option>
          </select>

          <select id="explore-sort-select" class="form-select" style="width: auto; min-width: 130px;">
            <option value="relevance" ${quizState.exploreSort === 'relevance' ? 'selected' : ''}>Sort: Default</option>
            <option value="difficulty" ${quizState.exploreSort === 'difficulty' ? 'selected' : ''}>Sort: Difficulty</option>
            <option value="topic" ${quizState.exploreSort === 'topic' ? 'selected' : ''}>Sort: Topic Name</option>
          </select>
        </div>

        <!-- Summary & Actions Row -->
        <div class="explore-summary-bar">
          <div class="explore-count-text">
            Showing <span class="explore-count-highlight">${showingStart}–${showingEnd}</span> of <span class="explore-count-highlight">${filteredQuestions.length.toLocaleString()}</span> questions
          </div>

          ${filteredQuestions.length > 0 ? `
            <button type="button" class="btn btn-secondary btn-sm" id="create-quiz-from-results-btn">
              Create Quiz from Results (${Math.min(20, filteredQuestions.length)} Qs)
            </button>
          ` : ''}
        </div>

        <!-- Question Cards List -->
        <div>
          ${questionsListHTML}
        </div>

        <!-- Pagination Controls -->
        ${totalPages > 1 ? `
          <div class="pagination-bar">
            <button type="button" class="btn btn-secondary btn-sm" id="explore-prev-page-btn" ${quizState.exploreCurrentPage === 1 ? 'disabled' : ''}>
              ← Previous
            </button>
            <span class="page-indicator">
              Page ${quizState.exploreCurrentPage} of ${totalPages}
            </span>
            <button type="button" class="btn btn-secondary btn-sm" id="explore-next-page-btn" ${quizState.exploreCurrentPage === totalPages ? 'disabled' : ''}>
              Next →
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Event Listeners for Explore
    const searchInput = document.getElementById("explore-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        quizState.exploreSearchQuery = e.target.value;
        quizState.exploreCurrentPage = 1;
        renderExploreView(container);
      });
    }

    const topicSelect = document.getElementById("explore-topic-select");
    if (topicSelect) {
      topicSelect.addEventListener("change", (e) => {
        quizState.exploreCategory = e.target.value;
        quizState.exploreCurrentPage = 1;
        renderExploreView(container);
      });
    }

    const diffSelect = document.getElementById("explore-diff-select");
    if (diffSelect) {
      diffSelect.addEventListener("change", (e) => {
        quizState.exploreDifficulty = e.target.value;
        quizState.exploreCurrentPage = 1;
        renderExploreView(container);
      });
    }

    const sortSelect = document.getElementById("explore-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        quizState.exploreSort = e.target.value;
        renderExploreView(container);
      });
    }

    const resetFiltersBtn = document.getElementById("reset-explore-filters-btn");
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => {
        quizState.exploreSearchQuery = "";
        quizState.exploreCategory = "all";
        quizState.exploreDifficulty = "all";
        quizState.exploreCurrentPage = 1;
        renderExploreView(container);
      });
    }

    // Interactive MCQ Option Clicking directly on Explore Card
    container.querySelectorAll(".explore-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
        const q = QuestionService.getQuestionById(qid);
        if (!q) return;

        const optionsParent = btn.parentElement;
        const allCardOptBtns = optionsParent.querySelectorAll(".explore-opt-btn");

        // Prevent multiple answers on same card
        allCardOptBtns.forEach((b) => b.disabled = true);

        const isCorrect = optIdx === q.correctAnswer;
        if (isCorrect) {
          btn.classList.add("correct-choice");
          if (typeof SoundEngine !== "undefined") SoundEngine.correct();
        } else {
          btn.classList.add("incorrect-choice");
          // Highlight correct one in green
          const correctBtn = optionsParent.querySelector(`.explore-opt-btn[data-opt-idx="${q.correctAnswer}"]`);
          if (correctBtn) correctBtn.classList.add("correct-choice");
          if (typeof SoundEngine !== "undefined") SoundEngine.incorrect();
        }

        // Automatically reveal answer details
        const detailsDrawer = document.getElementById(`details-${qid}`);
        if (detailsDrawer) detailsDrawer.style.display = "block";
      });
    });

    // Pagination buttons
    const prevBtn = document.getElementById("explore-prev-page-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (quizState.exploreCurrentPage > 1) {
          quizState.exploreCurrentPage--;
          renderExploreView(container);
          window.scrollTo({ top: 100, behavior: "smooth" });
        }
      });
    }

    const nextBtn = document.getElementById("explore-next-page-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (quizState.exploreCurrentPage < totalPages) {
          quizState.exploreCurrentPage++;
          renderExploreView(container);
          window.scrollTo({ top: 100, behavior: "smooth" });
        }
      });
    }

    // Create Quiz from Results
    const createQuizBtn = document.getElementById("create-quiz-from-results-btn");
    if (createQuizBtn) {
      createQuizBtn.addEventListener("click", () => {
        const pool = filteredQuestions.slice(0, 20);
        if (pool.length === 0) return;
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeQuizFromQuestions(
          shuffleArray(pool),
          `Filtered Drill (${pool.length} Questions)`,
          "practice",
          "explore"
        );
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    // Bookmark Toggle
    container.querySelectorAll(".bookmark-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const q = QuestionService.getQuestionById(qid);
        if (!q) return;
        const isNowBookmarked = Storage.toggleBookmark(q);
        btn.textContent = isNowBookmarked ? "★ Saved" : "☆ Save to Bank";
        showToast(isNowBookmarked ? "Saved to Study Bank" : "Removed from Study Bank", "info");
        renderNavigation();
      });
    });

    // Practice Similar
    container.querySelectorAll(".practice-similar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-cat") || "all";
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeStandardQuiz(cat, "all", 10, "practice");
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    });

    // Toggle Explanation
    container.querySelectorAll(".toggle-expl-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const drawer = document.getElementById(`details-${qid}`);
        if (drawer) {
          const isShown = drawer.style.display === "block";
          drawer.style.display = isShown ? "none" : "block";
          btn.textContent = isShown ? "Reveal Answer & Explanation" : "Hide Explanation";
        }
      });
    });

    // Toggle Hint
    container.querySelectorAll(".toggle-hint-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const drawer = document.getElementById(`hint-${qid}`);
        if (drawer) {
          const isShown = drawer.style.display === "block";
          drawer.style.display = isShown ? "none" : "block";
          btn.textContent = isShown ? "💡 Hint" : "💡 Hide Hint";
        }
      });
    });
  }

  // ============================================================
  // 3. QUIZ PRACTICE EXPERIENCE (Distraction-Free Runner)
  // ============================================================
  function renderQuizRunnerView(container) {
    const q = quizState.questions[quizState.currentQuestionIndex];
    if (!q) {
      quizState.isFinished = true;
      renderActiveView();
      return;
    }

    const currentIndex = quizState.currentQuestionIndex;
    const totalCount = quizState.questions.length;
    const isPracticeMode = quizState.quizMode === "practice";
    const currentAnswerRecord = quizState.userAnswers[currentIndex] || {};
    const hasAnsweredCurrent = currentAnswerRecord.selectedIndex !== null;
    const progressPct = Math.round(((currentIndex + 1) / totalCount) * 100);

    // Option choices HTML
    const letters = ["A", "B", "C", "D"];
    const optionsHTML = q.options.map((opt, i) => {
      const isSelected = currentAnswerRecord.selectedIndex === i;
      const isCorrectOption = i === q.correctAnswer;
      const isDisabledByLifeline = quizState.disabledOptions.includes(i);

      let optionClass = "quiz-opt-btn";
      if (isSelected) optionClass += " selected";

      if (isPracticeMode && hasAnsweredCurrent) {
        if (isCorrectOption) {
          optionClass += " correct-feedback";
        } else if (isSelected) {
          optionClass += " incorrect-feedback";
        }
      }

      return `
        <button type="button" class="${optionClass}" data-opt-idx="${i}" ${isDisabledByLifeline ? 'disabled' : ''}>
          <span class="opt-letter">${letters[i]}</span>
          <span class="opt-text">${escapeHTML(opt)}</span>
          ${isPracticeMode && hasAnsweredCurrent && isCorrectOption ? `<span style="margin-left: auto; color: var(--color-success); font-weight: 700;">✓</span>` : ''}
          ${isPracticeMode && hasAnsweredCurrent && isSelected && !isCorrectOption ? `<span style="margin-left: auto; color: var(--color-danger); font-weight: 700;">✕</span>` : ''}
        </button>
      `;
    }).join("");

    container.innerHTML = `
      <div class="fade-in quiz-runner-container">
        <!-- Header Bar -->
        <div class="quiz-runner-header">
          <div class="quiz-runner-nav-row">
            <div>
              <span class="quiz-title-badge">${escapeHTML(quizState.quizTitle)}</span>
              <span class="quiz-progress-text" style="margin-left: 0.5rem;">• Question ${currentIndex + 1} of ${totalCount}</span>
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center;">
              ${quizState.isTimedMode ? `
                <div class="badge badge-neutral" id="quiz-timer-display" style="font-family: var(--font-mono); font-weight: 600; color: ${quizState.timerSecondsRemaining <= 5 ? 'var(--color-danger)' : 'var(--text-primary)'};">
                  ⏱️ ${quizState.timerSecondsRemaining}s
                </div>
              ` : ''}

              <button type="button" class="btn btn-ghost btn-sm" id="exit-quiz-runner-btn" style="color: var(--text-muted);">
                ✕ Exit Quiz
              </button>
            </div>
          </div>

          <!-- Subtle Progress Bar -->
          <div class="quiz-progress-bar-wrap">
            <div class="quiz-progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>

        <!-- Question Body Card -->
        <div class="quiz-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <span class="badge badge-neutral">${escapeHTML(q.topic || 'General')}</span>
              <span class="badge badge-${q.difficulty}">${q.difficulty}</span>
            </div>
          </div>

          <h2 class="quiz-question-title">
            ${escapeHTML(q.question)}
          </h2>

          ${q.codeSnippet ? `
            <pre class="code-snippet-box"><code>${escapeHTML(q.codeSnippet)}</code></pre>
          ` : ''}

          <!-- Options List -->
          <div class="quiz-options-list">
            ${optionsHTML}
          </div>

          <!-- Practice Mode Hint & Explanation Drawer -->
          ${isPracticeMode && quizState.hintVisible && q.hint ? `
            <div class="hint-drawer" style="margin-bottom: 1rem;">
              <strong>Hint:</strong> ${escapeHTML(q.hint)}
            </div>
          ` : ''}

          ${isPracticeMode && hasAnsweredCurrent && q.explanation ? `
            <div class="answer-drawer" style="margin-bottom: 1rem;">
              <strong style="color: var(--accent-primary); display: block; margin-bottom: 0.25rem;">Explanation:</strong>
              ${escapeHTML(q.explanation)}
            </div>
          ` : ''}

          <!-- Runner Controls -->
          <div class="quiz-controls-row">
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button type="button" class="btn btn-secondary btn-sm" id="prev-question-btn" ${currentIndex === 0 ? 'disabled' : ''}>
                ← Previous
              </button>

              ${isPracticeMode && q.hint ? `
                <button type="button" class="btn btn-ghost btn-sm" id="lifeline-hint-btn" ${quizState.hintVisible ? 'disabled' : ''}>
                  💡 Hint
                </button>
              ` : ''}
            </div>

            <div>
              ${currentIndex < totalCount - 1 ? `
                <button type="button" class="btn btn-primary btn-sm" id="next-question-btn">
                  Next Question →
                </button>
              ` : `
                <button type="button" class="btn btn-primary btn-sm" id="finish-quiz-btn">
                  ✓ Finish Quiz
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
        handleSelectAnswer(optIdx);
      });
    });

    const prevBtn = document.getElementById("prev-question-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (quizState.currentQuestionIndex > 0) {
          quizState.currentQuestionIndex--;
          quizState.hintVisible = false;
          quizState.disabledOptions = [];
          renderActiveView();
        }
      });
    }

    const nextBtn = document.getElementById("next-question-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (quizState.currentQuestionIndex < totalCount - 1) {
          quizState.currentQuestionIndex++;
          quizState.hintVisible = false;
          quizState.disabledOptions = [];
          renderActiveView();
        }
      });
    }

    const finishBtn = document.getElementById("finish-quiz-btn");
    if (finishBtn) {
      finishBtn.addEventListener("click", () => {
        confirmSubmitAssessment();
      });
    }

    const exitBtn = document.getElementById("exit-quiz-runner-btn");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        showConfirmModal({
          title: "Exit Current Assessment?",
          message: "Exiting now will discard your current progress.",
          confirmText: "Exit Quiz",
          isDanger: true,
          onConfirm: () => {
            if (quizState.timerInterval) clearInterval(quizState.timerInterval);
            quizState.questions = [];
            quizState.isFinished = false;
            switchTab("hub");
          }
        });
      });
    }

    const hintBtn = document.getElementById("lifeline-hint-btn");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        quizState.hintVisible = true;
        renderActiveView();
      });
    }
  }

  // Answer handler for active quiz runner
  function handleSelectAnswer(optionIndex) {
    const currentIndex = quizState.currentQuestionIndex;
    const q = quizState.questions[currentIndex];
    if (!q) return;

    // Prevent accidental multiple scoring
    const existing = quizState.userAnswers[currentIndex];
    if (existing && existing.selectedIndex !== null) {
      return;
    }

    const isCorrect = optionIndex === q.correctAnswer;

    quizState.userAnswers[currentIndex] = {
      question: q,
      selectedIndex: optionIndex,
      isCorrect: isCorrect,
      isUnanswered: false,
      timestamp: Date.now()
    };

    if (isCorrect) {
      quizState.score++;
      if (typeof SoundEngine !== "undefined") SoundEngine.correct();
    } else {
      if (typeof SoundEngine !== "undefined") SoundEngine.incorrect();
    }

    renderActiveView();
  }

  // Starts active timer
  function startActiveQuestionTimer() {
    if (quizState.timerInterval) clearInterval(quizState.timerInterval);
    quizState.timerSecondsRemaining = quizState.timeLimitPerQuestion || 20;

    quizState.timerInterval = setInterval(() => {
      quizState.timerSecondsRemaining--;
      const display = document.getElementById("quiz-timer-display");
      if (display) {
        display.textContent = `⏱️ ${quizState.timerSecondsRemaining}s`;
        if (quizState.timerSecondsRemaining <= 5) {
          display.style.color = "var(--color-danger)";
        }
      }

      if (quizState.timerSecondsRemaining <= 0) {
        clearInterval(quizState.timerInterval);
        quizState.timerInterval = null;
        // Auto-advance or finish
        if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
          quizState.currentQuestionIndex++;
          renderActiveView();
          startActiveQuestionTimer();
        } else {
          finishAssessment();
        }
      }
    }, 1000);
  }

  function confirmSubmitAssessment() {
    const unansweredCount = quizState.userAnswers.filter((a) => a.selectedIndex === null).length;
    if (unansweredCount > 0) {
      showConfirmModal({
        title: "Submit Assessment?",
        message: `You still have ${unansweredCount} unanswered questions out of ${quizState.questions.length}. Are you sure you want to finish?`,
        confirmText: "Submit Anyway",
        isDanger: false,
        onConfirm: finishAssessment
      });
    } else {
      finishAssessment();
    }
  }

  function finishAssessment() {
    if (quizState.timerInterval) clearInterval(quizState.timerInterval);

    const total = quizState.questions.length;
    const correctCount = quizState.userAnswers.filter((a) => a.isCorrect).length;
    const unansweredCount = quizState.userAnswers.filter((a) => a.selectedIndex === null).length;
    const incorrectCount = Math.max(0, total - correctCount - unansweredCount);
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const timeTakenSec = Math.max(1, Math.round((Date.now() - (quizState.startTime || Date.now())) / 1000));

    // Save result to Storage
    Storage.saveQuizResult({
      category: quizState.activeCategory,
      categoryTitle: quizState.quizTitle,
      score: correctCount,
      total: total,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      percentage: percentage,
      timeTakenSec: timeTakenSec,
      difficulty: quizState.activeDifficulty,
      mode: quizState.quizMode,
      answers: quizState.userAnswers
    });

    quizState.isFinished = true;
    quizState.score = correctCount;

    if (percentage >= 70 && typeof Confetti !== "undefined") {
      Confetti.launch();
    }
    if (typeof SoundEngine !== "undefined") {
      if (percentage >= 70) SoundEngine.streak();
      else SoundEngine.complete();
    }

    renderNavigation();
    renderActiveView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ============================================================
  // 4. RESULTS VIEW (Clean Summary & Answer Review)
  // ============================================================
  let resultsReviewFilter = "all";

  function renderResultsView(container) {
    const total = quizState.questions.length;
    const correctCount = quizState.userAnswers.filter((a) => a.isCorrect).length;
    const unansweredCount = quizState.userAnswers.filter((a) => a.selectedIndex === null).length;
    const incorrectCount = Math.max(0, total - correctCount - unansweredCount);
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const timeSpent = Math.max(1, Math.round((Date.now() - (quizState.startTime || Date.now())) / 1000));

    // Filter review list
    let reviewItems = quizState.userAnswers.map((ans, idx) => ({ ...ans, originalIndex: idx }));
    if (resultsReviewFilter === "correct") {
      reviewItems = reviewItems.filter((a) => a.isCorrect);
    } else if (resultsReviewFilter === "incorrect") {
      reviewItems = reviewItems.filter((a) => a.selectedIndex !== null && !a.isCorrect);
    } else if (resultsReviewFilter === "unanswered") {
      reviewItems = reviewItems.filter((a) => a.selectedIndex === null);
    }

    const letters = ["A", "B", "C", "D"];
    const reviewCardsHTML = reviewItems.map((item) => {
      const q = item.question;
      const userSelected = item.selectedIndex !== null ? `${letters[item.selectedIndex]}. ${escapeHTML(q.options[item.selectedIndex])}` : "Unanswered";
      const correctStr = `${letters[q.correctAnswer]}. ${escapeHTML(q.options[q.correctAnswer])}`;
      const isSaved = Storage.isBookmarked(q.id);

      return `
        <div class="card" style="padding: 1.15rem; margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <span class="badge ${item.isCorrect ? 'badge-success' : item.selectedIndex === null ? 'badge-warning' : 'badge-danger'}">
                ${item.isCorrect ? '✓ Correct' : item.selectedIndex === null ? '— Unanswered' : '✕ Incorrect'}
              </span>
              <span class="badge badge-neutral">${escapeHTML(q.topic || 'General')}</span>
            </div>

            <button type="button" class="btn btn-ghost btn-sm bookmark-toggle-btn" data-qid="${q.id}">
              ${isSaved ? '★ Saved to Bank' : '☆ Save to Bank'}
            </button>
          </div>

          <h3 style="font-size: 0.975rem; font-weight: 600; line-height: 1.45; margin-bottom: 0.6rem;">
            ${escapeHTML(q.question)}
          </h3>

          <div style="font-size: 0.85rem; margin-bottom: 0.35rem;">
            <span style="color: var(--text-muted);">Your answer:</span>
            <span style="color: ${item.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 500;">
              ${userSelected}
            </span>
          </div>

          ${!item.isCorrect ? `
            <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Correct answer:</span>
              <span style="color: var(--color-success); font-weight: 500;">${correctStr}</span>
            </div>
          ` : ''}

          ${q.explanation ? `
            <div style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.45; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
              ${escapeHTML(q.explanation)}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="fade-in quiz-runner-container">
        <!-- Results Summary Card -->
        <div class="results-summary-card">
          <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">Quiz Completed</h2>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1.25rem;">${escapeHTML(quizState.quizTitle)}</p>

          <div class="results-stats-row">
            <div class="results-stat-box">
              <div style="font-size: 1.35rem; font-weight: 700; color: ${percentage >= 70 ? 'var(--color-success)' : 'var(--text-primary)'};">${percentage}%</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Accuracy</div>
            </div>
            <div class="results-stat-box">
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--color-success);">${correctCount}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Correct</div>
            </div>
            <div class="results-stat-box">
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--color-danger);">${incorrectCount}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Incorrect</div>
            </div>
            <div class="results-stat-box">
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary);">${timeSpent}s</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Time Spent</div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1.25rem;">
            <button type="button" class="btn btn-primary" id="retry-quiz-btn">
              Retry Quiz
            </button>
            ${incorrectCount + unansweredCount > 0 ? `
              <button type="button" class="btn btn-secondary" id="practice-missed-btn">
                Practice Missed (${incorrectCount + unansweredCount})
              </button>
            ` : ''}
            <button type="button" class="btn btn-ghost" id="return-dashboard-btn">
              Return to Dashboard
            </button>
          </div>
        </div>

        <!-- Question Review Filter & List -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 class="section-title" style="font-size: 1.15rem; margin: 0;">Review Answers</h3>

          <div class="segmented-control" role="group" aria-label="Filter reviewed answers">
            <button type="button" class="segment-btn ${resultsReviewFilter === 'all' ? 'active' : ''}" data-review-filter="all">All (${total})</button>
            <button type="button" class="segment-btn ${resultsReviewFilter === 'correct' ? 'active' : ''}" data-review-filter="correct">Correct (${correctCount})</button>
            <button type="button" class="segment-btn ${resultsReviewFilter === 'incorrect' ? 'active' : ''}" data-review-filter="incorrect">Incorrect (${incorrectCount})</button>
            ${unansweredCount > 0 ? `
              <button type="button" class="segment-btn ${resultsReviewFilter === 'unanswered' ? 'active' : ''}" data-review-filter="unanswered">Unanswered (${unansweredCount})</button>
            ` : ''}
          </div>
        </div>

        <div>
          ${reviewCardsHTML}
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll(".segment-btn[data-review-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        resultsReviewFilter = btn.getAttribute("data-review-filter");
        renderResultsView(container);
      });
    });

    const retryBtn = document.getElementById("retry-quiz-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        quizState.isFinished = false;
        resetQuizRunState();
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    }

    const practiceMissedBtn = document.getElementById("practice-missed-btn");
    if (practiceMissedBtn) {
      practiceMissedBtn.addEventListener("click", () => {
        const missed = quizState.userAnswers
          .filter((a) => !a.isCorrect)
          .map((a) => a.question);
        if (missed.length > 0) {
          if (typeof SoundEngine !== "undefined") SoundEngine.click();
          initializeMissedQuestionsQuiz(missed);
          renderActiveView();
          if (quizState.isTimedMode) startActiveQuestionTimer();
        }
      });
    }

    const returnDashBtn = document.getElementById("return-dashboard-btn");
    if (returnDashBtn) {
      returnDashBtn.addEventListener("click", () => {
        quizState.questions = [];
        quizState.isFinished = false;
        switchTab("hub");
      });
    }

    container.querySelectorAll(".bookmark-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const q = QuestionService.getQuestionById(qid);
        if (!q) return;
        const isNowBookmarked = Storage.toggleBookmark(q);
        btn.textContent = isNowBookmarked ? "★ Saved to Bank" : "☆ Save to Bank";
        showToast(isNowBookmarked ? "Saved to Study Bank" : "Removed from Study Bank", "info");
        renderNavigation();
      });
    });
  }

  // ============================================================
  // 5. PERFORMANCE ANALYTICS (Readable, Clean Dashboard)
  // ============================================================
  let showAllLevels = false;

  function renderPerformanceView(container) {
    const analytics = Storage.getAnalytics();
    const history = Storage.getHistory();
    const categories = QuestionService.getCategories();

    // Topic Performance List Calculation
    const topicStatsMap = {};
    for (const h of history) {
      const catKey = h.category || "general";
      if (!topicStatsMap[catKey]) {
        topicStatsMap[catKey] = {
          title: h.categoryTitle || "General",
          category: catKey,
          attempts: 0,
          totalQuestions: 0,
          totalCorrect: 0
        };
      }
      topicStatsMap[catKey].attempts++;
      topicStatsMap[catKey].totalQuestions += (h.total || 0);
      topicStatsMap[catKey].totalCorrect += (h.score || 0);
    }

    const topicStatsList = Object.values(topicStatsMap).map((item) => {
      const accuracy = item.totalQuestions > 0 ? Math.round((item.totalCorrect / item.totalQuestions) * 100) : 0;
      return {
        ...item,
        accuracy: accuracy,
        isWeak: accuracy < 60
      };
    }).sort((a, b) => a.accuracy - b.accuracy);

    // Topic Performance Table Rows
    let topicPerformanceRowsHTML = "";
    if (topicStatsList.length === 0) {
      topicPerformanceRowsHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
            Complete quizzes in different topics to see your topic breakdown here.
          </td>
        </tr>
      `;
    } else {
      topicPerformanceRowsHTML = topicStatsList.map((t) => `
        <tr>
          <td style="font-weight: 500;">${escapeHTML(t.title)}</td>
          <td>${t.totalQuestions} Questions</td>
          <td>
            <span style="font-weight: 600; color: ${t.isWeak ? 'var(--color-danger)' : t.accuracy >= 75 ? 'var(--color-success)' : 'var(--text-primary)'};">
              ${t.accuracy}%
            </span>
            ${t.isWeak ? `<span class="badge badge-danger" style="margin-left: 0.35rem; font-size: 0.68rem;">Needs Focus</span>` : ''}
          </td>
          <td>
            <button type="button" class="btn btn-ghost btn-sm perf-practice-topic-btn" data-cat="${t.category}">
              Practice
            </button>
          </td>
        </tr>
      `).join("");
    }

    // Progression 8 Levels (Collapsible)
    const currentLvl = analytics.currentLevel || { level: 1, title: "Curious Learner" };
    const nextLvl = analytics.achievements.find((l) => !l.unlocked) || null;
    const nextReq = nextLvl ? nextLvl.requirement : "Max level achieved!";
    const nextPct = nextLvl ? Math.round(nextLvl.progress * 100) : 100;

    const levelsHTML = analytics.achievements.map((lvl) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 0.4rem;">
        <div>
          <div style="font-weight: 600; font-size: 0.85rem; color: ${lvl.unlocked ? 'var(--text-primary)' : 'var(--text-muted)'};">
            Level ${lvl.level}: ${escapeHTML(lvl.title)} ${lvl.unlocked ? '✓' : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHTML(lvl.requirement)}</div>
        </div>
        <span class="badge ${lvl.unlocked ? 'badge-success' : 'badge-neutral'}">
          ${lvl.unlocked ? 'Unlocked' : `${Math.round(lvl.progress * 100)}%`}
        </span>
      </div>
    `).join("");

    // Performance Trend Chart (Simple SVG line visualization if history >= 2)
    let chartHTML = "";
    if (history.length >= 2) {
      const recentAttempts = history.slice(0, 10).reverse();
      const points = recentAttempts.map((h, i) => {
        const x = Math.round(20 + (i / Math.max(1, recentAttempts.length - 1)) * 360);
        const y = Math.round(90 - ((h.percentage || 0) / 100) * 70);
        return { x, y, pct: h.percentage || 0 };
      });
      const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

      chartHTML = `
        <div class="chart-container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 0.95rem; font-weight: 600; margin: 0;">Accuracy Trend (Recent Quizzes)</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Past ${recentAttempts.length} attempts</span>
          </div>
          <svg viewBox="0 0 400 110" style="width: 100%; height: 110px; overflow: visible;">
            <line x1="20" y1="20" x2="380" y2="20" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
            <line x1="20" y1="55" x2="380" y2="55" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
            <line x1="20" y1="90" x2="380" y2="90" stroke="var(--border-subtle)" />
            <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2" points="${polylinePoints}" />
            ${points.map((p) => `
              <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="var(--bg-card)" stroke="var(--accent-primary)" stroke-width="2" />
              <text x="${p.x}" y="${p.y - 7}" font-size="9" fill="var(--text-muted)" text-anchor="middle">${p.pct}%</text>
            `).join("")}
          </svg>
        </div>
      `;
    }

    // Recent Quiz History Table Rows
    let historyRowsHTML = "";
    if (history.length === 0) {
      historyRowsHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
            No quiz attempts recorded yet.
            <div style="margin-top: 0.75rem;">
              <button type="button" class="btn btn-primary btn-sm" id="perf-start-first-quiz-btn">Start Practicing</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      historyRowsHTML = history.slice(0, 15).map((h) => `
        <tr>
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(h.categoryTitle || 'General Assessment')}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${h.date} • ${h.time}</div>
          </td>
          <td>
            <span class="badge badge-sm ${h.mode === 'exam' ? 'badge-warning' : 'badge-neutral'}">
              ${h.mode === 'exam' ? 'Exam' : 'Practice'}
            </span>
          </td>
          <td>
            <strong>${h.score}</strong> / ${h.total}
          </td>
          <td>
            <span style="font-weight: 600; color: ${h.percentage >= 70 ? 'var(--color-success)' : 'var(--text-primary)'};">
              ${h.percentage}%
            </span>
          </td>
          <td>${h.timeTakenSec}s</td>
          <td style="text-align: right;">
            <button type="button" class="icon-btn delete-history-btn" data-hid="${h.id}" title="Remove record" style="width: 26px; height: 26px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </td>
        </tr>
      `).join("");
    }

    container.innerHTML = `
      <div class="fade-in">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h1 class="section-title" style="font-size: 1.6rem;">Performance Analytics</h1>
            <p class="section-desc">Statistics computed from your verified quiz history.</p>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn btn-secondary btn-sm" id="perf-backup-modal-btn">
              Backup & Export
            </button>
            ${history.length > 0 ? `
              <button type="button" class="btn btn-ghost btn-sm" id="perf-clear-history-btn" style="color: var(--color-danger);">
                Clear History
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 1. Summary Row (4 Compact Statistics) -->
        <section class="analytics-summary-row" aria-label="Key Statistics">
          <div class="stat-block">
            <div class="stat-label">Questions Attempted</div>
            <div class="stat-value">${analytics.totalQuestions}</div>
            <div class="stat-subtext">${analytics.uniqueQuestionsSolved} unique answered</div>
          </div>

          <div class="stat-block">
            <div class="stat-label">Correct Answers</div>
            <div class="stat-value" style="color: var(--color-success);">${analytics.totalCorrect}</div>
            <div class="stat-subtext">${analytics.totalIncorrect} incorrect</div>
          </div>

          <div class="stat-block">
            <div class="stat-label">Overall Accuracy</div>
            <div class="stat-value" style="color: ${analytics.averageAccuracy >= 70 ? 'var(--color-success)' : 'var(--text-primary)'};">${analytics.averageAccuracy}%</div>
            <div class="stat-subtext">Best: ${analytics.bestScore}%</div>
          </div>

          <div class="stat-block">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">${analytics.currentStreak} ${analytics.currentStreak === 1 ? 'Day' : 'Days'}</div>
            <div class="stat-subtext">Best: ${analytics.bestStreak} ${analytics.bestStreak === 1 ? 'day' : 'days'}</div>
          </div>
        </section>

        <!-- 2. Performance Visualization (Chart) -->
        ${chartHTML}

        <!-- 3. Topic Performance Breakdown -->
        <section class="data-table-wrap">
          <div style="padding: 1rem 1.25rem 0.5rem; border-bottom: 1px solid var(--border-subtle);">
            <h3 style="font-size: 1rem; font-weight: 600; margin: 0;">Topic Performance</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Attempted</th>
                <th>Accuracy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${topicPerformanceRowsHTML}
            </tbody>
          </table>
        </section>

        <!-- 4. Developer Progression (Compact & Collapsible) -->
        <section class="progression-summary-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.2rem;">
                Rank: ${escapeHTML(currentLvl.title)}
              </h3>
              <p style="font-size: 0.8125rem; color: var(--text-secondary); margin: 0;">
                Next Level: <strong>${escapeHTML(nextLvl ? nextLvl.title : 'Mastery Achieved')}</strong> — ${escapeHTML(nextReq)}
              </p>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="toggle-levels-btn">
              ${showAllLevels ? 'Hide Levels' : 'View All 8 Levels'}
            </button>
          </div>

          <!-- Progress to next level -->
          <div style="height: 5px; background: var(--bg-subtle); border-radius: 3px; overflow: hidden; margin-bottom: 0.85rem;">
            <div style="width: ${nextPct}%; height: 100%; background: var(--accent-primary); border-radius: 3px;"></div>
          </div>

          <div id="all-levels-container" style="display: ${showAllLevels ? 'block' : 'none'}; margin-top: 1rem;">
            ${levelsHTML}
          </div>
        </section>

        <!-- 5. Recent Attempts Table -->
        <section class="data-table-wrap">
          <div style="padding: 1rem 1.25rem 0.5rem; border-bottom: 1px solid var(--border-subtle);">
            <h3 style="font-size: 1rem; font-weight: 600; margin: 0;">Recent Quiz Attempts</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Mode</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Duration</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${historyRowsHTML}
            </tbody>
          </table>
        </section>
      </div>
    `;

    // Event listeners for Performance
    const backupModalBtn = document.getElementById("perf-backup-modal-btn");
    if (backupModalBtn) {
      backupModalBtn.addEventListener("click", showBackupModal);
    }

    const clearHistoryBtn = document.getElementById("perf-clear-history-btn");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => {
        showConfirmModal({
          title: "Clear All Quiz Logs?",
          message: "Are you sure you want to delete all historical quiz logs? Your bookmarked questions will remain untouched.",
          confirmText: "Clear All",
          isDanger: true,
          onConfirm: () => {
            Storage.clearHistory();
            showToast("History cleared successfully", "info");
            renderNavigation();
            renderPerformanceView(container);
          }
        });
      });
    }

    const startFirstBtn = document.getElementById("perf-start-first-quiz-btn");
    if (startFirstBtn) {
      startFirstBtn.addEventListener("click", () => {
        switchTab("hub");
      });
    }

    const toggleLevelsBtn = document.getElementById("toggle-levels-btn");
    if (toggleLevelsBtn) {
      toggleLevelsBtn.addEventListener("click", () => {
        showAllLevels = !showAllLevels;
        const c = document.getElementById("all-levels-container");
        if (c) c.style.display = showAllLevels ? "block" : "none";
        toggleLevelsBtn.textContent = showAllLevels ? "Hide Levels" : "View All 8 Levels";
      });
    }

    container.querySelectorAll(".perf-practice-topic-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-cat") || "all";
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeStandardQuiz(cat, "all", 10, "practice");
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    });

    container.querySelectorAll(".delete-history-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hid = btn.getAttribute("data-hid");
        Storage.deleteHistoryEntry(hid);
        showToast("Log entry deleted", "info");
        renderNavigation();
        renderPerformanceView(container);
      });
    });
  }

  // ============================================================
  // 6. STUDY BANK VIEW (Personal Revision Library)
  // ============================================================
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
      bookmarks = bookmarks.filter((q) => (q.difficulty || "").toLowerCase() === studyBankDiffFilter.toLowerCase());
    }
    if (studyBankSearchQuery.trim()) {
      const q = studyBankSearchQuery.toLowerCase().trim();
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </div>
          <h3 class="empty-state-title">Your study bank is empty.</h3>
          <p class="empty-state-desc">Save questions while practicing to review them later.</p>
          <button type="button" class="btn btn-primary btn-sm" id="study-bank-explore-btn">Browse Questions</button>
        </div>
      `;
    } else {
      const letters = ["A", "B", "C", "D"];
      itemsHTML = bookmarks.map((q, idx) => {
        const catObj = categories[q.category] || { title: q.topic || "General" };
        const correctStr = `${letters[q.correctAnswer]}. ${escapeHTML(q.options[q.correctAnswer])}`;

        return `
          <div class="study-item-card fade-in" data-qid="${q.id}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span class="badge badge-neutral">${escapeHTML(catObj.title)}</span>
                <span class="badge badge-${q.difficulty}">${q.difficulty}</span>
              </div>

              <div style="display: flex; gap: 0.35rem; align-items: center;">
                <button type="button" class="btn btn-secondary btn-sm practice-single-saved-btn" data-qid="${q.id}">
                  Practice
                </button>
                <button type="button" class="btn btn-ghost btn-sm remove-bookmark-action-btn" data-qid="${q.id}" style="color: var(--color-danger);">
                  Remove
                </button>
              </div>
            </div>

            <h3 style="font-size: 1rem; font-weight: 600; line-height: 1.45; margin-bottom: 0.65rem;">
              <span style="color: var(--text-muted); font-size: 0.85rem; margin-right: 0.35rem;">#${idx + 1}</span>
              ${escapeHTML(q.question)}
            </h3>

            ${q.codeSnippet ? `
              <pre class="code-snippet-box"><code>${escapeHTML(q.codeSnippet)}</code></pre>
            ` : ''}

            <!-- Correct Answer Display -->
            <div class="study-correct-box">
              <strong>Correct Answer:</strong> ${correctStr}
            </div>

            ${q.hint ? `
              <div style="font-size: 0.825rem; color: #fbbf24; margin-bottom: 0.4rem;">
                💡 <strong>Hint:</strong> ${escapeHTML(q.hint)}
              </div>
            ` : ''}

            ${q.explanation ? `
              <div style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.45;">
                📖 <strong>Explanation:</strong> ${escapeHTML(q.explanation)}
              </div>
            ` : ''}
          </div>
        `;
      }).join("");
    }

    container.innerHTML = `
      <div class="fade-in">
        <div class="study-bank-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h1 class="section-title" style="font-size: 1.6rem;">Study Bank</h1>
            <p class="section-desc">Personal revision library of saved questions.</p>
          </div>

          ${bookmarks.length > 0 ? `
            <button type="button" class="btn btn-primary btn-sm" id="practice-study-bank-btn">
              Practice Saved Questions (${bookmarks.length})
            </button>
          ` : ''}
        </div>

        <!-- Filter bar for Study Bank -->
        <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <div class="search-box">
            <span class="search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" id="sb-search-input" class="form-control search-input" placeholder="Search saved questions..." value="${escapeHTML(studyBankSearchQuery)}" />
          </div>

          <select id="sb-cat-select" class="form-select" style="width: auto; min-width: 160px;">
            <option value="all" ${studyBankCatFilter === 'all' ? 'selected' : ''}>All Topics</option>
            ${Object.values(categories).map((c) => `<option value="${c.id}" ${studyBankCatFilter === c.id ? 'selected' : ''}>${escapeHTML(c.title)}</option>`).join("")}
          </select>

          <select id="sb-diff-select" class="form-select" style="width: auto; min-width: 130px;">
            <option value="all" ${studyBankDiffFilter === 'all' ? 'selected' : ''}>All Difficulties</option>
            <option value="easy" ${studyBankDiffFilter === 'easy' ? 'selected' : ''}>Easy</option>
            <option value="medium" ${studyBankDiffFilter === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="hard" ${studyBankDiffFilter === 'hard' ? 'selected' : ''}>Hard</option>
          </select>
        </div>

        <!-- Items count feedback -->
        <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">
          Showing ${bookmarks.length} saved ${bookmarks.length === 1 ? 'question' : 'questions'}
        </div>

        <div>
          ${itemsHTML}
        </div>
      </div>
    `;

    // Event listeners
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

    const practiceAllBtn = document.getElementById("practice-study-bank-btn");
    if (practiceAllBtn) {
      practiceAllBtn.addEventListener("click", () => {
        if (bookmarks.length === 0) return;
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

    container.querySelectorAll(".practice-single-saved-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const q = QuestionService.getQuestionById(qid);
        if (!q) return;
        if (typeof SoundEngine !== "undefined") SoundEngine.click();
        initializeQuizFromQuestions([q], `Revision Drill (1 Question)`, "practice", "study_bank");
        renderActiveView();
        if (quizState.isTimedMode) startActiveQuestionTimer();
      });
    });

    // Remove action updates UI immediately!
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

  // ============================================================
  // 7. MODALS: QUIZ CONFIG, GOAL, & BACKUP
  // ============================================================
  function showQuizConfigModal(preselectedCategory = "all") {
    const dialog = document.getElementById("quiz-config-dialog");
    if (!dialog) return;

    const topicSelect = document.getElementById("config-topic-select");
    const diffSelect = document.getElementById("config-diff-select");
    const modeSelect = document.getElementById("config-mode-select");
    const countSelect = document.getElementById("config-count-select");
    const timerSelect = document.getElementById("config-timer-select");
    const shuffleCheckbox = document.getElementById("config-shuffle-checkbox");
    const poolCountEl = document.getElementById("config-pool-count");
    const startBtn = document.getElementById("config-start-btn");
    const cancelBtn = document.getElementById("config-cancel-btn");

    const categories = QuestionService.getCategories();

    // Populate all 20 categories
    topicSelect.innerHTML = `
      <option value="all">All Topics (Comprehensive Pool)</option>
      ${Object.values(categories).map((c) => `
        <option value="${c.id}" ${preselectedCategory === c.id ? 'selected' : ''}>${escapeHTML(c.title)}</option>
      `).join("")}
    `;

    function updatePoolCount() {
      const cat = topicSelect.value;
      const diff = diffSelect.value;
      let pool = QuestionService.getQuestionsByCategory(cat);
      if (diff !== "all") {
        pool = pool.filter((q) => (q.difficulty || "").toLowerCase() === diff.toLowerCase());
      }
      if (poolCountEl) {
        poolCountEl.textContent = `${pool.length.toLocaleString()} Questions Available`;
      }
    }

    updatePoolCount();
    topicSelect.addEventListener("change", updatePoolCount);
    diffSelect.addEventListener("change", updatePoolCount);

    const handleStart = (e) => {
      e.preventDefault();
      const cat = topicSelect.value;
      const diff = diffSelect.value;
      const mode = modeSelect ? modeSelect.value : "practice";
      const count = countSelect.value;
      const timeLimit = parseInt(timerSelect.value, 10);
      const isTimed = timeLimit > 0;
      const shuffle = shuffleCheckbox ? shuffleCheckbox.checked : true;

      cleanup();
      dialog.close();

      if (typeof SoundEngine !== "undefined") SoundEngine.click();
      initializeConfiguredQuiz({
        category: cat,
        difficulty: diff,
        count: count,
        isTimed: isTimed,
        timeLimit: timeLimit,
        mode: mode,
        shuffle: shuffle
      });

      renderActiveView();
      if (quizState.isTimedMode) startActiveQuestionTimer();
    };

    const handleCancel = () => {
      cleanup();
      dialog.close();
    };

    function cleanup() {
      startBtn.removeEventListener("click", handleStart);
      cancelBtn.removeEventListener("click", handleCancel);
      topicSelect.removeEventListener("change", updatePoolCount);
      diffSelect.removeEventListener("change", updatePoolCount);
    }

    startBtn.addEventListener("click", handleStart);
    cancelBtn.addEventListener("click", handleCancel);

    dialog.showModal();
  }

  function showBackupModal() {
    const dialog = document.getElementById("backup-dialog");
    const closeBtn = document.getElementById("backup-close-btn");
    const exportBtn = document.getElementById("export-backup-btn");
    const triggerImportBtn = document.getElementById("trigger-import-btn");
    const importFileInput = document.getElementById("import-backup-file-input");
    const resetStorageBtn = document.getElementById("reset-storage-btn");
    const statusMsg = document.getElementById("import-status-msg");

    if (!dialog) return;

    if (exportBtn) {
      exportBtn.onclick = () => {
        Storage.exportData();
        showToast("Backup downloaded as JSON", "success");
      };
    }

    if (triggerImportBtn && importFileInput) {
      triggerImportBtn.onclick = () => importFileInput.click();
      importFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const success = Storage.importData(event.target.result);
          if (statusMsg) {
            statusMsg.style.display = "block";
            statusMsg.style.color = success ? "var(--color-success)" : "var(--color-danger)";
            statusMsg.textContent = success ? "✓ Backup restored successfully!" : "❌ Invalid backup JSON file.";
          }
          if (success) {
            showToast("Backup restored successfully!", "success");
            renderNavigation();
            renderActiveView();
          }
        };
        reader.readAsText(file);
      };
    }

    if (resetStorageBtn) {
      resetStorageBtn.onclick = () => {
        showConfirmModal({
          title: "Reset All Local Data?",
          message: "This will permanently erase all quiz logs, bookmark libraries, and analytics on this device.",
          confirmText: "Erase Everything",
          isDanger: true,
          onConfirm: () => {
            Storage.resetAll();
            dialog.close();
            showToast("All data reset successfully", "info");
            renderNavigation();
            renderActiveView();
          }
        });
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => dialog.close();
    }

    dialog.showModal();
  }

  // Public API
  return {
    renderNavigation,
    renderActiveView,
    switchTab,
    updateHeaderActions,
    showToast,
    showConfirmModal,
    showQuizConfigModal,
    showBackupModal
  };
})();
