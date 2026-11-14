import {
  CAREER_ROLES,
  SKILL_CURRICULUM_LIBRARY,
  getCareerRoleById,
} from '../data/careerRoles';
import {
  AgentPipelineResult,
  CareerMatchingOutput,
  CareerRoleId,
  CertificationRecord,
  LearningPlannerOutput,
  MentorMessage,
  ProgressEvaluatorOutput,
  ProjectRecord,
  RoadmapModule,
  ScoreDerivationRow,
  SkillAnalystOutput,
  SkillAssessmentRecord,
  SkillChangeRecord,
  SkillRecord,
  SkillVerificationComparison,
  StudentProfile,
} from '../types';

export const DEMO_AGENT_MODE_LABEL =
  'Demo Agent (Deterministic Specialist Function — Live Gemini API key not configured)';

const normalizeName = (name: string) => name.trim().toLowerCase();

export const findMatchingLearnerSkill = (
  reqSkillName: string,
  aliases: string[] | undefined,
  learnerSkills: SkillRecord[]
): SkillRecord | undefined => {
  const candidates = [reqSkillName, ...(aliases ?? [])].map(normalizeName);
  return learnerSkills.find((s) => candidates.includes(normalizeName(s.name)));
};

/**
 * Effective skill rule distinguishing self-reported vs assessment-verified skills:
 * - If assessment-verified: verifiedLevel is authoritative (assessment overrides optimistic self-rating,
 *   or validates higher mastery when verified >= self-reported).
 * - If self-reported only (not yet verified): capped at 75% weight/credit for readiness scoring
 *   and explicitly flagged as 'self-reported-only'.
 */
export const computeEffectiveSkillLevel = (
  skill: SkillRecord | undefined
): {
  effectiveLevel: number;
  status: SkillVerificationComparison['verificationStatus'];
  discrepancyNote: string;
} => {
  if (!skill || (skill.selfReportedLevel === 0 && skill.verifiedLevel === undefined)) {
    return {
      effectiveLevel: 0,
      status: 'missing',
      discrepancyNote: 'Not in learner profile yet (0/5).',
    };
  }

  if (skill.verifiedLevel !== undefined) {
    if (skill.lastAssessedScore !== undefined && skill.lastAssessedScore < 60) {
      return {
        effectiveLevel: skill.verifiedLevel,
        status: 'needs-revision',
        discrepancyNote: `Assessment scored ${skill.lastAssessedScore}% (verified level ${skill.verifiedLevel}/5 vs. self-reported ${skill.selfReportedLevel}/5) — flagged for revision.`,
      };
    }
    const effective = skill.verifiedLevel;
    const gap = skill.selfReportedLevel - skill.verifiedLevel;
    return {
      effectiveLevel: effective,
      status: 'verified',
      discrepancyNote:
        gap > 0
          ? `Assessment verified at ${effective}/5 (${skill.lastAssessedScore ?? 0}%); self-reported was ${skill.selfReportedLevel}/5.`
          : `Verified by assessment (${skill.lastAssessedScore ?? 0}%, level ${effective}/5).`,
    };
  }

  // Self-reported only (unverified)
  return {
    effectiveLevel: skill.selfReportedLevel,
    status: 'self-reported-only',
    discrepancyNote: `Self-reported at ${skill.selfReportedLevel}/5 (unverified — take a skill check to verify; counted at 75% confidence in readiness score).`,
  };
};

// ============================================================================
// AGENT A: Skill Analyst Agent
// ============================================================================
export interface SkillAnalystInput {
  learnerName: string;
  targetRoleId: CareerRoleId;
  skills: SkillRecord[];
  certifications: CertificationRecord[];
  projects: ProjectRecord[];
  assessments: SkillAssessmentRecord[];
}

