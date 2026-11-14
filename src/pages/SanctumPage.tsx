import React from 'react';
import { Check, EyeOff, Pause, Play, Sparkles, Sun, Type, Volume2 } from 'lucide-react';
import { SANCTUM_ENVIRONMENTS, SOUNDSCAPE_TRACKS } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { IllustratedFrame } from '../components/IllustratedFrame';
import { LightingPreset } from '../types';

const LIGHTING_OPTIONS: { id: LightingPreset; label: string; description: string; tint: string }[] = [
  {
    id: 'warm',
    label: 'Warm Candlelight',
    description: 'Golden amber room glow',
    tint: 'bg-amber-900/15',
  },
  {
    id: 'daylight',
    label: 'Soft Daylight',
    description: 'Crisp sunlit afternoon clarity',
    tint: 'bg-transparent',
  },
  {
    id: 'twilight',
    label: 'Lavender Twilight',
    description: 'Calm dusk violet hue',
    tint: 'bg-indigo-950/25',
  },
];

export const SanctumPage: React.FC = () => {
  const {
    activeEnvironment,
    setEnvironment,
    activeLighting,
    setLighting,
    activeSoundTrack,
    selectSoundTrack,
    soundPlaying,
    toggleSoundPlaying,
    soundVolume,
    setSoundVolume,
    profile,
    updateProfile,
    toggleLowStimulation,
    setActivePage,
  } = useAppState();

  const currentEnv =
    SANCTUM_ENVIRONMENTS.find((e) => e.id === activeEnvironment) ?? SANCTUM_ENVIRONMENTS[0];
  const currentLightTint =
    LIGHTING_OPTIONS.find((l) => l.id === activeLighting)?.tint ?? 'bg-transparent';

  const handleSelectEnvironment = (envId: typeof activeEnvironment) => {
    setEnvironment(envId);
    const chosen = SANCTUM_ENVIRONMENTS.find((e) => e.id === envId);
    if (chosen) {
      setLighting(chosen.recommendedLighting);
      selectSoundTrack(chosen.recommendedSound);
    }
  };

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Sanctum · Study Room Atmosphere (Independent of Global App Theme)
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1">
            Choose Your Study Sanctum
          </h1>
          <p className="text-sm text-[var(--sp-ink-muted)] mt-1">
            Select your immersive room backdrop, ambient soundscape, and room lighting without altering your global app theme.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('settings')}
          className="px-3.5 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-surface)] text-xs font-medium text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)] self-start md:self-auto whitespace-nowrap"
        >
          Global Themes in Settings
        </button>
      </header>

      {/* Active Environment Stage */}
      <section
        aria-label="Active study sanctum preview"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
      >
        <div className="lg:col-span-7 relative min-h-[260px]">
          <IllustratedFrame
            src={currentEnv.imageUrl}
            alt={currentEnv.name}
            fallbackTitle={currentEnv.name}
            fallbackGradient={currentEnv.gradientClass}
            className="w-full h-full min-h-[260px]"
          />
          <div className={`absolute inset-0 pointer-events-none transition-colors ${currentLightTint}`} />
        </div>
        <div className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[var(--sp-secondary)] font-medium">Active Study Room</p>
            <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)] mt-1">
              {currentEnv.name}
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">{currentEnv.atmosphere}</p>
            <p className="text-sm text-[var(--sp-ink-muted)] mt-3 leading-relaxed">
              {currentEnv.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--sp-border)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--sp-ink-muted)]">
              Room Lighting:{' '}
              <strong className="text-[var(--sp-ink)] capitalize">{activeLighting}</strong>
            </span>
            <button
              type="button"
              onClick={toggleSoundPlaying}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                soundPlaying
                  ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                  : 'bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
              }`}
            >
              {soundPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{soundPlaying ? 'Pause Soundscape' : 'Play Soundscape'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Study Environment Gallery */}
      <section aria-label="Study environment gallery" className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
          Study Environment Gallery
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SANCTUM_ENVIRONMENTS.map((env) => {
            const isSelected = env.id === activeEnvironment;
            return (
              <button
                key={env.id}
                type="button"
                onClick={() => handleSelectEnvironment(env.id)}
                aria-pressed={isSelected}
                className={`rounded-2xl border overflow-hidden text-left transition-colors flex flex-col justify-between ${
                  isSelected
                    ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                    : 'border-[var(--sp-border)] bg-[var(--sp-surface)] hover:bg-[var(--sp-surface-muted)]'
                }`}
              >
                <IllustratedFrame
                  src={env.imageUrl}
                  alt={env.name}
                  fallbackTitle={env.name}
                  fallbackGradient={env.gradientClass}
                  className="aspect-[16/9] w-full"
                />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                        {env.name}
                      </h3>
                      {isSelected && <Check className="w-4 h-4 text-[var(--sp-accent)] shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">{env.atmosphere}</p>
                    <p className="text-xs text-[var(--sp-ink-muted)] mt-2 leading-relaxed">
                      {env.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Soundscape, Room Lighting & Sensory Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section
          aria-label="Soundscape controls"
          className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
              <span>Soundscape</span>
            </h2>
            <button
              type="button"
              onClick={toggleSoundPlaying}
              className="px-3 py-1.5 rounded-lg bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
            >
              {soundPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

          <div className="space-y-2">
            {SOUNDSCAPE_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => selectSoundTrack(track.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-colors ${
                  activeSoundTrack === track.id
                    ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
                    : 'bg-[var(--sp-canvas)] border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                }`}
              >
                <span className="text-xs font-semibold block">{track.label}</span>
                <span className="text-[11px] opacity-85">{track.description}</span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-[var(--sp-ink-muted)] mb-1">
              <label htmlFor="sanctum-vol">Master Volume</label>
              <span className="font-mono tabular-nums">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              id="sanctum-vol"
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

        <section
          aria-label="Room lighting controls"
          className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
            <Sun className="w-4 h-4 text-[var(--sp-warm)]" aria-hidden="true" />
            <span>Room Lighting</span>
          </h2>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Adjusts your Sanctum study room overlay independently from your global theme.
          </p>

          <div className="space-y-2.5">
            {LIGHTING_OPTIONS.map((opt) => {
              const active = activeLighting === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLighting(opt.id)}
                  aria-pressed={active}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
                    active
                      ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
                      : 'bg-[var(--sp-canvas)] border-[var(--sp-border)] text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-semibold block">{opt.label}</span>
                    <span className="text-xs text-[var(--sp-ink-muted)]">{opt.description}</span>
                  </div>
                  {active && <Check className="w-4 h-4 text-[var(--sp-accent)] shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        <section
          aria-label="Reduced motion and low stimulation settings"
          className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-semibold text-[var(--sp-ink)] flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[var(--sp-secondary)]" aria-hidden="true" />
            <span>Sensory & Motion Comfort</span>
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-[var(--sp-ink)] block">
                  Low-Stimulation Mode
                </span>
                <span className="text-xs text-[var(--sp-ink-muted)]">
                  Softens visual intensity and pauses companion eye tracking.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.lowStimulationMode}
                onClick={toggleLowStimulation}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  profile.lowStimulationMode ? 'bg-[var(--sp-accent)]' : 'bg-[var(--sp-border)]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    profile.lowStimulationMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-[var(--sp-ink)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--sp-ink-muted)]" aria-hidden="true" />
                  <span>Reduced Motion</span>
                </span>
                <span className="text-xs text-[var(--sp-ink-muted)]">
                  Eliminates transition animations across views.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.reducedMotion}
                onClick={() => updateProfile({ reducedMotion: !profile.reducedMotion })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  profile.reducedMotion ? 'bg-[var(--sp-accent)]' : 'bg-[var(--sp-border)]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    profile.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-[var(--sp-ink)] flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[var(--sp-ink-muted)]" aria-hidden="true" />
                  <span>Larger Reading Type</span>
                </span>
                <span className="text-xs text-[var(--sp-ink-muted)]">
                  Slightly increases base reading scale for long texts.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.comfortableReadingSize}
                onClick={() =>
                  updateProfile({ comfortableReadingSize: !profile.comfortableReadingSize })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  profile.comfortableReadingSize ? 'bg-[var(--sp-accent)]' : 'bg-[var(--sp-border)]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    profile.comfortableReadingSize ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
