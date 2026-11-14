import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  EyeOff,
  LifeBuoy,
  ListChecks,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Users,
  Volume2,
} from 'lucide-react';
import { COMPANIONS, IMMERSIVE_THEMES, SOUNDSCAPE_TRACKS } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { CompanionPortraitBadge } from '../components/CompanionPortraitBadge';
import { DistractionParkingLot } from '../components/DistractionParkingLot';
import { VisualRewardStage } from '../components/VisualRewardStage';
import { TimerMode } from '../types';

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus Session',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const formatMMSS = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const FocusStudioPage: React.FC = () => {
  const {
    profile,
    themeSettings,
    energy,
    adhdPreferences,
    updateADHDPreferences,
    microtasks,
    activeFocusTaskId,
    setActiveFocusTaskId,
    toggleMicrotask,
    toggleSubstep,
    addSubstepsToTask,
    brainDump,
    setBrainDump,
    addDistraction,
    setCompanion,
    getCompanionDisplayName,
    soundPlaying,
    toggleSoundPlaying,
    activeSoundTrack,
    selectSoundTrack,
    soundVolume,
    setSoundVolume,
    toggleLowStimulation,
    pendingTwoMinuteWarmup,
    clearPendingWarmup,
    setRestartModalOpen,
    timerMode,
    timerDurations,
    timerSecondsLeft,
    timerRunning,
    timerHasStarted,
    isTwoMinuteWarmup,
    sessionToast,
    dismissSessionToast,
    setSessionToastMessage,
    switchTimerMode,
    startOrResumeTimer,
    pauseTimer,
    resetTimer,
    adjustTimerMinutes,
    setCustomTimerDuration,
    triggerTwoMinuteWarmupInPlace,
    companionMood,
  } = useAppState();

  const [newStepText, setNewStepText] = useState('');
  const [rescueOpen, setRescueOpen] = useState(false);
  const [rescueInput, setRescueInput] = useState('');

  const mode = timerMode;
  const durations = timerDurations;
  const secondsLeft = timerSecondsLeft;
  const isRunning = timerRunning;
  const hasStarted = timerHasStarted;

  const activeTask = useMemo(
    () => microtasks.find((t) => t.id === activeFocusTaskId) ?? microtasks[0],
    [microtasks, activeFocusTaskId]
  );

  const companion = COMPANIONS.find((c) => c.id === profile.activeCompanionId) ?? COMPANIONS[0];
  const companionName = getCompanionDisplayName(companion.id);
  const themeName =
    IMMERSIVE_THEMES.find((t) => t.id === themeSettings.preset)?.name ?? 'Library';

  useEffect(() => {
    if (!pendingTwoMinuteWarmup) return;
    clearPendingWarmup();
  }, [pendingTwoMinuteWarmup, clearPendingWarmup]);

  const totalModeSeconds = isTwoMinuteWarmup ? 120 : durations[mode] * 60;
  const progressRatio =
    totalModeSeconds > 0 ? (totalModeSeconds - secondsLeft) / totalModeSeconds : 0;

  const handleModeSwitch = (nextMode: TimerMode) => {
    switchTimerMode(nextMode);
  };

  const handleStartTwoMinuteWarmup = () => {
    triggerTwoMinuteWarmupInPlace();
  };

  const handleStartOrResume = () => {
    startOrResumeTimer();
  };

  const handlePause = () => pauseTimer();

  const handleReset = () => {
    resetTimer();
  };

  const handleAdjustMinutes = (deltaMinutes: number) => {
    adjustTimerMinutes(deltaMinutes);
  };

  const handleAddSubstep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !newStepText.trim()) return;
    addSubstepsToTask(activeTask.id, [newStepText]);
    setNewStepText('');
  };

  const handleApplyDeterministicBreakdown = () => {
    if (!activeTask) return;
    const starterSteps =
      energy === 'low'
        ? [
            'Open only the exact page or file needed',
            'Spend 2 gentle minutes outlining 2 rough thoughts',
            'Save progress and take a stretch break',
          ]
        : [
            'Clarify the single deliverable for this timer block',
            'Draft or annotate the core section without editing yet',
            'Review in the final 3 minutes and log one next step',
          ];
    addSubstepsToTask(activeTask.id, starterSteps);
  };

  const handleRescueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rescueInput.trim()) {
      addDistraction(rescueInput);
    }
    setRescueInput('');
    setRescueOpen(false);
    setSessionToastMessage('Thought parked safely. You are right back on your active microtask.');
  };

  const ringRadius = 112;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Timer Studio · {MODE_LABELS[mode]} · Energy: {energy}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[var(--sp-ink)] mt-1">
            Calm Study Workspace
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setRescueOpen((v) => !v)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--sp-warm-soft)] text-[var(--sp-warm)] hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Distraction Rescue</span>
          </button>

          <button
            type="button"
            onClick={() => setRestartModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)] hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Help Me Restart</span>
          </button>

          <button
            type="button"
            onClick={() =>
              updateADHDPreferences({ oneTaskAtATime: !adhdPreferences.oneTaskAtATime })
            }
            aria-pressed={adhdPreferences.oneTaskAtATime}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              adhdPreferences.oneTaskAtATime
                ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-ink)] border-[var(--sp-accent)]'
                : 'bg-[var(--sp-surface)] text-[var(--sp-ink-muted)] border-[var(--sp-border)]'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>One-Task View</span>
          </button>

          <button
            type="button"
            onClick={toggleLowStimulation}
            aria-pressed={profile.lowStimulationMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              profile.lowStimulationMode
                ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] border-[var(--sp-accent)]'
                : 'bg-[var(--sp-surface)] text-[var(--sp-ink)] border-[var(--sp-border)] hover:bg-[var(--sp-surface-muted)]'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Low-Stim: {profile.lowStimulationMode ? 'On' : 'Off'}</span>
          </button>
        </div>
      </header>

      {rescueOpen && (
        <section
          aria-label="Distraction rescue"
          className="rounded-2xl bg-[var(--sp-warm-soft)] border border-[var(--sp-warm)]/40 p-5 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Distraction Rescue — Gentle Return
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                Park whatever pulled your attention and return straight to “{activeTask?.title}”.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRescueOpen(false)}
              className="text-xs font-semibold text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]"
            >
              Close
            </button>
          </div>
          <form onSubmit={handleRescueSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              type="text"
              value={rescueInput}
              onChange={(e) => setRescueInput(e.target.value)}
              placeholder="What pulled your attention?"
              className="flex-1 min-w-[220px] px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-surface)] text-sm text-[var(--sp-ink)]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold whitespace-nowrap"
            >
              Park & Return to Task
            </button>
          </form>
        </section>
      )}

      {sessionToast && (
        <div
          role="status"
          className="rounded-2xl bg-[var(--sp-accent-soft)] border border-[var(--sp-accent)] px-5 py-3.5 flex items-center justify-between gap-4 text-sm text-[var(--sp-ink)]"
        >
          <span className="font-medium">{sessionToast}</span>
          <button
            type="button"
            onClick={dismissSessionToast}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-6">
          <section
            aria-label="Pomodoro timer"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 sm:p-8 flex flex-col items-center text-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
                {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeSwitch(m)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      mode === m && !isTwoMinuteWarmup
                        ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)] shadow-xs'
                        : 'text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                    }`}
                  >
                    {MODE_LABELS[m]} ({durations[m]}m)
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleStartTwoMinuteWarmup}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  isTwoMinuteWarmup
                    ? 'bg-[var(--sp-secondary)] text-white border-[var(--sp-secondary)]'
                    : 'bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)] border-[var(--sp-border)] hover:opacity-90'
                }`}
              >
                Just Start · 2m Warm-Up
              </button>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
                <circle
                  cx="130"
                  cy="130"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--sp-surface-muted)"
                  strokeWidth="12"
                />
                <circle
                  cx="130"
                  cy="130"
                  r={ringRadius}
                  fill="none"
                  stroke={mode === 'focus' ? 'var(--sp-accent)' : 'var(--sp-secondary)'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-[var(--sp-ink-muted)]">
                  {isTwoMinuteWarmup ? '2-Min Gentle Starter' : MODE_LABELS[mode]}
                </span>
                <span
                  aria-live="polite"
                  className="font-mono text-5xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1 tracking-tight"
                >
                  {formatMMSS(secondsLeft)}
                </span>
                <span className="text-xs text-[var(--sp-ink-muted)] mt-2">
                  {isRunning ? 'In progress' : hasStarted ? 'Paused' : 'Ready when you are'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjustMinutes(-5)}
                className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] transition-colors flex items-center gap-1 tabular-nums"
                aria-label="Subtract 5 minutes"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>5m</span>
              </button>

              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartOrResume}
                  className="px-6 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-sm font-semibold hover:opacity-95 transition-opacity flex items-center gap-2 min-w-[136px] justify-center"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>{hasStarted ? 'Resume' : 'Start'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-6 py-2.5 rounded-xl bg-[var(--sp-warm)] text-white text-sm font-semibold hover:opacity-95 transition-opacity flex items-center gap-2 min-w-[136px] justify-center"
                >
                  <Pause className="w-4 h-4" aria-hidden="true" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAdjustMinutes(5)}
                className="px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] transition-colors flex items-center gap-1 tabular-nums"
                aria-label="Add 5 minutes"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>5m</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-surface)] text-xs font-medium text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>

            <div className="mt-5 w-full max-w-sm pt-4 border-t border-[var(--sp-border)]">
              <div className="flex items-center justify-between text-xs text-[var(--sp-ink-muted)] mb-1.5">
                <label htmlFor="duration-slider">Custom {MODE_LABELS[mode]} Duration</label>
                <span className="font-mono tabular-nums text-[var(--sp-ink)]">{durations[mode]} min</span>
              </div>
              <input
                id="duration-slider"
                type="range"
                min={5}
                max={60}
                step={5}
                disabled={isRunning}
                value={durations[mode]}
                onChange={(e) => setCustomTimerDuration(Number(e.target.value))}
                className="w-full accent-[var(--sp-accent)] cursor-pointer disabled:opacity-50"
              />
            </div>
          </section>

          {/* Animated Body Doubling Companion Stage + Soundscape */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <section
              aria-label="Body doubling companion theater"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-[var(--sp-ink-muted)] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--sp-accent)]" aria-hidden="true" />
                    <span>Body Doubling Presence</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={adhdPreferences.bodyDoublingMode}
                    onClick={() =>
                      updateADHDPreferences({ bodyDoublingMode: !adhdPreferences.bodyDoublingMode })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      adhdPreferences.bodyDoublingMode
                        ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                        : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink-muted)]'
                    }`}
                  >
                    {adhdPreferences.bodyDoublingMode ? 'Active' : 'Paused'}
                  </button>
                </div>

                {adhdPreferences.bodyDoublingMode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <CompanionPortraitBadge companionId={companion.id} size={56} />
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                          {companionName} · {companion.species}
                        </h2>
                        <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                          Live in your bottom-left {themeName} room ·{' '}
                          <span className="font-medium text-[var(--sp-ink)] capitalize">
                            {companion.id === 'pattu' && companionMood === 'focus'
                              ? 'Sleeping peacefully'
                              : companion.id === 'pattu' &&
                                  (companionMood === 'break' || companionMood === 'waking')
                                ? 'Waking, stretching & walking'
                                : companionMood}
                          </span>
                        </p>
                      </div>
                    </div>
                    <VisualRewardStage companionId={companion.id} compact />
                  </div>
                ) : (
                  <p className="text-xs text-[var(--sp-ink-muted)] py-4">
                    Body Doubling presence paused.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--sp-border)] flex flex-wrap items-center gap-1.5">
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
            </section>

            <section
              aria-label="Ambient soundscape"
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
                    <span>Soundscape</span>
                  </h2>
                  <button
                    type="button"
                    onClick={toggleSoundPlaying}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      soundPlaying
                        ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                        : 'bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
                    }`}
                  >
                    {soundPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{soundPlaying ? 'Pause' : 'Start Audio'}</span>
                  </button>
                </div>
                <p className="text-xs text-[var(--sp-ink-muted)]">
                  Plays only when you toggle Start Audio.
                </p>

                <select
                  aria-label="Choose ambient soundscape"
                  value={activeSoundTrack}
                  onChange={(e) => selectSoundTrack(e.target.value as typeof activeSoundTrack)}
                  className="mt-3 w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
                >
                  {SOUNDSCAPE_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--sp-border)] flex items-center justify-between gap-3">
                <label htmlFor="focus-vol" className="text-xs text-[var(--sp-ink-muted)] shrink-0">
                  Volume ({Math.round(soundVolume * 100)}%)
                </label>
                <input
                  id="focus-vol"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-full accent-[var(--sp-accent)] cursor-pointer"
                />
              </div>
            </section>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-5 space-y-6">
          <section
            aria-label="Current microtask and breakdown"
            className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
                  <span>Current Microtask</span>
                </h2>
              </div>
              {activeTask && (
                <button
                  type="button"
                  onClick={() => toggleMicrotask(activeTask.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeTask.completed
                      ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                      : 'bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
                  }`}
                >
                  {activeTask.completed ? 'Completed' : 'Mark Complete'}
                </button>
              )}
            </div>

            <div>
              <label htmlFor="active-microtask-select" className="sr-only">
                Select active microtask
              </label>
              <select
                id="active-microtask-select"
                value={activeTask?.id ?? ''}
                onChange={(e) => setActiveFocusTaskId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-medium text-[var(--sp-ink)]"
              >
                {microtasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.completed ? '✓ ' : ''}
                    {t.title} ({t.estimatedMinutes}m)
                  </option>
                ))}
              </select>
            </div>

            {activeTask && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[var(--sp-ink-muted)]">
                  <span>Tiny Action Steps ({activeTask.substeps.length})</span>
                  <button
                    type="button"
                    onClick={handleApplyDeterministicBreakdown}
                    className="text-[var(--sp-secondary)] hover:underline font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    <span>Add 3-Step Starter</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {activeTask.substeps.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => toggleSubstep(activeTask.id, step.id)}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--sp-surface-muted)] hover:opacity-90 transition-opacity text-left"
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          step.done
                            ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                            : 'border-[var(--sp-border)] bg-[var(--sp-surface)]'
                        }`}
                      >
                        {step.done && <Check className="w-3 h-3" aria-hidden="true" />}
                      </span>
                      <span
                        className={`text-xs leading-relaxed ${
                          step.done
                            ? 'line-through text-[var(--sp-ink-muted)]'
                            : 'text-[var(--sp-ink)]'
                        }`}
                      >
                        {step.text}
                      </span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddSubstep} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    placeholder="Add next tiny step..."
                    aria-label="Add next tiny step"
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)] placeholder:text-[var(--sp-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] shrink-0"
                  >
                    Add Step
                  </button>
                </form>
              </div>
            )}
          </section>

          {!adhdPreferences.oneTaskAtATime && (
            <>
              <section
                aria-label="Brain dump scratchpad"
                className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                    Brain Dump
                  </h2>
                  <span className="text-[11px] text-[var(--sp-ink-muted)]">Saved locally</span>
                </div>
                <textarea
                  rows={4}
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="Unload half-formed ideas or reminders..."
                  aria-label="Brain dump scratchpad"
                  className="w-full p-3 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] placeholder:text-[var(--sp-ink-muted)] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)] resize-y"
                />
              </section>

              <DistractionParkingLot compact />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
