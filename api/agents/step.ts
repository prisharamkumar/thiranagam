import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  GeminiConfigError,
  GeminiUpstreamError,
  runLiveGeminiAgentStep,
  type AgentStepName,
  type AgentStepRequestPayload,
} from '../../server/geminiOrchestrator.ts';

interface VercelRequestLike extends IncomingMessage {
  body?: unknown;
}

interface VercelResponseLike extends ServerResponse {
  status?: (code: number) => VercelResponseLike;
  json?: (body: unknown) => void;
}

const VALID_AGENT_STEPS: AgentStepName[] = [
  'skill-analyst',
  'career-matching',
  'learning-planner',
  'progress-evaluator',
];

function sendJson(res: VercelResponseLike, statusCode: number, body: unknown) {
  if (res.status && res.json) {
    res.status(statusCode);
    res.json(body);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJsonBody<T>(req: VercelRequestLike): Promise<T | null> {
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body) as T;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody<Partial<AgentStepRequestPayload>>(req);
    if (
      !body ||
      !body.step ||
      !VALID_AGENT_STEPS.includes(body.step) ||
      !body.profile ||
      !Array.isArray(body.assessments)
    ) {
      sendJson(res, 400, {
        code: 'INVALID_PAYLOAD',
        error: 'Request must include valid step, profile, and assessments array.',
      });
      return;
    }

    const result = await runLiveGeminiAgentStep({
      step: body.step,
      profile: body.profile,
      assessments: body.assessments,
      currentModules: body.currentModules,
      learningPreferences: body.learningPreferences,
      adhdPreferences: body.adhdPreferences,
      focusMinutesToday: body.focusMinutesToday,
      analystOutput: body.analystOutput,
      matchingOutput: body.matchingOutput,
      plannerOutput: body.plannerOutput,
      evaluatorOutput: body.evaluatorOutput,
    });
    sendJson(res, 200, result);
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      sendJson(res, err.statusCode, { code: err.code, error: err.message });
      return;
    }
    if (err instanceof GeminiUpstreamError) {
      sendJson(res, err.statusCode, { code: err.code, error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'Unexpected agent step failure.';
    sendJson(res, 500, { code: 'INTERNAL_ERROR', error: message });
  }
}
