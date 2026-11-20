# RE:GENESIS AI — Architecture & System Design

## 1. System Topology
RE:GENESIS AI follows a decoupled full-stack TypeScript architecture served from a single Express + Vite runtime on port `3000`:

```
+-------------------------------------------------------------+
|                    Client SPA (React 19)                    |
|  - Responsive Shell (Desktop Top Bar + Mobile Thumb Dock)   |
|  - Views: Overview | Scanner | Studio | Ecosystem | Ledger  |
|  - Persistent Client State (useEcosystemStore / localStorage)|
+------------------------------+------------------------------+
                               | HTTPS / JSON (fetch /api/*)
                               v
+-------------------------------------------------------------+
|                 Express API Server (server.ts)              |
|  - POST /api/scan-material      (Multimodal Vision Schema)  |
|  - POST /api/manufacture-product (BOM & Workflow Synthesis) |
|  - Vite Dev Middleware / Static Production Assets           |
+------------------------------+------------------------------+
                               | @google/genai SDK (Server-only)
                               v
+-------------------------------------------------------------+
|                 Gemini 4 Hydrogen Multimodal                |
|  - Structured JSON output via responseSchema + Type enum    |
+-------------------------------------------------------------+
```

---

## 2. Visual & Interaction Design System
- **Canvas & Surfaces:** Obsidian Black (`#060B09`) primary canvas, Deep Forest Green (`#0A2218` / `#0E2D20`) structural panels with subtle translucent glassmorphism (`backdrop-blur-md`) and `1px` champagne/ivory hairline borders.
- **Typography:** `Outfit` for architectural display titles, `Plus Jakarta Sans` for dense UI prose, and `JetBrains Mono` (`tabular-nums`) for mass, thermal, energy, and BOM telemetry.
- **Navigation Contract:**
  - Desktop (`md+`): 3-zone single-row header (`RE:GENESIS AI` wordmark, 5 concise navigation links, 1 primary CTA).
  - Mobile (`<md`): Compact sticky top bar + fixed bottom 5-tab thumb dock (`<= 15%` combined viewport height cap).

---

## 3. Data Contracts

### 3.1 `MaterialScanResult`
```typescript
interface MaterialScanResult {
  itemName: string;
  materialCategory: string;
  conditionGrade: string;
  recyclabilityScore: number;
  compatibleModule: string;
  estimatedWeightKg: number;
  recoveryYieldPercent: number;
  feedstockOutputName: string;
  energyEstimateKwh: number;
  co2SavedKg: number;
  processSteps: Array<{
    stepNumber: number;
    title: string;
    temperatureC: number;
    durationMin: number;
    description: string;
  }>;
  chemicalPurityNotes: string;
  sensorDisclaimer: string;
}
```

### 3.2 `ProductBlueprint`
```typescript
interface ProductBlueprint {
  productTitle: string;
  conceptSummary: string;
  feasibilityStatus: 'Feasible' | 'Feasible with Reinforcement' | 'Requires Additional Feedstock';
  feasibilityScore: number;
  feasibilityNotes: string;
  billOfMaterials: Array<{
    materialName: string;
    sourceCategory: string;
    requiredKg: number;
    unitCostUsd: number;
    roleInProduct: string;
  }>;
  estimatedUnitCostUsd: number;
  estimatedRetailValueUsd: number;
  productionTimeHours: number;
  energyRequiredKwh: number;
  co2AvoidedKg: number;
  productionWorkflow: Array<{
    stage: number;
    stageName: string;
    moduleUsed: string;
    parameters: string;
    instructions: string;
  }>;
  hardwareSimulationNote: string;
}
```

---

## 4. Hardware Simulation Boundaries
All physical thermal, cryogenic, extrusion, and CNC actuation steps are explicitly flagged as **Hardware Simulation Mode**. Visual AI material classification includes an explicit non-certifiable purity disclaimer requiring physical NIR/FTIR sensors in production deployments.
