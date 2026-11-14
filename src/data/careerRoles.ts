import type {
  CareerRoleDefinition,
  CareerRoleId,
  SkillAssessmentQuestion,
} from '../types.ts';

export const CAREER_ROLES: CareerRoleDefinition[] = [
  {
    id: 'full-stack-dev',
    title: 'Full Stack Developer',
    tagline: 'End-to-end web apps combining React interfaces, Node.js APIs & SQL data stores',
    summary:
      'Builds complete web applications from accessible HTML/CSS & React frontends through REST APIs in Node.js and relational databases in SQL/Python.',
    requirements: [
      {
        skillName: 'Python',
        kind: 'technical',
        requiredLevel: 3,
        weight: 15,
        category: 'Core Scripting & Logic',
      },
      {
        skillName: 'SQL',
        kind: 'technical',
        requiredLevel: 3,
        weight: 15,
        category: 'Data & Persistence',
      },
      {
        skillName: 'Basic HTML',
        kind: 'technical',
        requiredLevel: 3,
        weight: 10,
        category: 'Web Markup & CSS',
        aliases: ['HTML', 'HTML & CSS', 'Basic HTML'],
      },
      {
        skillName: 'JavaScript',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'Frontend & Async Logic',
      },
      {
        skillName: 'React',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'UI Architecture',
      },
      {
        skillName: 'Node.js',
        kind: 'technical',
        requiredLevel: 3,
        weight: 15,
        category: 'Server & APIs',
      },
      {
        skillName: 'Problem Solving',
        kind: 'soft',
        requiredLevel: 3,
        weight: 5,
        category: 'Engineering Practice',
      },
    ],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist / ML Engineer',
    tagline: 'Statistical modeling, Pandas pipelines, machine learning & reproducible notebooks',
    summary:
      'Turns raw relational and event datasets into validated predictive models and decision-ready visual narratives using Python and SQL.',
    requirements: [
      {
        skillName: 'Python',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'Scientific Computing',
      },
      {
        skillName: 'SQL',
        kind: 'technical',
        requiredLevel: 4,
        weight: 15,
        category: 'Data Extraction',
      },
      {
        skillName: 'Statistics & Probability',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'Quantitative Foundations',
      },
      {
        skillName: 'Pandas & Data Analysis',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'Data Wrangling',
        aliases: ['Pandas'],
      },
      {
        skillName: 'Machine Learning Basics',
        kind: 'technical',
        requiredLevel: 3,
        weight: 15,
        category: 'Predictive Modeling',
        aliases: ['Machine Learning', 'Scikit-Learn'],
      },
      {
        skillName: 'Data Visualization',
        kind: 'technical',
        requiredLevel: 3,
        weight: 5,
        category: 'Communication',
      },
      {
        skillName: 'Problem Solving',
        kind: 'soft',
        requiredLevel: 3,
        weight: 5,
        category: 'Analytical Reasoning',
      },
    ],
  },
  {
    id: 'backend-engineer',
    title: 'Backend & Cloud API Engineer',
    tagline: 'Scalable APIs, relational schema design, automated testing & containerized services',
    summary:
      'Designs resilient backend services, authentication flows, SQL schemas, and automated test pipelines.',
    requirements: [
      {
        skillName: 'Python',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'Service Runtime',
      },
      {
        skillName: 'SQL',
        kind: 'technical',
        requiredLevel: 4,
        weight: 20,
        category: 'Relational Storage',
      },
      {
        skillName: 'Node.js',
        kind: 'technical',
        requiredLevel: 3,
        weight: 20,
        category: 'Event-Driven Services',
      },
      {
        skillName: 'JavaScript',
        kind: 'technical',
        requiredLevel: 3,
        weight: 15,
        category: 'Async Programming',
      },
      {
        skillName: 'REST API Design',
        kind: 'technical',
        requiredLevel: 4,
        weight: 15,
        category: 'Contracts & Auth',
      },
      {
        skillName: 'Testing & Docker',
        kind: 'technical',
        requiredLevel: 3,
        weight: 5,
        category: 'Reliability',
      },
      {
        skillName: 'Problem Solving',
        kind: 'soft',
        requiredLevel: 3,
        weight: 5,
        category: 'Debugging',
      },
    ],
  },
  {
    id: 'frontend-react-dev',
    title: 'Frontend React Engineer',
    tagline: 'Accessible component systems, modern JavaScript, TypeScript & responsive CSS',
    summary:
      'Crafts fast, neuro-inclusive React interfaces backed by strong JavaScript fundamentals and semantic HTML/CSS.',
    requirements: [
      {
        skillName: 'Basic HTML',
        kind: 'technical',
        requiredLevel: 4,
        weight: 15,
        category: 'Semantic Markup & CSS',
        aliases: ['HTML', 'HTML & CSS', 'Basic HTML'],
      },
      {
        skillName: 'JavaScript',
        kind: 'technical',
        requiredLevel: 4,
        weight: 25,
        category: 'Core Language',
      },
      {
        skillName: 'React',
        kind: 'technical',
        requiredLevel: 4,
        weight: 30,
        category: 'Component & State Architecture',
      },
      {
        skillName: 'TypeScript',
        kind: 'technical',
        requiredLevel: 3,
        weight: 15,
        category: 'Type Safety',
      },
      {
        skillName: 'Accessibility & UX',
        kind: 'technical',
        requiredLevel: 3,
        weight: 10,
        category: 'Inclusive UI',
      },
      {
        skillName: 'Team Communication',
        kind: 'soft',
        requiredLevel: 3,
        weight: 5,
        category: 'Design Collaboration',
      },
    ],
  },
];

