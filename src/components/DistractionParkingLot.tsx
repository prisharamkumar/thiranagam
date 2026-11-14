import React, { useState } from 'react';
import { Check, Inbox, Plus, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

interface DistractionParkingLotProps {
  compact?: boolean;
}

export const DistractionParkingLot: React.FC<DistractionParkingLotProps> = ({ compact = false }) => {
  const { distractions, addDistraction, toggleDistractionResolved, clearResolvedDistractions } =
    useAppState();
  const [draft, setDraft] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addDistraction(draft);
    setDraft('');
  };

  const resolvedCount = distractions.filter((d) => d.resolved).length;

  return (
    <section
      aria-label="Distraction Parking Lot"
      className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[var(--sp-secondary)]" aria-hidden="true" />
            <span>Distraction Parking Lot</span>
          </h3>
          <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
            Drop stray thoughts or errands here so your working memory can let go until your break.
          </p>
        </div>
        {resolvedCount > 0 && (
          <button
            type="button"
            onClick={clearResolvedDistractions}
            className="text-xs font-medium text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] flex items-center gap-1 whitespace-nowrap shrink-0 px-2 py-1 rounded-lg hover:bg-[var(--sp-surface-muted)] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear resolved ({resolvedCount})</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Park a stray thought for later..."
          aria-label="Park a stray thought for later"
          className="flex-1 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] placeholder:text-[var(--sp-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-secondary)]"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl text-sm font-medium bg-[var(--sp-secondary)] text-white hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Park</span>
        </button>
      </form>

      <div className={`space-y-2 ${compact ? 'max-h-44 overflow-y-auto pr-1' : ''}`}>
        {distractions.length === 0 ? (
          <p className="text-xs text-[var(--sp-ink-muted)] py-3 text-center bg-[var(--sp-surface-muted)] rounded-xl">
            Parking lot is clear. Anything that pops up mid-session can rest safely here.
          </p>
        ) : (
          distractions.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]"
            >
              <button
                type="button"
                onClick={() => toggleDistractionResolved(item.id)}
                className="flex items-start gap-2.5 text-left min-w-0 flex-1"
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    item.resolved
                      ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                      : 'border-[var(--sp-border)] bg-[var(--sp-surface)]'
                  }`}
                >
                  {item.resolved && <Check className="w-3 h-3" aria-hidden="true" />}
                </span>
                <span
                  className={`text-sm leading-snug ${
                    item.resolved ? 'line-through text-[var(--sp-ink-muted)]' : 'text-[var(--sp-ink)]'
                  }`}
                >
                  {item.text}
                </span>
              </button>
              <span className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] shrink-0 pt-0.5">
                {item.createdAt}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
