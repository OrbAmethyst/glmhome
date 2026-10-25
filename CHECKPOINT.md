# CHECKPOINT — My Sweet Home

> Handoff marker for resuming development from a fresh chat. Keep this file
> updated at every milestone. Current checkpoint name:
> **Airbnb DLS · Content-First Flat (Rausch palette)**
>
> branch `main` → `github.com/OrbAmethyst/glmhome` · package 3.1.0

---

## What this project is

Mobile-first (strict **375px contract**) React 18 + TypeScript + Vite
smart-home demo rendered in an **Airbnb-DLS Content-First Flat** design system
(Rausch palette; tokens in `src/styles/base.css`). Pure frontend — every
behavior is simulated/local **by design**.

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
| `v2.3.0-scroll-polish` | `ca307bc` | telemetry removed, rail reformed, gradual scroll-linked fold, anchor-free smooth scroll |
| `v3.1.0-rausch` | *(this commit)* | **current** — glassmorphism → Airbnb DLS Content-First Flat (Rausch palette), zero logic changes |

## State after Airbnb DLS (what exists now)

- **Zero logic changes** — every edit in this epoch is CSS (+ presentational
  copy in `index.html`). Component structure untouched; the mesh layer stays
  mounted but is `display:none`.
- **Tokens** (`src/styles/base.css`): canvas `#FFFFFF`, cards `#FFFFFF`
  (framed by the `#DDDDDD` hairline), secondary surface `#F7F7F7`, Rausch
  `#FF385C` (CTAs/active/highlights ONLY), text `#222222` / `#6A6A6A`
  (+ `#A0A0A0` disabled/placeholder), hairline `1px #DDDDDD` (inputs, card
  frames, distinct dividers), radius 12–16px. Legacy var names (`--grad`,
  `--glass-*`, `--blur`, `--glow`) aliased to DLS values: `--grad: #FF385C`,
  `--glass-stroke: #DDDDDD`, transparent shadows, `--blur: 0px`.

- **Zero logic changes** — every edit in both flat epochs is CSS (+ presentational
  copy in `index.html`: meta description + `.stage-caption` text). Component
  structure untouched; the mesh layer stays mounted but is `display:none`.
- **Removed everywhere**: `backdrop-filter`, glass translucency, drop shadows,
  glows, mesh gradients (blobs + grain hidden), `@supports` glass fallback.
  Sheen/inset highlights are gone; whitespace replaces dividers
  (`.pop-sep` = 8px spacer, `dd-item` borders removed).
- **Accent discipline**: switch ON = Rausch; active room chip = Rausch;
  pager active dot = Rausch pill; `.cta` = Rausch; online badge/dot = Rausch
  (blink-animated, no glow ring); focus rings = `outline 2px var(--accent)`;
  powered hero = **`#F7F7F7` inset** (not Rausch) with a white chip plate;
  powered non-hero chips = Rausch 10% tint. Green/orange/beige palettes all
  retired.
- **Toast** = solid `#222222`, white text, Rausch action `#FF385C`.
- **Device frame** (≥520px tiers): Ink `#222222` bezel/island/keys; the
  bezel-less tier uses a `1px #DDDDDD` outline; no shadow stacks.
- **Appbar**: opaque white `--bg` header, NO `::after` hairline/shadow —
  content is clipped by the opaque tone itself. `.folded` gate and all
  `--collapse` math preserved; search = white field with `#DDDDDD` border,
  focus = Rausch border; avatar = solid Rausch.
- Everything from Fold 2.1 still applies: no telemetry; static occupied-room
  rail (27px chips); first-paint-only card animation; gradual scroll-linked
  fold; `overflow-anchor: none`; drag-snap-hold + 620ms glide.
- **Control sheet**: `#F7F7F7` inset panels on the white sheet; slider =
  white track + hairline + solid Rausch 34px thumb (glow layer removed);
  `dstep-btn` white with Rausch glyphs; `dlvl-btn.active` = solid Rausch;
  offline = `grayscale(0.85)` only (the `blur(1px)` frost was removed);
  unreachable banner = `#F7F7F7` inset with Rausch glyph.
- Cards: white `16px` radius with `1px #DDDDDD` frame, padding bumped
  13→18px, grid gap 12px; hero min-height 168px; `fresh` = flat Rausch ring
  (`outline` + `::after` opacity animation — no box-shadow).

## Pitfalls learned (don't rediscover these)

- **Chromium (Arc) composition bugs**: never clip `.htop` with `overflow:hidden`;
  the margin-based collapse only (no overflow clipping anywhere on the header).
- **`e.currentTarget` is nulled after event dispatch** — never read it inside a
  lazy `setState` updater (crashed the whole React tree once).
- **Don't `setPointerCapture` on `.bento-scroll`**: with capture, pointerup
  retargets to the scroller and card `click`s stop firing (tap-to-open breaks).
- Chrome default scroll anchoring fights any JS scroll-linked layout change —
  keep `overflow-anchor: none` on `.scroll`.
- Verification quirks:
  - `puppeteer-core` installed `--no-save` (not in package.json) — run scripts
    with `NODE_PATH=<project>/node_modules`. Chrome binary:
    `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
    (`--headless=new`).
  - Fresh browser profile → empty localStorage → seed devices appear. Storage
    round-trips across reloads within one profile.
  - When scripting drags, coordinates must stay **inside `.bento-scroll`'s box**.
  - The dark `#222222` toast (z-60) overlays the open control sheet's footer — an
    automation click intended for `.foot-btn` can be swallowed by the toast.
    Wait for the toast to die (4.6s) before clicking footer buttons.
  - `favicon.ico` 404 in dev console is cosmetic (no favicon asset exists).
  - User's own dev server occupies 5173 — Vite falls back to 5174. Kill after.
- Git: local user identity; revert via tags above.

## Quick verify recipe

```bash
npm run build      # tsc strict + vite build
npm run dev        # note printed port (5174 if 5173 busy)
```
Puppeteer pass (375×812): horizontal-overflow check (scrollW===375), switch
toggle, tap opens control sheet, sheet close via scrim, room-chip filter,
fold at depth + return, pairing flow (tile → sheet → fill → Connect → toast +
fresh ring), desktop tier at 520×900 (Ink bezel + updated caption).

## Not done / parking lot

Nothing pending — next increment is the user's call. (Aside: the control-sheet
title contains the rename pencil inside `.dsheet-title`, so `textContent`
reads `"<name>edit"` in tests — cosmetic, not a bug.)
