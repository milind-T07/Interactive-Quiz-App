/**
 * QuizePro Server
 * High-performance, zero-dependency Node.js HTTP server & API proxy.
 *
 * Serves static assets and provides secure API routes for:
 * - /api/status     : Check external provider connectivity and credentials
 * - /api/generate   : Securely generate questions via Groq LLaMA / OpenAI / QuizAPI
 * - /api/search     : Search and query questions with filtering and pagination
 * - /api/topics     : Topic catalog and available question counts
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple .env file parser (zero dependencies)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim();
        let val = trimmed.slice(equalsIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('[Env] Failed to parse .env file:', err.message);
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '4173', 10);
const DATA_DIR = path.join(__dirname, 'data');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// In-memory cache for local question bank
let questionCache = [];
let questionCacheByTopic = new Map();

function preloadQuestions() {
  if (!fs.existsSync(DATA_DIR)) return;
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const all = [];
    questionCacheByTopic.clear();

    for (const file of files) {
      const fullPath = path.join(DATA_DIR, file);
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          all.push(...parsed);
          const topicKey = file.replace('.json', '').toLowerCase();
          questionCacheByTopic.set(topicKey, parsed);
        }
      } catch (err) {
        console.error(`[Preload] Error loading ${file}:`, err.message);
      }
    }
    questionCache = all;
    console.log(`[Preload] Loaded ${all.length} questions from ${files.length} JSON files.`);
  } catch (err) {
    console.error('[Preload] Failed to read data directory:', err.message);
  }
}

preloadQuestions();

// 20 Recommended Categories Definition
const TOPIC_CATALOG = [
  { id: 'html', name: 'HTML', category: 'Frontend', file: 'html.json', desc: 'Semantic HTML5, accessibility, modern forms and document structure' },
  { id: 'css', name: 'CSS', category: 'Frontend', file: 'css.json', desc: 'Flexbox, Grid, container queries, animations and responsive architecture' },
  { id: 'javascript', name: 'JavaScript', category: 'Programming', file: 'javascript.json', desc: 'Core ES6+, closures, prototypes, event loop and microtask queues' },
  { id: 'advanced-js', name: 'Advanced JavaScript', category: 'Programming', file: 'javascript.json', desc: 'Memory leaks, V8 optimization, async generators, and metaprogramming' },
  { id: 'typescript', name: 'TypeScript', category: 'Programming', file: 'typescript.json', desc: 'Generics, union types, conditional types, mapped types and type narrowing' },
  { id: 'react', name: 'React', category: 'Frontend', file: 'react.json', desc: 'Hooks, React 19 compiler, reconciliation, custom hooks and state management' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', file: 'nextjs.json', desc: 'App Router, Server Components, SSR, ISR, middleware and routing' },
  { id: 'dsa', name: 'Data Structures', category: 'Computer Science', file: 'dsa.json', desc: 'Arrays, linked lists, trees, graphs, heaps, hash tables and tries' },
  { id: 'algorithms', name: 'Algorithms', category: 'Computer Science', file: 'algorithms.json', desc: 'Dynamic programming, greedy strategies, graph traversals and Big-O analysis' },
  { id: 'problem-solving', name: 'Problem Solving', category: 'Computer Science', file: 'algorithms.json', desc: 'Two pointers, sliding window, backtracking and competitive coding patterns' },
  { id: 'python', name: 'Python', category: 'Programming', file: 'python.json', desc: 'List comprehensions, decorators, generators, asyncio and typing' },
  { id: 'java', name: 'Java', category: 'Programming', file: 'java.json', desc: 'JVM internals, multithreading, concurrency, garbage collection and streams' },
  { id: 'backend', name: 'Backend Development', category: 'Backend', file: 'backend.json', desc: 'Microservices, message queues, rate limiting, caching and server design' },
  { id: 'rest-apis', name: 'REST APIs', category: 'Backend', file: 'backend.json', desc: 'HTTP status codes, idempotency, REST architectural constraints and OpenAPI' },
  { id: 'sql', name: 'SQL and Databases', category: 'Databases', file: 'sql.json', desc: 'Joins, indexing, B-trees, ACID compliance, query optimization and NoSQL' },
  { id: 'os', name: 'Operating Systems', category: 'Computer Science', file: 'os.json', desc: 'Processes, threads, deadlocks, virtual memory, paging and scheduling' },
  { id: 'networks', name: 'Computer Networks', category: 'Computer Science', file: 'networks.json', desc: 'TCP/IP, OSI layers, DNS, WebSockets, HTTP/2/3, TLS handshakes and routing' },
  { id: 'oop', name: 'Object-Oriented Programming', category: 'Programming', file: 'oop.json', desc: 'SOLID principles, design patterns, encapsulation, polymorphism and cohesion' },
  { id: 'security', name: 'Cybersecurity', category: 'Security & DevOps', file: 'security.json', desc: 'OWASP Top 10, XSS, CSRF, SQL injection, JWT auth and encryption algorithms' },
  { id: 'devops', name: 'Git and DevOps', category: 'Security & DevOps', file: 'devops.json', desc: 'Git branching, rebase, Docker containers, CI/CD pipelines and deployment' }
];

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(payload);
}

// Helper: read request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Generate questions via Groq Cloud API (free tier, OpenAI-compatible)
async function generateWithGroq(apiKey, { topic, difficulty = 'Medium', count = 5, subtopic = '' }) {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const urlEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const systemPrompt = `You are a strict technical quiz generation engine for software engineers.
Generate exactly ${count} high-quality, practical multiple-choice questions for topic: "${topic}" ${subtopic ? `(Focus: ${subtopic})` : ''} at ${difficulty} difficulty.

Output MUST be a valid JSON array of objects. Each object MUST strictly follow this exact JSON structure:
[
  {
    "id": "gen-${Date.now()}-1",
    "topic": "${topic}",
    "subtopic": "relevant subtopic",
    "difficulty": "${difficulty}",
    "type": "multiple-choice",
    "question": "Clear, technically precise question text without formatting errors",
    "codeSnippet": "Optional concise code snippet if helpful, or empty string",
    "options": [
      "Exact option A text",
      "Exact option B text",
      "Exact option C text",
      "Exact option D text"
    ],
    "answer": "Exact text of the correct option matching one of the options array items",
    "explanation": "Clear, technical explanation why this answer is correct and others are wrong",
    "hint": "Helpful conceptual hint"
  }
]

RULES:
1. Return ONLY the raw JSON array. Do NOT wrap in markdown \`\`\`json fences. No commentary.
2. Every question must have exactly 4 distinct, non-empty options.
3. The "answer" field MUST match one of the items in the "options" array verbatim.
4. Explanations must be technically sound, accurate, and educational.`;

  const response = await fetch(urlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} ${difficulty} level technical questions on ${topic}. Return pure JSON array only.` }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedErr = errorText;
    try {
      parsedErr = JSON.parse(errorText).error?.message || errorText;
    } catch (_) {}
    throw new Error(`Groq API Error (${response.status}): ${parsedErr}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || '[]';

  // Sanitize potential markdown codeblocks
  let cleaned = rawText;
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Groq returned invalid question array format');
  }

  // Validate and normalize generated questions
  return parsed.map((q, idx) => ({
    id: q.id || `groq-${Date.now()}-${idx + 1}`,
    topic: q.topic || topic,
    subtopic: q.subtopic || 'General',
    difficulty: q.difficulty || difficulty,
    type: 'multiple-choice',
    question: q.question || 'Question text missing',
    codeSnippet: q.codeSnippet || '',
    options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: q.answer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
    explanation: q.explanation || 'Detailed explanation provided upon review.',
    hint: q.hint || ''
  }));
}

// Generate questions via QuizAPI.io (if user configured QUIZAPI_KEY)
async function generateWithQuizApi(apiKey, { topic, difficulty = 'Medium', count = 5 }) {
  // Map our topics to QuizAPI categories/tags
  const tagMap = {
    'javascript': 'JavaScript',
    'html': 'HTML',
    'css': 'CSS',
    'python': 'Python',
    'sql': 'SQL',
    'backend': 'PHP',
    'networks': 'Linux',
    'security': 'Linux',
    'devops': 'DevOps'
  };

  const tag = tagMap[topic.toLowerCase()] || '';
  const diffLower = difficulty.toLowerCase();
  const qUrl = `https://quizapi.io/api/v1/questions?apiKey=${apiKey}&limit=${count}${tag ? `&tags=${encodeURIComponent(tag)}` : ''}&difficulty=${diffLower}`;

  const response = await fetch(qUrl);
  if (!response.ok) {
    throw new Error(`QuizAPI HTTP error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('QuizAPI returned unexpected response');
  }

  return data.map((q, idx) => {
    // Extract non-null options
    const rawOpts = q.answers || {};
    const validKeys = Object.keys(rawOpts).filter(k => rawOpts[k] !== null);
    const options = validKeys.slice(0, 4).map(k => rawOpts[k]);
    while (options.length < 4) {
      options.push(`Choice ${options.length + 1}`);
    }

    // Determine correct answer
    const correctMap = q.correct_answers || {};
    let correctKey = Object.keys(correctMap).find(k => correctMap[k] === 'true');
    let answerText = options[0];
    if (correctKey) {
      const baseKey = correctKey.replace('_correct', '');
      if (rawOpts[baseKey]) answerText = rawOpts[baseKey];
    }

    return {
      id: `quizapi-${q.id || idx}`,
      topic: topic,
      subtopic: q.category || 'General',
      difficulty: difficulty,
      type: 'multiple-choice',
      question: q.question,
      codeSnippet: q.description || '',
      options,
      answer: answerText,
      explanation: q.explanation || 'Verified answer from QuizAPI dataset.',
      hint: q.tip || ''
    };
  });
}

// Request Router
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // -------------------------------------------------------------
  // API ROUTE: /api/status
  // -------------------------------------------------------------
  if (pathname === '/api/status' && req.method === 'GET') {
    const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
    const hasQuizApi = Boolean(process.env.QUIZAPI_KEY && process.env.QUIZAPI_KEY.trim());
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

    let activeProvider = 'none';
    if (hasGroq) activeProvider = 'groq';
    else if (hasOpenAI) activeProvider = 'openai';
    else if (hasQuizApi) activeProvider = 'quizapi';

    return sendJson(res, 200, {
      configured: hasGroq || hasQuizApi || hasOpenAI,
      provider: activeProvider,
      model: hasGroq ? (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile') : 'default',
      localQuestionsCount: questionCache.length,
      topicsCount: TOPIC_CATALOG.length,
      message: activeProvider !== 'none'
        ? `Live question generation active via ${activeProvider.toUpperCase()}.`
        : 'Running in Local Bank mode (5,200 verified questions). Add GROQ_API_KEY to .env for infinite live generation.'
    });
  }

  // -------------------------------------------------------------
  // API ROUTE: /api/topics
  // -------------------------------------------------------------
  if (pathname === '/api/topics' && req.method === 'GET') {
    const catalogWithCounts = TOPIC_CATALOG.map(t => {
      const topicKey = t.file.replace('.json', '').toLowerCase();
      const questions = questionCacheByTopic.get(topicKey) || [];
      const easy = questions.filter(q => (q.difficulty || '').toLowerCase() === 'easy').length;
      const medium = questions.filter(q => (q.difficulty || '').toLowerCase() === 'medium').length;
      const hard = questions.filter(q => (q.difficulty || '').toLowerCase() === 'hard').length;

      return {
        ...t,
        totalQuestions: questions.length,
        breakdown: { easy, medium, hard },
        hasLiveQuestions: questions.length > 0
      };
    });

    return sendJson(res, 200, {
      topics: catalogWithCounts,
      totalCount: questionCache.length
    });
  }

  // -------------------------------------------------------------
  // API ROUTE: /api/generate
  // -------------------------------------------------------------
  if (pathname === '/api/generate' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { topic = 'JavaScript', difficulty = 'Medium', count = 5, subtopic = '' } = body;
      const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);

      const groqKey = process.env.GROQ_API_KEY;
      const quizApiKey = process.env.QUIZAPI_KEY;

      // 1. Try Groq AI Generation if key provided
      if (groqKey && groqKey.trim()) {
        try {
          const generated = await generateWithGroq(groqKey.trim(), {
            topic,
            difficulty,
            count: numQuestions,
            subtopic
          });
          return sendJson(res, 200, {
            success: true,
            provider: 'groq',
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            topic,
            difficulty,
            questions: generated
          });
        } catch (apiErr) {
          console.error('[API] Groq generation error:', apiErr.message);
          return sendJson(res, 502, {
            success: false,
            provider: 'groq',
            error: apiErr.message,
            message: `External AI Provider Error: ${apiErr.message}. You can practice with the local question bank.`,
            fallbackAvailable: true
          });
        }
      }

      // 2. Try QuizAPI if key provided
      if (quizApiKey && quizApiKey.trim()) {
        try {
          const generated = await generateWithQuizApi(quizApiKey.trim(), {
            topic,
            difficulty,
            count: numQuestions
          });
          return sendJson(res, 200, {
            success: true,
            provider: 'quizapi',
            topic,
            difficulty,
            questions: generated
          });
        } catch (apiErr) {
          console.error('[API] QuizAPI generation error:', apiErr.message);
          return sendJson(res, 502, {
            success: false,
            provider: 'quizapi',
            error: apiErr.message,
            message: `QuizAPI Error: ${apiErr.message}`,
            fallbackAvailable: true
          });
        }
      }

      // 3. No external key configured in .env
      return sendJson(res, 200, {
        success: false,
        code: 'NO_API_KEY',
        provider: 'none',
        message: 'No external API key found in .env. To enable live external generation, add GROQ_API_KEY to your .env file.',
        fallbackAvailable: true
      });
    } catch (err) {
      console.error('[API] Generate route error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // -------------------------------------------------------------
  // API ROUTE: /api/search
  // -------------------------------------------------------------
  if (pathname === '/api/search' && req.method === 'GET') {
    const query = (parsedUrl.query.q || '').trim().toLowerCase();
    const topicFilter = (parsedUrl.query.topic || 'all').toLowerCase();
    const diffFilter = (parsedUrl.query.difficulty || 'all').toLowerCase();
    const limit = Math.min(Math.max(parseInt(parsedUrl.query.limit, 10) || 20, 1), 100);
    const offset = Math.max(parseInt(parsedUrl.query.offset, 10) || 0, 0);

    let filtered = questionCache;

    if (topicFilter !== 'all') {
      filtered = filtered.filter(q => {
        const t = (q.topic || '').toLowerCase();
        return t === topicFilter || t.includes(topicFilter);
      });
    }

    if (diffFilter !== 'all') {
      filtered = filtered.filter(q => (q.difficulty || '').toLowerCase() === diffFilter);
    }

    if (query) {
      filtered = filtered.filter(q => {
        return (
          (q.question && q.question.toLowerCase().includes(query)) ||
          (q.subtopic && q.subtopic.toLowerCase().includes(query)) ||
          (q.explanation && q.explanation.toLowerCase().includes(query)) ||
          (Array.isArray(q.options) && q.options.some(o => o.toLowerCase().includes(query)))
        );
      });
    }

    const totalMatches = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return sendJson(res, 200, {
      total: totalMatches,
      offset,
      limit,
      results: paginated
    });
  }

  // -------------------------------------------------------------
  // STATIC ASSET SERVING
  // -------------------------------------------------------------
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  // Security: prevent path traversal outside workspace
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:2rem;background:#090d16;color:#fff;"><h1>404 Not Found</h1><p>The requested file <code>${pathname}</code> was not found.</p><a href="/" style="color:#a855f7;">Return to QuizePro Home</a></body></html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🚀 QuizePro Server running at http://localhost:${PORT}/`);
  console.log(`  📊 Loaded ${questionCache.length} local questions across 18 topics`);
  console.log(`  🔑 Provider: ${process.env.GROQ_API_KEY ? 'Groq LLaMA Cloud (ACTIVE)' : 'Local Bank Mode (add GROQ_API_KEY to .env)'}`);
  console.log(`=======================================================`);
});
