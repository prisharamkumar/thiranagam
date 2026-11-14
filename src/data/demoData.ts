import {
  ADHDPreferences,
  Companion,
  CompanionId,
  CompetencyItem,
  DeadlineGoal,
  DiscoveryPoint,
  DistractionItem,
  FocusSessionRecord,
  GentleIntention,
  GrowthMilestone,
  HabitatDecoration,
  LearningPreferences,
  MentorMessage,
  Microtask,
  MilestoneItem,
  NotificationPreferences,
  QuizAttempt,
  QuizQuestion,
  ResearchPaper,
  ResourceBalance,
  RoadmapModule,
  SanctumEnvironment,
  SkillAssessmentRecord,
  SkillChangeRecord,
  SoundTrackId,
  StudentProfile,
  ThemePresetId,
  ThemeSettings,
} from '../types';
import imgPattu from '../assets/images/companion_cat_pattu_1794636179017.jpg';
import imgThen from '../assets/images/companion_bear_then_1794636159338.jpg';
import imgSembu from '../assets/images/companion_fox_bramble_1794634527595.jpg';
import imgMalli from '../assets/images/companion_bunny_malli_1794636152226.jpg';
import imgOwl from '../assets/images/companion_owl_pip_1794634527914.jpg';
import imgOtter from '../assets/images/companion_otter_moss_1794634528667.jpg';
import imgSanctumLibrary from '../assets/images/sanctum_library_1794634532023.jpg';
import imgSanctumAstronomy from '../assets/images/sanctum_astronomy_1794634530094.jpg';

export const formatIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDayKeyFromDate = (
  date: Date
): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' => {
  const map: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];
  return map[date.getDay()];
};

const daysAgoIso = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatIsoDate(d);
};

const daysAgoDayKey = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getDayKeyFromDate(d);
};

export const DEFAULT_COMPANION_NAMES: Record<CompanionId, string> = {
  sembu: 'Sembu',
  then: 'Then',
  malli: 'Malli',
  pattu: 'Pattu',
  owl: 'Barn Owl',
  otter: 'River Otter',
};

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Arjun Nair (Demo Learner)',
  email: 'demo.learner@thiranagam.local',
  avatarId: 'willow',
  university: 'Pacific Crest University',
  major: 'B.S. Computer Science · Full Stack Engineering Track',
  year: 'Junior (Year 3)',
  subjects: ['Python Programming', 'Relational Databases (SQL)', 'Web Markup (HTML)'],
  careerInterests: 'Full Stack Web Development, API Architecture, Neuro-Inclusive Tools',
  targetRoleId: 'full-stack-dev',
  careerNorthStar: 'Full Stack Developer',
  learningGoalsSummary:
    'Bridge existing Python, SQL, and Basic HTML foundations into JavaScript, React, and Node.js to ship complete Full Stack applications.',
  skills: [
    {
      id: 'sk-python',
      name: 'Python',
      kind: 'technical',
      selfReportedLevel: 4,
      verifiedLevel: 4,
      lastAssessedScore: 80,
      lastAssessedAt: 'Yesterday',
      origin: 'both',
    },
    {
      id: 'sk-sql',
      name: 'SQL',
      kind: 'technical',
      selfReportedLevel: 3,
      verifiedLevel: 3,
      lastAssessedScore: 75,
      lastAssessedAt: '2 days ago',
      origin: 'both',
    },
    {
      id: 'sk-html',
      name: 'Basic HTML',
      kind: 'technical',
      selfReportedLevel: 2,
      origin: 'self-reported',
    },
    {
      id: 'sk-ps',
      name: 'Problem Solving',
      kind: 'soft',
      selfReportedLevel: 4,
      origin: 'self-reported',
    },
    {
      id: 'sk-comm',
      name: 'Team Communication',
      kind: 'soft',
      selfReportedLevel: 3,
      origin: 'self-reported',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'Python Data Structures & Scripting Foundations',
      issuer: 'University CS Online',
      year: '2025',
      status: 'Earned',
    },
    {
      id: 'cert-2',
      title: 'Relational Database Design & SQL Querying',
      issuer: 'PostgreSQL Fundamentals',
      year: '2025',
      status: 'Earned',
    },
    {
      id: 'cert-3',
      title: 'Modern React & Node.js Full Stack Track',
      issuer: 'Thiranagam Pathway Target',
      year: '2026',
      status: 'In Progress',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Campus Study Tracker CLI',
      role: 'Backend Developer',
      summary:
        'Built a Python CLI and SQLite schema to log study blocks, filter weekly totals, and export CSV summaries.',
      skillsUsed: ['Python', 'SQL'],
    },
    {
      id: 'proj-2',
      title: 'Lab Notes Static Archive',
      role: 'Web Contributor',
      summary:
        'Authored semantic Basic HTML pages and structured checklists for a student study group.',
      skillsUsed: ['Basic HTML'],
    },
  ],
  activeCompanionId: 'pattu',
  companionNames: { ...DEFAULT_COMPANION_NAMES },
  dailyFocusGoalMinutes: 90,
  lowStimulationMode: false,
  reducedMotion: false,
  comfortableReadingSize: false,
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  preset: 'library',
  colorMode: 'light',
  customAccent: null,
  fontSizePx: 16,
  fontPreset: 'sans',
  headingStyle: 'editorial',
  lineSpacing: 'comfortable',
  readingWidth: 'balanced',
  contrast: 'standard',
  animationIntensity: 'calm',
};

