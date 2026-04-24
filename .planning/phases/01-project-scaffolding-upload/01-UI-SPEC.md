# Phase 1: UI Design Contract
# Project Scaffolding & Upload — UI-SPEC

**Phase:** 1 — Project Scaffolding & Upload
**Generated:** 2026-04-24
**Status:** Approved
**Source:** User design brief (Neo-Brutalist) + layout preferences

---

## 1. Design Language

**Theme:** Neo-Brutalist Dark Mode

The visual system is intentionally raw, bold, and unapologetic. Every element has visible weight. Hard-offset shadows replace blur. Thick borders replace soft cards. The aesthetic communicates precision and power — this is a tool for people who know what they're doing.

**Do not:**
- Use rounded corners beyond `rounded` (4px)
- Use box-shadow blur radius > 0
- Use opacity/transparency for overlays (use solid color variants instead)
- Use gradients on interactive elements

---

## 2. Color Tokens

```css
/* Base */
--color-base:        #1a1110;   /* Deep charcoal-brown — page background */
--color-surface:     #231918;   /* Slightly lighter — card/panel surfaces */
--color-surface-alt: #2d1f1d;   /* Tertiary surfaces, hover states */
--color-border:      #000000;   /* Solid black borders on all containers */

/* Accents */
--color-primary:     #f5d547;   /* Cream-Yellow — buttons, primary CTAs, logo */
--color-secondary:   #f8a398;   /* Salmon-Pink — shadow offsets, borders, tags */
--color-success:     #17cf97;   /* Teal-Green — convert button, success states, LED */

/* Text */
--color-text-base:   #f0ebe8;   /* Near-white — body text */
--color-text-muted:  #a89891;   /* Muted warm gray — metadata, labels */
--color-text-inverse:#1a1110;   /* Dark — text on primary/accent backgrounds */

/* Status */
--color-error:       #ff5c5c;   /* Red — error states */
--color-warning:     #f5d547;   /* Reuse primary — warnings */
```

**Tailwind config extension (tailwind.config.ts):**
```ts
colors: {
  base:     '#1a1110',
  surface:  '#231918',
  'surface-alt': '#2d1f1d',
  primary:  '#f5d547',
  secondary:'#f8a398',
  success:  '#17cf97',
  muted:    '#a89891',
  text:     '#f0ebe8',
}
```

---

## 3. Typography

**Font stack:** Geist (display/UI) + Geist Mono (metadata/code/values)

```html
<!-- In app/layout.tsx -->
import { Geist, Geist_Mono } from 'next/font/google'
```

**Scale:**

| Token | Size | Weight | Font | Usage |
|-------|------|--------|------|-------|
| `display` | 3rem / 48px | 900 | Geist | Logo, hero heading |
| `heading` | 1.5rem / 24px | 800 | Geist | Section headers |
| `subheading` | 1.125rem / 18px | 700 | Geist | Card titles |
| `body` | 1rem / 16px | 400 | Geist | Body text |
| `label` | 0.875rem / 14px | 600 | Geist | Input labels, tags |
| `mono` | 0.875rem / 14px | 400 | Geist Mono | File size, dimensions, format values |
| `mono-sm` | 0.75rem / 12px | 400 | Geist Mono | Metadata captions |

**Letter spacing:** Headings use `tracking-tight` (-0.025em). Mono values use `tracking-normal`.

---

## 4. Spacing & Layout

**Grid:** 12-column, 24px gutters, max-width 1280px
**Container padding:** 24px (mobile) → 48px (desktop)

**Spacing scale (multiples of 4px):**
```
4px → 0.25rem (xs)
8px → 0.5rem  (sm)
16px → 1rem   (md)
24px → 1.5rem (lg)
32px → 2rem   (xl)
48px → 3rem   (2xl)
64px → 4rem   (3xl)
```

**Main layout:** Side-by-side panel (2-column at ≥ 1024px)
- Left column (60%): Upload zone + file metadata
- Right column (40%): Controls panel + output/download

At < 1024px: single column, controls collapse below upload zone.

---

## 5. The Staggered Stack System

Every major container uses a "staggered stack" — the visible card sits offset above a colored background layer.

**Implementation pattern:**
```html
<!-- Wrapper positions both layers -->
<div class="relative">
  <!-- Background shadow layer (Salmon-Pink) -->
  <div class="absolute inset-0 translate-x-2 translate-y-2 bg-secondary border-2 border-black rounded" />
  <!-- Foreground card -->
  <div class="relative bg-surface border-2 border-black rounded z-10">
    {content}
  </div>
</div>
```

