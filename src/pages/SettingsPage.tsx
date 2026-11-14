import React, { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Bell,
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Edit3,
  EyeOff,
  LogOut,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Target,
  Trash2,
  Type,
  User,
  Volume2,
} from 'lucide-react';
import {
  COMPANIONS,
  IMMERSIVE_THEMES,
  SOUNDSCAPE_TRACKS,
  formatIsoDate,
} from '../data/demoData';
import { CAREER_ROLES } from '../data/careerRoles';
import { useAppState } from '../context/AppStateContext';
import { CompanionPortraitBadge } from '../components/CompanionPortraitBadge';
import { CollectibleIllustration } from '../components/CollectibleIllustration';
import { AVATAR_OPTIONS, StudentAvatar } from '../components/StudentAvatar';
import { ThemeLivePreview } from '../components/ThemeLivePreview';
import { ThemeSceneThumbnail } from '../components/ThemeSceneThumbnail';
import { VisualRewardStage } from '../components/VisualRewardStage';
import {
  CareerRoleId,
  ColorMode,
  CompanionId,
  HeadingStyle,
  SkillKind,
  ThemePresetId,
} from '../types';

const ACCENT_SUGGESTIONS = [
  { label: 'Theme Default', value: null },
  { label: 'Forest', value: '#26533B' },
  { label: 'Espresso', value: '#7A4828' },
  { label: 'Ocean', value: '#1D6472' },
  { label: 'Mahogany', value: '#4B3222' },
  { label: 'Cedar', value: '#843F26' },
];

