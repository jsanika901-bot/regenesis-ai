import {
  BatchQueueJob,
  EcosystemTier,
  MaterialInventoryItem,
  SavedProductRecord,
  WastePreset,
} from "../types/regenesis";

export const HERO_HARDWARE_IMAGE =
  "/src/assets/images/hero_regenesis_unit_1795156060491.jpg";

export const WASTE_PRESETS: WastePreset[] = [
  {
    id: "pet-bottles",
    title: "Post-Consumer PET Bottles",
    subtitle: "Clear & emerald polyethylene terephthalate flakes",
    categoryHint: "Clear and emerald green crushed PET beverage bottles",
    defaultWeightKg: 4.5,
    imageUrl: "/src/assets/images/waste_pet_bottles_1795156059750.jpg",
  },
  {
    id: "denim-cotton",
    title: "Denim & Cotton Offcuts",
    subtitle: "Indigo twill and unbleached organic cotton weave",
    categoryHint: "Discarded indigo denim and raw woven cotton textile scraps",
    defaultWeightKg: 3.2,
    imageUrl: "/src/assets/images/waste_denim_textiles_1795156060592.jpg",
  },
  {
    id: "rubber-soles",
    title: "Vulcanized Rubber Soles",
    subtitle: "Post-wear footwear outsoles & elastomer trim",
    categoryHint: "Reclaimed vulcanized black rubber shoe soles and elastomer scraps",
    defaultWeightKg: 5.0,
    imageUrl: "/src/assets/images/waste_rubber_soles_1795156060508.jpg",
  },
  {
    id: "leather-wood",
    title: "Leather & Walnut Scraps",
    subtitle: "Vegetable-tanned hide trim & hardwood joinery cutoffs",
    categoryHint: "Salvaged cognac leather bag offcuts and dark walnut wood scraps",
    defaultWeightKg: 3.8,
    imageUrl: "/src/assets/images/waste_leather_wood_1795156060595.jpg",
  },
];

export const INITIAL_INVENTORY: MaterialInventoryItem[] = [
  {
    id: "inv-rpet",
    name: "Recycled rPET Pellets",
    category: "PET Plastic",
    kg: 14.5,
    purityGrade: "Grade B · Optical Sorted",
    lastUpdated: "2026-11-19",
    unitValueUsd: 3.4,
  },
  {
    id: "inv-cotton",
    name: "Regenerated Textile Fiber",
    category: "Cotton & Denim Textile",
    kg: 9.8,
    purityGrade: "Grade A · Unblended Cellulose",
    lastUpdated: "2026-11-19",
    unitValueUsd: 5.2,
  },
  {
    id: "inv-rubber",
    name: "Micronized Elastomer Crumb",
    category: "Vulcanized Rubber",
    kg: 11.2,
    purityGrade: "Grade B · Devulcanized 40-Mesh",
    lastUpdated: "2026-11-18",
    unitValueUsd: 2.9,
  },
  {
    id: "inv-leather-wood",
    name: "Reclaimed Leather & Lignin Matrix",
    category: "Reclaimed Leather",
    kg: 6.4,
    purityGrade: "Grade A · Workshop Trim",
    lastUpdated: "2026-11-18",
    unitValueUsd: 7.8,
  },
  {
    id: "inv-alloy",
    name: "Recovered Brushed Aluminum Stock",
    category: "Mixed Alloy & Metal",
    kg: 4.1,
    purityGrade: "Grade A · 6061-T6 Remelt",
    lastUpdated: "2026-11-17",
    unitValueUsd: 6.1,
  },
];

export const INITIAL_SAVED_PRODUCTS: SavedProductRecord[] = [
  {
    id: "prod-crossbody-01",
    createdAt: "2026-11-18T14:20:00Z",
    tier: "HOME",
    colorFinish: "Obsidian Matte",
    dimensionsCm: "26 x 18 x 7 cm",
    simulatedUnitsProduced: 2,
    blueprint: {
      productTitle: "Aegis Weatherproof rPET Crossbody Shell",
      conceptSummary:
        "Thermo-bonded woven rPET canvas paired with reclaimed leather gussets and micronized elastomer bumper trim.",
      feasibilityStatus: "Feasible",
      feasibilityScore: 94,
      feasibilityNotes:
        "All required polymers and trims are present in local inventory with favorable melt-flow compatibility.",
      billOfMaterials: [
        {
          materialName: "Recycled rPET Pellets",
          sourceCategory: "PET Plastic",
          requiredKg: 0.45,
          unitCostUsd: 1.53,
          roleInProduct: "Ripstop spun outer shell & buckle clasps",
        },
        {
          materialName: "Regenerated Textile Fiber",
          sourceCategory: "Cotton & Denim Textile",
          requiredKg: 0.25,
          unitCostUsd: 1.3,
          roleInProduct: "Soft interior liner & padded divider",
        },
        {
          materialName: "Micronized Elastomer Crumb",
          sourceCategory: "Vulcanized Rubber",
          requiredKg: 0.15,
          unitCostUsd: 0.44,
          roleInProduct: "Waterproof base bumper & zipper pulls",
        },
      ],
      estimatedUnitCostUsd: 14.8,
      estimatedRetailValueUsd: 118.0,
      productionTimeHours: 1.8,
      energyRequiredKwh: 2.4,
      co2AvoidedKg: 4.1,
      productionWorkflow: [
        {
          stage: 1,
          stageName: "Filament Spun-Bond Extrusion",
          moduleUsed: "Hydro-Thermal Extruder M-01",
          parameters: "255°C · 42 Bar",
          instructions:
            "Extrude dried rPET pellets into 300D continuous multifilament yarn and weave weather-sealed panels.",
        },
        {
          stage: 2,
          stageName: "Elastomer Overmolding",
          moduleUsed: "Cryogenic & Compression Press M-03",
          parameters: "165°C · 12 min cure",
          instructions:
            "Compression-mold micronized rubber base boot directly onto lower shell seam.",
        },
        {
          stage: 3,
          stageName: "Ultrasonic Seam Assembly",
          moduleUsed: "RG-Home Core Stitch & Weld Head",
          parameters: "35 kHz · Zero adhesive",
          instructions:
            "Bond recycled textile liner and molded rPET clasps without virgin polyurethane glue.",
        },
      ],
      hardwareSimulationNote:
        "Hardware Simulation Mode: Chamber pressures and ultrasonic bond cycles modeled for RG-Home Core.",
    },
  },
];

