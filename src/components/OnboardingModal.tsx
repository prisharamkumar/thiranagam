import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, X } from 'lucide-react';
import { COMPANIONS, IMMERSIVE_THEMES } from '../data/demoData';
import { useAppState } from '../context/AppStateContext';
import { CompanionPortraitBadge } from './CompanionPortraitBadge';
import { ThemeSceneThumbnail } from './ThemeSceneThumbnail';
import { CompanionId, ThemePresetId } from '../types';

export const OnboardingModal: React.FC = () => {
  const {
    onboardingOpen,
    completeOnboarding,
    skipOnboarding,
    profile,
    updateProfile,
    learningPreferences,
    updateLearningPreferences,
    deadlineGoal,
    updateDeadlineGoal,
    adhdPreferences,
    updateADHDPreferences,
    themeSettings,
    updateThemeSettings,
    setCompanion,
    renameCompanion,
    getCompanionDisplayName,
  } = useAppState();

  const [step, setStep] = useState(0);

  if (!onboardingOpen) return null;

  const steps = [
    'Academic Profile',
    'Learning Pace',
    'Deadline & Goal',
    'Focus Comfort',
    'Companion & Theme',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--sp-border)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2 id="onboarding-title" className="font-display text-lg font-semibold text-[var(--sp-ink)]">
                Personalise Thiranagam · {steps[step]}
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
                Step {step + 1} of {steps.length} · Optional & editable anytime in Settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={skipOnboarding}
            className="text-xs font-medium text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--sp-surface-muted)] flex items-center gap-1"
          >
            <span>Skip for now</span>
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-[var(--sp-surface-muted)]">
          <div
            className="h-full bg-[var(--sp-accent)] transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--sp-ink-muted)]">
                Tell Thiranagam what you are studying so your roadmap, language, and study space reflect your real coursework.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    University / Institution
                  </label>
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => updateProfile({ university: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Course & Branch
                  </label>
                  <input
                    type="text"
                    value={profile.major}
                    onChange={(e) => updateProfile({ major: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Semester / Year
                  </label>
                  <input
                    type="text"
                    value={profile.year}
                    onChange={(e) => updateProfile({ year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                  Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.subjects.join(', ')}
                  onChange={(e) =>
                    updateProfile({
                      subjects: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                  Career North Star / Interests
                </label>
                <input
                  type="text"
                  value={profile.careerNorthStar}
                  onChange={(e) => updateProfile({ careerNorthStar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--sp-ink-muted)]">
                Shape how Thiranagam structures study blocks and pacing around your energy.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Current Knowledge Level
                  </label>
                  <select
                    value={learningPreferences.knowledgeLevel}
                    onChange={(e) =>
                      updateLearningPreferences({
                        knowledgeLevel: e.target.value as typeof learningPreferences.knowledgeLevel,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  >
                    <option value="beginner">Beginner — building fundamentals</option>
                    <option value="intermediate">Intermediate — connecting ideas</option>
                    <option value="advanced">Advanced — synthesis & research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Preferred Learning Format
                  </label>
                  <select
                    value={learningPreferences.preferredFormat}
                    onChange={(e) =>
                      updateLearningPreferences({
                        preferredFormat: e.target.value as typeof learningPreferences.preferredFormat,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  >
                    <option value="mixed">Mixed (Readings + Practice + Arcade)</option>
                    <option value="reading">Structured Readings & Notes</option>
                    <option value="visual">Visual Diagrams & Concept Maps</option>
                    <option value="practice">Quizzes & Flashcards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Preferred Study Time
                  </label>
                  <select
                    value={learningPreferences.preferredStudyTime}
                    onChange={(e) =>
                      updateLearningPreferences({
                        preferredStudyTime: e.target.value as typeof learningPreferences.preferredStudyTime,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Daily Study Availability (hours)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={12}
                    step={0.5}
                    value={learningPreferences.dailyAvailabilityHours}
                    onChange={(e) =>
                      updateLearningPreferences({
                        dailyAvailabilityHours: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono tabular-nums text-[var(--sp-ink)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Preferred Focus Duration (min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    step={5}
                    value={learningPreferences.preferredFocusMinutes}
                    onChange={(e) =>
                      updateLearningPreferences({
                        preferredFocusMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono tabular-nums text-[var(--sp-ink)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Preferred Break Duration (min)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={30}
                    step={1}
                    value={learningPreferences.preferredBreakMinutes}
                    onChange={(e) =>
                      updateLearningPreferences({
                        preferredBreakMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono tabular-nums text-[var(--sp-ink)]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--sp-ink-muted)]">
                Add an upcoming exam or project milestone so Thiranagam can highlight deadlines calmly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Goal or Exam Name
                  </label>
                  <input
                    type="text"
                    value={deadlineGoal.examOrGoalName}
                    onChange={(e) => updateDeadlineGoal({ examOrGoalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={deadlineGoal.finalDate}
                    onChange={(e) => updateDeadlineGoal({ finalDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm font-mono text-[var(--sp-ink)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                  Syllabus or Key Topics
                </label>
                <textarea
                  rows={2}
                  value={deadlineGoal.syllabusTopics}
                  onChange={(e) => updateDeadlineGoal({ syllabusTopics: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                  Priority Subjects
                </label>
                <input
                  type="text"
                  value={deadlineGoal.prioritySubjects}
                  onChange={(e) => updateDeadlineGoal({ prioritySubjects: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--sp-ink-muted)]">
                Optional sensory and executive-function preferences. No medical disclosure is ever required—choose what feels supportive.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: 'autoMicrotaskBreakdown',
                    title: 'Auto Microtask Breakdown',
                    desc: 'Add starter sub-steps automatically to new tasks.',
                    val: adhdPreferences.autoMicrotaskBreakdown,
                    toggle: () =>
                      updateADHDPreferences({
                        autoMicrotaskBreakdown: !adhdPreferences.autoMicrotaskBreakdown,
                      }),
                  },
                  {
                    key: 'bodyDoublingMode',
                    title: 'Body Doubling Presence',
                    desc: 'Show quiet companion study company in Focus Studio.',
                    val: adhdPreferences.bodyDoublingMode,
                    toggle: () =>
                      updateADHDPreferences({
                        bodyDoublingMode: !adhdPreferences.bodyDoublingMode,
                      }),
                  },
                  {
                    key: 'oneTaskAtATime',
                    title: 'One-Task-at-a-Time View',
                    desc: 'Hide secondary lists on Today & Focus Studio.',
                    val: adhdPreferences.oneTaskAtATime,
                    toggle: () =>
                      updateADHDPreferences({
                        oneTaskAtATime: !adhdPreferences.oneTaskAtATime,
                      }),
                  },
                  {
                    key: 'lowStim',
                    title: 'Low-Stimulation Mode',
                    desc: 'Softens visual contrast and silences decorative motion.',
                    val: profile.lowStimulationMode,
                    toggle: () =>
                      updateProfile({ lowStimulationMode: !profile.lowStimulationMode }),
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.toggle}
                    aria-pressed={item.val}
                    className={`p-3.5 rounded-xl border text-left transition-colors ${
                      item.val
                        ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)]'
                        : 'bg-[var(--sp-canvas)] border-[var(--sp-border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--sp-ink)]">{item.title}</span>
                      {item.val && <Check className="w-4 h-4 text-[var(--sp-accent)]" />}
                    </div>
                    <p className="text-xs text-[var(--sp-ink-muted)] mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-2">
                  Choose Your Study Companion
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMPANIONS.map((c) => {
                    const selected = profile.activeCompanionId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCompanion(c.id as CompanionId)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                          selected
                            ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)]'
                            : 'bg-[var(--sp-canvas)] border-[var(--sp-border)]'
                        }`}
                      >
                        <CompanionPortraitBadge companionId={c.id} size={42} />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[var(--sp-ink)] block truncate">
                            {getCompanionDisplayName(c.id)}
                          </span>
                          <span className="text-[11px] text-[var(--sp-ink-muted)] block">
                            {c.species}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-1">
                  Customise Companion Display Name
                </label>
                <input
                  type="text"
                  value={getCompanionDisplayName(profile.activeCompanionId)}
                  onChange={(e) => renameCompanion(profile.activeCompanionId, e.target.value)}
                  className="w-full sm:w-72 px-3 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[var(--sp-ink-muted)] mb-2">
                  Preferred World Theme
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {IMMERSIVE_THEMES.map((t) => {
                    const active = themeSettings.preset === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          updateThemeSettings({
                            preset: t.id as ThemePresetId,
                            colorMode: t.defaultModeHint,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-colors ${
                          active
                            ? 'border-[var(--sp-accent)] bg-[var(--sp-accent-soft)]'
                            : 'border-[var(--sp-border)] bg-[var(--sp-canvas)]'
                        }`}
                      >
                        <ThemeSceneThumbnail themeId={t.id} className="mb-1.5" />
                        <span className="text-xs font-semibold text-[var(--sp-ink)] block truncate">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-[var(--sp-ink-muted)] block truncate mt-0.5">
                          {t.navStyleLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--sp-border)] flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)] disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back</span>
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={completeOnboarding}
              className="px-5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold hover:opacity-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Enter Thiranagam</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
