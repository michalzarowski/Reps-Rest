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
- Visual: Minimal Performance UI layout + glassmorphism material (tokens + NativeWind CSS variables, `expo-blur`, `expo-linear-gradient`, `react-native-svg`, Lucide icons)

Install native packages with `npx expo install`. Do not force-upgrade Expo SDK via `npm audit fix --force`.

Pin `lucide-react-native@0.577.0` (1.x breaks Metro resolution on SDK 54).

## Architecture

| Path | Responsibility |
|---|---|
| `app/` | Routes and navigation only — thin screens that render feature modules |
| `src/features/*` | Feature UI and upcoming domain logic per module |
| `src/components/ui/` | Shared presentational components (`GlassSurface` is the card material) |
| `src/services/api/` | HTTP client + wger stubs; no UI |
| `src/services/storage/` | Only AsyncStorage access; JSON + `schemaVersion` |
| `src/context/` | Narrow providers composed in `AppProviders` (Settings → Theme → Records) |
| `src/types/` | Domain TypeScript models |
| `src/utils/` | Pure helpers (formulas belong here for unit testing) |
| `src/theme/` | Design tokens (canonical, dark + light), `themeVars`, navigation theme |
| `src/hooks/useNavigationOptions.ts` | Shared stack header and tab bar options |
| `src/mocks/` | Example program catalog for the Plans tab (labelled as examples in UI) |

Import alias: `@/*` → `src/*`.

## Visual system (Minimal Performance UI + glass)

- Dark green surfaces with a single teal accent, plus a full light theme. Theme preference (`system` / `light` / `dark`) is persisted in `UserSettings.theme` and resolved by `ThemeProvider`.
- Canonical colors live in `src/theme/tokens.ts` (`palettes.dark`, `palettes.light`). `tailwind.config.js` maps semantic class names to CSS variables (`rgb(var(--color-…))`) set by `ThemeProvider` — never hardcode hex values in feature code.
- Use semantic classes: `bg-background`, `bg-surface`, `bg-surface-elevated`, `border-border`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-accent`, `bg-accent`, `text-on-accent`, `text-danger`. Opacity modifiers work (`bg-accent/15`).
- When a raw color is needed (SVG, `Switch`, navigation options, icons) read `useTheme().colors`.
- Type scale: `text-display` (30), `text-title` (21), `text-card-title` (17), `text-body` (15), `text-label` (13). Spacing 4/8/12/16/24/32; screen gutter 20; card radius 18, button radius 14; touch targets ≥ 44 px.
- `mint`, `lilac`, `lime` are data colors only (timer phases, plate sizes, badges). Accent is the one interactive color.
- Glass material: every card-like element uses `GlassSurface` (via `AppCard`, `Button` secondary, `IconButton` surface, `FormField`, `Stepper`, `SegmentedControl`, `EmptyState`). Layers: shadow/glow → 1 px gradient rim (bright top-left, accent bottom-right, imitates a cut edge) → backdrop blur (iOS/web; Android uses an opaque fill) → fill gradient → top sheen → diagonal streak. Values live in `glassPalettes` in `tokens.ts`.
- `ScreenContainer` paints a static `AmbientBackground` (SVG radial lights) behind the panes. Do not animate it.
- Glow (`glow` prop, `contentGlow()` for icons/rings) is reserved for the primary action, the selected state and one hero element per screen. Primary buttons use the accent gradient with a gloss highlight.
- Press feedback = brighter sheen / stronger glow (`pressed`), no continuous animations. No stock imagery.
- Icons: only via `@/components` `Icon` (Lucide whitelist, single stroke width).
- Shared UI: `ScreenContainer`, `ScreenHeader`, `SectionHeader`, `AppCard`, `Button`, `IconButton`, `FormField`, `Stepper`, `SegmentedControl`, `ListRow`, `Badge`, `StatCard`, `EmptyState`, `LoadingState`, `ErrorState`, `confirmAction` / `showMessage`.
- Never show demo values as user data. Features that are not implemented get an honest empty state, not an active-looking button.

## Layout and navigation rules

- Every screen renders inside `ScreenContainer`. It derives the top inset from the header context and the bottom inset from the tab bar context — do not add manual `paddingBottom` for the tab bar.
- The tab bar is the navigator's standard in-flow bar (`useTabScreenOptions`); do not make it absolute or floating.
- Do not use absolute positioning for page layout.
- Use `confirmAction` / `showMessage` instead of `Alert.alert` with buttons (no-op on web).
- Extra routes (root stack, no tab bar): `/profile`, `/plans/[id]`. Nested stacks set `unstable_settings.initialRouteName = 'index'` so deep links keep a back target.

## Rules

1. Do not put business logic or storage/API calls in `app/` route files.
2. Keep Context providers focused; do not create one global “AppStore”.
3. Never commit secrets or put API keys in `EXPO_PUBLIC_*` env vars.
4. Do not implement AI/CSV/full chart libraries until the base MVP modules work.
5. Prefer placeholders and stubs over unfinished half-features.
6. Normalize external API data into `src/types` models before using it in UI.
7. Match existing naming, NativeWind usage, and file layout before inventing new patterns.

## Navigation map

- Tabs: Główna, Narzędzia, Plany, Postępy (standard tab bar, teal active tint)
- Tools stack: 1RM, Timer, Plates, Records (list / exercise history / form)
- Stack: Profile, Plan detail

## Verification

```bash
npm install
npm run typecheck
npx expo-doctor
npx expo start
```
