# RE:GENESIS AI — Product Requirements Specification

## 1. Overview & Vision
**Product Name:** RE:GENESIS AI  
**Tagline:** Nothing Is Waste. Everything Has a Second Life.  
**Domain:** Circular Manufacturing, AI Material Recovery & Distributed Micro-Factory Ecosystem

RE:GENESIS AI bridges post-consumer waste identification with localized remanufacturing. Using multimodal Gemini Vision analysis and physically grounded hardware simulation modules, users transform discarded household and industrial materials into certified feedstock and engineered finished products.

---

## 2. Functional Requirements (EARS Format)

### FR-01: Landing & Ecosystem Onboarding
- **FR-01.1:** When a user opens the application, the system shall present the RE:GENESIS AI hero narrative, a primary "Launch Ecosystem" action, and an interactive overview of the three hardware tiers (`HOME`, `BUSINESS`, `GLOBAL`).
- **FR-01.2:** When a user selects a hardware tier from the landing overview, the system shall update the active ecosystem tier context and reflect tier-appropriate metrics.

### FR-02: AI Material Vision Scanner
- **FR-02.1:** The scanner shall accept user-uploaded images, mobile camera captures, or curated studio waste presets (PET bottles, denim/cotton textiles, vulcanized rubber soles, leather and walnut wood offcuts).
- **FR-02.2:** When an image is submitted for analysis, the backend server shall invoke `@google/genai` (`gemini-4-hydrogen`) with a strict JSON response schema to classify Material Category, Condition Grade, Recyclability Score (0–100), Compatible Processing Module, Estimated Recovery Yield, and Energy Estimate.
- **FR-02.3:** The scanner output shall prominently display an engineering disclaimer stating that visual AI estimates require physical NIR spectroscopy or DSC thermal sensors for lab-grade chemical purity certification.

### FR-03: Mode 1 — Raw Material Creation Simulator
- **FR-03.1:** While operating in Raw Material Creation mode, the system shall display a clear `Hardware Simulation Mode` indicator.
- **FR-03.2:** When the user specifies an input batch mass (kg) and initiates the processing simulation, the simulator shall step through module-specific thermal and mechanical stages (e.g., Granulation, Hydro-Wash, Extrusion, Pelletizing) and credit the recovered feedstock mass and CO2 savings into the persistent Material Inventory.

### FR-04: Mode 2 — AI Product Manufacturing Studio
- **FR-04.1:** Users shall be able to describe a target product via freeform text, choose one or more feedstocks from their live Material Inventory, and specify surface color finish and outer dimensions (cm).
- **FR-04.2:** When generating a concept, the server shall call Gemini AI to synthesize a complete Product Concept, Manufacturing Feasibility Check, itemized Bill of Materials (BOM), unit cost/value estimate, and step-by-step production workflow.
- **FR-04.3:** When a user commits a simulated production run, the system shall deduct required feedstock kg from the Material Inventory, increment CO2 avoided metrics, and append the build record to Saved Product History.

### FR-05: Three Switchable Ecosystem Tiers
- **FR-05.1 (HOME):** Provide a compact household processing unit simulator (`RG-Home Core`), chamber status indicators, and personal waste-to-product tracking.
- **FR-05.2 (BUSINESS):** Provide a workshop/micro-factory console with local inventory valuation, batch processing scheduler, cost calculator, and local buyer/supplier exchange matching.
- **FR-05.3 (GLOBAL):** Provide a macro circular exchange network view displaying cross-industry material supply/demand balances, regional exchange corridors, and aggregate carbon/landfill diversion metrics.

### FR-06: Inventory, Sustainability & History Persistence
- **FR-06.1:** All recovered feedstock quantities, sustainability metrics (CO2 saved, landfill diverted), and manufactured product histories shall persist across page reloads via browser storage with instant state synchronization and CSV export support.

---

## 3. Non-Functional Requirements
- **NFR-01 (Mobile-First Ergonomics):** Primary navigation via a fixed bottom thumb dock on mobile viewports (`>= 44px` touch targets) expanding seamlessly to a full multi-column desktop workspace (`1280px–1440px`).
- **NFR-02 (Security):** All `@google/genai` SDK calls execute exclusively on the Express backend (`/api/*`) using server-side `GEMINI_API_KEY`.
- **NFR-03 (Accessibility & Contrast):** Deep Forest Green (`#0A2218`), Obsidian Black (`#060B09`), Champagne Gold (`#D4AF37`), and Warm Ivory (`#F7F5EE`) palette maintaining WCAG AA contrast ratios and tabular numerals for all quantitative metrics.