export function runSkillAnalystAgent(input: SkillAnalystInput): SkillAnalystOutput {
  const role = getCareerRoleById(input.targetRoleId);
  const comparisons: SkillVerificationComparison[] = [];
  const strengths: SkillAnalystOutput['strengths'] = [];
  const weaknesses: SkillAnalystOutput['weaknesses'] = [];
  const missingSkills: string[] = [];

  // 1. Analyze every skill currently on learner profile
  const coveredLearnerIds = new Set<string>();

  for (const req of role.requirements) {
    const match = findMatchingLearnerSkill(req.skillName, req.aliases, input.skills);
    if (match) coveredLearnerIds.add(match.id);
    const evaluated = computeEffectiveSkillLevel(match);

    comparisons.push({
      skillName: match ? match.name : req.skillName,
      kind: req.kind,
      selfReportedLevel: match?.selfReportedLevel ?? 0,
      verifiedLevel: match?.verifiedLevel ?? null,
      effectiveLevel: evaluated.effectiveLevel,
      verificationStatus: evaluated.status,
      discrepancyNote: evaluated.discrepancyNote,
    });

    if (evaluated.status === 'missing') {
      missingSkills.push(req.skillName);
    } else if (evaluated.status === 'needs-revision') {
      weaknesses.push({
        skillName: match?.name ?? req.skillName,
        effectiveLevel: evaluated.effectiveLevel,
        reason: evaluated.discrepancyNote,
      });
    } else if (evaluated.effectiveLevel >= req.requiredLevel) {
      strengths.push({
        skillName: match?.name ?? req.skillName,
        effectiveLevel: evaluated.effectiveLevel,
        evidence:
          evaluated.status === 'verified'
            ? `Assessment-verified (${match?.lastAssessedScore ?? 75}%)`
            : `Self-reported ${evaluated.effectiveLevel}/5 (recommend quick verification)`,
      });
    } else {
      weaknesses.push({
        skillName: match?.name ?? req.skillName,
        effectiveLevel: evaluated.effectiveLevel,
        reason:
          evaluated.status === 'self-reported-only'
            ? `At ${evaluated.effectiveLevel}/${req.requiredLevel} (unverified self-rating); needs bridge practice for ${role.title}.`
            : `Verified at ${evaluated.effectiveLevel}/${req.requiredLevel}; below target role threshold.`,
      });
    }
  }

  // Also preserve extra profile skills outside current target role in comparisons
  for (const s of input.skills) {
    if (coveredLearnerIds.has(s.id)) continue;
    const evaluated = computeEffectiveSkillLevel(s);
    comparisons.push({
      skillName: s.name,
      kind: s.kind,
      selfReportedLevel: s.selfReportedLevel,
      verifiedLevel: s.verifiedLevel ?? null,
      effectiveLevel: evaluated.effectiveLevel,
      verificationStatus: evaluated.status,
      discrepancyNote: evaluated.discrepancyNote,
    });
    if (evaluated.status === 'needs-revision') {
      weaknesses.push({
        skillName: s.name,
        effectiveLevel: evaluated.effectiveLevel,
        reason: evaluated.discrepancyNote,
      });
    } else if (evaluated.effectiveLevel >= 3) {
      strengths.push({
        skillName: s.name,
        effectiveLevel: evaluated.effectiveLevel,
        evidence:
          evaluated.status === 'verified'
            ? `Assessment-verified transferable skill (${s.lastAssessedScore ?? 75}%)`
            : 'Self-reported transferable skill',
      });
    }
  }

  const earnedCerts = input.certifications.filter((c) => c.status === 'Earned').length;
  const credentialsSummary = `${earnedCerts} earned certification(s), ${input.projects.length} applied project(s), ${input.assessments.length} graded skill check(s).`;

  return {
    strengths,
    weaknesses,
    missingSkills,
    comparisons,
    credentialsSummary,
  };
}

// ============================================================================
// AGENT B: Career Matching Agent
// ============================================================================
export function runCareerMatchingAgent(
  analystOutput: SkillAnalystOutput,
  targetRoleId: CareerRoleId,
  learnerSkills: SkillRecord[]
): CareerMatchingOutput {
  const role = getCareerRoleById(targetRoleId);
  const matchedSkills: string[] = [];
  const partialSkills: string[] = [];
  const missingSkills: string[] = [];
  const scoreDerivation: ScoreDerivationRow[] = [];

  let totalEarnedPoints = 0;

  for (const req of role.requirements) {
    const match = findMatchingLearnerSkill(req.skillName, req.aliases, learnerSkills);
    const evaluated = computeEffectiveSkillLevel(match);
    const ratio = Math.min(1, evaluated.effectiveLevel / Math.max(1, req.requiredLevel));

    // Verified skills receive 100% trust multiplier; self-reported-only skills receive 75% trust multiplier
    const verificationMultiplier =
      evaluated.status === 'verified'
        ? 1.0
        : evaluated.status === 'needs-revision'
          ? 0.8
          : evaluated.status === 'self-reported-only'
            ? 0.75
            : 0;

    const pointsEarned = Math.round(req.weight * ratio * verificationMultiplier * 10) / 10;
    totalEarnedPoints += pointsEarned;

    const verificationTag =
      evaluated.status === 'verified'
        ? 'Verified (1.0x)'
        : evaluated.status === 'needs-revision'
          ? 'Revision Needed (0.8x)'
          : evaluated.status === 'self-reported-only'
            ? 'Self-Reported (0.75x cap)'
            : 'Missing (0x)';

    scoreDerivation.push({
      skillName: req.skillName,
      weight: req.weight,
      requiredLevel: req.requiredLevel,
      effectiveLevel: evaluated.effectiveLevel,
      verificationTag,
      pointsEarned,
      maxPoints: req.weight,
    });

    if (evaluated.status === 'missing') {
      missingSkills.push(req.skillName);
    } else if (evaluated.status === 'needs-revision' || ratio < 1) {
      partialSkills.push(req.skillName);
    } else {
      matchedSkills.push(req.skillName);
    }
  }

  const readinessScore = Math.min(100, Math.round(totalEarnedPoints));
  const scoreFormulaExplanation =
    'Readiness Score = Σ [ Skill Weight × min(1, Effective Level / Required Level) × Verification Multiplier (1.0× assessment-verified, 0.75× unverified self-reported, 0.8× revision-flagged) ].';

  return {
    roleId: role.id,
    roleTitle: role.title,
    matchedSkills,
    partialSkills,
    missingSkills,
    readinessScore,
    scoreFormulaExplanation,
    scoreDerivation,
  };
}

