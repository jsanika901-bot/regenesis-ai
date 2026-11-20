export type AppTab = "overview" | "scanner" | "studio" | "ecosystem" | "inventory";

export type EcosystemTier = "HOME" | "BUSINESS" | "GLOBAL";

export interface ProcessStep {
  stepNumber: number;
  title: string;
  temperatureC: number;
  durationMin: number;
  description: string;
}

export interface MaterialScanResult {
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
  processSteps: ProcessStep[];
  chemicalPurityNotes: string;
  sensorDisclaimer: string;
}

export interface BomItem {
  materialName: string;
  sourceCategory: string;
  requiredKg: number;
  unitCostUsd: number;
  roleInProduct: string;
}

export interface ProductionStage {
  stage: number;
  stageName: string;
  moduleUsed: string;
  parameters: string;
  instructions: string;
}

export interface ProductBlueprint {
  productTitle: string;
  conceptSummary: string;
  feasibilityStatus:
    | "Feasible"
    | "Feasible with Reinforcement"
    | "Requires Additional Feedstock";
  feasibilityScore: number;
  feasibilityNotes: string;
  billOfMaterials: BomItem[];
  estimatedUnitCostUsd: number;
  estimatedRetailValueUsd: number;
  productionTimeHours: number;
  energyRequiredKwh: number;
  co2AvoidedKg: number;
  productionWorkflow: ProductionStage[];
  hardwareSimulationNote: string;
}

export interface MaterialInventoryItem {
  id: string;
  name: string;
  category: string;
  kg: number;
  purityGrade: string;
  lastUpdated: string;
  unitValueUsd: number;
}

export interface SavedProductRecord {
  id: string;
  createdAt: string;
  tier: EcosystemTier;
  colorFinish: string;
  dimensionsCm: string;
  blueprint: ProductBlueprint;
  simulatedUnitsProduced: number;
}

export interface BatchQueueJob {
  id: string;
  feedstockName: string;
  inputKg: number;
  outputKg: number;
  module: string;
  status: "Scheduled" | "In Chamber" | "Completed";
  scheduledFor: string;
}

export interface SustainabilityMetrics {
  co2SavedKg: number;
  landfillDivertedKg: number;
  waterSavedLiters: number;
  batchesCompleted: number;
  productsManufactured: number;
}

export interface WastePreset {
  id: string;
  title: string;
  subtitle: string;
  categoryHint: string;
  defaultWeightKg: number;
  imageUrl: string;
}
