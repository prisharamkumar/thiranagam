export type PageId =
  | 'today'
  | 'focus'
  | 'todos'
  | 'roadmap'
  | 'arcade'
  | 'habitat'
  | 'insights'
  | 'sanctum'
  | 'settings';

export type SettingsSectionTab = 'profile' | 'progress' | 'themes' | 'typography';

export type EnergyLevel = 'low' | 'steady' | 'bright';

export type CompanionId = 'sembu' | 'then' | 'malli' | 'pattu' | 'owl' | 'otter';

export type CompanionMood = 'idle' | 'focus' | 'break' | 'waking' | 'celebrate';

export type ThemePresetId = 'cafe' | 'rainforest' | 'beach' | 'library' | 'cabin';

export type ColorMode = 'light' | 'dark' | 'system';

export type HeadingStyle = 'editorial' | 'clean' | 'classic';

export type AvatarId = 'willow' | 'fox' | 'owl' | 'lotus' | 'lantern' | 'initials';

export type SoundTrackId =
  | 'rain'
  | 'library'
  | 'forest'
  | 'brownNoise'
  | 'fireplace';

export type LightingPreset = 'warm' | 'daylight' | 'twilight';

export type EnvironmentId =
  | 'warm-cafe'
  | 'astronomy-tower'
  | 'grand-library'
  | 'coastal-shore'
  | 'moss-forest'
  | 'sakura-garden';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type CareerRoleId =
  | 'full-stack-dev'
  | 'data-scientist'
  | 'backend-engineer'
  | 'frontend-react-dev';

export type SkillKind = 'technical' | 'soft';

export type SkillOrigin = 'self-reported' | 'assessment-verified' | 'both';

export interface SkillRecord {
  id: string;
  name: string;
  kind: SkillKind;
  selfReportedLevel: number; // 0..5
  verifiedLevel?: number; // 0..5 from graded assessment
  lastAssessedScore?: number; // 0..100
  lastAssessedAt?: string;
  origin: SkillOrigin;
}

export interface CertificationRecord {
  id: string;
  title: string;
  issuer: string;
  year: string;
  status: 'Earned' | 'In Progress';
}

export interface ProjectRecord {
  id: string;
  title: string;
  role: string;
  summary: string;
  skillsUsed: string[];
}

export interface StudentProfile {
  name: string;
  email: string;
  avatarId: AvatarId;
  university: string;
  major: string;
  year: string;
  subjects: string[];
  careerInterests: string;
  targetRoleId: CareerRoleId;
  careerNorthStar: string;
  learningGoalsSummary: string;
  skills: SkillRecord[];
  certifications: CertificationRecord[];
  projects: ProjectRecord[];
  activeCompanionId: CompanionId;
  companionNames: Record<CompanionId, string>;
  dailyFocusGoalMinutes: number;
  lowStimulationMode: boolean;
  reducedMotion: boolean;
  comfortableReadingSize: boolean;
}

export interface ThemeSettings {
  preset: ThemePresetId;
  colorMode: ColorMode;
  customAccent: string | null;
  fontSizePx: number;
  fontPreset: 'sans' | 'serif' | 'dyslexia';
  headingStyle: HeadingStyle;
  lineSpacing: 'compact' | 'comfortable' | 'relaxed';
  readingWidth: 'focused' | 'balanced' | 'spacious';
  contrast: 'standard' | 'high';
  animationIntensity: 'calm' | 'minimal' | 'off';
}

export interface LearningPreferences {
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredFormat: 'reading' | 'visual' | 'practice' | 'mixed';
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  dailyAvailabilityHours: number;
  preferredFocusMinutes: number;
  preferredBreakMinutes: number;
}

export interface ADHDPreferences {
  autoMicrotaskBreakdown: boolean;
  preferredTaskDuration: number;
  visualTimeReminders: boolean;
  bodyDoublingMode: boolean;
  oneTaskAtATime: boolean;
  cursorFollowingEyes: boolean;
  interfaceDensity: 'airy' | 'balanced' | 'compact';
  gentleCheckInPrompts: boolean;
}

export interface NotificationPreferences {
  breakChimeEnabled: boolean;
  visualTransitionCue: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  reminderFrequency: 'off' | 'gentle' | 'session';
}

export interface DeadlineGoal {
  examOrGoalName: string;
  finalDate: string;
  syllabusTopics: string;
  prioritySubjects: string;
}

