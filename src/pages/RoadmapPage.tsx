import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Flag,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Wifi,
  Wrench,
} from 'lucide-react';
import { CAREER_ROLES, SKILL_ASSESSMENT_QUESTIONS } from '../data/careerRoles';
import { useAppState } from '../context/AppStateContext';
import { CareerRoleId } from '../types';

const ASSESSMENT_SKILLS = Object.keys(SKILL_ASSESSMENT_QUESTIONS);

export const RoadmapPage: React.FC = () => {
  const {
    profile,
    deadlineGoal,
    modules,
    milestones,
    toggleMilestone,
    papers,
    togglePaperBookmark,
    togglePaperRead,
    addMicrotask,
    openTaskInFocusStudio,
    microtasks,
    overallRoadmapPct,
    agentPipelineRun,
    changeTargetRole,
    submitSkillAssessment,
    rerunAgentPipeline,
    runDemoFallbackPipeline,
    checkGeminiHealth,
    geminiHealth,
    pipelineLoading,
    pipelineProgressLabel,
    aiErrorMessage,
    dismissAiError,
    resetDemoWorkspace,
    adaptationBanner,
    dismissAdaptationBanner,
    setActivePage,
  } = useAppState();

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active' | 'upcoming'>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id ?? '');
  const [paperFilter, setPaperFilter] = useState<'all' | 'bookmarked'>('all');
  const [questMessage, setQuestMessage] = useState<string | null>(null);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  // Interactive Skill Assessment state
  const [quizSkill, setQuizSkill] = useState<string>('React');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!modules.some((m) => m.id === selectedModuleId) && modules[0]) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  const analystOut = agentPipelineRun.traces[0].output;
  const matchingOut = agentPipelineRun.traces[1].output;
  const plannerOut = agentPipelineRun.traces[2].output;
  const evaluatorOut = agentPipelineRun.traces[3].output;

  const filteredModules = modules.filter((m) =>
    statusFilter === 'all' ? true : m.status === statusFilter
  );
  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? modules[0];
  const moduleTasks = selectedModule
    ? microtasks.filter((t) => t.moduleId === selectedModule.id)
    : [];
  const visiblePapers = papers.filter((p) => (paperFilter === 'bookmarked' ? p.bookmarked : true));

  const currentQuestions = SKILL_ASSESSMENT_QUESTIONS[quizSkill] ?? [];

  const handleLaunchQuest = (questTitle: string, moduleId: string) => {
    addMicrotask(questTitle, 25, moduleId);
    setQuestMessage(`Added "${questTitle}" to Today's microtasks and selected it in Focus Studio.`);
  };

  const handleGradeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuestions.length === 0) return;
    let correct = 0;
    for (const q of currentQuestions) {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    }
    const result = submitSkillAssessment(quizSkill, correct, currentQuestions.length);
    setQuizFeedback(
      `Submitted ${quizSkill} Check: ${result.score}/${result.total} (${result.pct}%). ${result.note}`
    );
  };

  const handleScenarioAPoorReact = () => {
    const result = submitSkillAssessment(
      'React',
      1,
      4,
      'Scenario A check: scored 1/4 (25%) on React Hooks & Immutable State — below 60% threshold.'
    );
    setQuizSkill('React');
    setQuizFeedback(
      `Scenario A executed: React scored ${result.score}/${result.total} (${result.pct}%). Progress Evaluator flagged weakness and Learning Planner inserted "React Revision & Guided Practice Lab" at step #1.`
    );
  };

  const handleScenarioBRoleSwitch = () => {
    const nextRole: CareerRoleId =
      profile.targetRoleId === 'full-stack-dev' ? 'data-scientist' : 'full-stack-dev';
    changeTargetRole(nextRole);
  };

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-7">
      {/* Career North Star & Demo Scenario Header */}
      <header className="rounded-2xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs opacity-90">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Career Goal & Adaptive Roadmap</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="px-2 py-0.5 rounded bg-white/15 font-medium">
                Demo Learner (Local Sandbox · Not Authenticated)
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">
              {matchingOut.roleTitle}
            </h1>
            <p className="text-sm opacity-90 mt-1.5 max-w-2xl leading-relaxed">
              Learner: <strong>{profile.name}</strong> · Active Deadline:{' '}
              <strong>{deadlineGoal.examOrGoalName}</strong> ({deadlineGoal.finalDate})
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 px-5 py-3.5 min-w-[165px]">
              <span className="text-xs opacity-85 block">Role Readiness</span>
              <span className="font-mono text-3xl font-semibold tabular-nums block mt-0.5">
                {matchingOut.readinessScore}%
              </span>
              <span className="text-[11px] opacity-90 block mt-0.5 tabular-nums">
                {matchingOut.matchedSkills.length} matched · {matchingOut.missingSkills.length} missing
              </span>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 px-5 py-3.5 min-w-[165px]">
              <span className="text-xs opacity-85 block">Roadmap Progress</span>
              <span className="font-mono text-3xl font-semibold tabular-nums block mt-0.5">
                {overallRoadmapPct}%
              </span>
              <span className="text-[11px] opacity-90 block mt-0.5 tabular-nums">
                {modules.length} ordered modules
              </span>
            </div>
          </div>
        </div>

        {/* Live Role Switcher + One-Click Scenario A & B Triggers */}
        <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="roadmap-role-select" className="text-xs font-semibold opacity-90">
              Target Career Goal:
            </label>
            <select
              id="roadmap-role-select"
              value={profile.targetRoleId}
              onChange={(e) => changeTargetRole(e.target.value as CareerRoleId)}
              className="px-3 py-1.5 rounded-xl bg-[var(--sp-surface)] text-[var(--sp-ink)] text-xs font-semibold border border-white/25"
            >
              {CAREER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleScenarioAPoorReact}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Scenario A: Poor React Score (25%)</span>
            </button>

            <button
              type="button"
              onClick={handleScenarioBRoleSwitch}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Scenario B:{' '}
                {profile.targetRoleId === 'full-stack-dev'
                  ? 'Switch → Data Scientist'
                  : 'Switch → Full Stack Developer'}
              </span>
            </button>

            <button
              type="button"
              disabled={pipelineLoading}
              onClick={() => void rerunAgentPipeline(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-60 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
            >
              {pipelineLoading && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
              <span>{pipelineLoading ? pipelineProgressLabel ?? 'Running 4 Agents...' : 'Re-Run 4 Agents'}</span>
            </button>

            <button
              type="button"
              onClick={resetDemoWorkspace}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Honest AI Orchestration Status Bar */}
      <div
        role="status"
        className={`rounded-2xl border px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
          agentPipelineRun.executionMode === 'live-gemini' && geminiHealth.connected
            ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
            : agentPipelineRun.executionMode === 'error' || aiErrorMessage
              ? 'bg-[var(--sp-danger-soft)] border-[var(--sp-danger)] text-[var(--sp-ink)]'
              : 'bg-[var(--sp-secondary-soft)] border-[var(--sp-border)] text-[var(--sp-ink)]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <Wifi
            className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${
              agentPipelineRun.executionMode === 'live-gemini' && geminiHealth.connected
                ? 'text-[var(--sp-accent)]'
                : agentPipelineRun.executionMode === 'error' || aiErrorMessage
                  ? 'text-[var(--sp-danger)]'
                  : 'text-[var(--sp-secondary)]'
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <span className="font-semibold block">
              {agentPipelineRun.executionMode === 'live-gemini' && geminiHealth.connected
                ? `LIVE GEMINI CONNECTED (${agentPipelineRun.modelUsed ?? geminiHealth.model})`
                : agentPipelineRun.executionMode === 'error' || aiErrorMessage
                  ? 'GEMINI API ERROR (Live Orchestration Failed)'
                  : geminiHealth.configured && geminiHealth.connected
                    ? `LIVE GEMINI READY (${geminiHealth.model} · Showing Initial Snapshot Until Run)`
                    : 'DEMO MODE (Deterministic Local Agents — Server GEMINI_API_KEY Not Configured)'}
            </span>
            <span className="text-[var(--sp-ink-muted)] block truncate sm:whitespace-normal">
              {pipelineLoading && pipelineProgressLabel
                ? pipelineProgressLabel
                : aiErrorMessage ?? geminiHealth.message}
              {!pipelineLoading && geminiHealth.latencyMs !== undefined
                ? ` · Probe latency: ${geminiHealth.latencyMs}ms`
                : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={geminiHealth.checking || pipelineLoading}
            onClick={() => void checkGeminiHealth(true)}
            className="px-3 py-1.5 rounded-xl bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink)] font-semibold hover:border-[var(--sp-accent)] disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {geminiHealth.checking && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
            <span>Test Live Gemini Connection</span>
          </button>
          {(agentPipelineRun.executionMode === 'error' || aiErrorMessage) && (
            <>
              <button
                type="button"
                onClick={() => void rerunAgentPipeline(true)}
                className="px-3 py-1.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] font-semibold"
              >
                Retry Live Gemini
              </button>
              <button
                type="button"
                onClick={() => runDemoFallbackPipeline(true)}
                className="px-3 py-1.5 rounded-xl bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-ink)] font-semibold"
              >
                Use Demo Fallback
              </button>
              {aiErrorMessage && (
                <button
                  type="button"
                  onClick={dismissAiError}
                  className="text-[11px] font-semibold underline px-1"
                >
                  Dismiss
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Live Adaptation Alert Banner */}
      {adaptationBanner && (
        <div
          role="status"
          className="rounded-2xl bg-[var(--sp-secondary-soft)] border border-[var(--sp-secondary)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--sp-secondary)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-[var(--sp-ink)] leading-relaxed">
              <strong className="block text-[var(--sp-secondary)]">
                Live Roadmap Adaptation Executed
              </strong>
              <span>{adaptationBanner}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissAdaptationBanner}
            className="text-xs font-semibold underline shrink-0 self-end sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}

      {questMessage && (
        <div
          role="status"
          className="rounded-2xl bg-[var(--sp-accent-soft)] border border-[var(--sp-accent)] px-5 py-3 flex items-center justify-between gap-4 text-sm text-[var(--sp-ink)]"
        >
          <span>{questMessage}</span>
          <button
            type="button"
            onClick={() => setQuestMessage(null)}
            className="text-xs font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================================
          CAREER MATCHING + TRANSPARENT READINESS SCORE DERIVATION
          ===================================================================== */}
      <section
        aria-label="Career matching and readiness derivation"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
              Career Matching & Readiness Derivation ({matchingOut.roleTitle})
            </h2>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5 leading-relaxed">
              {matchingOut.scoreFormulaExplanation}
            </p>
          </div>
          <span className="font-mono text-lg font-semibold tabular-nums px-3.5 py-1.5 rounded-xl bg-[var(--sp-accent-soft)] text-[var(--sp-accent)] shrink-0">
            Score: {matchingOut.readinessScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
            <span className="text-xs font-semibold text-[var(--sp-accent)] block">
              Matched Role Skills ({matchingOut.matchedSkills.length})
            </span>
            <p className="text-sm font-medium text-[var(--sp-ink)] mt-1">
              {matchingOut.matchedSkills.join(', ') || 'None yet'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
            <span className="text-xs font-semibold text-[var(--sp-secondary)] block">
              Partial / Needs Verification or Revision ({matchingOut.partialSkills.length})
            </span>
            <p className="text-sm font-medium text-[var(--sp-ink)] mt-1">
              {matchingOut.partialSkills.join(', ') || 'None'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
            <span className="text-xs font-semibold text-[var(--sp-danger)] block">
              Missing Target Skills ({matchingOut.missingSkills.length})
            </span>
            <p className="text-sm font-medium text-[var(--sp-ink)] mt-1">
              {matchingOut.missingSkills.join(', ') || 'None — ready for capstone!'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--sp-border)] text-[var(--sp-ink-muted)]">
                <th className="py-2 pr-3 font-semibold">Required Skill</th>
                <th className="py-2 pr-3 font-semibold">Weight</th>
                <th className="py-2 pr-3 font-semibold">Effective / Target</th>
                <th className="py-2 pr-3 font-semibold">Verification Status</th>
                <th className="py-2 text-right font-semibold">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sp-border)]">
              {matchingOut.scoreDerivation.map((row) => (
                <tr key={row.skillName}>
                  <td className="py-2.5 pr-3 font-semibold text-[var(--sp-ink)]">{row.skillName}</td>
                  <td className="py-2.5 pr-3 font-mono tabular-nums text-[var(--sp-ink-muted)]">
                    {row.weight}%
                  </td>
                  <td className="py-2.5 pr-3 font-mono tabular-nums text-[var(--sp-ink)]">
                    {row.effectiveLevel} / {row.requiredLevel}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--sp-ink-muted)]">{row.verificationTag}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-[var(--sp-accent)]">
                    {row.pointsEarned} / {row.maxPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          SKILL ANALYSIS (SELF-REPORTED VS ASSESSMENT-VERIFIED) + SKILL CHECK
          ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Skill analysis self-reported versus verified"
          className="xl:col-span-7 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--sp-accent)]" aria-hidden="true" />
                <span>Skill Analysis: Self-Reported vs. Assessment-Verified</span>
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                {analystOut.credentialsSummary}{' '}
                <button
                  type="button"
                  onClick={() => setActivePage('settings')}
                  className="text-[var(--sp-accent)] font-semibold hover:underline"
                >
                  Edit skills, certs & projects in Settings →
                </button>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--sp-accent-soft)] border border-[var(--sp-border)]">
              <span className="font-semibold text-[var(--sp-accent)] block">
                Strengths ({analystOut.strengths.length})
              </span>
              <ul className="mt-1.5 space-y-1 text-[var(--sp-ink)]">
                {analystOut.strengths.map((s) => (
                  <li key={s.skillName}>
                    • <strong>{s.skillName}</strong> ({s.effectiveLevel}/5)
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--sp-secondary-soft)] border border-[var(--sp-border)]">
              <span className="font-semibold text-[var(--sp-secondary)] block">
                Weaknesses / Unverified ({analystOut.weaknesses.length})
              </span>
              <ul className="mt-1.5 space-y-1 text-[var(--sp-ink)]">
                {analystOut.weaknesses.map((w) => (
                  <li key={w.skillName}>
                    • <strong>{w.skillName}</strong> ({w.effectiveLevel}/5)
                  </li>
                ))}
                {analystOut.weaknesses.length === 0 && <li>• None flagged</li>}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--sp-danger-soft)] border border-[var(--sp-border)]">
              <span className="font-semibold text-[var(--sp-danger)] block">
                Missing Skills ({analystOut.missingSkills.length})
              </span>
              <ul className="mt-1.5 space-y-1 text-[var(--sp-ink)]">
                {analystOut.missingSkills.map((m) => (
                  <li key={m}>• {m} (0/5)</li>
                ))}
                {analystOut.missingSkills.length === 0 && <li>• Zero missing requirements</li>}
              </ul>
            </div>
          </div>

          <div className="space-y-2.5">
            {analystOut.comparisons.map((comp) => (
              <div
                key={comp.skillName}
                className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--sp-ink)]">{comp.skillName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        comp.verificationStatus === 'verified'
                          ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                          : comp.verificationStatus === 'needs-revision'
                            ? 'bg-[var(--sp-danger-soft)] text-[var(--sp-danger)]'
                            : comp.verificationStatus === 'self-reported-only'
                              ? 'bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)]'
                              : 'bg-[var(--sp-canvas)] border border-[var(--sp-border)] text-[var(--sp-ink-muted)]'
                      }`}
                    >
                      {comp.verificationStatus === 'verified'
                        ? 'Assessment-Verified'
                        : comp.verificationStatus === 'needs-revision'
                          ? 'Needs Revision (Assessed < 60%)'
                          : comp.verificationStatus === 'self-reported-only'
                            ? 'Self-Reported Only'
                            : 'Missing'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--sp-ink-muted)] mt-1">{comp.discrepancyNote}</p>
                </div>

                <div className="text-right font-mono text-xs tabular-nums shrink-0">
                  <span className="block text-[var(--sp-ink)]">
                    Self: {comp.selfReportedLevel}/5
                  </span>
                  <span className="block text-[var(--sp-accent)] font-semibold">
                    Verified: {comp.verifiedLevel !== null ? `${comp.verifiedLevel}/5` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Graded Skill Assessment */}
        <section
          aria-label="Interactive skill check assessment"
          className="xl:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[var(--sp-secondary)]" aria-hidden="true" />
                <span>Skill Verification Check</span>
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                Verifies mastery cleanly. Scoring below 60% triggers Progress Evaluator → Learning Planner adaptation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ASSESSMENT_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  setQuizSkill(skill);
                  setQuizAnswers({});
                  setQuizFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  quizSkill === skill
                    ? 'bg-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                    : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          <form onSubmit={handleGradeQuiz} className="space-y-3.5">
            {currentQuestions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] space-y-2"
              >
                <p className="text-xs font-semibold text-[var(--sp-ink)] leading-snug">
                  {qIdx + 1}. {q.prompt}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const checked = quizAnswers[q.id] === optIdx;
                    return (
                      <label
                        key={opt}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                          checked
                            ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)] text-[var(--sp-ink)]'
                            : 'bg-[var(--sp-canvas)] border-[var(--sp-border)] text-[var(--sp-ink-muted)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={checked}
                          onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                          className="mt-0.5 accent-[var(--sp-accent)]"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold hover:opacity-95"
              >
                Submit {quizSkill} Assessment
              </button>
              <button
                type="button"
                onClick={handleScenarioAPoorReact}
                className="px-3 py-2 rounded-xl border border-[var(--sp-danger)]/40 text-[var(--sp-danger)] text-xs font-semibold hover:bg-[var(--sp-danger-soft)]"
              >
                Simulate Poor React Score (25%)
              </button>
            </div>
          </form>

          {quizFeedback && (
            <div
              role="status"
              className="p-3 rounded-xl bg-[var(--sp-secondary-soft)] border border-[var(--sp-secondary)] text-xs text-[var(--sp-ink)] leading-relaxed"
            >
              {quizFeedback}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================================
          4-AGENT COLLABORATION INSPECTOR (TRANSPARENT INPUT/OUTPUT/HANDOFF)
          ===================================================================== */}
      <section
        aria-label="Four-agent collaboration pipeline"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[var(--sp-border)]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
                <Bot className="w-5 h-5 text-[var(--sp-accent)]" aria-hidden="true" />
                <span>Multi-Agent Collaboration Pipeline</span>
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                  agentPipelineRun.executionMode === 'live-gemini'
                    ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                    : agentPipelineRun.executionMode === 'error'
                      ? 'bg-[var(--sp-danger-soft)] text-[var(--sp-danger)]'
                      : 'bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)]'
                }`}
              >
                {agentPipelineRun.modeBanner}
              </span>
            </div>
            <p className="text-xs text-[var(--sp-ink-muted)] mt-1">
              {agentPipelineRun.executedAtLabel} · Four specialist agents chained sequentially with structured JSON inputs, outputs, and inter-agent handoffs.
            </p>
          </div>
          <button
            type="button"
            disabled={pipelineLoading}
            onClick={() => void rerunAgentPipeline(true)}
            className="px-3.5 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold inline-flex items-center gap-1.5 self-start lg:self-auto disabled:opacity-60"
          >
            {pipelineLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{pipelineLoading ? pipelineProgressLabel ?? 'Executing Pipeline...' : 'Re-Run Pipeline'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {agentPipelineRun.traces.map((trace) => {
            const expanded = expandedAgentId === trace.agentId;
            const statusBadge =
              trace.executionStatus === 'live-gemini'
                ? `Live Gemini${trace.latencyMs ? ` · ${trace.latencyMs}ms` : ''}`
                : trace.executionStatus === 'error'
                  ? 'API Error'
                  : 'Demo Fallback';
            return (
              <div
                key={trace.agentId}
                className="p-4 rounded-2xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[var(--sp-ink)]">{trace.agentName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 tabular-nums ${
                        trace.executionStatus === 'live-gemini'
                          ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-accent)]'
                          : trace.executionStatus === 'error'
                            ? 'bg-[var(--sp-danger-soft)] text-[var(--sp-danger)]'
                            : 'bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[var(--sp-secondary)]'
                      }`}
                    >
                      {statusBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--sp-ink-muted)] leading-relaxed">
                    {trace.responsibility}
                  </p>
                  <div className="p-2.5 rounded-xl bg-[var(--sp-canvas)] border border-[var(--sp-border)] text-[11px] space-y-1.5">
                    <div>
                      <span className="font-semibold text-[var(--sp-ink-muted)] block">Input:</span>
                      <span className="text-[var(--sp-ink)]">{trace.inputSummary}</span>
                    </div>
                    <div className="pt-1 border-t border-[var(--sp-border)]">
                      <span className="font-semibold text-[var(--sp-accent)] block">Output:</span>
                      <span className="text-[var(--sp-ink)] font-medium">{trace.outputSummary}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--sp-border)]">
                  <p className="text-[11px] font-medium text-[var(--sp-secondary)] flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>Handoff → {trace.handoffTo}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpandedAgentId(expanded ? null : trace.agentId)}
                    className="text-[11px] font-semibold text-[var(--sp-accent)] hover:underline"
                  >
                    {expanded ? 'Hide Structured Payload' : 'Inspect Structured Input / Output'}
                  </button>
                  {expanded && (
                    <pre className="p-2 rounded-lg bg-[var(--sp-canvas)] border border-[var(--sp-border)] text-[10px] font-mono overflow-x-auto max-h-48 text-[var(--sp-ink)]">
                      {JSON.stringify({ input: trace.input, output: trace.output }, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-[var(--sp-accent-soft)] border border-[var(--sp-accent)] flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--sp-accent)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs sm:text-sm text-[var(--sp-ink)] leading-relaxed">
            <strong className="block text-[var(--sp-accent)]">
              Final Combined Pipeline Recommendation
            </strong>
            <span>{agentPipelineRun.finalCombinedRecommendation}</span>
            {evaluatorOut.requestedChanges && evaluatorOut.requestedChanges.length > 0 && (
              <div className="mt-1.5 text-xs text-[var(--sp-danger)] font-medium">
                Evaluator Feedback → Learning Planner:{' '}
                {evaluatorOut.requestedChanges.join(' · ')}
              </div>
            )}
            {evaluatorOut.recommendedActions.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--sp-ink-muted)]">
                {evaluatorOut.recommendedActions.map((act) => (
                  <li key={act}>• {act}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          ORDERED LEARNING PATHWAY & GAP-LINKED RESOURCES
          ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Interactive learning pathway"
          className="xl:col-span-7 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
                Personalised Learning Roadmap
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                {plannerOut.plannerSummary}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              {(['all', 'active', 'completed', 'upcoming'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    statusFilter === f
                      ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)] shadow-xs'
                      : 'text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredModules.map((mod, idx) => {
              const isSelected = selectedModule && mod.id === selectedModule.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                    isSelected
                      ? 'bg-[var(--sp-accent-soft)] border-[var(--sp-accent)]'
                      : mod.isAdaptationInserted
                        ? 'bg-[var(--sp-secondary-soft)] border-[var(--sp-secondary)]'
                        : 'bg-[var(--sp-canvas)] border-[var(--sp-border)] hover:bg-[var(--sp-surface-muted)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sp-ink-muted)] tabular-nums">
                        <span>
                          0{idx + 1}. {mod.phase} · {mod.estimatedHours}h ·{' '}
                          <span className="capitalize font-medium text-[var(--sp-ink)]">{mod.status}</span>
                        </span>
                        {mod.targetSkillGap && (
                          <span className="px-2 py-0.5 rounded bg-[var(--sp-surface)] border border-[var(--sp-border)] text-[10px] font-semibold text-[var(--sp-ink)]">
                            Gap: {mod.targetSkillGap}
                          </span>
                        )}
                        {mod.isAdaptationInserted && (
                          <span className="px-2 py-0.5 rounded bg-[var(--sp-danger-soft)] text-[var(--sp-danger)] text-[10px] font-semibold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                            <span>Adapted Revision Inserted</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[var(--sp-ink)] mt-1">
                        {mod.title}
                      </h3>
                    </div>
                    <span className="font-mono text-sm font-semibold tabular-nums text-[var(--sp-accent)] shrink-0">
                      {mod.progressPct}%
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--sp-surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--sp-accent)]"
                      style={{ width: `${mod.progressPct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Module Inspector, Courses, Tutorials & Practical Exercises */}
        {selectedModule && (
          <section
            aria-label="Selected module details"
            className="xl:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-5"
          >
            <div>
              <p className="text-xs text-[var(--sp-secondary)] font-medium">
                {selectedModule.phase} · {selectedModule.estimatedHours} estimated hours
                {selectedModule.targetSkillGap ? ` · Closes: ${selectedModule.targetSkillGap}` : ''}
              </p>
              <h2 className="font-display text-2xl font-semibold text-[var(--sp-ink)] mt-1">
                {selectedModule.title}
              </h2>
              <p className="text-sm text-[var(--sp-ink-muted)] mt-2 leading-relaxed">
                {selectedModule.description}
              </p>
              {selectedModule.adaptationReason && (
                <p className="text-xs text-[var(--sp-danger)] font-medium mt-2">
                  Adaptation Trigger: {selectedModule.adaptationReason}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[var(--sp-secondary-soft)] border border-[var(--sp-border)] space-y-2.5">
              <span className="text-xs font-semibold text-[var(--sp-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Practical Project / Quest</span>
              </span>
              <p className="text-sm font-medium text-[var(--sp-ink)]">{selectedModule.questTitle}</p>
              <button
                type="button"
                onClick={() => handleLaunchQuest(selectedModule.questTitle, selectedModule.id)}
                className="px-3.5 py-2 rounded-xl bg-[var(--sp-secondary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Quest as Today Microtask</span>
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--sp-ink-muted)]">
                Courses, Tutorials & Gap-Linked Resources
              </h3>
              {selectedModule.resources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-[var(--sp-ink)] block truncate">
                      {res.title}
                    </span>
                    <span className="text-[11px] text-[var(--sp-ink-muted)]">
                      {res.type} · {res.duration}
                      {res.linkedSkill ? ` · Skill: ${res.linkedSkill}` : ''}
                    </span>
                  </div>
                  <BookOpen className="w-4 h-4 text-[var(--sp-ink-muted)] shrink-0" aria-hidden="true" />
                </div>
              ))}
            </div>

            {selectedModule.exercises && selectedModule.exercises.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--sp-border)]">
                <h3 className="text-xs font-semibold text-[var(--sp-ink-muted)] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Practical Exercises</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[var(--sp-ink)]">
                  {selectedModule.exercises.map((ex) => (
                    <li
                      key={ex}
                      className="p-2.5 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]"
                    >
                      • {ex}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {moduleTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--sp-border)]">
                <h3 className="text-xs font-semibold text-[var(--sp-ink-muted)]">Linked Microtasks</h3>
                {moduleTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 text-xs py-1.5">
                    <span
                      className={
                        t.completed
                          ? 'line-through text-[var(--sp-ink-muted)]'
                          : 'text-[var(--sp-ink)]'
                      }
                    >
                      {t.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => openTaskInFocusStudio(t.id)}
                      className="text-[var(--sp-accent)] font-semibold hover:underline shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Focus</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Gap-to-Resource Direct Mapping Table */}
      <section
        aria-label="Resources linked to individual skill gaps"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
      >
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
            Resources Linked Directly to Individual Skill Gaps
          </h2>
          <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
            Every recommendation below maps 1-to-1 to a missing or flagged skill from your Career Matching report.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plannerOut.gapToResourceMap.map((item) => (
            <div
              key={item.skillGap}
              className="p-4 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)] space-y-2 text-xs"
            >
              <span className="px-2 py-0.5 rounded bg-[var(--sp-accent-soft)] text-[var(--sp-accent)] font-semibold inline-block">
                Gap: {item.skillGap}
              </span>
              <p className="font-semibold text-[var(--sp-ink)]">{item.courseOrTutorial}</p>
              <p className="text-[var(--sp-ink-muted)]">
                <strong>Exercise:</strong> {item.practicalExercise}
              </p>
              <p className="text-[var(--sp-secondary)] font-medium">
                <strong>Project:</strong> {item.projectDeliverable}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestone Schedule + Research Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="Milestone schedule"
          className="lg:col-span-5 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)] flex items-center gap-2">
            <Flag className="w-4 h-4 text-[var(--sp-warm)]" aria-hidden="true" />
            <span>Milestone Schedule</span>
          </h2>

          <div className="space-y-2.5">
            {milestones.map((ms) => (
              <button
                key={ms.id}
                type="button"
                onClick={() => toggleMilestone(ms.id)}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-[var(--sp-surface-muted)] hover:opacity-90 transition-opacity text-left"
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    ms.completed
                      ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                      : 'border-[var(--sp-border)] bg-[var(--sp-surface)]'
                  }`}
                >
                  {ms.completed && <Check className="w-3 h-3" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-sm font-medium block ${
                      ms.completed
                        ? 'line-through text-[var(--sp-ink-muted)]'
                        : 'text-[var(--sp-ink)]'
                    }`}
                  >
                    {ms.title}
                  </span>
                  <span className="text-xs text-[var(--sp-ink-muted)] mt-0.5 block">
                    {ms.targetWeek}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section
          aria-label="Research archive"
          className="lg:col-span-7 rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--sp-ink)]">
                Learning & Architecture Reading Archive
              </h2>
              <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5">
                Core papers & literature notes tied to calm learning design.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              <button
                type="button"
                onClick={() => setPaperFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  paperFilter === 'all'
                    ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)]'
                    : 'text-[var(--sp-ink-muted)]'
                }`}
              >
                All ({papers.length})
              </button>
              <button
                type="button"
                onClick={() => setPaperFilter('bookmarked')}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  paperFilter === 'bookmarked'
                    ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)]'
                    : 'text-[var(--sp-ink-muted)]'
                }`}
              >
                Bookmarked ({papers.filter((p) => p.bookmarked).length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-[var(--sp-border)]">
            {visiblePapers.map((paper) => (
              <div key={paper.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
                      {paper.authors} · {paper.year} · {paper.topic}
                    </p>
                    <h3 className="text-sm font-semibold text-[var(--sp-ink)] mt-0.5">
                      {paper.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePaperRead(paper.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        paper.read
                          ? 'bg-[var(--sp-accent-soft)] text-[var(--sp-ink)]'
                          : 'bg-[var(--sp-surface-muted)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                      }`}
                    >
                      {paper.read ? 'Read' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePaperBookmark(paper.id)}
                      aria-label={paper.bookmarked ? 'Remove bookmark' : 'Bookmark paper'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        paper.bookmarked
                          ? 'bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)]'
                          : 'text-[var(--sp-ink-muted)] hover:bg-[var(--sp-surface-muted)]'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--sp-ink-muted)] leading-relaxed">{paper.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
