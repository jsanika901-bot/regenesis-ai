import { useCallback, useEffect, useState } from "react";
import {
  INITIAL_BATCH_QUEUE,
  INITIAL_INVENTORY,
  INITIAL_SAVED_PRODUCTS,
} from "../data/presets";
import {
  BatchQueueJob,
  EcosystemTier,
  MaterialInventoryItem,
  ProductBlueprint,
  SavedProductRecord,
  SustainabilityMetrics,
} from "../types/regenesis";

interface PersistedState {
  tier: EcosystemTier;
  inventory: MaterialInventoryItem[];
  savedProducts: SavedProductRecord[];
  batchQueue: BatchQueueJob[];
  metrics: SustainabilityMetrics;
}

const STORAGE_KEY = "regenesis_ecosystem_v1";

const DEFAULT_METRICS: SustainabilityMetrics = {
  co2SavedKg: 118.4,
  landfillDivertedKg: 54.2,
  waterSavedLiters: 1840,
  batchesCompleted: 14,
  productsManufactured: 2,
};

function loadInitialState(): PersistedState {
  if (typeof window === "undefined") {
    return {
      tier: "HOME",
      inventory: INITIAL_INVENTORY,
      savedProducts: INITIAL_SAVED_PRODUCTS,
      batchQueue: INITIAL_BATCH_QUEUE,
      metrics: DEFAULT_METRICS,
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        tier: "HOME",
        inventory: INITIAL_INVENTORY,
        savedProducts: INITIAL_SAVED_PRODUCTS,
        batchQueue: INITIAL_BATCH_QUEUE,
        metrics: DEFAULT_METRICS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      tier: parsed.tier ?? "HOME",
      inventory:
        Array.isArray(parsed.inventory) && parsed.inventory.length > 0
          ? parsed.inventory
          : INITIAL_INVENTORY,
      savedProducts: Array.isArray(parsed.savedProducts)
        ? parsed.savedProducts
        : INITIAL_SAVED_PRODUCTS,
      batchQueue: Array.isArray(parsed.batchQueue)
        ? parsed.batchQueue
        : INITIAL_BATCH_QUEUE,
      metrics: parsed.metrics ?? DEFAULT_METRICS,
    };
  } catch {
    return {
      tier: "HOME",
      inventory: INITIAL_INVENTORY,
      savedProducts: INITIAL_SAVED_PRODUCTS,
      batchQueue: INITIAL_BATCH_QUEUE,
      metrics: DEFAULT_METRICS,
    };
  }
}