export interface LastInterruptedContext {
  lastActiveTaskId: string;
  lastCompletedMicrotaskTitle: string;
  stoppedNote: string;
  updatedAt: string;
}

export interface Microtask {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  estimatedMinutes: number;
  completed: boolean;
  completedDate?: string; // YYYY-MM-DD
  energyFit: EnergyLevel;
  substeps: { id: string; text: string; done: boolean }[];
}

export interface GentleIntention {
  id: string;
  text: string;
  completed: boolean;
}

export interface DistractionItem {
  id: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface RoadmapModule {
  id: string;
  title: string;
  phase: 'Foundations' | 'Core Methods' | 'Applied Systems' | 'Capstone' | 'Revision';
  status: 'completed' | 'active' | 'upcoming';
  progressPct: number;
  estimatedHours: number;
  description: string;
  competencies: string[];
  targetSkillGap?: string;
  exercises?: string[];
  isAdaptationInserted?: boolean;
  adaptationReason?: string;
  questTitle: string;
  resources: {
    id: string;
    title: string;
    type: 'Course' | 'Tutorial' | 'Exercise' | 'Project' | 'Reading' | 'Lab' | 'Case Study';
    duration: string;
    linkedSkill?: string;
  }[];
}

export interface CompetencyItem {
  id: string;
  name: string;
  category: 'Cognitive Science' | 'UX Research' | 'Systems & Data';
  currentLevel: number;
  targetLevel: number;
  gapNote: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  targetWeek: string;
  moduleId: string;
  completed: boolean;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  topic: string;
  summary: string;
  bookmarked: boolean;
  read: boolean;
}

export interface Companion {
  id: CompanionId;
  defaultName: string;
  species: string;
  role: string;
  imageUrl: string;
  perkTitle: string;
  studyNote: string;
}

export interface ResourceBalance {
  acorns: number;
  dewdrops: number;
  tomes: number;
  blossoms: number;
}

export type CollectibleVisualType =
  | 'coffee-mug'
  | 'mini-books'
  | 'tiny-mushrooms'
  | 'hanging-lantern'
  | 'flower-pot'
  | 'seashell'
  | 'butterfly'
  | 'fairy-lights'
  | 'tiny-chair'
  | 'cushion'
  | 'fern-plant'
  | 'wooden-sign'
  | 'woven-rug'
  | 'reading-window';

export interface HabitatDecoration {
  id: string;
  name: string;
  visualType: CollectibleVisualType;
  category: 'Cozy Desk' | 'Botanical' | 'Lighting' | 'Keepsakes';
  spot: 'Treehouse Loft' | 'Study Spring' | 'Lily Meadow' | 'Veranda' | 'Window Nook';
  xPct: number;
  yPct: number;
  costType: keyof ResourceBalance;
  costAmount: number;
  unlockRequirement?: {
    type: 'tasks' | 'focusMinutes' | 'arcadeRounds' | 'costOnly';
    threshold: number;
    label: string;
  };
  unlocked: boolean;
  placed: boolean;
  unlockedDate?: string;
}

export interface DiscoveryPoint {
  id: 'treehouse' | 'spring' | 'lilies';
  title: string;
  xPct: number;
  yPct: number;
  subtitle: string;
  bonusLabel: string;
}

export interface GrowthMilestone {
  id: string;
  title: string;
  dateLabel: string;
  detail: string;
}

export interface SanctumEnvironment {
  id: EnvironmentId;
  name: string;
  atmosphere: string;
  recommendedSound: SoundTrackId;
  recommendedLighting: LightingPreset;
  imageUrl?: string;
  gradientClass: string;
  accentHex: string;
  description: string;
}

export interface FocusSessionRecord {
  id: string;
  dateLabel: string;
  isoDate: string; // YYYY-MM-DD
  dayKey: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  taskTitle: string;
  durationMinutes: number;
  mode: TimerMode;
  energy: EnergyLevel;
  rewardEarned: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  gameTitle: string;
  score: number;
  total: number;
  dateLabel: string;
  isoDate?: string;
}

export type ArcadeGameId =
  | 'quick-quiz'
  | 'memory-match'
  | 'flashcard-quest'
  | 'beat-the-clock'
  | 'boss-battle'
  | 'daily-mystery'
  | 'constellations';

export interface RewardBurstEvent {
  id: string;
  type: 'honey' | 'blossom' | 'acorn' | 'lantern' | 'unlock';
  label: string;
  amountText?: string;
}

export interface CareerSkillRequirement {
  skillName: string;
  kind: SkillKind;
  requiredLevel: number; // 1..5
  weight: number; // percentage weight summing to 100
  category: string;
  aliases?: string[];
}

export interface CareerRoleDefinition {
  id: CareerRoleId;
  title: string;
  tagline: string;
  summary: string;
  requirements: CareerSkillRequirement[];
}

export interface SkillAssessmentQuestion {
  id: string;
  skillName: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillAssessmentRecord {
  id: string;
  skillName: string;
  score: number;
  total: number;
  pct: number;
  previousEffectiveLevel: number;
  newVerifiedLevel: number;
  timestampLabel: string;
  triggeredAdaptation: boolean;
  note: string;
}

export interface SkillChangeRecord {
  id: string;
  skillName: string;
  fromLevel: number;
  toLevel: number;
  source: 'self-update' | 'assessment' | 'adaptation';
  note: string;
  timestampLabel: string;
}

export type AIExecutionMode = 'live-gemini' | 'demo-mode' | 'error';

export interface GeminiHealthStatus {
  checking: boolean;
  configured: boolean;
  connected: boolean;
  model: string;
  mode: AIExecutionMode;
  message: string;
  latencyMs?: number;
  lastCheckedAt?: string;
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'mentor';
  text: string;
  timestampLabel: string;
  referencedWeaknesses?: string[];
  suggestedActions?: string[];
  executionStatus?: 'live-gemini' | 'demo-fallback' | 'error';
  modelUsed?: string;
  latencyMs?: number;
}

export interface SkillVerificationComparison {
  skillName: string;
  kind: SkillKind;
  selfReportedLevel: number;
  verifiedLevel: number | null;
  effectiveLevel: number;
  verificationStatus: 'verified' | 'self-reported-only' | 'needs-revision' | 'missing';
  discrepancyNote: string;
}

export interface SkillAnalystOutput {
  strengths: { skillName: string; effectiveLevel: number; evidence: string }[];
  weaknesses: { skillName: string; effectiveLevel: number; reason: string }[];
  missingSkills: string[];
  comparisons: SkillVerificationComparison[];
  credentialsSummary: string;
}

export interface ScoreDerivationRow {
  skillName: string;
  weight: number;
  requiredLevel: number;
  effectiveLevel: number;
  verificationTag: string;
  pointsEarned: number;
  maxPoints: number;
}

export interface CareerMatchingOutput {
  roleId: CareerRoleId;
  roleTitle: string;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  readinessScore: number;
  scoreFormulaExplanation: string;
  scoreDerivation: ScoreDerivationRow[];
}

export interface LearningPlannerOutput {
  orderedGapPriorities: string[];
  generatedModules: RoadmapModule[];
  gapToResourceMap: {
    skillGap: string;
    courseOrTutorial: string;
    practicalExercise: string;
    projectDeliverable: string;
  }[];
  plannerSummary: string;
}

export interface ProgressEvaluatorOutput {
  needsRoadmapAdjustment: boolean;
  detectedRegressionSkills: string[];
  averageAssessmentPct: number | null;
  roadmapCompletionPct: number;
  adjustmentReason: string;
  requestedChanges?: string[];
  recommendedActions: string[];
}

export interface AgentTrace<TInput = unknown, TOutput = unknown> {
  agentId: 'skill-analyst' | 'career-matching' | 'learning-planner' | 'progress-evaluator';
  agentName: string;
  responsibility: string;
  executionStatus: 'live-gemini' | 'demo-fallback' | 'error';
  modelUsed?: string;
  latencyMs?: number;
  modeLabel: string;
  inputSummary: string;
  outputSummary: string;
  handoffTo: string;
  input: TInput;
  output: TOutput;
}

export interface AgentPipelineResult {
  runId: string;
  executedAtLabel: string;
  executionMode: AIExecutionMode;
  geminiConfigured: boolean;
  modelUsed?: string;
  errorDetail?: string;
  modeBanner: string;
  traces: [
    AgentTrace<unknown, SkillAnalystOutput>,
    AgentTrace<unknown, CareerMatchingOutput>,
    AgentTrace<unknown, LearningPlannerOutput>,
    AgentTrace<unknown, ProgressEvaluatorOutput>
  ];
  finalCombinedRecommendation: string;
  adaptationApplied: boolean;
}