export const DEFAULT_LEARNING_PREFERENCES: LearningPreferences = {
  knowledgeLevel: 'intermediate',
  preferredFormat: 'mixed',
  preferredStudyTime: 'morning',
  dailyAvailabilityHours: 2.5,
  preferredFocusMinutes: 25,
  preferredBreakMinutes: 5,
};

export const DEFAULT_ADHD_PREFERENCES: ADHDPreferences = {
  autoMicrotaskBreakdown: true,
  preferredTaskDuration: 15,
  visualTimeReminders: true,
  bodyDoublingMode: true,
  oneTaskAtATime: false,
  cursorFollowingEyes: true,
  interfaceDensity: 'airy',
  gentleCheckInPrompts: true,
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  breakChimeEnabled: true,
  visualTransitionCue: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:30',
  reminderFrequency: 'gentle',
};

export const DEFAULT_DEADLINE_GOAL: DeadlineGoal = {
  examOrGoalName: 'Full Stack Developer Portfolio Milestone (JS → React → Node.js)',
  finalDate: '2026-12-04',
  syllabusTopics: 'JavaScript ES6+ & Async, React Hooks & State, Node.js REST APIs + SQL',
  prioritySubjects: 'JavaScript, React, Node.js',
};

export const IMMERSIVE_THEMES: {
  id: ThemePresetId;
  name: string;
  tagline: string;
  navStyleLabel: string;
  swatches: [string, string, string, string];
  defaultModeHint: 'light' | 'dark';
}[] = [
  {
    id: 'cafe',
    name: 'Cozy Café',
    tagline: 'Roasted espresso, ceramic cups, pastries & warm oak counter',
    navStyleLabel: 'Café Menu Signboards',
    swatches: ['#FAF3E8', '#7A4828', '#3E5E4B', '#E5CBB0'],
    defaultModeHint: 'light',
  },
  {
    id: 'rainforest',
    name: 'Rainforest',
    tagline: 'Fern canopy, soft moss, wild mushrooms & drifting fireflies',
    navStyleLabel: 'Botanical Leaf Tabs',
    swatches: ['#F3F7F2', '#26533B', '#A86933', '#D4E4D6'],
    defaultModeHint: 'light',
  },
  {
    id: 'beach',
    name: 'Beach',
    tagline: 'Tidewash turquoise, sandy linen, seashells & horizon sailboat',
    navStyleLabel: 'Coastal Wave Tabs',
    swatches: ['#F4F9F9', '#1D6472', '#C5955C', '#D8ECEE'],
    defaultModeHint: 'light',
  },
  {
    id: 'library',
    name: 'Library',
    tagline: 'Arched bookshelves, brass reading lamps, stacked volumes & paper',
    navStyleLabel: 'Book-Spine Controls',
    swatches: ['#F6EFE4', '#4B3222', '#8D6136', '#E8DAC6'],
    defaultModeHint: 'light',
  },
  {
    id: 'cabin',
    name: 'Cozy Cabin',
    tagline: 'Cedar beams, glowing hearth embers, woven blankets & twilight pine',
    navStyleLabel: 'Carved Timber Signs',
    swatches: ['#F7EFE6', '#843F26', '#335342', '#EAD6C3'],
    defaultModeHint: 'light',
  },
];

export const COMPANIONS: Companion[] = [
  {
    id: 'pattu',
    defaultName: 'Pattu',
    species: 'Cat',
    role: 'Rest & Focus Cadence',
    imageUrl: imgPattu,
    perkTitle: 'Stillness Cushion',
    studyNote: 'Ready whenever you want to settle in.',
  },
  {
    id: 'then',
    defaultName: 'Then',
    species: 'Bear',
    role: 'Honey Jar Keeper',
    imageUrl: imgThen,
    perkTitle: 'Golden Milestone',
    studyNote: 'Every small completed step fills the jar.',
  },
  {
    id: 'sembu',
    defaultName: 'Sembu',
    species: 'Fox',
    role: 'Warm Start Reader',
    imageUrl: imgSembu,
    perkTitle: 'Study Lantern',
    studyNote: 'Two unhurried minutes is plenty to begin.',
  },
  {
    id: 'malli',
    defaultName: 'Malli',
    species: 'Bunny',
    role: 'Jasmine Grower',
    imageUrl: imgMalli,
    perkTitle: 'Jasmine Vine',
    studyNote: 'Small wins bloom quietly in their own time.',
  },
  {
    id: 'owl',
    defaultName: 'Barn Owl',
    species: 'Owl',
    role: 'Pattern Scholar',
    imageUrl: imgOwl,
    perkTitle: 'Archival Stack',
    studyNote: 'One clear paragraph at a time.',
  },
  {
    id: 'otter',
    defaultName: 'River Otter',
    species: 'Otter',
    role: 'Curiosity Archivist',
    imageUrl: imgOtter,
    perkTitle: 'Spring Pebbles',
    studyNote: 'Every note stays safely in your satchel.',
  },
];

