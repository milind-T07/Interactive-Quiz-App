/* ============================================
   QUESTIONS.JS — QuizePro Comprehensive Tech Database
   ============================================ */

const CATEGORIES = {
  web: {
    id: "web",
    title: "Web Development",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    description: "HTML5 semantics, modern CSS, Layouts & Browser APIs",
    color: "#3b82f6"
  },
  javascript: {
    id: "javascript",
    title: "JavaScript & TypeScript",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`,
    description: "ES6+, Event Loop, Closures, Async & TypeScript Types",
    color: "#eab308"
  },
  frameworks: {
    id: "frameworks",
    title: "React & Frontend",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 1 0-8.49 8.49"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    description: "React 19, Hooks, Virtual DOM, State & Architecture",
    color: "#06b6d4"
  },
  dsa: {
    id: "dsa",
    title: "Data Structures & Algorithms",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>`,
    description: "Trees, Graphs, Sorting, Dynamic Programming & Complexity",
    color: "#8b5cf6"
  },
  python: {
    id: "python",
    title: "Python & Backend",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    description: "Pythonic Patterns, Concurrency, RESTful APIs & Services",
    color: "#10b981"
  },
  databases: {
    id: "databases",
    title: "Databases & SQL",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
    description: "Relational Modeling, Indexing, ACID, Joins & NoSQL",
    color: "#f97316"
  },
  cs: {
    id: "cs",
    title: "CS Fundamentals",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
    description: "Operating Systems, Networking, Memory & Threading",
    color: "#6366f1"
  },
  security: {
    id: "security",
    title: "Security & DevOps",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    description: "OWASP Top 10, Auth, TLS, CORS, Containers & CI/CD",
    color: "#ec4899"
  }
};

