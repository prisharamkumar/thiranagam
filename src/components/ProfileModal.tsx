import React, { useEffect, useState } from 'react';
import { RotateCcw, Settings, X } from 'lucide-react';
import { COMPANIONS } from '../data/demoData';
import { CAREER_ROLES } from '../data/careerRoles';
import { useAppState } from '../context/AppStateContext';
import { CompanionPortraitBadge } from './CompanionPortraitBadge';
import { StudentAvatar } from './StudentAvatar';
import { CareerRoleId, CompanionId } from '../types';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const {
    profile,
    updateProfile,
    renameCompanion,
    getCompanionDisplayName,
    resetDemoWorkspace,
    setActivePage,
    setOnboardingOpen,
    changeTargetRole,
  } = useAppState();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [major, setMajor] = useState(profile.major);
  const [year, setYear] = useState(profile.year);
  const [targetRoleId, setTargetRoleId] = useState<CareerRoleId>(profile.targetRoleId);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyFocusGoalMinutes);
  const [companionId, setCompanionId] = useState<CompanionId>(profile.activeCompanionId);
  const [companionDisplayName, setCompanionDisplayName] = useState(
    getCompanionDisplayName(profile.activeCompanionId)
  );
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setEmail(profile.email);
      setUniversity(profile.university);
      setMajor(profile.major);
      setYear(profile.year);
      setTargetRoleId(profile.targetRoleId);
      setDailyGoal(profile.dailyFocusGoalMinutes);
      setCompanionId(profile.activeCompanionId);
      setCompanionDisplayName(getCompanionDisplayName(profile.activeCompanionId));
      setConfirmReset(false);
    }
  }, [open, profile, getCompanionDisplayName]);

  if (!open) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Demo Learner',
      email: email.trim() || profile.email,
      university: university.trim() || 'University',
      major: major.trim() || 'Computer Science',
      year: year.trim() || 'Undergraduate',
      dailyFocusGoalMinutes: Math.max(15, Math.min(360, dailyGoal)),
      activeCompanionId: companionId,
    });
    if (targetRoleId !== profile.targetRoleId) {
      changeTargetRole(targetRoleId);
    }
    renameCompanion(companionId, companionDisplayName);
    onClose();
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetDemoWorkspace();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--sp-border)]">
          <div className="flex items-center gap-3">
            <StudentAvatar avatarId={profile.avatarId} name={name} size={42} />
            <div>
              <h2 id="profile-modal-title" className="font-display text-xl font-semibold text-[var(--sp-ink)]">
                Quick Profile & Companion Setup
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                Personalise your Thiranagam workspace or open full Settings for avatars, progress & themes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)] transition-colors"
            aria-label="Close profile settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sp-name" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Student Name
              </label>
              <input
                id="sp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              />
            </div>

            <div>
              <label htmlFor="sp-email" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Email Address
              </label>
              <input
                id="sp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              />
            </div>

            <div>
              <label htmlFor="sp-year" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Academic Standing
              </label>
              <input
                id="sp-year"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sp-univ" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                University
              </label>
              <input
                id="sp-univ"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              />
            </div>

            <div>
              <label htmlFor="sp-major" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Course / Branch
              </label>
              <input
                id="sp-major"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="sp-goal" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Target Career Goal
              </label>
              <select
                id="sp-goal"
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value as CareerRoleId)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              >
                {CAREER_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sp-minutes" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Daily Focus Goal (min)
              </label>
              <input
                id="sp-minutes"
                type="number"
                min={15}
                max={360}
                step={5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono tabular-nums text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
              />
            </div>
          </div>

          {/* 6-Companion Picker + Rename */}
          <div className="space-y-3">
            <span className="block text-xs font-medium text-[var(--sp-ink-muted)]">
              Active Study Companion
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COMPANIONS.map((c) => {
                const selected = companionId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCompanionId(c.id);
                      setCompanionDisplayName(getCompanionDisplayName(c.id));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2.5 ${
                      selected
                        ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                        : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:bg-[var(--sp-surface-muted)]'
                    }`}
                  >
                    <CompanionPortraitBadge companionId={c.id} size={42} />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[var(--sp-ink)] block truncate">
                        {getCompanionDisplayName(c.id)}
                      </span>
                      <span className="text-[11px] text-[var(--sp-ink-muted)] block truncate">
                        {c.species}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="sp-comp-name" className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                Custom Companion Display Name
              </label>
              <input
                id="sp-comp-name"
                type="text"
                value={companionDisplayName}
                onChange={(e) => setCompanionDisplayName(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--sp-border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-danger)] hover:bg-[var(--sp-danger-soft)] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{confirmReset ? 'Click again to confirm reset' : 'Reset Demo Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setOnboardingOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)]"
              >
                Run Setup Wizard
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActivePage('settings');
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--sp-accent)] hover:bg-[var(--sp-accent-soft)] flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                <span>All Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-medium bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] hover:opacity-95 transition-opacity"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
