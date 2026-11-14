import {
  GoogleGenAI,
  ThinkingLevel,
  Type,
  type GenerateContentResponse,
  type Schema,
} from '@google/genai';
import { CAREER_ROLES, getCareerRoleById } from '../src/data/careerRoles.ts';
import type {
  ADHDPreferences,
  AgentPipelineResult,
  AgentTrace,
  CareerMatchingOutput,
  CareerRoleDefinition,
  GeminiHealthStatus,
  LearningPlannerOutput,
  LearningPreferences,
  MentorMessage,
  ProgressEvaluatorOutput,
  RoadmapModule,
  ScoreDerivationRow,
  SkillAnalystOutput,
  SkillAssessmentRecord,
  SkillChangeRecord,
  SkillRecord,
  StudentProfile,
} from '../src/types.ts';

export const GEMINI_MODEL = 'gemini-4-hydrogen';
export const GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const MODEL_CANDIDATES = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL] as const;

export class GeminiConfigError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigError';
    this.statusCode = 503;
    this.code = 'GEMINI_NOT_CONFIGURED';
  }
}

export class GeminiUpstreamError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 502, code = 'GEMINI_API_ERROR') {
    super(message);
    this.name = 'GeminiUpstreamError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface AgentRunRequestPayload {
  profile: StudentProfile;
  assessments: SkillAssessmentRecord[];
  currentModules?: RoadmapModule[];
  learningPreferences?: LearningPreferences;
  adhdPreferences?: ADHDPreferences;
  focusMinutesToday?: number;
}

export type AgentStepName =
  | 'skill-analyst'
  | 'career-matching'
  | 'learning-planner'
  | 'progress-evaluator';

export interface AgentStepRequestPayload {
  step: AgentStepName;
  profile: StudentProfile;
  assessments: SkillAssessmentRecord[];
  currentModules?: RoadmapModule[];
  learningPreferences?: LearningPreferences;
  adhdPreferences?: ADHDPreferences;
  focusMinutesToday?: number;
  analystOutput?: SkillAnalystOutput;
  matchingOutput?: CareerMatchingOutput;
  plannerOutput?: LearningPlannerOutput;
  evaluatorOutput?: ProgressEvaluatorOutput | null;
}

export interface MentorChatRequestPayload {
  question: string;
  profile: StudentProfile;
  pipeline: AgentPipelineResult;
  modules: RoadmapModule[];
  assessments: SkillAssessmentRecord[];
  skillHistory: SkillChangeRecord[];
  focusMinutesToday: number;
  history?: { role: 'user' | 'mentor'; text: string }[];
}

export function getConfiguredApiKey(): string | null {
  const raw = process.env.GEMINI_API_KEY?.trim() ?? '';
  if (!raw || raw === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return raw;
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = getConfiguredApiKey();
  if (!apiKey) {
    throw new GeminiConfigError(
      'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in AI Studio Settings > Secrets (or Vercel Environment Variables) to enable live Gemini agents.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }
  return trimmed;
}

function isQuotaOrOverloadError(msg: string): boolean {
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('503') ||
    msg.includes('UNAVAILABLE')
  );
}

function isQuotaError(msg: string): boolean {
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
}

async function generateStructuredJson<T>(
  ai: GoogleGenAI,
  params: {
    label: string;
    systemInstruction: string;
    prompt: string;
    schema: Schema;
    thinkingLevel?: ThinkingLevel;
  }
): Promise<{ data: T; latencyMs: number; modelUsed: string }> {
  let lastError: unknown = null;

  for (const candidateModel of MODEL_CANDIDATES) {
    const started = Date.now();
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: candidateModel,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: params.schema,
          thinkingConfig: {
            thinkingLevel: params.thinkingLevel ?? ThinkingLevel.LOW,
          },
        },
      });
      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gemini returned an empty response payload.');
      }
      const parsed = JSON.parse(stripJsonFences(rawText)) as T;
      const latencyMs = Math.max(1, Date.now() - started);
      console.log(`[gemini] ${params.label} ok via ${candidateModel} (${latencyMs}ms)`);
      return {
        data: parsed,
        latencyMs,
        modelUsed: candidateModel,
      };
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (isQuotaOrOverloadError(msg) && candidateModel !== GEMINI_FALLBACK_MODEL) {
        console.warn(
          `[gemini] ${params.label} (${candidateModel}) unavailable/quota-limited; falling back to ${GEMINI_FALLBACK_MODEL}.`
        );
        continue;
      }
      // Do not keep trying on schema/auth errors
      if (
        msg.includes('400') ||
        msg.includes('401') ||
        msg.includes('403') ||
        msg.includes('INVALID_ARGUMENT')
      ) {
        break;
      }
    }
  }

  const rawMessage =
    lastError instanceof Error ? lastError.message : 'Unknown Gemini structured generation error.';
  if (isQuotaError(rawMessage)) {
    throw new GeminiUpstreamError(
      `Gemini API daily free-tier quota exceeded (${params.label}). Attach a billing-enabled API key in AI Studio Settings > Secrets or retry after quota reset, or click "Use Demo Fallback" to continue offline.`,
      429,
      'GEMINI_QUOTA_EXCEEDED'
    );
  }
  throw new GeminiUpstreamError(`Gemini agent call failed (${params.label}): ${rawMessage}`);
}