// ============================================================================
// AGENT D: Progress Evaluator Agent
// ============================================================================
export function runProgressEvaluatorAgent(
  assessments: SkillAssessmentRecord[],
  modules: RoadmapModule[],
  analystOutput: SkillAnalystOutput
): ProgressEvaluatorOutput {
  const avgAssessmentPct =
    assessments.length > 0
      ? Math.round(assessments.reduce((acc, a) => acc + a.pct, 0) / assessments.length)
      : null;

  const roadmapCompletionPct =
    modules.length > 0
      ? Math.round(modules.reduce((acc, m) => acc + m.progressPct, 0) / modules.length)
      : 0;

  // Detect any skill where the latest assessment was below 60%
  const latestBySkill = new Map<string, SkillAssessmentRecord>();
  for (const record of assessments) {
    if (!latestBySkill.has(record.skillName)) {
      latestBySkill.set(record.skillName, record);
    }
  }

  const detectedRegressionSkills: string[] = [];
  for (const [skillName, record] of latestBySkill.entries()) {
    if (record.pct < 60) {
      detectedRegressionSkills.push(skillName);
    }
  }

  // Also check analyst weaknesses caused by low assessments
  for (const w of analystOutput.weaknesses) {
    if (
      w.reason.toLowerCase().includes('flagged for revision') &&
      !detectedRegressionSkills.includes(w.skillName)
    ) {
      detectedRegressionSkills.push(w.skillName);
    }
  }

  const needsRoadmapAdjustment = detectedRegressionSkills.length > 0;

  const adjustmentReason = needsRoadmapAdjustment
    ? `Assessment check below 60% detected for ${detectedRegressionSkills.join(', ')}. Recommending immediate insertion of targeted revision & guided practice before advancing downstream modules.`
    : assessments.length > 0
      ? `Latest skill assessments average ${avgAssessmentPct}%. Current roadmap sequence remains well-calibrated.`
      : 'No post-onboarding quiz regressions detected yet; prioritize missing skills first.';

  const recommendedActions = needsRoadmapAdjustment
    ? [
        ...detectedRegressionSkills.map(
          (skill) => `Insert high-priority "${skill} Revision & Guided Practice Lab" at step #1`
        ),
        'Defer downstream integration capstone until revision exercises pass ≥ 70%',
      ]
    : [
        ...analystOutput.missingSkills.slice(0, 2).map((skill) => `Start core module for missing skill: ${skill}`),
        'Verify self-reported skills with quick 3-4 question checks to unlock 100% readiness credit',
      ];

  const requestedChanges = needsRoadmapAdjustment
    ? detectedRegressionSkills.map(
        (skill) => `Insert "${skill} Revision & Guided Practice Lab" at priority #1`
      )
    : [];

  return {
    needsRoadmapAdjustment,
    detectedRegressionSkills,
    averageAssessmentPct: avgAssessmentPct,
    roadmapCompletionPct,
    adjustmentReason,
    requestedChanges,
    recommendedActions,
  };
}

