# RE:GENESIS AI — Implementation Tasks

## Phase 1: Foundation & Visual Assets
- [x] **T-01:** Configure `metadata.json` with app identity and `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`.
- [x] **T-02:** Upgrade `@google/genai` SDK and configure Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`) in `index.html`.
- [x] **T-03:** Generate bespoke studio visual assets for the hardware unit hero and four primary waste stream presets (`PET`, `Denim/Cotton`, `Vulcanized Rubber`, `Leather & Walnut`).
- [x] **T-04:** Author `.kiro/specs`, `.kiro/steering`, and `.kiro/hooks` Kiroween 2026 governance artifacts.

## Phase 2: Backend AI & Express Runtime
- [x] **T-05:** Implement `server.ts` hosting Express API endpoints and Vite middleware on port `3000`.
- [x] **T-06:** Implement `POST /api/scan-material` using `gemini-4-hydrogen` multimodal vision with strict `Type` response schema.
- [x] **T-07:** Implement `POST /api/manufacture-product` using `gemini-4-hydrogen` structured generation for feasibility checks, BOM, cost estimates, and workflow synthesis.

## Phase 3: Persistent Ecosystem Store & Domain UI
- [x] **T-08:** Implement `src/types/regenesis.ts` and `src/store/useEcosystemStore.ts` managing inventory, impact totals, batch queues, and saved product history.
- [x] **T-09:** Build Landing & Onboarding View (`OverviewView.tsx`) with interactive Home / Business / Global tier preview cards.
- [x] **T-10:** Build AI Material Vision Scanner + Mode 1 Raw Material Creation Simulator (`ScannerView.tsx`) with camera/file upload, preset scanning, and animated stage processing.
- [x] **T-11:** Build Mode 2 AI Product Manufacturing Studio (`StudioView.tsx`) with inventory feedstock selection, customization controls, BOM viewer, and simulated production execution.
- [x] **T-12:** Build Switchable Ecosystem Dashboards (`EcosystemView.tsx`) for `HOME`, `BUSINESS`, and `GLOBAL` operational views.
- [x] **T-13:** Build Material Inventory, Sustainability Impact & Product History Ledger (`InventoryView.tsx`) with CSV export and stock adjustment.

## Phase 4: Verification & Quality Gate
- [x] **T-14:** Run TypeScript verification (`npm run lint`) and production bundle build (`npm run build`).
- [x] **T-15:** Validate interactive flows, mobile thumb-zone ergonomics, and API responses in the live browser runtime.