export const INITIAL_MICROTASKS: Microtask[] = [
  {
    id: 'mt-1',
    title: 'Convert 5 Python list comprehensions into JavaScript map/filter/reduce',
    moduleId: 'mod-gap-javascript',
    moduleTitle: 'Modern JavaScript ES6+, Closures & Async Fetch',
    estimatedMinutes: 20,
    completed: false,
    energyFit: 'steady',
    substeps: [
      { id: 's-1', text: 'Open interactive JS sandbox and write 2 array filter chains', done: true },
      { id: 's-2', text: 'Practice async/await fetch with try/catch error boundary', done: false },
      { id: 's-3', text: 'Run JavaScript Skill Check to verify level', done: false },
    ],
  },
  {
    id: 'mt-2',
    title: 'Build controlled TaskCard toggle component in React',
    moduleId: 'mod-gap-react',
    moduleTitle: 'React Components, Hooks & Unidirectional State',
    estimatedMinutes: 20,
    completed: false,
    energyFit: 'low',
    substeps: [
      { id: 's-4', text: 'Define TypeScript props interface for title and completed state', done: false },
      { id: 's-5', text: 'Update state immutably using array.map without mutating objects', done: false },
    ],
  },
  {
    id: 'mt-3',
    title: 'Refactor Lab Notes Basic HTML headings into semantic landmarks',
    moduleId: 'mod-gap-basic-html',
    moduleTitle: 'Semantic HTML5 & Modern CSS Layout Bridge',
    estimatedMinutes: 15,
    completed: false,
    energyFit: 'bright',
    substeps: [
      { id: 's-6', text: 'Replace generic div containers with header/main/section tags', done: false },
      { id: 's-7', text: 'Verify form labels pair cleanly with input ids', done: false },
    ],
  },
  {
    id: 'mt-4',
    title: 'Complete SQL JOIN & GROUP BY aggregation verification check',
    moduleId: 'mod-verified-full-stack-dev',
    moduleTitle: 'Verified Foundation: Python & SQL',
    estimatedMinutes: 10,
    completed: true,
    completedDate: daysAgoIso(0),
    energyFit: 'low',
    substeps: [
      { id: 's-8', text: 'Scored 75% on SQL Skill Check and logged parameterized query note', done: true },
    ],
  },
];

export const INITIAL_SKILL_ASSESSMENTS: SkillAssessmentRecord[] = [
  {
    id: 'sa-init-1',
    skillName: 'Python',
    score: 4,
    total: 5,
    pct: 80,
    previousEffectiveLevel: 4,
    newVerifiedLevel: 4,
    timestampLabel: 'Yesterday',
    triggeredAdaptation: false,
    note: 'Baseline verification passed cleanly (Python data structures & context managers).',
  },
  {
    id: 'sa-init-2',
    skillName: 'SQL',
    score: 3,
    total: 4,
    pct: 75,
    previousEffectiveLevel: 3,
    newVerifiedLevel: 3,
    timestampLabel: '2 days ago',
    triggeredAdaptation: false,
    note: 'Relational joins and parameterized query check passed.',
  },
];

export const INITIAL_SKILL_HISTORY: SkillChangeRecord[] = [
  {
    id: 'sh-init-1',
    skillName: 'Python',
    fromLevel: 3,
    toLevel: 4,
    source: 'assessment',
    note: 'Assessment-verified at 80% — upgraded from self-reported.',
    timestampLabel: 'Yesterday',
  },
  {
    id: 'sh-init-2',
    skillName: 'SQL',
    fromLevel: 3,
    toLevel: 3,
    source: 'assessment',
    note: 'Assessment-verified at 75% — matches self-reported baseline.',
    timestampLabel: '2 days ago',
  },
  {
    id: 'sh-init-3',
    skillName: 'Basic HTML',
    fromLevel: 0,
    toLevel: 2,
    source: 'self-update',
    note: 'Added as self-reported skill (awaiting assessment verification).',
    timestampLabel: '3 days ago',
  },
];

export const INITIAL_MENTOR_MESSAGES: MentorMessage[] = [
  {
    id: 'm-init-1',
    role: 'mentor',
    text:
      'Welcome! I am connected to your live Demo Learner profile (Full Stack Developer). Your verified strengths are **Python (4/5)** and **SQL (3/5)**, with **Basic HTML (2/5 self-reported)**. Your highest-impact missing skills are **JavaScript**, **React**, and **Node.js**. Ask me about your readiness score, weaknesses, or next steps anytime.',
    timestampLabel: 'Ready',
    referencedWeaknesses: ['Basic HTML', 'JavaScript', 'React', 'Node.js'],
    suggestedActions: [
      'Why is my readiness score at its current %?',
      'What happens if I score poorly on React?',
      'What should I build next for Full Stack?',
    ],
  },
];

export const INITIAL_INTENTIONS: GentleIntention[] = [
  { id: 'int-1', text: 'Drink a glass of water before opening lecture slides', completed: true },
  { id: 'int-2', text: 'Park stray errands instead of switching tabs mid-session', completed: false },
  { id: 'int-3', text: 'Stop cleanly when the break chime sounds', completed: false },
];

export const INITIAL_DISTRACTIONS: DistractionItem[] = [
  {
    id: 'dist-1',
    text: 'Check library book renewal deadline for Tuesday',
    createdAt: '09:40 AM',
    resolved: false,
  },
  {
    id: 'dist-2',
    text: 'Reply to HCI lab partner about Thursday participant slot',
    createdAt: '10:15 AM',
    resolved: false,
  },
];

