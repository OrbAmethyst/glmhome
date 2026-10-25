# CHECKPOINT — My Sweet Home

> Handoff marker for resuming development from a fresh chat. Keep this file
> updated at every milestone. Current checkpoint name:
> **Fold 2.1 · Smooth Scroll & Rail Rework**
>
> HEAD `ca307bc` · branch `main` → `github.com/OrbAmethyst/glmhome` · package 2.3.0

---

## What this project is

Mobile-first (strict **375px contract**) React 18 + TypeScript + Vite
glassmorphism smart-home demo on the "Arctic Depths" palette (tokens in
`src/styles/base.css`). Pure frontend — every behavior is simulated/local **by
design**.

### Hard rules
- **NO scenes, routines, scheduling, or auth.** No external UI libraries.
- Icons: Google **Material Symbols Rounded** subset via `icon_names=` in
  `index.html` — any new glyph name must be added there or it renders blank.
- CSS lives in isolated modules under `src/styles/`, wired through the
  `src/index.css` barrel. Respect `prefers-reduced-motion` everywhere.
- 375px width contract: content must never overflow horizontally; bento pages
  are pixel-locked via ResizeObserver → `--page-w` (percentage page sizing broke
  the contract before — keep pixels).
- `README.md` is the primary design-system + behavior-contract doc.

## Revert checkpoints (git tags)

| Tag | Commit | Contains |
| --- | --- | --- |
| `v2.1.0-ui-polish` | `75ccdfb` | collapsing header, avatar row, filled-card chip logos |
| `v2.2.0-fold2` | `516ec82` | persistence, deep control sheets, room rail + telemetry |
| `v2.3.0-scroll-polish` | `ca307bc` | **current** — telemetry removed, rail reformed, gradual scroll-linked fold, anchor-free smooth scroll |

## State after Fold 2.1 (what exists now)

- **Telemetry strip fully removed** (component, `telemetry.css`, `CATEGORY_WATTS`
  config map, `bolt` glyph out of the font subset).
- **Room rail**: static strip above the bento — scrolls with the section, no
  sticky pinning, no `--appbar-h` observer/var anywhere. Chips exist **only for
  rooms that hold ≥1 paired device** (plus All), each showing `name + count
  pill`. Sizing deliberately small (27px chips, 11px font, 6px gap) — the 44px
  touch rule was consciously relaxed for these chips by user request.
- **No spatial-filter animation**: rail selection swaps cards instantly. The
  cardIn mount animation plays only on the app's first paint via the
  `BentoCard anim` prop (900ms gate in `ActiveSection`).
- **Header fold — scroll-linked & gradual**: `--collapse` (0→1 over ~52px of
  scroll) is written **directly onto `.appbar`** in the scroll handler — no
  React re-render per frame. `folded` class gates pointer-events/visibility at
  k≥1; hairline + shadow fade in with depth via `.appbar::after` opacity var.
  Returns equally gradually on scroll-up.
- `.scroll` has **`overflow-anchor: none`** — DO NOT REMOVE. Chrome scroll
  anchoring compensated the fold's layout-height change by scrolling back,
  causing a fold/unfold feedback loop (the old "buggy scroll": top oscillated
  26→0 within one frame; verified by trapping scroll events).
- **Horizontal bento drag**: scroll-snap is held off for the whole mouse
  gesture, then the scroller **glides (`behavior:'smooth'`) to the nearest page**
  on release; snap re-engages via a 620ms `snapTimer`. Click-suppression still
  guards card taps after drags.
- **Store** (`src/store/SmartHomeStore.tsx`): localStorage key `msh_devices`;
  hydration validates shape → malformed falls back to seeds; empty `[]` is
  respected (user deliberately cleared all). Actions: `toggleDevice` (blocked
  when offline), `addDevice`, `deleteDevice`, `restoreDevice` (re-inserts at
  original index), `updateDeviceValue`, `toggleOnlineStatus`, `renameDevice`,
  `selectedRoom`/`setSelectedRoom` ('all' default). App auto-falls back to
  'all' when a room filter loses its last device.
- **DeviceControlSheet**: drag-to-dismiss; per-category controls — brightness
  slider with scaling amber glow (lights), ±0.5° stepped dial with per-category
  ranges 16–30°C (climate; fridge 1–7°C), Off/Low/Med/High segments (fans, TV,
  plug, cleaner); power row + rename + online-sim footer; offline =
  grayscale+blur overlay, pointer-events none, unreachable banner.
- **Control-sheet opens from any card tap** outside its buttons (`closest('button')`
  guard in `BentoCard`).

## Pitfalls learned (don't rediscover these)

- **Chromium (Arc) composition bugs**: never clip `.htop` with `overflow:hidden`
  and never put `backdrop-filter` on `.avatar` (opaque gradient) — renders a
  stray square patch under the appbar blur. Margin-based collapse only.
- **`e.currentTarget` is nulled after event dispatch** — never read it inside a
  lazy `setState` updater (crashed the whole React tree once).
- **Don't `setPointerCapture` on `.bento-scroll`**: with capture, pointerup
  retargets to the scroller and card `click`s stop firing (tap-to-open breaks).
- Chrome default scroll anchoring fights any JS scroll-linked layout change —
  keep `overflow-anchor: none` on `.scroll`.
- Verification quirks:
  - `puppeteer-core` installed `--no-save` (not in package.json). Chrome binary:
    `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, must use
    `--headless=new` (plain `--headless` failed once).
  - Fresh browser profile → empty localStorage → seed devices appear. Storage
    round-trips across reloads within one profile.
  - When scripting drags, coordinates must stay **inside `.bento-scroll`'s box**
    (pointerleave ends the gesture & glides to nearest). `.bcard.b-hero` via
    `querySelector` returns page 1's hero, which is off-scroll to the left on
    later pages — use the scroller's box rect for drag coords.
  - User's own dev server occupies 5173 — Vite falls back to 5174. Kill after.
- Git: local user identity; revert via tags above.

## Quick verify recipe

```bash
npm run build      # tsc strict + vite build
npm run dev        # note printed port (5174 if 5173 busy)
```
Puppeteer pass (1280×860 viewport, app centers in a device frame at x≈452):
room-rail chips, drag→page glide + back, fold at 26/64px + return at 0,
tap opens control sheet, offline safeguard, `msh_devices` round-trip.

## Not done / parking lot

Nothing pending — next increment is the user's call. (Aside: the control-sheet
title contains the rename pencil inside `.dsheet-title`, so `textContent`
reads `"<name>edit"` in tests — cosmetic, not a bug.)
