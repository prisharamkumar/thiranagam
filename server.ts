import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GeminiConfigError,
  GeminiUpstreamError,
  getGeminiHealth,
  runLiveGeminiAgentStep,
  runLiveGeminiMentor,
  runLiveGeminiPipeline,
  type AgentRunRequestPayload,
  type AgentStepName,
  type AgentStepRequestPayload,
  type MentorChatRequestPayload,
} from './server/geminiOrchestrator.ts';

const VALID_AGENT_STEPS: AgentStepName[] = [
  'skill-analyst',
  'career-matching',
  'learning-planner',
  'progress-evaluator',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/gemini/health', async (req: Request, res: Response) => {
    try {
      const probe = req.query.probe === '1' || req.query.probe === 'true';
      const health = await getGeminiHealth(probe);
      res.status(200).json(health);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Health check failed.';
      res.status(500).json({
        checking: false,
        configured: false,
        connected: false,
        model: 'gemini-4-hydrogen',
        mode: 'error',
        message,
      });
    }
  });

  app.post('/api/agents/step', async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<AgentStepRequestPayload> | undefined;
      if (
        !body ||
        !body.step ||
        !VALID_AGENT_STEPS.includes(body.step) ||
        !body.profile ||
        !Array.isArray(body.assessments)
      ) {
        res.status(400).json({
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
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
      }
      if (err instanceof GeminiUpstreamError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
      }
      const message = err instanceof Error ? err.message : 'Unexpected agent step failure.';
      res.status(500).json({ code: 'INTERNAL_ERROR', error: message });
    }
  });

  app.post('/api/agents/run', async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<AgentRunRequestPayload> | undefined;
      if (!body || !body.profile || !Array.isArray(body.assessments)) {
        res.status(400).json({
          code: 'INVALID_PAYLOAD',
          error: 'Request must include profile and assessments array.',
        });
        return;
      }

      const pipeline = await runLiveGeminiPipeline({
        profile: body.profile,
        assessments: body.assessments,
        currentModules: body.currentModules,
        learningPreferences: body.learningPreferences,
        adhdPreferences: body.adhdPreferences,
        focusMinutesToday: body.focusMinutesToday,
      });
      res.status(200).json({ pipeline });
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
      }
      if (err instanceof GeminiUpstreamError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
      }
      const message = err instanceof Error ? err.message : 'Unexpected agent pipeline failure.';
      res.status(500).json({ code: 'INTERNAL_ERROR', error: message });
    }
  });

  app.post('/api/mentor/chat', async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<MentorChatRequestPayload> | undefined;
      if (!body || typeof body.question !== 'string' || !body.question.trim() || !body.profile || !body.pipeline) {
        res.status(400).json({
          code: 'INVALID_PAYLOAD',
          error: 'Request must include question, profile, and pipeline context.',
        });
        return;
      }

      const message = await runLiveGeminiMentor({
        question: body.question.trim(),
        profile: body.profile,
        pipeline: body.pipeline,
        modules: Array.isArray(body.modules) ? body.modules : [],
        assessments: Array.isArray(body.assessments) ? body.assessments : [],
        skillHistory: Array.isArray(body.skillHistory) ? body.skillHistory : [],
        focusMinutesToday: typeof body.focusMinutesToday === 'number' ? body.focusMinutesToday : 0,
        history: Array.isArray(body.history) ? body.history : [],
      });
      res.status(200).json({ message });
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
      }
      if (err instanceof GeminiUpstreamError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
      }
      const message = err instanceof Error ? err.message : 'Unexpected mentor chat failure.';
      res.status(500).json({ code: 'INTERNAL_ERROR', error: message });
    }
  });

  return app;
}

async function startServer() {
  const app = createApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Thiranagam server listening on http://0.0.0.0:${port} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Thiranagam server:', err);
  process.exit(1);
});