export const ROADMAP_MODULES: RoadmapModule[] = [
  {
    id: 'mod-1',
    title: 'Foundations of Human Information Processing',
    phase: 'Foundations',
    status: 'completed',
    progressPct: 100,
    estimatedHours: 14,
    description:
      'Working memory architecture, sensory buffers, Baddeley’s multicomponent model, and dual-coding principles.',
    competencies: ['Cognitive Ergonomics', 'Memory Architecture'],
    questTitle: 'Build a Visual Mental-Model Card Deck',
    resources: [
      { id: 'r-1', title: 'Baddeley (2000) Episodic Buffer Primer', type: 'Reading', duration: '25m' },
      { id: 'r-2', title: 'Working Memory Capacity Lab Worksheet', type: 'Lab', duration: '35m' },
    ],
  },
  {
    id: 'mod-2',
    title: 'Cognitive Ergonomics & Attention Budgets',
    phase: 'Core Methods',
    status: 'active',
    progressPct: 68,
    estimatedHours: 18,
    description:
      'Managing intrinsic, extraneous, and germane cognitive load across academic tools and multi-step workflows.',
    competencies: ['Cognitive Ergonomics', 'Interactive Prototyping', 'Neuro-Inclusive Design'],
    questTitle: 'Redesign a Cluttered Course Syllabus into Progressive Steps',
    resources: [
      { id: 'r-3', title: 'Sweller Cognitive Load Theory Revisited', type: 'Reading', duration: '20m' },
      { id: 'r-4', title: 'Hick’s Law & Choice Overload Audit', type: 'Case Study', duration: '30m' },
    ],
  },
  {
    id: 'mod-3',
    title: 'Neuro-Inclusive Qualitative Research Methods',
    phase: 'Core Methods',
    status: 'active',
    progressPct: 42,
    estimatedHours: 16,
    description:
      'Designing low-pressure think-aloud protocols, flexible interview pacing, and thematic affinity synthesis.',
    competencies: ['Qualitative Synthesis', 'Neuro-Inclusive Design'],
    questTitle: 'Pilot a 15-Minute Low-Friction Usability Script',
    resources: [
      { id: 'r-5', title: 'Accessible Think-Aloud Facilitation Guide', type: 'Reading', duration: '18m' },
      { id: 'r-6', title: 'Affinity Mapping Workshop Template', type: 'Lab', duration: '40m' },
    ],
  },
  {
    id: 'mod-4',
    title: 'Experimental Design & Quantitative UX Telemetry',
    phase: 'Applied Systems',
    status: 'upcoming',
    progressPct: 10,
    estimatedHours: 20,
    description:
      'Within-subjects usability experiments, task completion latency, NASA-TLX workload scales, and statistical power.',
    competencies: ['Experimental Design', 'Quantitative Telemetry'],
    questTitle: 'Design a Counterbalanced A/B Study Protocol',
    resources: [
      { id: 'r-7', title: 'NASA-TLX Workload Measurement Overview', type: 'Reading', duration: '22m' },
    ],
  },
  {
    id: 'mod-5',
    title: 'Adaptive Learning Systems Capstone',
    phase: 'Capstone',
    status: 'upcoming',
    progressPct: 0,
    estimatedHours: 28,
    description:
      'Synthesize cognitive theory, qualitative insights, and telemetry into a documented portfolio case study.',
    competencies: ['Cognitive Ergonomics', 'Qualitative Synthesis', 'Interactive Prototyping'],
    questTitle: 'Publish End-to-End UX Research Portfolio Artifact',
    resources: [
      { id: 'r-8', title: 'Research Case Study Rubric & Structure', type: 'Case Study', duration: '30m' },
    ],
  },
];

export const COMPETENCY_MATRIX: CompetencyItem[] = [
  {
    id: 'comp-1',
    name: 'Cognitive Ergonomics',
    category: 'Cognitive Science',
    currentLevel: 76,
    targetLevel: 85,
    gapNote: 'Strong theoretical base; practice applying load scoring to live UI flows.',
  },
  {
    id: 'comp-2',
    name: 'Qualitative Synthesis',
    category: 'UX Research',
    currentLevel: 64,
    targetLevel: 85,
    gapNote: 'Expand structured coding of interview transcripts into actionable themes.',
  },
  {
    id: 'comp-3',
    name: 'Neuro-Inclusive Design',
    category: 'UX Research',
    currentLevel: 72,
    targetLevel: 90,
    gapNote: 'Deepen tactile low-stimulation patterns and task-initiation scaffolds.',
  },
  {
    id: 'comp-4',
    name: 'Experimental Design',
    category: 'Systems & Data',
    currentLevel: 48,
    targetLevel: 80,
    gapNote: 'Upcoming priority: counterbalancing and within-subjects variance control.',
  },
  {
    id: 'comp-5',
    name: 'Interactive Prototyping',
    category: 'UX Research',
    currentLevel: 70,
    targetLevel: 80,
    gapNote: 'Nearly at target; refine micro-state transitions for usability tests.',
  },
  {
    id: 'comp-6',
    name: 'Quantitative Telemetry',
    category: 'Systems & Data',
    currentLevel: 42,
    targetLevel: 75,
    gapNote: 'Scheduled in Module 4: time-on-task distributions and error rates.',
  },
];

