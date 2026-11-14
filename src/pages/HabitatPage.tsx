import React, { useState } from 'react';
import {
  Check,
  Droplets,
  Flower2,
  Leaf,
  Lock,
  Move,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { COMPANIONS, DISCOVERY_POINTS } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { CompanionPortraitBadge } from '../components/CompanionPortraitBadge';
import { CollectibleIllustration } from '../components/CollectibleIllustration';
import { IllustratedFrame } from '../components/IllustratedFrame';
import { VisualRewardStage } from '../components/VisualRewardStage';
import { HabitatDecoration } from '../types';

const RESOURCE_LABELS = {
  acorns: 'Acorns',
  dewdrops: 'Dewdrops',
  tomes: 'Tomes',
  blossoms: 'Blossoms',
};

type CatalogueFilter = 'all' | 'placed' | 'collected' | 'locked';

export const HabitatPage: React.FC = () => {
  const {
    profile,
    resources,
    decorations,
    growthTimeline,
    setCompanion,
    getCompanionDisplayName,
    canUnlockDecoration,
    unlockDecoration,
    togglePlaceDecoration,
    moveDecoration,
    setActivePage,
  } = useAppState();

  const [selectedSpotId, setSelectedSpotId] = useState<'treehouse' | 'spring' | 'lilies'>('treehouse');
  const [selectedDecId, setSelectedDecId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<CatalogueFilter>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedSpot = DISCOVERY_POINTS.find((d) => d.id === selectedSpotId) ?? DISCOVERY_POINTS[0];
  const unlockedCount = decorations.filter((d) => d.unlocked).length;
  const placedDecorations = decorations.filter((d) => d.unlocked && d.placed);
  const habitatLevel = 2 + unlockedCount;
  const selectedDec = decorations.find((d) => d.id === selectedDecId) ?? null;

  const filteredCatalogue = decorations.filter((dec) => {
    if (filterStatus === 'placed' && !(dec.unlocked && dec.placed)) return false;
    if (filterStatus === 'collected' && !dec.unlocked) return false;
    if (filterStatus === 'locked' && dec.unlocked) return false;
    if (filterCategory !== 'All' && dec.category !== filterCategory) return false;
    return true;
  });

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedDec || !selectedDec.unlocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    moveDecoration(selectedDec.id, xPct, yPct);
    setFeedback(`Moved ${selectedDec.name} to (${Math.round(xPct)}%, ${Math.round(yPct)}%).`);
  };

  const handleUnlock = (dec: HabitatDecoration) => {
    const ok = unlockDecoration(dec.id);
    if (ok) {
      setSelectedDecId(dec.id);
      setFeedback(`Collected & placed ${dec.name} in your grove.`);
    } else {
      setFeedback(
        dec.unlockRequirement && dec.unlockRequirement.type !== 'costOnly'
          ? `Complete "${dec.unlockRequirement.label}" through genuine study progress.`
          : `Earn a few more ${RESOURCE_LABELS[dec.costType]} in Focus Studio or Arcade.`
      );
    }
  };

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)] flex flex-wrap items-center gap-2">
            <span>My Habitat</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Sanctuary Level {habitatLevel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {unlockedCount}/{decorations.length} Collected
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{placedDecorations.length} Placed</span>
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1">
            Whispering Willow Grove
          </h1>
        </div>

        <div className="rounded-xl bg-[var(--sp-accent-soft)] border border-[var(--sp-border)] px-4 py-2.5 flex items-center gap-2.5 text-xs text-[var(--sp-ink)]">
          <ShieldCheck className="w-4 h-4 text-[var(--sp-accent)] shrink-0" aria-hidden="true" />
          <span>Zero-Decay Sanctuary · Rest days never wilt rewards</span>
        </div>
      </header>

      {/* Resource Balance Strip */}
      <section aria-label="Habitat resources" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Acorns', val: resources.acorns, sub: 'Tasks & focus', icon: Leaf },
          { label: 'Focus Dewdrops', val: resources.dewdrops, sub: 'Study Spring', icon: Droplets },
          { label: 'Ancient Tomes', val: resources.tomes, sub: 'Milestones', icon: Sparkles },
          { label: 'Meadow Blossoms', val: resources.blossoms, sub: 'Learning Arcade', icon: Flower2 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-4"
            >
              <span className="text-xs text-[var(--sp-ink-muted)] flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-[var(--sp-accent)]" aria-hidden="true" />
                <span>{item.label}</span>
              </span>
              <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1">
                {item.val}
              </p>
              <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5">{item.sub}</p>
            </div>
          );
        })}
      </section>

      {feedback && (
        <div
          role="status"
          className="rounded-2xl bg-[var(--sp-accent-soft)] border border-[var(--sp-accent)] px-5 py-3 flex items-center justify-between gap-4 text-sm text-[var(--sp-ink)]"
        >
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Sanctuary World Stage + Placement Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <section
          aria-label="Interactive habitat world"
          className="xl:col-span-8 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] overflow-hidden"
        >
          <div
            onClick={handleStageClick}
            className={`relative aspect-[16/9] w-full select-none ${
              selectedDec?.unlocked ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <IllustratedFrame
              src="/src/assets/images/habitat_willow_island_1794634526785.jpg"
              alt="Whispering Willow Grove interactive world"
              fallbackTitle="Whispering Willow Grove"
              className="w-full h-full"
            />

            {/* Placed Illustrated Collectibles inside the World */}
            {placedDecorations.map((dec) => {
              const isSelected = selectedDecId === dec.id;
              return (
                <button
                  key={dec.id}
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setSelectedDecId(isSelected ? null : dec.id);
                  }}
                  style={{ left: `${dec.xPct}%`, top: `${dec.yPct}%` }}
                  title={`${dec.name} (${dec.spot}) — click to move or remove`}
                  className={`-translate-x-1/2 -translate-y-1/2 absolute p-1 rounded-xl transition-transform ${
                    isSelected
                      ? 'bg-[var(--sp-surface)] ring-2 ring-[var(--sp-accent)] scale-115 shadow-lg z-20'
                      : 'bg-[var(--sp-surface)]/80 hover:bg-[var(--sp-surface)] hover:scale-110 shadow-sm z-10'
                  }`}
                >
                  <CollectibleIllustration type={dec.visualType} size={38} />
                </button>
              );
            })}

            {/* Discovery Spot Markers */}
            {DISCOVERY_POINTS.map((point) => (
              <button
                key={point.id}
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setSelectedSpotId(point.id);
                }}
                style={{ left: `${point.xPct}%`, top: `${point.yPct}%` }}
                className={`-translate-x-1/2 -translate-y-1/2 absolute px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                  point.id === selectedSpotId
                    ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] border-white'
                    : 'bg-[var(--sp-surface)]/85 text-[var(--sp-ink)] border-[var(--sp-border)]'
                }`}
              >
                {point.title}
              </button>
            ))}
          </div>

          <div className="px-5 py-3 bg-[var(--sp-surface-muted)] border-t border-[var(--sp-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
            {selectedDec && selectedDec.unlocked ? (
              <>
                <span className="font-medium text-[var(--sp-ink)] flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-[var(--sp-accent)]" />
                  <span>
                    Selected <strong>{selectedDec.name}</strong> — click anywhere on the island above to move it
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePlaceDecoration(selectedDec.id)}
                    className="px-3 py-1 rounded-lg border border-[var(--sp-border)] bg-[var(--sp-surface)] font-medium text-[var(--sp-ink)] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{selectedDec.placed ? 'Store Away' : 'Place on Island'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDecId(null)}
                    className="text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] font-medium"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <span className="text-[var(--sp-ink-muted)]">
                Click any keepsake on the island to reposition or store it.
              </span>
            )}
          </div>
        </section>

        {/* Right: Spot Overview & Living Companion Stage */}
        <section
          aria-label="Habitat spot inspector"
          className="xl:col-span-4 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 flex flex-col justify-between space-y-5"
        >
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              {DISCOVERY_POINTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedSpotId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    p.id === selectedSpotId
                      ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                      : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                  }`}
                >
                  {p.title.split(' ')[0]}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--sp-secondary)] font-medium">{selectedSpot.subtitle}</p>
            <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)] mt-0.5">
              {selectedSpot.title}
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-2">{selectedSpot.bonusLabel}</p>

            <div className="mt-5">
              <VisualRewardStage />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--sp-border)] flex items-center justify-between text-xs">
            <span className="text-[var(--sp-ink-muted)]">Earn rewards in Focus or Arcade</span>
            <button
              type="button"
              onClick={() => setActivePage('focus')}
              className="font-semibold text-[var(--sp-accent)] hover:underline"
            >
              Open Timer
            </button>
          </div>
        </section>
      </div>

      {/* Collectible Reward Catalogue (14 Illustrated Keepsakes) */}
      <section
        aria-label="Collectible reward catalogue"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)]">
              Collectible Keepsake Catalogue
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
              {unlockedCount} of {decorations.length} keepsakes collected · Unlocked through genuine study progress
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              {(['all', 'placed', 'collected', 'locked'] as CatalogueFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                    filterStatus === s
                      ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)] shadow-xs'
                      : 'text-[var(--sp-ink-muted)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter keepsakes by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-medium text-[var(--sp-ink)]"
            >
              {['All', 'Cozy Desk', 'Botanical', 'Lighting', 'Keepsakes'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCatalogue.map((dec) => {
            const status = canUnlockDecoration(dec);
            const isSelected = selectedDecId === dec.id;

            return (
              <div
                key={dec.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-colors ${
                  isSelected
                    ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                    : dec.unlocked
                      ? 'border-[var(--sp-border)] bg-[var(--sp-canvas)]'
                      : 'border-[var(--sp-border)] bg-[var(--sp-surface-muted)]/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-14 h-14 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-surface)] flex items-center justify-center shrink-0 ${
                      !dec.unlocked ? 'opacity-65 grayscale-[30%]' : ''
                    }`}
                  >
                    <CollectibleIllustration type={dec.visualType} size={46} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-medium text-[var(--sp-ink-muted)]">
                        {dec.category}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          dec.placed
                            ? 'text-[var(--sp-accent)]'
                            : dec.unlocked
                              ? 'text-[var(--sp-secondary)]'
                              : 'text-[var(--sp-ink-muted)]'
                        }`}
                      >
                        {dec.placed ? 'Placed' : dec.unlocked ? 'Collected' : 'Locked'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--sp-ink)] truncate mt-0.5">
                      {dec.name}
                    </h3>
                    <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
                      {dec.spot} · {dec.unlockRequirement?.label ?? `${dec.costAmount} ${RESOURCE_LABELS[dec.costType]}`}
                    </p>
                  </div>
                </div>

                {dec.unlocked ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePlaceDecoration(dec.id)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${
                        dec.placed
                          ? 'bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink)]'
                          : 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                      }`}
                    >
                      {dec.placed ? 'Remove' : 'Place in World'}
                    </button>
                    {dec.placed && (
                      <button
                        type="button"
                        onClick={() => setSelectedDecId(isSelected ? null : dec.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]"
                      >
                        {isSelected ? 'Moving...' : 'Move'}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnlock(dec)}
                    disabled={!status.eligible}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      status.eligible
                        ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] hover:opacity-95'
                        : 'bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink-muted)] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    {!status.requirementMet && <Lock className="w-3 h-3" />}
                    <span>
                      {status.eligible
                        ? `Collect (${dec.costAmount} ${RESOURCE_LABELS[dec.costType]})`
                        : !status.requirementMet
                          ? dec.unlockRequirement?.label
                          : `Need ${dec.costAmount} ${RESOURCE_LABELS[dec.costType]}`}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sanctuary Companions Roster */}
      <section aria-label="Sanctuary companions roster" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)]">
              Sanctuary Companions
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
              Invite any companion into your permanent bottom-left miniature room or view their reward progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('settings')}
            className="text-xs font-semibold text-[var(--sp-accent)] hover:underline self-start"
          >
            Rename Companions in Settings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMPANIONS.map((c) => {
            const isActive = profile.activeCompanionId === c.id;
            const displayName = getCompanionDisplayName(c.id);

            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isActive
                    ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)]'
                    : 'bg-[var(--sp-surface)] border-[var(--sp-border)]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <CompanionPortraitBadge companionId={c.id} size={58} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[var(--sp-ink-muted)]">
                      {c.species} · {c.role}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[var(--sp-ink)] truncate">
                      {displayName}
                    </h3>
                    <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5 truncate">
                      {c.studyNote}
                    </p>
                  </div>
                </div>

                <VisualRewardStage companionId={c.id} compact />

                <button
                  type="button"
                  onClick={() => setCompanion(c.id)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                      : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink)] hover:opacity-90'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                  <span>
                    {isActive ? 'Living in Corner Room' : `Invite ${displayName} to Room`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Growth Timeline */}
      <section
        aria-label="Habitat growth timeline"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
            Grove History
          </h2>
          <RotateCcw className="w-4 h-4 text-[var(--sp-ink-muted)]" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {growthTimeline.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--sp-ink)]">{item.title}</span>
                <span className="text-[11px] font-mono tabular-nums text-[var(--sp-ink-muted)] shrink-0">
                  {item.dateLabel}
                </span>
              </div>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
