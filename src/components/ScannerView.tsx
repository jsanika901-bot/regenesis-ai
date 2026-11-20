import { useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cpu,
  Loader2,
  Play,
  RotateCcw,
  ScanLine,
  Upload,
} from "lucide-react";
import { WASTE_PRESETS } from "../data/presets";
import { MaterialScanResult, WastePreset } from "../types/regenesis";
import { ResilientImage } from "./ResilientImage";

interface ScannerViewProps {
  onCommitRecovery: (params: {
    feedstockName: string;
    category: string;
    recoveredKg: number;
    inputWasteKg: number;
    co2SavedKg: number;
    purityGrade: string;
    moduleName: string;
  }) => void;
  onGoToStudio: () => void;
}

async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load preset sample image.");
  }
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve({ base64: reader.result, mimeType });
      } else {
        reject(new Error("Failed to encode image."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image blob."));
    reader.readAsDataURL(blob);
  });
}

export function ScannerView({
  onCommitRecovery,
  onGoToStudio,
}: ScannerViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(WASTE_PRESETS[0].imageUrl);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    WASTE_PRESETS[0].id
  );
  const [itemHint, setItemHint] = useState<string>(WASTE_PRESETS[0].categoryHint);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<MaterialScanResult | null>(null);

  // Mode 1: Raw Material Creation Simulator state
  const [batchWeightKg, setBatchWeightKg] = useState<number>(4.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const runVisionAnalysis = async (
    base64Data: string,
    mimeType: string,
    hint?: string
  ) => {
    setIsAnalyzing(true);
    setScanError(null);
    setScanResult(null);
    setSimulationComplete(false);
    setActiveStageIndex(-1);

    try {
      const response = await fetch("/api/scan-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          itemHint: hint,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Material vision scan failed.");
      }

      const result = data as MaterialScanResult;
      setScanResult(result);
      if (result.estimatedWeightKg > 0) {
        setBatchWeightKg(Number(result.estimatedWeightKg.toFixed(1)));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to analyze waste image.";
      setScanError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedPresetId(null);
    setItemHint(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
        void runVisionAnalysis(reader.result, file.type || "image/jpeg");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSelectPreset = async (preset: WastePreset) => {
    setSelectedPresetId(preset.id);
    setPreviewUrl(preset.imageUrl);
    setItemHint(preset.categoryHint);
    setBatchWeightKg(preset.defaultWeightKg);

    try {
      const { base64, mimeType } = await urlToBase64(preset.imageUrl);
      await runVisionAnalysis(base64, mimeType, preset.categoryHint);
    } catch (err: unknown) {
      setScanError(
        err instanceof Error ? err.message : "Failed to load preset image."
      );
    }
  };

  const handleAnalyzeCurrentPreview = async () => {
    try {
      if (previewUrl.startsWith("data:")) {
        const mimeMatch = previewUrl.match(/^data:([^;]+);/);
        await runVisionAnalysis(
          previewUrl,
          mimeMatch?.[1] || "image/jpeg",
          itemHint
        );
      } else {
        const { base64, mimeType } = await urlToBase64(previewUrl);
        await runVisionAnalysis(base64, mimeType, itemHint);
      }
    } catch (err: unknown) {
      setScanError(
        err instanceof Error ? err.message : "Could not read preview image."
      );
    }
  };

  const handleRunRecoverySimulation = () => {
    if (!scanResult || isSimulating) return;
    setIsSimulating(true);
    setSimulationComplete(false);
    setActiveStageIndex(0);

    const totalSteps = scanResult.processSteps.length || 4;
    let current = 0;

    const timer = window.setInterval(() => {
      current += 1;
      if (current < totalSteps) {
        setActiveStageIndex(current);
      } else {
        window.clearInterval(timer);
        setActiveStageIndex(totalSteps);
        setIsSimulating(false);
        setSimulationComplete(true);

        const yieldRatio = scanResult.recoveryYieldPercent / 100;
        const recoveredKg = Number((batchWeightKg * yieldRatio).toFixed(2));
        const scaleFactor =
          scanResult.estimatedWeightKg > 0
            ? batchWeightKg / scanResult.estimatedWeightKg
            : 1;
        const scaledCo2 = Number(
          (scanResult.co2SavedKg * scaleFactor).toFixed(2)
        );

        onCommitRecovery({
          feedstockName: scanResult.feedstockOutputName,
          category: scanResult.materialCategory,
          recoveredKg,
          inputWasteKg: batchWeightKg,
          co2SavedKg: scaledCo2,
          purityGrade: scanResult.conditionGrade,
          moduleName: scanResult.compatibleModule,
        });
      }
    }, 650);
  };

  const projectedOutputKg = scanResult
    ? Number(((batchWeightKg * scanResult.recoveryYieldPercent) / 100).toFixed(2))
    : 0;

  const projectedEnergyKwh = scanResult
    ? Number(
        (
          scanResult.energyEstimateKwh *
          (scanResult.estimatedWeightKg > 0
            ? batchWeightKg / scanResult.estimatedWeightKg
            : 1)
        ).toFixed(2)
      )
    : 0;

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F7F5EE]/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] mb-1.5">
            <ScanLine className="w-3.5 h-3.5" />
            <span>Gemini Vision Optical Classifier · Mode 1 Simulator</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#F7F5EE]">
            AI Material Vision Scanner
          </h1>
          <p className="text-sm text-[#B6B1A2] mt-1 max-w-2xl">
            Upload a photo of discarded items, capture via mobile camera, or
            select a calibrated waste preset to classify recoverable feedstock
            and simulate chamber conversion.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#D4AF37] shrink-0">
          <Cpu className="w-4 h-4" />
          <span>Hardware Simulation Mode</span>
        </div>
      </div>

      {/* Main Split: Upload/Capture + Presets | Vision Analysis Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Optical Input & Presets */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-5 space-y-5">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#F7F5EE]/10 bg-[#060B09]">
              <ResilientImage
                src={previewUrl}
                alt="Selected waste specimen for optical scan"
                className="w-full h-full object-cover"
                fallbackLabel="Optical Input Chamber"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#060B09]/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <Loader2 className="w-7 h-7 text-[#D4AF37] animate-spin" />
                  <p className="text-sm font-medium text-[#F7F5EE]">
                    Analyzing polymer & fiber spectrum...
                  </p>
                  <p className="text-xs text-[#B6B1A2]">
                    Running Gemini Vision material classification
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#F7F5EE]/20 text-sm font-medium text-[#F7F5EE] hover:border-[#D4AF37]/60 hover:text-[#D4AF37] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isAnalyzing}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#F7F5EE]/20 text-sm font-medium text-[#F7F5EE] hover:border-[#D4AF37]/60 hover:text-[#D4AF37] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Use Camera</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeCurrentPreview}
              disabled={isAnalyzing}
              className="min-h-[48px] w-full px-5 py-3 rounded-xl bg-[#D4AF37] text-[#060B09] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E2BF4C] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Specimen...</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>Run Gemini Vision Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Studio Waste Presets */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#F7F5EE]">
              Quick Waste Presets (Instant Vision Analysis)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {WASTE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => void handleSelectPreset(preset)}
                    className={`min-h-[64px] w-full text-left rounded-xl p-3 border flex items-center gap-3.5 transition-all cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? "bg-[#0E2E21]/80 border-[#D4AF37]/70"
                        : "bg-[#0A2218]/40 border-[#F7F5EE]/10 hover:border-[#F7F5EE]/30"
                    }`}
                  >
                    <ResilientImage
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-16 h-12 rounded-lg object-cover shrink-0 border border-[#F7F5EE]/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#F7F5EE] truncate">
                        {preset.title}
                      </p>
                      <p className="text-xs text-[#B6B1A2] truncate">
                        {preset.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Telemetry & Mode 1 Simulator */}
        <div className="lg:col-span-7 space-y-6">
          {scanError && (
            <div className="rounded-2xl border border-red-400/40 bg-red-950/30 p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#F7F5EE]">
                  Vision Analysis Interrupted
                </p>
                <p className="text-xs text-[#F7F5EE]/80">{scanError}</p>
              </div>
            </div>
          )}

          {!scanResult && !isAnalyzing && !scanError && (
            <div className="glass-surface border border-[#F7F5EE]/10 rounded-2xl p-8 text-center space-y-4">
              <ScanLine className="w-10 h-10 text-[#D4AF37] mx-auto opacity-85" />
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="font-display text-xl font-semibold text-[#F7F5EE]">
                  Ready for Optical Classification
                </h2>
                <p className="text-sm text-[#B6B1A2]">
                  Click "Run Gemini Vision Scan" on the loaded specimen or tap
                  any waste preset on the left to inspect material category,
                  grade, compatible hardware module, and recovery yield.
                </p>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-6">
              {/* Diagnostic Readout Card */}
              <div className="glass-panel border border-[#F7F5EE]/10 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#D4AF37]">
                      <span>{scanResult.materialCategory}</span>
                      <span aria-hidden="true">·</span>
                      <span>{scanResult.conditionGrade}</span>
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-[#F7F5EE]">
                      {scanResult.itemName}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs text-[#B6B1A2]">Recyclability Score</p>
                    <p className="font-mono text-3xl font-semibold text-[#D4AF37] tabular-nums">
                      {scanResult.recyclabilityScore}
                      <span className="text-base text-[#B6B1A2]">/100</span>
                    </p>
                  </div>
                </div>

                {/* Key Diagnostic Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-[#F7F5EE]/10">
                  <div>
                    <p className="text-xs text-[#B6B1A2]">
                      Compatible Processing Module
                    </p>
                    <p className="text-sm font-medium text-[#F7F5EE] mt-1">
                      {scanResult.compatibleModule}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#B6B1A2]">
                      Target Recovered Feedstock
                    </p>
                    <p className="text-sm font-medium text-[#F7F5EE] mt-1">
                      {scanResult.feedstockOutputName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#B6B1A2]">
                      Estimated Yield Ratio
                    </p>
                    <p className="font-mono text-lg font-semibold text-[#D4AF37] mt-0.5 tabular-nums">
                      {scanResult.recoveryYieldPercent}%
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F7F5EE]/10 space-y-2">
                  <p className="text-xs font-medium text-[#F7F5EE]">
                    Chemical & Structural Notes
                  </p>
                  <p className="text-xs text-[#B6B1A2] leading-relaxed">
                    {scanResult.chemicalPurityNotes}
                  </p>
                </div>

                {/* Mandatory Physical Sensor Disclaimer */}
                <div className="pt-4 border-t border-[#D4AF37]/25 flex items-start gap-2.5 text-xs text-[#B6B1A2]">
                  <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="text-[#F7F5EE] font-medium">
                      Sensor Verification Notice:{" "}
                    </span>
                    {scanResult.sensorDisclaimer}
                  </p>
                </div>
              </div>

              {/* Mode 1: Raw Material Creation Simulator */}
              <div className="glass-panel border border-[#D4AF37]/30 rounded-2xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>
                        Mode 1 · Raw Material Creation · Hardware Simulation Mode
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#F7F5EE] mt-1">
                      Feedstock Recovery Chamber
                    </h3>
                  </div>
                </div>

                {/* Batch Mass Controls & Projected Output */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F7F5EE]/10">
                  <div className="space-y-2">
                    <label
                      htmlFor="batch-mass-range"
                      className="block text-xs text-[#B6B1A2]"
                    >
                      Input Waste Batch (kg)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="batch-mass-range"
                        type="range"
                        min={0.5}
                        max={25}
                        step={0.5}
                        value={batchWeightKg}
                        disabled={isSimulating}
                        onChange={(e) => setBatchWeightKg(Number(e.target.value))}
                        className="w-full accent-[#D4AF37] cursor-pointer"
                      />
                      <span className="font-mono text-sm font-semibold text-[#F7F5EE] w-16 text-right tabular-nums">
                        {batchWeightKg.toFixed(1)} kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#B6B1A2]">
                      Projected Output Mass
                    </p>
                    <p className="font-mono text-2xl font-semibold text-[#D4AF37] mt-1 tabular-nums">
                      {projectedOutputKg.toFixed(2)} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#B6B1A2]">
                      Estimated Chamber Energy
                    </p>
                    <p className="font-mono text-2xl font-semibold text-[#F7F5EE] mt-1 tabular-nums">
                      {projectedEnergyKwh.toFixed(2)} kWh
                    </p>
                  </div>
                </div>

                {/* Step-by-Step Processing Sequence */}
                <div className="space-y-3 pt-4 border-t border-[#F7F5EE]/10">
                  <p className="text-xs font-medium text-[#B6B1A2]">
                    Chamber Processing Sequence
                  </p>
                  <div className="divide-y divide-[#F7F5EE]/10">
                    {scanResult.processSteps.map((step, idx) => {
                      const isDone = activeStageIndex > idx;
                      const isRunning = isSimulating && activeStageIndex === idx;
                      return (
                        <div
                          key={step.stepNumber}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-[#D4AF37] tabular-nums">
                                0{step.stepNumber}.
                              </span>
                              <span className="text-sm font-medium text-[#F7F5EE]">
                                {step.title}
                              </span>
                              {isRunning && (
                                <span className="text-xs text-[#D4AF37]">
                                  · Active
                                </span>
                              )}
                              {isDone && (
                                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                              )}
                            </div>
                            <p className="text-xs text-[#B6B1A2] pl-6">
                              {step.description}
                            </p>
                          </div>

                          <div className="font-mono text-xs text-[#B6B1A2] pl-6 sm:pl-0 shrink-0 tabular-nums">
                            {step.temperatureC}°C · {step.durationMin} min
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulation Trigger / Completion Actions */}
                <div className="pt-4 border-t border-[#F7F5EE]/10 flex flex-wrap items-center justify-between gap-4">
                  {simulationComplete ? (
                    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2 text-sm text-[#D4AF37] font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          +{projectedOutputKg.toFixed(2)} kg of{" "}
                          {scanResult.feedstockOutputName} added to inventory.
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleRunRecoverySimulation}
                          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#F7F5EE]/20 text-xs font-medium text-[#F7F5EE] hover:border-[#D4AF37]/60 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Run Another Batch</span>
                        </button>
                        <button
                          type="button"
                          onClick={onGoToStudio}
                          className="min-h-[44px] px-5 py-2 rounded-xl bg-[#D4AF37] text-[#060B09] text-xs font-semibold hover:bg-[#E2BF4C] cursor-pointer"
                        >
                          Use in Product Studio
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRunRecoverySimulation}
                      disabled={isSimulating}
                      className="min-h-[48px] w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4AF37] text-[#060B09] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#E2BF4C] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            Simulating Chamber Stage {activeStageIndex + 1}/
                            {scanResult.processSteps.length}...
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>
                            Run Feedstock Recovery & Add to Inventory
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