export const MILESTONE_SCHEDULE: MilestoneItem[] = [
  { id: 'ms-1', title: 'Verify Python & SQL Foundations via Skill Check', targetWeek: 'Week 1 (Done)', moduleId: 'mod-verified-full-stack-dev', completed: true },
  { id: 'ms-2', title: 'Close Basic HTML → Semantic Layout bridge', targetWeek: 'Week 2 (Current)', moduleId: 'mod-gap-basic-html', completed: false },
  { id: 'ms-3', title: 'Complete JavaScript ES6+ & Async Fetch Labs', targetWeek: 'Week 4', moduleId: 'mod-gap-javascript', completed: false },
  { id: 'ms-4', title: 'Build React Hooks & Unidirectional State Widget', targetWeek: 'Week 6', moduleId: 'mod-gap-react', completed: false },
  { id: 'ms-5', title: 'Ship Node.js REST API + SQL Capstone App', targetWeek: 'Week 9', moduleId: 'mod-capstone-full-stack-dev', completed: false },
];

export const INITIAL_RESEARCH_ARCHIVE: ResearchPaper[] = [
  {
    id: 'pap-1',
    title: 'Cognitive Load During Problem Solving: Effects on Learning',
    authors: 'John Sweller',
    year: 1988,
    topic: 'Cognitive Load Theory',
    summary: 'Foundational framework separating intrinsic task complexity from extraneous instructional friction.',
    bookmarked: true,
    read: false,
  },
  {
    id: 'pap-2',
    title: 'The Episodic Buffer: A New Component of Working Memory?',
    authors: 'Alan Baddeley',
    year: 2000,
    topic: 'Working Memory',
    summary: 'Integrates phonological and visuo-spatial representations with long-term temporal context.',
    bookmarked: true,
    read: true,
  },
  {
    id: 'pap-3',
    title: 'Designing Calm Technology for Neurodivergent University Learners',
    authors: 'K. Spiel et al.',
    year: 2022,
    topic: 'Neuro-Inclusive UX',
    summary: 'Empirical patterns for reducing sensory clutter, abrupt alarms, and punitive streak mechanics.',
    bookmarked: false,
    read: false,
  },
  {
    id: 'pap-4',
    title: 'On the Rate of Gain of Information (Hick-Hyman Law)',
    authors: 'W. E. Hick',
    year: 1952,
    topic: 'Decision Latency',
    summary: 'Logarithmic relationship between number of equally probable choices and human reaction time.',
    bookmarked: false,
    read: true,
  },
];

export const INITIAL_RESOURCES: ResourceBalance = {
  acorns: 42,
  dewdrops: 28,
  tomes: 9,
  blossoms: 19,
};

export const DISCOVERY_POINTS: DiscoveryPoint[] = [
  {
    id: 'treehouse',
    title: 'Treehouse Loft',
    xPct: 55,
    yPct: 33,
    subtitle: 'Canopy Study Loft',
    bonusLabel: 'Holds lamps, books & desk keepsakes',
  },
  {
    id: 'spring',
    title: 'Study Spring',
    xPct: 48,
    yPct: 70,
    subtitle: 'Focus Basin',
    bonusLabel: '+5 Focus Dewdrops per completed timer',
  },
  {
    id: 'lilies',
    title: 'Lily Meadow',
    xPct: 33,
    yPct: 68,
    subtitle: 'Restorative Shore',
    bonusLabel: 'Zero-Decay Sanctuary',
  },
];