**Tailwind shorthand (custom class in globals.css):**
```css
.neo-card {
  @apply relative;
}
.neo-card::before {
  content: '';
  @apply absolute inset-0 bg-secondary border-2 border-black rounded;
  transform: translate(8px, 8px);
  z-index: 0;
}
.neo-card > * {
  @apply relative z-10;
}
```

**Shadow variants:**
- `shadow-primary`: `8px 8px 0px 0px #f5d547` — Used on interactive/hover
- `shadow-secondary`: `8px 8px 0px 0px #f8a398` — Default card shadow
- `shadow-success`: `8px 8px 0px 0px #17cf97` — Success/convert states

---

## 6. Component Specifications

### 6.1 Navigation Bar — `<TrustHeader />`

**Layout:** Fixed top bar, full-width, `z-50`
**Height:** 60px
**Background:** `#1a1110` with `border-b-2 border-black`

```
[ <PIC-TRANSFORM/> ]  ────────────  [ Docs ] [ GitHub ]  [ 🛡 PRIVATE · LOCAL ●● ]
```

**Logo `<PIC-TRANSFORM/>`:**
- Font: Geist 900, 20px
- Color: `#f5d547` (primary)
- Formatted in monospace angle-bracket style: `<PIC-TRANSFORM/>`
- Wrapped in `border-2 border-primary px-3 py-1` box

**Trust Widget (right side of nav):**
- A pill-shaped status box: `border-2 border-black bg-surface px-4 py-2`
- Text: `SYSTEM STATUS:` in `text-muted text-xs font-mono` + `PRIVATE · LOCAL` in `text-success text-xs font-mono font-bold`
- LED indicator: `w-2 h-2 rounded-full bg-success` with CSS animation `animate-pulse` (1.5s)
- On toggle: text changes to `SERVER · CLOUD`, LED color changes to `bg-warning`

**Privacy Mode Toggle:**
- A `<button>` immediately right of status text
- Label: `[CLIENT]` or `[SERVER]` in monospace
- Style: `border-2 border-black bg-primary text-base text-xs font-mono font-bold px-3 py-1`
- Active state: `bg-success text-base` (when in client/WASM mode)
- Toggle switches the processing mode state globally via React context

---

### 6.2 Upload Zone — `<UploadZone />`

**Size:** Full width of left column, min-height 320px
**Stack structure:** Salmon-Pink offset layer (8px/8px) behind the main zone

**States:**

| State | Border | Background | Shadow |
|-------|--------|------------|--------|
| Idle | `2px solid black` dashed-feeling (use `border-dashed border-2`) | `bg-surface` | `shadow-secondary` |
| Drag-over | `4px solid #f5d547` solid | `bg-surface-alt` | `shadow-primary` scale-up |
| Uploading | `2px solid #17cf97` | `bg-surface` | `shadow-success` |
| Error | `2px solid #ff5c5c` | `bg-surface` | `8px 8px 0 0 #ff5c5c` |

**Content (idle):**
```
         ↑
    [ UPLOAD ICON 48px ]
    DROP FILES HERE
    or click to browse
    ─────────────────
    HEIC · RAW · WEBP · PNG · JPG · SVG · TIFF
```
- "DROP FILES HERE" → `text-primary font-black text-2xl uppercase tracking-tight`
- "or click to browse" → `text-muted text-sm font-mono`
- Format list → `text-muted text-xs font-mono tracking-widest`
- Icon: custom SVG arrow-up in `#f5d547`

**Drag-over overlay:** Solid `bg-primary/10` overlay (use `bg-[#f5d54710]`) with border highlight

**File accepted state:**
```
[ IMAGE THUMBNAIL 200x200 ] ← actual preview image
─────────────────────────────
filename.heic                       ← font-mono text-text
FORMAT: HEIC  ·  3840×2160  ·  4.2 MB  ← font-mono text-muted text-sm
```
Thumbnail: `object-contain`, surrounded by `border-2 border-black`, 200px max

---

### 6.3 Metadata Panel — `<MetadataPanel />`

Lives below the upload zone thumbnail.

