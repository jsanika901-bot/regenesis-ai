import { ArrowRight, Cpu, Factory, Globe, Home, ScanLine, Sparkles } from "lucide-react";
import { HERO_HARDWARE_IMAGE, TIER_DESCRIPTIONS } from "../data/presets";
import {
  AppTab,
  EcosystemTier,
  MaterialInventoryItem,
  SustainabilityMetrics,
} from "../types/regenesis";
import { ResilientImage } from "./ResilientImage";

interface OverviewViewProps {
  activeTier: EcosystemTier;
  onSelectTier: (tier: EcosystemTier) => void;
  onNavigate: (tab: AppTab) => void;
  inventory: MaterialInventoryItem[];
  metrics: SustainabilityMetrics;
}

const TIER_LIST: Array<{
  id: EcosystemTier;
  label: string;
  audience: string;
  icon: typeof Home;
}> = [
  { id: "HOME", label: "Home", audience: "Residential Pod", icon: Home },
  {
    id: "BUSINESS",
    label: "Business",
    audience: "Micro-Factory",
    icon: Factory,
  },
  { id: "GLOBAL", label: "Global", audience: "Exchange Grid", icon: Globe },
];

export function OverviewView({
  activeTier,
  onSelectTier,
  onNavigate,
  inventory,
  metrics,
}: OverviewViewProps) {
  const totalInventoryKg = inventory.reduce((sum, item) => sum + item.kg, 0);
  const tierInfo = TIER_DESCRIPTIONS[activeTier];

  return (
    <div className="space-y-12 pb-6">
      {/* Hero Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 sm:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#D4AF37] font-medium">
              <span>Circular Manufacturing Ecosystem</span>
              <span aria-hidden="true">·</span>
              <span>Multimodal Material Intelligence</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#F7F5EE] leading-[1.1] max-w-2xl text-balance">
              Nothing Is Waste. Everything Has a Second Life.
            </h1>

            <p className="text-sm sm:text-base text-[#B6B1A2] leading-relaxed max-w-xl">
              Scan discarded polymers, textiles, elastomers, and workshop
              offcuts with Gemini Vision. Simulate feedstock recovery inside
              modular hardware chambers and synthesize production-ready product
              blueprints from your live material inventory.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F7F5EE]/10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("scanner")}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#060B09] font-semibold text-sm flex items-center gap-2 hover:bg-[#E2BF4C] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Launch Ecosystem</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("studio")}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#F7F5EE]/20 text-[#F7F5EE] font-medium text-sm flex items-center gap-2 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Product Studio</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#F7F5EE]/10 min-h-[280px] lg:min-h-0">
          <ResilientImage
            src={HERO_HARDWARE_IMAGE}
            alt="RE:GENESIS AI Circular Recovery Hardware Unit"
            className="w-full h-full lg:h-full object-cover"
            fallbackLabel="RE:GENESIS Core Recovery Unit"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060B09]/90 via-[#060B09]/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware Simulation Mode</span>
            </div>
            <p className="text-sm font-medium text-[#F7F5EE]">
              {tierInfo.name} · {tierInfo.throughput}
            </p>
            <p className="text-xs text-[#B6B1A2] mt-1">{tierInfo.footprint}</p>
          </div>
        </div>
      </section>

      {/* Adjacent Proof & Impact Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y border-[#F7F5EE]/10 py-6">
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Recovered Stock Ready</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#F7F5EE] tabular-nums">
            {totalInventoryKg.toFixed(1)} kg
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">CO2 Emissions Avoided</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#D4AF37] tabular-nums">
            {metrics.co2SavedKg.toFixed(1)} kg
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Landfill Mass Diverted</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#F7F5EE] tabular-nums">
            {metrics.landfillDivertedKg.toFixed(1)} kg
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#B6B1A2]">Recovery Cycles Completed</p>
          <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#F7F5EE] tabular-nums">
            {metrics.batchesCompleted}
          </p>
        </div>
      </section>

      {/* Interactive Three Hardware Tiers Overview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F7F5EE]">
              Three Scalable Hardware Tiers
            </h2>
            <p className="text-sm text-[#B6B1A2] mt-1">
              Select a deployment tier to inspect module specifications or
              switch your active simulation dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("ecosystem")}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-[#D4AF37] hover:text-[#F7F5EE] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Open {activeTier} Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIER_LIST.map((item) => {
            const spec = TIER_DESCRIPTIONS[item.id];
            const isActive = activeTier === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTier(item.id)}
                className={`text-left rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                  isActive
                    ? "bg-[#0E2E21]/80 border-[#D4AF37]/70"
                    : "bg-[#0A2218]/40 border-[#F7F5EE]/10 hover:border-[#F7F5EE]/30"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-[#D4AF37]" : "text-[#B6B1A2]"
                        }`}
                      />
                      <span className="font-display text-lg font-semibold text-[#F7F5EE]">
                        {spec.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-[#D4AF37]" : "text-[#B6B1A2]"
                      }`}
                    >
                      {isActive ? "Active Tier" : "Select"}
                    </span>
                  </div>

                  <p className="text-xs text-[#B6B1A2]">
                    {spec.subtitle} · {spec.throughput}
                  </p>

                  <p className="text-sm text-[#F7F5EE]/85 leading-relaxed">
                    {spec.highlight}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F7F5EE]/10 text-xs text-[#B6B1A2]">
                  {spec.modules.join(" · ")}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Two Core Modes Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-surface border border-[#F7F5EE]/10 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
              <ScanLine className="w-4 h-4" />
              <span>Mode 01 · Raw Material Creation</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-[#F7F5EE]">
              AI Vision Scanner & Feedstock Recovery
            </h3>
            <p className="text-sm text-[#B6B1A2] leading-relaxed">
              Capture or upload discarded plastics, garments, rubber soles, or
              timber offcuts. Gemini Vision grades composition and runs a
              thermal/mechanical recovery simulation to replenish your stock.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("scanner")}
            className="min-h-[44px] w-full sm:w-auto self-start px-5 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37] hover:text-[#060B09] transition-colors cursor-pointer"
          >
            Scan Material Sample
          </button>
        </div>

        <div className="glass-surface border border-[#F7F5EE]/10 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
              <span>Mode 02 · Product Manufacturing Studio</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-[#F7F5EE]">
              Generative DFM & Bill of Materials
            </h3>
            <p className="text-sm text-[#B6B1A2] leading-relaxed">
              Describe any functional product, select recovered feedstocks from
              your live inventory, and generate feasibility checks, BOM pricing,
              and chamber assembly instructions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("studio")}
            className="min-h-[44px] w-full sm:w-auto self-start px-5 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37] hover:text-[#060B09] transition-colors cursor-pointer"
          >
            Design New Product
          </button>
        </div>
      </section>
    </div>
  );
}
