import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Compass, Play, X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const HelpMeRestartModal: React.FC = () => {
  const {
    restartModalOpen,
    setRestartModalOpen,
    lastInterruptedContext,
    updateInterruptedContext,
    microtasks,
    openTaskInFocusStudio,
    startTwoMinuteWarmup,
  } = useAppState();

  const [noteDraft, setNoteDraft] = useState(lastInterruptedContext.stoppedNote);

  if (!restartModalOpen) return null;

  const lastTask =
    microtasks.find((t) => t.id === lastInterruptedContext.lastActiveTaskId) ??
    microtasks.find((t) => !t.completed) ??
    microtasks[0];

  const nextSubstep = lastTask?.substeps.find((s) => !s.done);
  const suggestedFirstAction = nextSubstep
    ? nextSubstep.text
    : `Open "${lastTask?.title ?? 'your current task'}" and work on just the opening 2 minutes.`;

  const handleSaveAndResume = (twoMinute: boolean) => {
    updateInterruptedContext({ stoppedNote: noteDraft });
    setRestartModalOpen(false);
    if (twoMinute) {
      startTwoMinuteWarmup(lastTask?.id);
    } else if (lastTask) {
      openTaskInFocusStudio(lastTask.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restart-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--sp-border)]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--sp-accent)]" aria-hidden="true" />
            <div>
              <h2 id="restart-modal-title" className="font-display text-xl font-semibold text-[var(--sp-ink)]">
                Help Me Restart
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)]">
                Pick up softly without reconstructing everything from scratch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRestartModalOpen(false)}
            className="p-2 rounded-lg text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)]"
            aria-label="Close focus recovery dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Last Completed */}
          <div className="p-3.5 rounded-xl bg-[var(--sp-accent-soft)] border border-[var(--sp-border)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--sp-accent)] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-[11px] font-semibold text-[var(--sp-ink-muted)] block">
                Last completed win ({lastInterruptedContext.updatedAt})
              </span>
              <span className="text-xs font-medium text-[var(--sp-ink)]">
                {lastInterruptedContext.lastCompletedMicrotaskTitle}
              </span>
            </div>
          </div>

          {/* Active Task */}
          {lastTask && (
            <div className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              <span className="text-[11px] font-semibold text-[var(--sp-ink-muted)] block">
                Where you were
              </span>
              <span className="text-sm font-semibold text-[var(--sp-ink)] block mt-0.5">
                {lastTask.title}
              </span>
              <span className="text-xs text-[var(--sp-ink-muted)] block mt-1">
                {lastTask.moduleTitle} · {lastTask.estimatedMinutes} min
              </span>
            </div>
          )}

          {/* Stopping note */}
          <div>
            <label htmlFor="stopped-note-input" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
              Bookmark note for yourself
            </label>
            <input
              id="stopped-note-input"
              type="text"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
            />
          </div>

          {/* One Tiny Next Step */}
          <div className="p-4 rounded-xl bg-[var(--sp-secondary-soft)] border border-[var(--sp-border)]">
            <span className="text-xs font-semibold text-[var(--sp-secondary)] block">
              One Small Next Action
            </span>
            <p className="text-sm font-medium text-[var(--sp-ink)] mt-1">
              {suggestedFirstAction}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => handleSaveAndResume(false)}
              className="px-4 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-surface)] text-xs font-semibold text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] flex items-center gap-1.5"
            >
              <span>Open in Focus Studio</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndResume(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Just Start (2-Min Warm-Up)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