export const SettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    themeSettings,
    updateThemeSettings,
    resetThemeSettings,
    learningPreferences,
    updateLearningPreferences,
    adhdPreferences,
    updateADHDPreferences,
    notificationPreferences,
    updateNotificationPreferences,
    deadlineGoal,
    updateDeadlineGoal,
    setCompanion,
    renameCompanion,
    getCompanionDisplayName,
    activeSoundTrack,
    selectSoundTrack,
    soundPlaying,
    toggleSoundPlaying,
    soundVolume,
    setSoundVolume,
    toggleLowStimulation,
    exportWorkspaceJson,
    resetDemoWorkspace,
    setBrainDump,
    setOnboardingOpen,
    signOutDemoSession,
    resolvedColorMode,
    focusSessions,
    microtasks,
    quizAttempts,
    resources,
    decorations,
    honeyDrops,
    setActivePage,
    settingsTab,
    setSettingsTab,
    upsertProfileSkill,
    removeProfileSkill,
    addCertification,
    removeCertification,
    addProject,
    removeProject,
    changeTargetRole,
  } = useAppState();

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Explicit Edit / Save Profile controls
  const [profileEditing, setProfileEditing] = useState(true);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [draftUniversity, setDraftUniversity] = useState(profile.university);
  const [draftMajor, setDraftMajor] = useState(profile.major);
  const [draftYear, setDraftYear] = useState(profile.year);
  const [draftGoalsSummary, setDraftGoalsSummary] = useState(profile.learningGoalsSummary);
  const [draftNorthStar, setDraftNorthStar] = useState(profile.careerNorthStar);
  const [draftAvatar, setDraftAvatar] = useState(profile.avatarId);

  // New Skill / Certification / Project form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillKind, setNewSkillKind] = useState<SkillKind>('technical');
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('2026');
  const [newCertStatus, setNewCertStatus] = useState<'Earned' | 'In Progress'>('Earned');

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjRole, setNewProjRole] = useState('');
  const [newProjSummary, setNewProjSummary] = useState('');
  const [newProjSkills, setNewProjSkills] = useState('');

  // Live Theme Preview Staging before Applying
  const [previewPreset, setPreviewPreset] = useState<ThemePresetId>(themeSettings.preset);
  const [previewColorMode, setPreviewColorMode] = useState<ColorMode>(themeSettings.colorMode);

  // Daily Progress Calendar Navigator (Last 7 days ending today)
  const calendarDays = useMemo(() => {
    const days: { iso: string; shortDay: string; dateNum: string; fullLabel: string }[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      days.push({
        iso: formatIsoDate(d),
        shortDay: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
        dateNum: String(d.getDate()),
        fullLabel:
          offset === 0
            ? 'Today'
            : offset === 1
              ? 'Yesterday'
              : new Intl.DateTimeFormat('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                }).format(d),
      });
    }
    return days;
  }, []);

  const [selectedDayIso, setSelectedDayIso] = useState<string>(
    calendarDays[calendarDays.length - 1].iso
  );

  const flashNotice = (msg: string) => {
    setSavedNotice(msg);
    window.setTimeout(() => setSavedNotice(null), 3200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: draftName.trim() || 'Demo Learner',
      email: draftEmail.trim() || 'demo.learner@thiranagam.local',
      university: draftUniversity.trim() || 'University',
      major: draftMajor.trim() || 'Computer Science',
      year: draftYear.trim() || 'Undergraduate',
      learningGoalsSummary: draftGoalsSummary.trim(),
      careerNorthStar: draftNorthStar.trim() || profile.careerNorthStar,
      avatarId: draftAvatar,
    });
    setProfileEditing(false);
    flashNotice('Profile changes saved locally.');
  };

  const handleResetToDemoLearner = () => {
    resetDemoWorkspace();
    setDraftName('Arjun Nair (Demo Learner)');
    setDraftEmail('demo.learner@thiranagam.local');
    setDraftUniversity('Pacific Crest University');
    setDraftMajor('B.S. Computer Science · Full Stack Engineering Track');
    setDraftYear('Junior (Year 3)');
    setDraftNorthStar('Full Stack Developer');
    setDraftGoalsSummary(
      'Bridge existing Python, SQL, and Basic HTML foundations into JavaScript, React, and Node.js to ship complete Full Stack applications.'
    );
    flashNotice('Restored Full Stack Developer Demo Learner preset.');
  };

  const selectedDayMeta =
    calendarDays.find((d) => d.iso === selectedDayIso) ?? calendarDays[calendarDays.length - 1];
  const selectedDayIndex = calendarDays.findIndex((d) => d.iso === selectedDayIso);

  // Real data aggregation for selected day
  const daySessions = focusSessions.filter((s) => s.isoDate === selectedDayIso);
  const dayFocusMinutes = daySessions
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const dayCompletedTasks = microtasks.filter(
    (t) => t.completed && t.completedDate === selectedDayIso
  );
  const dayQuizzes = quizAttempts.filter((q) => q.isoDate === selectedDayIso);
  const dayGoalPct = Math.min(
    100,
    Math.round((dayFocusMinutes / Math.max(15, profile.dailyFocusGoalMinutes)) * 100)
  );
  const collectedRewards = decorations.filter((d) => d.unlocked);

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Thiranagam · Profile, Progress, World Themes & Accessibility
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1">
            Settings & Personal Sanctuary
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
            {(
              [
                { id: 'profile', label: 'A. My Profile', icon: User },
                { id: 'progress', label: 'B. My Daily Progress', icon: Activity },
                { id: 'themes', label: 'C. Theme Studio', icon: Palette },
                { id: 'typography', label: 'Typography & ADHD', icon: Type },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = settingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSettingsTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)] shadow-xs'
                      : 'text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {savedNotice && (
        <div
          role="status"
          className="rounded-2xl bg-[var(--sp-accent-soft)] border border-[var(--sp-accent)] px-5 py-3 text-sm text-[var(--sp-ink)] font-medium"
        >
          {savedNotice}
        </div>
      )}

      {/* =======================================================
          SECTION A: MY PROFILE + COMPANION + LEARNING PREFS + ACCOUNT
          ======================================================= */}
      {settingsTab === 'profile' && (
        <div className="space-y-6">
          <section
            aria-label="My Profile"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--sp-border)]">
              <div className="flex items-center gap-4">
                <StudentAvatar avatarId={draftAvatar} name={draftName} size={64} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)]">
                      {profile.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)]">
                      Demo Learner · Local Sandbox (Not Authenticated)
                    </span>
                  </div>
                  <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                    {profile.email} · {profile.university} · Target: <strong>{profile.careerNorthStar}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!profileEditing ? (
                  <button
                    type="button"
                    onClick={() => setProfileEditing(true)}
                    className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <span className="text-xs font-medium text-[var(--sp-accent)]">Editing enabled</span>
                )}
                <button
                  type="button"
                  onClick={handleResetToDemoLearner}
                  className="px-3.5 py-2 rounded-xl border border-[var(--sp-border)] text-xs font-medium text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Full Stack Demo Preset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-[var(--sp-border)] text-xs font-medium text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]"
                >
                  Setup Wizard
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Selector */}
              <div>
                <span className="block text-xs font-semibold text-[var(--sp-ink-muted)] mb-2">
                  Profile Picture / Emblem
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_OPTIONS.map((opt) => {
                    const selected = draftAvatar === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!profileEditing}
                        onClick={() => setDraftAvatar(opt.id)}
                        className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition-colors ${
                          selected
                            ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
                            : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] text-[var(--sp-ink-muted)]'
                        }`}
                      >
                        <StudentAvatar avatarId={opt.id} name={draftName} size={28} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name, Email, University, Major, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prof-name" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Display Name
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    disabled={!profileEditing}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] disabled:opacity-75"
                  />
                </div>
                <div>
                  <label htmlFor="prof-email" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Email Address
                  </label>
                  <input
                    id="prof-email"
                    type="email"
                    disabled={!profileEditing}
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] disabled:opacity-75"
                  />
                </div>
                <div>
                  <label htmlFor="prof-univ" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    University
                  </label>
                  <input
                    id="prof-univ"
                    type="text"
                    disabled={!profileEditing}
                    value={draftUniversity}
                    onChange={(e) => setDraftUniversity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] disabled:opacity-75"
                  />
                </div>
                <div>
                  <label htmlFor="prof-major" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Course / Major
                  </label>
                  <input
                    id="prof-major"
                    type="text"
                    disabled={!profileEditing}
                    value={draftMajor}
                    onChange={(e) => setDraftMajor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] disabled:opacity-75"
                  />
                </div>
                <div>
                  <label htmlFor="prof-year" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Academic Year
                  </label>
                  <input
                    id="prof-year"
                    type="text"
                    disabled={!profileEditing}
                    value={draftYear}
                    onChange={(e) => setDraftYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] disabled:opacity-75"
                  />
                </div>
                <div>
                  <label htmlFor="prof-role" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Target Career Role (Triggers Scenario B Adaptation)
                  </label>
                  <select
                    id="prof-role"
                    value={profile.targetRoleId}
                    onChange={(e) => {
                      const nextId = e.target.value as CareerRoleId;
                      changeTargetRole(nextId);
                      const roleObj = CAREER_ROLES.find((r) => r.id === nextId);
                      if (roleObj) setDraftNorthStar(roleObj.title);
                      flashNotice(`Target career updated to ${roleObj?.title ?? nextId} — Roadmap recalculated.`);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] font-medium"
                  >
                    {CAREER_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="prof-goals" className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Current Learning Goals Summary
                </label>
                <textarea
                  id="prof-goals"
                  rows={2}
                  disabled={!profileEditing}
                  value={draftGoalsSummary}
                  onChange={(e) => setDraftGoalsSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] disabled:opacity-75"
                />
              </div>

              {profileEditing && (
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Existing Technical & Soft Skills (Self-Reported vs Verified) */}
          <section
            aria-label="Learner technical and soft skills"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[var(--sp-accent)]" />
                  <span>Existing Technical & Soft Skills</span>
                </h2>
                <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                  Self-reported skills carry a 0.75x confidence cap until verified via a graded Skill Check on My Roadmap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('roadmap')}
                className="px-3.5 py-2 rounded-xl bg-[var(--sp-accent-soft)] text-[var(--sp-accent)] text-xs font-semibold hover:opacity-90 self-start sm:self-auto"
              >
                Open Skill Analysis & Roadmap →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.skills.map((skill) => {
                const isVerified = skill.verifiedLevel !== undefined;
                const needsRevision =
                  skill.lastAssessedScore !== undefined && skill.lastAssessedScore < 60;
                return (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--sp-ink)]">
                          {skill.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-[var(--sp-canvas)] border border-[var(--sp-border)] text-[var(--sp-ink-muted)]">
                          {skill.kind}
                        </span>
                        {isVerified ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              needsRevision
                                ? 'bg-[var(--sp-danger-soft)] text-[var(--sp-danger)]'
                                : 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                            }`}
                          >
                            {needsRevision
                              ? `Needs Revision (${skill.lastAssessedScore}%)`
                              : `Assessment-Verified (${skill.lastAssessedScore}%)`}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)]">
                            Self-Reported Only
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--sp-ink-muted)] font-mono tabular-nums">
                        Self-reported: {skill.selfReportedLevel}/5
                        {isVerified ? ` · Verified: ${skill.verifiedLevel}/5` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        aria-label={`Self-reported level for ${skill.name}`}
                        value={skill.selfReportedLevel}
                        onChange={(e) =>
                          upsertProfileSkill(skill.name, skill.kind, Number(e.target.value))
                        }
                        className="px-2 py-1 rounded-lg border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-mono text-[var(--sp-ink)]"
                      >
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}/5
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeProfileSkill(skill.id)}
                        aria-label={`Remove ${skill.name}`}
                        className="p-1.5 rounded-lg text-[var(--sp-ink-muted)] hover:text-[var(--sp-danger)] hover:bg-[var(--sp-danger-soft)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSkillName.trim()) return;
                upsertProfileSkill(newSkillName, newSkillKind, newSkillLevel);
                setNewSkillName('');
                flashNotice('Skill saved and 4-agent gap analysis updated.');
              }}
              className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--sp-border)]"
            >
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Add skill (e.g., JavaScript, React, Docker, Communication)..."
                aria-label="New skill name"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
              />
              <select
                value={newSkillKind}
                onChange={(e) => setNewSkillKind(e.target.value as SkillKind)}
                aria-label="Skill category"
                className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skill</option>
              </select>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                aria-label="Self-reported level"
                className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-mono text-[var(--sp-ink)]"
              >
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}/5
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </form>
          </section>

          {/* Certifications & Projects / Experience */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section
              aria-label="Certifications"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--sp-accent)]" />
                <span>Certifications</span>
              </h2>
              <div className="space-y-2.5">
                {profile.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--sp-ink)]">{cert.title}</p>
                      <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5">
                        {cert.issuer} · {cert.year} ·{' '}
                        <span className="font-semibold text-[var(--sp-accent)]">{cert.status}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert.id)}
                      aria-label={`Remove ${cert.title}`}
                      className="p-1 rounded-lg text-[var(--sp-ink-muted)] hover:text-[var(--sp-danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCertTitle.trim()) return;
                  addCertification({
                    title: newCertTitle.trim(),
                    issuer: newCertIssuer.trim() || 'Online Academy',
                    year: newCertYear.trim() || '2026',
                    status: newCertStatus,
                  });
                  setNewCertTitle('');
                  setNewCertIssuer('');
                  flashNotice('Certification added to profile.');
                }}
                className="space-y-2 pt-3 border-t border-[var(--sp-border)]"
              >
                <input
                  type="text"
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                  placeholder="Certification title..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder="Issuer..."
                    className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                  />
                  <input
                    type="text"
                    value={newCertYear}
                    onChange={(e) => setNewCertYear(e.target.value)}
                    placeholder="Year"
                    className="w-20 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-mono text-[var(--sp-ink)]"
                  />
                  <select
                    value={newCertStatus}
                    onChange={(e) => setNewCertStatus(e.target.value as 'Earned' | 'In Progress')}
                    className="px-2.5 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                  >
                    <option value="Earned">Earned</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </form>
            </section>

            <section
              aria-label="Projects and experience"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--sp-secondary)]" />
                <span>Projects & Experience</span>
              </h2>
              <div className="space-y-2.5">
                {profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--sp-ink)]">
                        {proj.title} <span className="font-normal text-[var(--sp-ink-muted)]">· {proj.role}</span>
                      </p>
                      <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5 leading-relaxed">
                        {proj.summary}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--sp-accent)] mt-1">
                        Skills: {proj.skillsUsed.join(', ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      aria-label={`Remove ${proj.title}`}
                      className="p-1 rounded-lg text-[var(--sp-ink-muted)] hover:text-[var(--sp-danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newProjTitle.trim()) return;
                  addProject({
                    title: newProjTitle.trim(),
                    role: newProjRole.trim() || 'Developer',
                    summary: newProjSummary.trim() || 'Applied hands-on project.',
                    skillsUsed: newProjSkills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  });
                  setNewProjTitle('');
                  setNewProjRole('');
                  setNewProjSummary('');
                  setNewProjSkills('');
                  flashNotice('Project added to profile.');
                }}
                className="space-y-2 pt-3 border-t border-[var(--sp-border)]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="Project or internship title..."
                    className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                  />
                  <input
                    type="text"
                    value={newProjRole}
                    onChange={(e) => setNewProjRole(e.target.value)}
                    placeholder="Role (e.g., Backend Intern)"
                    className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                  />
                </div>
                <input
                  type="text"
                  value={newProjSummary}
                  onChange={(e) => setNewProjSummary(e.target.value)}
                  placeholder="Brief impact summary..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjSkills}
                    onChange={(e) => setNewProjSkills(e.target.value)}
                    placeholder="Skills used (comma-separated, e.g. Python, SQL)"
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[var(--sp-secondary)] text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Learning Preferences + Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section
              aria-label="Personal learning preferences"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--sp-accent)]" />
                <span>Learning Preferences & Deadlines</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Primary Goal / Exam
                  </label>
                  <input
                    type="text"
                    value={deadlineGoal.examOrGoalName}
                    onChange={(e) => updateDeadlineGoal({ examOrGoalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={deadlineGoal.finalDate}
                    onChange={(e) => updateDeadlineGoal({ finalDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono text-[var(--sp-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Preferred Format
                  </label>
                  <select
                    value={learningPreferences.preferredFormat}
                    onChange={(e) =>
                      updateLearningPreferences({
                        preferredFormat: e.target.value as typeof learningPreferences.preferredFormat,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="reading">Readings & Notes</option>
                    <option value="visual">Visual Diagrams</option>
                    <option value="practice">Quizzes & Practice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                    Daily Focus Target (min)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={360}
                    step={5}
                    value={profile.dailyFocusGoalMinutes}
                    onChange={(e) => updateProfile({ dailyFocusGoalMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono tabular-nums text-[var(--sp-ink)]"
                  />
                </div>
              </div>
            </section>

            {/* Account & Honest Pre-Firebase Sign Out Area */}
            <section
              aria-label="Account and session control"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--sp-secondary)]" />
                  <span>Account Information & Session</span>
                </h2>
                <div className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] text-xs space-y-1">
                  <p className="font-semibold text-[var(--sp-ink)]">
                    Mode: Local Demo Workspace (Pre-Auth)
                  </p>
                  <p className="text-[var(--sp-ink-muted)] leading-relaxed">
                    Firebase Authentication & cloud sync are scheduled for Phase 4. All data currently stays safely stored in your browser. Signing out locks the session cleanly without deleting your tasks or rewards.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--sp-border)]">
                <span className="text-xs text-[var(--sp-ink-muted)] font-mono">
                  {profile.email}
                </span>
                <button
                  type="button"
                  onClick={signOutDemoSession}
                  className="px-4 py-2 rounded-xl border border-[var(--sp-danger)]/40 text-[var(--sp-danger)] hover:bg-[var(--sp-danger-soft)] text-xs font-semibold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out (Keep Saved Data)</span>
                </button>
              </div>
            </section>
          </div>

          {/* Preferred Companion Picker & Custom Rename */}
          <section
            aria-label="Preferred companion"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
          >
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--sp-accent)]" />
              <span>Preferred Companion & Custom Name</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPANIONS.map((c) => {
                const active = profile.activeCompanionId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      active
                        ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                        : 'border-[var(--sp-border)] bg-[var(--sp-canvas)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CompanionPortraitBadge companionId={c.id} size={48} />
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-[var(--sp-ink)] block truncate">
                            {getCompanionDisplayName(c.id)}
                          </span>
                          <span className="text-[11px] text-[var(--sp-ink-muted)] block">
                            {c.species} · {c.role}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCompanion(c.id as CompanionId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                          active
                            ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                            : 'bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink)]'
                        }`}
                      >
                        {active ? 'Active' : 'Select'}
                      </button>
                    </div>
                    <input
                      type="text"
                      aria-label={`Custom name for ${c.defaultName}`}
                      value={getCompanionDisplayName(c.id)}
                      onChange={(e) => renameCompanion(c.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--sp-border)] bg-[var(--sp-surface)] text-xs text-[var(--sp-ink)]"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* =======================================================
          SECTION B: MY DAILY PROGRESS (REAL DATA + DAY REVIEW)
          ======================================================= */}
      {settingsTab === 'progress' && (
        <div className="space-y-6">
          {/* Totals Strip (Real Resource Balances + Honey Drops + Collected Keepsakes) */}
          <section
            aria-label="Reward balances and progress totals"
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {[
              { label: 'Acorns', val: resources.acorns },
              { label: 'Focus Dewdrops', val: resources.dewdrops },
              { label: 'Meadow Blossoms', val: resources.blossoms },
              { label: 'Honey Drops', val: honeyDrops },
              { label: 'Collected Keepsakes', val: `${collectedRewards.length}/${decorations.length}` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-4"
              >
                <span className="text-xs text-[var(--sp-ink-muted)] block">{stat.label}</span>
                <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1">
                  {stat.val}
                </p>
              </div>
            ))}
          </section>

          {/* Interactive Weekly Activity Calendar */}
          <section
            aria-label="Weekly activity calendar"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--sp-accent)]" />
                  <span>Weekly Activity Calendar</span>
                </h2>
                <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                  Select any day to inspect actual recorded focus sessions, completed tasks, and quizzes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedDayIndex <= 0}
                  onClick={() =>
                    selectedDayIndex > 0 &&
                    setSelectedDayIso(calendarDays[selectedDayIndex - 1].iso)
                  }
                  className="p-2 rounded-xl border border-[var(--sp-border)] disabled:opacity-40 hover:bg-[var(--sp-surface-muted)]"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-[var(--sp-ink)] min-w-[110px] text-center">
                  {selectedDayMeta.fullLabel}
                </span>
                <button
                  type="button"
                  disabled={selectedDayIndex >= calendarDays.length - 1}
                  onClick={() =>
                    selectedDayIndex < calendarDays.length - 1 &&
                    setSelectedDayIso(calendarDays[selectedDayIndex + 1].iso)
                  }
                  className="p-2 rounded-xl border border-[var(--sp-border)] disabled:opacity-40 hover:bg-[var(--sp-surface-muted)]"
                  aria-label="Next day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2.5">
              {calendarDays.map((day) => {
                const mins = focusSessions
                  .filter((s) => s.isoDate === day.iso && s.mode === 'focus')
                  .reduce((acc, s) => acc + s.durationMinutes, 0);
                const tasksCount = microtasks.filter(
                  (t) => t.completed && t.completedDate === day.iso
                ).length;
                const active = day.iso === selectedDayIso;

                return (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={() => setSelectedDayIso(day.iso)}
                    aria-pressed={active}
                    className={`p-2 sm:p-3 rounded-xl border text-center transition-colors ${
                      active
                        ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] border-[var(--sp-accent)]'
                        : 'bg-[var(--sp-canvas)] text-[var(--sp-ink)] border-[var(--sp-border)] hover:bg-[var(--sp-surface-muted)]'
                    }`}
                  >
                    <span className="text-[11px] opacity-80 block">{day.shortDay}</span>
                    <span className="font-mono text-base font-semibold tabular-nums block mt-0.5">
                      {day.dateNum}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums opacity-85 block mt-1">
                      {mins}m · {tasksCount}t
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Visualization Bar */}
            <div className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--sp-ink)]">
                  Focus Goal Progress ({selectedDayMeta.fullLabel})
                </span>
                <span className="font-mono tabular-nums text-[var(--sp-ink)]">
                  {dayFocusMinutes}m / {profile.dailyFocusGoalMinutes}m ({dayGoalPct}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[var(--sp-canvas)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--sp-accent)] transition-all duration-300"
                  style={{ width: `${dayGoalPct}%` }}
                />
              </div>
            </div>
          </section>

          {/* Day Details: Sessions, Microtasks, Quizzes & Collected Keepsakes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section
              aria-label="Completed tasks on selected day"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-3"
            >
              <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Completed Tasks ({dayCompletedTasks.length})
              </h3>
              {dayCompletedTasks.length === 0 ? (
                <p className="text-xs text-[var(--sp-ink-muted)]">
                  No tasks marked complete on {selectedDayMeta.fullLabel}.
                </p>
              ) : (
                <ul className="space-y-2">
                  {dayCompletedTasks.map((t) => (
                    <li
                      key={t.id}
                      className="p-2.5 rounded-xl bg-[var(--sp-surface-muted)] text-xs text-[var(--sp-ink)] flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="font-mono tabular-nums text-[var(--sp-ink-muted)] shrink-0">
                        {t.estimatedMinutes}m
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-label="Study sessions on selected day"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-3"
            >
              <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Study Sessions ({daySessions.length})
              </h3>
              {daySessions.length === 0 ? (
                <p className="text-xs text-[var(--sp-ink-muted)]">
                  No timer sessions logged on {selectedDayMeta.fullLabel}.
                </p>
              ) : (
                <ul className="space-y-2">
                  {daySessions.map((s) => (
                    <li
                      key={s.id}
                      className="p-2.5 rounded-xl bg-[var(--sp-surface-muted)] text-xs space-y-0.5"
                    >
                      <div className="flex justify-between font-medium text-[var(--sp-ink)]">
                        <span className="truncate">{s.taskTitle}</span>
                        <span className="font-mono tabular-nums shrink-0">{s.durationMinutes}m</span>
                      </div>
                      <p className="text-[11px] text-[var(--sp-ink-muted)]">{s.rewardEarned}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-label="Arcade and rewards on selected day"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-3"
            >
              <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Quizzes & Rewards ({dayQuizzes.length})
              </h3>
              {dayQuizzes.length > 0 ? (
                <ul className="space-y-2">
                  {dayQuizzes.map((q) => (
                    <li
                      key={q.id}
                      className="p-2.5 rounded-xl bg-[var(--sp-surface-muted)] text-xs flex justify-between"
                    >
                      <span className="text-[var(--sp-ink)] truncate">{q.gameTitle}</span>
                      <span className="font-mono tabular-nums font-semibold text-[var(--sp-accent)] shrink-0">
                        {q.score}/{q.total}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--sp-ink-muted)]">
                  No quiz rounds played on {selectedDayMeta.fullLabel}.
                </p>
              )}

              <div className="pt-2 border-t border-[var(--sp-border)]">
                <VisualRewardStage compact />
              </div>
            </section>
          </div>

          {/* Collected Rewards Showcase */}
          <section
            aria-label="Collected keepsakes"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Collected Keepsakes ({collectedRewards.length})
              </h3>
              <button
                type="button"
                onClick={() => setActivePage('habitat')}
                className="text-xs font-semibold text-[var(--sp-accent)] hover:underline"
              >
                Place in Habitat
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {collectedRewards.map((dec) => (
                <div
                  key={dec.id}
                  className="px-3 py-2 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-center gap-2.5"
                >
                  <CollectibleIllustration type={dec.visualType} size={32} />
                  <div>
                    <p className="text-xs font-semibold text-[var(--sp-ink)]">{dec.name}</p>
                    <p className="text-[10px] text-[var(--sp-ink-muted)]">
                      {dec.placed ? `Placed in ${dec.spot}` : 'Stored'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =======================================================
          SECTION C: THEME STUDIO — 5 IMMERSIVE WORLDS (IMMEDIATE APPLY)
          ======================================================= */}
      {settingsTab === 'themes' && (
        <div className="space-y-6">
          <section
            aria-label="Theme Studio world selector"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[var(--sp-accent)]" />
                  <span>Theme Studio · 5 Immersive Environments</span>
                </h2>
                <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                  Click any world below to apply it immediately across the entire app and your companion’s miniature room. Sanctum room lighting & backdrops remain independent.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetThemeSettings();
                  setPreviewPreset('library');
                  setPreviewColorMode('light');
                  flashNotice('Reset appearance to Library defaults.');
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--sp-border)] text-xs font-medium text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] self-start"
              >
                Reset Theme Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {IMMERSIVE_THEMES.map((t) => {
                const isApplied = themeSettings.preset === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={isApplied}
                    onClick={() => {
                      setPreviewPreset(t.id);
                      updateThemeSettings({ preset: t.id });
                      flashNotice(`Applied ${t.name} theme across Thiranagam.`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      isApplied
                        ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)] ring-1 ring-[var(--sp-accent)]'
                        : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-surface-muted)]'
                    }`}
                  >
                    <ThemeSceneThumbnail themeId={t.id} className="mb-2.5" />
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1">
                        {t.swatches.map((hex) => (
                          <span
                            key={hex}
                            className="w-3 h-3 rounded-full border border-black/15"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      {isApplied && (
                        <span className="text-[10px] font-semibold text-[var(--sp-accent)] flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[var(--sp-ink)] block">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-[var(--sp-ink-muted)] block mt-0.5">
                      {t.navStyleLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Color Mode + Accent Color Staging */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--sp-border)]">
              <div>
                <span className="block text-xs font-semibold text-[var(--sp-ink-muted)] mb-1.5">
                  Color Mode ({resolvedColorMode})
                </span>
                <div className="inline-flex p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
                  {(['light', 'dark', 'system'] as ColorMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setPreviewColorMode(mode);
                        updateThemeSettings({ colorMode: mode });
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                        themeSettings.colorMode === mode
                          ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)] shadow-xs'
                          : 'text-[var(--sp-ink-muted)]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[var(--sp-ink-muted)] mb-1.5">
                  Accent Override
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_SUGGESTIONS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => updateThemeSettings({ customAccent: item.value })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                        themeSettings.customAccent === item.value
                          ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
                          : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] text-[var(--sp-ink-muted)]'
                      }`}
                    >
                      {item.value && (
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.value }}
                        />
                      )}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Theme Preview Box */}
            <ThemeLivePreview
              previewPreset={themeSettings.preset}
              previewMode={themeSettings.colorMode}
              resolvedSystemDark={resolvedColorMode === 'dark'}
              fontPreset={themeSettings.fontPreset}
              headingStyle={themeSettings.headingStyle}
              isCurrentlyApplied={themeSettings.preset === previewPreset}
              onApply={() => {
                updateThemeSettings({ preset: previewPreset, colorMode: previewColorMode });
                flashNotice(`Applied ${previewPreset} world theme.`);
              }}
            />
          </section>
        </div>
      )}

      {/* =======================================================
          SECTION D: TYPOGRAPHY, ADHD, SOUND & WORKSPACE DATA
          ======================================================= */}
      {settingsTab === 'typography' && (
        <div className="space-y-6">
          <section
            aria-label="Typography customization"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Type className="w-5 h-5 text-[var(--sp-accent)]" />
                  <span>Typography & Reading Ergonomics</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateThemeSettings({
                    fontPreset: themeSettings.fontPreset === 'dyslexia' ? 'sans' : 'dyslexia',
                  })
                }
                aria-pressed={themeSettings.fontPreset === 'dyslexia'}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  themeSettings.fontPreset === 'dyslexia'
                    ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] border-[var(--sp-accent)]'
                    : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink)] border-[var(--sp-border)]'
                }`}
              >
                Lexend Dyslexia-Friendly Font: {themeSettings.fontPreset === 'dyslexia' ? 'On' : 'Off'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-[var(--sp-ink-muted)] mb-1">
                  <label htmlFor="typo-size">Font Size</label>
                  <span className="font-mono tabular-nums text-[var(--sp-ink)]">
                    {themeSettings.fontSizePx}px
                  </span>
                </div>
                <input
                  id="typo-size"
                  type="range"
                  min={14}
                  max={20}
                  step={1}
                  value={themeSettings.fontSizePx}
                  onChange={(e) => updateThemeSettings({ fontSizePx: Number(e.target.value) })}
                  className="w-full accent-[var(--sp-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Reading Typography
                </label>
                <select
                  value={themeSettings.fontPreset}
                  onChange={(e) =>
                    updateThemeSettings({
                      fontPreset: e.target.value as typeof themeSettings.fontPreset,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  <option value="sans">Plus Jakarta Sans</option>
                  <option value="serif">Lora Editorial Serif</option>
                  <option value="dyslexia">Lexend (Dyslexia-Friendly)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Heading Style
                </label>
                <select
                  value={themeSettings.headingStyle}
                  onChange={(e) =>
                    updateThemeSettings({ headingStyle: e.target.value as HeadingStyle })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  <option value="editorial">Fraunces Editorial Serif</option>
                  <option value="clean">Plus Jakarta Sans Clean</option>
                  <option value="classic">Lora Classic Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Line Spacing
                </label>
                <select
                  value={themeSettings.lineSpacing}
                  onChange={(e) =>
                    updateThemeSettings({
                      lineSpacing: e.target.value as typeof themeSettings.lineSpacing,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  <option value="compact">Compact (1.40)</option>
                  <option value="comfortable">Comfortable (1.58)</option>
                  <option value="relaxed">Relaxed (1.80)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Reading Width
                </label>
                <select
                  value={themeSettings.readingWidth}
                  onChange={(e) =>
                    updateThemeSettings({
                      readingWidth: e.target.value as typeof themeSettings.readingWidth,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  <option value="focused">Focused (960px)</option>
                  <option value="balanced">Balanced (1220px)</option>
                  <option value="spacious">Spacious (1340px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Border Contrast
                </label>
                <select
                  value={themeSettings.contrast}
                  onChange={(e) =>
                    updateThemeSettings({
                      contrast: e.target.value as typeof themeSettings.contrast,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  <option value="standard">Standard Soft</option>
                  <option value="high">High Contrast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--sp-ink-muted)] mb-1">
                  Animation Intensity
                </label>
                <select
                  value={themeSettings.animationIntensity}
                  onChange={(e) =>
                    updateThemeSettings({
                      animationIntensity: e.target.value as typeof themeSettings.animationIntensity,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  <option value="calm">Calm (Full Living World)</option>
                  <option value="minimal">Minimal</option>
                  <option value="off">Off (Stillness)</option>
                </select>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ADHD & Sensory */}
            <section
              aria-label="ADHD and sensory controls"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-3"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--sp-secondary)]" />
                <span>ADHD & Sensory Controls</span>
              </h2>
              {[
                {
                  label: 'Low-Stimulation Mode',
                  checked: profile.lowStimulationMode,
                  onChange: toggleLowStimulation,
                  icon: EyeOff,
                },
                {
                  label: 'Reduced Motion',
                  checked: profile.reducedMotion,
                  onChange: () => updateProfile({ reducedMotion: !profile.reducedMotion }),
                },
                {
                  label: 'Desktop Cursor-Following Companion Eyes',
                  checked: adhdPreferences.cursorFollowingEyes,
                  onChange: () =>
                    updateADHDPreferences({
                      cursorFollowingEyes: !adhdPreferences.cursorFollowingEyes,
                    }),
                },
                {
                  label: 'Auto-split new microtasks into starter steps',
                  checked: adhdPreferences.autoMicrotaskBreakdown,
                  onChange: () =>
                    updateADHDPreferences({
                      autoMicrotaskBreakdown: !adhdPreferences.autoMicrotaskBreakdown,
                    }),
                },
                {
                  label: 'Body Doubling presence in Timer',
                  checked: adhdPreferences.bodyDoublingMode,
                  onChange: () =>
                    updateADHDPreferences({ bodyDoublingMode: !adhdPreferences.bodyDoublingMode }),
                },
                {
                  label: 'Reward & Break Sound Chime (only when enabled)',
                  checked: notificationPreferences.breakChimeEnabled,
                  onChange: () =>
                    updateNotificationPreferences({
                      breakChimeEnabled: !notificationPreferences.breakChimeEnabled,
                    }),
                  icon: Bell,
                },
              ].map((row) => (
                <label
                  key={row.label}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--sp-surface-muted)] cursor-pointer"
                >
                  <span className="text-xs font-medium text-[var(--sp-ink)]">{row.label}</span>
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={row.onChange}
                    className="w-4 h-4 accent-[var(--sp-accent)]"
                  />
                </label>
              ))}
            </section>

            {/* Sound & Data Export */}
            <section
              aria-label="Audio and data management"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[var(--sp-accent)]" />
                <span>Soundscape & Local Data</span>
              </h2>
              <div className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--sp-ink)]">Ambient Track</span>
                  <button
                    type="button"
                    onClick={toggleSoundPlaying}
                    className="text-xs font-semibold text-[var(--sp-accent)] underline"
                  >
                    {soundPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                <select
                  value={activeSoundTrack}
                  onChange={(e) => selectSoundTrack(e.target.value as typeof activeSoundTrack)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--sp-border)] bg-[var(--sp-surface)] text-xs text-[var(--sp-ink)]"
                >
                  {SOUNDSCAPE_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  aria-label="Ambient volume"
                  className="w-full accent-[var(--sp-accent)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    exportWorkspaceJson();
                    flashNotice('Exported workspace JSON.');
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrainDump('');
                    flashNotice('Cleared Brain Dump.');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[var(--sp-border)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  Clear Brain Dump
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmReset) {
                      setConfirmReset(true);
                      return;
                    }
                    resetDemoWorkspace();
                    setConfirmReset(false);
                    flashNotice('Demo workspace restored.');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--sp-danger)] hover:bg-[var(--sp-danger-soft)] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{confirmReset ? 'Confirm Reset' : 'Reset Demo Data'}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
