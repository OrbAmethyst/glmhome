# My Sweet Home

A mobile-first Smart Home web application built with **React 18 + TypeScript + Vite**.

Airbnb-DLS **Content-First Flat** look and feel (Complexion Reduction style),
designed on a strict **375px mobile contract** (responsive on wider screens,
designed for 375px).

> Current state: **Content-First Flat** — flat bento bento, gradually folding header,
> spatial room rail (occupied rooms only), deep device-control sheets,
> localStorage persistence, smooth scroll physics.

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
    ├── index.css               # CSS barrel — imports the style modules under src/styles/
    ├── types.ts                # Device / ApplianceCategory / ROOMS / CATEGORY_META
    ├── store/
    │   └── SmartHomeStore.tsx  # Context store — devices (persisted), toggle, add, delete,
    │                           #   restore, value/online/rename updates, room filter
    └── components/
        ├── AppHeader.tsx       # home selector + profile avatar on top, flat search below
        ├── StatusBar.tsx       # fake status bar (device frame tier only)
        ├── Icon.tsx            # Material Symbols Rounded @ wght 300 (FILL 1 when powered)
        ├── ToggleSwitch.tsx    # solid-orange power switch
        ├── BentoCard.tsx       # hero / cell / wide variants + tap-to-open controls
        ├── ActiveSection.tsx   # bento carousel, ResizeObserver width lock, pager, room filter
        ├── RoomFilterRail.tsx  # small chip rail above the bento — one chip per occupied room
        ├── CatalogSection.tsx  # 10 appliance types (labels at regular weight)
        ├── SetupSheet.tsx      # bottom-sheet pairing flow (300ms simulated connect)
        ├── DeviceControlSheet.tsx  # per-category deep controls (drag-to-dismiss sheet)
        └── Toast.tsx           # solid charcoal toast with Undo (4.6s life)
```

---

## Design system

**Airbnb DLS tokens** (style modules under `src/styles/`):

| Token | Value | Use |
| --- | --- | --- |
| `--ink` / `--ink-2` / `--ink-3` | `#222222` / `#6A6A6A` / `#A0A0A0` | Babu headers & body / Muted metadata / disabled, placeholders |
| `--bg` (canvas) | `#FFFFFF` | global background |
| `--surface` | `#FFFFFF` | content cards — separated by the hairline |
| `--surface-2` | `#F7F7F7` | subtle sections / insets behind white cards |
| `--accent` (Rausch) | `#FF385C` | **only** CTAs, active states, key highlights |
| `--line` (hairline) | `1px solid #DDDDDD` | form inputs, card/tile frames, distinct dividers |

**Flat surface rules** — no `backdrop-filter`, no translucency layers, no drop
shadows, no glows. Cards and tiles are white `16px`-radius surfaces framed by
the `#DDDDDD` hairline (the tonal trick of a grey canvas is replaced by Airbnb's
signature bordered rows); secondary surfaces are `#F7F7F7` insets. Rausch is
reserved: switch ON, active room chip, pager pill, CTA, online badge, focus
rings. Whitespace — not dividers — separates content. The legacy glass-era
variable names are aliased to DLS equivalents so the modules stay stable.
`prefers-reduced-motion` stills all animation.

**Typography** — Inter 400–800 only. Headers are heavy (700–800) charcoal;
body text is grey `#52555A`. Catalog tile names use regular (400) weight.
Icons are Google **Material Symbols Rounded** at `wght 300`; powered devices
switch the FILL axis to 1.

### The 375px width contract

- `--app-w: 375px`; `.phone { max-width: var(--app-w) }`, `overflow-x: hidden` on
  `html, body`.
- Bento page widths are **pixel-locked** via `ResizeObserver` → `--page-w`
  (percentage sizing inside a mandatory-snap scroller is what historically broke
  the contract past 4 devices — pixels never do).
- Grids use `minmax(0, 1fr)`; flex text rows carry `min-width: 0`.
- Display tiers: full-bleed ≤520px → bezel-less hairline outline (≥520px, short
  window) → solid Ink `#222222` device frame with island + side keys
  (≥520px and ≥680px).
- Compaction tier ≤359px: 14px gutters, 32px icon chips, 40px switches.

---

## Behavior contract (Fold 2)

- **Bento**: 4 devices per page — first card is the hero (full-width, subtle
  `#F7F7F7` inset when powered), last card is wide; pages snap horizontally;
  the pager's dots morph into a Rausch pill for the active page. Mouse
  drag-to-scroll
  holds scroll-snap off for the whole gesture and glides smoothly to the
  nearest page on release — snap and scrollLeft never fight; click suppression
  keeps drags from opening sheets.
- **Spatial room rail**: a small chip rail that sits directly above the bento
  and scrolls away with the section — no sticky pinning and no filter effects.
  Chips exist **only for rooms that actually hold a paired device** (plus All);
  each shows a device-count pill. Selecting a chip live-filters the bento +
  catalog scope and preselects the room in the pairing sheet; if a room loses
  its last device the filter falls back to All.
- **Header fold**: scroll-linked and gradual — the top row (greeting, home
  selector, avatar) recedes and fades proportionally to scroll depth
  (`--collapse` 0→1 over ~52px, written straight to the element, no re-renders)
  and returns just as gradually when scrolling back up. The appbar disables
  Chrome scroll anchoring so the fold never fights the scroll.
- **Device control sheet**: tapping a card (outside its buttons) opens the
  drag-to-dismiss controls sheet — brightness slider on a flat track
  (lights), ±0.5° stepper dial with category ranges (climate), or Off/Low/Med/High
  segmented selector (fans, TV, plug, cleaner). Power row + rename + online
  simulation in the footer. When a device is offline, controls desaturate with
  an "unreachable" banner.
- **Pairing**: tap a catalog tile → bottom sheet (drag-to-dismiss at 100px) →
  name auto-prefills from the selected room until edited → Connect runs a
  300ms simulated connect → sheet closes, query clears, bento snaps to page 0,
  the new card pulses with a flat orange ring, view scrolls to Active Glance,
  toast confirms.
- **Delete**: 210ms exit animation → solid Babu `#222222` toast with **Undo**
  (4.6s life)
  that restores the device at its original index.
- **Search**: live-filters both the bento and the catalog, with dedicated
  empty/no-match states.
- **Persistence**: devices hydrate from `localStorage['msh_devices']` and are
  written on every mutation; malformed stored data falls back to the seeds.

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