// ============================================================================
// AGENT C: Learning Planner Agent
// ============================================================================
export function runLearningPlannerAgent(
  matchingOutput: CareerMatchingOutput,
  evaluatorOutput: ProgressEvaluatorOutput
): LearningPlannerOutput {
  const role = getCareerRoleById(matchingOutput.roleId);
  const regressionSet = new Set(evaluatorOutput.detectedRegressionSkills.map(normalizeName));

  // Priority order:
  // 1. Regression/revision skills (from Progress Evaluator)
  // 2. Missing technical skills (in role requirement order)
  // 3. Partial / bridge technical skills needing level-up
  const orderedGaps: string[] = [];

  for (const regSkill of evaluatorOutput.detectedRegressionSkills) {
    if (!orderedGaps.includes(regSkill)) orderedGaps.push(regSkill);
  }
  for (const miss of matchingOutput.missingSkills) {
    if (!orderedGaps.includes(miss)) orderedGaps.push(miss);
  }
  for (const part of matchingOutput.partialSkills) {
    if (!orderedGaps.includes(part)) orderedGaps.push(part);
  }

  const generatedModules: RoadmapModule[] = [];
  const gapToResourceMap: LearningPlannerOutput['gapToResourceMap'] = [];

  // First add urgent Revision modules requested by Progress Evaluator
  evaluatorOutput.detectedRegressionSkills.forEach((skillName, idx) => {
    const entry = SKILL_CURRICULUM_LIBRARY[skillName];
    const modId = `mod-rev-${normalizeName(skillName).replace(/[^a-z0-9]/g, '-')}`;
    const revTitle = entry?.revisionModuleTitle ?? `${skillName} Revision & Guided Practice`;
    const revCourse = entry?.revisionCourse ?? `Targeted ${skillName} Revision Workshop`;
    const revExercises = entry?.revisionExercises ?? [
      `Complete 4 diagnostic debugging drills in ${skillName}`,
      `Build a small verified ${skillName} sandbox check`,
    ];

    generatedModules.push({
      id: modId,
      title: revTitle,
      phase: 'Revision',
      status: 'active',
      progressPct: 15,
      estimatedHours: 6,
      description: `Inserted automatically by Learning Planner after Progress Evaluator detected a low score in ${skillName}. Focus on mental models and hands-on drills before advancing.`,
      competencies: [skillName, 'Guided Remediation'],
      targetSkillGap: `${skillName} (Revision Triggered)`,
      exercises: revExercises,
      isAdaptationInserted: true,
      adaptationReason: `Low ${skillName} assessment score flagged by Progress Evaluator Agent.`,
      questTitle: `Complete ${skillName} Revision Drill #${idx + 1}`,
      resources: [
        {
          id: `${modId}-r1`,
          title: revCourse,
          type: 'Tutorial',
          duration: '45m',
          linkedSkill: skillName,
        },
        {
          id: `${modId}-r2`,
          title: revExercises[0],
          type: 'Exercise',
          duration: '30m',
          linkedSkill: skillName,
        },
      ],
    });

    gapToResourceMap.push({
      skillGap: `${skillName} (Revision)`,
      courseOrTutorial: revCourse,
      practicalExercise: revExercises[0],
      projectDeliverable: `Re-pass ${skillName} Skill Check ≥ 75%`,
    });
  });

  // Next build ordered modules for Missing & Partial role requirements
  const actionableSkills = [
    ...matchingOutput.missingSkills,
    ...matchingOutput.partialSkills.filter((s) => !regressionSet.has(normalizeName(s))),
  ];

  actionableSkills.forEach((skillName, idx) => {
    const entry = SKILL_CURRICULUM_LIBRARY[skillName];
    const isMissing = matchingOutput.missingSkills.includes(skillName);
    const modId = `mod-gap-${normalizeName(skillName).replace(/[^a-z0-9]/g, '-')}`;

    const courseTitle = entry?.courseTitle ?? `Course: ${skillName} Practical Foundations`;
    const tutorialTitle = entry?.tutorialTitle ?? `Tutorial: ${skillName} Hands-On Patterns`;
    const exercises = entry?.exercises ?? [
      `Complete guided ${skillName} practice worksheet`,
      `Verify core concepts in ${skillName} mini-lab`,
    ];
    const projectDeliverable =
      entry?.projectDeliverable ?? `${skillName} Applied Mini-Project`;

    generatedModules.push({
      id: modId,
      title: entry?.moduleTitle ?? `${skillName} Mastery Track`,
      phase: entry?.phase ?? (idx === 0 ? 'Foundations' : idx < 3 ? 'Core Methods' : 'Applied Systems'),
      status: idx === 0 && !evaluatorOutput.needsRoadmapAdjustment ? 'active' : idx < 2 ? 'active' : 'upcoming',
      progressPct: isMissing ? 0 : 45,
      estimatedHours: entry?.estimatedHours ?? 12,
      description:
        entry?.description ??
        `Structured learning module closing your ${skillName} gap for ${role.title}.`,
      competencies: [skillName, role.title],
      targetSkillGap: `${skillName} (${isMissing ? 'Missing Skill' : 'Bridge Gap'})`,
      exercises,
      questTitle: `Build: ${projectDeliverable}`,
      resources: [
        {
          id: `${modId}-course`,
          title: courseTitle,
          type: 'Course',
          duration: '3h',
          linkedSkill: skillName,
        },
        {
          id: `${modId}-tut`,
          title: tutorialTitle,
          type: 'Tutorial',
          duration: '40m',
          linkedSkill: skillName,
        },
        {
          id: `${modId}-proj`,
          title: projectDeliverable,
          type: 'Project',
          duration: '2.5h',
          linkedSkill: skillName,
        },
      ],
    });

    gapToResourceMap.push({
      skillGap: skillName,
      courseOrTutorial: courseTitle,
      practicalExercise: exercises[0],
      projectDeliverable,
    });
  });

  // Always include matched reinforcement / integration capstone at the end
  const capstoneId = `mod-capstone-${role.id}`;
  const matchedNote =
    matchingOutput.matchedSkills.length > 0
      ? `Combines your verified strengths (${matchingOutput.matchedSkills.join(', ')}) with newly closed skills (${orderedGaps.slice(0, 3).join(', ') || 'core stack'}).`
      : `Synthesizes core ${role.title} skills into a portfolio-ready artifact.`;

  generatedModules.push({
    id: capstoneId,
    title: `${role.title} Integration Capstone`,
    phase: 'Capstone',
    status: 'upcoming',
    progressPct: 0,
    estimatedHours: 20,
    description: matchedNote,
    competencies: role.requirements.slice(0, 4).map((r) => r.skillName),
    targetSkillGap: 'End-to-End Portfolio Synthesis',
    exercises: [
      `Design system architecture combining ${role.requirements.slice(0, 3).map((r) => r.skillName).join(' + ')}`,
      'Document architecture decisions and test cases in a clean README',
    ],
    questTitle: `Ship ${role.title} Capstone Repository`,
    resources: [
      {
        id: `${capstoneId}-r1`,
        title: `Project Brief: End-to-End ${role.title} Portfolio App`,
        type: 'Project',
        duration: '6h',
        linkedSkill: role.title,
      },
    ],
  });

  // Include completed/matched foundation module cleanly:
  // If an urgent adapted revision was inserted, place it BEFORE Verified Foundation so revision is step #1.
  if (matchingOutput.matchedSkills.length > 0) {
    const firstNonRevisionIdx = generatedModules.findIndex((m) => !m.isAdaptationInserted);
    const insertIdx = firstNonRevisionIdx === -1 ? generatedModules.length : firstNonRevisionIdx;
    generatedModules.splice(insertIdx, 0, {
      id: `mod-verified-${role.id}`,
      title: `Verified Foundation: ${matchingOutput.matchedSkills.join(' & ')}`,
      phase: 'Foundations',
      status: 'completed',
      progressPct: 100,
      estimatedHours: 0,
      description: `Already satisfied based on your existing profile (${matchingOutput.matchedSkills.join(', ')}). Skipped redundant intro lessons to keep focus on actual gaps.`,
      competencies: matchingOutput.matchedSkills,
      targetSkillGap: 'Strengths Leveraged (No Re-Work Needed)',
      exercises: ['Use existing projects to anchor upcoming integration modules'],
      questTitle: `Review ${matchingOutput.matchedSkills[0]} Quick Notes`,
      resources: [
        {
          id: `mod-verified-res`,
          title: `Leveraging ${matchingOutput.matchedSkills.join(' & ')} in ${role.title}`,
          type: 'Case Study',
          duration: '15m',
          linkedSkill: matchingOutput.matchedSkills[0],
        },
      ],
    });
  }

  const plannerSummary = evaluatorOutput.needsRoadmapAdjustment
    ? `Adapted roadmap: inserted priority revision for ${evaluatorOutput.detectedRegressionSkills.join(', ')} ahead of ${matchingOutput.missingSkills.join(', ') || 'capstone'}.`
    : `Generated ${generatedModules.length}-step ordered roadmap prioritizing missing skills: ${matchingOutput.missingSkills.join(' → ') || 'Capstone polish'}.`;

  return {
    orderedGapPriorities: orderedGaps,
    generatedModules,
    gapToResourceMap,
    plannerSummary,
  };
}

