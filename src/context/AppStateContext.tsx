import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  COMPANIONS,
  DEFAULT_ADHD_PREFERENCES,
  DEFAULT_COMPANION_NAMES,
  DEFAULT_DEADLINE_GOAL,
  DEFAULT_LEARNING_PREFERENCES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_PROFILE,
  DEFAULT_THEME_SETTINGS,
  INITIAL_DECORATIONS,
  INITIAL_DISTRACTIONS,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_GROWTH_TIMELINE,
  INITIAL_INTENTIONS,
  INITIAL_MENTOR_MESSAGES,
  INITIAL_MICROTASKS,
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_RESEARCH_ARCHIVE,
  INITIAL_RESOURCES,
  INITIAL_SKILL_ASSESSMENTS,
  INITIAL_SKILL_HISTORY,
  MILESTONE_SCHEDULE,
  formatIsoDate,
  getDayKeyFromDate,
} from '../data/demoData';
import { getCareerRoleById } from '../data/careerRoles';
import {
  generateMentorResponse,
  runAgentCollaborationPipeline,
} from '../agents/specialistAgents';
import {
  ADHDPreferences,
  AgentPipelineResult,
  AgentTrace,
  CareerMatchingOutput,
  CareerRoleId,
  CertificationRecord,
  CompanionId,
  CompanionMood,
  DeadlineGoal,
  DistractionItem,
  EnergyLevel,
  EnvironmentId,
  FocusSessionRecord,
  GeminiHealthStatus,
  GentleIntention,
  GrowthMilestone,
  HabitatDecoration,
  LastInterruptedContext,
  LearningPlannerOutput,
  LearningPreferences,
  LightingPreset,
  MentorMessage,
  Microtask,
  MilestoneItem,
  NotificationPreferences,
  PageId,
  ProgressEvaluatorOutput,
  ProjectRecord,
  QuizAttempt,
  ResearchPaper,
  ResourceBalance,
  RewardBurstEvent,
  RoadmapModule,
  SettingsSectionTab,
  SkillAnalystOutput,
  SkillAssessmentRecord,
  SkillChangeRecord,
  SkillKind,
  SoundTrackId,
  StudentProfile,
  ThemePresetId,
  ThemeSettings,
  TimerMode,
} from '../types';
import { soundEngine } from '../utils/soundEngine';

const LEGACY_STORAGE_KEY = 'skillpilot_workspace_v1';
const STORAGE_KEY = 'thiranagam_workspace_v1';

interface PersistedState {
  schemaVersion: number;
  profile: StudentProfile;
  themeSettings: ThemeSettings;
  learningPreferences: LearningPreferences;
  adhdPreferences: ADHDPreferences;
  notificationPreferences: NotificationPreferences;
  deadlineGoal: DeadlineGoal;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
  signedOutDemo: boolean;
  energy: EnergyLevel;
  honeyDrops: number;
  microtasks: Microtask[];
  intentions: GentleIntention[];
  distractions: DistractionItem[];
  brainDump: string;
  modules: RoadmapModule[];
  milestones: MilestoneItem[];
  papers: ResearchPaper[];
  resources: ResourceBalance;
  decorations: HabitatDecoration[];
  growthTimeline: GrowthMilestone[];
  focusSessions: FocusSessionRecord[];
  quizAttempts: QuizAttempt[];
  activeEnvironment: EnvironmentId;
  activeLighting: LightingPreset;
  activeSoundTrack: SoundTrackId;
  soundVolume: number;
  activeFocusTaskId: string;
  lastInterruptedContext: LastInterruptedContext;
  skillAssessments: SkillAssessmentRecord[];
  skillLevelHistory: SkillChangeRecord[];
  mentorMessages: MentorMessage[];
  agentPipelineRun: AgentPipelineResult;
  adaptationBanner: string | null;
}

const mapLegacyCompanionId = (raw?: string): CompanionId => {
  if (raw === 'bramble' || raw === 'sembu') return 'sembu';
  if (raw === 'then') return 'then';
  if (raw === 'malli') return 'malli';
  if (raw === 'pattu') return 'pattu';
  if (raw === 'pip' || raw === 'owl') return 'owl';
  if (raw === 'moss' || raw === 'otter') return 'otter';
  return 'pattu';
};

const mapLegacyThemePreset = (raw?: string): ThemePresetId => {
  if (raw === 'cafe' || raw === 'warm-cafe') return 'cafe';
  if (raw === 'rainforest' || raw === 'whispering-willow' || raw === 'sakura-morning') {
    return 'rainforest';
  }
  if (raw === 'beach' || raw === 'ocean-calm') return 'beach';
  if (raw === 'library' || raw === 'midnight-library') return 'library';
  if (raw === 'cabin' || raw === 'lavender-dreams' || raw === 'minimal-focus') return 'cabin';
  return 'library';
};

const computeContrastInk = (hex: string): string => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#161b18' : '#faf6ee';
};

const createDefaults = (): PersistedState => {
  const initialProfile: StudentProfile = {
    ...DEFAULT_PROFILE,
    skills: DEFAULT_PROFILE.skills.map((s) => ({ ...s })),
    certifications: DEFAULT_PROFILE.certifications.map((c) => ({ ...c })),
    projects: DEFAULT_PROFILE.projects.map((p) => ({ ...p, skillsUsed: [...p.skillsUsed] })),
    companionNames: { ...DEFAULT_COMPANION_NAMES },
  };
  const initialPipeline = runAgentCollaborationPipeline({
    profile: initialProfile,
    assessments: INITIAL_SKILL_ASSESSMENTS,
    currentModules: [],
  });
  const initialModules = initialPipeline.traces[2].output.generatedModules;

  return {
    schemaVersion: 5,
    profile: initialProfile,
    themeSettings: { ...DEFAULT_THEME_SETTINGS },
    learningPreferences: { ...DEFAULT_LEARNING_PREFERENCES },
    adhdPreferences: { ...DEFAULT_ADHD_PREFERENCES },
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    deadlineGoal: { ...DEFAULT_DEADLINE_GOAL },
    onboardingCompleted: true,
    onboardingSkipped: false,
    signedOutDemo: false,
    energy: 'steady',
    honeyDrops: 3,
    microtasks: INITIAL_MICROTASKS,
    intentions: INITIAL_INTENTIONS,
    distractions: INITIAL_DISTRACTIONS,
    brainDump:
      'Bridge Python & SQL strengths into async JavaScript and React state hooks. Remember to run a quick React Skill Check after Module 3.',
    modules: initialModules,
    milestones: MILESTONE_SCHEDULE,
    papers: INITIAL_RESEARCH_ARCHIVE,
    resources: INITIAL_RESOURCES,
    decorations: INITIAL_DECORATIONS,
    growthTimeline: INITIAL_GROWTH_TIMELINE,
    focusSessions: INITIAL_FOCUS_SESSIONS,
    quizAttempts: INITIAL_QUIZ_ATTEMPTS,
    activeEnvironment: 'grand-library',
    activeLighting: 'warm',
    activeSoundTrack: 'rain',
    soundVolume: 0.35,
    activeFocusTaskId: 'mt-1',
    lastInterruptedContext: {
      lastActiveTaskId: 'mt-1',
      lastCompletedMicrotaskTitle: 'Complete SQL JOIN & GROUP BY aggregation verification check',
      stoppedNote:
        'SQL verified at 75%; next focus block bridges Python list comprehensions to JS array pipelines.',
      updatedAt: 'Earlier today',
    },
    skillAssessments: INITIAL_SKILL_ASSESSMENTS,
    skillLevelHistory: INITIAL_SKILL_HISTORY,
    mentorMessages: INITIAL_MENTOR_MESSAGES,
    agentPipelineRun: initialPipeline,
    adaptationBanner: null,
  };
};

const mergeDecorations = (stored?: Partial<HabitatDecoration>[]): HabitatDecoration[] => {
  if (!Array.isArray(stored) || stored.length === 0) return INITIAL_DECORATIONS;
  const legacyUnlockIds = new Set(stored.filter((d) => d.unlocked).map((d) => d.id));
  const byId = new Map(stored.map((d) => [d.id, d]));

  return INITIAL_DECORATIONS.map((item) => {
    const match = byId.get(item.id);
    if (match) {
      return {
        ...item,
        unlocked: Boolean(match.unlocked),
        placed: Boolean(match.placed),
        spot: match.spot ?? item.spot,
        xPct: typeof match.xPct === 'number' ? match.xPct : item.xPct,
        yPct: typeof match.yPct === 'number' ? match.yPct : item.yPct,
        unlockedDate: match.unlockedDate ?? item.unlockedDate,
      };
    }
    // Preserve Phase 3 legacy unlocks mapped onto matching new collectibles
    if (item.id === 'dec-lantern' && legacyUnlockIds.has('dec-1')) {
      return { ...item, unlocked: true, placed: true };
    }
    if (item.id === 'dec-mug' && legacyUnlockIds.has('dec-2')) {
      return { ...item, unlocked: true, placed: true };
    }
    return item;
  });
};

