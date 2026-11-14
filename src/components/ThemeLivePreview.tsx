import React from 'react';
import { IMMERSIVE_THEMES } from '../data/demoData';
import { ColorMode, HeadingStyle, ThemePresetId } from '../types';
import { ThemeAtmosphereBackdrop } from './ThemeAtmosphereBackdrop';

interface ThemeLivePreviewProps {
  previewPreset: ThemePresetId;
  previewMode: ColorMode;
  resolvedSystemDark: boolean;
  fontPreset: 'sans' | 'serif' | 'dyslexia';
  headingStyle: HeadingStyle;
  onApply: () => void;
  isCurrentlyApplied: boolean;
}

const PREVIEW_PALETTE: Record<
  ThemePresetId,
  {
    light: { canvas: string; surface: string; ink: string; accent: string; accentInk: string; border: string };
    dark: { canvas: string; surface: string; ink: string; accent: string; accentInk: string; border: string };
  }
> = {
  cafe: {
    light: { canvas: '#FAF3E8', surface: '#FFFDF9', ink: '#2A1C13', accent: '#7A4828', accentInk: '#FFFAF2', border: 'rgba(114,68,36,0.18)' },
    dark: { canvas: '#18120E', surface: '#231A14', ink: '#F7EDE1', accent: '#D49A60', accentInk: '#1A110B', border: 'rgba(233,198,160,0.18)' },
  },
  rainforest: {
    light: { canvas: '#F2F6EF', surface: '#FBFDFB', ink: '#182B20', accent: '#26533B', accentInk: '#F6FBF7', border: 'rgba(36,82,59,0.18)' },
    dark: { canvas: '#101913', surface: '#17241C', ink: '#EDF4EE', accent: '#7AB38B', accentInk: '#0F1912', border: 'rgba(164,206,174,0.18)' },
  },
  beach: {
    light: { canvas: '#F2F8F8', surface: '#FFFFFF', ink: '#142C31', accent: '#1D6472', accentInk: '#F4FBFC', border: 'rgba(29,100,114,0.18)' },
    dark: { canvas: '#0E1A1E', surface: '#15252A', ink: '#ECF5F6', accent: '#6EBCC8', accentInk: '#0C181B', border: 'rgba(160,214,222,0.18)' },
  },
  library: {
    light: { canvas: '#F5EEE3', surface: '#FCFAF5', ink: '#251B14', accent: '#4B3222', accentInk: '#FCF9F2', border: 'rgba(75,50,34,0.18)' },
    dark: { canvas: '#16120F', surface: '#201A16', ink: '#F4EBDD', accent: '#CDA06A', accentInk: '#19130E', border: 'rgba(219,193,159,0.18)' },
  },
  cabin: {
    light: { canvas: '#F7EFE6', surface: '#FFFCF8', ink: '#291B16', accent: '#843F26', accentInk: '#FFF8F3', border: 'rgba(132,63,38,0.18)' },
    dark: { canvas: '#181210', surface: '#231A17', ink: '#F6EBE5', accent: '#DF8B6B', accentInk: '#1E120E', border: 'rgba(233,193,170,0.18)' },
  },
};

export const ThemeLivePreview: React.FC<ThemeLivePreviewProps> = ({
  previewPreset,
  previewMode,
  resolvedSystemDark,
  fontPreset,
  headingStyle,
  onApply,
  isCurrentlyApplied,
}) => {
  const effectiveDark =
    previewMode === 'dark' || (previewMode === 'system' && resolvedSystemDark);
  const pal = PREVIEW_PALETTE[previewPreset][effectiveDark ? 'dark' : 'light'];
  const meta = IMMERSIVE_THEMES.find((t) => t.id === previewPreset) ?? IMMERSIVE_THEMES[0];

  const bodyFont =
    fontPreset === 'serif'
      ? '"Lora", Georgia, serif'
      : fontPreset === 'dyslexia'
        ? '"Lexend", system-ui, sans-serif'
        : '"Plus Jakarta Sans", system-ui, sans-serif';
  const displayFont =
    headingStyle === 'clean'
      ? '"Plus Jakarta Sans", system-ui, sans-serif'
      : headingStyle === 'classic'
        ? '"Lora", Georgia, serif'
        : '"Fraunces", Georgia, serif';

  return (
    <div
      style={{
        backgroundColor: pal.canvas,
        color: pal.ink,
        borderColor: pal.border,
        fontFamily: bodyFont,
      }}
      className="relative rounded-2xl border p-5 overflow-hidden transition-colors"
    >
      <ThemeAtmosphereBackdrop themeOverride={previewPreset} previewMode />

      <div className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] opacity-75 block">
              Live World Preview · {meta.navStyleLabel}
            </span>
            <h3 style={{ fontFamily: displayFont }} className="text-xl font-semibold">
              {meta.name} Environment
            </h3>
          </div>

          <button
            type="button"
            onClick={onApply}
            style={{
              backgroundColor: pal.accent,
              color: pal.accentInk,
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 shrink-0"
          >
            {isCurrentlyApplied ? 'Active on Workspace' : `Apply ${meta.name} Theme`}
          </button>
        </div>

        {/* Miniature Top Navigation Mockup showing Theme-Specific Control Geometry */}
        <div
          style={{ backgroundColor: pal.surface, borderColor: pal.border }}
          className="rounded-xl border px-3 py-2 flex flex-wrap items-center gap-1.5"
        >
          {['Home', 'Timer', 'To-do List', 'My Habitat', 'Sanctum'].map((item, idx) => {
            const active = idx === 0;
            const shapeClass =
              previewPreset === 'library'
                ? 'rounded-t-md rounded-b-xs border-b-2'
                : previewPreset === 'rainforest'
                  ? 'rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs'
                  : previewPreset === 'beach'
                    ? 'rounded-full'
                    : previewPreset === 'cabin'
                      ? 'rounded-md underline underline-offset-4'
                      : 'rounded-lg';
            return (
              <span
                key={item}
                style={
                  active
                    ? { backgroundColor: pal.accent, color: pal.accentInk, borderColor: pal.accent }
                    : { opacity: 0.72 }
                }
                className={`px-2.5 py-1 text-[11px] font-medium ${shapeClass}`}
              >
                {item}
              </span>
            );
          })}
        </div>

        <p className="text-xs opacity-80 leading-relaxed">{meta.tagline}</p>
      </div>
    </div>
  );
};