// ============================================================================
// FULL 4-AGENT COLLABORATION PIPELINE
// ============================================================================
export function runAgentCollaborationPipeline(params: {
  profile: StudentProfile;
  assessments: SkillAssessmentRecord[];
  currentModules?: RoadmapModule[];
}): AgentPipelineResult {
  const { profile, assessments, currentModules = [] } = params;
  const role = getCareerRoleById(profile.targetRoleId);

  // 1. Skill Analyst Agent
  const analystInput: SkillAnalystInput = {
    learnerName: profile.name,
    targetRoleId: profile.targetRoleId,
    skills: profile.skills,
    certifications: profile.certifications,
    projects: profile.projects,
    assessments,
  };
  const analystOutput = runSkillAnalystAgent(analystInput);

  // 2. Career Matching Agent
  const matchingInput = {
    targetRoleId: profile.targetRoleId,
    targetRoleTitle: role.title,
    strengthsCount: analystOutput.strengths.length,
    weaknessesCount: analystOutput.weaknesses.length,
    missingFromAnalyst: analystOutput.missingSkills,
  };
  const matchingOutput = runCareerMatchingAgent(
    analystOutput,
    profile.targetRoleId,
    profile.skills
  );

  // 3. Progress Evaluator Agent evaluates current assessments & determines if adaptation is needed
  const evaluatorInput = {
    recentAssessmentsCount: assessments.length,
    latestAssessment: assessments[0]
      ? `${assessments[0].skillName}: ${assessments[0].pct}%`
      : 'None yet',
    weaknessesDetected: analystOutput.weaknesses.map((w) => w.skillName),
  };
  const evaluatorOutput = runProgressEvaluatorAgent(
    assessments,
    currentModules,
    analystOutput
  );

  // 4. Learning Planner Agent constructs ordered roadmap using gaps + Progress Evaluator adjustments
  const plannerInput = {
    roleTitle: matchingOutput.roleTitle,
    missingSkills: matchingOutput.missingSkills,
    partialSkills: matchingOutput.partialSkills,
    regressionTriggers: evaluatorOutput.detectedRegressionSkills,
  };
  const plannerOutput = runLearningPlannerAgent(matchingOutput, evaluatorOutput);

  const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const finalCombinedRecommendation = evaluatorOutput.needsRoadmapAdjustment
    ? `ADAPTED PLAN (${role.title} · ${matchingOutput.readinessScore}% readiness): Because Progress Evaluator detected low assessment performance in ${evaluatorOutput.detectedRegressionSkills.join(', ')}, Learning Planner inserted urgent revision exercises before continuing ${matchingOutput.missingSkills.filter((s) => !evaluatorOutput.detectedRegressionSkills.includes(s)).join(', ') || 'integration capstone'}.`
    : `ROADMAP READY (${role.title} · ${matchingOutput.readinessScore}% readiness): Keep leveraging your existing strengths (${matchingOutput.matchedSkills.join(', ') || 'core foundations'}) and close missing skills in order: ${plannerOutput.orderedGapPriorities.join(' → ') || 'Capstone'}.`;

  return {
    runId: `run-demo-${Date.now()}`,
    executedAtLabel: `Executed at ${nowLabel}`,
    executionMode: 'demo-mode',
    geminiConfigured: false,
    modeBanner: DEMO_AGENT_MODE_LABEL,
    adaptationApplied: evaluatorOutput.needsRoadmapAdjustment,
    finalCombinedRecommendation,
    traces: [
      {
        agentId: 'skill-analyst',
        agentName: '1. Skill Analyst Agent',
        responsibility:
          'Analyses learner profile, certifications, projects & assessments; separates self-reported skills from assessment-verified evidence.',
        executionStatus: 'demo-fallback',
        modeLabel: DEMO_AGENT_MODE_LABEL,
        inputSummary: `${profile.skills.length} profile skills, ${profile.certifications.length} certs, ${profile.projects.length} projects, ${assessments.length} assessments`,
        outputSummary: `${analystOutput.strengths.length} strengths · ${analystOutput.weaknesses.length} weaknesses/unverified bridges · ${analystOutput.missingSkills.length} missing skills`,
        handoffTo: 'Career Matching Agent',
        input: analystInput,
        output: analystOutput,
      },
      {
        agentId: 'career-matching',
        agentName: '2. Career Matching Agent',
        responsibility:
          'Compares verified and self-reported skills against target role weights to compute an explainable readiness score.',
        executionStatus: 'demo-fallback',
        modeLabel: DEMO_AGENT_MODE_LABEL,
        inputSummary: `Skill Analyst profile for "${role.title}" (${role.requirements.length} benchmarks)`,
        outputSummary: `${matchingOutput.readinessScore}% readiness · Matched: [${matchingOutput.matchedSkills.join(', ') || 'None'}] · Missing: [${matchingOutput.missingSkills.join(', ') || 'None'}]`,
        handoffTo: 'Learning Planner Agent & Progress Evaluator Agent',
        input: matchingInput,
        output: matchingOutput,
      },
      {
        agentId: 'learning-planner',
        agentName: '3. Learning Planner Agent',
        responsibility:
          'Converts identified skill gaps & evaluator alerts into an ordered roadmap with courses, tutorials, practical exercises & projects.',
        executionStatus: 'demo-fallback',
        modeLabel: DEMO_AGENT_MODE_LABEL,
        inputSummary: `Gaps: [${matchingOutput.missingSkills.concat(matchingOutput.partialSkills).join(', ')}] · Adaptation flags: [${evaluatorOutput.detectedRegressionSkills.join(', ') || 'None'}]`,
        outputSummary: `${plannerOutput.generatedModules.length} ordered modules (${plannerOutput.gapToResourceMap.length} gap-to-resource links)`,
        handoffTo: 'Progress Evaluator Agent',
        input: plannerInput,
        output: plannerOutput,
      },
      {
        agentId: 'progress-evaluator',
        agentName: '4. Progress Evaluator Agent',
        responsibility:
          'Evaluates assessment results & roadmap completion; detects regressions (<60%) and signals roadmap adjustment.',
        executionStatus: 'demo-fallback',
        modeLabel: DEMO_AGENT_MODE_LABEL,
        inputSummary: `${assessments.length} assessment record(s) · Latest: ${evaluatorInput.latestAssessment}`,
        outputSummary: evaluatorOutput.needsRoadmapAdjustment
          ? `Adjustment Triggered (${evaluatorOutput.detectedRegressionSkills.join(', ')})`
          : `No regression detected · Recommend: ${evaluatorOutput.recommendedActions[0] ?? 'Continue sequence'}`,
        handoffTo: 'Final Learner Recommendation & Live Roadmap State',
        input: evaluatorInput,
        output: evaluatorOutput,
      },
    ],
  };
}