const defaultQuizQuestions = [
  // --- 1. WEB DEVELOPMENT ---
  {
    id: "w1",
    category: "web",
    difficulty: "easy",
    question: "What is the primary purpose of semantic HTML elements like <header>, <nav>, and <article>?",
    options: [
      "They convey structure and meaning to browsers, screen readers, and search engines",
      "They apply built-in styling without needing external CSS stylesheets",
      "They execute client-side scripts faster than generic <div> containers",
      "They prevent browsers from caching sensitive static web assets"
    ],
    correctAnswer: 0,
    hint: "Think about screen readers and search engine indexers understanding page structure.",
    explanation: "Semantic HTML tags clearly describe their meaning to both the browser and developer, providing accessibility (a11y) tree context and search engine optimization."
  },
  {
    id: "w2",
    category: "web",
    difficulty: "medium",
    question: "In CSS Grid, what does the `fr` unit represent in a track definition?",
    options: [
      "A fixed ratio relative to the total viewport width",
      "A fraction of the available free space in the grid container",
      "A frame frequency unit used specifically for CSS animations",
      "The font-relative scale unit calculated from the parent element"
    ],
    correctAnswer: 1,
    hint: "It distributes leftover space among flexible tracks.",
    explanation: "The `fr` (fractional) unit represents a fraction of the leftover space in the grid container after all non-flexible tracks and gaps are sized."
  },
  {
    id: "w3",
    category: "web",
    difficulty: "hard",
    question: "Which CSS property combination promotes an element to its own GPU-accelerated compositing layer?",
    options: [
      "display: flex; flex-direction: column;",
      "transform: translateZ(0); or will-change: transform;",
      "position: absolute; z-index: 9999;",
      "box-shadow: 0 10px 20px rgba(0,0,0,0.2);"
    ],
    correctAnswer: 1,
    hint: "Think about 3D transforms or compositor hints.",
    explanation: "Applying `transform: translateZ(0)` or `will-change: transform` hints to the browser compositor to isolate the element on its own GPU layer, preventing costly layout reflows."
  },
  {
    id: "w4",
    category: "web",
    difficulty: "easy",
    question: "What is the key difference between CSS units `em` and `rem`?",
    options: [
      "`em` is relative to its parent element font size, while `rem` is relative to the root (<html>) font size",
      "`rem` is an absolute pixel measurement whereas `em` is a dynamic viewport measurement",
      "`em` only applies to margins and padding, whereas `rem` is exclusively for font sizes",
      "`rem` scales with viewport height, whereas `em` scales with viewport width"
    ],
    correctAnswer: 0,
    hint: "The 'r' in `rem` stands for Root.",
    explanation: "`rem` (Root EM) always references the font-size of the root `<html>` element, making typography and spacing scale predictably across responsive layouts."
  },
  {
    id: "w5",
    category: "web",
    difficulty: "medium",
    question: "What does the browser's `IntersectionObserver` API primarily allow developers to do?",
    options: [
      "Intercept HTTP fetch requests and modify response headers",
      "Asynchronously observe changes in the intersection of a target element with an ancestor or viewport",
      "Detect cryptographic collisions in client-side hashing algorithms",
      "Synchronize state across multiple browser tabs using WebSockets"
    ],
    correctAnswer: 1,
    hint: "Often used for lazy loading images and infinite scrolling.",
    explanation: "`IntersectionObserver` provides an efficient, non-blocking way to detect when an element enters or leaves the viewport, ideal for lazy loading and scroll reveals."
  },

  // --- 2. JAVASCRIPT & TYPESCRIPT ---
  {
    id: "js1",
    category: "javascript",
    difficulty: "easy",
    question: "What does `typeof NaN` evaluate to in JavaScript?",
    options: [
      "\"undefined\"",
      "\"nan\"",
      "\"number\"",
      "\"object\""
    ],
    correctAnswer: 2,
    hint: "Even though it stands for 'Not-a-Number', its IEEE 754 type is numeric.",
    explanation: "In JavaScript, `NaN` is a special numeric value defined by the IEEE 754 floating-point standard representing an undefined or unrepresentable numerical result."
  },
  {
    id: "js2",
    category: "javascript",
    difficulty: "medium",
    question: "How does JavaScript's `Promise.allSettled()` differ from `Promise.all()`?",
    options: [
      "`Promise.allSettled()` waits for all promises to resolve or reject, returning an array of outcome objects",
      "`Promise.allSettled()` rejects immediately if any single promise in the iterable rejects",
      "`Promise.allSettled()` only works with synchronous functions, not async promises",
      "`Promise.allSettled()` cancels remaining promises if one completes early"
    ],
    correctAnswer: 0,
    hint: "It avoids the fail-fast behavior of `Promise.all()`.",
    explanation: "`Promise.allSettled()` waits until all given promises are fulfilled or rejected, returning an array with the status (`fulfilled` or `rejected`) and result for each."
  },
  {
    id: "js3",
    category: "javascript",
    difficulty: "hard",
    question: "What is the primary purpose of JavaScript's Microtask Queue vs Macrotask (Task) Queue?",
    options: [
      "Microtasks run only when the browser window is out of focus",
      "Microtasks (Promises, queueMicrotask) execute immediately after the current script run, before any next Macrotask (setTimeout)",
      "Macrotasks have higher priority than microtasks in modern V8 engines",
      "Microtasks are handled in a separate OS thread and bypass the event loop"
    ],
    correctAnswer: 1,
    hint: "Promise callbacks `.then()` run before `setTimeout(..., 0)`.",
    explanation: "Microtasks (resolved Promise callbacks, MutationObserver, `queueMicrotask`) are executed completely to exhaustion before the event loop yields to the next macrotask (such as timers, I/O, or UI rendering)."
  },
  {
    id: "js4",
    category: "javascript",
    difficulty: "medium",
    question: "In TypeScript, what is the key difference between `interface` and `type` alias?",
    options: [
      "`interface` can be merged via declaration merging; `type` aliases can represent union/tuple/primitive types directly",
      "`type` can only describe primitive types, not object structures",
      "`interface` cannot be extended with the `extends` keyword",
      "Only `type` supports generic parameters"
    ],
    correctAnswer: 0,
    hint: "Consider declaration merging and union types.",
    explanation: "Interfaces support declaration merging (multiple declarations with the same name concatenate), while type aliases are more flexible for unions, intersections, mapped types, and primitives."
  },
  {
    id: "js5",
    category: "javascript",
    difficulty: "hard",
    question: "In JavaScript, what is the output of `[1, 2, 3].map(parseInt)`?",
    options: [
      "[1, 2, 3]",
      "[1, NaN, NaN]",
      "[1, 2, NaN]",
      "[NaN, NaN, NaN]"
    ],
    correctAnswer: 1,
    hint: "`parseInt(string, radix)` receives `(element, index)` from `.map()`.",
    explanation: "`map` passes `(element, index)`. This translates to `parseInt('1', 0)` (1), `parseInt('2', 1)` (radix 1 is invalid, so NaN), and `parseInt('3', 2)` ('3' is invalid in binary radix 2, so NaN)."
  },

  // --- 3. REACT & FRONTEND FRAMEWORKS ---
  {
    id: "f1",
    category: "frameworks",
    difficulty: "easy",
    question: "Why should dynamic list items in React always have a stable, unique `key` prop?",
    options: [
      "To satisfy WCAG 2.1 accessibility requirements for lists",
      "To help React's reconciliation algorithm identify which items were modified, added, or removed across re-renders",
      "To automatically store list state into browser LocalStorage",
      "To bind CSS class selectors directly to the component DOM nodes"
    ],
    correctAnswer: 1,
    hint: "It helps the Virtual DOM diffing process.",
    explanation: "Keys give React an identifier for list elements across render cycles, enabling efficient DOM mutations without re-rendering or unmounting the entire list unnecessarily."
  },
  {
    id: "f2",
    category: "frameworks",
    difficulty: "medium",
    question: "When should you use `useCallback` in a React functional component?",
    options: [
      "Whenever you define any function inside a component to make execution faster",
      "To memoize a callback function instance between renders, preventing unnecessary child re-renders when passed as a prop to memoized children",
      "To run asynchronous database queries inside render",
      "To replace `useState` for local component state"
    ],
    correctAnswer: 1,
    hint: "It preserves reference equality between renders.",
    explanation: "`useCallback` returns a memoized version of the function that only changes if dependencies change. Its primary benefit is preserving referential equality for props passed to `React.memo` components."
  },
  {
    id: "f3",
    category: "frameworks",
    difficulty: "hard",
    question: "What is the difference between `useEffect` and `useLayoutEffect` in React?",
    options: [
      "`useLayoutEffect` fires synchronously after all DOM mutations but before the browser paints; `useEffect` runs asynchronously after paint",
      "`useEffect` runs on the server, while `useLayoutEffect` runs only on the client",
      "`useLayoutEffect` cannot take a dependency array",
      "`useEffect` blocks visual rendering until asynchronous promises resolve"
    ],
    correctAnswer: 0,
    hint: "Consider visual flickers and measurement of DOM dimensions.",
    explanation: "`useLayoutEffect` executes synchronously after DOM mutations, allowing developers to read DOM layout and mutate styles before the browser paints to prevent visual flickering."
  },
  {
    id: "f4",
    category: "frameworks",
    difficulty: "medium",
    question: "What problem does React's Context API solve, and what is its main trade-off?",
    options: [
      "It eliminates props drilling across deep component trees, but any context value change re-renders all subscribing consumers",
      "It replaces all CSS stylesheets with runtime styling, but increases network bundle payload",
      "It enables multi-threading in JavaScript web workers, but disables JSX parsing",
      "It prevents re-renders automatically for all components in the subtree"
    ],
    correctAnswer: 0,
    hint: "Think about state broadcasting vs fine-grained component re-renders.",
    explanation: "Context prevents prop-drilling by providing a data bus, but any change to the context value will trigger a re-render in every consumer component unless carefully split or memoized."
  },

  // --- 4. DATA STRUCTURES & ALGORITHMS ---
  {
    id: "dsa1",
    category: "dsa",
    difficulty: "easy",
    question: "What is the average time complexity for searching a key in a balanced Binary Search Tree (BST)?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)"
    ],
    correctAnswer: 1,
    hint: "At each node comparison, half of the remaining elements are eliminated.",
    explanation: "In a balanced BST (like an AVL or Red-Black tree), the height is log(n), meaning search, insert, and delete operations take O(log n) time on average."
  },
  {
    id: "dsa2",
    category: "dsa",
    difficulty: "medium",
    question: "Which data structure is optimal for implementing Breadth-First Search (BFS) in a graph?",
    options: [
      "Stack (LIFO)",
      "Queue (FIFO)",
      "Binary Min-Heap",
      "Disjoint Set (Union-Find)"
    ],
    correctAnswer: 1,
    hint: "Nodes at the current depth level must be visited before deeper nodes.",
    explanation: "BFS explores nodes level by level using a Queue (First-In, First-Out), ensuring nodes discovered earlier are expanded before nodes discovered later."
  },
  {
    id: "dsa3",
    category: "dsa",
    difficulty: "hard",
    question: "What is the worst-case time complexity of QuickSort, and when does it occur?",
    options: [
      "O(n^2), occurring when the chosen pivot is repeatedly the smallest or largest element (e.g. already sorted array with naive pivot)",
      "O(n log n), occurring on randomly shuffled inputs",
      "O(n), occurring when all elements are duplicates",
      "O(log n), occurring on balanced partitions"
    ],
    correctAnswer: 0,
    hint: "Think about unbalanced partitions with naive pivot selection.",
    explanation: "When partitions are severely unbalanced (e.g. 0 elements on one side, n-1 on the other), QuickSort degenerates to O(n^2). Randomized or median-of-three pivots mitigate this."
  },
  {
    id: "dsa4",
    category: "dsa",
    difficulty: "medium",
    question: "What is the space complexity of a recursive Depth-First Search (DFS) on a binary tree with height `h`?",
    options: [
      "O(1)",
      "O(h) due to the call stack",
      "O(n^2)",
      "O(2^h)"
    ],
    correctAnswer: 1,
    hint: "Each recursive frame on the call stack corresponds to the path from root to current node.",
    explanation: "The maximum depth of the recursive call stack is bounded by the height of the tree `h`, yielding O(h) space complexity (O(log n) for balanced, O(n) for skewed)."
  },

  // --- 5. PYTHON & BACKEND ---
  {
    id: "py1",
    category: "python",
    difficulty: "easy",
    question: "In Python, which of the following data structures is immutable?",
    options: [
      "List: `[1, 2, 3]`",
      "Dictionary: `{'a': 1}`",
      "Tuple: `(1, 2, 3)`",
      "Set: `{1, 2, 3}`"
    ],
    correctAnswer: 2,
    hint: "Once created, its elements cannot be reassigned or modified.",
    explanation: "Tuples `()` and frozen sets are immutable in Python, meaning their contents cannot be altered after instantiation."
  },
  {
    id: "py2",
    category: "python",
    difficulty: "medium",
    question: "What does Python's `yield` keyword do when used in a function definition?",
    options: [
      "It terminates the function and raises a StopIteration exception immediately",
      "It turns the function into a generator, producing values lazily on-demand without storing the entire sequence in memory",
      "It yields CPU control to a separate OS background thread",
      "It locks a mutex lock to prevent race conditions"
    ],
    correctAnswer: 1,
    hint: "Think about lazy iteration and memory efficiency.",
    explanation: "`yield` pauses the function's execution and emits a value to the caller, resuming state on the next call to `next()`, creating memory-efficient iterable streams."
  },
  {
    id: "py3",
    category: "python",
    difficulty: "hard",
    question: "What is the Global Interpreter Lock (GIL) in CPython, and what impact does it have?",
    options: [
      "A mutex that prevents multiple native threads from executing Python bytecodes concurrently, limiting CPU-bound threads to a single core",
      "A security sandbox that disables file system writes in web servers",
      "A garbage collection lock that disables reference counting in production",
      "A database connection pooler built into the Python standard library"
    ],
    correctAnswer: 0,
    hint: "It impacts multi-threaded CPU-bound performance in standard CPython.",
    explanation: "The GIL protects CPython memory management and reference counting. While I/O-bound operations release the GIL, CPU-intensive tasks require `multiprocessing` to utilize multiple CPU cores."
  },
  {
    id: "py4",
    category: "python",
    difficulty: "easy",
    question: "What is the purpose of Python's `with` statement (Context Manager)?",
    options: [
      "It guarantees that resources (like file streams or database connections) are cleanly closed or released, even if exceptions occur",
      "It enables multi-process parallelism across servers",
      "It converts synchronous functions into async coroutines",
      "It compiles Python script into native C machine code"
    ],
    correctAnswer: 0,
    hint: "Think about `__enter__` and `__exit__` methods.",
    explanation: "The `with` statement wraps block execution with methods defined by a context manager (`__enter__` and `__exit__`), ensuring deterministic cleanup like closing file handles."
  },

  // --- 6. DATABASES & SQL ---
  {
    id: "db1",
    category: "databases",
    difficulty: "easy",
    question: "What is the difference between `WHERE` and `HAVING` clauses in SQL?",
    options: [
      "`WHERE` filters individual rows before aggregation; `HAVING` filters grouped rows after `GROUP BY` aggregation",
      "`WHERE` can only be used with primary keys; `HAVING` can be used on any column",
      "`HAVING` filters rows before sorting; `WHERE` filters rows after `ORDER BY`",
      "`WHERE` is only supported in MySQL; `HAVING` is standard PostgreSQL syntax"
    ],
    correctAnswer: 0,
    hint: "`HAVING` works with aggregate functions like `COUNT()`, `SUM()`, `AVG()`.",
    explanation: "`WHERE` applies row-level filters before grouping. `HAVING` evaluates filter criteria on aggregate values produced by `GROUP BY`."
  },
  {
    id: "db2",
    category: "databases",
    difficulty: "medium",
    question: "What does ACID stand for in relational database transactions?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Asynchronous, Concurrent, Indexed, Distributed",
      "Authentication, Cryptography, Integrity, Decryption",
      "Allocation, Compression, Ingestion, Deletion"
    ],
    correctAnswer: 0,
    hint: "These four guarantees ensure transaction reliability.",
    explanation: "ACID guarantees that database transactions are processed reliably: Atomicity (all or nothing), Consistency (preserves constraints), Isolation (concurrent safety), and Durability (persisted committed state)."
  },
  {
    id: "db3",
    category: "databases",
    difficulty: "hard",
    question: "Why do relational databases commonly use B-Trees (or B+ Trees) instead of Binary Search Trees for indexes on disk?",
    options: [
      "B+ Trees have a high branching factor, keeping the tree shallow and dramatically minimizing expensive disk I/O operations",
      "B+ Trees require zero memory and execute in O(1) time",
      "Binary Search Trees cannot store string data types",
      "B+ Trees automatically compress tables into encrypted files"
    ],
    correctAnswer: 0,
    hint: "Disk block reads are much slower than CPU memory operations.",
    explanation: "B+ Trees have high fan-out (many keys per node matching disk block sizes), keeping height low (typically 3–4 levels for millions of rows), which drastically reduces disk seek operations."
  },
  {
    id: "db4",
    category: "databases",
    difficulty: "medium",
    question: "What is the result of an `INNER JOIN` vs `LEFT JOIN` in SQL?",
    options: [
      "`INNER JOIN` returns only matching records from both tables; `LEFT JOIN` returns all records from the left table plus matching right table records (with NULLs for non-matches)",
      "`LEFT JOIN` merges tables without a foreign key, while `INNER JOIN` requires an index",
      "`INNER JOIN` sorts records ascending, while `LEFT JOIN` sorts descending",
      "There is no difference; they are aliases for the same relational operation"
    ],
    correctAnswer: 0,
    hint: "Consider what happens to unmatched rows in the left table.",
    explanation: "An `INNER JOIN` only yields rows where the join condition matches on both sides. A `LEFT JOIN` preserves every row from the primary (left) table, populating right columns with NULL when no match exists."
  },

  // --- 7. CS FUNDAMENTALS ---
  {
    id: "cs1",
    category: "cs",
    difficulty: "easy",
    question: "What is the primary difference between a Process and a Thread in modern operating systems?",
    options: [
      "A process has its own dedicated address space and resources; threads within the same process share that memory space",
      "A thread has independent memory isolation, while processes share the CPU cache",
      "Processes can only run on single-core processors; threads require multiple sockets",
      "Threads are managed by the BIOS, while processes are managed by the kernel"
    ],
    correctAnswer: 0,
    hint: "Consider memory isolation vs shared heap/data segments.",
    explanation: "A process is an isolated executing program instance with its own virtual address space. Threads are execution units inside a process sharing the same memory heap, code, and file descriptors."
  },
  {
    id: "cs2",
    category: "cs",
    difficulty: "medium",
    question: "In computer networking, how does TCP ensure reliable data transmission compared to UDP?",
    options: [
      "TCP uses connection handshakes (SYN/ACK), sequence numbering, acknowledgments, and retransmission of lost packets",
      "TCP broadcasts packets to all nodes simultaneously using raw ethernet frames",
      "TCP requires fiber-optic hardware cables, whereas UDP operates over Wi-Fi",
      "UDP encrypts packets with TLS by default, while TCP sends plaintext"
    ],
    correctAnswer: 0,
    hint: "Think about reliability guarantees and packet ordering.",
    explanation: "TCP is a connection-oriented protocol that guarantees delivery, ordering, and error-checking via sequence numbers, checksums, and acknowledgments. UDP is connectionless and prioritizes low latency over reliability."
  },
  {
    id: "cs3",
    category: "cs",
    difficulty: "hard",
    question: "What is a Deadlock in concurrent systems, and which Coffman condition refers to holding resources while requesting more?",
    options: [
      "Hold and Wait: A process holds at least one resource while waiting to acquire additional resources held by other processes",
      "Mutual Exclusion: Resources can be shared simultaneously by multiple threads",
      "Preemption: The operating system forcibly takes resources away from waiting threads",
      "Circular Sleep: Threads pause their clock frequencies indefinitely"
    ],
    correctAnswer: 0,
    hint: "One of the four Coffman conditions for deadlock.",
    explanation: "A deadlock occurs when a set of concurrent processes are permanently blocked waiting for resources held by each other. 'Hold and Wait' is one of the four essential Coffman conditions required for a deadlock."
  },
  {
    id: "cs4",
    category: "cs",
    difficulty: "medium",
    question: "What is the difference between Virtual Memory and Physical RAM?",
    options: [
      "Virtual memory provides an abstraction mapping each process's address space to physical RAM and secondary disk storage via page tables",
      "Virtual memory is slower RAM soldered onto the motherboard",
      "Physical RAM cannot be accessed by the operating system kernel directly",
      "Virtual memory is only used when the machine is booted into safe mode"
    ],
    correctAnswer: 0,
    hint: "Think about memory isolation, paging, and address translation via MMU.",
    explanation: "Virtual memory maps process address spaces to physical frames through the Memory Management Unit (MMU) and page tables, providing memory protection, isolation, and paging to disk when RAM is constrained."
  },

  // --- 8. SECURITY & DEVOPS ---
  {
    id: "s1",
    category: "security",
    difficulty: "easy",
    question: "What is the primary vulnerability targeted by SQL Injection (SQLi)?",
    options: [
      "Untrusted user input concatenated directly into dynamic SQL queries without parameterized binding",
      "Overloading a database port with excessive SYN packets",
      "Unencrypted database backups stored on external USB drives",
      "Using weak SSL certificates for database connection pooling"
    ],
    correctAnswer: 0,
    hint: "Think about parameterized queries and prepared statements.",
    explanation: "SQLi occurs when untrusted input is interpolated into raw SQL strings, allowing attackers to manipulate query logic. Prepared statements and parameterized queries eliminate this risk."
  },
  {
    id: "s2",
    category: "security",
    difficulty: "medium",
    question: "What does the browser's `SameSite` attribute on HTTP cookies protect against?",
    options: [
      "Cross-Site Request Forgery (CSRF) by restricting cookie delivery on cross-origin requests",
      "SQL injection attacks executed in database queries",
      "Man-in-the-Middle network eavesdropping over public Wi-Fi",
      "Distributed Denial of Service (DDoS) traffic surges"
    ],
    correctAnswer: 0,
    hint: "Think about whether a cookie is sent when a third-party website makes a request to your API.",
    explanation: "Setting `SameSite=Strict` or `SameSite=Lax` controls whether cookies are sent with cross-site requests, providing defense against CSRF attacks where malicious sites trigger unauthorized user actions."
  },
  {
    id: "s3",
    category: "security",
    difficulty: "hard",
    question: "In Docker containerization, how do containers differ fundamentally from Virtual Machines (VMs)?",
    options: [
      "Containers share the host operating system kernel and isolate processes using cgroups and namespaces; VMs run full guest OS kernels on a hypervisor",
      "VMs cannot run Linux distributions, while containers can only run Alpine",
      "Containers execute entirely inside browser WebAssembly sandboxes",
      "VMs consume zero CPU resources when idle, unlike containers"
    ],
    correctAnswer: 0,
    hint: "Think about host kernel sharing vs hypervisor guest OS abstraction.",
    explanation: "Containers package only application code and dependencies, sharing the host OS kernel through Linux namespaces and cgroups, making them lightweight and fast to spin up compared to hypervisor-backed VMs."
  },
  {
    id: "s4",
    category: "security",
    difficulty: "medium",
    question: "What is the purpose of the HTTP `Content-Security-Policy` (CSP) response header?",
    options: [
      "Restricts the origins from which scripts, styles, images, and other resources can be loaded or executed, mitigating XSS attacks",
      "Forces client web browsers to render pages strictly in dark mode",
      "Compresses API JSON payloads using Gzip or Brotli algorithms",
      "Generates OAuth 2.0 access tokens for mobile authentication"
    ],
    correctAnswer: 0,
    hint: "Helps prevent Cross-Site Scripting (XSS) and data injection.",
    explanation: "CSP is an effective security layer that instructs browsers to only execute scripts and load assets from trusted allowlisted domains or cryptographic nonces, neutralizing most XSS attacks."
  }
];

