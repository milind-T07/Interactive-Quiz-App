/* ============================================
   STORAGE.JS — Data Persistence & Real Analytics
   ============================================ */

const STORAGE_KEYS = {
  HISTORY: "quiz_app_history",
  BOOKMARKS: "quiz_app_bookmarks",
  CUSTOM_QUIZZES: "quiz_app_custom_quizzes",
  THEME: "quiz_app_theme",
  SOUND_MUTED: "quiz_sound_muted",
  DAILY_GOAL: "quiz_app_daily_goal",
  GEMINI_API_KEY: "quiz_gemini_api_key"
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
        category: result.category,
        categoryTitle: result.categoryTitle || (CATEGORIES[result.category] ? CATEGORIES[result.category].title : "General"),
        score: Number(result.score) || 0,
        total: Number(result.total) || 0,
        percentage: Number(result.percentage) || 0,
        timeTakenSec: Number(result.timeTakenSec) || 0,
        difficulty: result.difficulty || "mixed",
        mode: result.mode || "standard"
      };

      history.unshift(newEntry);
      // Keep last 100 entries for rich analytics
      if (history.length > 100) history.pop();
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

    // --- Custom Quizzes ---
    getCustomQuestions: function () {
      return getJSON(STORAGE_KEYS.CUSTOM_QUIZZES, []);
    },

    saveCustomQuestion: function (questionData, editId = null) {
      let customQuestions = getJSON(STORAGE_KEYS.CUSTOM_QUIZZES, []);

      if (editId) {
        const index = customQuestions.findIndex((q) => q.id === editId);
        if (index >= 0) {
          customQuestions[index] = {
            ...customQuestions[index],
            category: questionData.category || "custom",
            difficulty: questionData.difficulty || "medium",
            question: questionData.question.trim(),
            options: questionData.options.map((opt) => opt.trim()),
            correctAnswer: parseInt(questionData.correctAnswer, 10),
            hint: (questionData.hint || "").trim(),
            explanation: (questionData.explanation || "").trim(),
            updatedAt: Date.now()
          };
          setJSON(STORAGE_KEYS.CUSTOM_QUIZZES, customQuestions);
          return customQuestions[index];
        }
      }

      const newQuestion = {
        id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 3),
        category: questionData.category || "custom",
        difficulty: questionData.difficulty || "medium",
        question: questionData.question.trim(),
        options: questionData.options.map((opt) => opt.trim()),
        correctAnswer: parseInt(questionData.correctAnswer, 10),
        hint: (questionData.hint || "").trim(),
        explanation: (questionData.explanation || "").trim(),
        createdAt: Date.now()
      };

      customQuestions.unshift(newQuestion);
      setJSON(STORAGE_KEYS.CUSTOM_QUIZZES, customQuestions);
      return newQuestion;
    },

    deleteCustomQuestion: function (id) {
      let customQuestions = getJSON(STORAGE_KEYS.CUSTOM_QUIZZES, []);
      customQuestions = customQuestions.filter((q) => q.id !== id);
      setJSON(STORAGE_KEYS.CUSTOM_QUIZZES, customQuestions);
      return customQuestions;
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

    // --- Dynamic Analytics Calculated From Real History ---
    getAnalytics: function () {
      const history = this.getHistory();
      const totalQuizzes = history.length;
      let totalQuestions = 0;
      let totalCorrect = 0;
      let bestScore = 0;
      const categoryMap = {};

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      let todayQuestionsCount = 0;

      // Group by distinct days for streak calculation
      const activeDaysSet = new Set();

      history.forEach((h) => {
        totalQuestions += h.total || 0;
        totalCorrect += h.score || 0;
        if (h.percentage > bestScore) {
          bestScore = h.percentage;
        }

        if (h.timestamp >= startOfToday) {
          todayQuestionsCount += h.total || 0;
        }

        const dateKey = new Date(h.timestamp).toDateString();
        activeDaysSet.add(dateKey);

        const catId = h.category || "other";
        if (!categoryMap[catId]) {
          categoryMap[catId] = {
            id: catId,
            title: h.categoryTitle || catId,
            attempts: 0,
            totalScore: 0,
            totalQuestions: 0
          };
        }
        categoryMap[catId].attempts += 1;
        categoryMap[catId].totalScore += h.score || 0;
        categoryMap[catId].totalQuestions += h.total || 0;
      });

      const averageAccuracy = totalQuestions > 0 
        ? Math.round((totalCorrect / totalQuestions) * 100) 
        : 0;

      // Calculate real learning streak
      let streak = 0;
      if (activeDaysSet.size > 0) {
        const checkDate = new Date();
        const todayKey = checkDate.toDateString();
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayKey = checkDate.toDateString();

        // If active today or yesterday, streak is alive
        if (activeDaysSet.has(todayKey) || activeDaysSet.has(yesterdayKey)) {
          let curr = activeDaysSet.has(todayKey) ? new Date() : checkDate;
          while (activeDaysSet.has(curr.toDateString())) {
            streak++;
            curr.setDate(curr.getDate() - 1);
          }
        }
      }

      // Category breakdown calculation
      const categoryBreakdown = Object.values(categoryMap).map((c) => ({
        ...c,
        accuracy: c.totalQuestions > 0 ? Math.round((c.totalScore / c.totalQuestions) * 100) : 0
      }));

      // Sort categories to find strongest & weakest
      let strongestTopic = null;
      let weakestTopic = null;
      if (categoryBreakdown.length > 0) {
        const sortedCats = [...categoryBreakdown].sort((a, b) => b.accuracy - a.accuracy);
        strongestTopic = sortedCats[0];
        if (sortedCats.length > 1) {
          weakestTopic = sortedCats[sortedCats.length - 1];
        }
      }

      // 7-Day Activity Chart Data
      const weeklyActivity = [];
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000;
        const dayQuizzes = history.filter((h) => h.timestamp >= dayStart && h.timestamp < dayEnd);
        const dayQuestions = dayQuizzes.reduce((sum, h) => sum + (h.total || 0), 0);
        const dayScore = dayQuizzes.reduce((sum, h) => sum + (h.score || 0), 0);

        weeklyActivity.push({
          dayLabel: daysOfWeek[d.getDay()],
          dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
          isToday: i === 0,
          quizzesCount: dayQuizzes.length,
          questionsCount: dayQuestions,
          accuracy: dayQuestions > 0 ? Math.round((dayScore / dayQuestions) * 100) : 0
        });
      }

      // Achievements list calculated dynamically with difficulty tiers
      const distinctCatsCount = Object.keys(categoryMap).length;
      const achievements = [
        {
          id: "ach_first",
          title: "First Step",
          desc: "Complete your first quiz session",
          tier: "bronze",
          tierLabel: "Bronze",
          iconType: "zap",
          unlocked: totalQuizzes >= 1,
          progress: Math.min(1, totalQuizzes / 1),
          metric: `${Math.min(1, totalQuizzes)}/1 Quiz`
        },
        {
          id: "ach_explorer",
          title: "Code Explorer",
          desc: "Attempt quizzes in at least 2 distinct technical topics",
          tier: "bronze",
          tierLabel: "Bronze",
          iconType: "compass",
          unlocked: distinctCatsCount >= 2,
          progress: Math.min(1, distinctCatsCount / 2),
          metric: `${Math.min(2, distinctCatsCount)}/2 Topics`
        },
        {
          id: "ach_streak_3",
          title: "Consistent Learner",
          desc: "Maintain a 3-day active practice streak",
          tier: "silver",
          tierLabel: "Silver",
          iconType: "flame",
          unlocked: streak >= 3,
          progress: Math.min(1, streak / 3),
          metric: `${Math.min(3, streak)}/3 Days`
        },
        {
          id: "ach_speed_demon",
          title: "Speed Demon",
          desc: "Complete a quiz in under 45 seconds with >= 80% accuracy",
          tier: "silver",
          tierLabel: "Silver",
          iconType: "timer",
          unlocked: history.some((h) => h.timeTakenSec > 0 && h.timeTakenSec <= 45 && h.percentage >= 80),
          progress: history.some((h) => h.timeTakenSec > 0 && h.timeTakenSec <= 45 && h.percentage >= 80) ? 1 : 0,
          metric: history.some((h) => h.timeTakenSec > 0 && h.timeTakenSec <= 45 && h.percentage >= 80) ? "Completed" : "In Progress"
        },
        {
          id: "ach_master_10",
          title: "Quiz Veteran",
          desc: "Complete 10 total quizzes across any subjects",
          tier: "gold",
          tierLabel: "Gold",
          iconType: "trophy",
          unlocked: totalQuizzes >= 10,
          progress: Math.min(1, totalQuizzes / 10),
          metric: `${Math.min(10, totalQuizzes)}/10 Quizzes`
        },
        {
          id: "ach_centurion",
          title: "Centurion",
          desc: "Answer 50 questions across all technical topics",
          tier: "gold",
          tierLabel: "Gold",
          iconType: "target",
          unlocked: totalQuestions >= 50,
          progress: Math.min(1, totalQuestions / 50),
          metric: `${Math.min(50, totalQuestions)}/50 Questions`
        },
        {
          id: "ach_perfect",
          title: "Perfectionist",
          desc: "Score a flawless 100% on any completed quiz",
          tier: "diamond",
          tierLabel: "Diamond",
          iconType: "star",
          unlocked: bestScore === 100,
          progress: bestScore === 100 ? 1 : (bestScore / 100),
          metric: `${bestScore}% / 100%`
        },
        {
          id: "ach_grandmaster",
          title: "Grandmaster",
          desc: "Complete 5+ quizzes with >= 85% average accuracy",
          tier: "diamond",
          tierLabel: "Diamond",
          iconType: "crown",
          unlocked: totalQuizzes >= 5 && averageAccuracy >= 85,
          progress: totalQuizzes >= 5 ? Math.min(1, averageAccuracy / 85) : Math.min(0.9, (totalQuizzes / 5) * 0.8),
          metric: totalQuizzes >= 5 ? `${averageAccuracy}% / 85%` : `${totalQuizzes}/5 Quizzes`
        }
      ];

      return {
        totalQuizzes,
        totalQuestions,
        totalCorrect,
        averageAccuracy,
        bestScore,
        streak,
        todayQuestionsCount,
        dailyGoal: this.getDailyGoal(),
        categoryBreakdown,
        strongestTopic,
        weakestTopic,
        weeklyActivity,
        achievements,
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

    // --- Gemini AI API Key Storage ---
    getApiKey: function () {
      return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || "";
    },

    saveApiKey: function (key) {
      if (!key || typeof key !== "string" || !key.trim()) {
        localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
      } else {
        localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
      }
    },

    hasApiKey: function () {
      const k = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
      return Boolean(k && k.trim().length > 6);
    }
  };
})();
