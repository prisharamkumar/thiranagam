import React, { useState } from 'react';
import {
  ChevronDown,
  Compass,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { COMPANIONS, IMMERSIVE_THEMES } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { CompanionId } from '../types';
import { CompanionPortraitBadge } from './CompanionPortraitBadge';
import { MiniatureCompanionRoom } from './MiniatureCompanionRoom';

const MOOD_LABEL_MAP = {
  idle: 'Relaxed',
  focus: 'Focusing',
  break: 'Break Time',
  waking: 'Waking Up',
  celebrate: 'Celebrating',
};

const formatCountdown = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Dedicated narrow left-side Companion Zone (on lg+/desktop) & compact non-overlapping
 * bottom shelf (on mobile/tablet) holding the context-aware Companion Quick Space directly
 * above/beside the permanently visible miniature companion room.
 */
export const CompanionDock: React.FC = () => {
  const {
    profile,
    themeSettings,
    companionMood,
    companionDockMinimized,
    setCompanionDockMinimized,
    getCompanionDisplayName,
    setCompanion,
    triggerCompanionCelebrate,
    timerRunning,
    timerHasStarted,
    timerMode,
    timerSecondsLeft,
    isTwoMinuteWarmup,
    startOrResumeTimer,
    pauseTimer,
    energy,
    microtasks,
    activeFocusTaskId,
    totalFocusMinutesToday,
    setRestartModalOpen,
    setActivePage,
    openThemeStudio,
  } = useAppState();

  const [switcherOpen, setSwitcherOpen] = useState(false);

  const companion =
    COMPANIONS.find((c) => c.id === profile.activeCompanionId) ?? COMPANIONS[0];
  const displayName = getCompanionDisplayName(companion.id);
  const themeMeta =
    IMMERSIVE_THEMES.find((t) => t.id === themeSettings.preset) ?? IMMERSIVE_THEMES[0];

  const liveMoodText =
    companion.id === 'pattu' && companionMood === 'focus'
      ? 'Sleeping · Focus'
      : companion.id === 'pattu' && (companionMood === 'break' || companionMood === 'waking')
        ? 'Break Stretch'
        : MOOD_LABEL_MAP[companionMood];

  const activeTask =
    microtasks.find((t) => t.id === activeFocusTaskId) ??
    microtasks.find((t) => !t.completed) ??
    microtasks[0];

  const isBreakMode = timerMode === 'shortBreak' || timerMode === 'longBreak';
  const sessionStatusLabel = timerRunning
    ? isTwoMinuteWarmup
      ? '2m Warm-Up'
      : timerMode === 'focus'
        ? 'Focusing'
        : timerMode === 'shortBreak'
          ? 'Short Break'
          : 'Long Break'
    : timerHasStarted
      ? isBreakMode
        ? 'Break Paused'
        : 'Focus Paused'
      : energy === 'low'
        ? 'Low-Energy Pace'
        : totalFocusMinutesToday > 0
          ? `${totalFocusMinutesToday}m Today`
          : 'Ready to Start';

  const quickAction = timerRunning
    ? {
        label: isBreakMode ? 'Pause Break' : 'Pause Focus',
        icon: Pause,
        onClick: pauseTimer,
      }
    : timerHasStarted
      ? {
          label: isBreakMode ? 'Resume Break' : 'Resume Focus',
          icon: Play,
          onClick: startOrResumeTimer,
        }
      : energy === 'low' || totalFocusMinutesToday === 0
        ? {
            label: 'Help Me Restart',
            icon: Compass,
            onClick: () => setRestartModalOpen(true),
          }
        : {
            label: 'Resume Focus',
            icon: Play,
            onClick: startOrResumeTimer,
          };

  const QuickActionIcon = quickAction.icon;

  if (companionDockMinimized) {
    return (
      <>
        {/* Mobile/tablet minimized bottom strip releasing full room height */}
        <aside
          aria-label="Minimized companion bar"
          className="order-2 lg:hidden shrink-0 px-3 py-2 bg-[var(--sp-surface)]/95 backdrop-blur-sm border-t border-[var(--sp-border)] flex items-center justify-between gap-2 z-30"
        >
          <button
            type="button"
            onClick={() => setCompanionDockMinimized(false)}
            aria-label={`Expand ${displayName}'s ${themeMeta.name} room`}
            className="flex items-center gap-2 min-w-0 text-left"
          >
            <CompanionPortraitBadge companionId={companion.id} size={30} />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[var(--sp-ink)] block truncate leading-tight">
                {displayName} · {liveMoodText}
              </span>
              <span className="text-[10px] text-[var(--sp-ink-muted)] block truncate leading-tight tabular-nums">
                {timerRunning || timerHasStarted
                  ? `${sessionStatusLabel} · ${formatCountdown(timerSecondsLeft)}`
                  : sessionStatusLabel}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={quickAction.onClick}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-[11px] font-semibold flex items-center gap-1"
            >
              <QuickActionIcon className="w-3 h-3" aria-hidden="true" />
              <span>{quickAction.label}</span>
            </button>
            <button
              type="button"
              onClick={() => setCompanionDockMinimized(false)}
              aria-label={`Expand ${displayName}'s companion room`}
              className="p-1.5 rounded-lg border border-[var(--sp-border)] text-[var(--sp-accent)] hover:bg-[var(--sp-surface-muted)]"
            >
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* Desktop/laptop minimized pill releasing full left column width */}
        <div className="hidden lg:block fixed bottom-3 left-4 z-30">
          <button
            type="button"
            onClick={() => setCompanionDockMinimized(false)}
            aria-label={`Expand ${displayName}'s ${themeMeta.name} room`}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-lg hover:border-[var(--sp-accent)] transition-colors"
          >
            <CompanionPortraitBadge companionId={companion.id} size={32} />
            <div className="text-left">
              <span className="text-xs font-semibold text-[var(--sp-ink)] block leading-tight">
                {displayName}
                {(timerRunning || timerHasStarted) && (
                  <span className="ml-1.5 font-mono text-[11px] text-[var(--sp-accent)] tabular-nums">
                    {formatCountdown(timerSecondsLeft)}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-[var(--sp-ink-muted)] block leading-tight">
                {liveMoodText}
              </span>
            </div>
            <Maximize2 className="w-3.5 h-3.5 text-[var(--sp-accent)] ml-1" aria-hidden="true" />
          </button>
        </div>
      </>
    );
  }

  return (
    <aside
      aria-label="Dedicated companion zone"
      className="order-2 lg:order-1 shrink-0 w-full lg:w-[192px] xl:w-[224px] relative z-30 border-t border-[var(--sp-border)] bg-[var(--sp-surface)]/92 backdrop-blur-sm lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none"
    >
      {/* Quick Companion Picker Popover */}
      {switcherOpen && (
        <div className="absolute bottom-full left-2.5 lg:left-2.5 xl:left-3 mb-2 w-[224px] lg:w-[206px] xl:w-[220px] rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-xl p-2.5 space-y-1.5 z-40">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--sp-border)]">
            <span className="text-[11px] font-semibold text-[var(--sp-ink)]">
              Invite Companion
            </span>
            <button
              type="button"
              onClick={() => setSwitcherOpen(false)}
              className="text-[10px] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {COMPANIONS.map((c) => {
              const selected = c.id === companion.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCompanion(c.id as CompanionId);
                    setSwitcherOpen(false);
                  }}
                  className={`p-1.5 rounded-xl border text-left flex items-center gap-1.5 transition-colors ${
                    selected
                      ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                      : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-surface-muted)]'
                  }`}
                >
                  <CompanionPortraitBadge companionId={c.id} size={22} />
                  <span className="text-[11px] font-medium text-[var(--sp-ink)] truncate">
                    {getCompanionDisplayName(c.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom-Left Zone Stack on lg+; Compact Side-by-Side Row on Mobile */}
      <div className="px-2.5 py-2 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-end lg:px-2.5 xl:px-3 lg:pb-4 lg:pt-2">
        <div className="flex items-stretch gap-2.5 lg:flex-col lg:gap-2">
          {/* COMPANION QUICK SPACE: Sits directly above the room on lg+, beside it on mobile */}
          <section
            aria-label="Companion Quick Space"
            className="order-2 lg:order-1 flex-1 min-w-0 lg:flex-none lg:w-[172px] xl:w-[200px] rounded-xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-sm p-2.5 flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    timerRunning && timerMode === 'focus'
                      ? 'bg-[var(--sp-accent)]'
                      : companionMood === 'celebrate'
                        ? 'bg-[var(--sp-warm)]'
                        : 'bg-[var(--sp-secondary)]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[11px] font-semibold text-[var(--sp-ink)] truncate">
                  {sessionStatusLabel}
                </span>
              </div>

              {(timerRunning || timerHasStarted) && (
                <button
                  type="button"
                  onClick={() => setActivePage('focus')}
                  title="Open Focus Studio"
                  className="font-mono text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md bg-[var(--sp-accent-soft)] text-[var(--sp-accent)] hover:opacity-90 shrink-0"
                >
                  {formatCountdown(timerSecondsLeft)}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActivePage('focus')}
              className="text-left group"
              title={activeTask ? `Open "${activeTask.title}" in Focus Studio` : 'Open Focus Studio'}
            >
              <span className="text-[10px] font-medium text-[var(--sp-ink-muted)] block truncate">
                {displayName} · {liveMoodText}
              </span>
              <span className="text-[11px] text-[var(--sp-ink)] font-medium block truncate group-hover:text-[var(--sp-accent)] transition-colors">
                {activeTask ? activeTask.title : 'Open Focus Studio'}
              </span>
            </button>

            <button
              type="button"
              onClick={quickAction.onClick}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-[11px] font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <QuickActionIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{quickAction.label}</span>
            </button>
          </section>

          {/* COMPACT MINIATURE COMPANION ROOM: Anchored bottom-left */}
          <div className="order-1 lg:order-2 w-[144px] lg:w-[172px] xl:w-[200px] shrink-0 rounded-xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-lg overflow-hidden">
            {/* Compact Room Header Strip */}
            <div className="px-2 py-1 bg-[var(--sp-surface)] border-b border-[var(--sp-border)] flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold text-[var(--sp-ink)] truncate">
                {displayName}
              </span>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSwitcherOpen((v) => !v)}
                  title="Switch companion"
                  aria-label="Switch companion"
                  className="p-0.5 rounded text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]"
                >
                  <Repeat className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSwitcherOpen(false);
                    setCompanionDockMinimized(true);
                  }}
                  title="Minimize companion room"
                  aria-label="Minimize companion room"
                  className="p-0.5 rounded text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Miniature Theme-Responsive Habitat Scene */}
            <MiniatureCompanionRoom
              companionId={companion.id}
              mood={companionMood}
              size="dock"
              onPat={triggerCompanionCelebrate}
            />

            {/* Compact Room Footer Strip */}
            <div className="px-2 py-1 bg-[var(--sp-surface-muted)] border-t border-[var(--sp-border)] flex items-center justify-between gap-1 text-[10px]">
              <span className="font-medium text-[var(--sp-ink)] truncate">{liveMoodText}</span>
              <button
                type="button"
                onClick={openThemeStudio}
                className="text-[var(--sp-accent)] font-semibold hover:underline flex items-center gap-0.5 shrink-0"
                title="Change world theme in Theme Studio"
              >
                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                <span className="truncate max-w-[66px]">{themeMeta.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
