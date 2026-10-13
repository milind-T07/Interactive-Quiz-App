/* ============================================
   AI-SERVICE.JS — Gemini AI Real-Time Questions Generator
   ============================================ */

const AIService = (function () {
  const PRIMARY_MODEL = "gemini-2.5-flash";
  const FALLBACK_MODEL = "gemini-1.5-flash";
  const API_ENDPOINT = (model, key) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  /**
   * Helper to make a Gemini generateContent call with error handling and model fallback
   */
  async function callGemini(apiKey, systemPrompt, userPrompt, model = PRIMARY_MODEL) {
    if (!apiKey) {
      throw new Error("No Gemini API key provided. Please configure your API key in AI Settings.");
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        responseMimeType: "application/json"
      }
    };

    let response;
    try {
      response = await fetch(API_ENDPOINT(model, apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (networkError) {
      throw new Error("Network connection failed. Please check your internet connection.");
    }

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // ignore parse error
      }

      const errMsg = errorData?.error?.message || response.statusText || `HTTP ${response.status}`;

      // If model not found or deprecated, try fallback model once
      if ((response.status === 404 || errMsg.includes("not found")) && model === PRIMARY_MODEL) {
        console.warn(`Primary model ${PRIMARY_MODEL} returned 404, falling back to ${FALLBACK_MODEL}...`);
        return callGemini(apiKey, systemPrompt, userPrompt, FALLBACK_MODEL);
      }

      if (response.status === 400 || response.status === 403 || errMsg.includes("API key not valid")) {
        throw new Error("Invalid or unauthorized Gemini API key. Please verify your API key in Google AI Studio.");
      }

      if (response.status === 429 || errMsg.includes("quota") || errMsg.includes("rate limit")) {
        throw new Error("Gemini API rate limit or quota exceeded. Please try again in a few moments.");
      }

      throw new Error(`Gemini API Error: ${errMsg}`);
    }

    const result = await response.json();
    const candidate = result?.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart) {
      throw new Error("Gemini returned an empty response. Please try with a different topic or prompt.");
    }

    return textPart;
  }

  /**
   * Test / ping an API key
   */
  async function testApiKey(apiKey) {
    if (!apiKey || apiKey.trim().length < 8) {
      return { ok: false, error: "Please enter a valid API key string." };
    }

    try {
      const pingPrompt = "Respond with JSON: {\"status\": \"ok\", \"service\": \"QuizePro\"}";
      const raw = await callGemini(apiKey.trim(), "You are a health checker. Return only valid JSON.", pingPrompt);
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.status === "ok" || parsed.service)) {
        return { ok: true };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || "Failed to verify key with Gemini API." };
    }
  }

  /**
   * Generate real-time multiple choice questions for QuizePro
   */
  async function generateQuestions({
    topic = "Full-Stack Web Development",
    categoryId = "ai_drill",
    categoryTitle = null,
    difficulty = "medium",
    count = 5
  }) {
    const apiKey = Storage.getApiKey();
    if (!apiKey) {
      throw new Error("API Key missing! Please configure your Gemini API key in the AI Settings.");
    }

    const validCount = Math.min(15, Math.max(1, parseInt(count, 10) || 5));
    const validDiff = ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium";

    const systemPrompt = `You are a Principal Software Engineer and Technical Assessment Specialist.
Your task is to generate exactly ${validCount} high-quality, technically rigorous multiple-choice questions for software developers.
Topic: "${topic}"
Difficulty Level: "${validDiff.toUpperCase()}".

Requirements:
1. Each question must test practical developer knowledge, architecture, language syntax, algorithms, or problem solving.
2. Provide realistic options. Avoid trivial 'None of the above' or 'All of the above'.
3. Include an optional code snippet in 'codeSnippet' when helpful (or null if purely conceptual).
4. 'options' must be an array of EXACTLY 4 distinct strings.
5. 'correctAnswer' must be an integer from 0 to 3 pointing to the correct index in 'options'.
6. 'hint' must be a concise, helpful clue.
7. 'explanation' must be a clear, educational rationale explaining why the correct choice is right and how it works.

Output Format:
You MUST return ONLY a JSON array with this exact structure:
[
  {
    "id": "gemini_q1",
    "question": "Clear technical question text",
    "codeSnippet": "code or null",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "hint": "Clue here",
    "explanation": "Detailed explanation here"
  }
]`;

    const userPrompt = `Generate ${validCount} questions on "${topic}" with difficulty "${validDiff}". Return JSON array.`;

    const rawJSON = await callGemini(apiKey, systemPrompt, userPrompt);

    // Parse and sanitize
    let questionsData = null;
    try {
      // Remove any accidental markdown wrappers ```json ... ```
      let cleaned = rawJSON.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      const parsed = JSON.parse(cleaned);
      questionsData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", rawJSON, parseError);
      throw new Error("Gemini returned an invalid JSON structure. Please retry generation.");
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error("No questions could be extracted from Gemini response.");
    }

    // Sanitize into QuizePro question format
    const sanitized = questionsData.map((q, idx) => {
      const qOptions = Array.isArray(q.options) && q.options.length >= 2 
        ? q.options.slice(0, 4) 
        : ["Option 1", "Option 2", "Option 3", "Option 4"];

      let correctIndex = typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
      if (correctIndex < 0 || correctIndex >= qOptions.length) {
        correctIndex = 0;
      }

      return {
        id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        category: categoryId || "ai_drill",
        categoryTitle: categoryTitle || (topic.length > 28 ? `${topic.slice(0, 25)}...` : topic),
        difficulty: validDiff,
        question: q.question || `Technical question on ${topic}`,
        codeSnippet: q.codeSnippet && q.codeSnippet !== "null" ? q.codeSnippet : null,
        options: qOptions,
        correctAnswer: correctIndex,
        hint: q.hint || `Focus on key principles of ${topic}.`,
        explanation: q.explanation || "No explanation provided.",
        isAiGenerated: true
      };
    });

    return sanitized;
  }

  return {
    testApiKey,
    generateQuestions
  };
})();
