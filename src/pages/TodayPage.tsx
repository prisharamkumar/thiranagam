import React, { useState } from 'react';
import {
  ArrowRight,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Check,
  Compass,
  Edit3,
  Feather,
  LifeBuoy,
  Minimize2,
  Palette,
  Play,
  Plus,
  Save,
  Sparkles,
  Sprout,
  Timer,
  X,
} from 'lucide-react';
import { COMPANIONS, IMMERSIVE_THEMES } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { CompanionPortraitBadge } from '../components/CompanionPortraitBadge';
import { DistractionParkingLot } from '../components/DistractionParkingLot';
import { VisualRewardStage } from '../components/VisualRewardStage';
import { EnergyLevel } from '../types';

interface TodayPageProps {
  onOpenProfile: () => void;
}

const ENERGY_OPTIONS: {
  id: EnergyLevel;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'low',
    label: 'Low-Energy Mode',
    hint: '2–12m gentle blocks',
    icon: BatteryLow,
  },
  {
    id: 'steady',
    label: 'Gentle Pace',
    hint: '20–25m cadence',
    icon: BatteryMedium,
  },
  {
    id: 'bright',
    label: 'Deep Focus',
    hint: '35–45m sprint',
    icon: BatteryCharging,
  },
];

const ENERGY_GUIDANCE: Record<
  EnergyLevel,
  {
    coachHeading: string;
    coachMessage: string;
    recommendedBlock: string;
  }
> = {
  low: {
    coachHeading: 'Low-Energy Mode · Gentle Start',
    coachMessage:
      'Start with a 2-minute warm-up or one small card review, and stop cleanly at the first chime.',
    recommendedBlock: '2m Warm-Up or 12m Focus',
  },
  steady: {
    coachHeading: 'Gentle Pace · Balanced Cadence',
    coachMessage:
      'Focus only on the very first sub-step without holding the entire module in mind.',
    recommendedBlock: '25m Focus · 5m Rest',
  },
  bright: {
    coachHeading: 'Deep Focus · Creative Momentum',
    coachMessage:
      'Great window for tackling a multi-step synthesis block before taking a restful break.',
    recommendedBlock: '35m Focus · 10m Rest',
  },
};

