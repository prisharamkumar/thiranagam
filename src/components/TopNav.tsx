import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Check,
  CheckSquare,
  ChevronDown,
  Compass,
  EyeOff,
  Gamepad2,
  Home,
  LifeBuoy,
  Map,
  Menu,
  Moon,
  Palette,
  Pause,
  Play,
  Settings,
  Sparkles,
  Sun,
  Timer,
  Trees,
  X,
} from 'lucide-react';
import { IMMERSIVE_THEMES } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { PageId, ThemePresetId } from '../types';
import { StudentAvatar } from './StudentAvatar';
import { ThemeSceneThumbnail } from './ThemeSceneThumbnail';

interface TopNavProps {
  onOpenProfile: () => void;
}

const NAV_ITEMS: {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'today', label: 'Home', icon: Home },
  { id: 'focus', label: 'Timer', icon: Timer },
  { id: 'todos', label: 'To-do List', icon: CheckSquare },
  { id: 'roadmap', label: 'My Roadmap', icon: Map },
  { id: 'arcade', label: 'Learning Arcade', icon: Gamepad2 },
  { id: 'habitat', label: 'My Habitat', icon: Trees },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'sanctum', label: 'Sanctum', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const getThemeNavButtonClass = (theme: ThemePresetId, isActive: boolean): string => {
  switch (theme) {
    case 'library':
      return isActive
        ? 'rounded-t-md rounded-b-xs border-b-2 border-[var(--sp-warm)] bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] shadow-xs'
        : 'rounded-t-md rounded-b-xs border border-transparent hover:border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]';
    case 'cafe':
      return isActive
        ? 'rounded-lg border border-[var(--sp-accent)] bg-[var(--sp-accent-soft)] text-[var(--sp-ink)] font-semibold shadow-xs'
        : 'rounded-lg border border-transparent hover:border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]';
    case 'rainforest':
      return isActive
        ? 'rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
        : 'rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-accent-soft)]/70';
    case 'beach':
      return isActive
        ? 'rounded-full bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
        : 'rounded-full text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-accent-soft)]';
    case 'cabin':
      return isActive
        ? 'rounded-md border border-[var(--sp-accent)] bg-[var(--sp-surface-muted)] text-[var(--sp-ink)] font-semibold underline decoration-[var(--sp-accent)] decoration-2 underline-offset-4'
        : 'rounded-md text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]';
  }
};

