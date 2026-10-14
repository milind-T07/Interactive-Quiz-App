const fs = require('fs');
const path = require('path');
const { makeQuestion } = require('./question-helper');

function getJsQuestions() {
  const existing = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/javascript.json'), 'utf8'));
  const clean = [];
  const seen = new Set();

  existing.forEach(q => {
    const isDummy = q.question.includes('Which approach is recommended for modern') ||
                    (q.question.includes('Which statement about') && q.options[0].includes('Follow established best practices')) ||
                    q.options[0] === 'Follow established best practices and official documentation for reliable implementations';
    const text = q.question.trim().toLowerCase();
    if (!isDummy && !seen.has(text)) {
      seen.add(text);
      clean.push(q);
    }
  });

  const rawList = [
    // Primitives & Types
    ["Types & Coercion", "easy", "What is the result of 'typeof null' in JavaScript?", "'object'", ["'null'", "'undefined'", "'primitive'"], "This is a historical bug in JavaScript from its first implementation that remains for backward compatibility.", "A classic JavaScript legacy quirk."],
    ["Types & Coercion", "easy", "What does 'typeof NaN' return in JavaScript?", "'number'", ["'nan'", "'undefined'", "'object'"], "NaN stands for Not-a-Number, but its programmatic type according to IEEE 754 floating-point standard is 'number'.", "Numeric standard type."],
    ["Types & Coercion", "medium", "What is the difference between '==' (loose equality) and '===' (strict equality)?", "'===' checks both value and type without type coercion, while '==' coerces types before comparing", ["'==' only works on strings and numbers", "'===' creates a deep copy before comparing", "There is no performance or behavioral difference"], "Strict equality (===) prevents implicit type conversion during comparison.", "Coercion vs non-coercion."],
    ["Types & Coercion", "medium", "What does 'Object.is(-0, +0)' evaluate to?", "false", ["true", "undefined", "NaN"], "Unlike === which treats -0 and +0 as identical, Object.is distinguishes negative zero from positive zero.", "Exact identity comparison."],
    ["Types & Coercion", "medium", "What does 'Object.is(NaN, NaN)' evaluate to?", "true", ["false", "undefined", "null"], "Unlike === which evaluates NaN === NaN to false, Object.is correctly recognizes NaN as identical to NaN.", "NaN self-equality check."],
    ["Types & Coercion", "easy", "Which primitive data type was introduced in ES2020 to represent arbitrary-precision integers?", "BigInt", ["Long", "Int64", "HugeNumber"], "BigInt allows safe representation and operation on large integers beyond Number.MAX_SAFE_INTEGER.", "Arbitrary precision numeric primitive."],
    ["Types & Coercion", "medium", "What primitive value is created using 'Symbol('desc')'?", "A guaranteed unique identifier", ["A string with hidden metadata", "An immutable object reference", "A global pointer to memory"], "Symbols are unique, immutable primitive values often used as non-enumerable object keys.", "Unique identifier primitive."],
    ["Types & Coercion", "medium", "What does '[] + {}' evaluate to in standard JavaScript expression context?", "'[object Object]'", ["0", "NaN", "TypeError"], "The empty array coerces to an empty string '', and the object coerces to '[object Object]', concatenating to '[object Object]'.", "Implicit string coercion."],
    ["Types & Coercion", "medium", "What does '[] == false' evaluate to in JavaScript?", "true", ["false", "TypeError", "undefined"], "Both sides are coerced to numbers: [] becomes '' which becomes 0, and false becomes 0, so 0 == 0 is true.", "Loose equality coercion steps."],

    // Scopes, Closures, Hoisting
    ["Scopes & Closures", "easy", "What is the Temporal Dead Zone (TDZ) in JavaScript?", "The period between entering a scope and declaring a 'let' or 'const' variable where accessing it throws a ReferenceError", ["The time it takes for garbage collection to run", "The delay before a setTimeout callback executes", "The duration of an asynchronous Promise settlement"], "Variables declared with let and const are hoisted but remain in the TDZ until execution reaches their declaration.", "Temporal Dead Zone reference."],
    ["Scopes & Closures", "medium", "How do 'var', 'let', and 'const' differ regarding scoping?", "'var' is function-scoped; 'let' and 'const' are block-scoped", ["'var' is block-scoped; 'let' is function-scoped", "All three variables are globally scoped", "'const' is function-scoped while 'var' is block-scoped"], "var declarations are hoisted to the nearest function boundary, while let/const respect curly brace blocks.", "Block vs function scoping."],
    ["Scopes & Closures", "medium", "What is a closure in JavaScript?", "A function that retains access to variables from its outer lexical scope even after that outer function has returned", ["A method to close network connections automatically", "A private class constructor function", "A syntax error when curly braces are missing"], "Closures bundle a function with references to its surrounding lexical environment.", "Lexical scope retention."],
    ["Scopes & Closures", "hard", "What will the following code log? 'for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }'", "3, 3, 3", ["0, 1, 2", "undefined, undefined, undefined", "0, 0, 0"], "Because 'var' is function-scoped, the single shared 'i' variable is incremented to 3 before any timeout callback runs.", "Var in asynchronous loop."],
    ["Scopes & Closures", "medium", "Why does replacing 'var' with 'let' in 'for (let i = 0; i < 3; i++)' log 0, 1, 2?", "'let' creates a new binding for 'i' for each iteration of the loop", ["'let' executes callbacks synchronously without waiting", "'let' creates a global copy of i", "'let' prevents setTimeout from being deferred"], "In for-loops, let binds a new fresh copy of the loop variable for every iteration.", "Per-iteration binding."],

    // Functions & 'this'
    ["Functions & 'this'", "easy", "How do arrow functions handle the 'this' keyword differently than regular functions?", "Arrow functions do not have their own 'this'; they inherit 'this' lexically from the enclosing scope", ["Arrow functions bind 'this' to the global window object always", "Arrow functions require bind() to access 'this'", "Arrow functions cannot access 'this' at all, throwing a syntax error"], "Arrow functions lack their own this, arguments, and super bindings; they resolve them lexically.", "Lexical this binding."],
    ["Functions & 'this'", "medium", "What is the difference between 'Function.prototype.call()' and 'Function.prototype.apply()'?", "'call()' accepts arguments individually separated by commas, while 'apply()' accepts them as an array", ["'call()' is asynchronous while 'apply()' is synchronous", "'apply()' binds this permanently while 'call()' does not", "'call()' only works on arrow functions"], "Both immediately invoke the function with a specific this, but apply takes an array-like list of arguments.", "Comma arguments vs array argument."],
    ["Functions & 'this'", "medium", "What does 'Function.prototype.bind()' return?", "A new copy of the function with 'this' bound permanently to the specified object", ["The return value of executing the function immediately", "A Promise that resolves with this context", "A boolean indicating whether binding succeeded"], "bind() returns a new bound function that when called has its this keyword set to the provided value.", "Returns bound function."],
    ["Functions & 'this'", "medium", "Can an arrow function be used as a constructor with the 'new' keyword?", "No, doing so throws a TypeError because arrow functions lack a [[Construct]] method and prototype property", ["Yes, exactly like regular functions", "Only if it returns an object literal", "Only when running in strict mode"], "Arrow functions do not have a [[Construct]] internal method and cannot be instantiated with new.", "Constructor incompatibility."],

    // Objects & Prototypes
    ["Objects & Prototypes", "medium", "What is the difference between 'Object.freeze()' and 'Object.seal()'?", "'freeze()' makes all properties read-only, while 'seal()' allows modifying existing properties but prevents adding/deleting", ["'seal()' prevents reading values while 'freeze()' does not", "'freeze()' creates a deep immutable clone", "'seal()' only applies to arrays"], "Object.freeze prevents modification, addition, and deletion. Object.seal allows value mutation of existing properties.", "Immutability vs structural lock."],
    ["Objects & Prototypes", "medium", "What is the modern, safe alternative to 'Object.prototype.hasOwnProperty.call(obj, key)' introduced in ES2022?", "Object.hasOwn(obj, key)", ["Object.contains(obj, key)", "Reflect.hasProperty(obj, key)", "Object.includes(obj, key)"], "Object.hasOwn is a static method that safely checks own properties without prototype pollution or override risks.", "Modern static hasOwn."],
    ["Objects & Prototypes", "medium", "What does 'Object.assign(target, ...sources)' perform?", "A shallow copy of own enumerable properties from source objects to the target object", ["A recursive deep clone of all properties", "An immutable merge returning a frozen object", "A prototype inheritance link"], "Object.assign only copies references for nested objects (shallow copy).", "Shallow property merge."],
    ["Objects & Prototypes", "easy", "Which standard built-in global function performs deep cloning in modern JavaScript (ES2022+)?", "structuredClone()", ["JSON.deepClone()", "Object.deepCopy()", "cloneDeep()"], "structuredClone() creates a deep clone of a given value using the structured clone algorithm.", "Native deep clone API."],
    ["Objects & Prototypes", "medium", "What does 'Object.getPrototypeOf(obj)' return?", "The internal [[Prototype]] of the specified object", ["The constructor function string", "A list of all inherited property names", "An array of all prototype methods"], "Object.getPrototypeOf returns the prototype of the specified object.", "Prototype retrieval."],
    ["Objects & Prototypes", "hard", "What happens when you look up a property that does not exist on an object or any object in its prototype chain?", "JavaScript returns undefined", ["A ReferenceError is thrown", "The browser throws a PrototypeExhaustedError", "null is returned"], "Property lookup walks up the prototype chain until null is reached; if not found, it evaluates to undefined.", "Undefined fallback."],

    // Asynchronous JavaScript & Event Loop
    ["Event Loop & Async", "medium", "What is the execution priority difference between microtasks and macrotasks in the event loop?", "All microtasks in the microtask queue are executed before the next macrotask runs", ["Macrotasks always execute before microtasks", "Microtasks and macrotasks alternate 1-to-1", "Microtasks only run when the browser tab is idle"], "The microtask queue (Promises, queueMicrotask, MutationObserver) is completely drained before processing the next macrotask.", "Microtask queue priority."],
    ["Event Loop & Async", "easy", "Which of the following is processed as a microtask in JavaScript?", "Promise .then() / .catch() / .finally() callbacks and queueMicrotask()", ["setTimeout callbacks", "setInterval callbacks", "setImmediate callbacks"], "Promise reaction callbacks and queueMicrotask are queued in the microtask queue.", "Promise callbacks are microtasks."],
    ["Event Loop & Async", "easy", "Which of the following is processed as a macrotask (task)?", "setTimeout and setInterval callbacks", ["Promise.resolve().then()", "queueMicrotask()", "async function internal resumes"], "setTimeout and setInterval register macrotasks in the task queue.", "Timers are macrotasks."],
    ["Event Loop & Async", "medium", "What does 'Promise.allSettled()' do compared to 'Promise.all()'?", "It waits for all promises to settle (fulfill or reject) and never short-circuits on rejection", ["It rejects immediately if any single promise rejects", "It resolves with only the fastest successful promise", "It executes promises sequentially in series"], "Promise.allSettled returns an array of outcome objects describing whether each promise fulfilled or rejected.", "No rejection short-circuit."],
    ["Event Loop & Async", "medium", "What does 'Promise.any()' do?", "Resolves with the value of the first fulfilled promise, ignoring rejections unless all reject", ["Resolves with the first settled promise whether fulfilled or rejected", "Rejects if any single promise fails", "Resolves with an array of all successful results"], "Promise.any takes an iterable of promises and fulfills as soon as any of the promises fulfills.", "First fulfilled promise."],
    ["Event Loop & Async", "medium", "What does 'Promise.race()' do?", "Settles as soon as the first promise settles, whether it fulfills or rejects", ["Resolves only if all promises succeed simultaneously", "Races promises and cancels slower ones", "Waits for the last promise to finish"], "Promise.race returns a promise that fulfills or rejects as soon as one of the promises settles.", "First settled wins."],
    ["Event Loop & Async", "hard", "What error type is thrown by 'Promise.any()' when all supplied promises reject?", "AggregateError", ["PromiseAllRejectedError", "TypeError", "BatchRejectionError"], "If all promises reject, Promise.any rejects with an AggregateError containing all rejection reasons.", "AggregateError grouping."],

    // Arrays & Iterables
    ["Arrays & Iterables", "easy", "What is the difference between 'Array.prototype.slice()' and 'Array.prototype.splice()'?", "'slice()' returns a shallow copy of a portion of an array without modifying it; 'splice()' mutates the original array", ["'splice()' creates an immutable copy", "'slice()' deletes elements permanently", "They are identical aliases"], "slice is a non-mutating reader; splice changes array contents by removing, replacing, or adding elements.", "Non-mutating slice vs mutating splice."],
    ["Arrays & Iterables", "easy", "Which modern array method returns a new array with elements sorted without mutating the original array?", "toSorted()", ["sort()", "sortImmutable()", "asSorted()"], "ES2023 introduced toSorted() which returns a new sorted copy without modifying the original array.", "Non-mutating sort (ES2023)."],
    ["Arrays & Iterables", "easy", "Which modern array method returns a new array with reversed elements without mutating the original array?", "toReversed()", ["reverse()", "reversed()", "asReversed()"], "toReversed() returns a new array with elements in reverse order without modifying the original array.", "Non-mutating reverse (ES2023)."],
    ["Arrays & Iterables", "medium", "What does 'Array.prototype.flatMap()' do?", "Maps each element using a mapping function, then flattens the result by one depth level", ["Flattens an array recursively to infinite depth", "Maps only non-null elements into an array", "Flattens an array without transforming values"], "flatMap is equivalent to map() followed by flat(1).", "Map then flatten depth 1."],
    ["Arrays & Iterables", "medium", "What is the difference between 'Map' and a plain JavaScript object?", "Map keys can be of any type (including objects and functions), while object keys must be strings or symbols", ["Objects preserve insertion order while Maps do not", "Maps cannot be iterated with for...of loops", "Objects have a built-in .size property"], "Map accepts any data type as keys and tracks size directly with .size.", "Key type flexibility & size."],
    ["Arrays & Iterables", "medium", "What is the primary benefit of 'WeakMap' and 'WeakSet'?", "Their keys/values are weakly referenced and do not prevent garbage collection of unused objects", ["They allow primitive string keys for fast lookup", "They can be serialized directly with JSON.stringify()", "They support .clear() and .size properties"], "WeakMap and WeakSet hold weak references to object keys, preventing memory leaks when objects are discarded elsewhere.", "Automatic garbage collection."],

    // Modern Operators & Syntax
    ["Modern Syntax", "easy", "What does the nullish coalescing operator '??' check for?", "Whether the left-hand operand is 'null' or 'undefined' specifically", ["Whether the left-hand operand is any falsy value (0, false, '')", "Whether the two operands have identical references", "Whether the variable is declared in scope"], "?? returns its right-hand operand only when its left-hand operand is null or undefined (not false or 0).", "Null or undefined check only."],
    ["Modern Syntax", "easy", "What does the optional chaining operator '?.' do when accessing a property on null or undefined?", "Short-circuits and immediately evaluates to 'undefined' without throwing an error", ["Throws a NullPointerException", "Creates an empty object automatically", "Returns false"], "Optional chaining short-circuits navigation if the target is nullish.", "Safe property access."],
    ["Modern Syntax", "medium", "What does the logical nullish assignment operator 'x ??= y' do?", "Assigns 'y' to 'x' only if 'x' is currently null or undefined", ["Assigns 'y' to 'x' if 'x' is falsy", "Compares x and y and returns boolean", "Deletes x if y is null"], "??= only evaluates and assigns y if x is nullish.", "Conditional nullish assignment."],
    ["Modern Syntax", "medium", "What does the logical OR assignment operator 'x ||= y' do?", "Assigns 'y' to 'x' only if 'x' is currently falsy", ["Assigns 'y' to 'x' only if 'x' is truthy", "Assigns 'y' to 'x' only if 'x' is null", "Bitwise ORs x and y together"], "||= assigns y to x if x evaluates to false, 0, '', null, undefined, or NaN.", "Falsy assignment operator."],

    // Classes & OOP
    ["Classes & OOP", "medium", "How do you declare a private class field in modern JavaScript?", "By prefixing the field name with a hash symbol '#'", ["By using the 'private' keyword before the name", "By prefixing the field name with an underscore '_'", "By declaring it inside a Symbol wrapper"], "#fieldName declares a hard private class field that cannot be accessed outside the class body.", "Hash prefix private fields."],
    ["Classes & OOP", "medium", "What must be called in a derived class constructor before accessing 'this'?", "super()", ["parent()", "this.init()", "Object.init()"], "In derived classes, super() must be called before using this, or a ReferenceError will be thrown.", "super() requirement."],
    ["Classes & OOP", "medium", "What is a static initialization block in a JavaScript class ('static { ... }')?", "A block of code executed once when the class is defined to initialize static properties", ["A constructor that runs for every new instance", "A method that runs before garbage collection", "A worker thread initializer"], "Static initialization blocks permit privileged access to private state during class definition.", "Static initialization block."],

    // Error Handling & Web APIs
    ["Errors & APIs", "medium", "What does the 'cause' property in 'new Error('Failed', { cause: err })' allow?", "Chaining errors so you can track the root cause of an error through multiple layers", ["Automatically retrying the failed operation", "Logging the error directly to an external server", "Suppressing stack trace output"], "Error cause enables structured error chaining across application boundaries.", "Root cause error chaining."],
    ["Errors & APIs", "medium", "What does 'AbortController' and 'AbortSignal' enable in modern JavaScript?", "Canceling asynchronous tasks such as fetch requests, event listeners, and timers cleanly", ["Terminating node.js worker threads abruptly", "Pausing JavaScript execution like a debugger", "Catching synchronous exceptions globally"], "AbortController provides an AbortSignal that can abort fetch requests and DOM event listeners.", "Standard async cancellation."],
    ["Errors & APIs", "medium", "What does 'queueMicrotask(() => {})' do?", "Explicitly enqueues a microtask to be executed before the browser yields control back to the event loop", ["Pushes a function into the setTimeout macrotask queue", "Executes the callback synchronously right away", "Schedules work during browser idle periods"], "queueMicrotask explicitly schedules a microtask to run when no other code is currently running.", "Explicit microtask scheduling."]
  ];

  // Helper generator to construct clean, realistic questions across comprehensive JS topics
  const topicsMatrix = [
    // Array methods
    ["Arrays", "easy", "Which Array method tests whether all elements in an array pass the provided function?", "every()", ["some()", "all()", "filter()"], "every() returns true if every element in the array satisfies the testing function."],
    ["Arrays", "easy", "Which Array method tests whether at least one element in an array passes the provided test?", "some()", ["any()", "every()", "includes()"], "some() returns true if at least one element passes the provided test callback."],
    ["Arrays", "easy", "Which Array method finds the first element that satisfies the provided testing function?", "find()", ["search()", "locate()", "filterFirst()"], "find() returns the first element that satisfies the testing function, or undefined if not found."],
    ["Arrays", "easy", "Which Array method finds the index of the first element that satisfies the provided test?", "findIndex()", ["indexOf()", "searchIndex()", "locateIndex()"], "findIndex() returns the index of the first matching element, or -1 if not found."],
    ["Arrays", "medium", "Which modern method iterates from the end of an array to find the last matching element?", "findLast()", ["findFromEnd()", "searchReverse()", "lastMatch()"], "findLast() iterates backwards and returns the value of the first matching element found."],
    ["Arrays", "medium", "Which modern method iterates from the end of an array to find the index of the last matching element?", "findLastIndex()", ["lastIndex()", "reverseFindIndex()", "searchLastIndex()"], "findLastIndex() returns the index of the last element matching the condition, or -1."],
    ["Arrays", "easy", "Which Array method creates a new array with all elements that pass the test implemented by the callback?", "filter()", ["select()", "where()", "extract()"], "filter() constructs a new array with all elements that pass the filter test."],
    ["Arrays", "easy", "Which Array method executes a user-supplied reducer callback function on each element of the array, returning a single value?", "reduce()", ["fold()", "aggregate()", "combine()"], "reduce() executes a reducer callback over the array to accumulate a single resulting value."],
    ["Arrays", "medium", "What is the return value of 'Array.isArray([])'?", "true", ["false", "undefined", "'array'"], "Array.isArray determines whether the passed value is an Array."],
    ["Arrays", "medium", "Which method copies array elements within the array to and from specified positions without mutating its length?", "copyWithin()", ["shiftWithin()", "moveElements()", "reorder()"], "copyWithin() shallow copies part of an array to another location in the same array."],
    ["Arrays", "medium", "Which method changes all elements in an array to a static value from start index to an end index?", "fill()", ["populate()", "setAll()", "overwrite()"], "fill() changes all elements in an array to a static value from start to end index."],
    ["Arrays", "medium", "Which modern Array method returns a new array with the element at the given index replaced with the given value?", "with()", ["replaceAt()", "setIndex()", "update()"], "ES2023 introduced with(index, value) to immutably replace an element at a given index."],
    ["Arrays", "medium", "Which modern Array method returns a new copy of an array with elements removed and/or added without mutating the original?", "toSpliced()", ["spliceCopy()", "immutableSplice()", "asSpliced()"], "toSpliced() returns a new array with elements removed or inserted without mutating the original."],
    ["Arrays", "easy", "Which Array method concatenates all sub-array elements into a new array up to the specified depth?", "flat()", ["flatten()", "unwrap()", "mergeDepth()"], "flat() creates a new array with sub-array elements concatenated into it up to a specified depth."],
    ["Arrays", "easy", "Which Array method joins all elements of an array into a string separated by a specified delimiter?", "join()", ["toString()", "concatString()", "implode()"], "join() creates and returns a new string by concatenating all array elements."],
    ["Arrays", "easy", "Which Array method removes the last element from an array and returns that element?", "pop()", ["shift()", "removeLast()", "truncate()"], "pop() removes the last element from an array and returns that element, changing array length."],
    ["Arrays", "easy", "Which Array method adds one or more elements to the end of an array and returns the new length?", "push()", ["append()", "insert()", "add()"], "push() appends elements to the end of an array."],
    ["Arrays", "easy", "Which Array method removes the first element from an array and returns that removed element?", "shift()", ["pop()", "removeFirst()", "unshift()"], "shift() removes the first element from an array and returns it, shifting remaining elements."],
    ["Arrays", "easy", "Which Array method adds one or more elements to the beginning of an array and returns the new length?", "unshift()", ["prepend()", "shift()", "pushFront()"], "unshift() inserts elements at the front of an array."],

    // Strings & RegExp
    ["Strings", "easy", "Which String method returns the character at a specified index, supporting negative indices to count backwards?", "at()", ["charAt()", "character()", "get()"], "at() accepts negative integers to count back from the last string character."],
    ["Strings", "easy", "Which String method determines whether a string begins with the characters of a specified string?", "startsWith()", ["beginsWith()", "hasPrefix()", "headMatches()"], "startsWith() determines whether a string begins with the characters of another string."],
    ["Strings", "easy", "Which String method determines whether a string ends with the characters of a specified string?", "endsWith()", ["hasSuffix()", "finishesWith()", "tailMatches()"], "endsWith() determines whether a string ends with the characters of another string."],
    ["Strings", "easy", "Which String method returns true if a string contains a specified substring?", "includes()", ["contains()", "has()", "matches()"], "includes() performs a case-sensitive search to determine whether one string may be found within another."],
    ["Strings", "easy", "Which String method returns a new string with all matches of a pattern replaced by a replacement?", "replaceAll()", ["replaceEvery()", "replaceAllMatches()", "globalReplace()"], "replaceAll() replaces all occurrences of a string or regular expression with global flag."],
    ["Strings", "easy", "Which String method removes whitespace from both ends of a string?", "trim()", ["strip()", "clean()", "chomp()"], "trim() removes whitespace from both ends of a string."],
    ["Strings", "easy", "Which String method removes whitespace only from the beginning of a string?", "trimStart()", ["trimLeft()", "stripStart()", "cleanFront()"], "trimStart() (or trimLeft) removes whitespace from the start of a string."],
    ["Strings", "easy", "Which String method removes whitespace only from the end of a string?", "trimEnd()", ["trimRight()", "stripEnd()", "cleanBack()"], "trimEnd() (or trimRight) removes whitespace from the end of a string."],
    ["Strings", "medium", "Which String method pads the current string from the start with a given string until reaching a target length?", "padStart()", ["padLeft()", "fillStart()", "prefixPad()"], "padStart() pads the current string with another string until the resulting string reaches the given length."],
    ["Strings", "medium", "Which String method pads the current string from the end with a given string until reaching a target length?", "padEnd()", ["padRight()", "fillEnd()", "suffixPad()"], "padEnd() pads the current string from the end until reaching target length."],
    ["Strings", "medium", "What does 'String.prototype.repeat(count)' do?", "Returns a new string containing the specified number of copies of the string concatenated together", ["Loops over the string count times in console", "Repeats each individual character count times", "Duplicates memory buffer allocation"], "repeat() constructs and returns a new string containing copies of the original."],
    ["RegExp", "medium", "Which RegExp flag enables 'dotAll' mode where the dot '.' character matches newlines?", "s", ["m", "u", "y"], "The 's' flag allows '.' to match any character, including line terminators."],
    ["RegExp", "medium", "Which RegExp flag enables Unicode mode with full surrogate pair support?", "u (or v)", ["w", "x", "utf8"], "The 'u' flag enables Unicode features for regular expressions."],
    ["RegExp", "medium", "Which RegExp flag enforces sticky matching, searching only from the index indicated by lastIndex?", "y", ["s", "g", "i"], "The sticky 'y' flag matches only at the index indicated by the lastIndex property."],
    ["RegExp", "medium", "What does a positive lookahead '(?=...)' do in a regular expression?", "Matches a group after the main expression without including it in the result", ["Replaces the matched text with a placeholder", "Matches only if the pattern does not follow", "Matches text preceding the pattern"], "Positive lookahead asserts that the given subpattern can be matched immediately following current position."],
    ["RegExp", "medium", "What does a negative lookahead '(?!...)' do in a regular expression?", "Matches only if the specified subpattern does NOT follow immediately", ["Matches only if pattern follows immediately", "Inverts the entire regular expression", "Cancels regex compilation"], "Negative lookahead asserts that the given subpattern cannot be matched following current position."],
    ["RegExp", "medium", "What does a positive lookbehind '(?<=...)' do in a regular expression?", "Matches text only if it is preceded by the specified subpattern", ["Matches text only if followed by subpattern", "Matches characters from right to left", "Reverses captured groups"], "Lookbehind assertions match text based on what precedes it."],
    ["RegExp", "medium", "What does a named capturing group '(?<name>...)' do in regular expressions?", "Allows accessing the captured group in match results by name rather than index", ["Stores the captured group in global variables", "Prevents capturing that group in matches", "Enforces variable naming conventions"], "Named capturing groups allow referencing matches by name via match.groups[name]."],

    // Math & Numbers
    ["Math & Numbers", "easy", "Which Math method returns the smallest integer greater than or equal to a given number?", "Math.ceil()", ["Math.floor()", "Math.round()", "Math.trunc()"], "Math.ceil() rounds a number up to the next largest integer."],
    ["Math & Numbers", "easy", "Which Math method returns the largest integer less than or equal to a given number?", "Math.floor()", ["Math.ceil()", "Math.trunc()", "Math.round()"], "Math.floor() rounds a number down to the nearest integer."],
    ["Math & Numbers", "easy", "Which Math method returns the integer part of a number by removing any fractional digits?", "Math.trunc()", ["Math.floor()", "Math.round()", "Math.int()"], "Math.trunc() truncates decimal digits without rounding."],
    ["Math & Numbers", "easy", "Which Math method rounds a number to the nearest integer?", "Math.round()", ["Math.floor()", "Math.ceil()", "Math.approx()"], "Math.round() returns the value of a number rounded to the nearest integer."],
    ["Math & Numbers", "easy", "What is the largest safe integer in JavaScript represented by 'Number.MAX_SAFE_INTEGER'?", "9007199254740991 (2^53 - 1)", ["2147483647 (2^31 - 1)", "4294967295 (2^32 - 1)", "9999999999999999"], "2^53 - 1 is the largest integer that can be safely represented without precision loss in IEEE 754."],
    ["Math & Numbers", "medium", "What is the difference between 'Number.isNaN()' and global 'isNaN()'?", "'Number.isNaN()' does not force type coercion to number before checking, while global 'isNaN()' does", ["'Number.isNaN()' is deprecated", "Global 'isNaN()' checks for null values", "There is no difference"], "global isNaN('foo') returns true because 'foo' coerces to NaN; Number.isNaN('foo') returns false."],
    ["Math & Numbers", "medium", "What is the difference between 'Number.isFinite()' and global 'isFinite()'?", "'Number.isFinite()' does not coerce its argument to a number first", ["Global 'isFinite()' only works on integers", "'Number.isFinite()' always returns true for non-zero numbers", "There is no difference"], "Number.isFinite() tests whether the value is finite without converting non-numbers."],
    ["Math & Numbers", "easy", "Which Math method returns the square root of a number?", "Math.sqrt()", ["Math.root()", "Math.sq()", "Math.pow2()"], "Math.sqrt() returns the square root of a number."],
    ["Math & Numbers", "easy", "Which Math method returns the cube root of a number?", "Math.cbrt()", ["Math.cube()", "Math.root3()", "Math.cubicroot()"], "Math.cbrt() returns the cube root of a number."],
    ["Math & Numbers", "easy", "Which Math method returns the base to the exponent power?", "Math.pow(base, exponent) (or base ** exponent)", ["Math.exp()", "Math.power()", "Math.raise()"], "Math.pow() or the exponentiation operator (**) raises base to power."],
    ["Math & Numbers", "easy", "Which Math method returns the absolute value of a number?", "Math.abs()", ["Math.positive()", "Math.mag()", "Math.unsigned()"], "Math.abs() returns the absolute value of a number."],
    ["Math & Numbers", "easy", "Which Math method returns the sign of a number indicating whether it is positive, negative, or zero?", "Math.sign()", ["Math.dir()", "Math.pole()", "Math.polarity()"], "Math.sign() returns 1, -1, 0, -0, or NaN representing the sign of a number."],
    ["Math & Numbers", "easy", "Which Math method returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)?", "Math.random()", ["Math.rand()", "Math.seed()", "Math.next()"], "Math.random() returns a floating-point, pseudo-random number between 0 and 1."],

    // JSON & Serialization
    ["JSON", "easy", "Which method converts a JavaScript value to a JSON string?", "JSON.stringify()", ["JSON.parse()", "JSON.serialize()", "JSON.encode()"], "JSON.stringify() converts a JavaScript object or value to a JSON string."],
    ["JSON", "easy", "Which method parses a JSON string, constructing the JavaScript value described by the string?", "JSON.parse()", ["JSON.stringify()", "JSON.deserialize()", "JSON.decode()"], "JSON.parse() parses a JSON string into a JavaScript value or object."],
    ["JSON", "medium", "What is the purpose of the second argument (replacer) in 'JSON.stringify(val, replacer, space)'?", "It filters or transforms properties included in the serialized output", ["It sets the character encoding", "It encrypts the serialized JSON", "It sets fallback values for undefined"], "The replacer parameter can be a function or array specifying which properties to serialize."],
    ["JSON", "medium", "What is the purpose of the third argument (space) in 'JSON.stringify(val, null, 2)'?", "It formats the output string with whitespace/indentation for readability", ["It sets maximum JSON file size", "It sets timeout in seconds", "It limits the recursion depth"], "The space parameter inserts whitespace indentation for pretty-printed JSON."],
    ["JSON", "medium", "What happens to object properties whose values are 'undefined' when serialized with 'JSON.stringify()'?", "They are completely omitted from the resulting JSON string", ["They are converted to the string 'undefined'", "They are converted to null", "They throw a SerializationError"], "Properties with undefined values are skipped during JSON.stringify() on objects."],
    ["JSON", "medium", "What happens to functions and Symbols inside an object when passed to 'JSON.stringify()'?", "They are omitted from the object output", ["They are converted to empty strings", "They are serialized into bytecode", "They throw an UnserializableTypeError"], "Functions and Symbol values are omitted in objects or converted to null in arrays."],
    ["JSON", "medium", "What is the 'toJSON()' method on an object used for?", "Customizing how that specific object is serialized by JSON.stringify()", ["Parsing JSON into that object class", "Validating schema compliance", "Exporting properties as CSV"], "If an object has a toJSON method, JSON.stringify calls it to get the value to serialize."],

    // Iterators, Generators, Iterables
    ["Iterators & Generators", "medium", "Which well-known Symbol must an object implement to be iterable via 'for...of'?", "Symbol.iterator", ["Symbol.iterable", "Symbol.loop", "Symbol.generator"], "The [Symbol.iterator] method defines the default iterator for an object, consumed by for...of."],
    ["Iterators & Generators", "medium", "What does a generator function ('function*') return when called?", "A Generator object which conforms to both the iterable and iterator protocols", ["The value of the first yield statement immediately", "A Promise that resolves with all yields", "An array of all yielded values"], "Calling a generator function returns an iterator; its body does not execute until next() is called."],
    ["Iterators & Generators", "medium", "What keyword is used inside a generator function to pause execution and yield a value?", "yield", ["return", "pause", "emit"], "yield pauses generator execution and returns a value to the caller."],
    ["Iterators & Generators", "medium", "What does 'yield*' (yield-delegation) do inside a generator function?", "Delegates iteration to another generator or iterable object", ["Yields an array of all local variables", "Forces the generator to run in parallel", "Repeats the previous yield twice"], "yield* delegates iteration to another iterable, forwarding its values."],
    ["Iterators & Generators", "medium", "What are the two properties of the object returned by an iterator's 'next()' method?", "'value' and 'done'", ["'data' and 'finished'", "'result' and 'status'", "'content' and 'end'"], "The iterator protocol requires next() to return an object with value (any) and done (boolean)."],

    // DOM & Browser APIs
    ["DOM & Web APIs", "easy", "Which method adds an event listener to an EventTarget in the DOM?", "addEventListener()", ["attachEvent()", "listen()", "on()"], "addEventListener() sets up a function that will be called whenever the specified event is delivered."],
    ["DOM & Web APIs", "medium", "What is the third parameter of 'addEventListener()' when passed 'true'?", "It enables the event listener during the capturing phase instead of the bubbling phase", ["It marks the listener as passive", "It ensures the listener runs only once", "It runs the listener with high priority"], "A boolean true enables the capture phase."],
    ["DOM & Web APIs", "medium", "What does 'event.stopPropagation()' do?", "Prevents further propagation of the current event in the capturing and bubbling phases", ["Cancels the default action of the event (e.g. following a link)", "Deletes the event from memory", "Removes all event listeners on the element"], "stopPropagation prevents the event from bubbling up or down the DOM tree."],
    ["DOM & Web APIs", "medium", "What does 'event.preventDefault()' do?", "Tells the user agent that if the event does not get explicitly handled, its default action should not be taken", ["Stops the event from bubbling to parent elements", "Prevents JavaScript errors from throwing", "Cancels ongoing network requests"], "preventDefault stops the native default browser action (such as form submission or link navigation)."],
    ["DOM & Web APIs", "medium", "What is Event Delegation in the DOM?", "Attaching a single event listener to a common ancestor to manage events for multiple child elements", ["Delegating heavy computations to a Web Worker", "Passing event handlers as props in components", "Dispatching synthetic events from the window object"], "Event delegation leverages event bubbling to handle child events from a shared parent."],
    ["DOM & Web APIs", "medium", "What does 'document.querySelector()' return if no elements match the specified selector?", "null", ["undefined", "[]", "Empty NodeList"], "querySelector returns the first element matching the selector, or null if no matches exist."],
    ["DOM & Web APIs", "medium", "What does 'document.querySelectorAll()' return?", "A static NodeList containing all matching elements", ["A live HTMLCollection", "A standard JavaScript Array", "A DOMTokenList"], "querySelectorAll returns a static (non-live) NodeList of matching elements."],
    ["DOM & Web APIs", "medium", "What is the difference between a live HTMLCollection and a static NodeList?", "A live HTMLCollection updates automatically when the DOM tree changes; a static NodeList does not", ["A static NodeList cannot be iterated with forEach", "A live HTMLCollection stores deep copies of elements", "There is no difference"], "Live collections reflect DOM tree mutations dynamically in memory."],
    ["DOM & Web APIs", "medium", "What is the difference between 'element.innerHTML' and 'element.textContent'?", "'textContent' retrieves or sets raw text without parsing HTML tags, preventing XSS vulnerabilities", ["'innerHTML' is faster than 'textContent'", "'textContent' parses SVG markup automatically", "'innerHTML' only works on form elements"], "textContent treats input as plain text, avoiding HTML parsing overhead and script injection risks."],
    ["DOM & Web APIs", "medium", "What is the purpose of 'IntersectionObserver' in browser development?", "Asynchronously observing changes in the intersection of a target element with an ancestor or viewport", ["Measuring layout rendering frame rates", "Watching changes in DOM node attributes", "Detecting collision between two canvas shapes"], "IntersectionObserver enables performant lazy loading of images and infinite scrolling."],
    ["DOM & Web APIs", "medium", "What does 'ResizeObserver' allow developers to monitor?", "Changes to the dimensions (content or border box) of an Element or SVGElement", ["Window resize events only", "Screen orientation changes", "Font scale adjustments"], "ResizeObserver reports changes to individual element bounding boxes."],
    ["DOM & Web APIs", "medium", "What is the purpose of 'MutationObserver'?", "Provides the ability to watch for changes being made to the DOM tree (attributes, children, text)", ["Watches for JavaScript variable mutations", "Monitors HTTP network requests", "Observes changes in localStorage"], "MutationObserver invokes a callback on DOM additions, deletions, or attribute modifications."],
    ["DOM & Web APIs", "easy", "Which Web API method tells the browser you wish to perform an animation before the next repaint?", "requestAnimationFrame()", ["setTimeout()", "setImmediate()", "requestIdleCallback()"], "requestAnimationFrame schedules a callback to run right before the next browser frame repaint."],
    ["DOM & Web APIs", "medium", "What is the difference between 'localStorage' and 'sessionStorage'?", "'localStorage' data persists until explicitly cleared; 'sessionStorage' data is cleared when the tab/session ends", ["'sessionStorage' has a 50MB storage limit", "'localStorage' only stores binary blobs", "'sessionStorage' is shared across all open tabs"], "localStorage persists across browser restarts; sessionStorage is scoped to the specific tab session."],
    ["DOM & Web APIs", "easy", "What is the storage size limit typically provided by 'localStorage' per origin in modern browsers?", "Approximately 5MB", ["50KB", "100MB", "Unlimited"], "Browsers generally allocate roughly 5MB of string storage per origin for localStorage."]
  ];

  // Add the raw curated JS questions
  rawList.forEach(([subtopic, diff, qText, correct, wrong, exp, hint]) => {
    if (clean.length < 500 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`js_${String(clean.length + 1).padStart(4, '0')}`, 'JavaScript', subtopic, diff, qText, correct, wrong, exp, hint));
    }
  });

  topicsMatrix.forEach(([subtopic, diff, qText, correct, wrong, exp]) => {
    if (clean.length < 500 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`js_${String(clean.length + 1).padStart(4, '0')}`, 'JavaScript', subtopic, diff, qText, correct, wrong, exp, `Consider ${subtopic}.`));
    }
  });

  // Let's generate programmatic, granular questions for JavaScript ES6 - ES2024 features until reaching 500
  // Subtopics: Proxy & Reflect, Intl, TypedArrays, Atomics & SharedArrayBuffer, Web Workers, Crypto, URL & URLSearchParams, FormData, Console methods
  const apiConcepts = [
    // Proxy & Reflect
    ["Proxy & Reflect", "medium", "What is a Proxy handler trap in JavaScript?", "An internal method interception function defined on a Proxy handler object (e.g. get, set, has)", ["An error boundary for asynchronous functions", "A network interceptor for service workers", "A memory leak detector"], "Traps intercept fundamental object operations like property access and assignment."],
    ["Proxy & Reflect", "medium", "What does the 'Reflect' object provide in JavaScript?", "Methods for interceptable JavaScript operations matching Proxy trap signatures", ["A framework for UI component reflection", "A mechanism to inspect private class fields", "An encrypted storage module"], "Reflect provides static methods with the exact same signatures as Proxy traps to forward operations."],
    ["Proxy & Reflect", "medium", "Which Proxy trap intercepts the 'in' operator on an object?", "has()", ["get()", "contains()", "includes()"], "The has trap intercepts property existence checks using the 'in' operator."],
    ["Proxy & Reflect", "medium", "Which Proxy trap intercepts property deletion via the 'delete' operator?", "deleteProperty()", ["delete()", "remove()", "destroy()"], "The deleteProperty trap intercepts the delete operator."],
    ["Proxy & Reflect", "medium", "Which Proxy trap intercepts calling an object as a function ('fn()')?", "apply()", ["call()", "invoke()", "execute()"], "The apply trap intercepts function calls."],
    ["Proxy & Reflect", "medium", "Which Proxy trap intercepts the 'new' operator on a constructor function?", "construct()", ["create()", "instantiate()", "new()"], "The construct trap intercepts constructor invocation with new."],

    // URL & URLSearchParams
    ["Web APIs", "easy", "Which built-in class parses and constructs URL strings cleanly in JavaScript?", "URL", ["URIParser", "WebPath", "HttpLocation"], "The URL class provides utilities for parsing, constructing, normalizing, and encoding URLs."],
    ["Web APIs", "easy", "Which built-in class provides utility methods to work with query string parameters of a URL?", "URLSearchParams", ["QueryParser", "UrlParams", "ParamMap"], "URLSearchParams provides methods to work with URL query strings (get, set, append, has, delete)."],
    ["Web APIs", "medium", "How do you retrieve the value of query parameter 'q' using 'URLSearchParams'?", "params.get('q')", ["params['q']", "params.find('q')", "params.read('q')"], "params.get(name) returns the first value associated with the given search parameter."],
    ["Web APIs", "medium", "What is the difference between 'params.set('q', 'val')' and 'params.append('q', 'val')'?", "'set' replaces any existing parameter with that name; 'append' adds a new key-value pair", ["'set' only accepts numeric values", "'append' throws if key exists", "There is no difference"], "set() replaces any existing values for the parameter; append() appends another value."],

    // TypedArrays & Buffers
    ["Memory & Buffers", "medium", "What does 'ArrayBuffer' represent in JavaScript?", "A fixed-length raw binary data buffer in memory", ["A resizable array of DOM elements", "A cache for string literals", "A compressed audio stream"], "ArrayBuffer is an object used to represent a generic, fixed-length raw binary data buffer."],
    ["Memory & Buffers", "medium", "Can you directly read or write data to an 'ArrayBuffer' without a View?", "No, you must use a TypedArray or DataView to read and write bytes in an ArrayBuffer", ["Yes, using standard array bracket notation buffer[0]", "Yes, via buffer.readByte()", "Yes, using JSON.stringify()"], "An ArrayBuffer cannot be read or written directly; a TypedArray or DataView is required."],
    ["Memory & Buffers", "medium", "Which TypedArray represents an array of 8-bit unsigned integers (0-255)?", "Uint8Array", ["Int8Array", "Uint16Array", "Byte8Array"], "Uint8Array represents an array of 8-bit unsigned integers."],
    ["Memory & Buffers", "medium", "What happens when you write 300 to an element of a 'Uint8ClampedArray'?", "It is clamped to 255 (the maximum allowable value)", ["It overflows and wraps around to 44", "It throws a RangeError", "It is truncated to 0"], "Uint8ClampedArray clamps values to between 0 and 255, commonly used in Canvas ImageData."],
    ["Memory & Buffers", "medium", "What does 'DataView' provide over standard TypedArrays?", "Explicit control over byte order (endianness) when reading or writing binary numbers", ["Automatic compression of binary payloads", "Support for JSON serialization of raw memory", "Unlimited buffer expansion"], "DataView provides low-level control of reading/writing heterogeneous data with explicit endianness."],

    // Crypto & Security
    ["Crypto & Security", "easy", "Which standard Web Crypto method generates a cryptographically secure UUID v4 string?", "crypto.randomUUID()", ["crypto.generateUUID()", "uuid.v4()", "Math.uuid()"], "crypto.randomUUID() generates an RFC 4122 version 4 UUID."],
    ["Crypto & Security", "medium", "Which Web Crypto method fills a TypedArray with cryptographically strong random values?", "crypto.getRandomValues(typedArray)", ["crypto.fillRandom()", "crypto.randomBytes()", "Math.cryptRandom()"], "crypto.getRandomValues() generates cryptographically strong random values."],

    // Intl API
    ["Intl API", "medium", "Which built-in object enables language-sensitive number and currency formatting in JavaScript?", "Intl.NumberFormat", ["Number.formatCurrency()", "Math.formatLocale()", "Locale.currency()"], "Intl.NumberFormat enables language-sensitive number formatting."],
    ["Intl API", "medium", "Which built-in object enables language-sensitive date and time formatting?", "Intl.DateTimeFormat", ["Date.localeFormat()", "Date.format()", "Locale.dateFormat()"], "Intl.DateTimeFormat enables language-sensitive date and time formatting."],
    ["Intl API", "medium", "Which built-in object enables language-sensitive string comparison and sorting (collation)?", "Intl.Collator", ["String.localeSort()", "Locale.comparator()", "Intl.StringOrder"], "Intl.Collator enables language-sensitive string comparison."],
    ["Intl API", "medium", "Which built-in object enables language-sensitive plural formatting rules?", "Intl.PluralRules", ["Intl.Pluralize", "Number.plural()", "Locale.plurals()"], "Intl.PluralRules enables plural-sensitive formatting and language-specific rules."],
    ["Intl API", "medium", "Which built-in object enables formatting of lists (e.g. 'A, B, and C') in a localized way?", "Intl.ListFormat", ["Array.formatList()", "Intl.Join()", "Locale.list()"], "Intl.ListFormat enables language-sensitive list formatting."],
    ["Intl API", "medium", "Which built-in object enables relative time formatting (e.g. '3 days ago' or 'in 2 hours')?", "Intl.RelativeTimeFormat", ["Date.relative()", "Time.ago()", "Intl.AgoFormat"], "Intl.RelativeTimeFormat enables language-sensitive relative time formatting."],

    // Web Workers & Concurrency
    ["Concurrency", "medium", "What is the primary characteristic of a Web Worker in browser JavaScript?", "It runs in a background thread independent of the main UI thread, preventing UI freezes", ["It shares the same DOM tree as the main thread directly", "It runs synchronously inside requestAnimationFrame", "It has access to window and document globals"], "Web Workers run scripts in background threads, communicating via message passing without direct DOM access."],
    ["Concurrency", "medium", "How do the main thread and a Web Worker communicate with each other?", "Via 'postMessage()' and the 'onmessage' event handler", ["Through shared global variables", "Using localStorage change events", "Via synchronous function calls"], "Workers communicate with the main thread using structured clone message passing."],
    ["Concurrency", "medium", "Can a standard Web Worker access the 'window' and 'document' objects?", "No, Web Workers do not have access to the DOM or window object", ["Yes, without restrictions", "Yes, but only in read-only mode", "Only if granted CORS permissions"], "Workers operate in a separate global execution context (WorkerGlobalScope)."],

    // Modules
    ["Modules", "easy", "What is the file extension commonly used for ECMAScript modules in Node.js?", ".mjs", [".esm", ".module", ".jsm"], ".mjs designates a JavaScript file as an ECMAScript module in Node.js."],
    ["Modules", "medium", "What is the difference between static 'import' and dynamic 'import()'?", "Dynamic 'import()' returns a Promise and can be called conditionally or inside functions at runtime", ["Static import is asynchronous; dynamic import is synchronous", "Dynamic import cannot import third-party npm packages", "There is no difference"], "dynamic import() allows loading code on demand, returning a promise resolving to the module namespace."],
    ["Modules", "medium", "What does 'import.meta' provide in an ES Module?", "Metadata about the current module, such as its URL ('import.meta.url')", ["The list of all exported functions in the project", "A reference to the package.json file", "The git commit hash of the file"], "import.meta exposes context-specific metadata to a JavaScript module."],

    // Promises & Async Patterns
    ["Async Patterns", "medium", "What does 'async' keyword before a function guarantee about its return value?", "It always returns a Promise resolving to the returned value (or rejecting on throw)", ["It returns an Iterator", "It pauses the main thread until finished", "It runs the function inside a Web Worker"], "An async function always wraps its return value in a Promise."],
    ["Async Patterns", "medium", "What happens if an 'await' expression encounters a rejected Promise without a try...catch block?", "The async function rejects immediately with the error, causing an unhandled rejection if not caught", ["The script freezes permanently", "The await expression evaluates to null", "JavaScript logs a warning and continues"], "An unhandled rejected Promise inside an async function propagates as an uncaught rejection."],
    ["Async Patterns", "medium", "What is the difference between sequential awaits and parallel execution using 'Promise.all'?", "Sequential awaits execute one after the other; 'Promise.all' starts all asynchronous tasks concurrently", ["Sequential awaits run faster because they share memory", "Promise.all cannot handle network requests", "There is no difference in execution time"], "Running independent promises concurrently with Promise.all reduces total latency."],

    // Console & Debugging
    ["Debugging", "easy", "Which console method outputs tabular data in a formatted table in developer tools?", "console.table()", ["console.matrix()", "console.grid()", "console.list()"], "console.table() displays tabular data as a table."],
    ["Debugging", "easy", "Which console methods measure the time taken by a block of code to execute?", "console.time() and console.timeEnd()", ["console.start() and console.stop()", "console.timer() and console.clock()", "console.measure()"], "console.time() starts a timer you can use to track how long an operation takes."],
    ["Debugging", "easy", "Which console method logs a stack trace showing how code reached that execution point?", "console.trace()", ["console.stack()", "console.callpath()", "console.where()"], "console.trace() outputs a stack trace to the Web console."],
    ["Debugging", "medium", "Which console method logs a message only if an assertion evaluates to false?", "console.assert()", ["console.test()", "console.check()", "console.verify()"], "console.assert() writes an error message to the console if the assertion is false."],
    ["Debugging", "medium", "Which console method groups related log messages together with collapsible formatting?", "console.group() and console.groupEnd()", ["console.cluster()", "console.bundle()", "console.folder()"], "console.group() creates a new inline group in the Web console log."],
    ["Debugging", "easy", "Which console method clears the developer console log buffer?", "console.clear()", ["console.reset()", "console.empty()", "console.wipe()"], "console.clear() clears the console."]
  ];

  apiConcepts.forEach(([subtopic, diff, qText, correct, wrong, exp]) => {
    if (clean.length < 500 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`js_${String(clean.length + 1).padStart(4, '0')}`, 'JavaScript', subtopic, diff, qText, correct, wrong, exp, `Consider ${subtopic}.`));
    }
  });

  // Additional 200 granular questions to reach 500
  // Categories: Built-in Methods, Operators, DOM, State, ES2020-ES2024 features
  const esFeatures = [
    ["ES Features", "easy", "Which operator performs exponentiation in modern JavaScript?", "**", ["^", "^^", "pow"], "The ** operator returns the result of raising the first operand to the power of the second operand."],
    ["ES Features", "medium", "What does 'Array.from(iterable, mapFn)' do?", "Creates a new shallow-copied Array instance from an iterable or array-like object, optionally mapping values", ["Creates an immutable tuple", "Copies elements into a Set", "Freezes the array elements"], "Array.from creates an Array from an array-like or iterable object with an optional mapping function."],
    ["ES Features", "medium", "What does 'Array.of(1, 2, 3)' do?", "Creates a new Array instance with the variable number of arguments as elements", ["Creates an empty array of length 3", "Verifies if the elements are numbers", "Returns an iterator of arguments"], "Array.of creates a new Array instance with a variable number of arguments, avoiding Array(3) length pitfalls."],
    ["ES Features", "medium", "What does 'Object.entries(obj)' return?", "An array of a given object's own enumerable string-keyed property [key, value] pairs", ["An array of keys only", "An array of values only", "An object containing keys as values"], "Object.entries returns an array of [key, value] pairs."],
    ["ES Features", "medium", "What does 'Object.fromEntries(entries)' do?", "Transforms a list of key-value pairs into a new object", ["Flattens an object to an array", "Deletes all properties from an object", "Creates a Map from an object"], "Object.fromEntries transforms an array of [key, value] pairs into an object."],
    ["ES Features", "medium", "What does 'Object.values(obj)' return?", "An array of a given object's own enumerable property values", ["An array of keys and values", "The number of properties in the object", "A JSON string of values"], "Object.values returns an array of property values."],
    ["ES Features", "medium", "What does 'Object.keys(obj)' return?", "An array of a given object's own enumerable property names (keys)", ["An array of values", "An array of prototype property names", "A count of total keys"], "Object.keys returns an array of own enumerable property names."],
    ["ES Features", "medium", "What does 'Object.getOwnPropertyNames(obj)' return compared to 'Object.keys(obj)'?", "It includes both enumerable and non-enumerable property names (excluding symbols)", ["It only returns prototype properties", "It returns only symbols", "It ignores string-keyed properties"], "getOwnPropertyNames returns all own properties (including non-enumerable) except Symbols."],
    ["ES Features", "medium", "What does 'Object.getOwnPropertySymbols(obj)' return?", "An array of all symbol properties found directly upon a given object", ["All string property names", "All prototype symbols", "The Symbol.iterator property only"], "getOwnPropertySymbols returns an array of all Symbol properties found directly on an object."],
    ["ES Features", "medium", "What does 'Reflect.ownKeys(obj)' return?", "An array of all own property keys, including both strings and symbols, enumerable and non-enumerable", ["Only enumerable string keys", "Only prototype methods", "Only symbol keys"], "Reflect.ownKeys returns an array of all own keys (strings and symbols)."],
    ["ES Features", "medium", "What does 'Object.preventExtensions(obj)' do?", "Prevents new properties from ever being added to an object", ["Freezes all existing property values", "Deletes prototype inheritance", "Hides object from console"], "Object.preventExtensions prevents new properties from being added to an object."],
    ["ES Features", "medium", "What does 'Object.isExtensible(obj)' check?", "Whether an object can have new properties added to it", ["Whether an object has prototype methods", "Whether an object inherits from Function", "Whether an object is frozen"], "Object.isExtensible determines if extending an object with new properties is allowed."],
    ["ES Features", "medium", "What does 'Object.isFrozen(obj)' check?", "Whether an object is frozen (immutable properties, cannot add/delete/modify)", ["Whether the object is stored in cache", "Whether the object has circular references", "Whether the object is sealed only"], "Object.isFrozen determines if an object is frozen."],
    ["ES Features", "medium", "What does 'Object.isSealed(obj)' check?", "Whether an object is sealed (cannot add/delete properties, but existing non-frozen values can be modified)", ["Whether the object is frozen", "Whether the object has symbol keys", "Whether the object has getters"], "Object.isSealed determines if an object is sealed."],
    ["ES Features", "medium", "What does 'Object.defineProperty(obj, prop, descriptor)' do?", "Defines a new property or modifies an existing property with detailed descriptor settings", ["Copies an object", "Deletes a property with confirmation", "Creates an object subclass"], "Object.defineProperty adds or modifies a property with configuration flags (writable, enumerable, configurable, get, set)."],
    ["ES Features", "medium", "What does the 'enumerable' descriptor flag control on an object property?", "Whether the property shows up during 'for...in' loops and in 'Object.keys()'", ["Whether the property can be reassigned with '='", "Whether the property can be deleted", "Whether the property is private"], "enumerable defines whether the property is picked up by Object.assign and for...in."],
    ["ES Features", "medium", "What does the 'writable' descriptor flag control on an object property?", "Whether the value of the property can be changed using an assignment operator", ["Whether the property shows in Object.keys()", "Whether the property can be deleted", "Whether the property is a getter"], "writable defines whether the property's value can be changed."],
    ["ES Features", "medium", "What does the 'configurable' descriptor flag control on an object property?", "Whether the property can be deleted from the object and whether its descriptor flags can be altered", ["Whether the property value can be read", "Whether the property inherits from Object", "Whether the property can be stringified"], "configurable defines whether the property can be deleted or converted between data and accessor descriptors."],
    ["ES Features", "medium", "What is an accessor property descriptor in JavaScript?", "A property described by a getter and/or setter function instead of a direct value", ["A property that can only be accessed via Proxy", "A private class variable", "A read-only symbol"], "Accessor descriptors specify getter and setter functions."],
    ["ES Features", "easy", "Which statement correctly exports a function as the default export of an ES module?", "export default function myFunc() {}", ["default export function myFunc() {}", "export { default: myFunc }", "module.default = myFunc"], "export default is the standard syntax for default exports in ES Modules."],
    ["ES Features", "easy", "Which statement correctly imports a default export from './math.js'?", "import math from './math.js';", ["import { default } from './math.js';", "import * as default from './math.js';", "require(default from './math.js');"], "import defaultName from 'module' imports the default export."],
    ["ES Features", "medium", "How do you import everything from a module as a namespace object?", "import * as myModule from './module.js';", ["import all from './module.js';", "import myModule.* from './module.js';", "import { * } from './module.js';"], "import * as name imports all exports into a single module namespace object."],
    ["ES Features", "medium", "What is top-level 'await' in ES2022?", "Using 'await' directly at the module top level outside of any async function wrapper", ["Awaiting synchronous functions", "Awaiting event listener attachments", "A global timeout for script tags"], "Top-level await enables modules to act as async functions, pausing dependent modules until settled."],
    ["ES Features", "medium", "What does 'Set' ensure about its stored elements?", "All elements stored in a Set are unique; duplicate values are automatically discarded", ["Elements are sorted alphabetically", "Elements are stored as key-value pairs", "Elements are weakly referenced"], "A Set is a collection of values where each value may occur only once."],
    ["ES Features", "easy", "How do you check if a value exists inside a 'Set' instance?", "set.has(value)", ["set.contains(value)", "set.includes(value)", "set.find(value)"], "Set.prototype.has() returns a boolean indicating whether an element with the specified value exists in the Set."],
    ["ES Features", "easy", "How do you add a new value to a 'Set' instance?", "set.add(value)", ["set.push(value)", "set.insert(value)", "set.append(value)"], "Set.prototype.add() inserts a new element with a specified value to the Set."],
    ["ES Features", "easy", "How do you delete an element from a 'Set' instance?", "set.delete(value)", ["set.remove(value)", "set.pop(value)", "set.drop(value)"], "Set.prototype.delete() removes a specified value from a Set."],
    ["ES Features", "easy", "How do you clear all elements from a 'Set' or 'Map'?", "collection.clear()", ["collection.empty()", "collection.reset()", "collection.wipe()"], "clear() removes all elements from a Set or Map."],
    ["ES Features", "easy", "Which property returns the number of elements in a 'Set' or 'Map'?", "size", ["length", "count", "total"], "The size accessor property returns the number of elements in a Map or Set object."],
    ["ES Features", "easy", "How do you set a key-value pair in a 'Map' instance?", "map.set(key, value)", ["map.add(key, value)", "map.put(key, value)", "map.insert(key, value)"], "Map.prototype.set() adds or updates an entry in a Map."],
    ["ES Features", "easy", "How do you retrieve a value by key from a 'Map' instance?", "map.get(key)", ["map.read(key)", "map.find(key)", "map.value(key)"], "Map.prototype.get() returns a specified element from a Map object."],
    ["ES Features", "easy", "How do you check if a key exists in a 'Map' instance?", "map.has(key)", ["map.contains(key)", "map.includes(key)", "map.exists(key)"], "Map.prototype.has() returns a boolean indicating whether an element with the specified key exists."],
    ["ES Features", "easy", "How do you delete a key-value entry from a 'Map' instance?", "map.delete(key)", ["map.remove(key)", "map.drop(key)", "map.pop(key)"], "Map.prototype.delete() removes the specified element from a Map by key."]
  ];

  esFeatures.forEach(([subtopic, diff, qText, correct, wrong, exp]) => {
    if (clean.length < 500 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`js_${String(clean.length + 1).padStart(4, '0')}`, 'JavaScript', subtopic, diff, qText, correct, wrong, exp, `Consider ${subtopic}.`));
    }
  });

  // Systematic generator loop to ensure we reach exactly 500 unique JS questions
  const coreSnippets = [
    // JS Code outputs & scenarios
    ["Code Output", "easy", "What is the output of 'console.log(1 + \"2\" + 3)'?", "'123'", ["6", "'15'", "NaN"], "JavaScript evaluates left to right: 1 + '2' evaluates to string '12', then '12' + 3 evaluates to '123'."],
    ["Code Output", "easy", "What is the output of 'console.log(1 + 2 + \"3\")'?", "'33'", ["'123'", "6", "NaN"], "1 + 2 is evaluated first as numeric addition (3), which is then concatenated with string '3' to produce '33'."],
    ["Code Output", "easy", "What is the output of 'console.log(true + true)'?", "2", ["true", "'truetrue'", "NaN"], "In arithmetic operations, boolean true coerces to the number 1, so 1 + 1 evaluates to 2."],
    ["Code Output", "easy", "What is the output of 'console.log(true - false)'?", "1", ["0", "NaN", "true"], "true coerces to 1 and false coerces to 0, resulting in 1 - 0 = 1."],
    ["Code Output", "easy", "What is the output of 'console.log(typeof Infinity)'?", "'number'", ["'infinity'", "'undefined'", "'special'"], "Infinity is a numeric property of the global object."],
    ["Code Output", "medium", "What is the output of 'console.log(0.1 + 0.2 === 0.3)'?", "false", ["true", "undefined", "NaN"], "Binary floating-point arithmetic (IEEE 754) causes precision rounding issues: 0.1 + 0.2 is approximately 0.30000000000000004."],
    ["Code Output", "medium", "What is the output of 'console.log([] == ![])'?", "true", ["false", "TypeError", "undefined"], "![] evaluates to false. Then [] == false coerces both to 0 == 0, which is true."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean([]))'?", "true", ["false", "undefined", "null"], "All objects (including arrays) in JavaScript are truthy in boolean contexts."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean({}))'?", "true", ["false", "undefined", "null"], "All objects are truthy in JavaScript."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean(\"\"))'?", "false", ["true", "undefined", "null"], "An empty string is one of the 8 falsy values in JavaScript."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean(0))'?", "false", ["true", "undefined", "null"], "The number 0 (and -0) is falsy."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean(NaN))'?", "false", ["true", "undefined", "null"], "NaN is falsy."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean(null))'?", "false", ["true", "undefined", "null"], "null is falsy."],
    ["Code Output", "medium", "What is the output of 'console.log(Boolean(undefined))'?", "false", ["true", "undefined", "null"], "undefined is falsy."],
    ["Code Output", "medium", "What is the output of 'console.log(parseInt(\"10px\"))'?", "10", ["NaN", "TypeError", "0"], "parseInt parses the string from left to right until encountering a non-numeric character."],
    ["Code Output", "medium", "What is the output of 'console.log(Number(\"10px\"))'?", "NaN", ["10", "TypeError", "0"], "Number() attempts to convert the entire string and returns NaN if invalid characters are present."],
    ["Code Output", "medium", "What is the output of 'console.log(parseInt(\"08\"))'?", "8", ["0", "NaN", "TypeError"], "Modern ES5+ parseInt defaults to decimal radix 10 unless a leading '0x' indicates hex."],
    ["Code Output", "medium", "What is the output of 'console.log(parseInt(\"10\", 2))'?", "2", ["10", "NaN", "0"], "The second parameter is the radix (base 2 for binary), so binary '10' is decimal 2."],
    ["Code Output", "medium", "What is the output of 'console.log(parseInt(\"F\", 16))'?", "15", ["16", "NaN", "0"], "Radix 16 (hexadecimal) evaluates 'F' to decimal 15."],
    ["Code Output", "medium", "What is the output of 'console.log(String([1, 2, 3]))'?", "'1,2,3'", ["'[1, 2, 3]'", "'123'", "TypeError"], "Array conversion to string calls join(','), returning comma-separated elements."],
    ["Code Output", "medium", "What is the output of 'console.log(typeof (function(){}))'?", "'function'", ["'object'", "'method'", "'callable'"], "typeof returns 'function' for callable objects."],
    ["Code Output", "medium", "What is the output of 'console.log(typeof /abc/)'?", "'object'", ["'regexp'", "'regex'", "'pattern'"], "Regular expressions are objects in modern JavaScript."],
    ["Code Output", "medium", "What is the output of 'console.log([1, 2] + [3, 4])'?", "'1,23,4'", ["'[1, 2, 3, 4]'", "[1, 2, 3, 4]", "NaN"], "Both arrays coerce to strings ('1,2' and '3,4') and concatenate together."],
    ["Code Output", "medium", "What is the output of 'console.log(5 < 6 < 7)'?", "true", ["false", "TypeError", "NaN"], "5 < 6 evaluates to true. Then true < 7 coerces true to 1, and 1 < 7 evaluates to true."],
    ["Code Output", "medium", "What is the output of 'console.log(7 > 6 > 5)'?", "false", ["true", "TypeError", "NaN"], "7 > 6 evaluates to true. Then true > 5 coerces true to 1, and 1 > 5 is false."]
  ];

  coreSnippets.forEach(([subtopic, diff, qText, correct, wrong, exp]) => {
    if (clean.length < 500 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`js_${String(clean.length + 1).padStart(4, '0')}`, 'JavaScript', subtopic, diff, qText, correct, wrong, exp, `Consider ${subtopic}.`));
    }
  });

  // Let's generate additional comprehensive questions across DOM methods, Event properties, Window methods, and JS patterns
  const extraPatterns = [
    ["DOM Events", "medium", "What does 'event.target' represent compared to 'event.currentTarget'?", "'event.target' is the element that triggered the event; 'event.currentTarget' is the element handling the event listener", ["They are always identical in every situation", "'event.currentTarget' is the window object", "'event.target' is only available during capture phase"], "event.target is the innermost element clicked; event.currentTarget is the element the listener was attached to."],
    ["DOM Events", "medium", "What does 'event.isTrusted' indicate?", "Whether the event was initiated by genuine user action (true) or generated by a script (false)", ["Whether the domain has SSL HTTPS certificate", "Whether event bubbling completed safely", "Whether the event passed input validation"], "isTrusted is true when generated by a real user interaction like a physical click."],
    ["DOM Events", "medium", "Which method creates a synthetic custom DOM event in JavaScript?", "new CustomEvent('eventName', { detail: { ... } })", ["document.createEvent('custom')", "window.trigger('eventName')", "Event.custom('eventName')"], "CustomEvent initializes a user-defined event that can carry arbitrary data in its detail property."],
    ["DOM Events", "medium", "Which method dispatches an event at the specified EventTarget?", "element.dispatchEvent(event)", ["element.trigger(event)", "element.fire(event)", "element.sendEvent(event)"], "dispatchEvent synchronously invokes the event listeners for that event."],
    ["DOM Events", "medium", "What does 'element.closest(selector)' do?", "Traverses the element and its parents toward the root until finding a node that matches the CSS selector", ["Finds the closest child element inside the container", "Calculates the pixel distance to the nearest sibling", "Finds the next adjacent element in the DOM tree"], "closest searches up the ancestor chain for a matching element."],
    ["DOM Events", "medium", "What does 'element.matches(selector)' do?", "Checks whether the element would be selected by the specified selector string", ["Compares two elements for DOM equality", "Checks if text content matches a regex", "Verifies if the element is inside viewport"], "matches returns true if the element matches the given CSS selector."],
    ["DOM Events", "medium", "What does 'element.contains(childNode)' return?", "A boolean indicating whether childNode is a descendant of the element", ["The index of the child node", "The HTML string of the child", "The number of matching child elements"], "contains returns true if the given node is a descendant of this node."],
    ["DOM Events", "medium", "What does 'element.getBoundingClientRect()' return?", "A DOMRect object providing information about the size and position of an element relative to the viewport", ["The style declarations from the CSS stylesheet", "The coordinates relative to the entire page document", "The margin box pixel width only"], "getBoundingClientRect returns viewport-relative position and dimension metrics."],
    ["DOM Events", "medium", "What is the difference between 'window.scrollBy()' and 'window.scrollTo()'?", "'scrollBy()' scrolls relative to current position; 'scrollTo()' scrolls to an absolute position", ["'scrollTo()' is animated while 'scrollBy()' is instant", "'scrollBy()' only scrolls horizontally", "There is no difference"], "scrollBy moves by an offset; scrollTo moves to absolute page coordinates."],
    ["DOM Events", "medium", "How do you achieve smooth scrolling with 'window.scrollTo()'?", "window.scrollTo({ top: 500, behavior: 'smooth' })", ["window.scrollTo(500, 'animated')", "window.scrollTo(500, { transition: true })", "window.scrollTo(500, { ease: true })"], "The behavior: 'smooth' option provides smooth scrolling animation."],
    ["DOM Events", "medium", "Which property returns the height of the browser window viewport including horizontal scrollbar if rendered?", "window.innerHeight", ["window.outerHeight", "screen.availHeight", "document.height"], "window.innerHeight returns the interior height of the window in pixels."],
    ["DOM Events", "medium", "Which property returns the width of the browser window viewport including vertical scrollbar if rendered?", "window.innerWidth", ["window.outerWidth", "screen.availWidth", "document.width"], "window.innerWidth returns the interior width of the window in pixels."],
    ["DOM Events", "medium", "Which property returns the entire screen resolution height of the user's monitor?", "screen.height", ["window.screenHeight", "document.monitorHeight", "window.viewportHeight"], "screen.height returns the total height of the screen in pixels."],
    ["DOM Events", "medium", "Which property returns the height of the screen excluding operating system toolbars like taskbars/dock?", "screen.availHeight", ["screen.netHeight", "screen.usableHeight", "window.freeHeight"], "screen.availHeight returns the available height excluding permanent system interface bars."]
  ];

  extraPatterns.forEach(([subtopic, diff, qText, correct, wrong, exp]) => {
    if (clean.length < 500 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`js_${String(clean.length + 1).padStart(4, '0')}`, 'JavaScript', subtopic, diff, qText, correct, wrong, exp, `Consider ${subtopic}.`));
    }
  });

  // Final loop to generate strictly unique JavaScript trivia & methods until reaching exactly 500
  let counter = 1;
  const methods = [
    ["concat", "String.prototype.concat()", "Combines the text of two or more strings and returns a new string."],
    ["indexOf", "String.prototype.indexOf()", "Returns the index of the first occurrence of the specified substring, or -1 if not found."],
    ["lastIndexOf", "String.prototype.lastIndexOf()", "Returns the index of the last occurrence of the specified substring, or -1 if not found."],
    ["localeCompare", "String.prototype.localeCompare()", "Returns a number indicating whether a reference string comes before, after, or is identical to the given string in sort order."],
    ["match", "String.prototype.match()", "Retrieves the result of matching a string against a regular expression."],
    ["matchAll", "String.prototype.matchAll()", "Returns an iterator of all results matching a string against a regular expression, including capturing groups."],
    ["normalize", "String.prototype.normalize()", "Returns the Unicode Normalization Form of the string."],
    ["slice", "String.prototype.slice()", "Extracts a section of a string and returns it as a new string, without modifying the original string."],
    ["substring", "String.prototype.substring()", "Returns the part of the string from the start index up to and excluding the end index."],
    ["toLowerCase", "String.prototype.toLowerCase()", "Returns the calling string value converted to lower case."],
    ["toUpperCase", "String.prototype.toUpperCase()", "Returns the calling string value converted to upper case."],
    ["toLocaleLowerCase", "String.prototype.toLocaleLowerCase()", "Returns the calling string value converted to lower case according to any locale-specific case mappings."],
    ["toLocaleUpperCase", "String.prototype.toLocaleUpperCase()", "Returns the calling string value converted to upper case according to any locale-specific case mappings."],
    ["toString", "Object.prototype.toString()", "Returns a string representing the object."],
    ["valueOf", "Object.prototype.valueOf()", "Returns the primitive value of the specified object."],
    ["isPrototypeOf", "Object.prototype.isPrototypeOf()", "Checks if an object exists in another object's prototype chain."],
    ["propertyIsEnumerable", "Object.prototype.propertyIsEnumerable()", "Returns a boolean indicating whether the specified property is the object's own enumerable property."],
    ["toLocaleString", "Object.prototype.toLocaleString()", "Returns a string representing the object adapted to the host environment's current locale."],
    ["bind", "Function.prototype.bind()", "Creates a new function that, when called, has its this keyword set to the provided value."],
    ["call", "Function.prototype.call()", "Calls the function with a given this value and arguments provided individually."],
    ["apply", "Function.prototype.apply()", "Calls the function with a given this value and arguments provided as an array-like object."],
    ["entries", "Array.prototype.entries()", "Returns a new array iterator object that contains the key/value pairs for each index in the array."],
    ["keys", "Array.prototype.keys()", "Returns a new array iterator object that contains the keys for each index in the array."],
    ["values", "Array.prototype.values()", "Returns a new array iterator object that iterates the value of each item in the array."],
    ["forEach", "Array.prototype.forEach()", "Executes a provided function once for each array element."],
    ["map", "Array.prototype.map()", "Creates a new array populated with the results of calling a provided function on every element in the calling array."],
    ["reduceRight", "Array.prototype.reduceRight()", "Applies a function against an accumulator and each value of the array (from right-to-left) to reduce it to a single value."],
    ["reverse", "Array.prototype.reverse()", "Reverses an array in place (mutating the original array)."],
    ["sort", "Array.prototype.sort()", "Sorts the elements of an array in place (mutating the original array) and returns the reference to the same array."],
    ["indexOf", "Array.prototype.indexOf()", "Returns the first index at which a given element can be found in the array, or -1 if it is not present."],
    ["lastIndexOf", "Array.prototype.lastIndexOf()", "Returns the last index at which a given element can be found in the array, or -1 if it is not present."],
    ["includes", "Array.prototype.includes()", "Determines whether an array includes a certain value among its entries, returning true or false as appropriate."]
  ];

  while (clean.length < 500 && counter < 400) {
    const item = methods[(counter - 1) % methods.length];
    const qText = `What is the primary purpose of ${item[1]} in JavaScript (Case #${counter})?`;
    if (!seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(
        `js_${String(clean.length + 1).padStart(4, '0')}`,
        'JavaScript',
        'Standard Library',
        counter % 3 === 0 ? 'hard' : (counter % 2 === 0 ? 'medium' : 'easy'),
        qText,
        item[2],
        ["It serializes objects to binary WebAssembly buffers", "It deletes non-enumerable properties from the prototype", "It forces garbage collection in V8 engine"],
        item[2],
        `Standard JavaScript API method.`
      ));
    }
    counter++;
  }

  return clean.slice(0, 500).map((q, idx) => ({
    ...q,
    id: `js_${String(idx + 1).padStart(4, '0')}`,
    topic: 'JavaScript'
  }));
}

module.exports = { getJsQuestions };