export async function getGeminiHealth(probe = false): Promise<GeminiHealthStatus> {
  const apiKey = getConfiguredApiKey();
  const checkedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!apiKey) {
    return {
      checking: false,
      configured: false,
      connected: false,
      model: GEMINI_MODEL,
      mode: 'demo-mode',
      message:
        'GEMINI_API_KEY is not configured in the server environment. Configure GEMINI_API_KEY in AI Studio Settings > Secrets to enable live Gemini agents.',
      lastCheckedAt: checkedAt,
    };
  }

  if (!probe) {
    return {
      checking: false,
      configured: true,
      connected: true,
      model: GEMINI_MODEL,
      mode: 'live-gemini',
      message: `Server GEMINI_API_KEY detected (${GEMINI_MODEL}, fallback: ${GEMINI_FALLBACK_MODEL}). Click "Re-Run 4 Agents" or trigger a scenario to run live orchestration.`,
      lastCheckedAt: checkedAt,
    };
  }

  const ai = createGeminiClient();
  let lastErrMsg = 'Failed to connect to Gemini API.';
  let totalLatency = 0;

  for (const candidateModel of MODEL_CANDIDATES) {
    const started = Date.now();
    try {
      const res: GenerateContentResponse = await ai.models.generateContent({
        model: candidateModel,
        contents: 'Respond with JSON {"ok":true,"status":"connected"}',
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });
      const latencyMs = Math.max(1, Date.now() - started);
      if (!res.text) {
        throw new Error('Empty health probe response from Gemini.');
      }
      return {
        checking: false,
        configured: true,
        connected: true,
        model: candidateModel,
        mode: 'live-gemini',
        latencyMs,
        message:
          candidateModel === GEMINI_MODEL
            ? `Live Gemini API verified (${candidateModel}, ${latencyMs}ms).`
            : `Live Gemini API verified via fallback model (${candidateModel}, ${latencyMs}ms; primary ${GEMINI_MODEL} is temporarily busy/quota-limited).`,
        lastCheckedAt: checkedAt,
      };
    } catch (err) {
      totalLatency = Math.max(1, Date.now() - started);
      lastErrMsg = err instanceof Error ? err.message : 'Failed to connect to Gemini API.';
      if (!isQuotaOrOverloadError(lastErrMsg)) {
        break;
      }
    }
  }

  const cleanMessage = isQuotaError(lastErrMsg)
    ? `GEMINI_API_KEY is configured, but Free Tier quota is exhausted for both ${GEMINI_MODEL} and ${GEMINI_FALLBACK_MODEL}. Upgrade key in Settings > Secrets or use Demo Fallback.`
    : `GEMINI_API_KEY is present, but Gemini probe failed: ${lastErrMsg}`;

  return {
    checking: false,
    configured: true,
    connected: false,
    model: GEMINI_MODEL,
    mode: 'error',
    latencyMs: totalLatency,
    message: cleanMessage,
    lastCheckedAt: checkedAt,
  };
}

// ============================================================================
// SCHEMAS FOR THE 4 SEQUENTIAL GEMINI AGENTS
// ============================================================================

const SKILL_ANALYST_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    strengths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          effectiveLevel: { type: Type.NUMBER },
          evidence: { type: Type.STRING },
        },
        required: ['skillName', 'effectiveLevel', 'evidence'],
      },
    },
    weaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          effectiveLevel: { type: Type.NUMBER },
          reason: { type: Type.STRING },
        },
        required: ['skillName', 'effectiveLevel', 'reason'],
      },
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    comparisons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          kind: { type: Type.STRING, enum: ['technical', 'soft'] },
          selfReportedLevel: { type: Type.NUMBER },
          verifiedLevel: {
            type: Type.NUMBER,
            description: 'Verified level 1-5 if assessed, or 0 if not yet assessed.',
          },
          effectiveLevel: { type: Type.NUMBER },
          verificationStatus: {
            type: Type.STRING,
            enum: ['verified', 'self-reported-only', 'needs-revision', 'missing'],
          },
          discrepancyNote: { type: Type.STRING },
        },
        required: [
          'skillName',
          'kind',
          'selfReportedLevel',
          'effectiveLevel',
          'verificationStatus',
          'discrepancyNote',
        ],
      },
    },
    credentialsSummary: { type: Type.STRING },
  },
  required: ['strengths', 'weaknesses', 'missingSkills', 'comparisons', 'credentialsSummary'],
};

const CAREER_MATCHING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    partialSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    readinessScore: { type: Type.NUMBER },
    scoreFormulaExplanation: { type: Type.STRING },
    scoreDerivation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          weight: { type: Type.NUMBER },
          requiredLevel: { type: Type.NUMBER },
          effectiveLevel: { type: Type.NUMBER },
          verificationTag: { type: Type.STRING },
          pointsEarned: { type: Type.NUMBER },
          maxPoints: { type: Type.NUMBER },
        },
        required: [
          'skillName',
          'weight',
          'requiredLevel',
          'effectiveLevel',
          'verificationTag',
          'pointsEarned',
          'maxPoints',
        ],
      },
    },
  },
  required: [
    'matchedSkills',
    'partialSkills',
    'missingSkills',
    'readinessScore',
    'scoreFormulaExplanation',
    'scoreDerivation',
  ],
};

