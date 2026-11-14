import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  CareerRoleId,
  CertificationRecord,
  CompanionId,
  CompanionMood,
  DeadlineGoal,
  DistractionItem,
  EnergyLevel,
  EnvironmentId,
  FocusSessionRecord,
  GentleIntention,
  GrowthMilestone,
  HabitatDecoration,
  LastInterruptedContext,
  LearningPreferences,
  LightingPreset,
  MentorMessage,
  Microtask,
  MilestoneItem,
  NotificationPreferences,
  PageId,
  ProjectRecord,
  QuizAttempt,
  ResearchPaper,
  ResourceBalance,
  RewardBurstEvent,
  RoadmapModule,
  SettingsSectionTab,
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
  rerunAgentPipeline: (syncModules?: boolean) => void;
  askMentor: (question: string) => void;
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

  const upsertProfileSkill = (name: string, kind: SkillKind, selfReportedLevel: number) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const clampedLevel = Math.max(0, Math.min(5, Math.round(selfReportedLevel)));
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => {
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
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });

      const historyEntry: SkillChangeRecord = {
        id: `sh-${Date.now()}`,
        skillName: trimmed,
        fromLevel,
        toLevel: clampedLevel,
        source: 'self-update',
        note:
          existing
            ? `Updated self-reported rating (${fromLevel}/5 → ${clampedLevel}/5).`
            : `Added self-reported ${kind} skill (${clampedLevel}/5).`,
        timestampLabel: `Today · ${timeLabel}`,
      };

      return {
        ...prev,
        profile: nextProfile,
        modules: nextPipeline.traces[2].output.generatedModules,
        skillLevelHistory: [historyEntry, ...prev.skillLevelHistory],
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const removeProfileSkill = (id: string) => {
    setState((prev) => {
      const removed = prev.profile.skills.find((s) => s.id === id);
      const nextSkills = prev.profile.skills.filter((s) => s.id !== id);
      const nextProfile: StudentProfile = { ...prev.profile, skills: nextSkills };
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
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
      return {
        ...prev,
        profile: nextProfile,
        modules: nextPipeline.traces[2].output.generatedModules,
        skillLevelHistory: [...historyEntry, ...prev.skillLevelHistory],
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const addCertification = (cert: Omit<CertificationRecord, 'id'>) => {
    if (!cert.title.trim()) return;
    setState((prev) => {
      const nextProfile: StudentProfile = {
        ...prev.profile,
        certifications: [
          ...prev.profile.certifications,
          { ...cert, id: `cert-${Date.now()}` },
        ],
      };
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      return {
        ...prev,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const removeCertification = (id: string) => {
    setState((prev) => {
      const nextProfile: StudentProfile = {
        ...prev.profile,
        certifications: prev.profile.certifications.filter((c) => c.id !== id),
      };
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      return {
        ...prev,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const addProject = (proj: Omit<ProjectRecord, 'id'>) => {
    if (!proj.title.trim()) return;
    setState((prev) => {
      const nextProfile: StudentProfile = {
        ...prev.profile,
        projects: [...prev.profile.projects, { ...proj, id: `proj-${Date.now()}` }],
      };
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      return {
        ...prev,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const removeProject = (id: string) => {
    setState((prev) => {
      const nextProfile: StudentProfile = {
        ...prev.profile,
        projects: prev.profile.projects.filter((p) => p.id !== id),
      };
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      return {
        ...prev,
        profile: nextProfile,
        agentPipelineRun: nextPipeline,
      };
    });
  };

  const changeTargetRole = (roleId: CareerRoleId) => {
    const role = getCareerRoleById(roleId);
    setState((prev) => {
      const previousRole = prev.profile.careerNorthStar;
      const nextProfile: StudentProfile = {
        ...prev.profile,
        targetRoleId: role.id,
        careerNorthStar: role.title,
      };
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: prev.skillAssessments,
        currentModules: prev.modules,
      });
      const matchingOut = nextPipeline.traces[1].output;
      const plannerOut = nextPipeline.traces[2].output;

      const banner = `Scenario B Adapted (${previousRole} → ${role.title}): Career Matching recalculated ${matchingOut.readinessScore}% readiness (Matched: ${matchingOut.matchedSkills.join(', ') || 'None'} · Missing: ${matchingOut.missingSkills.join(', ') || 'None'}). Learning Planner generated a fresh ${plannerOut.generatedModules.length}-step roadmap.`;

      return {
        ...prev,
        profile: nextProfile,
        modules: plannerOut.generatedModules,
        agentPipelineRun: nextPipeline,
        adaptationBanner: banner,
        deadlineGoal: {
          ...prev.deadlineGoal,
          examOrGoalName: `${role.title} Portfolio Milestone`,
          prioritySubjects: plannerOut.orderedGapPriorities.slice(0, 3).join(', ') || role.title,
        },
      };
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
    // Map percentage to 1..5 verified level cleanly:
    // <40% => 1, 40-59% => 2, 60-79% => 3, 80-94% => 4, >=95% => 5
    const newVerifiedLevel =
      pct >= 95 ? 5 : pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;
    const triggeredAdaptation = pct < 60;
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existingSkill = state.profile.skills.find(
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

    setState((prev) => {
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
      const nextPipeline = runAgentCollaborationPipeline({
        profile: nextProfile,
        assessments: nextAssessments,
        currentModules: prev.modules,
      });

      const nextModules = nextPipeline.traces[2].output.generatedModules;
      const historyItems: SkillChangeRecord[] = [
        {
          id: `sh-${Date.now()}`,
          skillName,
          fromLevel: previousEffectiveLevel,
          toLevel: newVerifiedLevel,
          source: 'assessment',
          note: record.note,
          timestampLabel: `Today · ${timeLabel}`,
        },
      ];

      let nextMicrotasks = prev.microtasks;
      let nextBanner = prev.adaptationBanner;

      if (triggeredAdaptation) {
        const revMod = nextModules.find((m) => m.isAdaptationInserted);
        if (revMod) {
          const revTaskId = `mt-adapt-${Date.now()}`;
          nextMicrotasks = [
            {
              id: revTaskId,
              title: `[Adapted Revision] ${revMod.exercises?.[0] ?? revMod.questTitle}`,
              moduleId: revMod.id,
              moduleTitle: revMod.title,
              estimatedMinutes: 20,
              completed: false,
              energyFit: 'low',
              substeps: [
                {
                  id: `sub-adapt-1`,
                  text: revMod.resources[0]?.title ?? `Review ${skillName} fundamentals`,
                  done: false,
                },
                {
                  id: `sub-adapt-2`,
                  text: revMod.exercises?.[1] ?? `Complete guided ${skillName} check`,
                  done: false,
                },
              ],
            },
            ...prev.microtasks,
          ];
          historyItems.unshift({
            id: `sh-adapt-${Date.now() + 1}`,
            skillName,
            fromLevel: newVerifiedLevel,
            toLevel: newVerifiedLevel,
            source: 'adaptation',
            note: `Learning Planner inserted "${revMod.title}" at priority #1 after Progress Evaluator alert.`,
            timestampLabel: `Today · ${timeLabel}`,
          });
        }
        nextBanner = `Scenario A Adapted (${skillName} scored ${pct}%): Progress Evaluator identified weakness → Learning Planner inserted "${skillName} Revision & Guided Practice Lab" at the top of your roadmap & Today microtasks.`;
      } else {
        nextBanner = `Assessment verified: ${skillName} is now verified at ${newVerifiedLevel}/5 (${pct}%), updating Career Matching readiness to ${nextPipeline.traces[1].output.readinessScore}%.`;
      }

      return {
        ...prev,
        profile: nextProfile,
        skillAssessments: nextAssessments,
        skillLevelHistory: [...historyItems, ...prev.skillLevelHistory],
        modules: nextModules,
        microtasks: nextMicrotasks,
        agentPipelineRun: nextPipeline,
        adaptationBanner: nextBanner,
      };
    });

    return record;
  };

  const rerunAgentPipeline = (syncModules = true) => {
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

  const askMentor = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MentorMessage = {
      id: `mentor-u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestampLabel: nowLabel,
    };

    const reply = generateMentorResponse(trimmed, {
      profile: state.profile,
      pipeline: state.agentPipelineRun,
      modules: state.modules,
      assessments: state.skillAssessments,
      skillHistory: state.skillLevelHistory,
      focusMinutesToday: totalFocusMinutesToday,
    });

    setState((prev) => ({
      ...prev,
      mentorMessages: [...prev.mentorMessages, userMsg, reply],
    }));
  };

  const dismissAdaptationBanner = () => {
    setState((prev) => ({ ...prev, adaptationBanner: null }));
  };

  const resetDemoWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    soundEngine.stop();
    setSoundPlaying(false);
    setState(createDefaults());
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
        askMentor,
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