```
┌──────────────────────────────────────┐
│  FILE INFORMATION              [×]   │
├──────────────────────────────────────┤
│  FILENAME    portrait.heic           │
│  FORMAT      HEIC (image/heic)       │
│  DIMENSIONS  3840 × 2160 px          │
│  FILE SIZE   4.2 MB (4,398,046 B)    │
│  COLOR SPACE sRGB                    │
└──────────────────────────────────────┘
```

**Style:**
- Container: `border-2 border-black bg-surface` with `shadow-secondary`
- Header: `bg-primary text-base font-black text-sm uppercase px-4 py-2 border-b-2 border-black`
- Rows: alternating `bg-surface` / `bg-surface-alt`, `px-4 py-2`
- Labels: `text-muted font-mono text-xs uppercase tracking-widest`
- Values: `text-text font-mono text-sm`

---

### 6.4 Controls Panel — `<ControlsPanel />`

Right column, sticky at top. Staggered stack with primary-yellow shadow on hover.

**Sections:**

**Section A — Target Format**
```
TARGET FORMAT
[ JPG ] [ PNG ] [ WEBP ] [ AVIF ] [ TIFF ]
```
- "Tech Tag" grid of format buttons
- Each tag: `border-2 border-black bg-surface text-text font-mono text-sm px-4 py-2`
- Selected: `bg-primary text-base border-2 border-black shadow-[4px_4px_0px_0px_#000]`
- Hover: `bg-surface-alt`

**Section B — Max File Size**
```
MAX FILE SIZE (KB)
[ ________ ] KB   ← retro input field
[ ████░░░░░░ ] 49 KB  ← optional slider
```
- Input: `border-2 border-black bg-base text-text font-mono text-lg px-4 py-3 w-full`
- Focus: `outline-none ring-0 border-primary` (border color swap)
- No border-radius (`rounded-none`)

**Section C — Dimensions** (collapsible)
```
▸ RESIZE OPTIONS
  Width: [ ____ ] px   Height: [ ____ ] px
  [×] Lock aspect ratio   [×] Smart Crop
```
- Chevron toggle: `text-muted font-mono text-xs`
- Checkboxes styled as Neo-Brutalist toggles

**Convert Button:**
```
[ ⚡ CONVERT & DOWNLOAD ]
```
- Full-width, `bg-success text-base font-black text-lg uppercase tracking-tight`
- Border: `border-2 border-black`
- Shadow: `shadow-[6px_6px_0px_0px_#000]`
- Hover: translate `-1px -1px`, shadow expands to `8px 8px`
- Active: translate `2px 2px`, shadow shrinks to `4px 4px`
- Disabled: `bg-surface-alt text-muted cursor-not-allowed` — no shadow

---

### 6.5 Output/Preview Cards — `<PreviewGrid />`

Side-by-side comparison below controls or in a modal.

```
┌─────────────────┐  ┌─────────────────┐
│   ORIGINAL      │  │   OPTIMIZED     │
│                 │  │                 │
│  [IMAGE THUMB]  │  │  [IMAGE THUMB]  │
│                 │  │                 │
│  4.2 MB · HEIC  │  │  48 KB · JPEG   │
│  3840×2160      │  │  1200×675 ✓     │
└─────────────────┘  └─────────────────┘
                      ─88.6% size ↓─
```
- "ORIGINAL" header: `bg-surface border-b-2 border-black`
- "OPTIMIZED" header: `bg-success text-base border-b-2 border-black`
- Reduction badge: `bg-primary text-base font-black font-mono` centered below

---

## 7. Interaction & Animation Contracts

**Micro-animations (CSS only — no framer-motion in Phase 1):**

| Interaction | Animation |
|-------------|-----------|
| Button hover | `transition-transform duration-100 ease-out` + `-translate-x-1 -translate-y-1` |
| Button active | `translate-x-1 translate-y-1` |
| Drop zone drag-over | `transition-all duration-150` + scale `1.01` |
| LED pulse | `@keyframes pulse` — opacity 1→0.4→1, 1.5s infinite |
| Upload progress | Width transition on progress bar, `transition-[width] duration-300` |
| Format tag select | `transition-colors duration-100` |
| Privacy toggle switch | `transition-colors duration-200` |

**Loading states:**
- Upload processing: Spinning border on thumbnail area using `animate-spin` on a border segment
- Compression in progress: Horizontal progress bar under convert button, `bg-success`, animated width