const getInitialPersistedState = (): PersistedState => {
  const defaults = createDefaults();
  try {
    const rawCurrent = localStorage.getItem(STORAGE_KEY);
    const rawLegacy = !rawCurrent ? localStorage.getItem(LEGACY_STORAGE_KEY) : null;
    const raw = rawCurrent ?? rawLegacy;
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<PersistedState> & {
      profile?: Partial<StudentProfile> & { activeCompanionId?: string };
      themeSettings?: Partial<ThemeSettings> & { preset?: string };
    };

    const isUpgradingFromPreHackathon = (parsed.schemaVersion ?? 0) < 5;

    const migratedCompanionId = mapLegacyCompanionId(parsed.profile?.activeCompanionId);
    const mergedProfile: StudentProfile = isUpgradingFromPreHackathon
      ? {
          ...defaults.profile,
          activeCompanionId: migratedCompanionId,
          companionNames: {
            ...DEFAULT_COMPANION_NAMES,
            ...(parsed.profile?.companionNames ?? {}),
          },
          lowStimulationMode: parsed.profile?.lowStimulationMode ?? defaults.profile.lowStimulationMode,
          reducedMotion: parsed.profile?.reducedMotion ?? defaults.profile.reducedMotion,
          comfortableReadingSize:
            parsed.profile?.comfortableReadingSize ?? defaults.profile.comfortableReadingSize,
        }
      : {
          ...defaults.profile,
          ...(parsed.profile ?? {}),
          targetRoleId: parsed.profile?.targetRoleId ?? defaults.profile.targetRoleId,
          skills: Array.isArray(parsed.profile?.skills)
            ? parsed.profile.skills
            : defaults.profile.skills,
          certifications: Array.isArray(parsed.profile?.certifications)
            ? parsed.profile.certifications
            : defaults.profile.certifications,
          projects: Array.isArray(parsed.profile?.projects)
            ? parsed.profile.projects
            : defaults.profile.projects,
          activeCompanionId: migratedCompanionId,
          companionNames: {
            ...DEFAULT_COMPANION_NAMES,
            ...(parsed.profile?.companionNames ?? {}),
          },
        };

    const todayIso = formatIsoDate(new Date());
    const migratedSessions: FocusSessionRecord[] = Array.isArray(parsed.focusSessions)
      ? parsed.focusSessions.map((s, idx) => {
          if (s.isoDate) return s;
          const fallbackDate = new Date();
          fallbackDate.setDate(fallbackDate.getDate() - Math.min(idx, 6));
          return {
            ...s,
            isoDate: s.dateLabel?.startsWith('Today') ? todayIso : formatIsoDate(fallbackDate),
          };
        })
      : defaults.focusSessions;

    const migratedQuizzes: QuizAttempt[] = Array.isArray(parsed.quizAttempts)
      ? parsed.quizAttempts.map((q) => ({
          ...q,
          isoDate: q.isoDate ?? todayIso,
        }))
      : defaults.quizAttempts;

    const migratedTasks: Microtask[] = isUpgradingFromPreHackathon
      ? defaults.microtasks
      : Array.isArray(parsed.microtasks)
        ? parsed.microtasks.map((t) => ({
            ...t,
            completedDate: t.completed ? t.completedDate ?? todayIso : undefined,
          }))
        : defaults.microtasks;

    const assessments = isUpgradingFromPreHackathon
      ? defaults.skillAssessments
      : Array.isArray(parsed.skillAssessments)
        ? parsed.skillAssessments
        : defaults.skillAssessments;

    const pipelineRun = isUpgradingFromPreHackathon || !parsed.agentPipelineRun
      ? runAgentCollaborationPipeline({
          profile: mergedProfile,
          assessments,
          currentModules: isUpgradingFromPreHackathon
            ? defaults.modules
            : parsed.modules ?? defaults.modules,
        })
      : parsed.agentPipelineRun;

    return {
      ...defaults,
      ...parsed,
      schemaVersion: 5,
      onboardingCompleted: true,
      profile: mergedProfile,
      themeSettings: {
        ...defaults.themeSettings,
        ...(parsed.themeSettings ?? {}),
        preset: mapLegacyThemePreset(parsed.themeSettings?.preset),
      },
      learningPreferences: {
        ...defaults.learningPreferences,
        ...(parsed.learningPreferences ?? {}),
      },
      adhdPreferences: {
        ...defaults.adhdPreferences,
        ...(parsed.adhdPreferences ?? {}),
      },
      notificationPreferences: {
        ...defaults.notificationPreferences,
        ...(parsed.notificationPreferences ?? {}),
      },
      deadlineGoal: isUpgradingFromPreHackathon
        ? defaults.deadlineGoal
        : {
            ...defaults.deadlineGoal,
            ...(parsed.deadlineGoal ?? {}),
          },
      modules: isUpgradingFromPreHackathon
        ? defaults.modules
        : Array.isArray(parsed.modules) && parsed.modules.length > 0
          ? parsed.modules
          : defaults.modules,
      milestones: isUpgradingFromPreHackathon
        ? defaults.milestones
        : parsed.milestones ?? defaults.milestones,
      resources: {
        ...defaults.resources,
        ...(parsed.resources ?? {}),
      },
      decorations: mergeDecorations(parsed.decorations),
      focusSessions: migratedSessions,
      quizAttempts: migratedQuizzes,
      microtasks: migratedTasks,
      skillAssessments: assessments,
      skillLevelHistory: isUpgradingFromPreHackathon
        ? defaults.skillLevelHistory
        : parsed.skillLevelHistory ?? defaults.skillLevelHistory,
      mentorMessages: isUpgradingFromPreHackathon
        ? defaults.mentorMessages
        : parsed.mentorMessages ?? defaults.mentorMessages,
      agentPipelineRun: pipelineRun,
      adaptationBanner: isUpgradingFromPreHackathon ? null : parsed.adaptationBanner ?? null,
      lastInterruptedContext: isUpgradingFromPreHackathon
        ? defaults.lastInterruptedContext
        : {
            ...defaults.lastInterruptedContext,
            ...(parsed.lastInterruptedContext ?? {}),
          },
    };
  } catch {
    return defaults;
  }
};

interface AppStateContextValue extends PersistedState {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  settingsTab: SettingsSectionTab;
  setSettingsTab: (tab: SettingsSectionTab) => void;
  openThemeStudio: () => void;
  soundPlaying: boolean;
  toggleSoundPlaying: () => void;
  selectSoundTrack: (track: SoundTrackId) => void;
  setSoundVolume: (vol: number) => void;
  setEnvironment: (env: EnvironmentId) => void;
  setLighting: (lighting: LightingPreset) => void;
  setEnergy: (energy: EnergyLevel) => void;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  updateThemeSettings: (patch: Partial<ThemeSettings>) => void;
  resetThemeSettings: () => void;
  updateLearningPreferences: (patch: Partial<LearningPreferences>) => void;
  updateADHDPreferences: (patch: Partial<ADHDPreferences>) => void;
  updateNotificationPreferences: (patch: Partial<NotificationPreferences>) => void;
  updateDeadlineGoal: (patch: Partial<DeadlineGoal>) => void;
  setCompanion: (id: CompanionId) => void;
  renameCompanion: (id: CompanionId, displayName: string) => void;
  getCompanionDisplayName: (id: CompanionId) => string;
  toggleLowStimulation: () => void;
  toggleMicrotask: (id: string) => void;
  addMicrotask: (title: string, estimatedMinutes: number, moduleId?: string) => void;
  editMicrotask: (id: string, patch: { title?: string; estimatedMinutes?: number; moduleId?: string }) => void;
  deleteMicrotask: (id: string) => void;
  toggleSubstep: (taskId: string, substepId: string) => void;
  editSubstep: (taskId: string, substepId: string, text: string) => void;
  deleteSubstep: (taskId: string, substepId: string) => void;
  addSubstepsToTask: (taskId: string, steps: string[]) => void;
  toggleIntention: (id: string) => void;
  addDistraction: (text: string) => void;
  toggleDistractionResolved: (id: string) => void;
  clearResolvedDistractions: () => void;
  setBrainDump: (text: string) => void;
  setActiveFocusTaskId: (id: string) => void;
  openTaskInFocusStudio: (taskId: string) => void;
  pendingTwoMinuteWarmup: boolean;
  clearPendingWarmup: () => void;
  startTwoMinuteWarmup: (taskId?: string) => void;
  // Shared live focus timer + companion mood across all pages
  timerMode: TimerMode;
  timerDurations: Record<TimerMode, number>;
  timerSecondsLeft: number;
  timerRunning: boolean;
  timerHasStarted: boolean;
  isTwoMinuteWarmup: boolean;
  sessionToast: string | null;
  dismissSessionToast: () => void;
  setSessionToastMessage: (msg: string | null) => void;
  switchTimerMode: (mode: TimerMode) => void;
  startOrResumeTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  adjustTimerMinutes: (deltaMinutes: number) => void;
  setCustomTimerDuration: (minutes: number) => void;
  triggerTwoMinuteWarmupInPlace: () => void;
  companionMood: CompanionMood;
  triggerCompanionCelebrate: () => void;
  companionDockMinimized: boolean;
  setCompanionDockMinimized: (minimized: boolean) => void;
  updateInterruptedContext: (patch: Partial<LastInterruptedContext>) => void;
  restartModalOpen: boolean;
  setRestartModalOpen: (open: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  signOutDemoSession: () => void;
  resumeDemoSession: () => void;
  completeFocusSession: (durationMinutes: number, mode: TimerMode, taskTitle: string) => void;
  canUnlockDecoration: (dec: HabitatDecoration) => {
    eligible: boolean;
    affordable: boolean;
    requirementMet: boolean;
  };
  unlockDecoration: (id: string) => boolean;
  togglePlaceDecoration: (id: string) => void;
  moveDecoration: (
    id: string,
    xPct: number,
    yPct: number,
    spot?: HabitatDecoration['spot']
  ) => void;
  togglePaperBookmark: (id: string) => void;
  togglePaperRead: (id: string) => void;
  toggleMilestone: (id: string) => void;
  recordArcadeResult: (
    gameTitle: string,
    score: number,
    total: number,
    blossomsEarned: number,
    tomesEarned?: number
  ) => void;
  recentRewardBurst: RewardBurstEvent | null;
  dismissRewardBurst: () => void;
  exportWorkspaceJson: () => void;
  resetDemoWorkspace: () => void;
  upsertProfileSkill: (name: string, kind: SkillKind, selfReportedLevel: number) => void;
  removeProfileSkill: (id: string) => void;
  addCertification: (cert: Omit<CertificationRecord, 'id'>) => void;
  removeCertification: (id: string) => void;
  addProject: (proj: Omit<ProjectRecord, 'id'>) => void;
  removeProject: (id: string) => void;
  changeTargetRole: (roleId: CareerRoleId) => void;
  submitSkillAssessment: (
    skillName: string,
    score: number,
    total: number,
    note?: string
  ) => SkillAssessmentRecord;
  rerunAgentPipeline: (syncModules?: boolean) => Promise<void>;
  runDemoFallbackPipeline: (syncModules?: boolean) => void;
  askMentor: (question: string) => Promise<void>;
  checkGeminiHealth: (probe?: boolean) => Promise<GeminiHealthStatus>;
  geminiHealth: GeminiHealthStatus;
  pipelineLoading: boolean;
  pipelineProgressLabel: string | null;
  mentorLoading: boolean;
  aiErrorMessage: string | null;
  dismissAiError: () => void;
  dismissAdaptationBanner: () => void;
  totalFocusMinutesToday: number;
  totalFocusMinutesAllTime: number;
  overallRoadmapPct: number;
  resolvedColorMode: 'light' | 'dark';
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('today');
  const [settingsTab, setSettingsTab] = useState<SettingsSectionTab>('profile');
  const [state, setState] = useState<PersistedState>(getInitialPersistedState);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [pendingTwoMinuteWarmup, setPendingTwoMinuteWarmup] = useState(false);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [recentRewardBurst, setRecentRewardBurst] = useState<RewardBurstEvent | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(
    () => !state.onboardingCompleted && !state.onboardingSkipped && !state.signedOutDemo
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  // Shared live Focus Timer & Companion Mood state (runs across every route)
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timerDurations, setTimerDurations] = useState<Record<TimerMode, number>>(() => ({
    focus: state.learningPreferences.preferredFocusMinutes || 25,
    shortBreak: state.learningPreferences.preferredBreakMinutes || 5,
    longBreak: 15,
  }));
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(
    () => (state.learningPreferences.preferredFocusMinutes || 25) * 60
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerHasStarted, setTimerHasStarted] = useState(false);
  const [isTwoMinuteWarmup, setIsTwoMinuteWarmup] = useState(false);
  const [sessionToast, setSessionToast] = useState<string | null>(null);
  const [justCelebrated, setJustCelebrated] = useState(false);
  const [companionDockMinimized, setCompanionDockMinimized] = useState(false);

  const [geminiHealth, setGeminiHealth] = useState<GeminiHealthStatus>({
    checking: true,
    configured: false,
    connected: false,
    model: 'gemini-4-hydrogen',
    mode: 'demo-mode',
    message: 'Checking server Gemini API status...',
  });
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineProgressLabel, setPipelineProgressLabel] = useState<string | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const geminiHealthRef = useRef(geminiHealth);
  geminiHealthRef.current = geminiHealth;
  const orchestrationSeqRef = useRef(0);

