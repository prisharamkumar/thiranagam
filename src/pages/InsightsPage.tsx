import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BatteryMedium,
  Compass,
  History,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Timer,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

const DAYS_ORDER: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

export const InsightsPage: React.FC = () => {
  const {
    profile,
    focusSessions,
    quizAttempts,
    modules,
    overallRoadmapPct,
    totalFocusMinutesToday,
    setActivePage,
    agentPipelineRun,
    skillAssessments,
    skillLevelHistory,
    mentorMessages,
    mentorLoading,
    geminiHealth,
    askMentor,
  } = useAppState();

  const [mentorInput, setMentorInput] = useState('');

  const analystOut = agentPipelineRun.traces[0].output;
  const matchingOut = agentPipelineRun.traces[1].output;

  const weeklyTotals = DAYS_ORDER.map((day) => {
    const minutes = focusSessions
      .filter((s) => s.dayKey === day && s.mode === 'focus')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return { day, minutes };
  });

  const maxWeeklyMinutes = Math.max(60, ...weeklyTotals.map((d) => d.minutes));
  const totalWeekMinutes = weeklyTotals.reduce((acc, d) => acc + d.minutes, 0);

  const energyBreakdown = (['low', 'steady', 'bright'] as const).map((lvl) => {
    const matching = focusSessions.filter((s) => s.energy === lvl && s.mode === 'focus');
    const mins = matching.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      level: lvl,
      label: lvl === 'low' ? 'Low-Energy' : lvl === 'steady' ? 'Gentle Pace' : 'Deep Focus',
      sessions: matching.length,
      minutes: mins,
    };
  });

  const avgSkillCheckPct =
    skillAssessments.length > 0
      ? Math.round(skillAssessments.reduce((acc, a) => acc + a.pct, 0) / skillAssessments.length)
      : quizAttempts.length > 0
        ? Math.round(
            (quizAttempts.reduce((acc, q) => acc + q.score / Math.max(1, q.total), 0) /
              quizAttempts.length) *
              100
          )
        : 0;

  const handleSendMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim() || mentorLoading) return;
    void askMentor(mentorInput);
    setMentorInput('');
  };

  const quickPrompts = [
    `Why is my readiness score ${matchingOut.readinessScore}%?`,
    'Explain my weaknesses and how to fix them',
    'What should I study next on my roadmap?',
  ];

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Insights & AI Mentor · {profile.name} · Target: {matchingOut.roleTitle}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1">
            Progress Tracking & AI Mentor
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActivePage('roadmap')}
            className="px-4 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-surface)] text-xs font-semibold text-[var(--sp-ink)] hover:bg-[var(--sp-surface-muted)]"
          >
            Take Skill Assessment
          </button>
          <button
            type="button"
            onClick={() => setActivePage('focus')}
            className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            Log New Session in Focus Studio
          </button>
        </div>
      </header>

      {/* Top Deterministic Summary Metrics */}
      <section aria-label="Summary metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5">
          <span className="text-xs text-[var(--sp-ink-muted)] flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-[var(--sp-accent)]" aria-hidden="true" />
            <span>Weekly Focus</span>
          </span>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1">
            {totalWeekMinutes} min
          </p>
          <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
            {totalFocusMinutesToday} min logged today
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5">
          <span className="text-xs text-[var(--sp-ink-muted)] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[var(--sp-accent)]" aria-hidden="true" />
            <span>Roadmap & Role Readiness</span>
          </span>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1">
            {overallRoadmapPct}% · {matchingOut.readinessScore}%
          </p>
          <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
            {modules.filter((m) => m.status === 'completed').length}/{modules.length} modules · Role match
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5">
          <span className="text-xs text-[var(--sp-ink-muted)] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[var(--sp-secondary)]" aria-hidden="true" />
            <span>Skill Check Average</span>
          </span>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1">
            {avgSkillCheckPct}%
          </p>
          <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
            Across {skillAssessments.length} graded skill assessments
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5">
          <span className="text-xs text-[var(--sp-ink-muted)] flex items-center gap-1.5">
            <BatteryMedium className="w-3.5 h-3.5 text-[var(--sp-warm)]" aria-hidden="true" />
            <span>Skill Verification</span>
          </span>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--sp-ink)] mt-1">
            {profile.skills.filter((s) => s.verifiedLevel !== undefined).length}/{profile.skills.length}
          </p>
          <p className="text-[11px] text-[var(--sp-ink-muted)] mt-0.5">
            Profile skills assessment-verified
          </p>
        </div>
      </section>

      {/* =====================================================================
          INTERACTIVE AI MENTOR (GROUNDED IN LIVE WORKSPACE STATE)
          ===================================================================== */}
      <section
        aria-label="Interactive AI Mentor"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--sp-border)]">
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--sp-accent)]" aria-hidden="true" />
              <span>AI Study Mentor</span>
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
              Grounded in your live profile, {matchingOut.roleTitle} target ({matchingOut.readinessScore}% readiness), assessments, and roadmap.
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold self-start sm:self-auto ${
              geminiHealth.configured && geminiHealth.connected
                ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                : geminiHealth.mode === 'error'
                  ? 'bg-[var(--sp-danger-soft)] text-[var(--sp-danger)]'
                  : 'bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)]'
            }`}
          >
            {geminiHealth.configured && geminiHealth.connected
              ? `Live Gemini Mentor (${geminiHealth.model})`
              : geminiHealth.mode === 'error'
                ? 'Gemini Mentor Error (See Message Below)'
                : 'Demo Mentor Fallback (Server GEMINI_API_KEY Not Configured)'}
          </span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {mentorMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] ml-6 sm:ml-16'
                  : msg.executionStatus === 'error'
                    ? 'bg-[var(--sp-danger-soft)] border border-[var(--sp-danger)] text-[var(--sp-ink)] mr-4 sm:mr-12'
                    : 'bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] text-[var(--sp-ink)] mr-4 sm:mr-12'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-85">
                <span className="font-semibold inline-flex items-center gap-1.5">
                  {msg.role === 'mentor' && <Sparkles className="w-3 h-3" aria-hidden="true" />}
                  <span>{msg.role === 'mentor' ? 'Thiranagam Mentor' : profile.name}</span>
                  {msg.role === 'mentor' && msg.executionStatus && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--sp-canvas)] border border-[var(--sp-border)] text-[10px] font-medium">
                      {msg.executionStatus === 'live-gemini'
                        ? `Live Gemini${msg.latencyMs ? ` · ${msg.latencyMs}ms` : ''}`
                        : msg.executionStatus === 'error'
                          ? 'Error'
                          : 'Demo Fallback'}
                    </span>
                  )}
                </span>
                <span>{msg.timestampLabel}</span>
              </div>
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-1.5 border-t border-[var(--sp-border)] text-[11px] text-[var(--sp-ink-muted)] space-y-0.5">
                  <span className="font-semibold text-[var(--sp-accent)] block">Recommended Next Actions:</span>
                  {msg.suggestedActions.map((act) => (
                    <span key={act} className="block">
                      • {act}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {mentorLoading && (
            <div className="p-3 rounded-2xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] text-xs text-[var(--sp-ink-muted)] mr-4 sm:mr-12 inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--sp-accent)]" aria-hidden="true" />
              <span>Consulting server AI Mentor...</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={mentorLoading}
              onClick={() => void askMentor(prompt)}
              className="px-3 py-1.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] hover:border-[var(--sp-accent)] disabled:opacity-60 text-xs font-medium text-[var(--sp-ink)] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMentor} className="flex gap-2">
          <input
            type="text"
            value={mentorInput}
            onChange={(e) => setMentorInput(e.target.value)}
            placeholder="Ask your mentor about your readiness score, weaknesses, React revision, or next step..."
            aria-label="Ask AI Mentor a question"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
          />
          <button
            type="submit"
            disabled={mentorLoading}
            className="px-4 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {mentorLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{mentorLoading ? 'Thinking...' : 'Ask'}</span>
          </button>
        </form>
      </section>

      {/* Skill Levels (Self-Reported vs Verified) + Skill Changes & Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Skill development progress"
          className="lg:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
              Skill Levels (Live Profile & Verified)
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
              Updates dynamically when you edit skills or submit assessments.
            </p>
          </div>
          <div className="space-y-3">
            {analystOut.comparisons.map((comp) => {
              const pct = Math.round((comp.effectiveLevel / 5) * 100);
              return (
                <div key={comp.skillName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-[var(--sp-ink)] truncate">
                      {comp.skillName}{' '}
                      <span className="text-[10px] text-[var(--sp-ink-muted)]">
                        ({comp.verificationStatus.replace(/-/g, ' ')})
                      </span>
                    </span>
                    <span className="font-mono tabular-nums text-[var(--sp-ink-muted)] shrink-0">
                      {comp.effectiveLevel}/5 ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--sp-surface-muted)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.verificationStatus === 'needs-revision'
                          ? 'bg-[var(--sp-danger)]'
                          : comp.verificationStatus === 'verified'
                            ? 'bg-[var(--sp-accent)]'
                            : 'bg-[var(--sp-secondary)]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-label="Assessment results and skill level change log"
          className="lg:col-span-7 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--sp-secondary)]" aria-hidden="true" />
              <span>Assessment Results & Skill-Level Changes</span>
            </h2>
            <span className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
              {skillAssessments.length} assessments · {skillLevelHistory.length} changes
            </span>
          </div>

          <div className="space-y-2.5">
            {skillAssessments.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-semibold text-[var(--sp-ink)]">
                    {a.skillName} Skill Check · {a.score}/{a.total} ({a.pct}%)
                  </span>
                  <p className="text-[var(--sp-ink-muted)] mt-0.5">{a.note}</p>
                </div>
                <span
                  className={`font-mono font-semibold shrink-0 px-2 py-0.5 rounded ${
                    a.triggeredAdaptation
                      ? 'bg-[var(--sp-danger-soft)] text-[var(--sp-danger)]'
                      : 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                  }`}
                >
                  Verified {a.newVerifiedLevel}/5
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[var(--sp-border)] space-y-2">
            <h3 className="text-xs font-semibold text-[var(--sp-ink-muted)]">
              Recent Skill-Level Change Log
            </h3>
            {skillLevelHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-[var(--sp-ink)]">{entry.skillName}</span>{' '}
                  <span className="font-mono text-[var(--sp-accent)]">
                    ({entry.fromLevel}/5 → {entry.toLevel}/5)
                  </span>
                  <p className="text-[11px] text-[var(--sp-ink-muted)]">{entry.note}</p>
                </div>
                <span className="text-[11px] text-[var(--sp-ink-muted)] shrink-0">
                  {entry.timestampLabel}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Weekly Activity Chart + Energy Patterns + Focus Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section
          aria-label="Weekly learning activity"
          className="lg:col-span-7 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
              <span>Weekly Learning Activity</span>
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
              Focus Studio minutes by day (updates automatically as you finish timers).
            </p>
          </div>

          <div className="h-52 flex items-end gap-3 pt-4 border-b border-[var(--sp-border)] pb-3">
            {weeklyTotals.map((item) => {
              const heightPct = Math.max(4, Math.round((item.minutes / maxWeeklyMinutes) * 100));
              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="font-mono text-[11px] tabular-nums text-[var(--sp-ink-muted)]">
                    {item.minutes}m
                  </span>
                  <div className="w-full max-w-[44px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        item.minutes > 0 ? 'bg-[var(--sp-accent)]' : 'bg-[var(--sp-surface-muted)]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${item.day}: ${item.minutes} minutes`}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--sp-ink-muted)]">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-label="Energy patterns and focus history"
          className="lg:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
              Energy Patterns
            </h2>
            <div className="mt-3 space-y-2.5">
              {energyBreakdown.map((e) => (
                <div key={e.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--sp-ink)]">{e.label}</span>
                    <span className="font-mono tabular-nums text-[var(--sp-ink-muted)]">
                      {e.minutes}m · {e.sessions} sessions
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--sp-surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--sp-secondary)]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((e.minutes / Math.max(1, totalWeekMinutes)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--sp-border)] space-y-2">
            <h3 className="text-xs font-semibold text-[var(--sp-ink-muted)]">
              Recent Focus Sessions ({focusSessions.length})
            </h3>
            {focusSessions.slice(0, 3).map((sess) => (
              <div key={sess.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[var(--sp-ink)]">{sess.taskTitle}</span>
                <span className="font-mono font-semibold text-[var(--sp-accent)] shrink-0">
                  {sess.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