**Error states:**
- Toast-style error: Slides in from bottom-right, `bg-error border-2 border-black shadow-[4px_4px_0px_0px_#000]`, auto-dismisses after 5s

---

## 8. Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 640px` (mobile) | Single column; controls panel below upload; format tags wrap |
| `640–1024px` (tablet) | Single column; side-by-side preview cards |
| `≥ 1024px` (desktop) | Two-column (60/40); full side-by-side |

**Navigation on mobile:** Logo + trust widget stack vertically; nav links hidden (hamburger optional in Phase 5)

---

## 9. Accessibility Contracts

- All interactive elements have `aria-label` with descriptive text
- Focus states: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base`
- Upload zone: `role="button" aria-label="Upload image — drag and drop or click to browse"` + `tabIndex={0}` + keyboard Enter/Space triggers file picker
- Privacy toggle: `aria-pressed` attribute reflects current mode
- Format tags: `role="radio"` group with `aria-checked`
- Color contrast: All text on dark backgrounds passes WCAG 2.1 AA (minimum 4.5:1 ratio)
- Error messages: `role="alert"` on error toast

---

## 10. File Structure (Phase 1 scope)

```
src/
├── app/
│   ├── layout.tsx          ← Geist font, base metadata, TrustHeader
│   ├── page.tsx            ← Main converter page
│   └── globals.css         ← CSS tokens, .neo-card, animations
├── components/
│   ├── layout/
│   │   └── TrustHeader.tsx ← Nav + logo + privacy toggle + LED
│   ├── upload/
│   │   ├── UploadZone.tsx  ← Drop zone with states
│   │   └── MetadataPanel.tsx ← File info display
│   ├── controls/
│   │   └── ControlsPanel.tsx ← Format tags, size input, convert button
│   └── ui/                 ← Primitives (reused across phases)
│       ├── NeoCard.tsx     ← Staggered stack wrapper
│       ├── NeoButton.tsx   ← Button variants
│       ├── NeoInput.tsx    ← Retro input field
│       └── TechTag.tsx     ← Format/option tag
├── context/
│   └── ProcessingContext.tsx ← Privacy mode + file state (React context)
└── lib/
    └── metadata.ts         ← Client-side file metadata extraction
```

---

## 11. Copywriting & Tone

- **Headings:** ALL CAPS, no punctuation — `DROP FILES HERE`, `TARGET FORMAT`, `CONVERT & DOWNLOAD`
- **Labels:** Uppercase monospace — `FILE SIZE`, `DIMENSIONS`, `SYSTEM STATUS`
- **Body:** Sentence case, terse — "or click to browse", "Processing on your device"
- **Error messages:** Direct, no fluff — "File too large. Maximum 50MB.", "Format not supported."
- **Privacy mode:** `PRIVATE · LOCAL` (client) vs `CLOUD · SERVER` (server)
- **Logo:** `<PIC-TRANSFORM/>` — angle-bracket developer style, never "PicSize Pro" in the UI

---

## 12. Design Tokens File

`src/app/globals.css` must define:

```css
:root {
  --base:        #1a1110;
  --surface:     #231918;
  --surface-alt: #2d1f1d;
  --primary:     #f5d547;
  --secondary:   #f8a398;
  --success:     #17cf97;
  --muted:       #a89891;
  --text:        #f0ebe8;
  --error:       #ff5c5c;
  --border:      #000000;

  --shadow-primary:   8px 8px 0px 0px #f5d547;
  --shadow-secondary: 8px 8px 0px 0px #f8a398;
  --shadow-success:   8px 8px 0px 0px #17cf97;
  --shadow-sm:        4px 4px 0px 0px #000000;
}
```

---

## UI-SPEC COMPLETE

**Phase 1: Project Scaffolding & Upload** — UI design contract approved

**Dimensions covered:**
- ✓ Color system — full token set defined
- ✓ Typography — Geist + Geist Mono, full scale
- ✓ Spacing & layout — grid, breakpoints, column structure
- ✓ Components — 6 components fully spec'd with states
- ✓ Interactions — all animation/transition contracts defined
- ✓ Accessibility — ARIA roles, focus states, contrast requirements

---
*Phase: 01-project-scaffolding-upload*
*UI-SPEC generated: 2026-04-24*
*Design system: Neo-Brutalist Dark Mode*
*Layout: Side-by-side panel (60/40)*
*Typography: Geist + Geist Mono*
*Trust Widget: Persistent header bar*
