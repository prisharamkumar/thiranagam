import React from 'react';
import { X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

/**
 * Floating visual celebration toast showing an animated SVG reward (honey drop,
 * jasmine bloom, lantern glow, or unlocked keepsake) rather than text-only alerts.
 */
export const RewardToastBurst: React.FC = () => {
  const { recentRewardBurst, dismissRewardBurst } = useAppState();
  if (!recentRewardBurst) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-3 sm:top-auto sm:bottom-6 sm:right-6 z-50 anim-pop-in max-w-[calc(100vw-24px)] sm:max-w-xs rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-accent)] shadow-lg px-4 py-3 flex items-center gap-3"
    >
      <div className="w-11 h-11 rounded-xl bg-[var(--sp-accent-soft)] flex items-center justify-center shrink-0">
        {recentRewardBurst.type === 'honey' && (
          <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden="true">
            <rect x="11" y="14" width="18" height="20" rx="4" fill="#F9E5A7" stroke="#7A4F22" strokeWidth="1.8" />
            <rect x="10" y="10" width="20" height="5" rx="2" fill="#8C592B" />
            <rect x="13" y="21" width="14" height="11" rx="2" fill="#E59E29" />
            <path d="M20 3 C23 7 23 11 20 11 C17 11 17 7 20 3 Z" fill="#F5B234" className="anim-honey-drop" />
          </svg>
        )}
        {recentRewardBurst.type === 'blossom' && (
          <svg viewBox="0 0 40 40" className="w-9 h-9 anim-breathe" aria-hidden="true">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="20"
                cy="11"
                rx="4.2"
                ry="7"
                transform={`rotate(${deg} 20 20)`}
                fill="#FCECF1"
                stroke="#854B60"
                strokeWidth="1.2"
              />
            ))}
            <circle cx="20" cy="20" r="4" fill="#F0B542" />
          </svg>
        )}
        {(recentRewardBurst.type === 'lantern' || recentRewardBurst.type === 'unlock') && (
          <svg viewBox="0 0 40 40" className="w-9 h-9 anim-breathe" aria-hidden="true">
            <rect x="12" y="11" width="16" height="20" rx="3" fill="#FCE29C" stroke="#5A3F25" strokeWidth="1.8" />
            <ellipse cx="20" cy="21" rx="4.5" ry="6.5" fill="#F5A623" />
          </svg>
        )}
        {recentRewardBurst.type === 'acorn' && (
          <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden="true">
            <ellipse cx="20" cy="24" rx="8" ry="10" fill="#B57B48" stroke="#533318" strokeWidth="1.6" />
            <path d="M10 18 C10 11 30 11 30 18 Z" fill="#684122" stroke="#3D2411" strokeWidth="1.6" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--sp-ink)] truncate">
          {recentRewardBurst.label}
        </p>
        {recentRewardBurst.amountText && (
          <p className="text-[11px] font-mono tabular-nums text-[var(--sp-accent)] font-medium mt-0.5">
            {recentRewardBurst.amountText}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={dismissRewardBurst}
        className="p-1 rounded-lg text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)]"
        aria-label="Dismiss reward animation"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