export const TodayPage: React.FC<TodayPageProps> = ({ onOpenProfile }) => {
  const {
    profile,
    energy,
    setEnergy,
    microtasks,
    toggleMicrotask,
    addMicrotask,
    editMicrotask,
    intentions,
    toggleIntention,
    modules,
    resources,
    deadlineGoal,
    adhdPreferences,
    updateADHDPreferences,
    setCompanion,
    getCompanionDisplayName,
    openTaskInFocusStudio,
    startTwoMinuteWarmup,
    setRestartModalOpen,
    setActivePage,
    openThemeStudio,
    themeSettings,
    totalFocusMinutesToday,
  } = useAppState();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(15);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const companion = COMPANIONS.find((c) => c.id === profile.activeCompanionId) ?? COMPANIONS[0];
  const companionName = getCompanionDisplayName(companion.id);
  const themeName =
    IMMERSIVE_THEMES.find((t) => t.id === themeSettings.preset)?.name ?? 'Library';
  const primaryTask = microtasks.find((t) => !t.completed) ?? microtasks[0];
  const guidance = ENERGY_GUIDANCE[energy];

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addMicrotask(newTaskTitle, newTaskMinutes);
    setNewTaskTitle('');
  };

  const handleCompleteAndCelebrate = (taskId: string) => {
    toggleMicrotask(taskId);
  };

  const completedTasksCount = microtasks.filter((t) => t.completed).length;
  const activeModules = modules.filter((m) => m.status !== 'upcoming');

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-7">
      {/* Top Greeting & Student Context */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs font-medium text-[var(--sp-ink-muted)] flex flex-wrap items-center gap-2">
            <span>{todayFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.university}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{totalFocusMinutesToday} min focused today</span>
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1.5 tracking-tight">
            Welcome back, {profile.name.split(' ')[0]}.
          </h1>
          <p className="text-sm text-[var(--sp-ink-muted)] mt-1">
            Your Learning Universe. Your Pace. Your Progress. ·{' '}
            <span className="text-[var(--sp-ink)] font-medium">{deadlineGoal.examOrGoalName}</span>{' '}
            ({deadlineGoal.finalDate})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              updateADHDPreferences({ oneTaskAtATime: !adhdPreferences.oneTaskAtATime })
            }
            aria-pressed={adhdPreferences.oneTaskAtATime}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              adhdPreferences.oneTaskAtATime
                ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
                : 'bg-[var(--sp-surface)] border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>One-Task View</span>
          </button>

          <button
            type="button"
            onClick={() => setRestartModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)] hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Help Me Restart</span>
          </button>

          <button
            type="button"
            onClick={openThemeStudio}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--sp-accent)]" aria-hidden="true" />
            <span>Theme Studio</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] transition-colors whitespace-nowrap"
          >
            Edit Profile
          </button>
        </div>
      </header>

      {/* Energy Check-In + Main Learning Action Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <section
          aria-label="Main learning action"
          className={`${
            adhdPreferences.oneTaskAtATime ? 'xl:col-span-12' : 'xl:col-span-7'
          } rounded-2xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden`}
        >
          {primaryTask ? (
            <>
              <div className="relative z-10">
                <p className="text-xs opacity-85 flex items-center gap-2">
                  <span>One Main Next Action</span>
                  <span aria-hidden="true">·</span>
                  <span>{primaryTask.moduleTitle}</span>
                </p>
                <h2 className="font-display text-2xl sm:text-[26px] font-semibold leading-snug mt-2 max-w-2xl">
                  {primaryTask.title}
                </h2>
                <p className="text-sm opacity-90 mt-3 max-w-xl leading-relaxed">
                  {guidance.coachMessage}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs opacity-85 flex items-center gap-3 tabular-nums">
                  <span>Estimated {primaryTask.estimatedMinutes} min</span>
                  <span aria-hidden="true">·</span>
                  <span>{guidance.recommendedBlock}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => startTwoMinuteWarmup(primaryTask.id)}
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>Just Start (2-Min Starter)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openTaskInFocusStudio(primaryTask.id)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--sp-surface)] text-[var(--sp-ink)] text-sm font-semibold hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Timer className="w-4 h-4" aria-hidden="true" />
                    <span>Open Focus Studio</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Ready for a fresh microtask</h2>
              <button
                type="button"
                onClick={() => setActivePage('todos')}
                className="px-5 py-2.5 rounded-xl bg-[var(--sp-surface)] text-[var(--sp-ink)] text-sm font-semibold"
              >
                Open To-do List
              </button>
            </div>
          )}
        </section>

        {!adhdPreferences.oneTaskAtATime && (
          <section
            aria-label="Energy check-in"
            className="xl:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Energy-Aware Check-In
              </h2>
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                {ENERGY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = energy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEnergy(opt.id)}
                      aria-pressed={active}
                      className={`p-3 rounded-xl border text-left transition-colors flex flex-col gap-1.5 ${
                        active
                          ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
                          : 'bg-[var(--sp-canvas)] border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)] hover:text-[var(--sp-ink)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                      <span className="text-[11px] leading-tight opacity-85">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--sp-border)]">
              <div className="flex items-center justify-between text-xs text-[var(--sp-secondary)] font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{guidance.coachHeading}</span>
                </span>
              </div>
              <p className="text-xs text-[var(--sp-ink-muted)] leading-relaxed">
                {guidance.coachMessage}
              </p>
            </div>
          </section>
        )}
      </div>

      {!adhdPreferences.oneTaskAtATime && (
        <>
          {/* Middle Row: Editable Microtasks + Animated Companion & Visual Honey Jar Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section
              aria-label="Microtask checklist"
              className="lg:col-span-7 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                    Today’s Microtasks
                  </h2>
                  <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
                    {completedTasksCount} of {microtasks.length} steps completed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePage('todos')}
                  className="text-xs font-medium text-[var(--sp-accent)] hover:underline whitespace-nowrap"
                >
                  Open full To-do List
                </button>
              </div>

              <form onSubmit={handleAddTask} className="flex flex-wrap sm:flex-nowrap items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a manageable 10–25 min microtask..."
                  aria-label="Add a microtask"
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] placeholder:text-[var(--sp-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
                />
                <select
                  aria-label="Estimated duration in minutes"
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-mono tabular-nums text-[var(--sp-ink)]"
                >
                  {[5, 10, 15, 20, 25, 35].map((m) => (
                    <option key={m} value={m}>
                      {m}m
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] hover:opacity-95 transition-opacity flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </form>

              <div className="divide-y divide-[var(--sp-border)]">
                {microtasks.map((task) => {
                  const isEditing = editingId === task.id;
                  return (
                    <div
                      key={task.id}
                      className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--sp-accent)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              editMicrotask(task.id, { title: draftTitle });
                              setEditingId(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg border border-[var(--sp-border)] text-[var(--sp-ink-muted)]"
                            aria-label="Cancel editing task"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCompleteAndCelebrate(task.id)}
                            className="flex items-start gap-3 text-left min-w-0 flex-1 group"
                          >
                            <span
                              className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                                  : 'border-[var(--sp-border)] bg-[var(--sp-surface)] group-hover:border-[var(--sp-accent)]'
                              }`}
                            >
                              {task.completed && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                            </span>
                            <div className="min-w-0">
                              <span
                                className={`text-sm font-medium block leading-snug ${
                                  task.completed
                                    ? 'line-through text-[var(--sp-ink-muted)]'
                                    : 'text-[var(--sp-ink)]'
                                }`}
                              >
                                {task.title}
                              </span>
                              <span className="text-xs text-[var(--sp-ink-muted)] mt-0.5 block tabular-nums">
                                {task.moduleTitle} · {task.estimatedMinutes} min
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(task.id);
                                setDraftTitle(task.title);
                              }}
                              aria-label={`Edit "${task.title}"`}
                              className="p-1.5 rounded-lg text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)] hover:text-[var(--sp-ink)]"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openTaskInFocusStudio(task.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--sp-accent)] hover:bg-[var(--sp-accent-soft)] transition-colors whitespace-nowrap"
                            >
                              Focus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Companion Rewards & Switcher (Living Pet Lives Permanently in Bottom-Left Room) */}
            <section
              aria-label="Companion rewards and switcher"
              className="lg:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <CompanionPortraitBadge companionId={companion.id} size={56} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--sp-ink-muted)]">
                    {companion.species} · {companion.role}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)]">
                    {companionName}
                  </h2>
                  <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5">
                    Resting in your bottom-left {themeName} room
                  </p>
                </div>
              </div>

              {/* Pure Visual Reward Artifact (e.g. Filling Honey Jar / Jasmine Vine / Study Lantern) */}
              <VisualRewardStage companionId={companion.id} />

              <div className="pt-3 border-t border-[var(--sp-border)] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  {COMPANIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCompanion(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        c.id === companion.id
                          ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                          : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                      }`}
                    >
                      {getCompanionDisplayName(c.id)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActivePage('habitat')}
                  className="text-xs font-semibold text-[var(--sp-accent)] hover:underline whitespace-nowrap"
                >
                  Open Habitat
                </button>
              </div>
            </section>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section
              aria-label="Gentle intentions and garden progress"
              className="lg:col-span-4 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Feather className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
                  <span>Gentle Intentions</span>
                </h3>
                <span className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
                  {intentions.filter((i) => i.completed).length}/{intentions.length}
                </span>
              </div>

              <div className="space-y-2">
                {intentions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleIntention(item.id)}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--sp-surface-muted)] hover:opacity-90 transition-opacity text-left"
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        item.completed
                          ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                          : 'border-[var(--sp-border)] bg-[var(--sp-surface)]'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3" aria-hidden="true" />}
                    </span>
                    <span
                      className={`text-xs leading-relaxed ${
                        item.completed
                          ? 'line-through text-[var(--sp-ink-muted)]'
                          : 'text-[var(--sp-ink)]'
                      }`}
                    >
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[var(--sp-border)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[var(--sp-ink)] flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-[var(--sp-accent)]" aria-hidden="true" />
                    <span>Whispering Willow Grove</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePage('habitat')}
                    className="text-xs font-medium text-[var(--sp-accent)] hover:underline"
                  >
                    Open Habitat
                  </button>
                </div>
                <p className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
                  {resources.acorns} Acorns · {resources.dewdrops} Dewdrops · {resources.blossoms} Blossoms
                </p>
              </div>
            </section>

            <section
              aria-label="Course pathway progress"
              className="lg:col-span-4 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
                  <span>Course Pathway</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActivePage('roadmap')}
                  className="text-xs font-medium text-[var(--sp-accent)] hover:underline"
                >
                  Roadmap
                </button>
              </div>

              <div className="space-y-3.5">
                {activeModules.map((mod) => (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[var(--sp-ink)] truncate">{mod.title}</span>
                      <span className="font-mono tabular-nums text-[var(--sp-ink-muted)] shrink-0">
                        {mod.progressPct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--sp-surface-muted)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--sp-accent)] transition-all duration-300"
                        style={{ width: `${mod.progressPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="lg:col-span-4">
              <DistractionParkingLot compact />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