// ============================================================================
// GROUNDED AI MENTOR (Deterministic Workspace-Aware Mentor Engine)
// ============================================================================
export function generateMentorResponse(
  question: string,
  context: {
    profile: StudentProfile;
    pipeline: AgentPipelineResult;
    modules: RoadmapModule[];
    assessments: SkillAssessmentRecord[];
    skillHistory: SkillChangeRecord[];
    focusMinutesToday: number;
  }
): MentorMessage {
  const q = question.toLowerCase();
  const { profile, pipeline, modules, assessments, focusMinutesToday } = context;
  const analyst = pipeline.traces[0].output;
  const matching = pipeline.traces[1].output;
  const planner = pipeline.traces[2].output;
  const evaluator = pipeline.traces[3].output;

  const weaknessNames = analyst.weaknesses.map((w) => w.skillName);
  const nextActiveModule =
    modules.find((m) => m.status === 'active' && m.progressPct < 100) ?? modules[0];

  const suggestedActions: string[] = [];
  let text = '';

  if (q.includes('score') || q.includes('readiness') || q.includes('match') || q.includes('%')) {
    const topContrib = matching.scoreDerivation
      .filter((r) => r.pointsEarned > 0)
      .map((r) => `${r.skillName}: +${r.pointsEarned}/${r.maxPoints} pts (${r.verificationTag})`)
      .join('; ');
    const biggestMiss = matching.scoreDerivation
      .filter((r) => r.pointsEarned === 0)
      .map((r) => `${r.skillName} (${r.maxPoints} pts missing)`)
      .join(', ');

    text =
      `Your current readiness for **${matching.roleTitle}** is **${matching.readinessScore}%**. ` +
      `Points earned come from: ${topContrib || 'no matched skills yet'}. ` +
      (biggestMiss
        ? `The largest score gaps are ${biggestMiss}. `
        : 'You have baseline coverage across all required categories! ') +
      `Notice that unverified self-reported skills count at a 0.75x confidence cap until you pass a quick Skill Check.`;
    suggestedActions.push(
      `Verify a self-reported skill or start "${nextActiveModule?.title ?? 'Module 1'}"`,
      `Target ${matching.missingSkills[0] ?? matching.partialSkills[0] ?? 'capstone integration'} next for the fastest score gain`
    );
  } else if (
    q.includes('weak') ||
    q.includes('fail') ||
    q.includes('react') ||
    q.includes('revision') ||
    q.includes('low') ||
    q.includes('adapt')
  ) {
    const latestWeakAssessment = assessments.find((a) => a.pct < 60);
    if (latestWeakAssessment) {
      text =
        `Your Progress Evaluator flagged **${latestWeakAssessment.skillName}** after a **${latestWeakAssessment.pct}%** (${latestWeakAssessment.score}/${latestWeakAssessment.total}) assessment result. ` +
        `This lowered verified mastery to ${latestWeakAssessment.newVerifiedLevel}/5 and inserted a dedicated revision module at the top of your roadmap. ` +
        `Focus on ${planner.gapToResourceMap[0]?.practicalExercise ?? 'the guided revision drills'} before jumping ahead.`;
      suggestedActions.push(
        `Open "${nextActiveModule?.title}" in My Roadmap`,
        `Add "${nextActiveModule?.questTitle}" as a 20m Today microtask`
      );
    } else if (weaknessNames.length > 0) {
      const firstWeak = analyst.weaknesses[0];
      text =
        `Right now, your main growth/verification weaknesses are **${weaknessNames.join(', ')}**. ` +
        `Specifically, **${firstWeak.skillName}**: ${firstWeak.reason} ` +
        (matching.missingSkills.length > 0
          ? `Meanwhile, your completely missing target skills for ${matching.roleTitle} are ${matching.missingSkills.join(', ')}.`
          : '');
      suggestedActions.push(
        `Take a Skill Check assessment on Roadmap to convert self-reported skills to verified`,
        `Complete the exercises under "${nextActiveModule?.title}"`
      );
    } else {
      text =
        `You have no regression flags right now! Your existing verified skills (${analyst.strengths.map((s) => s.skillName).join(', ')}) give you a clean runway toward ${matching.roleTitle}.`;
      suggestedActions.push(`Move straight into ${matching.missingSkills[0] ?? 'your capstone'}`);
    }
  } else if (q.includes('next') || q.includes('study') || q.includes('plan') || q.includes('roadmap') || q.includes('project')) {
    const firstGap = planner.gapToResourceMap[0];
    text =
      `For **${profile.name}** aiming at **${matching.roleTitle}** (${matching.readinessScore}% ready): ` +
      (evaluator.needsRoadmapAdjustment
        ? `Progress Evaluator requires finishing **${evaluator.detectedRegressionSkills.join(', ')} revision** first. `
        : '') +
      `Your immediate next module is **"${nextActiveModule?.title ?? 'Next Module'}"** (${nextActiveModule?.estimatedHours ?? 10}h). ` +
      (firstGap
        ? `Start with *${firstGap.courseOrTutorial}*, practice *${firstGap.practicalExercise}*, and ship *${firstGap.projectDeliverable}*. `
        : '') +
      `You have logged ${focusMinutesToday} focus minutes today—a single 25-minute block will make visible progress.`;
    suggestedActions.push(
      `Launch "${nextActiveModule?.questTitle ?? 'Next Quest'}" into Today microtasks`,
      `Run a 2-minute starter timer in Focus Studio`
    );
  } else {
    text =
      `Looking at your live workspace for **${matching.roleTitle}** (**${matching.readinessScore}% readiness**): ` +
      `Strengths: ${analyst.strengths.map((s) => s.skillName).join(', ') || 'None verified yet'}. ` +
      `Missing skills: ${matching.missingSkills.join(', ') || 'None'}. ` +
      (weaknessNames.length > 0 ? `Watch areas: ${weaknessNames.join(', ')}. ` : '') +
      `${planner.plannerSummary} Ask me about your readiness score formula, specific weaknesses, or what to build next.`;
    suggestedActions.push(
      `Ask: "Why is my readiness score ${matching.readinessScore}%?"`,
      `Ask: "What should I study next for ${matching.roleTitle}?"`
    );
  }

  return {
    id: `mentor-${Date.now()}`,
    role: 'mentor',
    text,
    timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referencedWeaknesses: weaknessNames.length > 0 ? weaknessNames : matching.missingSkills,
    suggestedActions,
    executionStatus: 'demo-fallback',
  };
}

export const ALL_CAREER_ROLES = CAREER_ROLES;
