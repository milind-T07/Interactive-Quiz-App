/* ============================================================
   STORAGE.JS — Data Persistence, Analytics & 8-Level Achievements
   ============================================================ */

const STORAGE_KEYS = {
  HISTORY: "quiz_app_history",
  BOOKMARKS: "quiz_app_bookmarks",
  CUSTOM_QUIZZES: "quiz_app_custom_quizzes",
  THEME: "quiz_app_theme",
  SOUND_MUTED: "quiz_sound_muted",
  DAILY_GOAL: "quiz_app_daily_goal"
};

const Storage = (function () {
  function getJSON(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (e) {
      console.warn("Storage read fallback for:", key, e);
      return fallback;
    }
  }

  function setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage write error for:", key, e);
    }
  }

  return {
    // --- Quiz History ---
    getHistory: function () {
      return getJSON(STORAGE_KEYS.HISTORY, []);
    },

    saveQuizResult: function (result) {
      const history = getJSON(STORAGE_KEYS.HISTORY, []);
      const newEntry = {
        id: "res_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        time: new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit"
        }),
        timestamp: Date.now(),
        category: result.category || "all",
        categoryTitle: result.categoryTitle || (CATEGORIES[result.category] ? CATEGORIES[result.category].title : "General Assessment"),
        score: Number(result.score) || 0,
        total: Number(result.total) || 0,
        incorrect: Math.max(0, (Number(result.total) || 0) - (Number(result.score) || 0) - (Number(result.unanswered) || 0)),
        unanswered: Number(result.unanswered) || 0,
        percentage: Number(result.percentage) || 0,
        timeTakenSec: Number(result.timeTakenSec) || 0,
        difficulty: result.difficulty || "mixed",
        mode: result.mode || "practice", // 'practice' | 'exam' | 'daily' | 'study_bank'
        topicBreakdown: result.topicBreakdown || null,
        answers: result.answers || [] // Detailed snapshot of user choices for review reopening
      };

      history.unshift(newEntry);
      // Retain up to 200 past attempts for analytics
      if (history.length > 200) history.pop();
      setJSON(STORAGE_KEYS.HISTORY, history);
      return newEntry;
    },

    deleteHistoryEntry: function (id) {
      let history = getJSON(STORAGE_KEYS.HISTORY, []);
      history = history.filter((h) => h.id !== id);
      setJSON(STORAGE_KEYS.HISTORY, history);
      return history;
    },

    clearHistory: function () {
      setJSON(STORAGE_KEYS.HISTORY, []);
    },

    // --- Bookmarks / Study Bank ---
    getBookmarks: function () {
      return getJSON(STORAGE_KEYS.BOOKMARKS, []);
    },

    toggleBookmark: function (questionObj) {
      if (!questionObj || !questionObj.id) return false;
      let bookmarks = getJSON(STORAGE_KEYS.BOOKMARKS, []);
      const index = bookmarks.findIndex((b) => b.id === questionObj.id);
      let isBookmarked = false;

      if (index >= 0) {
        bookmarks.splice(index, 1);
        isBookmarked = false;
      } else {
        const itemToSave = {
          ...questionObj,
          savedAt: Date.now(),
          reviewed: false
        };
        bookmarks.unshift(itemToSave);
        isBookmarked = true;
      }
      setJSON(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return isBookmarked;
    },

    isBookmarked: function (questionId) {
      const bookmarks = getJSON(STORAGE_KEYS.BOOKMARKS, []);
      return bookmarks.some((b) => b.id === questionId);
    },

    toggleBookmarkReviewed: function (questionId) {
      let bookmarks = getJSON(STORAGE_KEYS.BOOKMARKS, []);
      const item = bookmarks.find((b) => b.id === questionId);
      if (item) {
        item.reviewed = !item.reviewed;
        setJSON(STORAGE_KEYS.BOOKMARKS, bookmarks);
        return item.reviewed;
      }
      return false;
    },

    removeBookmark: function (questionId) {
      let bookmarks = getJSON(STORAGE_KEYS.BOOKMARKS, []);
      bookmarks = bookmarks.filter((b) => b.id !== questionId);
      setJSON(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return bookmarks;
    },

    clearAllBookmarks: function () {
      setJSON(STORAGE_KEYS.BOOKMARKS, []);
    },

    // --- Daily Goal Settings ---
    getDailyGoal: function () {
      try {
        const val = parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_GOAL), 10);
        return isNaN(val) || val <= 0 ? 10 : val;
      } catch (e) {
        return 10;
      }
    },

    setDailyGoal: function (goal) {
      localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, Math.max(1, parseInt(goal, 10) || 10));
    },

    // --- Dynamic Analytics Calculated From Genuine History ---
    getAnalytics: function () {
      const history = this.getHistory();
      const totalQuizzes = history.length;
      let totalQuestions = 0;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalUnanswered = 0;
      let totalTimeSec = 0;
      let bestScore = 0;
      const categoryMap = {};
      const difficultyMap = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
      const uniqueQuestionsSolved = new Set();

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      let todayQuestionsCount = 0;

      // Group by distinct days for streak calculation and activity calendar
      const dailyActivityMap = {};
      const activeDaysSet = new Set();

      history.forEach((h) => {
        const qCount = h.total || 0;
        const cCount = h.score || 0;
        const uCount = h.unanswered || 0;
        const iCount = h.incorrect !== undefined ? h.incorrect : Math.max(0, qCount - cCount - uCount);

        totalQuestions += qCount;
        totalCorrect += cCount;
        totalIncorrect += iCount;
        totalUnanswered += uCount;
        totalTimeSec += h.timeTakenSec || 0;

        if (h.percentage > bestScore) {
          bestScore = h.percentage;
        }

        if (h.timestamp >= startOfToday) {
          todayQuestionsCount += qCount;
        }

        const dateKey = new Date(h.timestamp).toDateString();
        const isoDayKey = new Date(h.timestamp).toISOString().slice(0, 10);
        activeDaysSet.add(dateKey);

        if (!dailyActivityMap[isoDayKey]) {
          dailyActivityMap[isoDayKey] = { date: isoDayKey, questions: 0, correct: 0, quizzes: 0 };
        }
        dailyActivityMap[isoDayKey].questions += qCount;
        dailyActivityMap[isoDayKey].correct += cCount;
        dailyActivityMap[isoDayKey].quizzes += 1;

        // Track answered question IDs if present in answers array
        if (Array.isArray(h.answers)) {
          h.answers.forEach((ans) => {
            if (ans.question && ans.question.id) {
              uniqueQuestionsSolved.add(ans.question.id);
            }
          });
        }

        // Category breakdown
        const catId = h.category || "all";
        if (!categoryMap[catId]) {
          categoryMap[catId] = {
            id: catId,
            title: h.categoryTitle || (CATEGORIES[catId] ? CATEGORIES[catId].title : catId),
            attempts: 0,
            totalScore: 0,
            totalQuestions: 0
          };
        }
        categoryMap[catId].attempts += 1;
        categoryMap[catId].totalScore += cCount;
        categoryMap[catId].totalQuestions += qCount;

        // Difficulty tracking
        const diff = (h.difficulty || "medium").toLowerCase();
        if (difficultyMap[diff]) {
          difficultyMap[diff].total += qCount;
          difficultyMap[diff].correct += cCount;
        }
      });

      const averageAccuracy = totalQuestions > 0 
        ? Math.round((totalCorrect / totalQuestions) * 100) 
        : 0;

      // Calculate current streak & best streak
      let currentStreak = 0;
      let bestStreak = 0;
      if (activeDaysSet.size > 0) {
        const checkDate = new Date();
        const todayKey = checkDate.toDateString();
        const yesterday = new Date(checkDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toDateString();

        let anchor = checkDate;
        if (!activeDaysSet.has(todayKey) && activeDaysSet.has(yesterdayKey)) {
          anchor = yesterday;
        }

        if (activeDaysSet.has(todayKey) || activeDaysSet.has(yesterdayKey)) {
          let curr = new Date(anchor);
          while (activeDaysSet.has(curr.toDateString())) {
            currentStreak++;
            curr.setDate(curr.getDate() - 1);
          }
        }

        // Scan all days to find maximum historical streak
        const sortedDays = Array.from(activeDaysSet).map(d => new Date(d).getTime()).sort((a, b) => a - b);
        let tempStreak = 0;
        let prevTime = null;
        sortedDays.forEach(t => {
          if (prevTime === null) {
            tempStreak = 1;
          } else {
            const diffDays = Math.round((t - prevTime) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              tempStreak = 1;
            }
          }
          prevTime = t;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        });
      }
      bestStreak = Math.max(bestStreak, currentStreak);

      // Category breakdown array with accuracy percentages
      const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
        ...cat,
        accuracy: cat.totalQuestions > 0 ? Math.round((cat.totalScore / cat.totalQuestions) * 100) : 0
      }));

      // Sort categories by attempts and accuracy
      categoryBreakdown.sort((a, b) => b.totalQuestions - a.totalQuestions);

      const strongestTopic = categoryBreakdown.length > 0
        ? [...categoryBreakdown].sort((a, b) => b.accuracy - a.accuracy)[0]
        : null;

      const weakestTopic = categoryBreakdown.length > 1
        ? [...categoryBreakdown].sort((a, b) => a.accuracy - b.accuracy)[0]
        : null;

      // 8 Progression Levels as requested:
      // 1. Beginner, 2. Learner, 3. Intermediate, 4. Advanced, 5. Expert, 6. Master, 7. Grandmaster, 8. Legend
      const topicsCoveredCount = categoryBreakdown.filter(c => c.totalQuestions >= 5).length;
      const achievements = [
        {
          id: "lvl_1_beginner",
          level: 1,
          title: "Beginner",
          badge: "Novice Coder",
          icon: "seedling",
          desc: "Complete your first technical quiz session",
          unlocked: totalQuizzes >= 1,
          progress: Math.min(1, totalQuizzes / 1),
          metric: `${Math.min(1, totalQuizzes)}/1 Quiz Completed`,
          requirement: "1 Completed Quiz",
          color: "#10b981"
        },
        {
          id: "lvl_2_learner",
          level: 2,
          title: "Learner",
          badge: "Active Learner",
          icon: "book-open",
          desc: "Solve 25 questions with at least 60% overall accuracy",
          unlocked: totalQuestions >= 25 && averageAccuracy >= 60,
          progress: Math.min(1, (totalQuestions / 25) * 0.7 + (Math.min(60, averageAccuracy) / 60) * 0.3),
          metric: `${Math.min(25, totalQuestions)}/25 Qs (${averageAccuracy}% / 60% Acc)`,
          requirement: "25 Qs Solved & ≥60% Accuracy",
          color: "#06b6d4"
        },
        {
          id: "lvl_3_intermediate",
          level: 3,
          title: "Intermediate",
          badge: "Problem Solver",
          icon: "code",
          desc: "Solve 100 questions across at least 3 distinct topics",
          unlocked: totalQuestions >= 100 && topicsCoveredCount >= 3,
          progress: Math.min(1, (totalQuestions / 100) * 0.7 + (Math.min(3, topicsCoveredCount) / 3) * 0.3),
          metric: `${Math.min(100, totalQuestions)}/100 Qs across ${Math.min(3, topicsCoveredCount)}/3 Topics`,
          requirement: "100 Qs Solved & 3 Topics Explored",
          color: "#3b82f6"
        },
        {
          id: "lvl_4_advanced",
          level: 4,
          title: "Advanced",
          badge: "Senior Thinker",
          icon: "layers",
          desc: "Complete 10 quizzes with at least 75% average accuracy",
          unlocked: totalQuizzes >= 10 && averageAccuracy >= 75,
          progress: Math.min(1, (totalQuizzes / 10) * 0.6 + (Math.min(75, averageAccuracy) / 75) * 0.4),
          metric: `${Math.min(10, totalQuizzes)}/10 Quizzes (${averageAccuracy}% / 75% Acc)`,
          requirement: "10 Quizzes & ≥75% Accuracy",
          color: "#8b5cf6"
        },
        {
          id: "lvl_5_expert",
          level: 5,
          title: "Expert",
          badge: "Tech Architect",
          icon: "cpu",
          desc: "Solve 250 questions and maintain a 5-day practice streak",
          unlocked: totalQuestions >= 250 && bestStreak >= 5,
          progress: Math.min(1, (totalQuestions / 250) * 0.7 + (Math.min(5, bestStreak) / 5) * 0.3),
          metric: `${Math.min(250, totalQuestions)}/250 Qs & ${Math.min(5, bestStreak)}/5 Day Streak`,
          requirement: "250 Qs Solved & 5-Day Streak",
          color: "#ec4899"
        },
        {
          id: "lvl_6_master",
          level: 6,
          title: "Master",
          badge: "Domain Master",
          icon: "shield-check",
          desc: "Solve 500 questions and master 5 topics with ≥80% accuracy",
          unlocked: totalQuestions >= 500 && categoryBreakdown.filter(c => c.totalQuestions >= 20 && c.accuracy >= 80).length >= 5,
          progress: Math.min(1, (totalQuestions / 500) * 0.6 + (Math.min(5, categoryBreakdown.filter(c => c.accuracy >= 80).length) / 5) * 0.4),
          metric: `${Math.min(500, totalQuestions)}/500 Qs & ${categoryBreakdown.filter(c => c.accuracy >= 80).length}/5 Mastered Topics`,
          requirement: "500 Qs & 5 Topics ≥80% Acc",
          color: "#f59e0b"
        },
        {
          id: "lvl_7_grandmaster",
          level: 7,
          title: "Grandmaster",
          badge: "Grandmaster",
          icon: "crown",
          desc: "Solve 1,000 questions, complete 50 quizzes, and hold a 10-day streak",
          unlocked: totalQuestions >= 1000 && totalQuizzes >= 50 && bestStreak >= 10,
          progress: Math.min(1, (totalQuestions / 1000) * 0.5 + (totalQuizzes / 50) * 0.3 + (Math.min(10, bestStreak) / 10) * 0.2),
          metric: `${Math.min(1000, totalQuestions)}/1000 Qs & ${Math.min(50, totalQuizzes)}/50 Quizzes`,
          requirement: "1,000 Qs, 50 Quizzes & 10-Day Streak",
          color: "#e11d48"
        },
        {
          id: "lvl_8_legend",
          level: 8,
          title: "Legend",
          badge: "Living Legend",
          icon: "sparkles",
          desc: "Solve 2,000 questions with ≥90% overall accuracy and a 15-day streak",
          unlocked: totalQuestions >= 2000 && averageAccuracy >= 90 && bestStreak >= 15,
          progress: Math.min(1, (totalQuestions / 2000) * 0.5 + (Math.min(90, averageAccuracy) / 90) * 0.3 + (Math.min(15, bestStreak) / 15) * 0.2),
          metric: `${Math.min(2000, totalQuestions)}/2000 Qs & ${averageAccuracy}%/90% Acc`,
          requirement: "2,000 Qs, ≥90% Acc & 15-Day Streak",
          color: "#a855f7"
        }
      ];

      // Find current active rank and next milestone
      const unlockedLevels = achievements.filter(a => a.unlocked);
      const currentLevel = unlockedLevels.length > 0 ? unlockedLevels[unlockedLevels.length - 1] : achievements[0];
      const nextMilestone = achievements.find(a => !a.unlocked) || null;

      return {
        totalQuizzes,
        totalQuestions,
        uniqueQuestionsSolved: uniqueQuestionsSolved.size,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
        totalPracticeTimeSec: totalTimeSec,
        averageAccuracy,
        bestScore,
        currentStreak,
        bestStreak,
        todayQuestionsCount,
        dailyGoal: this.getDailyGoal(),
        categoryBreakdown,
        difficultyBreakdown: difficultyMap,
        strongestTopic,
        weakestTopic,
        dailyActivity: dailyActivityMap,
        achievements,
        currentLevel,
        nextMilestone,
        lastAttempt: history[0] || null,
        todayDailyChallenge: this.getTodayDailyChallengeAttempt()
      };
    },

    getTodayDailyChallengeAttempt: function () {
      const history = this.getHistory();
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return history.find((h) => h.mode === "daily" && h.timestamp >= startOfToday) || null;
    },

    // --- JSON Progress Export & Import Backup ---
    exportUserData: function () {
      const exportPayload = {
        version: "2.0",
        appName: "QuizePro",
        exportedAt: new Date().toISOString(),
        history: this.getHistory(),
        bookmarks: this.getBookmarks(),
        dailyGoal: this.getDailyGoal(),
        theme: localStorage.getItem(STORAGE_KEYS.THEME) || "dark",
        soundMuted: localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === "true"
      };
      return JSON.stringify(exportPayload, null, 2);
    },

    importUserData: function (jsonString) {
      try {
        const payload = JSON.parse(jsonString);
        if (!payload || typeof payload !== "object") {
          throw new Error("Invalid backup format: root must be an object.");
        }
        if (payload.appName !== "QuizePro" && !payload.history) {
          throw new Error("Invalid backup file: not a recognized QuizePro backup.");
        }

        if (Array.isArray(payload.history)) {
          setJSON(STORAGE_KEYS.HISTORY, payload.history);
        }
        if (Array.isArray(payload.bookmarks)) {
          setJSON(STORAGE_KEYS.BOOKMARKS, payload.bookmarks);
        }
        if (payload.dailyGoal && typeof payload.dailyGoal === "number") {
          this.setDailyGoal(payload.dailyGoal);
        }
        if (payload.theme) {
          localStorage.setItem(STORAGE_KEYS.THEME, payload.theme);
        }
        return { success: true, count: (payload.history || []).length };
      } catch (err) {
        console.error("Import error:", err);
        return { success: false, error: err.message };
      }
    },

    resetAllData: function () {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUIZZES);
      localStorage.removeItem(STORAGE_KEYS.DAILY_GOAL);
      console.log("All user progress data has been safely reset.");
    }
  };
})();