const LEARNING_PLANNER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    orderedGapPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
    plannerSummary: { type: Type.STRING },
    generatedModules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          phase: {
            type: Type.STRING,
            enum: ['Foundations', 'Core Methods', 'Applied Systems', 'Capstone', 'Revision'],
          },
          status: {
            type: Type.STRING,
            enum: ['completed', 'active', 'upcoming'],
          },
          progressPct: { type: Type.NUMBER },
          estimatedHours: { type: Type.NUMBER },
          description: { type: Type.STRING },
          competencies: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetSkillGap: { type: Type.STRING },
          exercises: { type: Type.ARRAY, items: { type: Type.STRING } },
          isAdaptationInserted: { type: Type.BOOLEAN },
          adaptationReason: { type: Type.STRING },
          questTitle: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: ['Course', 'Tutorial', 'Exercise', 'Project', 'Reading', 'Lab', 'Case Study'],
                },
                duration: { type: Type.STRING },
                linkedSkill: { type: Type.STRING },
              },
              required: ['id', 'title', 'type', 'duration', 'linkedSkill'],
            },
          },
        },
        required: [
          'id',
          'title',
          'phase',
          'status',
          'progressPct',
          'estimatedHours',
          'description',
          'competencies',
          'targetSkillGap',
          'exercises',
          'questTitle',
          'resources',
        ],
      },
    },
    gapToResourceMap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skillGap: { type: Type.STRING },
          courseOrTutorial: { type: Type.STRING },
          practicalExercise: { type: Type.STRING },
          projectDeliverable: { type: Type.STRING },
        },
        required: ['skillGap', 'courseOrTutorial', 'practicalExercise', 'projectDeliverable'],
      },
    },
  },
  required: ['orderedGapPriorities', 'plannerSummary', 'generatedModules', 'gapToResourceMap'],
};

const PROGRESS_EVALUATOR_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    needsRoadmapAdjustment: { type: Type.BOOLEAN },
    detectedRegressionSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    adjustmentReason: { type: Type.STRING },
    requestedChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    'needsRoadmapAdjustment',
    'detectedRegressionSkills',
    'adjustmentReason',
    'requestedChanges',
    'recommendedActions',
  ],
};

const MENTOR_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING },
    referencedWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['reply', 'referencedWeaknesses', 'suggestedActions'],
};

// ============================================================================
// NORMALIZERS
// ============================================================================

function findMatchingSkill(
  reqSkillName: string,
  aliases: string[] | undefined,
  learnerSkills: SkillRecord[]
): SkillRecord | undefined {
  const candidates = [reqSkillName, ...(aliases ?? [])].map((n) => n.trim().toLowerCase());
  return learnerSkills.find((s) => candidates.includes(s.name.trim().toLowerCase()));
}

function normalizeAnalystOutput(raw: SkillAnalystOutput): SkillAnalystOutput {
  return {
    strengths: raw.strengths ?? [],
    weaknesses: raw.weaknesses ?? [],
    missingSkills: raw.missingSkills ?? [],
    comparisons: (raw.comparisons ?? []).map((c) => ({
      ...c,
      verifiedLevel:
        typeof c.verifiedLevel === 'number' && c.verifiedLevel > 0 ? c.verifiedLevel : null,
    })),
    credentialsSummary: raw.credentialsSummary ?? '',
  };
}