  const openThemeStudio = () => {
    setSettingsTab('themes');
    setActivePage('settings');
  };

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedColorMode: 'light' | 'dark' =
    state.themeSettings.colorMode === 'system'
      ? systemPrefersDark
        ? 'dark'
        : 'light'
      : state.themeSettings.colorMode;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  // Apply Global Theme Engine + Typography + Accessibility tokens to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.themeSettings.preset);
    root.setAttribute('data-color-mode', resolvedColorMode);
    if (resolvedColorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-font-preset', state.themeSettings.fontPreset);
    root.setAttribute('data-heading-style', state.themeSettings.headingStyle);
    root.setAttribute('data-contrast', state.themeSettings.contrast);
    root.setAttribute('data-anim', state.themeSettings.animationIntensity);
    root.setAttribute('data-low-stim', state.profile.lowStimulationMode ? 'true' : 'false');
    root.setAttribute('data-reduced-motion', state.profile.reducedMotion ? 'true' : 'false');

    const baseFont = state.profile.comfortableReadingSize
      ? Math.max(17, state.themeSettings.fontSizePx)
      : state.themeSettings.fontSizePx;
    root.style.fontSize = `${baseFont}px`;

    const lineHeightMap = {
      compact: '1.4',
      comfortable: '1.58',
      relaxed: '1.8',
    };
    root.style.setProperty('--sp-line-height', lineHeightMap[state.themeSettings.lineSpacing]);

    const widthMap = {
      focused: '960px',
      balanced: '1220px',
      spacious: '1340px',
    };
    root.style.setProperty('--sp-container-max', widthMap[state.themeSettings.readingWidth]);

    if (state.themeSettings.customAccent) {
      root.style.setProperty('--sp-accent', state.themeSettings.customAccent);
      root.style.setProperty('--sp-accent-hover', state.themeSettings.customAccent);
      root.style.setProperty('--sp-accent-ink', computeContrastInk(state.themeSettings.customAccent));
    } else {
      root.style.removeProperty('--sp-accent');
      root.style.removeProperty('--sp-accent-hover');
      root.style.removeProperty('--sp-accent-ink');
    }
  }, [
    state.themeSettings,
    state.profile.lowStimulationMode,
    state.profile.reducedMotion,
    state.profile.comfortableReadingSize,
    resolvedColorMode,
  ]);

  useEffect(() => {
    return () => {
      soundEngine.stop();
    };
  }, []);

  const triggerBurst = (event: Omit<RewardBurstEvent, 'id'>, chimeKind: 'reward' | 'unlock' | 'break' = 'reward') => {
    const id = `burst-${Date.now()}`;
    setRecentRewardBurst({ ...event, id });
    if (state.notificationPreferences.breakChimeEnabled && !state.profile.lowStimulationMode) {
      soundEngine.playGentleChime(chimeKind, true);
    }
    window.setTimeout(() => {
      setRecentRewardBurst((curr) => (curr?.id === id ? null : curr));
    }, 3400);
  };

  const dismissRewardBurst = () => setRecentRewardBurst(null);

  const toggleSoundPlaying = () => {
    if (soundPlaying) {
      soundEngine.stop();
      setSoundPlaying(false);
    } else {
      soundEngine.start(state.activeSoundTrack, state.soundVolume);
      setSoundPlaying(true);
    }
  };

  const selectSoundTrack = (track: SoundTrackId) => {
    setState((prev) => ({ ...prev, activeSoundTrack: track }));
    if (soundPlaying) {
      soundEngine.start(track, state.soundVolume);
    }
  };

  const setSoundVolume = (vol: number) => {
    const clamped = Math.min(1, Math.max(0, vol));
    setState((prev) => ({ ...prev, soundVolume: clamped }));
    soundEngine.setVolume(clamped);
  };

  const setEnvironment = (env: EnvironmentId) => {
    setState((prev) => ({ ...prev, activeEnvironment: env }));
  };

  const setLighting = (lighting: LightingPreset) => {
    setState((prev) => ({ ...prev, activeLighting: lighting }));
  };

  const setEnergy = (energy: EnergyLevel) => {
    setState((prev) => ({ ...prev, energy }));
  };

  const updateProfile = (patch: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  };

  const updateThemeSettings = (patch: Partial<ThemeSettings>) => {
    setState((prev) => ({
      ...prev,
      themeSettings: { ...prev.themeSettings, ...patch },
    }));
  };

  const resetThemeSettings = () => {
    setState((prev) => ({
      ...prev,
      themeSettings: { ...DEFAULT_THEME_SETTINGS },
    }));
  };

  const updateLearningPreferences = (patch: Partial<LearningPreferences>) => {
    setState((prev) => ({
      ...prev,
      learningPreferences: { ...prev.learningPreferences, ...patch },
    }));
  };

  const updateADHDPreferences = (patch: Partial<ADHDPreferences>) => {
    setState((prev) => ({
      ...prev,
      adhdPreferences: { ...prev.adhdPreferences, ...patch },
    }));
  };

  const updateNotificationPreferences = (patch: Partial<NotificationPreferences>) => {
    setState((prev) => ({
      ...prev,
      notificationPreferences: { ...prev.notificationPreferences, ...patch },
    }));
  };

  const updateDeadlineGoal = (patch: Partial<DeadlineGoal>) => {
    setState((prev) => ({
      ...prev,
      deadlineGoal: { ...prev.deadlineGoal, ...patch },
    }));
  };

  const setCompanion = (id: CompanionId) => {
    updateProfile({ activeCompanionId: id });
  };

  const renameCompanion = (id: CompanionId, displayName: string) => {
    const trimmed = displayName.trim();
    const fallback = COMPANIONS.find((c) => c.id === id)?.defaultName ?? 'Companion';
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        companionNames: {
          ...prev.profile.companionNames,
          [id]: trimmed || fallback,
        },
      },
    }));
  };

  const getCompanionDisplayName = (id: CompanionId) => {
    return (
      state.profile.companionNames?.[id] ||
      COMPANIONS.find((c) => c.id === id)?.defaultName ||
      'Companion'
    );
  };

  const toggleLowStimulation = () => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        lowStimulationMode: !prev.profile.lowStimulationMode,
      },
    }));
  };

  const toggleMicrotask = (id: string) => {
    const target = state.microtasks.find((t) => t.id === id);
    if (!target) return;
    const nowCompleted = !target.completed;
    const todayIso = formatIsoDate(new Date());
    const nextHoneyDrops = Math.max(0, state.honeyDrops + (nowCompleted ? 1 : -1));
    const milestoneReached = nowCompleted && nextHoneyDrops > 0 && nextHoneyDrops % 5 === 0;
    const acornDelta = nowCompleted ? 4 + (milestoneReached ? 5 : 0) : -4;
    const dewDelta = nowCompleted ? 2 : -2;

    setState((prev) => ({
      ...prev,
      honeyDrops: Math.max(0, prev.honeyDrops + (nowCompleted ? 1 : -1)),
      microtasks: prev.microtasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: nowCompleted,
              completedDate: nowCompleted ? todayIso : undefined,
            }
          : t
      ),
      resources: {
        ...prev.resources,
        acorns: Math.max(0, prev.resources.acorns + acornDelta),
        dewdrops: Math.max(0, prev.resources.dewdrops + dewDelta),
      },
      modules: prev.modules.map((m) => {
        if (m.id !== target.moduleId || m.status === 'completed') return m;
        const nextPct = Math.min(100, Math.max(0, m.progressPct + (nowCompleted ? 6 : -6)));
        return { ...m, progressPct: nextPct };
      }),
      lastInterruptedContext: nowCompleted
        ? {
            ...prev.lastInterruptedContext,
            lastCompletedMicrotaskTitle: target.title,
            updatedAt: 'Just now',
          }
        : prev.lastInterruptedContext,
    }));

    if (nowCompleted) {
      triggerCompanionCelebrate();
      triggerBurst(
        {
          type: 'honey',
          label: milestoneReached ? 'Honey Jar Full · +5 Bonus Acorns' : 'Golden Drop Collected',
          amountText: milestoneReached ? '+9 Acorns · +2 Dewdrops' : '+4 Acorns · +2 Dewdrops',
        },
        milestoneReached ? 'unlock' : 'reward'
      );
    }
  };

  const addMicrotask = (title: string, estimatedMinutes: number, moduleId = 'mod-2') => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => {
      const mod = prev.modules.find((m) => m.id === moduleId) ?? prev.modules[1] ?? prev.modules[0];
      const newTask: Microtask = {
        id: `mt-${Date.now()}`,
        title: trimmed,
        moduleId: mod.id,
        moduleTitle: mod.title,
        estimatedMinutes: Math.max(2, Math.min(90, estimatedMinutes)),
        completed: false,
        energyFit: prev.energy,
        substeps: prev.adhdPreferences.autoMicrotaskBreakdown
          ? [
              { id: `s-${Date.now()}-1`, text: 'Open the exact source or workspace tab', done: false },
              { id: `s-${Date.now()}-2`, text: 'Spend 2 minutes drafting a rough start', done: false },
            ]
          : [],
      };
      return {
        ...prev,
        microtasks: [newTask, ...prev.microtasks],
        activeFocusTaskId: newTask.id,
        lastInterruptedContext: {
          ...prev.lastInterruptedContext,
          lastActiveTaskId: newTask.id,
          updatedAt: 'Just now',
        },
      };
    });
  };

  const editMicrotask = (
    id: string,
    patch: { title?: string; estimatedMinutes?: number; moduleId?: string }
  ) => {
    setState((prev) => ({
      ...prev,
      microtasks: prev.microtasks.map((t) => {
        if (t.id !== id) return t;
        const mod = patch.moduleId
          ? prev.modules.find((m) => m.id === patch.moduleId) ?? prev.modules[0]
          : null;
        return {
          ...t,
          title: patch.title !== undefined ? patch.title.trim() || t.title : t.title,
          estimatedMinutes:
            patch.estimatedMinutes !== undefined
              ? Math.max(2, Math.min(120, patch.estimatedMinutes))
              : t.estimatedMinutes,
          moduleId: mod ? mod.id : t.moduleId,
          moduleTitle: mod ? mod.title : t.moduleTitle,
        };
      }),
    }));
  };

  const deleteMicrotask = (id: string) => {
    setState((prev) => {
      const next = prev.microtasks.filter((t) => t.id !== id);
      return {
        ...prev,
        microtasks: next,
        activeFocusTaskId:
          prev.activeFocusTaskId === id ? next[0]?.id ?? '' : prev.activeFocusTaskId,
      };
    });
  };

  const toggleSubstep = (taskId: string, substepId: string) => {
    setState((prev) => ({
      ...prev,
      microtasks: prev.microtasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          substeps: task.substeps.map((s) =>
            s.id === substepId ? { ...s, done: !s.done } : s
          ),
        };
      }),
    }));
  };

  const editSubstep = (taskId: string, substepId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      microtasks: prev.microtasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              substeps: task.substeps.map((s) => (s.id === substepId ? { ...s, text: trimmed } : s)),
            }
          : task
      ),
    }));
  };

  const deleteSubstep = (taskId: string, substepId: string) => {
    setState((prev) => ({
      ...prev,
      microtasks: prev.microtasks.map((task) =>
        task.id === taskId
          ? { ...task, substeps: task.substeps.filter((s) => s.id !== substepId) }
          : task
      ),
    }));
  };

  const addSubstepsToTask = (taskId: string, steps: string[]) => {
    setState((prev) => ({
      ...prev,
      microtasks: prev.microtasks.map((task) => {
        if (task.id !== taskId) return task;
        const newSubsteps = steps
          .map((s) => s.trim())
          .filter(Boolean)
          .map((text, idx) => ({
            id: `sub-${Date.now()}-${idx}`,
            text,
            done: false,
          }));
        return {
          ...task,
          substeps: [...task.substeps, ...newSubsteps],
        };
      }),
    }));
  };

  const toggleIntention = (id: string) => {
    setState((prev) => ({
      ...prev,
      intentions: prev.intentions.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const addDistraction = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item: DistractionItem = {
      id: `dist-${Date.now()}`,
      text: trimmed,
      createdAt: timeLabel,
      resolved: false,
    };
    setState((prev) => ({
      ...prev,
      distractions: [item, ...prev.distractions],
    }));
  };

  const toggleDistractionResolved = (id: string) => {
    setState((prev) => ({
      ...prev,
      distractions: prev.distractions.map((d) =>
        d.id === id ? { ...d, resolved: !d.resolved } : d
      ),
    }));
  };

  const clearResolvedDistractions = () => {
    setState((prev) => ({
      ...prev,
      distractions: prev.distractions.filter((d) => !d.resolved),
    }));
  };

  const setBrainDump = (text: string) => {
    setState((prev) => ({ ...prev, brainDump: text }));
  };

  const setActiveFocusTaskId = (id: string) => {
    setState((prev) => ({
      ...prev,
      activeFocusTaskId: id,
      lastInterruptedContext: {
        ...prev.lastInterruptedContext,
        lastActiveTaskId: id,
        updatedAt: 'Just now',
      },
    }));
  };

  const openTaskInFocusStudio = (taskId: string) => {
    setActiveFocusTaskId(taskId);
    setActivePage('focus');
  };

  const triggerCompanionCelebrate = () => {
    setJustCelebrated(true);
    window.setTimeout(() => setJustCelebrated(false), 3200);
  };

  const triggerTwoMinuteWarmupInPlace = () => {
    setTimerMode('focus');
    setIsTwoMinuteWarmup(true);
    setTimerSecondsLeft(120);
    setTimerRunning(true);
    setTimerHasStarted(true);
    setSessionToast('2-minute starter active—focus only on the first tiny step.');
  };

  const startTwoMinuteWarmup = (taskId?: string) => {
    if (taskId) {
      setActiveFocusTaskId(taskId);
    }
    setPendingTwoMinuteWarmup(true);
    triggerTwoMinuteWarmupInPlace();
    setActivePage('focus');
  };

  const clearPendingWarmup = () => {
    setPendingTwoMinuteWarmup(false);
  };

  const switchTimerMode = (nextMode: TimerMode) => {
    setTimerRunning(false);
    setTimerHasStarted(false);
    setIsTwoMinuteWarmup(false);
    setTimerMode(nextMode);
    setTimerSecondsLeft(timerDurations[nextMode] * 60);
    setSessionToast(null);
  };

  const startOrResumeTimer = () => {
    setSessionToast(null);
    setTimerRunning(true);
    setTimerHasStarted(true);
  };

  const pauseTimer = () => setTimerRunning(false);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerHasStarted(false);
    setIsTwoMinuteWarmup(false);
    setTimerSecondsLeft(timerDurations[timerMode] * 60);
    setSessionToast(null);
  };

  const adjustTimerMinutes = (deltaMinutes: number) => {
    setIsTwoMinuteWarmup(false);
    const nextDuration = Math.max(5, Math.min(90, timerDurations[timerMode] + deltaMinutes));
    const appliedDelta = nextDuration - timerDurations[timerMode];
    setTimerDurations((prev) => ({ ...prev, [timerMode]: nextDuration }));
    setTimerSecondsLeft((prev) => Math.max(60, prev + appliedDelta * 60));
  };

  const setCustomTimerDuration = (minutes: number) => {
    const val = Math.max(5, Math.min(90, minutes));
    setIsTwoMinuteWarmup(false);
    setTimerDurations((prev) => ({ ...prev, [timerMode]: val }));
    setTimerSecondsLeft(val * 60);
  };

  const dismissSessionToast = () => setSessionToast(null);

  const companionMood: CompanionMood = justCelebrated
    ? 'celebrate'
    : timerMode === 'shortBreak' || timerMode === 'longBreak'
      ? timerRunning
        ? 'break'
        : 'waking'
      : timerRunning
        ? 'focus'
        : 'idle';

  const updateInterruptedContext = (patch: Partial<LastInterruptedContext>) => {
    setState((prev) => ({
      ...prev,
      lastInterruptedContext: {
        ...prev.lastInterruptedContext,
        ...patch,
        updatedAt: 'Just now',
      },
    }));
  };

  const completeOnboarding = () => {
    setState((prev) => ({
      ...prev,
      onboardingCompleted: true,
      onboardingSkipped: false,
    }));
    setOnboardingOpen(false);
  };

  const skipOnboarding = () => {
    setState((prev) => ({
      ...prev,
      onboardingSkipped: true,
    }));
    setOnboardingOpen(false);
  };

  const signOutDemoSession = () => {
    soundEngine.stop();
    setSoundPlaying(false);
    setState((prev) => ({ ...prev, signedOutDemo: true }));
  };

  const resumeDemoSession = () => {
    setState((prev) => ({ ...prev, signedOutDemo: false }));
  };

  const completeFocusSession = (durationMinutes: number, mode: TimerMode, taskTitle: string) => {
    const isFocus = mode === 'focus';
    const acornsEarned = isFocus ? Math.max(2, Math.round(durationMinutes / 3)) : 1;
    const dewdropsEarned = isFocus ? Math.max(2, Math.round(durationMinutes / 5)) : 2;
    const rewardLabel = `+${acornsEarned} Acorns, +${dewdropsEarned} Dewdrops`;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: FocusSessionRecord = {
      id: `fs-${Date.now()}`,
      dateLabel: `Today · ${timeLabel}`,
      isoDate: formatIsoDate(now),
      dayKey: getDayKeyFromDate(now),
      taskTitle: taskTitle || 'Open Study Session',
      durationMinutes,
      mode,
      energy: state.energy,
      rewardEarned: rewardLabel,
    };

    setState((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        acorns: prev.resources.acorns + acornsEarned,
        dewdrops: prev.resources.dewdrops + dewdropsEarned,
      },
      focusSessions: [newRecord, ...prev.focusSessions],
      lastInterruptedContext: {
        ...prev.lastInterruptedContext,
        lastCompletedMicrotaskTitle: isFocus
          ? taskTitle
          : prev.lastInterruptedContext.lastCompletedMicrotaskTitle,
        stoppedNote: isFocus
          ? `Finished a ${durationMinutes}m session on "${taskTitle}".`
          : prev.lastInterruptedContext.stoppedNote,
        updatedAt: timeLabel,
      },
    }));

    triggerCompanionCelebrate();
    triggerBurst(
      {
        type: isFocus ? 'lantern' : 'acorn',
        label: isFocus ? 'Focus Block Complete' : 'Rest Break Complete',
        amountText: rewardLabel,
      },
      'break'
    );
  };

  // Global interval for live Focus Timer across all pages
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!timerRunning || timerSecondsLeft > 0) return;
    setTimerRunning(false);
    setTimerHasStarted(false);
    const completedMins = isTwoMinuteWarmup ? 2 : timerDurations[timerMode];
    setIsTwoMinuteWarmup(false);
    const activeTaskTitle =
      state.microtasks.find((t) => t.id === state.activeFocusTaskId)?.title ?? 'Focus Study';
    completeFocusSession(completedMins, timerMode, activeTaskTitle);
    setSessionToast(
      timerMode === 'focus'
        ? `Completed ${completedMins}m focus block. Earned Acorns & Focus Dewdrops.`
        : `Completed ${completedMins}m rest break. Ready when you are.`
    );
    setTimerSecondsLeft(timerDurations[timerMode] * 60);
  });

  const totalFocusMinutesAllTime = useMemo(
    () =>
      state.focusSessions
        .filter((s) => s.mode === 'focus')
        .reduce((acc, s) => acc + s.durationMinutes, 0),
    [state.focusSessions]
  );

  const canUnlockDecoration = (dec: HabitatDecoration) => {
    const affordable = state.resources[dec.costType] >= dec.costAmount;
    const req = dec.unlockRequirement;
    let requirementMet = true;
    if (req && req.type !== 'costOnly') {
      if (req.type === 'tasks') {
        requirementMet = state.microtasks.filter((t) => t.completed).length >= req.threshold;
      } else if (req.type === 'focusMinutes') {
        requirementMet = totalFocusMinutesAllTime >= req.threshold;
      } else if (req.type === 'arcadeRounds') {
        requirementMet = state.quizAttempts.length >= req.threshold;
      }
    }
    return {
      eligible: affordable && requirementMet,
      affordable,
      requirementMet,
    };
  };

  const unlockDecoration = (id: string): boolean => {
    const target = state.decorations.find((d) => d.id === id);
    if (!target || target.unlocked) return false;
    const status = canUnlockDecoration(target);
    if (!status.eligible) return false;

    const todayIso = formatIsoDate(new Date());
    setState((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        [target.costType]: prev.resources[target.costType] - target.costAmount,
      },
      decorations: prev.decorations.map((d) =>
        d.id === id ? { ...d, unlocked: true, placed: true, unlockedDate: todayIso } : d
      ),
      growthTimeline: [
        {
          id: `gm-${Date.now()}`,
          title: `Collected ${target.name}`,
          dateLabel: 'Today',
          detail: `Placed in ${target.spot}.`,
        },
        ...prev.growthTimeline,
      ],
    }));

    triggerBurst(
      {
        type: 'unlock',
        label: `Collected: ${target.name}`,
        amountText: `Placed in ${target.spot}`,
      },
      'unlock'
    );
    return true;
  };

  const togglePlaceDecoration = (id: string) => {
    setState((prev) => ({
      ...prev,
      decorations: prev.decorations.map((d) =>
        d.id === id && d.unlocked ? { ...d, placed: !d.placed } : d
      ),
    }));
  };

  const moveDecoration = (
    id: string,
    xPct: number,
    yPct: number,
    spot?: HabitatDecoration['spot']
  ) => {
    const clampedX = Math.max(8, Math.min(92, Math.round(xPct)));
    const clampedY = Math.max(12, Math.min(88, Math.round(yPct)));
    setState((prev) => ({
      ...prev,
      decorations: prev.decorations.map((d) =>
        d.id === id && d.unlocked
          ? { ...d, placed: true, xPct: clampedX, yPct: clampedY, spot: spot ?? d.spot }
          : d
      ),
    }));
  };

  const togglePaperBookmark = (id: string) => {
    setState((prev) => ({
      ...prev,
      papers: prev.papers.map((p) =>
        p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
      ),
    }));
  };

  const togglePaperRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      papers: prev.papers.map((p) => (p.id === id ? { ...p, read: !p.read } : p)),
    }));
  };

  const toggleMilestone = (id: string) => {
    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const recordArcadeResult = (
    gameTitle: string,
    score: number,
    total: number,
    blossomsEarned: number,
    tomesEarned = 0
  ) => {
    const todayIso = formatIsoDate(new Date());
    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      gameTitle,
      score,
      total,
      dateLabel: 'Today · Just now',
      isoDate: todayIso,
    };
    setState((prev) => ({
      ...prev,
      quizAttempts: [attempt, ...prev.quizAttempts],
      resources: {
        ...prev.resources,
        blossoms: prev.resources.blossoms + blossomsEarned,
        tomes: prev.resources.tomes + tomesEarned,
      },
    }));

    triggerBurst(
      {
        type: 'blossom',
        label: 'Jasmine Blooms Earned',
        amountText: `+${blossomsEarned} Blossoms${tomesEarned ? ` · +${tomesEarned} Tome` : ''}`,
      },
      'reward'
    );
  };

  const exportWorkspaceJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thiranagam-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createAdaptationMicrotask = (skillName: string, revMod: RoadmapModule): Microtask => ({
    id: `mt-adapt-${Date.now()}`,
    title: `[Adapted Revision] ${revMod.exercises?.[0] ?? revMod.questTitle}`,
    moduleId: revMod.id,
    moduleTitle: revMod.title,
    estimatedMinutes: 20,
    completed: false,
    energyFit: 'low',
    substeps: [
      {
        id: `sub-adapt-1-${Date.now()}`,
        text: revMod.resources[0]?.title ?? `Review ${skillName} fundamentals`,
        done: false,
      },
      {
        id: `sub-adapt-2-${Date.now()}`,
        text: revMod.exercises?.[1] ?? `Complete guided ${skillName} check`,
        done: false,
      },
    ],
  });

  const executeAgentOrchestration = async (opts: {
    profile: StudentProfile;
    assessments: SkillAssessmentRecord[];
    currentModules: RoadmapModule[];
    syncModules?: boolean;
    bannerBuilder?: (pipeline: AgentPipelineResult) => string | null;
    triggeredSkillRegression?: { skillName: string; pct: number; newVerifiedLevel: number };
  }) => {
    const {
      profile,
      assessments,
      currentModules,
      syncModules = true,
      bannerBuilder,
      triggeredSkillRegression,
    } = opts;

    const seqId = ++orchestrationSeqRef.current;
    setPipelineLoading(true);
    setPipelineProgressLabel('Step 1/4: Skill Analyst Agent (Gemini)...');
    setAiErrorMessage(null);

    const invokeStep = async <TOut,>(
      step: 'skill-analyst' | 'career-matching' | 'learning-planner' | 'progress-evaluator',
      extra: Record<string, unknown> = {}
    ): Promise<
      | { ok: true; trace: AgentTrace<unknown, TOut>; modelUsed: string }
      | { ok: false; kind: 'demo-not-configured' | 'error'; message: string }
    > => {
      try {
        const res = await fetch('/api/agents/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step,
            profile,
            assessments,
            currentModules,
            learningPreferences: stateRef.current.learningPreferences,
            adhdPreferences: stateRef.current.adhdPreferences,
            focusMinutesToday: totalFocusMinutesToday,
            ...extra,
          }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          trace?: AgentTrace<unknown, TOut>;
          modelUsed?: string;
          code?: string;
          error?: string;
        };

        if (res.ok && body.trace) {
          return {
            ok: true,
            trace: body.trace,
            modelUsed: body.modelUsed || body.trace.modelUsed || 'gemini-4-hydrogen',
          };
        }

        if (res.status === 503 || body.code === 'GEMINI_NOT_CONFIGURED') {
          return {
            ok: false,
            kind: 'demo-not-configured',
            message:
              body.error ||
              'GEMINI_API_KEY is not configured on the server. Running clearly labeled Demo Mode agents.',
          };
        }

        return {
          ok: false,
          kind: 'error',
          message: body.error || `Gemini step "${step}" failed (HTTP ${res.status}).`,
        };
      } catch (err) {
        return {
          ok: false,
          kind: 'error',
          message:
            err instanceof Error ? err.message : `Network error calling /api/agents/step (${step}).`,
        };
      }
    };

    const handleDemoFallback = (notice: string) => {
      if (orchestrationSeqRef.current !== seqId) return;
      const checkedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setGeminiHealth({
        checking: false,
        configured: false,
        connected: false,
        model: 'gemini-4-hydrogen',
        mode: 'demo-mode',
        message: notice,
        lastCheckedAt: checkedAt,
      });

      const demoPipeline = runAgentCollaborationPipeline({
        profile,
        assessments,
        currentModules,
      });
      const generatedModules = demoPipeline.traces[2].output.generatedModules;
      const computedBanner = bannerBuilder ? bannerBuilder(demoPipeline) : undefined;

      setState((prev) => {
        let nextMicrotasks = prev.microtasks;
        let nextHistory = prev.skillLevelHistory;

        if (triggeredSkillRegression && demoPipeline.adaptationApplied) {
          const revMod = generatedModules.find((m) => m.isAdaptationInserted);
          if (revMod) {
            nextMicrotasks = [
              createAdaptationMicrotask(triggeredSkillRegression.skillName, revMod),
              ...prev.microtasks.filter((t) => t.moduleId !== revMod.id),
            ];
            nextHistory = [
              {
                id: `sh-adapt-${Date.now()}`,
                skillName: triggeredSkillRegression.skillName,
                fromLevel: triggeredSkillRegression.newVerifiedLevel,
                toLevel: triggeredSkillRegression.newVerifiedLevel,
                source: 'adaptation',
                note: `[Demo Mode] Learning Planner inserted "${revMod.title}" at priority #1 after Progress Evaluator alert.`,
                timestampLabel: `Today · ${checkedAt}`,
              },
              ...prev.skillLevelHistory,
            ];
          }
        }

        const role = getCareerRoleById(profile.targetRoleId);
        return {
          ...prev,
          modules: syncModules ? generatedModules : prev.modules,
          microtasks: nextMicrotasks,
          skillLevelHistory: nextHistory,
          agentPipelineRun: demoPipeline,
          adaptationBanner:
            computedBanner !== undefined ? computedBanner : prev.adaptationBanner,
          deadlineGoal: {
            ...prev.deadlineGoal,
            examOrGoalName: `${role.title} Portfolio Milestone`,
            prioritySubjects:
              demoPipeline.traces[2].output.orderedGapPriorities.slice(0, 3).join(', ') ||
              role.title,
          },
        };
      });
    };

    const handleLiveError = (errMsg: string) => {
      if (orchestrationSeqRef.current !== seqId) return;
      setAiErrorMessage(errMsg);
      setGeminiHealth((prev) => ({
        ...prev,
        checking: false,
        connected: false,
        mode: 'error',
        message: errMsg,
        lastCheckedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setState((prev) => ({
        ...prev,
        agentPipelineRun: {
          ...prev.agentPipelineRun,
          executionMode: 'error',
          errorDetail: errMsg,
          modeBanner: `GEMINI API ERROR · ${errMsg}`,
          traces: prev.agentPipelineRun.traces.map((t) => ({
            ...t,
            executionStatus: 'error' as const,
            modeLabel: 'Gemini API Call Failed',
          })) as AgentPipelineResult['traces'],
        },
      }));
    };

    try {
      // Agent 1: Skill Analyst Agent
      const step1 = await invokeStep<SkillAnalystOutput>('skill-analyst');
      if (orchestrationSeqRef.current !== seqId) return;
      if (step1.ok === false) {
        if (step1.kind === 'demo-not-configured') handleDemoFallback(step1.message);
        else handleLiveError(step1.message);
        return;
      }

      // Agent 2: Career Matching Agent (receives Skill Analyst output)
      setPipelineProgressLabel('Step 2/4: Career Matching Agent (Gemini)...');
      const step2 = await invokeStep<CareerMatchingOutput>('career-matching', {
        analystOutput: step1.trace.output,
      });
      if (orchestrationSeqRef.current !== seqId) return;
      if (step2.ok === false) {
        if (step2.kind === 'demo-not-configured') handleDemoFallback(step2.message);
        else handleLiveError(step2.message);
        return;
      }

      // Agent 3: Learning Planner Agent (receives Skill Analyst + Career Matching outputs)
      setPipelineProgressLabel('Step 3/4: Learning Planner Agent (Gemini)...');
      const step3 = await invokeStep<LearningPlannerOutput>('learning-planner', {
        analystOutput: step1.trace.output,
        matchingOutput: step2.trace.output,
        evaluatorOutput: null,
      });
      if (orchestrationSeqRef.current !== seqId) return;
      if (step3.ok === false) {
        if (step3.kind === 'demo-not-configured') handleDemoFallback(step3.message);
        else handleLiveError(step3.message);
        return;
      }

      // Agent 4: Progress Evaluator Agent (receives Agents 1-3 outputs)
      setPipelineProgressLabel('Step 4/4: Progress Evaluator Agent (Gemini)...');
      const step4 = await invokeStep<ProgressEvaluatorOutput>('progress-evaluator', {
        analystOutput: step1.trace.output,
        matchingOutput: step2.trace.output,
        plannerOutput: step3.trace.output,
      });
      if (orchestrationSeqRef.current !== seqId) return;
      if (step4.ok === false) {
        if (step4.kind === 'demo-not-configured') handleDemoFallback(step4.message);
        else handleLiveError(step4.message);
        return;
      }

      // Closed-loop D -> C Adaptation Pass when Progress Evaluator flags regression (<60%)
      let finalTrace3 = step3.trace;
      if (step4.trace.output.needsRoadmapAdjustment) {
        setPipelineProgressLabel('Step 5: Learning Planner Adaptation Pass (D→C)...');
        const step3Adapt = await invokeStep<LearningPlannerOutput>('learning-planner', {
          analystOutput: step1.trace.output,
          matchingOutput: step2.trace.output,
          evaluatorOutput: step4.trace.output,
        });
        if (orchestrationSeqRef.current !== seqId) return;
        if (step3Adapt.ok === false) {
          if (step3Adapt.kind === 'demo-not-configured') handleDemoFallback(step3Adapt.message);
          else handleLiveError(step3Adapt.message);
          return;
        }
        finalTrace3 = {
          ...step3Adapt.trace,
          latencyMs: (step3.trace.latencyMs ?? 0) + (step3Adapt.trace.latencyMs ?? 0),
        };
      }

      const role = getCareerRoleById(profile.targetRoleId);
      const checkedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const modelUsed = step1.modelUsed || 'gemini-4-hydrogen';
      const matchingOutput = step2.trace.output;
      const plannerOutput = finalTrace3.output;
      const evaluatorOutput = step4.trace.output;

      const finalCombinedRecommendation = evaluatorOutput.needsRoadmapAdjustment
        ? `LIVE GEMINI ADAPTED PLAN (${role.title} · ${matchingOutput.readinessScore}% readiness): Progress Evaluator detected low assessment mastery in ${evaluatorOutput.detectedRegressionSkills.join(', ')} and passed feedback back to Learning Planner, which inserted targeted revision & practice ahead of ${matchingOutput.missingSkills.filter((s) => !evaluatorOutput.detectedRegressionSkills.includes(s)).join(', ') || 'your capstone'}.`
        : `LIVE GEMINI ROADMAP READY (${role.title} · ${matchingOutput.readinessScore}% readiness): Leverage your strengths (${matchingOutput.matchedSkills.join(', ') || 'foundations'}) and close priority gaps: ${plannerOutput.orderedGapPriorities.join(' → ') || 'Capstone'}.`;

      const livePipeline: AgentPipelineResult = {
        runId: `run-gemini-${Date.now()}`,
        executedAtLabel: `Executed live at ${checkedAt} via ${modelUsed}`,
        executionMode: 'live-gemini',
        geminiConfigured: true,
        modelUsed,
        modeBanner: `LIVE GEMINI ORCHESTRATION · ${modelUsed} (4 Sequential Server Calls${evaluatorOutput.needsRoadmapAdjustment ? ' + D→C Adaptation Pass' : ''})`,
        adaptationApplied: evaluatorOutput.needsRoadmapAdjustment,
        finalCombinedRecommendation,
        traces: [step1.trace, step2.trace, finalTrace3, step4.trace],
      };

      const generatedModules = livePipeline.traces[2].output.generatedModules;
      const computedBanner = bannerBuilder ? bannerBuilder(livePipeline) : undefined;

      setGeminiHealth({
        checking: false,
        configured: true,
        connected: true,
        model: modelUsed,
        mode: 'live-gemini',
        message: `Live Gemini agents active (${modelUsed}).`,
        lastCheckedAt: checkedAt,
      });

      setState((prev) => {
        let nextMicrotasks = prev.microtasks;
        let nextHistory = prev.skillLevelHistory;

        if (triggeredSkillRegression && livePipeline.adaptationApplied) {
          const revMod =
            generatedModules.find((m) => m.isAdaptationInserted || m.phase === 'Revision') ??
            generatedModules[0];
          if (revMod) {
            nextMicrotasks = [
              createAdaptationMicrotask(triggeredSkillRegression.skillName, revMod),
              ...prev.microtasks.filter((t) => t.moduleId !== revMod.id),
            ];
            nextHistory = [
              {
                id: `sh-adapt-${Date.now()}`,
                skillName: triggeredSkillRegression.skillName,
                fromLevel: triggeredSkillRegression.newVerifiedLevel,
                toLevel: triggeredSkillRegression.newVerifiedLevel,
                source: 'adaptation',
                note: `Gemini Learning Planner inserted "${revMod.title}" at priority #1 after Progress Evaluator feedback.`,
                timestampLabel: `Today · ${checkedAt}`,
              },
              ...prev.skillLevelHistory,
            ];
          }
        }

        return {
          ...prev,
          modules: syncModules ? generatedModules : prev.modules,
          microtasks: nextMicrotasks,
          skillLevelHistory: nextHistory,
          agentPipelineRun: livePipeline,
          adaptationBanner:
            computedBanner !== undefined ? computedBanner : prev.adaptationBanner,
          deadlineGoal: {
            ...prev.deadlineGoal,
            examOrGoalName: `${role.title} Portfolio Milestone`,
            prioritySubjects:
              livePipeline.traces[2].output.orderedGapPriorities.slice(0, 3).join(', ') ||
              role.title,
          },
        };
      });
    } finally {
      if (orchestrationSeqRef.current === seqId) {
        setPipelineLoading(false);
        setPipelineProgressLabel(null);
      }
    }
  };

  const checkGeminiHealth = async (probe = false): Promise<GeminiHealthStatus> => {
    setGeminiHealth((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch(`/api/gemini/health${probe ? '?probe=1' : ''}`);
      const data = (await res.json()) as GeminiHealthStatus;
      const nextStatus: GeminiHealthStatus = {
        checking: false,
        configured: Boolean(data.configured),
        connected: Boolean(data.connected),
        model: data.model || 'gemini-4-hydrogen',
        mode: data.mode || (data.configured ? 'live-gemini' : 'demo-mode'),
        message: data.message || 'Checked Gemini status.',
        latencyMs: data.latencyMs,
        lastCheckedAt:
          data.lastCheckedAt ||
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setGeminiHealth(nextStatus);
      return nextStatus;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach /api/gemini/health.';
      const fallbackStatus: GeminiHealthStatus = {
        checking: false,
        configured: false,
        connected: false,
        model: 'gemini-4-hydrogen',
        mode: 'error',
        message: msg,
        lastCheckedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setGeminiHealth(fallbackStatus);
      return fallbackStatus;
    }
  };

  useEffect(() => {
    let active = true;
    void checkGeminiHealth(false).then((health) => {
      if (!active) return;
      if (!health.configured) {
        setGeminiHealth(health);
      }
    });
    return () => {
      active = false;
    };
    // Run once on mount to discover server Gemini availability without consuming API quota
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upsertProfileSkill = (name: string, kind: SkillKind, selfReportedLevel: number) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const clampedLevel = Math.max(0, Math.min(5, Math.round(selfReportedLevel)));
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const prev = stateRef.current;
    const existing = prev.profile.skills.find(
      (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    const fromLevel = existing ? existing.selfReportedLevel : 0;
    const nextSkills = existing
      ? prev.profile.skills.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                kind,
                selfReportedLevel: clampedLevel,
                origin: s.verifiedLevel !== undefined ? ('both' as const) : ('self-reported' as const),
              }
            : s
        )
      : [
          ...prev.profile.skills,
          {
            id: `sk-${Date.now()}`,
            name: trimmed,
            kind,
            selfReportedLevel: clampedLevel,
            origin: 'self-reported' as const,
          },
        ];

    const nextProfile: StudentProfile = { ...prev.profile, skills: nextSkills };
    const historyEntry: SkillChangeRecord = {
      id: `sh-${Date.now()}`,
      skillName: trimmed,
      fromLevel,
      toLevel: clampedLevel,
      source: 'self-update',
      note: existing
        ? `Updated self-reported rating (${fromLevel}/5 → ${clampedLevel}/5).`
        : `Added self-reported ${kind} skill (${clampedLevel}/5).`,
      timestampLabel: `Today · ${timeLabel}`,
    };

    if (geminiHealthRef.current.configured) {
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        skillLevelHistory: [historyEntry, ...curr.skillLevelHistory],
      }));
      void executeAgentOrchestration({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
        syncModules: true,
      });
    } else {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        modules: nextPipeline.traces[2].output.generatedModules,
        skillLevelHistory: [historyEntry, ...curr.skillLevelHistory],
        agentPipelineRun: nextPipeline,
      }));
    }
  };

  const removeProfileSkill = (id: string) => {
    const prev = stateRef.current;
    const removed = prev.profile.skills.find((s) => s.id === id);
    const nextSkills = prev.profile.skills.filter((s) => s.id !== id);
    const nextProfile: StudentProfile = { ...prev.profile, skills: nextSkills };
    const historyEntry: SkillChangeRecord[] = removed
      ? [
          {
            id: `sh-${Date.now()}`,
            skillName: removed.name,
            fromLevel: removed.verifiedLevel ?? removed.selfReportedLevel,
            toLevel: 0,
            source: 'self-update',
            note: `Removed "${removed.name}" from learner profile.`,
            timestampLabel: 'Just now',
          },
        ]
      : [];

    if (geminiHealthRef.current.configured) {
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        skillLevelHistory: [...historyEntry, ...curr.skillLevelHistory],
      }));
      void executeAgentOrchestration({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
        syncModules: true,
      });
    } else {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        modules: nextPipeline.traces[2].output.generatedModules,
        skillLevelHistory: [...historyEntry, ...curr.skillLevelHistory],
        agentPipelineRun: nextPipeline,
      }));
    }
  };

  const addCertification = (cert: Omit<CertificationRecord, 'id'>) => {
    if (!cert.title.trim()) return;
    const prev = stateRef.current;
    const nextProfile: StudentProfile = {
      ...prev.profile,
      certifications: [...prev.profile.certifications, { ...cert, id: `cert-${Date.now()}` }],
    };
    if (geminiHealthRef.current.configured) {
      setState((curr) => ({ ...curr, profile: nextProfile }));
      void executeAgentOrchestration({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
        syncModules: false,
      });
    } else {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      }));
    }
  };

  const removeCertification = (id: string) => {
    const prev = stateRef.current;
    const nextProfile: StudentProfile = {
      ...prev.profile,
      certifications: prev.profile.certifications.filter((c) => c.id !== id),
    };
    if (geminiHealthRef.current.configured) {
      setState((curr) => ({ ...curr, profile: nextProfile }));
      void executeAgentOrchestration({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
        syncModules: false,
      });
    } else {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      }));
    }
  };

  const addProject = (proj: Omit<ProjectRecord, 'id'>) => {
    if (!proj.title.trim()) return;
    const prev = stateRef.current;
    const nextProfile: StudentProfile = {
      ...prev.profile,
      projects: [...prev.profile.projects, { ...proj, id: `proj-${Date.now()}` }],
    };
    if (geminiHealthRef.current.configured) {
      setState((curr) => ({ ...curr, profile: nextProfile }));
      void executeAgentOrchestration({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
        syncModules: false,
      });
    } else {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      }));
    }
  };

  const removeProject = (id: string) => {
    const prev = stateRef.current;
    const nextProfile: StudentProfile = {
      ...prev.profile,
      projects: prev.profile.projects.filter((p) => p.id !== id),
    };
    if (geminiHealthRef.current.configured) {
      setState((curr) => ({ ...curr, profile: nextProfile }));
      void executeAgentOrchestration({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
        syncModules: false,
      });
    } else {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      setState((curr) => ({
        ...curr,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      }));
    }
  };

  const changeTargetRole = (roleId: CareerRoleId) => {
    const role = getCareerRoleById(roleId);
    const prev = stateRef.current;
    const previousRole = prev.profile.careerNorthStar;
    const nextProfile: StudentProfile = {
      ...prev.profile,
      targetRoleId: role.id,
      careerNorthStar: role.title,
    };

    setState((curr) => ({
      ...curr,
      profile: nextProfile,
    }));

    void executeAgentOrchestration({
      profile: nextProfile,
      assessments: prev.skillAssessments,
      currentModules: prev.modules,
      syncModules: true,
      bannerBuilder: (pipeline) => {
        const matchingOut = pipeline.traces[1].output;
        const plannerOut = pipeline.traces[2].output;
        const modeTag = pipeline.executionMode === 'live-gemini' ? '[Live Gemini]' : '[Demo Mode]';
        return `${modeTag} Scenario B Adapted (${previousRole} → ${role.title}): Career Matching recalculated ${matchingOut.readinessScore}% readiness (Matched: ${matchingOut.matchedSkills.join(', ') || 'None'} · Missing: ${matchingOut.missingSkills.join(', ') || 'None'}). Learning Planner generated a fresh ${plannerOut.generatedModules.length}-step roadmap.`;
      },
    });
  };

  const submitSkillAssessment = (
    skillName: string,
    score: number,
    total: number,
    note?: string
  ): SkillAssessmentRecord => {
    const safeTotal = Math.max(1, total);
    const pct = Math.round((score / safeTotal) * 100);
    const newVerifiedLevel =
      pct >= 95 ? 5 : pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;
    const triggeredAdaptation = pct < 60;
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const prev = stateRef.current;
    const existingSkill = prev.profile.skills.find(
      (s) => s.name.trim().toLowerCase() === skillName.trim().toLowerCase()
    );
    const previousEffectiveLevel = existingSkill
      ? existingSkill.verifiedLevel ?? existingSkill.selfReportedLevel
      : 0;

    const record: SkillAssessmentRecord = {
      id: `sa-${Date.now()}`,
      skillName,
      score,
      total: safeTotal,
      pct,
      previousEffectiveLevel,
      newVerifiedLevel,
      timestampLabel: `Today · ${timeLabel}`,
      triggeredAdaptation,
      note:
        note ??
        (triggeredAdaptation
          ? `Scored ${pct}% (< 60% threshold) — Progress Evaluator flagged ${skillName} for urgent revision.`
          : `Passed ${skillName} verification at ${pct}% (verified level ${newVerifiedLevel}/5).`),
    };

    const match = prev.profile.skills.find(
      (s) => s.name.trim().toLowerCase() === skillName.trim().toLowerCase()
    );
    const nextSkills = match
      ? prev.profile.skills.map((s) =>
          s.id === match.id
            ? {
                ...s,
                verifiedLevel: newVerifiedLevel,
                lastAssessedScore: pct,
                lastAssessedAt: `Today · ${timeLabel}`,
                origin: s.selfReportedLevel > 0 ? ('both' as const) : ('assessment-verified' as const),
              }
            : s
        )
      : [
          ...prev.profile.skills,
          {
            id: `sk-${Date.now()}`,
            name: skillName,
            kind: 'technical' as const,
            selfReportedLevel: 0,
            verifiedLevel: newVerifiedLevel,
            lastAssessedScore: pct,
            lastAssessedAt: `Today · ${timeLabel}`,
            origin: 'assessment-verified' as const,
          },
        ];

    const nextAssessments = [record, ...prev.skillAssessments];
    const nextProfile: StudentProfile = { ...prev.profile, skills: nextSkills };
    const assessmentHistoryItem: SkillChangeRecord = {
      id: `sh-${Date.now()}`,
      skillName,
      fromLevel: previousEffectiveLevel,
      toLevel: newVerifiedLevel,
      source: 'assessment',
      note: record.note,
      timestampLabel: `Today · ${timeLabel}`,
    };

    setState((curr) => ({
      ...curr,
      profile: nextProfile,
      skillAssessments: nextAssessments,
      skillLevelHistory: [assessmentHistoryItem, ...curr.skillLevelHistory],
    }));

    void executeAgentOrchestration({
      profile: nextProfile,
      assessments: nextAssessments,
      currentModules: prev.modules,
      syncModules: true,
      triggeredSkillRegression: triggeredAdaptation
        ? { skillName, pct, newVerifiedLevel }
        : undefined,
      bannerBuilder: (pipeline) => {
        const modeTag = pipeline.executionMode === 'live-gemini' ? '[Live Gemini]' : '[Demo Mode]';
        if (triggeredAdaptation || pipeline.adaptationApplied) {
          const revMod = pipeline.traces[2].output.generatedModules.find(
            (m) => m.isAdaptationInserted || m.phase === 'Revision'
          );
          return `${modeTag} Scenario A Adapted (${skillName} scored ${pct}%): Progress Evaluator identified weakness → sent feedback to Learning Planner → inserted "${revMod?.title ?? `${skillName} Revision & Guided Practice`}" at priority #1 of your roadmap & Today microtasks.`;
        }
        return `${modeTag} Assessment verified: ${skillName} is now verified at ${newVerifiedLevel}/5 (${pct}%), updating Career Matching readiness to ${pipeline.traces[1].output.readinessScore}%.`;
      },
    });

    return record;
  };

  const rerunAgentPipeline = async (syncModules = true) => {
    const prev = stateRef.current;
    await executeAgentOrchestration({
      profile: prev.profile,
      assessments: prev.skillAssessments,
      currentModules: prev.modules,
      syncModules,
    });
  };

  const runDemoFallbackPipeline = (syncModules = true) => {
    setAiErrorMessage(null);
    setState((prev) => {
      const nextPipeline = runAgentCollaborationPipeline({
        profile: prev.profile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      return {
        ...prev,
        modules: syncModules ? nextPipeline.traces[2].output.generatedModules : prev.modules,
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const askMentor = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MentorMessage = {
      id: `mentor-u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestampLabel: nowLabel,
    };

    const currentSnapshot = stateRef.current;
    const historyPayload = currentSnapshot.mentorMessages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    setState((prev) => ({
      ...prev,
      mentorMessages: [...prev.mentorMessages, userMsg],
    }));
    setMentorLoading(true);
    setAiErrorMessage(null);

    try {
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          profile: currentSnapshot.profile,
          pipeline: currentSnapshot.agentPipelineRun,
          modules: currentSnapshot.modules,
          assessments: currentSnapshot.skillAssessments,
          skillHistory: currentSnapshot.skillLevelHistory,
          focusMinutesToday: totalFocusMinutesToday,
          history: historyPayload,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: MentorMessage;
        code?: string;
        error?: string;
      };

      if (response.ok && body.message) {
        const liveReply = body.message;
        setGeminiHealth((prev) => ({
          ...prev,
          checking: false,
          configured: true,
          connected: true,
          model: liveReply.modelUsed || 'gemini-4-hydrogen',
          mode: 'live-gemini',
        }));
        setState((prev) => ({
          ...prev,
          mentorMessages: [...prev.mentorMessages, liveReply],
        }));
        return;
      }

      if (response.status === 503 || body.code === 'GEMINI_NOT_CONFIGURED') {
        const notice =
          body.error ||
          'GEMINI_API_KEY is not configured on the server. Using clearly labeled Demo Mentor fallback.';
        setGeminiHealth({
          checking: false,
          configured: false,
          connected: false,
          model: 'gemini-4-hydrogen',
          mode: 'demo-mode',
          message: notice,
          lastCheckedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        const demoReply = generateMentorResponse(trimmed, {
          profile: currentSnapshot.profile,
          pipeline: currentSnapshot.agentPipelineRun,
          modules: currentSnapshot.modules,
          assessments: currentSnapshot.skillAssessments,
          skillHistory: currentSnapshot.skillLevelHistory,
          focusMinutesToday: totalFocusMinutesToday,
        });
        setState((prev) => ({
          ...prev,
          mentorMessages: [...prev.mentorMessages, demoReply],
        }));
        return;
      }

      const errMsg = body.error || `Gemini AI Mentor failed (HTTP ${response.status}).`;
      setAiErrorMessage(errMsg);
      const errorReply: MentorMessage = {
        id: `mentor-err-${Date.now()}`,
        role: 'mentor',
        text: `Live Gemini AI Mentor could not complete your request: ${errMsg}`,
        timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executionStatus: 'error',
        suggestedActions: ['Verify server GEMINI_API_KEY / quota and retry your question'],
      };
      setState((prev) => ({
        ...prev,
        mentorMessages: [...prev.mentorMessages, errorReply],
      }));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error calling /api/mentor/chat.';
      setAiErrorMessage(errMsg);
      const errorReply: MentorMessage = {
        id: `mentor-err-${Date.now()}`,
        role: 'mentor',
        text: `Live Gemini AI Mentor connection error: ${errMsg}`,
        timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executionStatus: 'error',
      };
      setState((prev) => ({
        ...prev,
        mentorMessages: [...prev.mentorMessages, errorReply],
      }));
    } finally {
      setMentorLoading(false);
    }
  };

  const dismissAiError = () => setAiErrorMessage(null);

  const dismissAdaptationBanner = () => {
    setState((prev) => ({ ...prev, adaptationBanner: null }));
  };

  const resetDemoWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    soundEngine.stop();
    setSoundPlaying(false);
    setAiErrorMessage(null);
    const fresh = createDefaults();
    setState(fresh);
    if (geminiHealthRef.current.configured) {
      void executeAgentOrchestration({
        profile: fresh.profile,
        assessments: fresh.skillAssessments,
        currentModules: fresh.modules,
        syncModules: true,
      });
    }
  };

  const todayIso = formatIsoDate(new Date());
  const totalFocusMinutesToday = useMemo(() => {
    return state.focusSessions
      .filter((s) => (s.isoDate === todayIso || s.dateLabel.startsWith('Today')) && s.mode === 'focus')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [state.focusSessions, todayIso]);

  const overallRoadmapPct = useMemo(() => {
    if (state.modules.length === 0) return 0;
    const sum = state.modules.reduce((acc, m) => acc + m.progressPct, 0);
    return Math.round(sum / state.modules.length);
  }, [state.modules]);

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        activePage,
        setActivePage,
        settingsTab,
        setSettingsTab,
        openThemeStudio,
        soundPlaying,
        toggleSoundPlaying,
        selectSoundTrack,
        setSoundVolume,
        setEnvironment,
        setLighting,
        setEnergy,
        updateProfile,
        updateThemeSettings,
        resetThemeSettings,
        updateLearningPreferences,
        updateADHDPreferences,
        updateNotificationPreferences,
        updateDeadlineGoal,
        setCompanion,
        renameCompanion,
        getCompanionDisplayName,
        toggleLowStimulation,
        toggleMicrotask,
        addMicrotask,
        editMicrotask,
        deleteMicrotask,
        toggleSubstep,
        editSubstep,
        deleteSubstep,
        addSubstepsToTask,
        toggleIntention,
        addDistraction,
        toggleDistractionResolved,
        clearResolvedDistractions,
        setBrainDump,
        setActiveFocusTaskId,
        openTaskInFocusStudio,
        pendingTwoMinuteWarmup,
        clearPendingWarmup,
        startTwoMinuteWarmup,
        timerMode,
        timerDurations,
        timerSecondsLeft,
        timerRunning,
        timerHasStarted,
        isTwoMinuteWarmup,
        sessionToast,
        dismissSessionToast,
        setSessionToastMessage: setSessionToast,
        switchTimerMode,
        startOrResumeTimer,
        pauseTimer,
        resetTimer,
        adjustTimerMinutes,
        setCustomTimerDuration,
        triggerTwoMinuteWarmupInPlace,
        companionMood,
        triggerCompanionCelebrate,
        companionDockMinimized,
        setCompanionDockMinimized,
        updateInterruptedContext,
        restartModalOpen,
        setRestartModalOpen,
        onboardingOpen,
        setOnboardingOpen,
        completeOnboarding,
        skipOnboarding,
        signOutDemoSession,
        resumeDemoSession,
        completeFocusSession,
        canUnlockDecoration,
        unlockDecoration,
        togglePlaceDecoration,
        moveDecoration,
        togglePaperBookmark,
        togglePaperRead,
        toggleMilestone,
        recordArcadeResult,
        recentRewardBurst,
        dismissRewardBurst,
        exportWorkspaceJson,
        resetDemoWorkspace,
        upsertProfileSkill,
        removeProfileSkill,
        addCertification,
        removeCertification,
        addProject,
        removeProject,
        changeTargetRole,
        submitSkillAssessment,
        rerunAgentPipeline,
        runDemoFallbackPipeline,
        askMentor,
        checkGeminiHealth,
        geminiHealth,
        pipelineLoading,
        pipelineProgressLabel,
        mentorLoading,
        aiErrorMessage,
        dismissAiError,
        dismissAdaptationBanner,
        totalFocusMinutesToday,
        totalFocusMinutesAllTime,
        overallRoadmapPct,
        resolvedColorMode,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};
