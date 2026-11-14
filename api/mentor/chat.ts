import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  GeminiConfigError,
  GeminiUpstreamError,
  runLiveGeminiMentor,
  type MentorChatRequestPayload,
} from '../../server/geminiOrchestrator.ts';
import {
  normalizeMentorHistory,
  normalizeMentorQuestion,
} from '../../server/requestLimits.ts';

interface VercelRequestLike extends IncomingMessage {
  body?: unknown;
}

interface VercelResponseLike extends ServerResponse {
  status?: (code: number) => VercelResponseLike;
  json?: (body: unknown) => void;
}

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
    const body = await readJsonBody<Partial<MentorChatRequestPayload>>(req);
    const question = normalizeMentorQuestion(body?.question);
    if (!body || !question || !body.profile || !body.pipeline) {
      sendJson(res, 400, {
        code: 'INVALID_PAYLOAD',
        error: 'Request must include question (1–2000 characters), profile, and pipeline context.',
      });
      return;
    }

    const message = await runLiveGeminiMentor({
      question,
      profile: body.profile,
      pipeline: body.pipeline,
      modules: Array.isArray(body.modules) ? body.modules.slice(0, 100) : [],
      assessments: Array.isArray(body.assessments) ? body.assessments.slice(0, 100) : [],
      skillHistory: Array.isArray(body.skillHistory) ? body.skillHistory.slice(0, 100) : [],
      focusMinutesToday: typeof body.focusMinutesToday === 'number' ? body.focusMinutesToday : 0,
      history: normalizeMentorHistory(body.history),
    });
    sendJson(res, 200, { message });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      sendJson(res, err.statusCode, { code: err.code, error: err.message });
      return;
    }
    if (err instanceof GeminiUpstreamError) {
      sendJson(res, err.statusCode, { code: err.code, error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'Unexpected mentor chat failure.';
    sendJson(res, 500, { code: 'INTERNAL_ERROR', error: message });
  }
}
