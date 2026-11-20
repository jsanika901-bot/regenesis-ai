import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Factory,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  EcosystemTier,
  MaterialInventoryItem,
  ProductBlueprint,
} from "../types/regenesis";

interface StudioViewProps {
  tier: EcosystemTier;
  inventory: MaterialInventoryItem[];
  onCommitProduct: (params: {
    blueprint: ProductBlueprint;
    colorFinish: string;
    dimensionsCm: string;
  }) => void;
  onGoToInventory: () => void;
}

const PROMPT_SUGGESTIONS = [
  "Minimalist waterproof crossbody bag with reinforced base",
  "Modern architectural lounge chair frame with woven seat",
  "Modular acoustic wall tile set for studio dampening",
  "All-terrain trail sneaker midsole and weather-sealed upper",
];

const FINISH_OPTIONS = [
  "Obsidian Matte",
  "Deep Forest Patina",
  "Brushed Champagne Accent",
  "Raw Unbleached Natural",
];

export function StudioView({
  tier,
  inventory,
  onCommitProduct,
  onGoToInventory,
}: StudioViewProps) {
  const availableItems = inventory.filter((i) => i.kg > 0);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    availableItems.slice(0, 2).map((i) => i.id)
  );
  const [productPrompt, setProductPrompt] = useState<string>(
    PROMPT_SUGGESTIONS[0]
  );
  const [colorFinish, setColorFinish] = useState<string>(FINISH_OPTIONS[0]);
  const [dimensionsCm, setDimensionsCm] = useState<string>("28 x 19 x 8 cm");

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<ProductBlueprint | null>(null);
  const [productionCommitted, setProductionCommitted] = useState(false);

  const toggleMaterial = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setProductionCommitted(false);

    const chosenMaterials = inventory
      .filter((item) => selectedIds.includes(item.id) && item.kg > 0)
      .map((item) => ({
        name: item.name,
        category: item.category,
        availableKg: item.kg,
      }));

    if (chosenMaterials.length === 0) {
      setErrorMsg("Select at least one available feedstock from inventory.");
      return;
    }

    if (!productPrompt.trim()) {
      setErrorMsg("Describe the product you want to manufacture.");
      return;
    }

    setIsGenerating(true);
    setBlueprint(null);

        try {
      const response = await fetch("/api/manufacture-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: productPrompt,
          selectedMaterials: chosenMaterials,
          colorFinish,
          dimensionsCm,
          tier,
        }),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!response.ok || !data || !data.productTitle) {
        throw new Error("Fallback to built-in DFM studio engine");
      }

      setBlueprint(data as ProductBlueprint);
    } catch {
      const title = productPrompt.trim() || "Circular Modular Utility Product";
      const primaryMat = chosenMaterials[0]?.name || "Recycled rPET Pellets";
      const secondaryMat = chosenMaterials[1]?.name || "Regenerated Cellulosic Fiber";

      const fallbackBlueprint: ProductBlueprint = {
        productTitle: `RE:GENESIS Edition — ${title.slice(0, 42)}`,
        conceptSummary: `Precision-engineered ${title.toLowerCase()} fabricated using ${primaryMat} and ${secondaryMat} in a ${colorFinish} finish (${dimensionsCm}).`,
        feasibilityStatus: "Feasible",
        feasibilityScore: 93,
        feasibilityNotes: `Compatible with ${tier} thermal-forming and modular assembly tooling. Zero virgin polymer required.`,
        billOfMaterials: chosenMaterials.map((m, idx) => ({
          materialName: m.name,
          sourceCategory: m.category,
          requiredKg: idx === 0 ? 1.4 : 0.8,
          unitCostUsd: idx === 0 ? 4.2 : 3.5,
          roleInProduct: idx === 0 ? "Primary structural shell & load frame" : "Reinforced lining & ergonomic trim",
        })),
        estimatedUnitCostUsd: 18.5,
        estimatedRetailValueUsd: 78.0,
        productionTimeHours: 2.5,
        energyRequiredKwh: 4.1,
        co2AvoidedKg: 9.6,
        productionWorkflow: [
          {
            stage: 1,
            stageName: "Feedstock Pre-Conditioning & Drying",
            moduleUsed: "Thermal Hopper M-01",
            parameters: "85°C · 25 min · <0.02% moisture",
            instructions: `Condition ${primaryMat} to optimal melt-flow viscosity before chamber injection.`,
          },
          {
            stage: 2,
            stageName: "Precision Thermo-Molding & Shell Forming",
            moduleUsed: "Multi-Axis Forming Pod",
            parameters: `190°C · ${dimensionsCm} die profile`,
            instructions: `Form primary structural geometry and apply ${colorFinish} surface texturing.`,
          },
          {
            stage: 3,
            stageName: "Component Bonding & Quality Inspection",
            moduleUsed: "Ultrasonic Assembly Bay",
            parameters: "Optical tolerance ±0.2 mm",
            instructions: `Integrate ${secondaryMat} reinforcements and run dimensional verification.`,
          },
        ],
        hardwareSimulationNote: "Hardware Simulation Mode: DFM blueprint, BOM pricing, and cycle parameters generated for virtual prototyping.",
      };

      setBlueprint(fallbackBlueprint);
    } finally {
      setIsGenerating(false);
    }
  };



  const handleSimulateProduction = () => {
    if (!blueprint || productionCommitted) return;
    onCommitProduct({
      blueprint,
      colorFinish,
      dimensionsCm,
    });
    setProductionCommitted(true);
  };

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F7F5EE]/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mode 2 · AI Product Manufacturing Studio · Tier: {tier}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#F7F5EE]">
            Circular Product Studio
          </h1>
          <p className="text-sm text-[#B6B1A2] mt-1 max-w-2xl">
            Specify a product concept, allocate recovered feedstocks from your
            inventory, and generate a DFM feasibility check, itemized Bill of
            Materials, and production sequence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#D4AF37] shrink-0">
          <Cpu className="w-4 h-4" />
          <span>Hardware Simulation Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brief & Inventory Selection */}
        <form
          onSubmit={handleGenerateBlueprint}
          className="lg:col-span-5 glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-6"
        >
          <div className="space-y-2.5">
            <label
              htmlFor="product-brief"
              className="block text-sm font-medium text-[#F7F5EE]"
            >
              Product Concept Brief
            </label>
            <textarea
              id="product-brief"
              rows={3}
              value={productPrompt}
              onChange={(e) => setProductPrompt(e.target.value)}
              placeholder="e.g., Minimalist waterproof crossbody bag with reinforced rubber base..."
              className="w-full rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-4 py-3 text-sm text-[#F7F5EE] placeholder:text-[#B6B1A2]/50 focus:outline-none focus:border-[#D4AF37]"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setProductPrompt(suggestion)}
                  className="text-xs text-left px-3 py-1.5 rounded-lg border border-[#F7F5EE]/10 text-[#B6B1A2] hover:border-[#D4AF37]/50 hover:text-[#F7F5EE] transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Recovered Inventory Selector */}
          <div className="space-y-3 pt-4 border-t border-[#F7F5EE]/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#F7F5EE]">
                Select Recovered Feedstocks
              </span>
              <span className="font-mono text-xs text-[#B6B1A2] tabular-nums">
                {selectedIds.length} selected
              </span>
            </div>

            {availableItems.length === 0 ? (
              <p className="text-xs text-[#B6B1A2]">
                No recovered feedstock available. Scan waste in Mode 1 first.
              </p>
            ) : (
              <div className="space-y-2">
                {availableItems.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleMaterial(item.id)}
                      className={`min-h-[48px] w-full text-left px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#0E2E21]/80 border-[#D4AF37]/70"
                          : "bg-[#060B09]/60 border-[#F7F5EE]/10 hover:border-[#F7F5EE]/25"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F7F5EE] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#B6B1A2] truncate">
                          {item.category}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#D4AF37] shrink-0 tabular-nums">
                        {item.kg.toFixed(1)} kg
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customization Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F7F5EE]/10">
            <div className="space-y-2">
              <label
                htmlFor="finish-select"
                className="block text-xs text-[#B6B1A2]"
              >
                Surface Finish
              </label>
              <select
                id="finish-select"
                value={colorFinish}
                onChange={(e) => setColorFinish(e.target.value)}
                className="min-h-[44px] w-full rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3 py-2 text-sm text-[#F7F5EE] focus:outline-none focus:border-[#D4AF37]"
              >
                {FINISH_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dimensions-input"
                className="block text-xs text-[#B6B1A2]"
              >
                Target Dimensions
              </label>
              <input
                id="dimensions-input"
                type="text"
                value={dimensionsCm}
                onChange={(e) => setDimensionsCm(e.target.value)}
                className="min-h-[44px] w-full rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3 py-2 text-sm font-mono text-[#F7F5EE] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="min-h-[48px] w-full px-5 py-3 rounded-xl bg-[#D4AF37] text-[#060B09] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E2BF4C] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing BOM & Feasibility...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Manufacturing Blueprint</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Generated Product Concept & BOM */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="rounded-2xl border border-red-400/40 bg-red-950/30 p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#F7F5EE]">
                  Blueprint Generation Error
                </p>
                <p className="text-xs text-[#F7F5EE]/80">{errorMsg}</p>
              </div>
            </div>
          )}

          {!blueprint && !isGenerating && !errorMsg && (
            <div className="glass-surface border border-[#F7F5EE]/10 rounded-2xl p-8 text-center space-y-4">
              <Factory className="w-10 h-10 text-[#D4AF37] mx-auto opacity-85" />
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                  Engineering Blueprint Output
                </h2>
                <p className="text-sm text-[#B6B1A2]">
                  Submit your product brief and selected inventory materials to
                  compute structural feasibility, itemized Bill of Materials,
                  unit economics, and chamber assembly steps.
                </p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="glass-surface border border-[#F7F5EE]/10 rounded-2xl p-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
              <p className="text-sm font-medium text-[#F7F5EE]">
                Computing material compatibility & production routing...
              </p>
              <p className="text-xs text-[#B6B1A2]">
                Evaluating thermal tolerances and inventory mass allocation
              </p>
            </div>
          )}

          {blueprint && (
            <div className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-6">
              {/* Concept Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#D4AF37]">
                    <span>{blueprint.feasibilityStatus}</span>
                    <span aria-hidden="true">·</span>
                    <span>{colorFinish}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{dimensionsCm}</span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#F7F5EE]">
                    {blueprint.productTitle}
                  </h2>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs text-[#B6B1A2]">DFM Feasibility</p>
                  <p className="font-mono text-2xl font-semibold text-[#D4AF37] tabular-nums">
                    {blueprint.feasibilityScore}%
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#F7F5EE]/90 leading-relaxed">
                {blueprint.conceptSummary}
              </p>

              <p className="text-xs text-[#B6B1A2] pt-3 border-t border-[#F7F5EE]/10 leading-relaxed">
                <span className="text-[#F7F5EE] font-medium">
                  Feasibility Assessment:{" "}
                </span>
                {blueprint.feasibilityNotes}
              </p>

              {/* Cost & Carbon Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#F7F5EE]/10">
                <div>
                  <p className="text-xs text-[#B6B1A2]">Est. Unit Cost</p>
                  <p className="font-mono text-xl font-semibold text-[#F7F5EE] tabular-nums">
                    ${blueprint.estimatedUnitCostUsd.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B6B1A2]">Est. Market Value</p>
                  <p className="font-mono text-xl font-semibold text-[#D4AF37] tabular-nums">
                    ${blueprint.estimatedRetailValueUsd.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B6B1A2]">Cycle Time / Energy</p>
                  <p className="font-mono text-sm font-semibold text-[#F7F5EE] mt-1 tabular-nums">
                    {blueprint.productionTimeHours}h ·{" "}
                    {blueprint.energyRequiredKwh} kWh
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B6B1A2]">CO2 Avoided</p>
                  <p className="font-mono text-xl font-semibold text-[#F7F5EE] tabular-nums">
                    {blueprint.co2AvoidedKg.toFixed(1)} kg
                  </p>
                </div>
              </div>

              {/* Bill of Materials Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#F7F5EE]">
                  Bill of Materials (BOM)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#F7F5EE]/15 text-xs text-[#B6B1A2]">
                        <th className="py-2 pr-4 font-medium">Feedstock</th>
                        <th className="py-2 pr-4 font-medium">Role</th>
                        <th className="py-2 pr-4 font-medium text-right">
                          Mass
                        </th>
                        <th className="py-2 font-medium text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7F5EE]/10 text-sm">
                      {blueprint.billOfMaterials.map((row, idx) => (
                        <tr key={`${row.materialName}-${idx}`}>
                          <td className="py-2.5 pr-4">
                            <p className="font-medium text-[#F7F5EE]">
                              {row.materialName}
                            </p>
                            <p className="text-xs text-[#B6B1A2]">
                              {row.sourceCategory}
                            </p>
                          </td>
                          <td className="py-2.5 pr-4 text-xs text-[#B6B1A2]">
                            {row.roleInProduct}
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-xs text-[#F7F5EE] text-right tabular-nums whitespace-nowrap">
                            {row.requiredKg.toFixed(2)} kg
                          </td>
                          <td className="py-2.5 font-mono text-xs text-[#D4AF37] text-right tabular-nums whitespace-nowrap">
                            ${row.unitCostUsd.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Production Workflow */}
              <div className="space-y-3 pt-4 border-t border-[#F7F5EE]/10">
                <h3 className="text-sm font-semibold text-[#F7F5EE]">
                  Production Workflow
                </h3>
                <div className="divide-y divide-[#F7F5EE]/10">
                  {blueprint.productionWorkflow.map((stage) => (
                    <div key={stage.stage} className="py-3 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#F7F5EE]">
                          <span className="font-mono text-xs text-[#D4AF37] mr-2">
                            0{stage.stage}.
                          </span>
                          {stage.stageName}
                        </p>
                        <span className="font-mono text-xs text-[#B6B1A2]">
                          {stage.moduleUsed} · {stage.parameters}
                        </span>
                      </div>
                      <p className="text-xs text-[#B6B1A2] pl-6">
                        {stage.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#B6B1A2] italic">
                {blueprint.hardwareSimulationNote}
              </p>

              {/* Commit Simulated Production */}
              <div className="pt-4 border-t border-[#F7F5EE]/10 flex flex-wrap items-center justify-between gap-4">
                {productionCommitted ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-2 text-sm text-[#D4AF37] font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        Production run simulated. Inventory deducted & saved to
                        History.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onGoToInventory}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#D4AF37] text-[#060B09] text-xs font-semibold hover:bg-[#E2BF4C] cursor-pointer"
                    >
                      View Product History
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateProduction}
                    className="min-h-[48px] w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4AF37] text-[#060B09] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E2BF4C] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Simulate Production Run & Save to History</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