export const INITIAL_BATCH_QUEUE: BatchQueueJob[] = [
  {
    id: "batch-801",
    feedstockName: "Recycled rPET Pellets",
    inputKg: 42.0,
    outputKg: 37.8,
    module: "Hydro-Thermal Depolymerization M-01",
    status: "In Chamber",
    scheduledFor: "Today · 14:30",
  },
  {
    id: "batch-802",
    feedstockName: "Regenerated Textile Fiber",
    inputKg: 28.5,
    outputKg: 25.1,
    module: "Mechanical Fiber Carding M-02",
    status: "Scheduled",
    scheduledFor: "Today · 17:00",
  },
  {
    id: "batch-803",
    feedstockName: "Micronized Elastomer Crumb",
    inputKg: 60.0,
    outputKg: 52.8,
    module: "Cryogenic Micronizer M-03",
    status: "Completed",
    scheduledFor: "Yesterday · 19:15",
  },
];

export const TIER_DESCRIPTIONS: Record<
  EcosystemTier,
  {
    name: string;
    subtitle: string;
    footprint: string;
    throughput: string;
    highlight: string;
    modules: string[];
  }
> = {
  HOME: {
    name: "RE:GENESIS HOME",
    subtitle: "Compact Residential Closed-Loop Pod",
    footprint: "0.85 m² Counter / Utility Bay",
    throughput: "Up to 18 kg / week",
    highlight:
      "Transforms household PET, worn garments, and packaging into daily utility goods and replacement parts.",
    modules: [
      "Optical Vision Inlet",
      "Micro-Pelletizer M-01",
      "Compact 3D/Thermo Press",
    ],
  },
  BUSINESS: {
    name: "RE:GENESIS BUSINESS",
    subtitle: "Workshop & Neighborhood Micro-Factory",
    footprint: "14 m² Modular Studio Bay",
    throughput: "Up to 480 kg / week",
    highlight:
      "Batch feedstock refining, automated BOM costing, and regional B2B surplus exchange matching.",
    modules: [
      "Multi-Stream Granulator",
      "Carding & Bio-Resin Press",
      "CNC & Injection Pod",
    ],
  },
  GLOBAL: {
    name: "RE:GENESIS GLOBAL",
    subtitle: "Cross-Industry Circular Exchange Grid",
    footprint: "Distributed Municipal & Industrial Hubs",
    throughput: "142+ Tonnes / month per hub",
    highlight:
      "Real-time supply/demand balancing across textiles, polymers, elastomers, and verified carbon ledgering.",
    modules: [
      "NIR Automated Sorting Line",
      "Continuous Extrusion Spine",
      "Cross-Region Freight Router",
    ],
  },
};

export const GLOBAL_EXCHANGE_CORRIDORS = [
  {
    region: "Nordic & Western Europe",
    primarySurplus: "Post-Consumer rPET & Wool Felt",
    primaryDemand: "Acoustic Timber-Lignin Panels",
    monthlyVolumeKg: 48200,
    carbonOffsetTonnes: 91.4,
    utilizationPercent: 92,
  },
  {
    region: "East & Southeast Asia",
    primarySurplus: "Pre-Consumer Denim & Footwear Elastomer",
    primaryDemand: "Spun-Bond rPET Technical Yarn",
    monthlyVolumeKg: 76400,
    carbonOffsetTonnes: 144.8,
    utilizationPercent: 88,
  },
  {
    region: "North America West Coast",
    primarySurplus: "Salvaged Walnut & Aerospace Alloy Trim",
    primaryDemand: "Micronized Rubber Isolators",
    monthlyVolumeKg: 35900,
    carbonOffsetTonnes: 68.2,
    utilizationPercent: 84,
  },
  {
    region: "Latin America Circular Hub",
    primarySurplus: "Vegetable-Tanned Leather & Clear PET",
    primaryDemand: "Modular Footwear Midsole Compound",
    monthlyVolumeKg: 29100,
    carbonOffsetTonnes: 55.6,
    utilizationPercent: 79,
  },
];

export const BUSINESS_EXCHANGE_PARTNERS = [
  {
    id: "partner-1",
    organization: "Veridian Atelier Collective",
    city: "Portland, OR",
    need: "Seeking 12 kg Regenerated Textile Fiber",
    offer: "Supplying 18 kg Walnut & Leather Trim",
    distanceKm: 14,
    matchScore: 96,
  },
  {
    id: "partner-2",
    organization: "Kinetix Sole Lab",
    city: "Oakland, CA",
    need: "Seeking 25 kg Micronized Elastomer Crumb",
    offer: "$3.40 / kg spot settlement",
    distanceKm: 28,
    matchScore: 91,
  },
  {
    id: "partner-3",
    organization: "Pacific Basin Packaging Co-op",
    city: "Seattle, WA",
    need: "Supplying 60 kg Optical-Sorted Clear PET",
    offer: "Seeking local hydro-thermal pelletizing slot",
    distanceKm: 42,
    matchScore: 89,
  },
];
