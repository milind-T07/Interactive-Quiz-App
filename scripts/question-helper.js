/**
 * scripts/generate-questions.js
 * Generates verified, unique, technical questions for CSS, JavaScript, and TypeScript
 * to bring total verified question count to 5,200 unique questions across 18 topics.
 */

const fs = require('fs');
const path = require('path');

// Helper to shuffle options and track correct answer index
function makeQuestion(id, topic, subtopic, difficulty, question, correctOpt, wrongOpts, explanation, hint, codeSnippet = null) {
  const options = [correctOpt, ...wrongOpts];
  // Deterministic placement based on id hash so options are well-distributed (0, 1, 2, 3)
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const correctIdx = hash % 4;
  
  // Swap correctOpt to target index
  const temp = options[0];
  options[0] = options[correctIdx];
  options[correctIdx] = temp;

  return {
    id,
    topic,
    subtopic,
    difficulty,
    question,
    options,
    correctAnswer: correctIdx,
    hint: hint || `Consider the core principles of ${subtopic}.`,
    explanation,
    codeSnippet,
    type: 'mcq'
  };
}

module.exports = { makeQuestion };