export const INITIAL_DECORATIONS: HabitatDecoration[] = [
  {
    id: 'dec-mug',
    name: 'Ceramic Coffee Mug',
    visualType: 'coffee-mug',
    category: 'Cozy Desk',
    spot: 'Treehouse Loft',
    xPct: 46,
    yPct: 40,
    costType: 'acorns',
    costAmount: 10,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '10 Acorns' },
    unlocked: true,
    placed: true,
    unlockedDate: daysAgoIso(3),
  },
  {
    id: 'dec-lantern',
    name: 'Hanging Brass Lantern',
    visualType: 'hanging-lantern',
    category: 'Lighting',
    spot: 'Veranda',
    xPct: 63,
    yPct: 26,
    costType: 'acorns',
    costAmount: 14,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '14 Acorns' },
    unlocked: true,
    placed: true,
    unlockedDate: daysAgoIso(2),
  },
  {
    id: 'dec-books',
    name: 'Miniature Books',
    visualType: 'mini-books',
    category: 'Keepsakes',
    spot: 'Treehouse Loft',
    xPct: 54,
    yPct: 37,
    costType: 'tomes',
    costAmount: 3,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '3 Tomes' },
    unlocked: true,
    placed: true,
    unlockedDate: daysAgoIso(1),
  },
  {
    id: 'dec-mushrooms',
    name: 'Tiny Moss Mushrooms',
    visualType: 'tiny-mushrooms',
    category: 'Botanical',
    spot: 'Study Spring',
    xPct: 41,
    yPct: 73,
    costType: 'dewdrops',
    costAmount: 10,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '10 Dewdrops' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-flowerpot',
    name: 'Terracotta Flower Pot',
    visualType: 'flower-pot',
    category: 'Botanical',
    spot: 'Window Nook',
    xPct: 69,
    yPct: 45,
    costType: 'blossoms',
    costAmount: 8,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '8 Blossoms' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-seashell',
    name: 'Tidal Seashell',
    visualType: 'seashell',
    category: 'Keepsakes',
    spot: 'Lily Meadow',
    xPct: 29,
    yPct: 74,
    costType: 'dewdrops',
    costAmount: 12,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '12 Dewdrops' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-butterfly',
    name: 'Canopy Butterfly',
    visualType: 'butterfly',
    category: 'Botanical',
    spot: 'Lily Meadow',
    xPct: 37,
    yPct: 58,
    costType: 'blossoms',
    costAmount: 12,
    unlockRequirement: { type: 'arcadeRounds', threshold: 3, label: '3 Arcade rounds + 12 Blossoms' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-fairylights',
    name: 'String Fairy Lights',
    visualType: 'fairy-lights',
    category: 'Lighting',
    spot: 'Veranda',
    xPct: 52,
    yPct: 22,
    costType: 'acorns',
    costAmount: 16,
    unlockRequirement: { type: 'focusMinutes', threshold: 120, label: '120m Focus + 16 Acorns' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-chair',
    name: 'Tiny Oak Armchair',
    visualType: 'tiny-chair',
    category: 'Cozy Desk',
    spot: 'Treehouse Loft',
    xPct: 59,
    yPct: 44,
    costType: 'acorns',
    costAmount: 18,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '18 Acorns' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-cushion',
    name: 'Sage Linen Cushion',
    visualType: 'cushion',
    category: 'Cozy Desk',
    spot: 'Veranda',
    xPct: 65,
    yPct: 54,
    costType: 'blossoms',
    costAmount: 9,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '9 Blossoms' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-fern',
    name: 'Potted Woodland Fern',
    visualType: 'fern-plant',
    category: 'Botanical',
    spot: 'Study Spring',
    xPct: 57,
    yPct: 66,
    costType: 'dewdrops',
    costAmount: 9,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '9 Dewdrops' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-sign',
    name: 'Carved Wooden Sign',
    visualType: 'wooden-sign',
    category: 'Keepsakes',
    spot: 'Study Spring',
    xPct: 23,
    yPct: 61,
    costType: 'acorns',
    costAmount: 12,
    unlockRequirement: { type: 'tasks', threshold: 2, label: '2 Microtasks + 12 Acorns' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-rug',
    name: 'Handwoven Study Rug',
    visualType: 'woven-rug',
    category: 'Cozy Desk',
    spot: 'Treehouse Loft',
    xPct: 50,
    yPct: 51,
    costType: 'blossoms',
    costAmount: 14,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '14 Blossoms' },
    unlocked: false,
    placed: false,
  },
  {
    id: 'dec-window',
    name: 'Arched Reading Lamp & Window',
    visualType: 'reading-window',
    category: 'Lighting',
    spot: 'Window Nook',
    xPct: 74,
    yPct: 35,
    costType: 'tomes',
    costAmount: 5,
    unlockRequirement: { type: 'costOnly', threshold: 0, label: '5 Tomes' },
    unlocked: false,
    placed: false,
  },
];

export const INITIAL_GROWTH_TIMELINE: GrowthMilestone[] = [
  {
    id: 'gm-1',
    title: 'Willow Sapling Rooted',
    dateLabel: 'Day 1',
    detail: 'Completed your first 15-minute Focus Studio warm-up.',
  },
  {
    id: 'gm-2',
    title: 'Treehouse Loft Built',
    dateLabel: 'Day 4',
    detail: 'Finished Module 1 Foundations and unlocked the canopy study loft.',
  },
  {
    id: 'gm-3',
    title: 'Study Spring Awakened',
    dateLabel: 'Day 9',
    detail: 'Logged 5 calm focus sessions without skipping rest breaks.',
  },
];

export const SANCTUM_ENVIRONMENTS: SanctumEnvironment[] = [
  {
    id: 'grand-library',
    name: 'Grand Library',
    atmosphere: 'Sunlit Timber & Botanical Ferns',
    recommendedSound: 'library',
    recommendedLighting: 'warm',
    imageUrl: imgSanctumLibrary,
    gradientClass: 'from-[#2D4739] via-[#516E57] to-[#D8C7A6]',
    accentHex: '#264736',
    description: 'Tall arched oak shelves, dappled afternoon sunbeams, and quiet page turns.',
  },
  {
    id: 'astronomy-tower',
    name: 'Midnight Astronomy Tower',
    atmosphere: 'Lavender Starlight & Warm Candlelight',
    recommendedSound: 'brownNoise',
    recommendedLighting: 'twilight',
    imageUrl: imgSanctumAstronomy,
    gradientClass: 'from-[#282442] via-[#4D4575] to-[#B79E82]',
    accentHex: '#705DA0',
    description: 'Brass astrolabes, calm night sky constellations, and steady candle glow.',
  },
  {
    id: 'warm-cafe',
    name: 'Warm Café',
    atmosphere: 'Roasted Espresso & Rain on Glass',
    recommendedSound: 'rain',
    recommendedLighting: 'warm',
    gradientClass: 'from-[#5C3D2E] via-[#9C6F44] to-[#EBD8BE]',
    accentHex: '#A66832',
    description: 'Soft window rain, warm terracotta mugs, and unhurried corner booth warmth.',
  },
  {
    id: 'coastal-shore',
    name: 'Tropical Coastal Shore',
    atmosphere: 'Sea Breeze & Pale Horizon',
    recommendedSound: 'brownNoise',
    recommendedLighting: 'daylight',
    gradientClass: 'from-[#2E6166] via-[#6B9E9B] to-[#EFE7D6]',
    accentHex: '#356E73',
    description: 'Rhythmic coastal tidewash and airy sunlit linen tones for open thinking.',
  },
  {
    id: 'moss-forest',
    name: 'Enchanted Moss Forest',
    atmosphere: 'Cedar Canopy & Soft Mist',
    recommendedSound: 'forest',
    recommendedLighting: 'daylight',
    gradientClass: 'from-[#1F3A2C] via-[#4D7259] to-[#DCE6D5]',
    accentHex: '#335C47',
    description: 'Deep fern floor, gentle canopy wind, and grounded woodland stillness.',
  },
  {
    id: 'sakura-garden',
    name: 'Sakura Garden',
    atmosphere: 'Blossom Breeze & Wooden Veranda',
    recommendedSound: 'forest',
    recommendedLighting: 'warm',
    gradientClass: 'from-[#7A5978] via-[#C39EB8] to-[#FAF1EC]',
    accentHex: '#8A5F86',
    description: 'Drifting petals over a quiet cedar veranda and stone water basin.',
  },
];

export const SOUNDSCAPE_TRACKS: { id: SoundTrackId; label: string; description: string }[] = [
  { id: 'rain', label: 'Soft Window Rain', description: 'Filtered gentle rainfall texture' },
  { id: 'library', label: 'Quiet Library Air', description: 'Subtle room tone & soft warmth' },
  { id: 'forest', label: 'Willow Canopy Breeze', description: 'Slow modulating woodland air' },
  { id: 'brownNoise', label: 'Velvet Brown Noise', description: 'Deep low-frequency focus cushion' },
  { id: 'fireplace', label: 'Study Hearth', description: 'Warm ember rumble & gentle crackle' },
];

export const INITIAL_FOCUS_SESSIONS: FocusSessionRecord[] = [
  {
    id: 'fs-1',
    dateLabel: 'Today · 09:15 AM',
    isoDate: daysAgoIso(0),
    dayKey: daysAgoDayKey(0),
    taskTitle: 'Complete 6-card spaced recall deck on Dual-Coding Theory',
    durationMinutes: 25,
    mode: 'focus',
    energy: 'steady',
    rewardEarned: '+8 Acorns, +5 Dewdrops',
  },
  {
    id: 'fs-2',
    dateLabel: 'Yesterday · 04:20 PM',
    isoDate: daysAgoIso(1),
    dayKey: daysAgoDayKey(1),
    taskTitle: 'Map Baddeley working memory loops in study notes',
    durationMinutes: 45,
    mode: 'focus',
    energy: 'bright',
    rewardEarned: '+12 Acorns, +8 Dewdrops',
  },
  {
    id: 'fs-3',
    dateLabel: '2 days ago · 02:10 PM',
    isoDate: daysAgoIso(2),
    dayKey: daysAgoDayKey(2),
    taskTitle: 'Review accessible think-aloud facilitation guide',
    durationMinutes: 20,
    mode: 'focus',
    energy: 'low',
    rewardEarned: '+6 Acorns, +4 Dewdrops',
  },
  {
    id: 'fs-4',
    dateLabel: '3 days ago · 11:00 AM',
    isoDate: daysAgoIso(3),
    dayKey: daysAgoDayKey(3),
    taskTitle: 'Hick’s Law navigation branch audit',
    durationMinutes: 35,
    mode: 'focus',
    energy: 'steady',
    rewardEarned: '+10 Acorns, +6 Dewdrops',
  },
  {
    id: 'fs-5',
    dateLabel: '4 days ago · 10:05 AM',
    isoDate: daysAgoIso(4),
    dayKey: daysAgoDayKey(4),
    taskTitle: 'Module 1 Synthesis Card Deck',
    durationMinutes: 30,
    mode: 'focus',
    energy: 'bright',
    rewardEarned: '+9 Acorns, +5 Dewdrops',
  },
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'qa-1',
    gameTitle: 'Quick Quiz · Cognitive Load',
    score: 4,
    total: 5,
    dateLabel: 'Yesterday',
    isoDate: daysAgoIso(1),
  },
  {
    id: 'qa-2',
    gameTitle: 'Memory Match · Working Memory',
    score: 6,
    total: 6,
    dateLabel: '2 days ago',
    isoDate: daysAgoIso(2),
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    topic: 'Cognitive Load Theory',
    question: 'Which type of cognitive load comes from cluttered navigation, decorative noise, or unclear instructions?',
    options: [
      'Intrinsic cognitive load',
      'Extraneous cognitive load',
      'Germane cognitive load',
      'Episodic buffer load',
    ],
    correctIndex: 1,
    explanation:
      'Extraneous load arises from how information is presented rather than the inherent difficulty of the topic itself.',
  },
  {
    id: 'q-2',
    topic: 'Hick’s Law',
    question: 'According to Hick-Hyman Law, what happens to decision time as the number of equiprobable menu choices increases?',
    options: [
      'It decreases linearly',
      'It stays constant after 3 items',
      'It increases logarithmically',
      'It increases exponentially',
    ],
    correctIndex: 2,
    explanation:
      'Decision latency grows logarithmically with the number of options, which is why progressive disclosure reduces overwhelm.',
  },
  {
    id: 'q-3',
    topic: 'Dual-Coding Theory',
    question: 'Paivio’s Dual-Coding Theory suggests learners retain concepts more effectively when combining:',
    options: [
      'Two simultaneous audio tracks',
      'Verbal explanations and relevant visual diagrams',
      'Timed countdowns and flashing banners',
      'Identical repeated definitions',
    ],
    correctIndex: 1,
    explanation:
      'Pairing concise verbal cues with complementary visuals activates both verbal and imagery processing channels.',
  },
  {
    id: 'q-4',
    topic: 'UX Research Methods',
    question: 'Which interview question phrasing avoids leading the participant during a study-tool usability test?',
    options: [
      '“Don’t you agree the timer ring feels calming?”',
      '“Why was that sidebar confusing to you?”',
      '“Walk me through what you expected to happen when you clicked that.”',
      '“How much faster did you finish with this layout?”',
    ],
    correctIndex: 2,
    explanation:
      'Open, neutral prompts invite the participant’s genuine mental model without presupposing success or confusion.',
  },
  {
    id: 'q-5',
    topic: 'Neuro-Inclusive Design',
    question: 'Why are non-punitive progress systems (no decay on missed days) valuable in neuro-inclusive learning tools?',
    options: [
      'They hide all progress metrics from the student',
      'They prevent shame spirals and lower re-entry friction after rest days',
      'They eliminate the need for clear microtasks',
      'They force constant daily notifications',
    ],
    correctIndex: 1,
    explanation:
      'Preserving progress after breaks reduces avoidance anxiety and makes returning to study feel welcoming.',
  },
];

