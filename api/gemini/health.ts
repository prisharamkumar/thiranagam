import type { IncomingMessage, ServerResponse } from 'node:http';
import { getGeminiHealth } from '../../server/geminiOrchestrator.ts';

interface VercelRequestLike extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
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

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const urlObj = new URL(req.url || '/api/gemini/health', 'http://localhost');
    const queryProbe = req.query?.probe ?? urlObj.searchParams.get('probe');
    const probe = queryProbe === '1' || queryProbe === 'true';
    const health = await getGeminiHealth(probe);
    sendJson(res, 200, health);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Health check failed.';
    sendJson(res, 500, {
      checking: false,
      configured: false,
      connected: false,
      model: 'gemini-4-hydrogen',
      mode: 'error',
      message,
    });
  }
}