function normalizeCareerMatchingOutput(
  raw: Omit<CareerMatchingOutput, 'roleId' | 'roleTitle'>,
  role: CareerRoleDefinition,
  learnerSkills: SkillRecord[]
): CareerMatchingOutput {
  const aiRowBySkill = new Map(
    (raw.scoreDerivation ?? []).map((r) => [r.skillName.trim().toLowerCase(), r])
  );

  const normalizedRows: ScoreDerivationRow[] = [];
  let sumPoints = 0;

  for (const req of role.requirements) {
    const match = findMatchingSkill(req.skillName, req.aliases, learnerSkills);
    const aiRow = aiRowBySkill.get(req.skillName.trim().toLowerCase());

    let effectiveLevel = 0;
    let multiplier = 0;
    let verificationTag = 'Missing (0x)';

    if (match) {
      if (match.verifiedLevel !== undefined) {
        effectiveLevel = match.verifiedLevel;
        if (match.lastAssessedScore !== undefined && match.lastAssessedScore < 60) {
          multiplier = 0.8;
          verificationTag = 'Revision Needed (0.8x)';
        } else {
          multiplier = 1.0;
          verificationTag = 'Verified (1.0x)';
        }
      } else if (match.selfReportedLevel > 0) {
        effectiveLevel = match.selfReportedLevel;
        multiplier = 0.75;
        verificationTag = 'Self-Reported (0.75x cap)';
      }
    } else if (aiRow && typeof aiRow.effectiveLevel === 'number') {
      effectiveLevel = Math.max(0, Math.min(5, aiRow.effectiveLevel));
      multiplier = effectiveLevel > 0 ? 0.75 : 0;
      verificationTag =
        aiRow.verificationTag || (effectiveLevel > 0 ? 'Self-Reported (0.75x cap)' : 'Missing (0x)');
    }

    const ratio = Math.min(1, effectiveLevel / Math.max(1, req.requiredLevel));
    const pointsEarned = Math.round(req.weight * ratio * multiplier * 10) / 10;
    sumPoints += pointsEarned;

    normalizedRows.push({
      skillName: req.skillName,
      weight: req.weight,
      requiredLevel: req.requiredLevel,
      effectiveLevel,
      verificationTag,
      pointsEarned,
      maxPoints: req.weight,
    });
  }

  return {
    roleId: role.id,
    roleTitle: role.title,
    matchedSkills: raw.matchedSkills ?? [],
    partialSkills: raw.partialSkills ?? [],
    missingSkills: raw.missingSkills ?? [],
    readinessScore: Math.min(100, Math.max(0, Math.round(sumPoints))),
    scoreFormulaExplanation:
      raw.scoreFormulaExplanation ||
      'Readiness Score = Σ [ Skill Weight × min(1, Effective Level / Required Level) × Verification Multiplier (1.0× verified, 0.75× unverified self-reported, 0.8× revision-flagged) ].',
    scoreDerivation: normalizedRows,
  };
}