export function useEcosystemStore() {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [state]);

  const setTier = useCallback((tier: EcosystemTier) => {
    setState((prev) => ({ ...prev, tier }));
  }, []);

  const commitRecoveredMaterial = useCallback(
    (params: {
      feedstockName: string;
      category: string;
      recoveredKg: number;
      inputWasteKg: number;
      co2SavedKg: number;
      purityGrade: string;
      moduleName: string;
    }) => {
      const today = new Date().toISOString().slice(0, 10);
      setState((prev) => {
        const existingIndex = prev.inventory.findIndex(
          (item) =>
            item.name.toLowerCase() === params.feedstockName.toLowerCase() ||
            item.category.toLowerCase() === params.category.toLowerCase()
        );

        let updatedInventory: MaterialInventoryItem[];
        if (existingIndex >= 0) {
          updatedInventory = prev.inventory.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  kg: Number((item.kg + params.recoveredKg).toFixed(2)),
                  lastUpdated: today,
                }
              : item
          );
        } else {
          updatedInventory = [
            {
              id: `inv-${Date.now()}`,
              name: params.feedstockName,
              category: params.category,
              kg: Number(params.recoveredKg.toFixed(2)),
              purityGrade: params.purityGrade,
              lastUpdated: today,
              unitValueUsd: 4.2,
            },
            ...prev.inventory,
          ];
        }

        const newBatch: BatchQueueJob = {
          id: `batch-${Date.now().toString().slice(-4)}`,
          feedstockName: params.feedstockName,
          inputKg: Number(params.inputWasteKg.toFixed(2)),
          outputKg: Number(params.recoveredKg.toFixed(2)),
          module: params.moduleName,
          status: "Completed",
          scheduledFor: "Just now",
        };

        return {
          ...prev,
          inventory: updatedInventory,
          batchQueue: [newBatch, ...prev.batchQueue],
          metrics: {
            ...prev.metrics,
            co2SavedKg: Number(
              (prev.metrics.co2SavedKg + params.co2SavedKg).toFixed(1)
            ),
            landfillDivertedKg: Number(
              (prev.metrics.landfillDivertedKg + params.inputWasteKg).toFixed(1)
            ),
            waterSavedLiters: Math.round(
              prev.metrics.waterSavedLiters + params.inputWasteKg * 34
            ),
            batchesCompleted: prev.metrics.batchesCompleted + 1,
          },
        };
      });
    },
    []
  );

  const commitManufacturedProduct = useCallback(
    (params: {
      blueprint: ProductBlueprint;
      colorFinish: string;
      dimensionsCm: string;
    }) => {
      const today = new Date().toISOString().slice(0, 10);
      setState((prev) => {
        const updatedInventory = prev.inventory.map((item) => {
          const matchingBom = params.blueprint.billOfMaterials.find(
            (b) =>
              b.materialName.toLowerCase() === item.name.toLowerCase() ||
              b.sourceCategory.toLowerCase() === item.category.toLowerCase()
          );
          if (!matchingBom) return item;
          const nextKg = Math.max(0, item.kg - matchingBom.requiredKg);
          return {
            ...item,
            kg: Number(nextKg.toFixed(2)),
            lastUpdated: today,
          };
        });

        const record: SavedProductRecord = {
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          tier: prev.tier,
          colorFinish: params.colorFinish,
          dimensionsCm: params.dimensionsCm,
          blueprint: params.blueprint,
          simulatedUnitsProduced: 1,
        };

        return {
          ...prev,
          inventory: updatedInventory,
          savedProducts: [record, ...prev.savedProducts],
          metrics: {
            ...prev.metrics,
            co2SavedKg: Number(
              (
                prev.metrics.co2SavedKg + params.blueprint.co2AvoidedKg
              ).toFixed(1)
            ),
            productsManufactured: prev.metrics.productsManufactured + 1,
          },
        };
      });
    },
    []
  );

  const adjustInventoryMass = useCallback((id: string, deltaKg: number) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              kg: Number(Math.max(0, item.kg + deltaKg).toFixed(2)),
              lastUpdated: today,
            }
          : item
      ),
    }));
  }, []);

  const addManualFeedstock = useCallback(
    (name: string, category: string, kg: number) => {
      const today = new Date().toISOString().slice(0, 10);
      setState((prev) => ({
        ...prev,
        inventory: [
          {
            id: `inv-${Date.now()}`,
            name: name.trim(),
            category,
            kg: Number(Math.max(0.1, kg).toFixed(2)),
            purityGrade: "Grade B · Manual Entry",
            lastUpdated: today,
            unitValueUsd: 3.8,
          },
          ...prev.inventory,
        ],
      }));
    },
    []
  );

  const scheduleBusinessBatch = useCallback(
    (feedstockName: string, inputKg: number, module: string) => {
      setState((prev) => ({
        ...prev,
        batchQueue: [
          {
            id: `batch-${Date.now().toString().slice(-4)}`,
            feedstockName,
            inputKg: Number(inputKg.toFixed(1)),
            outputKg: Number((inputKg * 0.86).toFixed(1)),
            module,
            status: "Scheduled",
            scheduledFor: "Next Shift · +2h",
          },
          ...prev.batchQueue,
        ],
      }));
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    const fresh: PersistedState = {
      tier: "HOME",
      inventory: INITIAL_INVENTORY,
      savedProducts: INITIAL_SAVED_PRODUCTS,
      batchQueue: INITIAL_BATCH_QUEUE,
      metrics: DEFAULT_METRICS,
    };
    setState(fresh);
  }, []);

  return {
    tier: state.tier,
    inventory: state.inventory,
    savedProducts: state.savedProducts,
    batchQueue: state.batchQueue,
    metrics: state.metrics,
    setTier,
    commitRecoveredMaterial,
    commitManufacturedProduct,
    adjustInventoryMass,
    addManualFeedstock,
    scheduleBusinessBatch,
    resetToDefaults,
  };
}
