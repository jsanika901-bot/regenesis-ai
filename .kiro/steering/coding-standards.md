# Coding Standards — RE:GENESIS AI

## TypeScript & React Conventions
- **Strict Typing:** Avoid `any`; share clean domain interfaces in `src/types/regenesis.ts`.
- **Modular Views:** Keep each primary workspace view (`OverviewView`, `ScannerView`, `StudioView`, `EcosystemView`, `InventoryView`) focused and self-contained.
- **Client State:** Centralize persistent inventory, impact metrics, and product history in `src/store/useEcosystemStore.ts` backed by `localStorage` with safe JSON hydration.

## UI & Styling Standards
- **Tailwind CSS v4:** Use utility classes and semantic CSS custom properties in `src/index.css`; avoid inline `style` attributes except dynamic progress widths.
- **Tabular Numerals:** Apply `font-mono tabular-nums` to every numeric metric, mass figure (kg), cost ($), energy estimate (kWh), and BOM table cell.
- **Mobile-First Hitboxes:** Ensure all buttons, segmented controls, and bottom dock items meet `min-h-[44px]` touch target ergonomics.
- **Zero-Pill Metadata:** Present tags, grades, and timestamps as unboxed typographic metadata separated by `·` rather than capsule pill clutter.
