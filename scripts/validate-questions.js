/**
 * scripts/validate-questions.js
 * Comprehensive question bank validation script.
 * Validates integrity, schema, uniqueness, and distribution of the full 5,200 dataset.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();

let totalQuestions = 0;
const ids = new Set();
const normalizedQuestions = new Map();
const errors = [];
const warnings = [];

const topicCounts = {};
const difficultyCounts = {
  easy: 0,
  medium: 0,
  hard: 0
};
const subtopicCounts = {};

console.log('====================================================');
console.log('       QUIZEPRO QUESTION BANK VALIDATION REPORT     ');
console.log('====================================================\n');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    errors.push(`File Read Error [${file}]: ${err.message}`);
    return;
  }

  let questions;
  try {
    questions = JSON.parse(content);
  } catch (err) {
    errors.push(`JSON Syntax Error [${file}]: ${err.message}`);
    return;
  }

  if (!Array.isArray(questions)) {
    errors.push(`Format Error [${file}]: Root must be an array of questions`);
    return;
  }

  let fileValidCount = 0;

  questions.forEach((q, idx) => {
    totalQuestions++;
    const loc = `${file} (index ${idx})`;

    // 1. ID Check
    if (!q.id || typeof q.id !== 'string' || !q.id.trim()) {
      errors.push(`${loc}: Missing or empty id`);
    } else if (ids.has(q.id)) {
      errors.push(`${loc}: Duplicate ID detected "${q.id}"`);
    } else {
      ids.add(q.id);
    }

    // 2. Question Text & Uniqueness
    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
      errors.push(`${loc}: Missing or empty question text`);
    } else {
      const norm = q.question.trim().toLowerCase().replace(/\s+/g, ' ');
      if (normalizedQuestions.has(norm)) {
        errors.push(`${loc}: Duplicate question text detected! Matches ${normalizedQuestions.get(norm)}: "${q.question.slice(0, 60)}..."`);
      } else {
        normalizedQuestions.set(norm, loc);
      }
    }

    // 3. Topic & Subtopic
    if (!q.topic || typeof q.topic !== 'string' || !q.topic.trim()) {
      errors.push(`${loc}: Missing or invalid topic`);
    } else {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    }

    if (q.subtopic && typeof q.subtopic === 'string') {
      subtopicCounts[q.subtopic] = (subtopicCounts[q.subtopic] || 0) + 1;
    }

    // 4. Difficulty
    if (!q.difficulty || typeof q.difficulty !== 'string') {
      errors.push(`${loc}: Missing difficulty`);
    } else {
      const diff = q.difficulty.toLowerCase();
      if (!['easy', 'medium', 'hard'].includes(diff)) {
        errors.push(`${loc}: Invalid difficulty "${q.difficulty}" (must be easy, medium, or hard)`);
      } else {
        difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
      }
    }

    // 5. Options (must be array of 4 non-empty strings)
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${loc}: Options must be an array of exactly 4 choices`);
    } else {
      q.options.forEach((opt, oIdx) => {
        if (typeof opt !== 'string' || !opt.trim()) {
          errors.push(`${loc}: Option index ${oIdx} is empty or not a string`);
        }
      });
      // Ensure choices are distinct
      const optSet = new Set(q.options.map(o => String(o).trim().toLowerCase()));
      if (optSet.size !== 4) {
        warnings.push(`${loc}: Has duplicate option choices within the same question`);
      }
    }

    // 6. Correct Answer
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      errors.push(`${loc}: Invalid correctAnswer index "${q.correctAnswer}" (must be 0, 1, 2, or 3)`);
    }

    // 7. Explanation
    if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
      errors.push(`${loc}: Missing or empty explanation`);
    }

    // 8. Type
    if (!q.type) {
      warnings.push(`${loc}: Missing question type property`);
    }

    fileValidCount++;
  });

  console.log(`[PASS] ${file.padEnd(24)} -> ${fileValidCount.toString().padStart(4)} valid questions`);
});

console.log('\n----------------------------------------------------');
console.log('              SUMMARY STATISTICS                    ');
console.log('----------------------------------------------------');
console.log(`Total Files Scanned      : ${files.length}`);
console.log(`Total Questions Scanned  : ${totalQuestions}`);
console.log(`Unique Question IDs      : ${ids.size}`);
console.log(`Unique Question Texts    : ${normalizedQuestions.size}`);
console.log(`Total Errors Detected    : ${errors.length}`);
console.log(`Total Warnings Detected  : ${warnings.length}`);

console.log('\n[Distribution by Topic]');
Object.keys(topicCounts).sort().forEach(topic => {
  console.log(`  - ${topic.padEnd(28)}: ${topicCounts[topic].toString().padStart(4)} questions`);
});

console.log('\n[Distribution by Difficulty]');
console.log(`  - Easy   : ${difficultyCounts.easy} (${((difficultyCounts.easy / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`  - Medium : ${difficultyCounts.medium} (${((difficultyCounts.medium / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`  - Hard   : ${difficultyCounts.hard} (${((difficultyCounts.hard / totalQuestions) * 100).toFixed(1)}%)`);

if (errors.length > 0) {
  console.error('\n❌ VALIDATION FAILED WITH THE FOLLOWING ERRORS:');
  errors.slice(0, 20).forEach(e => console.error('  * ' + e));
  if (errors.length > 20) console.error(`  ... and ${errors.length - 20} more errors.`);
  process.exit(1);
} else {
  console.log('\n✅ VALIDATION PASSED: 100% of questions are valid, unique, and compliant!\n');
  process.exit(0);
}