export const MEMORY_PAIRS = [
  { id: 'p-1', term: 'Intrinsic Load', match: 'Inherent complexity of the subject matter' },
  { id: 'p-2', term: 'Extraneous Load', match: 'Friction caused by poor interface layout' },
  { id: 'p-3', term: 'Chunking', match: 'Grouping items into meaningful memory units' },
  { id: 'p-4', term: 'Fitts’s Law', match: 'Target size & distance govern pointer time' },
  { id: 'p-5', term: 'Progressive Disclosure', match: 'Revealing advanced options only when needed' },
  { id: 'p-6', term: 'Phonological Loop', match: 'Short-term rehearsal of verbal & auditory info' },
];

export const FLASHCARDS = [
  {
    id: 'fc-1',
    front: 'Germane Cognitive Load',
    back: 'Mental effort devoted directly to building, refining, and automating lasting mental schemas.',
    tag: 'Cognitive Ergonomics',
  },
  {
    id: 'fc-2',
    front: 'Think-Aloud Protocol',
    back: 'A usability method where participants verbalize thoughts in real time while completing representative tasks.',
    tag: 'UX Research',
  },
  {
    id: 'fc-3',
    front: 'Zeigarnik Effect',
    back: 'Unfinished tasks stay active in working memory; writing them to a Distraction Parking Lot releases mental tension.',
    tag: 'Attention & Focus',
  },
  {
    id: 'fc-4',
    front: 'NASA-TLX',
    back: 'A multidimensional subjective workload assessment rating mental demand, temporal pressure, effort, and frustration.',
    tag: 'Quantitative Telemetry',
  },
  {
    id: 'fc-5',
    front: 'Within-Subjects Design',
    back: 'Experimental setup where every participant tests all interface conditions (requiring counterbalancing to avoid order bias).',
    tag: 'Experimental Design',
  },
];

