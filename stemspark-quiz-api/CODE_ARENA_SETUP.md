# Code Arena setup

Code Arena runs source code through the Judge0 API from the Vercel serverless function at `/api/code-arena`. The browser never receives Judge0 credentials.

## Judge0 configuration

The handler uses `https://ce.judge0.com` if `JUDGE0_API_URL` is not set. This public Judge0 instance requires no API key, but it is shared and may apply its own limits. For production traffic, configure a dedicated or authenticated Judge0 provider in the Vercel project:

- `JUDGE0_API_URL`: HTTPS base URL for your Judge0 instance.
- `JUDGE0_API_KEY` and `JUDGE0_API_HOST`: optional RapidAPI credentials.
- `JUDGE0_AUTH_TOKEN`: optional Judge0 `X-Auth-Token` credential for a self-hosted instance.
- `CODE_ARENA_ALLOWED_ORIGINS`: comma-separated browser origins. Defaults to the Firebase Hosting domains and the production STEMSpark Vercel frontend aliases; add any custom domain.

Set credentials only in Vercel's server-side Environment Variables. Never use a `VITE_` prefix for secrets. `.env.example` contains placeholders, not credentials.

## Deployment

Deploy this folder as the existing `stemspark-quiz-api` Vercel project so `/api/code-arena` is available beside the quiz and tutor endpoints. For the frontend build, set the public `VITE_CODE_ARENA_API_URL` to the deployed endpoint (for example, `https://stemspark-quiz-api.vercel.app/api/code-arena`). If it is omitted, the frontend derives the endpoint from `VITE_QUIZ_API_URL` or uses the existing production API deployment.

The Vercel function limits each process to 10 code runs per client IP per minute, 8 simultaneous executions, 30 KB of source code, 10 KB of stdin, 20 KB of returned output, and bounded CPU, wall time, memory, stack, and file size at Judge0. The in-memory rate limiter is per serverless instance; use provider-level quotas or a shared rate-limit store if stronger cross-instance enforcement is required.

## Local development

Run `vercel dev` from this API project and set `VITE_CODE_ARENA_API_URL=http://localhost:3000/api/code-arena` in `frontend/.env.local`. Vercel development mode allows the local Vite origin. Set any Judge0 credentials in the Vercel project or in the backend's ignored local `.env` file. Do not commit either file.
