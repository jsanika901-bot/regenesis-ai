# Technology Steering — RE:GENESIS AI

## Core Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Motion (`motion/react`), Lucide Icons.
- **Backend:** Node.js + Express (`server.ts`) serving API routes and Vite development middleware on port `3000`.
- **AI Engine:** `@google/genai` SDK running strictly server-side using `gemini-4-hydrogen` for low-latency multimodal vision and structured JSON synthesis.

## Architectural Rules
1. **Zero Client-Side Keys:** `GEMINI_API_KEY` is read solely inside `server.ts` via `process.env.GEMINI_API_KEY`. The browser communicates exclusively through `/api/*` endpoints.
2. **Structured Schemas:** All Gemini responses for material scanning and product manufacturing must declare `responseMimeType: "application/json"` and a complete `responseSchema` built with `Type` from `@google/genai`.
3. **Resilient Error Propagation:** Backend endpoints return explicit HTTP 4xx/5xx JSON payloads on failure; the UI displays actionable inline recovery messages rather than silently substituting mock AI outputs.
4. **Asset Reliability:** All static editorial photography resides under `/src/assets/images/` and is copied to `dist/src/assets` during production builds.