// Helper methods for questions
const QuestionService = {
  getAllQuestions: function () {
    return [...defaultQuizQuestions];
  },

  getCategories: function () {
    return CATEGORIES;
  },

  getQuestionsByCategory: function (catId) {
    const all = this.getAllQuestions();
    if (!catId || catId === "all") return all;
    return all.filter((q) => q.category === catId);
  },

  getQuestionsByDifficulty: function (diff) {
    const all = this.getAllQuestions();
    if (!diff || diff === "all") return all;
    return all.filter((q) => q.difficulty === diff);
  },

  getCategoryStats: function (catId) {
    const qs = this.getQuestionsByCategory(catId);
    return {
      total: qs.length,
      easy: qs.filter((q) => q.difficulty === "easy").length,
      medium: qs.filter((q) => q.difficulty === "medium").length,
      hard: qs.filter((q) => q.difficulty === "hard").length
    };
  },

  getDailyChallengeQuestions: function () {
    // Generate deterministic daily set based on today's date string
    const todayStr = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    // Pick 5 balanced questions across different categories
    const all = [...defaultQuizQuestions];
    // Deterministic shuffle using seed
    const seeded = [...all].sort((a, b) => {
      const valA = (a.id.charCodeAt(0) * seed) % 97;
      const valB = (b.id.charCodeAt(0) * seed) % 97;
      return valA - valB;
    });
    return seeded.slice(0, 5);
  }
};
