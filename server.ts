import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = "gemini-4-hydrogen";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, model: MODEL_NAME });
  });

  app.post("/api/scan-material", async (req, res) => {
    try {
      const { imageBase64, mimeType, itemHint } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        itemHint?: string;
      };

      if (!imageBase64 || !mimeType) {
        res.status(400).json({
          error: "Missing image data. Please upload or select a material sample.",
        });
        return;
      }

      const cleanBase64 = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      const ai = getAiClient();

      const prompt = [
        "You are an industrial material recovery engineer inside RE:GENESIS AI.",
        "Analyze the provided image of discarded post-consumer or post-industrial waste.",
        itemHint ? `Operator context hint: ${itemHint}.` : "",
        "Identify the primary recoverable material, assess surface condition grade, estimate recyclability (0-100), select the compatible RE:GENESIS modular recovery chamber, and estimate feedstock yield %, processing energy (kWh per batch), CO2 avoided (kg), and a 4-stage recovery sequence.",
        "Be scientifically realistic. Include a clear sensorDisclaimer stating that visual AI estimates cannot verify polymer additives, heavy metals, or moisture ppm without physical NIR spectroscopy or DSC thermal sensors.",
      ]
        .filter(Boolean)
        .join(" ");

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          systemInstruction:
            "Return concise, physically grounded circular manufacturing diagnostics in strict JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemName: { type: Type.STRING },
              materialCategory: {
                type: Type.STRING,
                description:
                  "e.g. PET Plastic, Cotton & Denim Textile, Vulcanized Rubber, Reclaimed Leather, Timber & Wood, Mixed Alloy & Metal, or Composite Polymer",
              },
              conditionGrade: {
                type: Type.STRING,
                description:
                  "e.g. Grade A (Clean Post-Industrial), Grade B (Sorted Post-Consumer), or Grade C (Mixed / Surface Weathered)",
              },
              recyclabilityScore: { type: Type.INTEGER },
              compatibleModule: { type: Type.STRING },
              estimatedWeightKg: { type: Type.NUMBER },
              recoveryYieldPercent: { type: Type.INTEGER },
              feedstockOutputName: { type: Type.STRING },
              energyEstimateKwh: { type: Type.NUMBER },
              co2SavedKg: { type: Type.NUMBER },
              processSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    temperatureC: { type: Type.INTEGER },
                    durationMin: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                  },
                  required: [
                    "stepNumber",
                    "title",
                    "temperatureC",
                    "durationMin",
                    "description",
                  ],
                },
              },
              chemicalPurityNotes: { type: Type.STRING },
              sensorDisclaimer: { type: Type.STRING },
            },
            required: [
              "itemName",
              "materialCategory",
              "conditionGrade",
              "recyclabilityScore",
              "compatibleModule",
              "estimatedWeightKg",
              "recoveryYieldPercent",
              "feedstockOutputName",
              "energyEstimateKwh",
              "co2SavedKg",
              "processSteps",
              "chemicalPurityNotes",
              "sensorDisclaimer",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        throw new Error("Empty response received from Gemini Vision model.");
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to analyze material image.";
      console.error("[/api/scan-material] Error:", message);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/manufacture-product", async (req, res) => {
    try {
      const {
        productDescription,
        selectedMaterials,
        colorFinish,
        dimensionsCm,
        tier,
      } = req.body as {
        productDescription?: string;
        selectedMaterials?: Array<{
          name: string;
          category: string;
          availableKg: number;
        }>;
        colorFinish?: string;
        dimensionsCm?: string;
        tier?: string;
      };

      if (!productDescription || !productDescription.trim()) {
        res.status(400).json({
          error: "Please describe the product you want to manufacture.",
        });
        return;
      }

      if (!selectedMaterials || selectedMaterials.length === 0) {
        res.status(400).json({
          error: "Select at least one recovered feedstock from your inventory.",
        });
        return;
      }

      const ai = getAiClient();

      const materialsSummary = selectedMaterials
        .map(
          (m) =>
            `${m.name} (${m.category}): ${m.availableKg.toFixed(2)} kg available`
        )
        .join("; ");

      const prompt = [
        `Design a manufacturable circular product for the RE:GENESIS ${tier ?? "HOME"} ecosystem tier.`,
        `Target product brief: "${productDescription.trim()}".`,
        `Available recovered feedstocks in operator inventory: ${materialsSummary}.`,
        `Requested surface finish: ${colorFinish || "Obsidian Matte"}.`,
        `Target dimensions: ${dimensionsCm || "32 x 22 x 10 cm"}.`,
        "Evaluate manufacturing feasibility honestly based on material properties and available inventory mass.",
        "Generate an itemized Bill of Materials (using the selected feedstocks and realistic requiredKg that respects inventory limits where possible), estimated unit manufacturing cost vs retail value in USD, production duration, energy kWh, CO2 avoided vs virgin production, and a 4-stage digital manufacturing workflow.",
      ].join(" ");

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            "You are a senior circular product engineer and DFM specialist. Provide realistic, high-craft manufacturing specifications in strict JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productTitle: { type: Type.STRING },
              conceptSummary: { type: Type.STRING },
              feasibilityStatus: {
                type: Type.STRING,
                description:
                  "Must be one of: Feasible, Feasible with Reinforcement, Requires Additional Feedstock",
              },
              feasibilityScore: { type: Type.INTEGER },
              feasibilityNotes: { type: Type.STRING },
              billOfMaterials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    materialName: { type: Type.STRING },
                    sourceCategory: { type: Type.STRING },
                    requiredKg: { type: Type.NUMBER },
                    unitCostUsd: { type: Type.NUMBER },
                    roleInProduct: { type: Type.STRING },
                  },
                  required: [
                    "materialName",
                    "sourceCategory",
                    "requiredKg",
                    "unitCostUsd",
                    "roleInProduct",
                  ],
                },
              },
              estimatedUnitCostUsd: { type: Type.NUMBER },
              estimatedRetailValueUsd: { type: Type.NUMBER },
              productionTimeHours: { type: Type.NUMBER },
              energyRequiredKwh: { type: Type.NUMBER },
              co2AvoidedKg: { type: Type.NUMBER },
              productionWorkflow: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.INTEGER },
                    stageName: { type: Type.STRING },
                    moduleUsed: { type: Type.STRING },
                    parameters: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                  },
                  required: [
                    "stage",
                    "stageName",
                    "moduleUsed",
                    "parameters",
                    "instructions",
                  ],
                },
              },
              hardwareSimulationNote: { type: Type.STRING },
            },
            required: [
              "productTitle",
              "conceptSummary",
              "feasibilityStatus",
              "feasibilityScore",
              "feasibilityNotes",
              "billOfMaterials",
              "estimatedUnitCostUsd",
              "estimatedRetailValueUsd",
              "productionTimeHours",
              "energyRequiredKwh",
              "co2AvoidedKg",
              "productionWorkflow",
              "hardwareSimulationNote",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        throw new Error("Empty response received from Gemini Studio model.");
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate product blueprint.";
      console.error("[/api/manufacture-product] Error:", message);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build artifacts not found. Run npm run build.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RE:GENESIS AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
  process.exit(1);
});