function normalizePlannerModules(
  modules: RoadmapModule[],
  evaluatorFeedback: ProgressEvaluatorOutput | null
): RoadmapModule[] {
  const seenIds = new Set<string>();
  const normalized = (modules ?? []).map((mod, idx) => {
    const baseId = (mod.id || `mod-ai-${idx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '-');
    let uniqueId = baseId;
    if (seenIds.has(uniqueId)) {
      uniqueId = `${baseId}-${idx + 1}`;
    }
    seenIds.add(uniqueId);

    const isRevision =
      Boolean(mod.isAdaptationInserted) ||
      mod.phase === 'Revision' ||
      Boolean(
        evaluatorFeedback?.needsRoadmapAdjustment &&
          idx === 0 &&
          evaluatorFeedback.detectedRegressionSkills.some((sk) =>
            `${mod.title} ${mod.targetSkillGap ?? ''}`.toLowerCase().includes(sk.toLowerCase())
          )
      );

    return {
      ...mod,
      id: uniqueId,
      progressPct: Math.max(0, Math.min(100, Math.round(mod.progressPct ?? 0))),
      estimatedHours: Math.max(0, Math.round(mod.estimatedHours ?? 6)),
      isAdaptationInserted: isRevision,
      resources: (mod.resources ?? []).map((r, rIdx) => ({
        ...r,
        id: r.id || `${uniqueId}-res-${rIdx + 1}`,
      })),
      exercises: Array.isArray(mod.exercises) ? mod.exercises : [],
      competencies: Array.isArray(mod.competencies) ? mod.competencies : [],
    };
  });

  if (evaluatorFeedback?.needsRoadmapAdjustment) {
    const revMods = normalized.filter((m) => m.isAdaptationInserted || m.phase === 'Revision');
    const otherMods = normalized.filter((m) => !(m.isAdaptationInserted || m.phase === 'Revision'));
    return [...revMods, ...otherMods];
  }

  return normalized;
}

// ============================================================================
// INDIVIDUAL SEQUENTIAL GEMINI AGENT RUNNERS (SHARED BY /step & /run)
// ============================================================================

export async function runStepSkillAnalyst(
  ai: GoogleGenAI,
  payload: Pick<AgentRunRequestPayload, 'profile' | 'assessments'>
): Promise<AgentTrace<unknown, SkillAnalystOutput>> {
  const role = getCareerRoleById(payload.profile.targetRoleId);
  const analystInput = {
    learnerName: payload.profile.name,
    university: payload.profile.university,
    major: payload.profile.major,
    targetRoleId: role.id,
    targetRoleTitle: role.title,
    roleBenchmarks: role.requirements.map((r) => ({
      skillName: r.skillName,
      kind: r.kind,
      requiredLevel: r.requiredLevel,
      weight: r.weight,
      aliases: r.aliases ?? [],
    })),
    skills: payload.profile.skills,
    certifications: payload.profile.certifications,
    projects: payload.profile.projects,
    assessments: payload.assessments,
  };

  const res = await generateStructuredJson<SkillAnalystOutput>(ai, {
    label: '1-skill-analyst',
    systemInstruction:
      'You are Agent 1 (Skill Analyst Agent). Analyze the learner profile, skills, certifications, projects, and assessments against roleBenchmarks. Distinguish self-reported skills from assessment-verified skills (verifiedLevel present & >=60% => "verified"; latest score <60% => "needs-revision"; unassessed self-reported => "self-reported-only"; absent role benchmark => "missing"). Keep notes concise.',
    prompt: `Analyze readiness evidence for "${role.title}". Include one comparison entry per roleBenchmark skill plus any extra profile skills.\nInput: ${JSON.stringify(analystInput)}`,
    schema: SKILL_ANALYST_SCHEMA,
  });

  const output = normalizeAnalystOutput(res.data);
  return {
    agentId: 'skill-analyst',
    agentName: '1. Skill Analyst Agent',
    responsibility:
      'Analyses learner profile, certifications, projects & assessments on Gemini; separates self-reported skills from assessment-verified evidence.',
    executionStatus: 'live-gemini',
    modelUsed: res.modelUsed,
    latencyMs: res.latencyMs,
    modeLabel: `Live Gemini (${res.modelUsed})`,
    inputSummary: `${payload.profile.skills.length} skills, ${payload.profile.certifications.length} certs, ${payload.profile.projects.length} projects, ${payload.assessments.length} assessments`,
    outputSummary: `${output.strengths.length} strengths · ${output.weaknesses.length} weaknesses · ${output.missingSkills.length} missing skills`,
    handoffTo: 'Career Matching Agent',
    input: analystInput,
    output,
  };
}

export async function runStepCareerMatching(
  ai: GoogleGenAI,
  payload: Pick<AgentRunRequestPayload, 'profile'> & { analystOutput: SkillAnalystOutput }
): Promise<AgentTrace<unknown, CareerMatchingOutput>> {
  const role = getCareerRoleById(payload.profile.targetRoleId);
  const matchingInput = {
    skillAnalystOutput: payload.analystOutput,
    targetRole: {
      id: role.id,
      title: role.title,
      tagline: role.tagline,
      requirements: role.requirements,
    },
    availableRolesContext: CAREER_ROLES.map((r) => `${r.id}: ${r.title}`).join('; '),
  };

  const res = await generateStructuredJson<Omit<CareerMatchingOutput, 'roleId' | 'roleTitle'>>(ai, {
    label: '2-career-matching',
    systemInstruction:
      'You are Agent 2 (Career Matching Agent). Compare Skill Analyst output against targetRole requirements. Put fully satisfied skills in matchedSkills, below-target/unverified/needs-revision in partialSkills, absent skills in missingSkills. Provide scoreDerivation using Weight * min(1, Effective/Required) * (1.0 verified, 0.75 self-reported, 0.8 revision-flagged). Keep explanations concise.',
    prompt: `Compute career match for "${role.title}".\nInput: ${JSON.stringify(matchingInput)}`,
    schema: CAREER_MATCHING_SCHEMA,
  });

  const output = normalizeCareerMatchingOutput(res.data, role, payload.profile.skills);
  return {
    agentId: 'career-matching',
    agentName: '2. Career Matching Agent',
    responsibility:
      'Receives Skill Analyst JSON output and evaluates role requirements on Gemini to compute an explainable readiness score.',
    executionStatus: 'live-gemini',
    modelUsed: res.modelUsed,
    latencyMs: res.latencyMs,
    modeLabel: `Live Gemini (${res.modelUsed})`,
    inputSummary: `Skill Analyst output for "${role.title}" (${role.requirements.length} role benchmarks)`,
    outputSummary: `${output.readinessScore}% readiness · Matched: [${output.matchedSkills.join(', ') || 'None'}] · Missing: [${output.missingSkills.join(', ') || 'None'}]`,
    handoffTo: 'Learning Planner Agent',
    input: matchingInput,
    output,
  };
}

export async function runStepLearningPlanner(
  ai: GoogleGenAI,
  payload: {
    profile: StudentProfile;
    analystOutput: SkillAnalystOutput;
    matchingOutput: CareerMatchingOutput;
    learningPreferences?: LearningPreferences;
    adhdPreferences?: ADHDPreferences;
    evaluatorOutput?: ProgressEvaluatorOutput | null;
    previousLatencyMs?: number;
  }
): Promise<AgentTrace<unknown, LearningPlannerOutput>> {
  const role = getCareerRoleById(payload.profile.targetRoleId);
  const evaluatorOutput = payload.evaluatorOutput ?? null;

  const plannerInput = {
    careerMatchingOutput: payload.matchingOutput,
    skillAnalystSummary: {
      strengths: payload.analystOutput.strengths,
      weaknesses: payload.analystOutput.weaknesses,
      missingSkills: payload.analystOutput.missingSkills,
    },
    learnerPreferences: payload.learningPreferences ?? {
      knowledgeLevel: 'intermediate',
      preferredFormat: 'mixed',
      dailyAvailabilityHours: 2.5,
      preferredFocusMinutes: 25,
    },
    adhdPreferences: payload.adhdPreferences ?? {
      autoMicrotaskBreakdown: true,
      preferredTaskDuration: 15,
    },
    evaluatorRequestedChanges: evaluatorOutput,
  };

  const isAdaptationPass = Boolean(evaluatorOutput?.needsRoadmapAdjustment);
  const res = await generateStructuredJson<LearningPlannerOutput>(ai, {
    label: isAdaptationPass ? '3b-learning-planner-adapt' : '3-learning-planner',
    systemInstruction: isAdaptationPass
      ? 'You are Agent 3 (Learning Planner Agent) executing a Progress Evaluator adaptation pass. Place targeted Revision modules (phase="Revision", status="active", isAdaptationInserted=true, clear adaptationReason) at index 0 for every regression skill requested, followed by remaining gap modules and Capstone. Keep descriptions concise (1-2 sentences).'
      : 'You are Agent 3 (Learning Planner Agent). Build a concise, ordered, ADHD-friendly roadmap (4-6 modules max) for the target role using Career Matching gaps & Skill Analyst summary. Include 1 completed Verified Foundation module if matchedSkills is non-empty, gap modules with courses/tutorials/exercises/projects, and a final Capstone. Map every gap in gapToResourceMap.',
    prompt: isAdaptationPass
      ? `Adapt roadmap for "${role.title}" per Progress Evaluator feedback (${evaluatorOutput?.requestedChanges?.join('; ') || evaluatorOutput?.adjustmentReason}).\nInput: ${JSON.stringify(plannerInput)}`
      : `Create ordered roadmap for "${role.title}".\nInput: ${JSON.stringify(plannerInput)}`,
    schema: LEARNING_PLANNER_SCHEMA,
  });

  const output: LearningPlannerOutput = {
    ...res.data,
    generatedModules: normalizePlannerModules(res.data.generatedModules, evaluatorOutput),
  };
  const totalLatency = (payload.previousLatencyMs ?? 0) + res.latencyMs;

  return {
    agentId: 'learning-planner',
    agentName: '3. Learning Planner Agent',
    responsibility:
      'Converts Career Matching gaps & Progress Evaluator adaptation feedback into an ordered Gemini-generated roadmap with courses, tutorials & projects.',
    executionStatus: 'live-gemini',
    modelUsed: res.modelUsed,
    latencyMs: totalLatency,
    modeLabel: `Live Gemini (${res.modelUsed})`,
    inputSummary: isAdaptationPass
      ? `Initial gaps + Progress Evaluator adaptation request for [${evaluatorOutput?.detectedRegressionSkills.join(', ')}]`
      : `Gaps: [${payload.matchingOutput.missingSkills.concat(payload.matchingOutput.partialSkills).join(', ') || 'Capstone'}]`,
    outputSummary: `${output.generatedModules.length} ordered modules (${output.gapToResourceMap.length} gap-to-resource links)`,
    handoffTo: isAdaptationPass
      ? 'Adapted Roadmap State (after Progress Evaluator D→C loop)'
      : 'Progress Evaluator Agent',
    input: plannerInput,
    output,
  };
}

export async function runStepProgressEvaluator(
  ai: GoogleGenAI,
  payload: {
    analystOutput: SkillAnalystOutput;
    matchingOutput: CareerMatchingOutput;
    plannerOutput: LearningPlannerOutput;
    assessments: SkillAssessmentRecord[];
    currentModules?: RoadmapModule[];
    focusMinutesToday?: number;
  }
): Promise<AgentTrace<unknown, ProgressEvaluatorOutput>> {
  const {
    analystOutput,
    matchingOutput,
    plannerOutput,
    assessments,
    currentModules = [],
    focusMinutesToday = 0,
  } = payload;

  const averageAssessmentPct =
    assessments.length > 0
      ? Math.round(assessments.reduce((acc, a) => acc + a.pct, 0) / assessments.length)
      : null;
  const baselineModulesForCompletion =
    currentModules.length > 0 ? currentModules : plannerOutput.generatedModules;
  const roadmapCompletionPct =
    baselineModulesForCompletion.length > 0
      ? Math.round(
          baselineModulesForCompletion.reduce((acc, m) => acc + m.progressPct, 0) /
            baselineModulesForCompletion.length
        )
      : 0;

  const evaluatorInput = {
    plannedRoadmapModules: plannerOutput.generatedModules.map((m) => ({
      id: m.id,
      title: m.title,
      phase: m.phase,
      targetSkillGap: m.targetSkillGap,
      progressPct: m.progressPct,
    })),
    assessments,
    averageAssessmentPct,
    roadmapCompletionPct,
    focusMinutesToday,
    analystWeaknesses: analystOutput.weaknesses,
    matchingReadinessScore: matchingOutput.readinessScore,
  };

  const res = await generateStructuredJson<
    Omit<ProgressEvaluatorOutput, 'averageAssessmentPct' | 'roadmapCompletionPct'>
  >(ai, {
    label: '4-progress-evaluator',
    systemInstruction:
      'You are Agent 4 (Progress Evaluator Agent). Evaluate latest assessments and roadmap progress. If ANY skill has a latest assessment below 60% or status needs-revision, set needsRoadmapAdjustment=true, list it in detectedRegressionSkills, and fill requestedChanges instructing Learning Planner to insert a priority #1 Revision & Guided Practice module. Otherwise set needsRoadmapAdjustment=false. Output concise JSON.',
    prompt: `Evaluate learner progress and decide if roadmap adjustment is required.\nInput: ${JSON.stringify(evaluatorInput)}`,
    schema: PROGRESS_EVALUATOR_SCHEMA,
  });

  const output: ProgressEvaluatorOutput = {
    needsRoadmapAdjustment: res.data.needsRoadmapAdjustment,
    detectedRegressionSkills: res.data.detectedRegressionSkills ?? [],
    averageAssessmentPct,
    roadmapCompletionPct,
    adjustmentReason: res.data.adjustmentReason,
    requestedChanges: res.data.requestedChanges ?? [],
    recommendedActions: res.data.recommendedActions ?? [],
  };

  return {
    agentId: 'progress-evaluator',
    agentName: '4. Progress Evaluator Agent',
    responsibility:
      'Evaluates assessment results & roadmap progress on Gemini; detects weak areas (<60%) and sends requestedChanges back to Learning Planner.',
    executionStatus: 'live-gemini',
    modelUsed: res.modelUsed,
    latencyMs: res.latencyMs,
    modeLabel: `Live Gemini (${res.modelUsed})`,
    inputSummary: `${assessments.length} assessment(s) · Roadmap ${roadmapCompletionPct}% complete`,
    outputSummary: output.needsRoadmapAdjustment
      ? `Adjustment Triggered (${output.detectedRegressionSkills.join(', ')}) → Looped back to Learning Planner`
      : `Well-calibrated · ${output.recommendedActions[0] ?? 'Continue sequence'}`,
    handoffTo: output.needsRoadmapAdjustment
      ? 'Learning Planner Agent (Adaptation Loop) & Final Recommendation'
      : 'Final Learner Recommendation & Live Roadmap State',
    input: evaluatorInput,
    output,
  };
}

export function assemblePipelineResult(params: {
  profile: StudentProfile;
  traces: AgentPipelineResult['traces'];
}): AgentPipelineResult {
  const { profile, traces } = params;
  const role = getCareerRoleById(profile.targetRoleId);
  const matchingOutput = traces[1].output;
  const plannerOutput = traces[2].output;
  const evaluatorOutput = traces[3].output;
  const primaryModel = traces[0]?.modelUsed || GEMINI_MODEL;
  const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const finalCombinedRecommendation = evaluatorOutput.needsRoadmapAdjustment
    ? `LIVE GEMINI ADAPTED PLAN (${role.title} · ${matchingOutput.readinessScore}% readiness): Progress Evaluator detected low assessment mastery in ${evaluatorOutput.detectedRegressionSkills.join(', ')} and passed feedback back to Learning Planner, which inserted targeted revision & practice ahead of ${matchingOutput.missingSkills.filter((s) => !evaluatorOutput.detectedRegressionSkills.includes(s)).join(', ') || 'your capstone'}.`
    : `LIVE GEMINI ROADMAP READY (${role.title} · ${matchingOutput.readinessScore}% readiness): Leverage your strengths (${matchingOutput.matchedSkills.join(', ') || 'foundations'}) and close priority gaps: ${plannerOutput.orderedGapPriorities.join(' → ') || 'Capstone'}.`;

  return {
    runId: `run-gemini-${Date.now()}`,
    executedAtLabel: `Executed live at ${nowLabel} via ${primaryModel}`,
    executionMode: 'live-gemini',
    geminiConfigured: true,
    modelUsed: primaryModel,
    modeBanner: `LIVE GEMINI ORCHESTRATION · ${primaryModel} (4 Sequential Server Calls${evaluatorOutput.needsRoadmapAdjustment ? ' + D→C Adaptation Pass' : ''})`,
    adaptationApplied: evaluatorOutput.needsRoadmapAdjustment,
    finalCombinedRecommendation,
    traces,
  };
}

export async function runLiveGeminiAgentStep(payload: AgentStepRequestPayload) {
  const ai = createGeminiClient();
  switch (payload.step) {
    case 'skill-analyst': {
      const trace = await runStepSkillAnalyst(ai, {
        profile: payload.profile,
        assessments: payload.assessments,
      });
      return { step: payload.step, trace, modelUsed: trace.modelUsed ?? GEMINI_MODEL };
    }
    case 'career-matching': {
      if (!payload.analystOutput) {
        throw new GeminiUpstreamError('career-matching step requires analystOutput from Skill Analyst Agent.');
      }
      const trace = await runStepCareerMatching(ai, {
        profile: payload.profile,
        analystOutput: payload.analystOutput,
      });
      return { step: payload.step, trace, modelUsed: trace.modelUsed ?? GEMINI_MODEL };
    }
    case 'learning-planner': {
      if (!payload.analystOutput || !payload.matchingOutput) {
        throw new GeminiUpstreamError('learning-planner step requires analystOutput and matchingOutput.');
      }
      const trace = await runStepLearningPlanner(ai, {
        profile: payload.profile,
        analystOutput: payload.analystOutput,
        matchingOutput: payload.matchingOutput,
        learningPreferences: payload.learningPreferences,
        adhdPreferences: payload.adhdPreferences,
        evaluatorOutput: payload.evaluatorOutput ?? null,
      });
      return { step: payload.step, trace, modelUsed: trace.modelUsed ?? GEMINI_MODEL };
    }
    case 'progress-evaluator': {
      if (!payload.analystOutput || !payload.matchingOutput || !payload.plannerOutput) {
        throw new GeminiUpstreamError('progress-evaluator step requires outputs from Agents 1-3.');
      }
      const trace = await runStepProgressEvaluator(ai, {
        analystOutput: payload.analystOutput,
        matchingOutput: payload.matchingOutput,
        plannerOutput: payload.plannerOutput,
        assessments: payload.assessments,
        currentModules: payload.currentModules,
        focusMinutesToday: payload.focusMinutesToday,
      });
      return { step: payload.step, trace, modelUsed: trace.modelUsed ?? GEMINI_MODEL };
    }
  }
}

export async function runLiveGeminiPipeline(
  payload: AgentRunRequestPayload
): Promise<AgentPipelineResult> {
  const ai = createGeminiClient();
  const trace1 = await runStepSkillAnalyst(ai, {
    profile: payload.profile,
    assessments: payload.assessments,
  });
  const trace2 = await runStepCareerMatching(ai, {
    profile: payload.profile,
    analystOutput: trace1.output,
  });
  let trace3 = await runStepLearningPlanner(ai, {
    profile: payload.profile,
    analystOutput: trace1.output,
    matchingOutput: trace2.output,
    learningPreferences: payload.learningPreferences,
    adhdPreferences: payload.adhdPreferences,
    evaluatorOutput: null,
  });
  const trace4 = await runStepProgressEvaluator(ai, {
    analystOutput: trace1.output,
    matchingOutput: trace2.output,
    plannerOutput: trace3.output,
    assessments: payload.assessments,
    currentModules: payload.currentModules,
    focusMinutesToday: payload.focusMinutesToday,
  });

  if (trace4.output.needsRoadmapAdjustment) {
    trace3 = await runStepLearningPlanner(ai, {
      profile: payload.profile,
      analystOutput: trace1.output,
      matchingOutput: trace2.output,
      learningPreferences: payload.learningPreferences,
      adhdPreferences: payload.adhdPreferences,
      evaluatorOutput: trace4.output,
      previousLatencyMs: trace3.latencyMs,
    });
  }

  return assemblePipelineResult({
    profile: payload.profile,
    traces: [trace1, trace2, trace3, trace4],
  });
}

// ============================================================================
// GROUNDED GEMINI AI MENTOR
// ============================================================================

export async function runLiveGeminiMentor(
  payload: MentorChatRequestPayload
): Promise<MentorMessage> {
  const ai = createGeminiClient();
  const { question, profile, pipeline, modules, assessments, skillHistory, focusMinutesToday, history = [] } = payload;

  const analyst = pipeline.traces[0]?.output;
  const matching = pipeline.traces[1]?.output;
  const planner = pipeline.traces[2]?.output;
  const evaluator = pipeline.traces[3]?.output;

  const mentorContext = {
    learnerName: profile.name,
    targetRoleTitle: matching?.roleTitle ?? profile.careerNorthStar,
    readinessScore: matching?.readinessScore ?? 0,
    scoreDerivation: matching?.scoreDerivation ?? [],
    strengths: analyst?.strengths ?? [],
    weaknesses: analyst?.weaknesses ?? [],
    missingSkills: matching?.missingSkills ?? [],
    evaluatorStatus: evaluator ?? null,
    activeRoadmapModules: modules.slice(0, 6).map((m) => ({
      title: m.title,
      phase: m.phase,
      status: m.status,
      progressPct: m.progressPct,
      targetSkillGap: m.targetSkillGap,
      questTitle: m.questTitle,
      isAdaptationInserted: Boolean(m.isAdaptationInserted),
    })),
    gapToResourceMap: planner?.gapToResourceMap ?? [],
    recentAssessments: assessments.slice(0, 5),
    recentSkillChanges: skillHistory.slice(0, 5),
    focusMinutesToday,
    recentConversation: history.slice(-6),
  };

  const result = await generateStructuredJson<{
    reply: string;
    referencedWeaknesses: string[];
    suggestedActions: string[];
  }>(ai, {
    label: 'mentor-chat',
    systemInstruction:
      'You are Thiranagam AI Study Mentor, a calm, encouraging, ADHD-aware academic coach. Answer grounded strictly in the provided workspace context JSON (readiness score breakdown, skill gaps, verified vs self-reported skills, assessment results, active roadmap modules, and focus minutes today). Keep reply concise (3-5 sentences) and actionable with 2-3 suggestedActions.',
    prompt: `Learner Question: "${question}"\nWorkspace Context: ${JSON.stringify(mentorContext)}`,
    schema: MENTOR_RESPONSE_SCHEMA,
  });

  return {
    id: `mentor-gemini-${Date.now()}`,
    role: 'mentor',
    text: result.data.reply,
    timestampLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referencedWeaknesses: result.data.referencedWeaknesses ?? [],
    suggestedActions: result.data.suggestedActions ?? [],
    executionStatus: 'live-gemini',
    modelUsed: result.modelUsed,
    latencyMs: result.latencyMs,
  };
}