export const getCareerRoleById = (roleId: CareerRoleId): CareerRoleDefinition => {
  return CAREER_ROLES.find((r) => r.id === roleId) ?? CAREER_ROLES[0];
};

export interface SkillCurriculumEntry {
  skillName: string;
  phase: 'Foundations' | 'Core Methods' | 'Applied Systems' | 'Capstone';
  moduleTitle: string;
  estimatedHours: number;
  description: string;
  courseTitle: string;
  tutorialTitle: string;
  exercises: string[];
  projectDeliverable: string;
  revisionModuleTitle: string;
  revisionCourse: string;
  revisionExercises: string[];
}

export const SKILL_CURRICULUM_LIBRARY: Record<string, SkillCurriculumEntry> = {
  'Basic HTML': {
    skillName: 'Basic HTML',
    phase: 'Foundations',
    moduleTitle: 'Semantic HTML5 & Modern CSS Layout Bridge',
    estimatedHours: 8,
    description:
      'Strengthen landmark tags, form accessibility, Flexbox, and CSS Grid on top of your Basic HTML foundation.',
    courseTitle: 'Course: Responsive Web Foundations (HTML5 + CSS Grid)',
    tutorialTitle: 'Tutorial: Semantic Forms, ARIA Landmarks & Flexbox Patterns',
    exercises: [
      'Refactor a plain div layout into semantic header/main/section landmarks',
      'Build a responsive 2-column profile card with Flexbox & CSS Grid',
    ],
    projectDeliverable: 'Accessible Study Planner Landing Card in Pure HTML/CSS',
    revisionModuleTitle: 'HTML/CSS Semantics & Layout Refresher',
    revisionCourse: 'Guided Lab: Box Model, Grid Areas & Accessible Labels',
    revisionExercises: [
      'Fix 5 broken semantic landmark & label pairings',
      'Rebuild a responsive navbar without fixed pixel widths',
    ],
  },
  JavaScript: {
    skillName: 'JavaScript',
    phase: 'Core Methods',
    moduleTitle: 'Modern JavaScript ES6+, Closures & Async Fetch',
    estimatedHours: 16,
    description:
      'Bridge from Python logic to JavaScript: lexical scope, array transforms, Promises, async/await, and DOM state updates.',
    courseTitle: 'Course: JavaScript Core for Python Developers (ES6+ & Async)',
    tutorialTitle: 'Tutorial: Promises, async/await & Immutable Array Pipelines',
    exercises: [
      'Convert 5 Python list comprehensions into JS map/filter/reduce pipelines',
      'Build a debounced search filter with fetch + error handling',
    ],
    projectDeliverable: 'Interactive Flashcard CLI-to-Browser App in Vanilla JS',
    revisionModuleTitle: 'JavaScript Revision: Scope, Async & Array Practice',
    revisionCourse: 'Interactive Tutorial: Event Loop, Closures & Async Debugging',
    revisionExercises: [
      'Trace 4 async/await execution order puzzles',
      'Debug 3 stale closure bugs in event listeners',
    ],
  },
  React: {
    skillName: 'React',
    phase: 'Core Methods',
    moduleTitle: 'React Components, Hooks & Unidirectional State',
    estimatedHours: 18,
    description:
      'Learn JSX composition, props vs. state, useState/useEffect lifecycles, lifted state, and clean component boundaries.',
    courseTitle: 'Course: Practical React 19 — Components, Hooks & Data Flow',
    tutorialTitle: 'Tutorial: Thinking in React — Controlled Forms & Effect Cleanup',
    exercises: [
      'Build a reusable TaskCard component with controlled completion toggle',
      'Lift shared filter state cleanly between Sidebar and List components',
    ],
    projectDeliverable: 'Multi-Filter Microtask & Skill Tracker Widget in React',
    revisionModuleTitle: 'React Revision & Guided Practice Lab',
    revisionCourse: 'Targeted Revision: State Updates, Hooks Rules & Re-Render Tracing',
    revisionExercises: [
      'Fix 3 broken useState mutation & missing dependency array bugs',
      'Build a live counter + filtered checklist using derived state (no redundant useEffect)',
    ],
  },
  'Node.js': {
    skillName: 'Node.js',
    phase: 'Applied Systems',
    moduleTitle: 'Node.js, Express REST APIs & SQL Integration',
    estimatedHours: 14,
    description:
      'Connect your SQL knowledge to Node.js backend endpoints: routing, JSON validation, middleware, and parameterized queries.',
    courseTitle: 'Course: Node.js & Express API Engineering with SQL',
    tutorialTitle: 'Tutorial: REST Route Handlers, Validation & Parameterized SQL Queries',
    exercises: [
      'Create GET/POST /api/tasks endpoints with input schema validation',
      'Wire a parameterized SQL query helper with clean 400/404 status codes',
    ],
    projectDeliverable: 'Study Session REST API Service Connected to SQLite/Postgres',
    revisionModuleTitle: 'Node.js API Routing & Error Handling Revision',
    revisionCourse: 'Guided Walkthrough: Express Middleware & Async Error Wrappers',
    revisionExercises: [
      'Add try/catch async error middleware to 3 failing routes',
      'Validate JSON body payloads before DB inserts',
    ],
  },
  SQL: {
    skillName: 'SQL',
    phase: 'Foundations',
    moduleTitle: 'Relational Joins, Indexing & Query Optimization',
    estimatedHours: 10,
    description:
      'Advance from basic SELECT queries to normalized schemas, INNER/LEFT joins, GROUP BY aggregations, and query plans.',
    courseTitle: 'Course: Applied SQL — Joins, Aggregations & Schema Design',
    tutorialTitle: 'Tutorial: Designing 3NF Tables & Avoiding N+1 Queries',
    exercises: [
      'Write JOIN + GROUP BY queries computing weekly study minutes per module',
      'Add composite indexes and inspect EXPLAIN query plan',
    ],
    projectDeliverable: 'Normalized Learner Analytics Schema & Query Pack',
    revisionModuleTitle: 'SQL Joins & Aggregation Revision Workshop',
    revisionCourse: 'Drills: LEFT JOIN vs INNER JOIN & HAVING Filters',
    revisionExercises: [
      'Solve 6 real-world reporting queries on student session tables',
    ],
  },
  Python: {
    skillName: 'Python',
    phase: 'Foundations',
    moduleTitle: 'Clean Python Modules, Testing & Data Structures',
    estimatedHours: 10,
    description:
      'Apply modular Python packaging, type hints, pytest unit tests, and clean error handling.',
    courseTitle: 'Course: Production Python Patterns & Pytest Fundamentals',
    tutorialTitle: 'Tutorial: Type Hints, Dataclasses & Clean Module Boundaries',
    exercises: [
      'Write 6 pytest unit tests covering edge cases in a score calculator',
    ],
    projectDeliverable: 'Tested Python CLI Data Validator',
    revisionModuleTitle: 'Python Fundamentals & Testing Revision',
    revisionCourse: 'Guided Practice: Functions, Dictionaries & Unit Testing',
    revisionExercises: [
      'Refactor a monolithic script into 3 tested functions',
    ],
  },
  'Statistics & Probability': {
    skillName: 'Statistics & Probability',
    phase: 'Foundations',
    moduleTitle: 'Applied Probability, Distributions & Hypothesis Testing',
    estimatedHours: 16,
    description:
      'Master descriptive statistics, Bayes theorem, confidence intervals, p-values, and A/B test power analysis.',
    courseTitle: 'Course: Statistics & Probability for Data Science',
    tutorialTitle: 'Tutorial: Hypothesis Testing & Confidence Intervals in Python',
    exercises: [
      'Simulate a coin/conversion A/B test in Python and compute p-value',
      'Plot normal vs skewed distributions and compare mean vs median',
    ],
    projectDeliverable: 'A/B Study Experiment Analysis Notebook',
    revisionModuleTitle: 'Statistics & Hypothesis Testing Revision',
    revisionCourse: 'Drills: Distributions, Variance & Conditional Probability',
    revisionExercises: [
      'Solve 5 Bayes theorem & confidence interval problems',
    ],
  },
  'Pandas & Data Analysis': {
    skillName: 'Pandas & Data Analysis',
    phase: 'Core Methods',
    moduleTitle: 'Pandas DataFrames, Cleaning & Feature Pipelines',
    estimatedHours: 14,
    description:
      'Clean messy CSV/SQL extracts using vectorized Pandas transforms, groupby aggregations, merges, and missing-value strategies.',
    courseTitle: 'Course: Exploratory Data Analysis with Pandas & NumPy',
    tutorialTitle: 'Tutorial: Method Chaining, GroupBy & Time-Series Resampling',
    exercises: [
      'Load student activity logs from SQL into Pandas and compute rolling 7-day focus averages',
      'Handle missing values and duplicate timestamps cleanly without chained-assignment warnings',
    ],
    projectDeliverable: 'Cleaned & Profiled EdTech Engagement Dataset Report',
    revisionModuleTitle: 'Pandas Indexing, Merge & GroupBy Revision',
    revisionCourse: 'Guided Lab: loc/iloc, MultiIndex & Merge Strategies',
    revisionExercises: [
      'Debug 4 DataFrame merge key mismatches',
    ],
  },
  'Machine Learning Basics': {
    skillName: 'Machine Learning Basics',
    phase: 'Applied Systems',
    moduleTitle: 'Supervised Learning & Evaluation with Scikit-Learn',
    estimatedHours: 18,
    description:
      'Build train/validation pipelines, prevent data leakage, and evaluate regression and classification models.',
    courseTitle: 'Course: Practical Machine Learning with Scikit-Learn',
    tutorialTitle: 'Tutorial: Pipelines, Cross-Validation & Precision/Recall Tradeoffs',
    exercises: [
      'Build a Scikit-Learn Pipeline predicting task completion risk',
      'Compare Logistic Regression vs Random Forest using 5-fold cross-validation',
    ],
    projectDeliverable: 'Cross-Validated Student Dropout Early-Warning Model',
    revisionModuleTitle: 'ML Overfitting & Cross-Validation Revision',
    revisionCourse: 'Guided Lab: Train/Test Split, Leakage & Metrics',
    revisionExercises: [
      'Fix a leaky scaler fit before train_test_split',
    ],
  },
  'Data Visualization': {
    skillName: 'Data Visualization',
    phase: 'Applied Systems',
    moduleTitle: 'Clear Data Storytelling & Diagnostic Plotting',
    estimatedHours: 8,
    description:
      'Choose appropriate visual encodings, colorblind-safe palettes, and diagnostic residual/distribution plots.',
    courseTitle: 'Course: Communicating Insights with Matplotlib & Seaborn',
    tutorialTitle: 'Tutorial: Small Multiples & Misleading Chart Fixes',
    exercises: [
      'Create a 3-panel diagnostic dashboard for a cleaned dataset',
    ],
    projectDeliverable: 'Executive Visual Narrative Notebook',
    revisionModuleTitle: 'Visual Encoding & Clarity Revision',
    revisionCourse: 'Workshop: Labels, Scales & Distribution Plots',
    revisionExercises: ['Redesign a cluttered multi-line chart into small multiples'],
  },
  'REST API Design': {
    skillName: 'REST API Design',
    phase: 'Core Methods',
    moduleTitle: 'REST Resource Modeling, Auth & HTTP Contracts',
    estimatedHours: 12,
    description:
      'Design predictable resource endpoints, status codes, pagination, rate limiting, and bearer authentication.',
    courseTitle: 'Course: Designing Clean RESTful APIs',
    tutorialTitle: 'Tutorial: Idempotency, Status Codes & Pagination Cursors',
    exercises: ['Design an OpenAPI spec for a multi-user study planner API'],
    projectDeliverable: 'Documented OpenAPI 3.0 Backend Contract',
    revisionModuleTitle: 'HTTP Status & API Contract Revision',
    revisionCourse: 'Drills: 400 vs 401 vs 403 vs 409 Selection',
    revisionExercises: ['Audit 6 endpoint specs for REST anti-patterns'],
  },
  'Testing & Docker': {
    skillName: 'Testing & Docker',
    phase: 'Applied Systems',
    moduleTitle: 'Integration Testing & Containerized Local Environments',
    estimatedHours: 10,
    description:
      'Write reliable API integration tests and package Python/Node + Postgres services with Docker.',
    courseTitle: 'Course: Automated Testing & Docker Compose for Backends',
    tutorialTitle: 'Tutorial: Writing Fast API Test Suites with Mocked Boundaries',
    exercises: ['Containerize a Node/Python API + SQL database with a 2-service compose file'],
    projectDeliverable: 'Dockerized API + Automated Test Suite',
    revisionModuleTitle: 'Integration Test & Container Revision',
    revisionCourse: 'Lab: Test Isolation & Multi-Stage Dockerfiles',
    revisionExercises: ['Fix a flaky test caused by shared mutable database state'],
  },
  TypeScript: {
    skillName: 'TypeScript',
    phase: 'Core Methods',
    moduleTitle: 'TypeScript Interfaces, Generics & React Props',
    estimatedHours: 12,
    description:
      'Eliminate runtime undefined bugs with strict TypeScript types, discriminated unions, and typed React hooks.',
    courseTitle: 'Course: TypeScript for React Applications',
    tutorialTitle: 'Tutorial: Discriminated Unions & Generic Utility Components',
    exercises: ['Convert 3 plain JS React components to strict TypeScript'],
    projectDeliverable: 'Strictly Typed Component & Form Utility Library',
    revisionModuleTitle: 'TypeScript Narrowing & Union Revision',
    revisionCourse: 'Drills: Type Guards, Partial/Pick & Event Types',
    revisionExercises: ['Resolve 5 strict null-check compiler errors cleanly'],
  },
  'Accessibility & UX': {
    skillName: 'Accessibility & UX',
    phase: 'Applied Systems',
    moduleTitle: 'WCAG AA Accessibility, Keyboard Focus & Neuro-Inclusive UI',
    estimatedHours: 10,
    description:
      'Support full keyboard navigation, screen reader semantics, contrast ratios, and reduced-motion preferences.',
    courseTitle: 'Course: Practical Web Accessibility (WCAG 2.2 AA)',
    tutorialTitle: 'Tutorial: Focus Management in Modals & ARIA Live Regions',
    exercises: ['Audit and fix tab-order and contrast issues on a multi-step form'],
    projectDeliverable: 'WCAG-Verified Study Dashboard Prototype',
    revisionModuleTitle: 'ARIA Roles & Focus Trap Revision',
    revisionCourse: 'Lab: Native Buttons vs Clickable Divs',
    revisionExercises: ['Replace 4 inaccessible div click handlers with semantic controls'],
  },
};

