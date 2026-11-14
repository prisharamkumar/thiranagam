import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { CompanionId } from '../types';

interface VisualRewardStageProps {
  companionId?: CompanionId;
  compact?: boolean;
}

/**
 * Purely visual animated reward gauges replacing explanatory prose paragraphs.
 * Each companion shows their living reward artifact (Then's filling Honey Jar,
 * Malli's blooming Jasmine Vine, Sembu's Study Lantern, Pattu's Rest Cushion,
 * Owl's Archival Tome Stack, Otter's Spring Pebbles).
 */
export const VisualRewardStage: React.FC<VisualRewardStageProps> = ({
  companionId,
  compact = false,
}) => {
  const {
    profile,
    honeyDrops,
    microtasks,
    resources,
    totalFocusMinutesToday,
    overallRoadmapPct,
  } = useAppState();

  const activeId = companionId ?? profile.activeCompanionId;
  const completedCount = microtasks.filter((t) => t.completed).length;

  // Honey Jar fill math (5 microtasks = 1 full Golden Milestone jar)
  const jarProgressDrops = honeyDrops % 5 === 0 && honeyDrops > 0 ? 5 : honeyDrops % 5;
  const completedJars = Math.floor(honeyDrops / 5);
  const fillPct = Math.round((jarProgressDrops / 5) * 100);
  const honeyY = 70 - (fillPct / 100) * 34;

  const animateOk =
    !profile.lowStimulationMode && !profile.reducedMotion;

  return (
    <div
      className={`rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-center gap-3 ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      {/* Visual SVG Artifact */}
      <svg
        viewBox="0 0 80 80"
        className={compact ? 'w-12 h-12 shrink-0' : 'w-16 h-16 shrink-0'}
        aria-hidden="true"
      >
        {activeId === 'then' && (
          <g>
            {/* Honey Dipper & Falling Drop */}
            <line x1="40" y1="6" x2="54" y2="18" stroke="#7A4F22" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="38" cy="12" rx="6" ry="4" fill="#B57435" />
            {animateOk && (
              <path
                d="M38 17 C41 21 41 26 38 26 C35 26 35 21 38 17 Z"
                fill="#F5B234"
                className="anim-honey-drop"
              />
            )}
            {/* Glass Honey Jar */}
            <rect x="20" y="30" width="40" height="42" rx="9" fill="#FFFDF7" stroke="#7A4F22" strokeWidth="2.4" />
            <clipPath id="honeyClip">
              <rect x="22" y="32" width="36" height="38" rx="7" />
            </clipPath>
            <g clipPath="url(#honeyClip)">
              <rect x="20" y={honeyY} width="40" height={75 - honeyY} fill="#E59E29" />
              <ellipse cx="40" cy={honeyY} rx="18" ry="3.5" fill="#F8C858" />
            </g>
            {/* Wooden Lid */}
            <rect x="22" y="24" width="36" height="7" rx="3" fill="#8C592B" stroke="#4D2E14" strokeWidth="1.6" />
          </g>
        )}

        {activeId === 'malli' && (
          <g>
            <path d="M24 60 H56 L51 74 H29 Z" fill="#C47451" stroke="#5C3220" strokeWidth="2" />
            <path d="M40 60 C39 46 34 38 26 28 M40 60 C41 42 46 32 54 22" fill="none" stroke="#3B6E4A" strokeWidth="2.6" strokeLinecap="round" />
            {[
              { cx: 26, cy: 27, min: 1 },
              { cx: 40, cy: 20, min: 2 },
              { cx: 54, cy: 22, min: 3 },
              { cx: 33, cy: 38, min: 4 },
              { cx: 48, cy: 36, min: 5 },
            ].map((b, i) => {
              const bloomed = resources.blossoms >= b.min * 4 || completedCount > i;
              return (
                <g key={i} className={bloomed && animateOk ? 'anim-breathe' : ''}>
                  <circle
                    cx={b.cx}
                    cy={b.cy}
                    r={bloomed ? 6 : 3}
                    fill={bloomed ? '#FFFFFF' : '#9DC2A3'}
                    stroke="#486853"
                    strokeWidth="1.4"
                  />
                  {bloomed && <circle cx={b.cx} cy={b.cy} r="2.2" fill="#F0B542" />}
                </g>
              );
            })}
          </g>
        )}

        {activeId === 'sembu' && (
          <g>
            <circle
              cx="40"
              cy="44"
              r={Math.min(34, 16 + totalFocusMinutesToday * 0.2)}
              fill="#FBE192"
              opacity="0.35"
            />
            <path d="M28 24 H52 L47 16 H33 Z" fill="#5A3F25" />
            <rect x="26" y="24" width="28" height="36" rx="5" fill="#FFF7DC" stroke="#5A3F25" strokeWidth="2.2" />
            <path
              d="M40 31 C45 38 45 49 40 52 C35 49 35 38 40 31 Z"
              fill="#F09E2C"
              className={animateOk ? 'anim-breathe' : ''}
            />
            <rect x="23" y="60" width="34" height="7" rx="2.5" fill="#5A3F25" />
          </g>
        )}

        {activeId === 'pattu' && (
          <g>
            <path d="M52 16 A12 12 0 1 0 62 32 A9 9 0 1 1 52 16 Z" fill="#E8B95C" />
            <ellipse
              cx="40"
              cy="56"
              rx="28"
              ry="13"
              fill="#7D9F86"
              stroke="#34523E"
              strokeWidth="2.2"
              className={animateOk ? 'anim-breathe' : ''}
            />
            <circle cx="40" cy="56" r="3" fill="#FAF6EE" />
          </g>
        )}

        {activeId === 'owl' && (
          <g>
            <rect x="16" y="56" width="48" height="11" rx="2.5" fill="#6F4C38" stroke="#3B2418" strokeWidth="1.8" />
            {overallRoadmapPct >= 25 && (
              <rect x="20" y="44" width="42" height="11" rx="2.5" fill="#3B6B52" stroke="#203D2E" strokeWidth="1.8" />
            )}
            {overallRoadmapPct >= 50 && (
              <rect x="22" y="32" width="38" height="11" rx="2.5" fill="#B57941" stroke="#4D3017" strokeWidth="1.8" />
            )}
            {overallRoadmapPct >= 75 && (
              <rect x="25" y="21" width="32" height="10" rx="2.5" fill="#705DA0" stroke="#362C52" strokeWidth="1.8" />
            )}
          </g>
        )}

        {activeId === 'otter' && (
          <g>
            <ellipse cx="40" cy="58" rx="30" ry="12" fill="#8CC2C8" opacity="0.5" />
            <ellipse cx="40" cy="58" rx="20" ry="7.5" fill="#708F96" stroke="#344B50" strokeWidth="1.8" />
            <ellipse cx="40" cy="48" rx="15" ry="6" fill="#8CA8AE" stroke="#344B50" strokeWidth="1.8" />
            <ellipse cx="40" cy="39" rx="10" ry="4.5" fill="#B1C7CC" stroke="#344B50" strokeWidth="1.8" />
          </g>
        )}
      </svg>

      {/* Concise Visual Telemetry Only (Zero descriptive fluff) */}
      <div className="min-w-0">
        {activeId === 'then' && (
          <>
            <p className="text-xs font-semibold text-[var(--sp-ink)] tabular-nums">
              Honey Jar · {jarProgressDrops}/5 drops
            </p>
            <p className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] mt-0.5">
              {completedJars} jars filled · {resources.acorns} Acorns
            </p>
          </>
        )}
        {activeId === 'malli' && (
          <>
            <p className="text-xs font-semibold text-[var(--sp-ink)] tabular-nums">
              Jasmine Vine · {resources.blossoms} blooms
            </p>
            <p className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] mt-0.5">
              {completedCount} tasks bloomed
            </p>
          </>
        )}
        {activeId === 'sembu' && (
          <>
            <p className="text-xs font-semibold text-[var(--sp-ink)] tabular-nums">
              Study Lantern · {totalFocusMinutesToday}m glow
            </p>
            <p className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] mt-0.5">
              {resources.acorns} Acorns
            </p>
          </>
        )}
        {activeId === 'pattu' && (
          <>
            <p className="text-xs font-semibold text-[var(--sp-ink)] tabular-nums">
              Rest Balance · {resources.dewdrops} Dewdrops
            </p>
            <p className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] mt-0.5">
              {totalFocusMinutesToday}m today
            </p>
          </>
        )}
        {activeId === 'owl' && (
          <>
            <p className="text-xs font-semibold text-[var(--sp-ink)] tabular-nums">
              Tome Stack · {resources.tomes} Tomes
            </p>
            <p className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] mt-0.5">
              {overallRoadmapPct}% pathway
            </p>
          </>
        )}
        {activeId === 'otter' && (
          <>
            <p className="text-xs font-semibold text-[var(--sp-ink)] tabular-nums">
              Spring Stones · {resources.dewdrops} Dewdrops
            </p>
            <p className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] mt-0.5">
              {resources.blossoms} Blossoms
            </p>
          </>
        )}
      </div>
    </div>
  );
};
