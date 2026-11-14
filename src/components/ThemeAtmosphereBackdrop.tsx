import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { ThemePresetId } from '../types';

interface ThemeAtmosphereBackdropProps {
  themeOverride?: ThemePresetId;
  previewMode?: boolean;
}

/**
 * Renders subtle, artistic environmental world layers behind the application canvas
 * so Café, Rainforest, Beach, Library, and Cozy Cabin feel like distinct living spaces
 * rather than flat color swaps. Disabled cleanly in Low-Stimulation Mode.
 */
export const ThemeAtmosphereBackdrop: React.FC<ThemeAtmosphereBackdropProps> = ({
  themeOverride,
  previewMode = false,
}) => {
  const { themeSettings, profile } = useAppState();
  const activeTheme = themeOverride ?? themeSettings.preset;

  if (!previewMode && profile.lowStimulationMode) {
    return null;
  }

  const animateOk =
    !profile.lowStimulationMode &&
    !profile.reducedMotion &&
    themeSettings.animationIntensity !== 'off';

  return (
    <div
      className={`${previewMode ? 'absolute' : 'fixed'} inset-0 pointer-events-none overflow-hidden z-0`}
      aria-hidden="true"
    >
      {activeTheme === 'cafe' && (
        <>
          {/* Warm oak counter horizon & subtle ceramic cup + pastry silhouette at corner */}
          <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[var(--sp-surface-muted)]/60 to-transparent" />
          <svg
            viewBox="0 0 220 140"
            className="absolute bottom-3 right-6 w-48 h-32 opacity-20 text-[var(--sp-accent)]"
          >
            {/* Steaming latte cup */}
            <path
              d="M72 58 Q74 44 68 32 M88 55 Q92 40 86 26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={animateOk ? 'anim-steam' : ''}
            />
            <path d="M52 70 H108 C108 98 95 112 80 112 C65 112 52 98 52 70 Z" fill="currentColor" />
            <path
              d="M108 76 C120 76 122 94 105 97"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse cx="80" cy="115" rx="38" ry="6" fill="currentColor" opacity="0.65" />
            {/* Croissant + potted fern */}
            <ellipse cx="152" cy="108" rx="22" ry="11" fill="currentColor" opacity="0.7" />
            <rect x="14" y="88" width="22" height="24" rx="4" fill="currentColor" opacity="0.8" />
            <path d="M25 88 C18 70 10 64 14 54 C22 62 24 72 25 88 Z" fill="currentColor" />
            <path d="M25 88 C32 70 42 64 38 52 C29 60 27 72 25 88 Z" fill="currentColor" />
          </svg>
        </>
      )}

      {activeTheme === 'rainforest' && (
        <>
          {/* Soft botanical fern corners & drifting fireflies */}
          <svg
            viewBox="0 0 240 160"
            className="absolute bottom-0 right-0 w-64 h-44 opacity-20 text-[var(--sp-accent)]"
          >
            <path d="M240 160 C210 115 170 95 110 90 C150 118 185 138 220 160 Z" fill="currentColor" />
            <path d="M240 160 C218 100 198 62 152 38 C178 78 196 118 225 160 Z" fill="currentColor" opacity="0.75" />
            {/* Tiny forest mushrooms */}
            <path d="M52 146 C52 132 76 132 76 146 Z" fill="currentColor" />
            <rect x="61" y="146" width="6" height="12" rx="2" fill="currentColor" />
            <path d="M84 150 C84 140 100 140 100 150 Z" fill="currentColor" opacity="0.8" />
            <rect x="90" y="150" width="4" height="8" rx="2" fill="currentColor" opacity="0.8" />
          </svg>
          {animateOk && (
            <>
              <span className="absolute bottom-24 right-28 w-2 h-2 rounded-full bg-[var(--sp-warm)]/45 anim-float-slow" />
              <span
                className="absolute bottom-40 right-52 w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)]/40 anim-float-slow"
                style={{ animationDelay: '1.3s' }}
              />
            </>
          )}
        </>
      )}

      {activeTheme === 'beach' && (
        <>
          {/* Calm coastal wave contour + drifting sailboat & seashells */}
          <svg
            viewBox="0 0 600 110"
            preserveAspectRatio="none"
            className="absolute bottom-0 inset-x-0 w-full h-24 opacity-20 text-[var(--sp-accent)]"
          >
            <path
              d="M0 78 Q75 56 150 76 T300 74 T450 78 T600 72 L600 110 L0 110 Z"
              fill="currentColor"
            />
            <path
              d="M0 92 Q90 74 180 90 T360 88 T540 92 L600 90 L600 110 L0 110 Z"
              fill="var(--sp-warm)"
              opacity="0.55"
            />
          </svg>
          <svg
            viewBox="0 0 120 90"
            className={`absolute bottom-10 right-10 w-24 h-20 opacity-25 text-[var(--sp-accent)] ${
              animateOk ? 'anim-float-slow' : ''
            }`}
          >
            <path d="M28 62 L84 62 L74 75 L38 75 Z" fill="currentColor" />
            <path d="M55 18 L55 58 L80 58 Z" fill="currentColor" opacity="0.85" />
            <path d="M52 24 L52 58 L32 58 Z" fill="var(--sp-warm)" opacity="0.8" />
          </svg>
        </>
      )}

      {activeTheme === 'library' && (
        <>
          {/* Warm brass reading lamp glow + stacked antique volumes silhouette */}
          <div className="absolute -top-12 right-12 w-72 h-72 rounded-full bg-[var(--sp-warm)]/10 blur-2xl" />
          <svg
            viewBox="0 0 220 140"
            className="absolute bottom-3 right-8 w-48 h-32 opacity-20 text-[var(--sp-accent)]"
          >
            {/* Stacked books */}
            <rect x="44" y="102" width="76" height="14" rx="3" fill="currentColor" />
            <rect x="52" y="88" width="62" height="13" rx="3" fill="var(--sp-secondary)" />
            <rect x="58" y="76" width="52" height="11" rx="3" fill="currentColor" opacity="0.8" />
            {/* Desk reading lamp */}
            <path d="M150 116 L186 116" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M168 116 L168 58 Q168 44 152 44 L144 44" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M126 52 L160 52 L151 36 L135 36 Z" fill="var(--sp-warm)" />
          </svg>
        </>
      )}

      {activeTheme === 'cabin' && (
        <>
          {/* Fireplace warm amber glow + woodland pines & cabin lantern */}
          <div className="absolute bottom-0 right-0 w-80 h-60 rounded-full bg-[var(--sp-warm)]/12 blur-2xl" />
          <svg
            viewBox="0 0 220 140"
            className="absolute bottom-2 right-6 w-52 h-32 opacity-20 text-[var(--sp-secondary)]"
          >
            <path d="M40 128 L58 64 L76 128 Z" fill="currentColor" />
            <path d="M74 128 L96 48 L118 128 Z" fill="currentColor" opacity="0.8" />
            {/* Warm hearth arch */}
            <path d="M138 128 L138 82 C138 64 190 64 190 82 L190 128 Z" fill="var(--sp-accent)" />
            <path
              d="M156 128 C156 108 172 108 172 128 Z"
              fill="var(--sp-warm)"
              className={animateOk ? 'anim-breathe' : ''}
            />
          </svg>
        </>
      )}
    </div>
  );
};