export const SKILL_ASSESSMENT_QUESTIONS: Record<string, SkillAssessmentQuestion[]> = {
  React: [
    {
      id: 'ra-1',
      skillName: 'React',
      prompt: 'Why should React state updates on arrays or objects create new references instead of mutating in place?',
      options: [
        'Because React uses Object.is reference comparison to decide when to re-render',
        'Because JavaScript forbids modifying array elements inside functions',
        'Because immutable values automatically save to localStorage',
        'Because JSX only accepts frozen objects',
      ],
      correctIndex: 0,
      explanation:
        'React compares previous and next state by reference; mutating an existing array/object keeps the same reference and skips re-rendering.',
    },
    {
      id: 'ra-2',
      skillName: 'React',
      prompt: 'When you can compute `fullName` directly from existing `firstName` and `lastName` state, what is the recommended React pattern?',
      options: [
        'Store `fullName` in a second useState and sync it inside useEffect',
        'Derive `const fullName = ...` directly during render without extra state',
        'Put `fullName` in a global window variable',
        'Use setTimeout inside render to update it',
      ],
      correctIndex: 1,
      explanation:
        'Deriving values directly during render avoids redundant state, extra render cycles, and out-of-sync bugs.',
    },
    {
      id: 'ra-3',
      skillName: 'React',
      prompt: 'Which prop helps React preserve component identity and state accurately when reordering list items?',
      options: ['index', 'tabIndex', 'A stable unique `key` prop', 'className'],
      correctIndex: 2,
      explanation:
        'A stable unique `key` (like an item ID rather than array index) lets React match items accurately across reorders and deletions.',
    },
    {
      id: 'ra-4',
      skillName: 'React',
      prompt: 'What is the purpose of returning a cleanup function from `useEffect`?',
      options: [
        'To reset all component props to undefined',
        'To clear intervals, listeners, or subscriptions before the effect re-runs or unmounts',
        'To force an extra synchronous re-render',
        'To compile TypeScript interfaces at runtime',
      ],
      correctIndex: 1,
      explanation:
        'Cleanup functions prevent memory leaks and stale timers/listeners when dependencies change or the component unmounts.',
    },
  ],
  JavaScript: [
    {
      id: 'js-1',
      skillName: 'JavaScript',
      prompt: 'What does `Array.prototype.filter()` return?',
      options: [
        'The first matching element or undefined',
        'A new array containing only elements whose callback returns truthy',
        'The mutated original array sorted in place',
        'A boolean indicating whether any item matched',
      ],
      correctIndex: 1,
      explanation: '`filter` always returns a shallow-copied new array of matching items without mutating the source array.',
    },
    {
      id: 'js-2',
      skillName: 'JavaScript',
      prompt: 'Inside an `async` function, what does `await promise` do?',
      options: [
        'Blocks the entire browser tab thread',
        'Pauses execution of that async function until the Promise settles while letting the event loop stay responsive',
        'Automatically retries failed network requests 3 times',
        'Converts JSON strings into SQL queries',
      ],
      correctIndex: 1,
      explanation: '`await` yields control back to the event loop while waiting for the Promise to resolve or reject.',
    },
    {
      id: 'js-3',
      skillName: 'JavaScript',
      prompt: 'Which equality operator checks both value AND type without implicit coercion?',
      options: ['==', '===', '=', '~='],
      correctIndex: 1,
      explanation: 'Strict equality (`===`) avoids surprising type coercion such as `0 == ""` evaluating to true.',
    },
    {
      id: 'js-4',
      skillName: 'JavaScript',
      prompt: 'Why use `const` by default instead of `var` in modern JavaScript?',
      options: [
        '`const` provides block scoping and prevents accidental binding reassignment',
        '`const` runs twice as fast in CSS engines',
        '`var` is not supported in Node.js',
        '`const` makes arrays deeply frozen automatically',
      ],
      correctIndex: 0,
      explanation: '`const` is block-scoped (no hoisting surprises) and signals the variable binding will not be reassigned.',
    },
  ],
  Python: [
    {
      id: 'py-1',
      skillName: 'Python',
      prompt: 'Why should mutable objects like `[]` NOT be used as default function parameter values in Python?',
      options: [
        'Default arguments are evaluated once at function definition and shared across calls',
        'Python raises a SyntaxError on list defaults',
        'Lists cannot be appended inside functions',
        'It disables garbage collection permanently',
      ],
      correctIndex: 0,
      explanation: 'Use `items=None` and initialize `items = []` inside the function body so calls do not share state.',
    },
    {
      id: 'py-2',
      skillName: 'Python',
      prompt: 'What is the time complexity of checking key membership `k in my_dict` on average in Python?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
      correctIndex: 2,
      explanation: 'Python dictionaries are hash tables, giving O(1) average-case lookup.',
    },
    {
      id: 'py-3',
      skillName: 'Python',
      prompt: 'What does a `with open(...) as f:` context manager guarantee?',
      options: [
        'The file is automatically closed cleanly even if an exception occurs',
        'The file contents are automatically parsed as JSON',
        'Multiple processes can write without locks',
        'Memory usage stays zero',
      ],
      correctIndex: 0,
      explanation: 'Context managers run `__exit__` reliably to release file handles even when errors happen.',
    },
  ],
  SQL: [
    {
      id: 'sql-1',
      skillName: 'SQL',
      prompt: 'What is the difference between `WHERE` and `HAVING` in SQL?',
      options: [
        '`WHERE` filters individual rows before grouping; `HAVING` filters grouped aggregates after `GROUP BY`',
        '`HAVING` is only for DELETE statements',
        '`WHERE` only works on numeric columns',
        'There is no difference; they are synonyms',
      ],
      correctIndex: 0,
      explanation: '`WHERE` filters raw rows before aggregation, while `HAVING` filters aggregated groups.',
    },
    {
      id: 'sql-2',
      skillName: 'SQL',
      prompt: 'Which join returns all rows from the left table even when no matching row exists in the right table?',
      options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'NATURAL INNER JOIN'],
      correctIndex: 1,
      explanation: '`LEFT JOIN` keeps every row from the left table and fills unmatched right columns with NULL.',
    },
    {
      id: 'sql-3',
      skillName: 'SQL',
      prompt: 'Why are parameterized SQL queries (`$1` / `?`) essential when accepting user input?',
      options: [
        'They prevent SQL injection by separating SQL structure from data values',
        'They automatically convert SQLite databases into Postgres',
        'They compress returned JSON responses',
        'They bypass primary key constraints',
      ],
      correctIndex: 0,
      explanation: 'Parameterized queries ensure user input is never interpreted as executable SQL syntax.',
    },
  ],
  'Node.js': [
    {
      id: 'node-1',
      skillName: 'Node.js',
      prompt: 'Why should CPU-heavy synchronous loops be avoided directly inside Express request handlers?',
      options: [
        'Node.js executes JavaScript on a single main event loop thread, so blocking stalls all concurrent requests',
        'Express only allows async functions to return numbers',
        'Node.js cannot perform arithmetic operations',
        'HTTP headers expire after 5ms',
      ],
      correctIndex: 0,
      explanation: 'Blocking the event loop prevents other incoming requests and timers from progressing.',
    },
    {
      id: 'node-2',
      skillName: 'Node.js',
      prompt: 'What HTTP status code best indicates invalid JSON input sent by the client?',
      options: ['200 OK', '400 Bad Request', '500 Internal Server Error', '301 Moved Permanently'],
      correctIndex: 1,
      explanation: '400 Bad Request communicates a client payload validation error rather than a server crash (500).',
    },
    {
      id: 'node-3',
      skillName: 'Node.js',
      prompt: 'In Express, what is the role of error-handling middleware `(err, req, res, next)`?',
      options: [
        'Centralizes uncaught route errors into consistent JSON status responses without leaking stack traces',
        'Automatically compiles React bundles',
        'Encrypts database passwords on the client',
        'Replaces package.json dependencies',
      ],
      correctIndex: 0,
      explanation: 'Centralized error middleware ensures predictable API error contracts.',
    },
  ],
};
