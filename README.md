# My Sweet Home

A mobile-first Smart Home web application built with **React 18 + TypeScript + Vite**.

Glassmorphism look and feel on the **Arctic Depths** palette, designed on a strict
**375px mobile contract** (responsive on wider screens, designed for 375px).

> Current state: **Checkpoint 2** — glassmorphism, pixel-locked bento carousel,
> pairing bottom sheet, undo toast. Checkpoint 1 (flat theme, 430px frame) is the
> previous design state and is intentionally not part of this repo.

---

## Quick start

```bash
npm install
npm run dev      # start dev server (Vite prints the local URL)
```

Other scripts:

```bash
npm run build    # typecheck (tsc) + production build into dist/
npm run preview  # serve the production build locally
```

Requires Node 18+.

---

## Project structure

```
my-sweet-home/
├── index.html                  # Vite entry — fonts (Inter, Material Symbols Rounded)
├── package.json
├── vite.config.ts              # base: './' → portable builds (GitHub Pages friendly)
├── tsconfig.json
├── .gitignore
└── src/
    ├── main.tsx                # React root
    ├── App.tsx                 # Root + provider + screen composition + app-level flows
    ├── index.css               # full design system (tokens, glass, bento, sheet, tiers)
    ├── types.ts                # Device / ApplianceCategory / ROOMS / CATEGORY_META
    ├── store/
    │   └── SmartHomeStore.tsx  # Context store — devices, toggle, add, delete, restore
    └── components/
        ├── AppHeader.tsx       # home selector + profile avatar on top, glass search below
        ├── StatusBar.tsx       # fake status bar (device frame tier only)
        ├── Icon.tsx            # Material Symbols Rounded @ wght 300 (FILL 1 when powered)
        ├── ToggleSwitch.tsx    # gradient power switch
        ├── BentoCard.tsx       # hero / cell / wide variants
        ├── ActiveSection.tsx   # bento carousel, ResizeObserver width lock, pager
        ├── CatalogSection.tsx  # 10 appliance types (labels at regular weight)
        ├── SetupSheet.tsx      # bottom-sheet pairing flow (300ms simulated connect)
        └── Toast.tsx           # dark-glass toast with Undo (4.6s life)
```

---

## Design system

**Arctic Depths tokens** (`src/index.css`):

| Token | Value |
| --- | --- |
| `--ink` / `--ink-2` / `--ink-3` | `#193546` / `#526E7F` / `#94A3B8` |
| Background / border | `#F8FAFC` / `#E2E8F0` |
| `--grad` | `linear-gradient(135deg, #0DB8D3, #1B7FDC)` |
| `--grad-ambient` | `linear-gradient(135deg, #1B7FDC, #065B98)` |
| Online / offline | `#14B58A` / `#AEBDC9` |

**Glass system** — `.glass` fills with a translucent white gradient, blurred +
saturated via `backdrop-filter`, sheen highlight, 1px light stroke. The living
backdrop (5 drifting gradient blobs + film grain) exists so the blur has content
to refract. A `@supports` fallback provides opaque white when `backdrop-filter`
is unavailable, and `prefers-reduced-motion` stills all ambient animation.

**Typography** — Inter 400–800 only. Catalog tile names use regular (400) weight.
Icons are Google **Material Symbols Rounded** at `wght 300`; powered devices
switch the FILL axis to 1.

### The 375px width contract

- `--app-w: 375px`; `.phone { max-width: var(--app-w) }`, `overflow-x: hidden` on
  `html, body`.
- Bento page widths are **pixel-locked** via `ResizeObserver` → `--page-w`
  (percentage sizing inside a mandatory-snap scroller is what historically broke
  the contract past 4 devices — pixels never do).
- Grids use `minmax(0, 1fr)`; flex text rows carry `min-width: 0`.
- Display tiers: full-bleed ≤520px → bezel-less glass card (≥520px, short
  window) → full device frame with island + side keys (≥520px and ≥680px).
- Compaction tier ≤359px: 14px gutters, 32px icon chips, 40px switches.

---

## Behavior contract (Checkpoint 2)

- **Bento**: 4 devices per page — first card is the hero (full-width, tinted
  glass when powered), last card is wide; pages snap horizontally; pager shows
  dots that morph into a gradient pill for the active page; mouse drag-to-scroll
  with click suppression.
- **Pairing**: tap a catalog tile → bottom sheet (drag-to-dismiss at 100px) →
  name auto-prefills from the selected room until edited → Connect runs a
  300ms simulated connect → sheet closes, query clears, bento snaps to page 0,
  the new card pulses with a ring, view scrolls to Active Glance, toast confirms.
- **Delete**: 210ms exit animation → dark-glass toast with **Undo** (4.6s life)
  that restores the device at its original index.
- **Search**: live-filters both the bento and the catalog, with dedicated
  empty/no-match states.

### Scope rules

No authentication, routines, scheduling, scenes, or real IoT connectivity —
all interactions are local and simulated by design.

---

## Deploying to GitHub Pages (optional)

The production build is portable (`base: './'` in `vite.config.ts`):

```bash
npm run build    # outputs dist/
```

Then either:

1. Push this repo to GitHub, and in **Settings → Pages** choose the
   `gh-pages` branch published with your favorite tool (e.g. `npx gh-pages -d dist`),
   or
2. Add a small GitHub Action that runs `npm ci && npm run build` and uploads
   `dist/` with `actions/upload-pages-artifact`.
