import { useState } from "react";
import {
  Compass,
  Globe,
  Package,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { EcosystemView } from "./components/EcosystemView";
import { InventoryView } from "./components/InventoryView";
import { OverviewView } from "./components/OverviewView";
import { ScannerView } from "./components/ScannerView";
import { StudioView } from "./components/StudioView";
import { useEcosystemStore } from "./store/useEcosystemStore";
import { AppTab } from "./types/regenesis";

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  icon: typeof Compass;
}> = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "scanner", label: "Scanner", icon: ScanLine },
  { id: "studio", label: "Studio", icon: Sparkles },
  { id: "ecosystem", label: "Ecosystem", icon: Globe },
  { id: "inventory", label: "Inventory", icon: Package },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("overview");
  const {
    tier,
    inventory,
    savedProducts,
    batchQueue,
    metrics,
    setTier,
    commitRecoveredMaterial,
    commitManufacturedProduct,
    adjustInventoryMass,
    addManualFeedstock,
    scheduleBusinessBatch,
    resetToDefaults,
  } = useEcosystemStore();

  const navigateTo = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#060B09] text-[#F7F5EE] flex flex-col">
      {/* Top Bar Contract: 3 zones (Brand wordmark — 5 nav links — 1 primary CTA) */}
      <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#060B09]/90 backdrop-blur-md border-b border-[#F7F5EE]/10">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => navigateTo("overview")}
            className="font-display text-lg font-bold tracking-tight text-[#F7F5EE] whitespace-nowrap shrink-0 cursor-pointer"
          >
            RE:GENESIS AI
          </button>

          {/* Zone 2: Desktop single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "border-[#D4AF37] text-[#F7F5EE]"
                      : "border-transparent text-[#B6B1A2] hover:text-[#F7F5EE]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() =>
                navigateTo(activeTab === "scanner" ? "studio" : "scanner")
              }
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#D4AF37] text-[#060B09] text-xs font-semibold hover:bg-[#E2BF4C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {activeTab === "scanner" ? "Open Studio" : "Scan Material"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-24 md:pb-12">
        {activeTab === "overview" && (
          <OverviewView
            activeTier={tier}
            onSelectTier={setTier}
            onNavigate={navigateTo}
            inventory={inventory}
            metrics={metrics}
          />
        )}

        {activeTab === "scanner" && (
          <ScannerView
            onCommitRecovery={commitRecoveredMaterial}
            onGoToStudio={() => navigateTo("studio")}
          />
        )}

        {activeTab === "studio" && (
          <StudioView
            tier={tier}
            inventory={inventory}
            onCommitProduct={commitManufacturedProduct}
            onGoToInventory={() => navigateTo("inventory")}
          />
        )}

        {activeTab === "ecosystem" && (
          <EcosystemView
            activeTier={tier}
            onSelectTier={setTier}
            inventory={inventory}
            savedProducts={savedProducts}
            batchQueue={batchQueue}
            metrics={metrics}
            onScheduleBatch={scheduleBusinessBatch}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryView
            inventory={inventory}
            savedProducts={savedProducts}
            metrics={metrics}
            onAdjustMass={adjustInventoryMass}
            onAddFeedstock={addManualFeedstock}
            onResetDefaults={resetToDefaults}
          />
        )}
      </main>

      {/* Quiet Editorial Footer (Desktop) */}
      <footer className="hidden md:block border-t border-[#F7F5EE]/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#B6B1A2]">
          <span>
            RE:GENESIS AI · Nothing Is Waste. Everything Has a Second Life.
          </span>
          <span>
            Visual AI estimates & hardware telemetry run in Hardware Simulation
            Mode
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Thumb Dock (<md) */}
      <nav
        aria-label="Mobile Thumb Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-safe bg-[#060B09]/95 backdrop-blur-md border-t border-[#F7F5EE]/10 grid grid-cols-5 items-center"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`min-h-[44px] h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                isActive ? "text-[#D4AF37]" : "text-[#B6B1A2]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
