import { useState } from "react";
import {
  CheckCircle2,
  Cpu,
  Factory,
  Globe,
  Home,
  Plus,
  Send,
} from "lucide-react";
import {
  BUSINESS_EXCHANGE_PARTNERS,
  GLOBAL_EXCHANGE_CORRIDORS,
  TIER_DESCRIPTIONS,
} from "../data/presets";
import {
  BatchQueueJob,
  EcosystemTier,
  MaterialInventoryItem,
  SavedProductRecord,
  SustainabilityMetrics,
} from "../types/regenesis";

interface EcosystemViewProps {
  activeTier: EcosystemTier;
  onSelectTier: (tier: EcosystemTier) => void;
  inventory: MaterialInventoryItem[];
  savedProducts: SavedProductRecord[];
  batchQueue: BatchQueueJob[];
  metrics: SustainabilityMetrics;
  onScheduleBatch: (feedstockName: string, inputKg: number, module: string) => void;
}

export function EcosystemView({
  activeTier,
  onSelectTier,
  inventory,
  savedProducts,
  batchQueue,
  metrics,
  onScheduleBatch,
}: EcosystemViewProps) {
  // HOME unit simulator state
  const [homeChamberActive, setHomeChamberActive] = useState(false);
  const [homeCycleTemp, setHomeCycleTemp] = useState(28);

  // BUSINESS calculator & partner state
  const [calcInputKg, setCalcInputKg] = useState(45);
  const [calcElectricityRate, setCalcElectricityRate] = useState(0.14);
  const [requestedPartnerIds, setRequestedPartnerIds] = useState<string[]>([]);
  const [newBatchFeedstock, setNewBatchFeedstock] = useState(
    inventory[0]?.name || "Recycled rPET Pellets"
  );
  const [newBatchKg, setNewBatchKg] = useState(25);

  const tierSpec = TIER_DESCRIPTIONS[activeTier];
  const totalInventoryKg = inventory.reduce((s, i) => s + i.kg, 0);
  const inventoryValuationUsd = inventory.reduce(
    (s, i) => s + i.kg * i.unitValueUsd,
    0
  );

  const handleToggleHomeChamber = () => {
    setHomeChamberActive((prev) => {
      const next = !prev;
      setHomeCycleTemp(next ? 215 : 28);
      return next;
    });
  };

  const handleRequestExchange = (partnerId: string) => {
    setRequestedPartnerIds((prev) =>
      prev.includes(partnerId) ? prev : [...prev, partnerId]
    );
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBatchKg <= 0) return;
    onScheduleBatch(
      newBatchFeedstock,
      newBatchKg,
      "Business Multi-Stream Granulator B-02"
    );
  };

  const estimatedBatchRevenueUsd = calcInputKg * 0.86 * 4.1;
  const estimatedPowerCostUsd = calcInputKg * 0.42 * calcElectricityRate;
  const estimatedNetMarginUsd = estimatedBatchRevenueUsd - estimatedPowerCostUsd;

  return (
    <div className="space-y-8 pb-8">
      {/* Header + Segmented Tier Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#F7F5EE]/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] mb-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware Simulation Mode · Switchable Operational Tiers</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#F7F5EE]">
            {tierSpec.name}
          </h1>
          <p className="text-sm text-[#B6B1A2] mt-1">{tierSpec.subtitle}</p>
        </div>

        {/* Tier Segmented Buttons */}
        <div
          role="tablist"
          aria-label="Ecosystem Tier Switcher"
          className="inline-flex p-1 rounded-xl bg-[#0A2218] border border-[#F7F5EE]/10 self-start lg:self-auto"
        >
          {(
            [
              { id: "HOME", label: "Home", icon: Home },
              { id: "BUSINESS", label: "Business", icon: Factory },
              { id: "GLOBAL", label: "Global", icon: Globe },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTier === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTier(tab.id)}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#D4AF37] text-[#060B09] font-semibold"
                    : "text-[#B6B1A2] hover:text-[#F7F5EE]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TIER 1: RE:GENESIS HOME */}
      {activeTier === "HOME" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Compact Household Unit Simulator */}
            <div className="lg:col-span-7 glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#D4AF37]">
                    RG-Home Core · Hardware Simulation Mode
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#F7F5EE] mt-0.5">
                    Residential Unit Chamber Telemetry
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleToggleHomeChamber}
                  className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    homeChamberActive
                      ? "border border-[#D4AF37] text-[#D4AF37] bg-[#0E2E21]"
                      : "bg-[#D4AF37] text-[#060B09] hover:bg-[#E2BF4C]"
                  }`}
                >
                  {homeChamberActive
                    ? "Pause Thermal Pre-Heat"
                    : "Engage Standby Pre-Heat"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F7F5EE]/10">
                <div>
                  <p className="text-xs text-[#B6B1A2]">Chamber State</p>
                  <p className="text-base font-semibold text-[#F7F5EE] mt-1">
                    {homeChamberActive ? "Active Thermal Hold" : "Ready / Idle"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B6B1A2]">Extrusion Nozzle</p>
                  <p className="font-mono text-2xl font-semibold text-[#D4AF37] mt-0.5 tabular-nums">
                    {homeCycleTemp}°C
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B6B1A2]">HEPA Carbon Filter</p>
                  <p className="font-mono text-2xl font-semibold text-[#F7F5EE] mt-0.5 tabular-nums">
                    94%
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F7F5EE]/10">
                <p className="text-xs font-medium text-[#B6B1A2]">
                  Home Module Health
                </p>
                <div className="divide-y divide-[#F7F5EE]/10 text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#F7F5EE]">
                      Optical Vision Inlet Camera
                    </span>
                    <span className="font-mono text-xs text-[#D4AF37]">
                      Calibrated
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#F7F5EE]">
                      Micro-Pelletizer & Shredder M-01
                    </span>
                    <span className="font-mono text-xs text-[#F7F5EE]">
                      Nominal · 0.4 kW draw
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#F7F5EE]">
                      Closed-Loop Water Wash Cartridge
                    </span>
                    <span className="font-mono text-xs text-[#F7F5EE]">
                      3.2 L Recirculating
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Waste-to-Product Tracker */}
            <div className="lg:col-span-5 glass-surface border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                  Personal Waste-to-Product Log
                </h2>
                <p className="text-xs text-[#B6B1A2] mt-1">
                  Household circular output recorded across sessions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#F7F5EE]/10">
                <div>
                  <p className="text-xs text-[#B6B1A2]">Household Diverted</p>
                  <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                    {metrics.landfillDivertedKg.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B6B1A2]">Goods Crafted</p>
                  <p className="font-mono text-2xl font-semibold text-[#D4AF37] tabular-nums">
                    {savedProducts.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {savedProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    className="py-2 border-b border-[#F7F5EE]/10 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-[#F7F5EE]">
                      {prod.blueprint.productTitle}
                    </p>
                    <p className="text-xs text-[#B6B1A2]">
                      {prod.colorFinish} · {prod.blueprint.co2AvoidedKg} kg CO2
                      avoided
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIER 2: RE:GENESIS BUSINESS */}
      {activeTier === "BUSINESS" && (
        <div className="space-y-8">
          {/* Workshop KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#F7F5EE]/10 pb-6">
            <div>
              <p className="text-xs text-[#B6B1A2]">Workshop Feedstock Mass</p>
              <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                {totalInventoryKg.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-[#B6B1A2]">Feedstock Valuation</p>
              <p className="font-mono text-2xl font-semibold text-[#D4AF37] tabular-nums">
                ${inventoryValuationUsd.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#B6B1A2]">Active Batch Queue</p>
              <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                {batchQueue.length} runs
              </p>
            </div>
            <div>
              <p className="text-xs text-[#B6B1A2]">Weekly Pod Capacity</p>
              <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                480 kg
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Batch Processing Planner */}
            <div className="lg:col-span-7 glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                  Batch Processing Schedule
                </h2>
                <span className="text-xs text-[#D4AF37]">
                  Hardware Simulation Mode
                </span>
              </div>

              <form
                onSubmit={handleCreateBatch}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2"
              >
                <select
                  value={newBatchFeedstock}
                  onChange={(e) => setNewBatchFeedstock(e.target.value)}
                  className="sm:col-span-6 min-h-[44px] rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3 text-sm text-[#F7F5EE]"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={newBatchKg}
                  onChange={(e) => setNewBatchKg(Number(e.target.value))}
                  className="sm:col-span-3 min-h-[44px] rounded-xl bg-[#060B09] border border-[#F7F5EE]/15 px-3 text-sm font-mono text-[#F7F5EE]"
                  aria-label="Batch input weight in kg"
                />
                <button
                  type="submit"
                  className="sm:col-span-3 min-h-[44px] rounded-xl bg-[#D4AF37] text-[#060B09] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#E2BF4C] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Queue Batch</span>
                </button>
              </form>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F7F5EE]/15 text-xs text-[#B6B1A2]">
                      <th className="py-2 pr-3 font-medium">Feedstock</th>
                      <th className="py-2 pr-3 font-medium text-right">Input</th>
                      <th className="py-2 pr-3 font-medium text-right">
                        Est. Yield
                      </th>
                      <th className="py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F5EE]/10 text-sm">
                    {batchQueue.map((job) => (
                      <tr key={job.id}>
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-[#F7F5EE]">
                            {job.feedstockName}
                          </p>
                          <p className="text-xs text-[#B6B1A2]">
                            {job.module} · {job.scheduledFor}
                          </p>
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs text-[#F7F5EE] text-right tabular-nums">
                          {job.inputKg.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs text-[#D4AF37] text-right tabular-nums">
                          {job.outputKg.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 text-xs text-right font-medium text-[#F7F5EE]">
                          {job.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Calculator */}
            <div className="lg:col-span-5 glass-surface border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                  Micro-Factory Cost Calculator
                </h2>
                <p className="text-xs text-[#B6B1A2] mt-1">
                  Estimate recovered pellet margin based on batch mass and local
                  industrial tariff.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#B6B1A2]">Batch Input Volume</span>
                    <span className="font-mono text-[#F7F5EE] tabular-nums">
                      {calcInputKg} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={250}
                    step={5}
                    value={calcInputKg}
                    onChange={(e) => setCalcInputKg(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#B6B1A2]">
                      Electricity Tariff ($/kWh)
                    </span>
                    <span className="font-mono text-[#F7F5EE] tabular-nums">
                      ${calcElectricityRate.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.4}
                    step={0.01}
                    value={calcElectricityRate}
                    onChange={(e) =>
                      setCalcElectricityRate(Number(e.target.value))
                    }
                    className="w-full accent-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#F7F5EE]/10 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#B6B1A2]">
                    Recovered Feedstock Value
                  </span>
                  <span className="font-mono text-[#F7F5EE] tabular-nums">
                    ${estimatedBatchRevenueUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B6B1A2]">Energy Processing Cost</span>
                  <span className="font-mono text-[#F7F5EE] tabular-nums">
                    -${estimatedPowerCostUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F7F5EE]/10 font-semibold">
                  <span className="text-[#F7F5EE]">Net Batch Margin</span>
                  <span className="font-mono text-[#D4AF37] tabular-nums">
                    ${estimatedNetMarginUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Local Buyer & Supplier Matching */}
          <div className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                Local Buyer & Supplier Exchange
              </h2>
              <p className="text-xs text-[#B6B1A2] mt-1">
                Verified regional circular manufacturers seeking or supplying
                sorted feedstock.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUSINESS_EXCHANGE_PARTNERS.map((partner) => {
                const isRequested = requestedPartnerIds.includes(partner.id);
                return (
                  <div
                    key={partner.id}
                    className="rounded-xl border border-[#F7F5EE]/10 bg-[#060B09]/50 p-4 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#D4AF37]">
                        <span>{partner.city}</span>
                        <span className="font-mono tabular-nums">
                          {partner.distanceKm} km · {partner.matchScore}% match
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#F7F5EE]">
                        {partner.organization}
                      </h3>
                      <p className="text-xs text-[#F7F5EE]/85">
                        {partner.need}
                      </p>
                      <p className="text-xs text-[#B6B1A2]">{partner.offer}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRequestExchange(partner.id)}
                      className={`min-h-[44px] w-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isRequested
                          ? "bg-[#0E2E21] text-[#D4AF37] border border-[#D4AF37]/40"
                          : "border border-[#F7F5EE]/20 text-[#F7F5EE] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      }`}
                    >
                      {isRequested ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Exchange Proposal Sent</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Propose Material Exchange</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TIER 3: RE:GENESIS GLOBAL */}
      {activeTier === "GLOBAL" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#F7F5EE]/10 pb-6">
            <div>
              <p className="text-xs text-[#B6B1A2]">Monthly Network Volume</p>
              <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                189.6 t
              </p>
            </div>
            <div>
              <p className="text-xs text-[#B6B1A2]">Global Carbon Offset</p>
              <p className="font-mono text-2xl font-semibold text-[#D4AF37] tabular-nums">
                360.0 t CO2
              </p>
            </div>
            <div>
              <p className="text-xs text-[#B6B1A2]">Active Regional Corridors</p>
              <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                4 Hubs
              </p>
            </div>
            <div>
              <p className="text-xs text-[#B6B1A2]">Cross-Industry Match Rate</p>
              <p className="font-mono text-2xl font-semibold text-[#F7F5EE] tabular-nums">
                86%
              </p>
            </div>
          </div>

          <div className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                  Cross-Industry Supply & Demand Corridors
                </h2>
                <p className="text-xs text-[#B6B1A2] mt-1">
                  Macro circular exchange balancing industrial textile,
                  polymer, and timber streams (Hardware Simulation Mode).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F7F5EE]/15 text-xs text-[#B6B1A2]">
                    <th className="py-2.5 pr-4 font-medium">Region</th>
                    <th className="py-2.5 pr-4 font-medium">Primary Surplus</th>
                    <th className="py-2.5 pr-4 font-medium">Primary Demand</th>
                    <th className="py-2.5 pr-4 font-medium text-right">
                      Volume
                    </th>
                    <th className="py-2.5 pr-4 font-medium text-right">
                      CO2 Offset
                    </th>
                    <th className="py-2.5 font-medium text-right">
                      Utilization
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F5EE]/10 text-sm">
                  {GLOBAL_EXCHANGE_CORRIDORS.map((corridor) => (
                    <tr key={corridor.region}>
                      <td className="py-3 pr-4 font-medium text-[#F7F5EE] whitespace-nowrap">
                        {corridor.region}
                      </td>
                      <td className="py-3 pr-4 text-xs text-[#B6B1A2]">
                        {corridor.primarySurplus}
                      </td>
                      <td className="py-3 pr-4 text-xs text-[#F7F5EE]/85">
                        {corridor.primaryDemand}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-[#F7F5EE] text-right tabular-nums whitespace-nowrap">
                        {(corridor.monthlyVolumeKg / 1000).toFixed(1)} t
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-[#D4AF37] text-right tabular-nums whitespace-nowrap">
                        {corridor.carbonOffsetTonnes.toFixed(1)} t
                      </td>
                      <td className="py-3 font-mono text-xs text-[#F7F5EE] text-right tabular-nums">
                        {corridor.utilizationPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
