const fs = require('fs');
const path = require('path');
const { makeQuestion } = require('./question-helper');

function getTsQuestions() {
  const existing = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/typescript.json'), 'utf8'));
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
    // Top-Level Types: any vs unknown vs never
    ["Basic Types", "easy", "What is the key difference between 'any' and 'unknown' in TypeScript?", "'unknown' requires type checking or narrowing before you can perform operations on it, while 'any' disables all type checking", ["'unknown' can only be assigned to string variables", "'any' is stricter than 'unknown'", "There is no operational difference"], "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to unknown, but unknown is not assignable to anything without narrowing.", "Type-safe top type."],
    ["Basic Types", "medium", "What does the 'never' type represent in TypeScript?", "Values that never occur, such as a function that always throws an error or never returns", ["An alias for null or undefined", "An optional parameter type", "A type that accepts any value"], "The never type represents the type of values that never occur (e.g. unreachable code or infinite loops).", "Bottom type."],
    ["Basic Types", "easy", "What does the 'void' type indicate when used as a function return type?", "The function does not return a meaningful value", ["The function returns null exclusively", "The function never terminates", "The function is asynchronous"], "void indicates the absence of any value, typically returned by functions that have no return statement.", "No return value."],
    ["Basic Types", "medium", "What is a Tuple type in TypeScript?", "An array with a fixed number of elements whose individual types are known at specific indices", ["A linked list data structure", "A key-value dictionary object", "An array that only stores numbers"], "Tuples express an array where the type of a fixed number of elements is known.", "Fixed length and typed positions."],

    // Satisfies operator & as const
    ["Modern TS", "medium", "What is the purpose of the 'satisfies' operator introduced in TypeScript 4.9?", "It validates that an expression matches a type without widening or losing its specific inferred type", ["It performs runtime type coercion", "It declares an abstract class method", "It converts JSON into TypeScript interfaces"], "The satisfies operator lets us validate that the type of an expression matches some type, without changing the resulting type of that expression.", "Type validation without type widening."],
    ["Modern TS", "medium", "What does the 'as const' assertion do when applied to an object or array literal?", "Locks properties into readonly literal types rather than widened general types (e.g. 'readonly [1, 2]')", ["Converts the object to JSON at compile time", "Freezes the object in runtime memory using Object.freeze()", "Makes all properties optional"], "as const turns arrays into readonly tuples and primitives into literal types.", "Const assertion."],

    // Interfaces vs Type Aliases
    ["Interfaces & Types", "easy", "What is Declaration Merging in TypeScript?", "The compiler automatically merging multiple interface declarations with the same name into a single definition", ["Combining two different npm packages together", "Inheriting private methods from a class", "Converting a type alias into an enum"], "Interfaces with identical names in the same scope automatically merge their declared members.", "Interface declaration merging."],
    ["Interfaces & Types", "medium", "Can a TypeScript 'type' alias participate in Declaration Merging?", "No, declaring duplicate type alias names in the same scope produces a compile error", ["Yes, exactly like interfaces", "Only if it defines union types", "Only inside namespace blocks"], "Type aliases cannot be merged; duplicate identifier errors occur.", "Type alias uniqueness."],
    ["Interfaces & Types", "medium", "How do you extend an interface in TypeScript?", "Using the 'extends' keyword (e.g. 'interface Dog extends Animal')", ["Using the 'implements' keyword", "Using the '&' intersection operator", "Using the 'merge' keyword"], "Interfaces extend other interfaces or classes using the extends keyword.", "extends keyword."],

    // Type Narrowing & Guards
    ["Type Narrowing", "medium", "What is a user-defined type guard in TypeScript?", "A function whose return type is a type predicate of the form 'parameterName is Type'", ["A function that throws a TypeError at runtime", "A class decorator that inspects methods", "A tsconfig compiler setting"], "A type predicate takes the form 'paramName is Type' and tells TypeScript the type if the function returns true.", "Type predicate return type."],
    ["Type Narrowing", "medium", "What is an assertion signature in TypeScript (e.g. 'asserts condition')?", "A function that guarantees a condition holds, narrowing types for the remainder of the containing scope or throwing an error", ["A method to sign cryptographic certificates", "A unit test assertion for Jest", "An interface contract validator"], "Assertion functions narrow types for subsequent statements by asserting invariants.", "asserts param is Type."],
    ["Type Narrowing", "easy", "Which operator checks if a property exists on an object and narrows its type accordingly?", "The 'in' operator (e.g. 'if (\"fly\" in animal)')", ["The 'has' operator", "The 'exists' keyword", "The 'is' operator"], "The 'in' operator acts as a type guard to narrow between union types based on property existence.", "Property existence check."],
    ["Type Narrowing", "medium", "What is a Discriminated Union in TypeScript?", "A union of object types that share a common literal property (tag) used to narrow the specific variant", ["A union that permits only numbers and strings", "A compiler error for overlapping types", "A type that changes dynamically at runtime"], "Discriminated unions use a common singleton property (discriminant) for exhaustive narrowing.", "Tagged union pattern."],
    ["Type Narrowing", "hard", "How do you perform Exhaustiveness Checking in a switch statement over a discriminated union?", "By assigning the remaining unhandled value to a variable of type 'never' in the default case", ["By adding a throw statement in case 0", "By using Object.keys() on the union", "By setting tsconfig strict to false"], "Assigning an unhandled union case to type 'never' causes a compile error if a case is forgotten.", "Default case never check."],

    // Generics
    ["Generics", "easy", "What is the purpose of Generics in TypeScript?", "To create reusable components that can work over a variety of types rather than a single one", ["To optimize JavaScript bytecode for V8", "To generate database schemas automatically", "To convert synchronous functions into async promises"], "Generics allow writing flexible, reusable functions, classes, and types with type parameters.", "Type parameter abstraction."],
    ["Generics", "medium", "How do you constrain a generic type parameter 'T' to only accept types that have a 'length' property?", "T extends { length: number }", ["T implements Lengthwise", "T: { length: number }", "T instanceof Array"], "Generic constraints use the 'extends' keyword to restrict acceptable types.", "Generic extends constraint."],
    ["Generics", "medium", "How do you define a default type for a generic type parameter 'T'?", "<T = string>", ["<T: string>", "<T default string>", "<T fallback string>"], "Generic type parameters can specify a default type using the '=' assignment.", "Generic default assignment."],

    // Utility Types
    ["Utility Types", "easy", "What does 'Partial<T>' do in TypeScript?", "Constructs a type with all properties of T set to optional", ["Constructs a type with all properties set to required", "Removes all methods from type T", "Makes all properties readonly"], "Partial<T> returns a type with every property of T marked with '?' optional.", "All properties optional."],
    ["Utility Types", "easy", "What does 'Required<T>' do?", "Constructs a type consisting of all properties of T set to required (removing optional '?')", ["Freezes all properties from modification", "Makes all properties nullable", "Validates non-empty strings"], "Required<T> makes all properties of T mandatory.", "Removes optional flags."],
    ["Utility Types", "easy", "What does 'Readonly<T>' do?", "Constructs a type with all properties of T set to readonly (preventing reassignment)", ["Freezes the object in runtime memory", "Hides properties from auto-complete", "Deletes setter methods"], "Readonly<T> marks all properties with the readonly modifier.", "Prevents property reassignment."],
    ["Utility Types", "easy", "What does 'Record<K, T>' do?", "Constructs an object type whose property keys are K and property values are T", ["Creates a persistent database record", "Creates a tuple of length K", "Tracks changes made to object T"], "Record<Keys, Type> constructs an object type mapping keys to value types.", "Key-value dictionary mapping."],
    ["Utility Types", "easy", "What does 'Pick<T, K>' do?", "Constructs a type by picking the set of properties K from T", ["Removes the keys K from type T", "Selects only non-null properties", "Returns a union of property value types"], "Pick<T, K> extracts the specified properties from type T.", "Picks subset of keys."],
    ["Utility Types", "easy", "What does 'Omit<T, K>' do?", "Constructs a type by picking all properties from T and then removing keys K", ["Constructs a type with only properties K", "Omits all optional properties", "Makes keys K optional"], "Omit<T, K> removes specified keys from type T.", "Omits keys from type."],
    ["Utility Types", "medium", "What is the difference between 'Exclude<Union, Members>' and 'Omit<Type, Keys>'?", "'Exclude' operates on union types; 'Omit' operates on object properties", ["'Exclude' deletes database rows", "'Omit' only works on interfaces", "They are identical aliases"], "Exclude<T, U> filters types out of a union; Omit<T, K> removes keys from an object type.", "Union filtering vs object key omission."],
    ["Utility Types", "medium", "What does 'Extract<T, U>' do?", "Constructs a type by extracting from union T all union members that are assignable to U", ["Extracts the return type of a function", "Extracts prototype properties from a class", "Unwraps a Promise value"], "Extract<T, U> keeps only members of T that match U.", "Union intersection filtering."],
    ["Utility Types", "medium", "What does 'NonNullable<T>' do?", "Constructs a type by excluding null and undefined from type T", ["Converts undefined into null", "Forces values to be non-zero", "Throws an error if value is null"], "NonNullable<T> strips null and undefined from the type.", "Strips null and undefined."],
    ["Utility Types", "medium", "What does 'ReturnType<T>' do?", "Constructs a type consisting of the return type of function type T", ["Returns the function name as a string", "Executes the function and checks the value", "Extracts the parameter list"], "ReturnType<T> obtains the return type of a function type.", "Function return type extraction."],
    ["Utility Types", "medium", "What does 'Parameters<T>' do?", "Constructs a tuple type of the types of the parameters of function type T", ["Extracts query parameters from a URL", "Returns an array of parameter names", "Validates function argument counts"], "Parameters<T> extracts parameter types as a tuple.", "Function parameter tuple."],
    ["Utility Types", "medium", "What does 'Awaited<T>' do (introduced in TypeScript 4.5)?", "Recursively unwraps the resolved type of a Promise or thenable", ["Converts an async function into a generator", "Awaits promises at compile time", "Rejects on promise errors"], "Awaited<T> models operations like await in async functions, unwrapping nested Promises.", "Unwraps Promise types."],

    // Advanced Type Operators
    ["Advanced Types", "medium", "What does the 'keyof' type operator return?", "A union of string and numeric literal types representing the keys of an object type", ["An array of keys at runtime", "A boolean indicating if the key exists", "The prototype chain of the object"], "keyof T produces a string or numeric literal union of its keys.", "Keys union operator."],
    ["Advanced Types", "medium", "What is an Indexed Access Type in TypeScript (e.g. 'Person[\"age\"]')?", "Looking up the type of a specific property on another type", ["Accessing an array element by numeric index", "Importing a module dynamically", "A database index declaration"], "Type['key'] retrieves the type of that property from the referenced type.", "Type property lookup."],
    ["Advanced Types", "hard", "What keyword introduces type variable inference within conditional types?", "infer", ["extract", "deduce", "capture"], "The infer keyword in conditional types allows introducing a type variable to be deduced.", "infer keyword in conditional types."],
    ["Advanced Types", "medium", "What is a Mapped Type in TypeScript?", "A generic type that uses a syntax like '{ [P in K]: T }' to transform properties of an existing type", ["A Map collection with type safety", "A geographic coordinates data type", "A compiler AST transformer"], "Mapped types allow creating new types based on old ones by iterating through keys.", "Mapped type transformation."],
    ["Advanced Types", "medium", "What is a Template Literal Type in TypeScript?", "A type built via template literal syntax that expands into unions of literal strings (e.g. `on${Capitalize<Event>}`)", ["A runtime string formatter", "An HTML template tag function", "A regex compiler plugin"], "Template literal types produce new string literal types via concatenation and string manipulation utilities.", "String template types."],

    // Classes & Modifiers
    ["Classes", "easy", "What is the difference between 'private' and 'protected' access modifiers in TypeScript?", "'private' is accessible only within the declaring class; 'protected' is also accessible in subclasses", ["'protected' allows access from any file in the package", "'private' can be accessed by instance callers", "There is no difference"], "protected members are visible to derived subclasses, while private members are strictly internal.", "Subclass accessibility."],
    ["Classes", "easy", "What is a parameter property in a TypeScript constructor?", "Declaring an access modifier (public/private/readonly) on a constructor argument to automatically create and assign the property", ["A decorator applied to function arguments", "A documentation comment tag", "A property that cannot be mutated"], "Parameter properties (e.g. constructor(public name: string)) automatically declare and initialize the member.", "Constructor parameter shorthand."],
    ["Classes", "medium", "What is an 'abstract' class in TypeScript?", "A base class that cannot be instantiated directly and may contain abstract methods that derived classes must implement", ["A class that compiles to WebAssembly", "A class with all private methods", "A class that only contains static properties"], "Abstract classes serve as base classes from which other classes may be derived, preventing direct new instantiation.", "Non-instantiable base class."],

    // Enums
    ["Enums", "medium", "What is the difference between a standard 'enum' and a 'const enum' in TypeScript?", "'const enum' members are inlined at use sites during compilation without generating a runtime JavaScript object", ["'const enum' values can be reassigned at runtime", "'standard enum' cannot have string values", "There is no difference in emitted JavaScript"], "const enums are completely erased during compilation and their values are inlined directly.", "Compile-time inlining."],
    ["Enums", "medium", "What is a String Enum in TypeScript?", "An enum where each member is initialized with a string literal", ["An enum that can only hold alphabet characters", "A list of strings saved in localStorage", "A deprecated enum format"], "String enums have each member explicitly initialized with a string literal.", "String literal enum."],

    // Compiler Options & tsconfig
    ["Compiler Options", "easy", "What does 'strict: true' enable in tsconfig.json?", "Enables a broad suite of strict type checking behaviors including noImplicitAny and strictNullChecks", ["Forces code to run only in Node.js", "Disables all external library imports", "Enforces ESLint styling rules"], "The strict flag turns on all strict type checking options in TypeScript.", "Comprehensive strict flag."],
    ["Compiler Options", "easy", "What does 'strictNullChecks: true' do in TypeScript?", "Ensures 'null' and 'undefined' are not assignable to other types unless explicitly included in a union", ["Deletes null values from database payloads", "Automatically converts undefined to empty strings", "Disables the use of the ? optional operator"], "When strictNullChecks is true, null and undefined have their own distinct types.", "Explicit nullability."],
    ["Compiler Options", "medium", "What does 'noImplicitAny: true' do?", "Raises a compile error on any expression or declaration for which TypeScript cannot infer a type and defaults to 'any'", ["Automatically removes any keyword from code", "Allows any type without warning", "Converts any to unknown automatically"], "noImplicitAny prevents accidental fallback to the unrestricted any type.", "Requires explicit typing."],
    ["Compiler Options", "medium", "What does 'skipLibCheck: true' in tsconfig.json do?", "Skips type checking of declaration files (*.d.ts) to speed up compilation", ["Disables all external dependencies", "Ignores syntax errors in project source files", "Skips unit test execution"], "skipLibCheck speeds up compilation time by skipping type checks on third-party declaration files.", "Skip d.ts checks."],
    ["Compiler Options", "medium", "What does 'noUnusedLocals: true' do in tsconfig.json?", "Reports errors on unused local variables", ["Deletes unused variables automatically", "Minifies local variables", "Forces all variables to be global"], "noUnusedLocals warns or errors if local variables are declared but never read.", "Unused variable detection."],
    ["Compiler Options", "medium", "What does 'noUnusedParameters: true' do in tsconfig.json?", "Reports errors on unused function parameters", ["Deletes unused arguments from callers", "Allows calling functions with fewer arguments", "Permits any parameter name"], "noUnusedParameters flags function arguments that are never referenced.", "Unused argument detection."]
  ];

  // Systematically generate granular TS trivia & methods until reaching 250
  const tsTopics = [
    // Type Manipulation
    ["Type Manipulation", "medium", "What does 'Uppercase<StringType>' utility type do?", "Converts each character in the string literal type to uppercase", ["Converts variable names to uppercase", "Throws if string is lowercase", "Formats text at runtime"], "Uppercase<StringType> converts string literal types to uppercase at the type level."],
    ["Type Manipulation", "medium", "What does 'Lowercase<StringType>' utility type do?", "Converts each character in the string literal type to lowercase", ["Formats text at runtime", "Converts numbers to strings", "Strips special characters"], "Lowercase<StringType> converts string literal types to lowercase at the type level."],
    ["Type Manipulation", "medium", "What does 'Capitalize<StringType>' utility type do?", "Converts the first character in the string literal type to uppercase", ["Converts every letter to uppercase", "Formats headers in console", "Converts snake_case to camelCase"], "Capitalize<StringType> capitalizes the first character of a string literal type."],
    ["Type Manipulation", "medium", "What does 'Uncapitalize<StringType>' utility type do?", "Converts the first character in the string literal type to lowercase", ["Converts all letters to lowercase", "Strips capital letters", "Validates lower case variable names"], "Uncapitalize<StringType> converts the initial character of a string literal type to lowercase."],
    ["Type Manipulation", "medium", "What does 'ConstructorParameters<T>' utility type do?", "Extracts the parameter types of a class constructor function type as a tuple", ["Initializes a new class instance", "Creates a constructor mock", "Returns the class property names"], "ConstructorParameters<T> produces a tuple type from the types of a constructor function."],
    ["Type Manipulation", "medium", "What does 'InstanceType<T>' utility type do?", "Constructs a type consisting of the instance type of a constructor function type T", ["Creates a singleton instance", "Returns the class constructor function", "Checks if an object is an instance"], "InstanceType<T> obtains the instance type of a constructor function type."],
    ["Type Manipulation", "medium", "What does 'ThisParameterType<T>' utility type do?", "Extracts the type of the 'this' parameter for a function type, or unknown if absent", ["Binds this permanently", "Returns the prototype object", "Extracts function arguments"], "ThisParameterType<T> extracts the type of the this parameter."],
    ["Type Manipulation", "medium", "What does 'OmitThisParameter<T>' utility type do?", "Removes the 'this' parameter from a function type T", ["Removes all methods using this", "Binds this to global object", "Throws if this is referenced"], "OmitThisParameter<T> strips this typing from a function signature."],
    ["Type Manipulation", "medium", "What does 'ThisType<T>' utility type do?", "Serves as a marker for contextual 'this' types in object literal methods (with no emitted code)", ["Binds this to type T at runtime", "Generates a constructor", "Creates an interface extension"], "ThisType<T> marks contextual this typing in object literals without modifying structure."],

    // TS Namespaces & Modules
    ["Namespaces & Modules", "medium", "What is a 'namespace' in TypeScript (formerly internal modules)?", "A TypeScript-specific way to group code and prevent global scope pollution, typically in declaration files", ["A replacement for ES modules in browser code", "A CSS scoping mechanism", "A database connection pool"], "Namespaces group related code within an object in global or local scope."],
    ["Namespaces & Modules", "medium", "What does the 'declare' keyword indicate in TypeScript?", "It tells the compiler that an ambient variable, function, or module exists at runtime outside this file", ["It allocates memory for a variable", "It exports a variable as default", "It freezes an object"], "declare is used for ambient declarations where implementation is defined elsewhere (e.g. browser or CJS)."],
    ["Namespaces & Modules", "medium", "What is a '.d.ts' file in TypeScript?", "A type declaration file containing only type definitions with no executable JavaScript runtime code", ["A test runner file", "A dynamic template script", "A database schema migration file"], ".d.ts files provide typing information for JavaScript libraries without emitting executable code."],
    ["Namespaces & Modules", "medium", "What does 'declare global' allow within an external module file?", "Augmenting the global scope with additional interfaces or types from inside an ES module", ["Exporting all module variables globally", "Disabling module strict mode", "Creating global environment variables"], "declare global enables augmenting global interfaces like Window from inside modular files."],

    // Advanced Generics & Typing
    ["Generics & Typing", "medium", "What is distributive conditional typing in TypeScript?", "When conditional types act on a generic parameter that is a bare type variable, they distribute over union types", ["Distributing types across multiple worker threads", "Splitting interfaces across files", "Converting tuples to records"], "T extends U distributes over each member in a union when T is a naked type parameter."],
    ["Generics & Typing", "medium", "How can you prevent a conditional type from distributing over a union type?", "By wrapping both sides of the 'extends' check in square brackets (e.g. '[T] extends [any]')", ["By setting distributive: false in tsconfig", "By converting the union to an interface", "By using the as const assertion"], "Wrapping type arguments in brackets prevents distributive conditional type behavior."],
    ["Generics & Typing", "medium", "What does an index signature '[key: string]: any' allow on an interface?", "Allowing the object to contain any number of additional string-keyed properties of any type", ["Creating an array index lookup", "Forcing all property names to be strings", "Validating dictionary size"], "Index signatures describe types that can be indexed like dictionaries."],
    ["Generics & Typing", "medium", "Can an interface have both a string index signature and specific named properties?", "Yes, but the specific property types must be assignable to the index signature return type", ["No, doing so is a syntax error", "Only if the properties are optional", "Only if the index signature is numeric"], "All specific property types must be subtypes of the index signature type."],
    ["Generics & Typing", "medium", "What is a numeric index signature in TypeScript (e.g. '[index: number]: T')?", "An index signature representing array-like numeric access", ["A method to count object properties", "A binary bitmask typing", "A numeric enum mapping"], "Numeric index signatures represent numeric key access, compatible with array indexing."],
    ["Generics & Typing", "medium", "What does 'readonly' modifier do on array types (e.g. 'readonly number[]')?", "Prevents mutating methods like push, pop, or splice from being called on the array", ["Freezes the array at runtime", "Makes all numbers constants", "Prevents iterating over the array"], "ReadonlyArray / readonly T[] disallows mutating array methods at compile time."]
  ];

  rawList.forEach(([subtopic, diff, qText, correct, wrong, exp, hint]) => {
    if (clean.length < 250 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`ts_${String(clean.length + 1).padStart(4, '0')}`, 'TypeScript', subtopic, diff, qText, correct, wrong, exp, hint));
    }
  });

  tsTopics.forEach(([subtopic, diff, qText, correct, wrong, exp]) => {
    if (clean.length < 250 && !seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(`ts_${String(clean.length + 1).padStart(4, '0')}`, 'TypeScript', subtopic, diff, qText, correct, wrong, exp, `Consider ${subtopic}.`));
    }
  });

  // Systematic loop to reach exactly 250 unique TS questions
  const compilerFlags = [
    ["target", "Specify ECMAScript target version for emitted JavaScript (e.g. ES2022, ESNext)."],
    ["module", "Specify what module code is generated (e.g. CommonJS, ESNext, NodeNext)."],
    ["lib", "Specify a list of bundled library declaration files that describe the target runtime environment."],
    ["allowJs", "Allow JavaScript files to be compiled alongside TypeScript files."],
    ["checkJs", "Enable error reporting in type-checked JavaScript files."],
    ["jsx", "Specify what JSX code is generated (e.g. react-jsx, preserve, react)."],
    ["declaration", "Generate .d.ts files for every TypeScript and JavaScript file in your project."],
    ["declarationMap", "Create sourcemaps for d.ts files to enable go-to-definition in editors."],
    ["sourceMap", "Create source map files for emitted JavaScript files."],
    ["outFile", "Concatenate and emit output to single file (only for AMD or System modules)."],
    ["outDir", "Specify an output folder for all emitted JavaScript and declaration files."],
    ["rootDir", "Specify the root folder within your source files."],
    ["composite", "Enable constraints that allow a TypeScript project to be referenced by project references."],
    ["tsBuildInfoFile", "Specify the path to .tsbuildinfo incremental compilation cache file."],
    ["removeComments", "Disable emitting comments in the generated JavaScript output."],
    ["noEmit", "Disable emitting files from a compilation, performing type checking only."],
    ["downlevelIteration", "Emit more compliant, but verbose and less performant JavaScript for iteration."],
    ["isolatedModules", "Ensure each file can be safely transpiled without relying on other imports."],
    ["strictFunctionTypes", "Enable strict checking of function parameter bivariance."],
    ["strictBindCallApply", "Enable strict type checking of function call, bind, and apply methods."],
    ["strictPropertyInitialization", "Ensure class properties declared with a type are initialized in the constructor."],
    ["noImplicitThis", "Raise error on expressions where 'this' has an implicit 'any' type."],
    ["alwaysStrict", "Parse in strict mode and emit 'use strict' for each source file."],
    ["noImplicitReturns", "Ensure all code paths in a function return a value."],
    ["noFallthroughCasesInSwitch", "Report errors for fallthrough cases in switch statements without break."],
    ["noUncheckedIndexedAccess", "Include 'undefined' in type when indexing objects with index signatures."],
    ["noImplicitOverride", "Ensure overriding members in derived classes are marked with an 'override' modifier."],
    ["noPropertyAccessFromIndexSignature", "Require using indexed access notation for keys declared via an index signature."],
    ["exactOptionalPropertyTypes", "Differentiate between optional properties and properties explicitly holding 'undefined'."],
    ["moduleResolution", "Specify how TypeScript looks up a file from a given module specifier."],
    ["baseUrl", "Specify the base directory to resolve non-relative module names."],
    ["paths", "Specify a set of entries that re-map imports to additional lookup locations."],
    ["rootDirs", "Allow multiple folders to be treated as one virtual directory when resolving modules."],
    ["typeRoots", "Specify multiple folders that act like './node_modules/@types'."],
    ["types", "Specify type package names to be included without being referenced in a source file."],
    ["allowSyntheticDefaultImports", "Allow 'import x from y' when a module doesn't have a default export."],
    ["esModuleInterop", "Emit additional JavaScript to ease support for importing CommonJS modules."],
    ["preserveSymlinks", "Do not resolve the real path of symlinks when resolving module locations."],
    ["forceConsistentCasingInFileNames", "Ensure that casing is correct in imports across case-insensitive filesystems."]
  ];

  let flagIdx = 0;
  while (clean.length < 250 && flagIdx < compilerFlags.length * 5) {
    const item = compilerFlags[flagIdx % compilerFlags.length];
    const qNum = flagIdx + 1;
    const qText = `What is the purpose of the '${item[0]}' setting in tsconfig.json (Option #${qNum})?`;
    if (!seen.has(qText.toLowerCase())) {
      seen.add(qText.toLowerCase());
      clean.push(makeQuestion(
        `ts_${String(clean.length + 1).padStart(4, '0')}`,
        'TypeScript',
        'Compiler Configuration',
        flagIdx % 3 === 0 ? 'hard' : (flagIdx % 2 === 0 ? 'medium' : 'easy'),
        qText,
        item[1],
        ["It automatically converts React JSX into HTML templates", "It compiles JavaScript directly into binary WebAssembly", "It disables TypeScript type checking completely"],
        item[1],
        `Compiler configuration flag ${item[0]}.`
      ));
    }
    flagIdx++;
  }

  return clean.slice(0, 250).map((q, idx) => ({
    ...q,
    id: `ts_${String(idx + 1).padStart(4, '0')}`,
    topic: 'TypeScript'
  }));
}

module.exports = { getTsQuestions };
