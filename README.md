# Thiranagam

**Your Learning Universe. Your Pace. Your Progress.**

Thiranagam is an AI-powered personalised learning and career-readiness platform. It helps a learner understand the gap between their current skills and a target role, then turns that gap into an adaptive learning roadmap with progress feedback.

**Live application:** https://thiranagam-javc-six.vercel.app/  
**Source code:** https://github.com/prisharamkumar/thiranagam

## The problem

Learners often know what career they want but do not know which skills they are missing, how strong their existing skills really are, or what to learn next. Generic course lists do not account for a learner's verified ability, assessment results, learning preferences, or changing goals.

Thiranagam connects learner evidence to role requirements and converts the resulting skill gap into an ordered, adjustable plan.

## What the application does

- **Learner profile:** skills, certifications, projects, learning preferences, and target career role.
- **Skill analysis:** identifies strengths, partial skills, weaknesses, and missing requirements.
- **Evidence-aware readiness:** keeps self-reported skill levels distinct from assessment-verified levels and explains the readiness-score calculation.
- **Career matching:** compares the learner profile with the selected role's requirements.
- **Adaptive roadmap:** prioritises missing skills and inserts revision work when assessment performance falls below the configured threshold.
- **Progress insights:** tracks focus sessions, skill checks, roadmap progress, and skill history.
- **AI Study Mentor:** available in the Insights area; uses learner profile, career readiness, assessments, roadmap modules, and recent conversation context.
- **ADHD-friendly study experience:** short tasks, focus timer, low-stimulation preferences, and reduced-motion settings.

## Multi-agent architecture

The live Gemini orchestration is implemented in `server/geminiOrchestrator.ts`. The pipeline runs four specialist steps in sequence:

1. **Skill Analyst** — evaluates the learner's current skills and assessment evidence.
2. **Career Matching** — compares evaluated skills with the selected role and derives a transparent readiness score.
3. **Learning Planner** — creates an ordered roadmap from the identified gaps.
4. **Progress Evaluator** — checks assessment and roadmap signals and can request targeted revision. The planner can be rerun when adaptation is required.

The browser calls server API routes; the Gemini API key is read from the server environment and is not intended to be exposed in client-side code. Deterministic specialist functions provide a demo/offline fallback when live Gemini is unavailable.

## Technology

- React 19, TypeScript, Vite 8
- Tailwind CSS 4
- Google Gemini through `@google/genai`
- Express development server and Vercel serverless API routes

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
cp .env.example .env
```

Add your Gemini key to `.env`:

```env
GEMINI_API_KEY=your_key_here
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment configuration

Set `GEMINI_API_KEY` as a server-side environment variable in your deployment provider (for Vercel: Project Settings → Environment Variables). Redeploy after changing environment variables.

Do **not** use a `VITE_`-prefixed variable for the Gemini API key; client-exposed variables can be bundled into browser code. Never commit `.env` or real credentials.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

The test suite covers evidence-aware skill analysis, alias matching, and bounded AI Mentor request/history handling. Mentor requests are limited to 2,000 characters, recent history is capped at 12 messages, and context arrays are bounded before model calls.

## API routes

- `GET /api/gemini/health` — reports Gemini configuration; use `?probe=1` to make a live connectivity probe.
- `POST /api/agents/run` — runs the four-agent pipeline.
- `POST /api/agents/step` — runs one named specialist step.
- `POST /api/mentor/chat` — generates a context-aware mentor response.

## Demo walkthrough

1. Open **My Roadmap** and review the selected career goal and readiness breakdown.
2. Switch the target role to see the career match and learning plan adapt.
3. Submit a skill check; a low score can trigger a revision module.
4. Use **Re-Run 4 Agents** to run the live pipeline when Gemini is configured.
5. Open **Insights** to review progress and use the AI Study Mentor.

> The app currently provides a local demo workspace rather than account-based cloud persistence. Learner state is stored in the browser on the device.
