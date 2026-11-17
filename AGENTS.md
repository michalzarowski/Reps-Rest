# AGENTS.md — Rep&Rest

Guidelines for AI agents and contributors working on this repository.

## Project

Rep&Rest is a local-first React Native (Expo) training assistant. Prefer small, incremental changes aligned with the academic MVP schedule in `README.md`.

## Stack

- Expo SDK 54, React Native, TypeScript
- Expo Router (file-based routing in `app/`)
- NativeWind v4 + Tailwind 3
- React Context API for shared state (no Redux/Zustand/Jotai)
- AsyncStorage via `src/services/storage`
- wger REST API via `src/services/api` (no secrets in the app)
- Visual: Aquatic Liquid Glass (`expo-blur`, `expo-linear-gradient`, `expo-image`, Lucide)

Install native packages with `npx expo install`. Do not force-upgrade Expo SDK via `npm audit fix --force`.

Pin `lucide-react-native@0.577.0` (1.x breaks Metro resolution on SDK 54).

## Architecture

| Path | Responsibility |
|---|---|
| `app/` | Routes and navigation only — thin screens that render feature modules |
| `src/features/*` | Feature UI and upcoming domain logic per module |
| `src/components/ui/` | Shared presentational / glass components |
| `src/services/api/` | HTTP client + wger stubs; no UI |
| `src/services/storage/` | Only AsyncStorage access; JSON + `schemaVersion` |
| `src/context/` | Narrow providers composed in `AppProviders` |
| `src/types/` | Domain TypeScript models |
| `src/utils/` | Pure helpers (formulas belong here for unit testing) |
| `src/theme/` | Design tokens (canonical) + navigation theme |
| `src/mocks/` | Demo data for visual mockups only |

Import alias: `@/*` → `src/*`.

## Visual system (Aquatic Liquid Glass)

- Dark-only UI. Canonical colors live in `src/theme/tokens.ts`. Mirror the same hex values in `tailwind.config.js`.
- Feature screens must not hardcode hex colors — use `@/theme` tokens or semantic NativeWind classes (`bg-deep-water`, `text-aqua`, …).
- Primary interactive accent is **Aqua** (`#3EE0E8`) for CTAs, active tabs and glows. Liquid Mint and Lilac are secondary; Acid Lime is reserved for rare highlights.
- Glass panels: iOS uses `BlurView`; Android uses translucent fill (`androidGlassFill`) without experimental blur.
- Gradients and image fades: `expo-linear-gradient` / `expo-image`, not CSS-only hacks.
- Icons: only via `@/components` `Icon` (Lucide whitelist). Do not add FontAwesome or mixed icon sets.
- Shared UI: `GlassPanel`, `GlassButton`, `LiquidBackground`, `ImmersiveImageCard`, `GlassTabBar`, `SectionHeader`, `ModuleTile`, `QuickToolButton`.
- NativeWind = layout, spacing, typography utilities. Blur / gradient / immersive media = Expo modules.
- Mockups may import `@/mocks/demo`. Real persistence and API come in later milestones.
- Extra routes (stack): `/profile`, `/plans/[id]` — not tab roots.

## Rules

1. Do not put business logic or storage/API calls in `app/` route files.
2. Keep Context providers focused; do not create one global “AppStore”.
3. Never commit secrets or put API keys in `EXPO_PUBLIC_*` env vars.
4. Do not implement AI/CSV/full chart libraries until the base MVP modules work.
5. Prefer placeholders and stubs over unfinished half-features.
6. Normalize external API data into `src/types` models before using it in UI.
7. Match existing naming, NativeWind usage, and file layout before inventing new patterns.

## Navigation map

- Tabs: Home, Tools, Plans, Progress (`GlassTabBar` with active glow)
- Tools stack: 1RM, Timer, Plates, Records (list / exercise history / form)
- Stack: Profile, Plan detail

## Verification

```bash
npm install
npm run typecheck
npx expo-doctor
npx expo start
```