export const TopNav: React.FC<TopNavProps> = ({ onOpenProfile }) => {
  const {
    activePage,
    setActivePage,
    openThemeStudio,
    themeSettings,
    updateThemeSettings,
    resolvedColorMode,
    profile,
    soundPlaying,
    toggleSoundPlaying,
    toggleLowStimulation,
    setRestartModalOpen,
  } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const activeThemeMeta =
    IMMERSIVE_THEMES.find((t) => t.id === themeSettings.preset) ?? IMMERSIVE_THEMES[0];

  useEffect(() => {
    if (!themePopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setThemePopoverOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setThemePopoverOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [themePopoverOpen]);

  const handleNav = (id: PageId) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    setThemePopoverOpen(false);
  };

  const renderThemeMark = () => {
    if (themeSettings.preset === 'library') {
      return (
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true">
          <rect x="4" y="3" width="12" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 3 V10 L11 8.5 L13 10 V3" fill="currentColor" />
        </svg>
      );
    }
    if (themeSettings.preset === 'cafe') {
      return (
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true">
          <path d="M5 8 H14 V13 C14 15.5 12 17 9.5 17 C7 17 5 15.5 5 13 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 9.5 C16.5 9.5 16.5 13 14 13.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
    if (themeSettings.preset === 'rainforest') {
      return (
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true">
          <path d="M4 16 C5 8 11 4 16 4 C16 10 12 15 4 16 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    }
    if (themeSettings.preset === 'beach') {
      return (
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true">
          <path d="M3 13 Q7 9 11 13 T18 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true">
        <path d="M4 10 L10 4 L16 10 V16 H4 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--sp-surface)]/95 backdrop-blur-sm border-b border-[var(--sp-border)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
          {/* Left: Mobile drawer trigger + Thiranagam Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleNav('today')}
              className="flex items-center gap-2 text-left rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sp-accent)]"
            >
              <span className="w-8 h-8 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-[var(--sp-ink)] whitespace-nowrap">
                Thiranagam
              </span>
            </button>
          </div>

          {/* Center: Horizontal 9-Item Theme-Aware Navigation */}
          <nav
            aria-label="Primary sections"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 overflow-x-auto py-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-2 xl:px-2.5 py-1.5 text-[11px] xl:text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sp-accent)] ${getThemeNavButtonClass(
                    themeSettings.preset,
                    isActive
                  )}`}
                >
                  {isActive ? renderThemeMark() : <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Accessible Click Theme Switcher + Sensory & Profile Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Theme Switcher (Click-Activated, Always Accessible) */}
            <div className="relative" ref={popoverRef}>
              <button
                type="button"
                onClick={() => setThemePopoverOpen((v) => !v)}
                aria-expanded={themePopoverOpen}
                aria-haspopup="dialog"
                aria-label="Switch world theme"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  themePopoverOpen
                    ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
                    : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[var(--sp-accent)] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{activeThemeMeta.name}</span>
                <span className="sm:hidden">Theme</span>
                <ChevronDown className="w-3 h-3 opacity-75 shrink-0" aria-hidden="true" />
              </button>

              {themePopoverOpen && (
                <div
                  role="dialog"
                  aria-label="Theme switcher"
                  className="absolute right-0 mt-2 w-[312px] sm:w-[360px] rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-2xl p-4 space-y-3 z-50"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--sp-border)]">
                    <div>
                      <span className="text-xs font-semibold text-[var(--sp-ink)] block">
                        World Theme Switcher
                      </span>
                      <span className="text-[11px] text-[var(--sp-ink-muted)]">
                        Click any world to apply immediately
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateThemeSettings({
                          colorMode: resolvedColorMode === 'dark' ? 'light' : 'dark',
                        })
                      }
                      aria-label="Toggle light or dark mode"
                      className="px-2.5 py-1 rounded-lg border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-[11px] font-medium text-[var(--sp-ink)] flex items-center gap-1 hover:bg-[var(--sp-surface-muted)]"
                    >
                      {resolvedColorMode === 'dark' ? (
                        <>
                          <Sun className="w-3 h-3 text-[var(--sp-warm)]" aria-hidden="true" />
                          <span>Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3 h-3 text-[var(--sp-accent)]" aria-hidden="true" />
                          <span>Dark</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {IMMERSIVE_THEMES.map((t) => {
                      const active = themeSettings.preset === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            updateThemeSettings({ preset: t.id });
                          }}
                          aria-pressed={active}
                          className={`p-2 rounded-xl border text-left transition-colors ${
                            active
                              ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                              : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-surface-muted)]'
                          }`}
                        >
                          <ThemeSceneThumbnail themeId={t.id} />
                          <div className="mt-1.5 flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-[var(--sp-ink)] truncate">
                              {t.name}
                            </span>
                            {active && (
                              <Check
                                className="w-3.5 h-3.5 text-[var(--sp-accent)] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[var(--sp-border)] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[var(--sp-ink-muted)]">
                      Active: <strong className="text-[var(--sp-ink)]">{activeThemeMeta.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setThemePopoverOpen(false);
                        openThemeStudio();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-[11px] font-semibold hover:opacity-95"
                    >
                      Open Theme Studio
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setRestartModalOpen(true)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)] hover:opacity-90 whitespace-nowrap"
              title="Help Me Restart"
            >
              <LifeBuoy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden xl:inline">Restart</span>
            </button>

            <button
              type="button"
              onClick={toggleSoundPlaying}
              aria-label={soundPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
              title={soundPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
              className={`p-2 rounded-lg border transition-colors ${
                soundPlaying
                  ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] border-[var(--sp-accent)]'
                  : 'bg-[var(--sp-canvas)] text-[var(--sp-ink-muted)] border-[var(--sp-border)] hover:text-[var(--sp-ink)]'
              }`}
            >
              {soundPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={toggleLowStimulation}
              aria-pressed={profile.lowStimulationMode}
              title="Toggle Low-Stimulation Mode"
              aria-label="Toggle Low-Stimulation Mode"
              className={`p-2 rounded-lg border transition-colors ${
                profile.lowStimulationMode
                  ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)] border-[var(--sp-accent)]'
                  : 'bg-[var(--sp-canvas)] text-[var(--sp-ink-muted)] border-[var(--sp-border)] hover:text-[var(--sp-ink)]'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-surface-muted)] transition-colors whitespace-nowrap shrink-0"
              aria-label="Open student profile"
            >
              <StudentAvatar avatarId={profile.avatarId} name={profile.name} size={28} />
              <span className="text-xs font-medium text-[var(--sp-ink)] hidden xl:inline">
                {profile.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[var(--sp-surface)] border-r border-[var(--sp-border)] p-5 flex flex-col justify-between z-10 shadow-xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--sp-border)]">
                <div>
                  <span className="font-display text-lg font-semibold text-[var(--sp-ink)] block">
                    Thiranagam
                  </span>
                  <span className="text-[11px] text-[var(--sp-ink-muted)]">திறனகம்</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)]"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav aria-label="Mobile sections" className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${getThemeNavButtonClass(
                        themeSettings.preset,
                        isActive
                      )}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 pt-4 border-t border-[var(--sp-border)]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openThemeStudio();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--sp-accent-soft)] text-[var(--sp-ink)] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4 text-[var(--sp-accent)]" />
                <span>Theme Studio ({activeThemeMeta.name})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRestartModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Help Me Restart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