export const CONSTELLATION_NODES = [
  {
    id: 'c-1',
    label: 'Working Memory',
    x: 50,
    y: 22,
    summary: 'Limited temporary workspace (~4 chunks) that benefits from externalized notes and calm pacing.',
    links: ['c-2', 'c-3'],
  },
  {
    id: 'c-2',
    label: 'Cognitive Load Theory',
    x: 22,
    y: 52,
    summary: 'Balances intrinsic difficulty while stripping away extraneous visual noise and competing tabs.',
    links: ['c-1', 'c-4', 'c-5'],
  },
  {
    id: 'c-3',
    label: 'Dual-Coding',
    x: 78,
    y: 50,
    summary: 'Combines concise prose with spatial diagrams so concepts anchor across two memory pathways.',
    links: ['c-1', 'c-5'],
  },
  {
    id: 'c-4',
    label: 'Hick’s Law',
    x: 32,
    y: 82,
    summary: 'Fewer visible choices at decision points lower hesitation and ease task initiation.',
    links: ['c-2', 'c-5'],
  },
  {
    id: 'c-5',
    label: 'Progressive Disclosure',
    x: 68,
    y: 82,
    summary: 'Shows only the immediate microtask first, keeping deeper roadmap details one click away.',
    links: ['c-2', 'c-3', 'c-4'],
  },
];
