import { useState } from "react";
import {
  Download,
  History,
  Minus,
  Package,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  MaterialInventoryItem,
  SavedProductRecord,
  SustainabilityMetrics,
} from "../types/regenesis";

interface InventoryViewProps {
  inventory: MaterialInventoryItem[];
  savedProducts: SavedProductRecord[];
  metrics: SustainabilityMetrics;
  onAdjustMass: (id: string, deltaKg: number) => void;
  onAddFeedstock: (name: string, category: string, kg: number) => void;
  onResetDefaults: () => void;
}

const CATEGORIES = [
  "PET Plastic",
  "Cotton & Denim Textile",
  "Vulcanized Rubber",
  "Reclaimed Leather",
  "Timber & Wood",
  "Mixed Alloy & Metal",
];

export function InventoryView({
  inventory,
  savedProducts,
  metrics,
  onAdjustMass,
  onAddFeedstock,
  onResetDefaults,
}: InventoryViewProps) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newKg, setNewKg] = useState(2.5);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    savedProducts[0]?.id ?? null
  );

  const totalKg = inventory.reduce((sum, item) => sum + item.kg, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newKg <= 0) return;
    onAddFeedstock(newName, newCategory, newKg);
    setNewName("");
  };

  const handleExportCsv = () => {
    const header = "Feedstock,Category,Mass_kg,Purity_Grade,Last_Updated,Unit_Value_USD\n";
    const rows = inventory
      .map(
        (i) =>
          `"${i.name}","${i.category}",${i.kg},"${i.purityGrade}",${i.lastUpdated},${i.unitValueUsd}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "regenesis-material-inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F7F5EE]/10 pb-6">
        <div>
          <p className="text-xs text-[#D4AF37] mb-1.5">
            Recovered Feedstock Ledger & Sustainability Impact
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#F7F5EE]">
            Inventory & Circular History
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#F7F5EE]/20 text-xs font-medium text-[#F7F5EE] hover:border-[#D4AF37] hover:text-[#D4AF37] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#F7F5EE]/15 text-xs font-medium text-[#B6B1A2] hover:text-[#F7F5EE] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Sustainability Impact Dashboard */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6">
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Total CO2 Avoided</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#D4AF37] tabular-nums">
            {metrics.co2SavedKg.toFixed(1)} kg
          </p>
          <p className="text-xs text-[#B6B1A2]">vs. virgin polymer baseline</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Landfill Diverted</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#F7F5EE] tabular-nums">
            {metrics.landfillDivertedKg.toFixed(1)} kg
          </p>
          <p className="text-xs text-[#B6B1A2]">
            {metrics.batchesCompleted} recovery runs
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Process Water Saved</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#F7F5EE] tabular-nums">
            {metrics.waterSavedLiters.toLocaleString()} L
          </p>
          <p className="text-xs text-[#B6B1A2]">closed-loop filtration</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Active Feedstock Mass</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#F7F5EE] tabular-nums">
            {totalKg.toFixed(1)} kg
          </p>
          <p className="text-xs text-[#B6B1A2]">
            {inventory.length} material streams
          </p>
        </div>
      </section>

      {/* Material Inventory Tracker */}
      <section className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
              Recovered Material Inventory
            </h2>
          </div>
          <span className="text-xs text-[#B6B1A2]">
            Adjust quantities or log manual recovered feedstock
          </span>
        </div>

        {/* Manual Entry Form */}
        <form
          onSubmit={handleAddSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-4 border-b border-[#F7F5EE]/10"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Feedstock name (e.g., Sorted HDPE Flakes)"
            className="sm:col-span-5 min-h-[44px] rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3.5 text-sm text-[#F7F5EE] placeholder:text-[#B6B1A2]/50 focus:outline-none focus:border-[#D4AF37]"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="sm:col-span-3 min-h-[44px] rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3 text-sm text-[#F7F5EE]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={newKg}
            onChange={(e) => setNewKg(Number(e.target.value))}
            aria-label="Mass in kilograms"
            className="sm:col-span-2 min-h-[44px] rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3 text-sm font-mono text-[#F7F5EE]"
          />
          <button
            type="submit"
            className="sm:col-span-2 min-h-[44px] rounded-xl bg-[#D4AF37] text-[#060B09] text-xs font-semibold hover:bg-[#E2BF4C] cursor-pointer"
          >
            Add Stock
          </button>
        </form>

        {/* Inventory Rows */}
        <div className="divide-y divide-[#F7F5EE]/10">
          {inventory.map((item) => {
            const sharePercent =
              totalKg > 0 ? Math.round((item.kg / totalKg) * 100) : 0;
            return (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-medium text-[#F7F5EE]">
                      {item.name}
                    </span>
                    <span className="text-xs text-[#B6B1A2]">
                      · {item.category} · {item.purityGrade}
                    </span>
                  </div>

                  {/* Clean horizontal allocation bar */}
                  <div className="flex items-center gap-3 max-w-md pt-1">
                    <div className="h-1.5 flex-1 rounded-full bg-[#060B09] overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37] transition-all"
                        style={{ width: `${Math.min(100, sharePercent)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-[#B6B1A2] tabular-nums">
                      {sharePercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="font-mono text-lg font-semibold text-[#F7F5EE] tabular-nums">
                    {item.kg.toFixed(2)} kg
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAdjustMass(item.id, -0.5)}
                      aria-label={`Decrease ${item.name} by 0.5 kg`}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-[#F7F5EE]/15 flex items-center justify-center text-[#B6B1A2] hover:text-[#F7F5EE] hover:border-[#F7F5EE]/40 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustMass(item.id, 0.5)}
                      aria-label={`Increase ${item.name} by 0.5 kg`}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-[#F7F5EE]/15 flex items-center justify-center text-[#B6B1A2] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saved Product History */}
      <section className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
            Saved Product Manufacturing History
          </h2>
        </div>

        {savedProducts.length === 0 ? (
          <p className="text-sm text-[#B6B1A2]">
            No products manufactured yet. Open the Product Studio to generate
            and simulate a build.
          </p>
        ) : (
          <div className="divide-y divide-[#F7F5EE]/10">
            {savedProducts.map((record) => {
              const isExpanded = expandedProductId === record.id;
              return (
                <div key={record.id} className="py-4 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProductId(isExpanded ? null : record.id)
                    }
                    className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer min-h-[44px]"
                  >
                    <div>
                      <p className="text-base font-semibold text-[#F7F5EE]">
                        {record.blueprint.productTitle}
                      </p>
                      <p className="text-xs text-[#B6B1A2]">
                        {record.tier} Tier · {record.colorFinish} ·{" "}
                        {record.dimensionsCm} ·{" "}
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-xs text-[#D4AF37] tabular-nums">
                        {record.blueprint.co2AvoidedKg.toFixed(1)} kg CO2 saved
                      </span>
                      <span className="text-xs text-[#B6B1A2]">
                        {isExpanded ? "Hide Specs" : "Inspect BOM"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="pt-3 pl-2 space-y-3 border-t border-[#F7F5EE]/10 text-xs text-[#B6B1A2]">
                      <p className="text-sm text-[#F7F5EE]/90">
                        {record.blueprint.conceptSummary}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {record.blueprint.billOfMaterials.map((bom, idx) => (
                          <div
                            key={`${record.id}-bom-${idx}`}
                            className="flex justify-between py-1.5 border-b border-[#F7F5EE]/10"
                          >
                            <span className="text-[#F7F5EE]">
                              {bom.materialName}
                            </span>
                            <span className="font-mono text-[#D4AF37] tabular-nums">
                              {bom.requiredKg.toFixed(2)} kg ($
                              {bom.unitCostUsd.toFixed(2)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
