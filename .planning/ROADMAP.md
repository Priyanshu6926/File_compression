# Roadmap: PicSize Pro

**Milestone:** M1 — MVP (v1)
**Granularity:** Standard
**Mode:** YOLO
**Generated:** 2026-04-23

---

## Phase Overview

| # | Phase | Goal | Requirements | Criteria |
|---|-------|------|--------------|----------| 1 | Project Scaffolding & Upload | Next.js app boots; users can upload any supported image format and see a preview | UPLD-01, UPLD-02, UPLD-03, UPLD-04 | ✅ 4/4 |
| 2 | Compression Engine | Recursive server-side compression hits an exact max file size target | COMP-01, COMP-02, COMP-03, COMP-04, COMP-05 | ✅ 5/5 |
| 3 | Resize & Aspect Ratio Engine | Users can specify dimensions; system resizes with ratio-lock and smart crop | RSZR-01, RSZR-02, RSZR-03, RSZR-04 | ✅ 4/4 |
| 4 | Format Conversion | Bi-directional conversion between all supported formats including HEIC and RAW | CONV-01, CONV-02, CONV-03 | ✅ 5/5 |
| 5 | UI Polish & UX Hardening | Production-ready UI: responsive layout, error states, loading indicators, accessibility | — (cross-cutting) | 5 |
| 6 | Vercel Deployment & CI | App deployed to Vercel with GitHub Actions CI; production environment validated | — (infrastructure) | 4 |

---

## Phase Details

### Phase 1: Project Scaffolding & Upload (✅ COMPLETE)

**Goal:** Bootstrap the Next.js 16 App Router project, configure Sharp and WASM build pipeline, and deliver a working upload flow with instant preview and file metadata display.

**UI hint:** yes

**Requirements:**
- UPLD-01: User can upload a single image via drag-and-drop or file picker
- UPLD-02: User can upload files in HEIC, RAW, WEBP, PNG, JPG, SVG, and TIFF formats
- UPLD-03: User sees an immediate preview of the uploaded image before processing
- UPLD-04: User sees file metadata on upload (original format, dimensions, file size)

**Success Criteria:**
1. ✅ `npx create-next-app@latest` scaffolding runs cleanly; dev server starts at `localhost:3000`
2. ✅ User can drag-and-drop or click to pick a HEIC, RAW, WEBP, PNG, JPG, SVG, or TIFF file
3. ✅ A preview thumbnail of the uploaded image appears within 500ms of file selection
4. ✅ File metadata panel shows: original format, pixel dimensions, and file size in KB/MB
5. ✅ Invalid file types are rejected with a clear error message

**Depends on:** None

**Plans:**
- ✅ 1.1 — Scaffold Next.js 16 App Router project with TypeScript, Tailwind, ESLint
- ✅ 1.2 — Install and configure Sharp, heic-convert, and WASM build pipeline
- ✅ 1.3 — Build upload component (drag-and-drop + file picker) with format validation
- ✅ 1.4 — Build preview pane and metadata extraction (format, dimensions, size)

---

### Phase 2: Compression Engine (✅ COMPLETE)

**Goal:** Implement the core recursive compression algorithm: iteratively reduce quality/scale until the output file is at or below the user's specified max file size, while respecting a minimum quality floor.

**UI hint:** yes

**Requirements:**
- COMP-01: User can specify a maximum target file size (e.g., 49KB, 100KB, 200KB)
- COMP-02: System applies recursive compression to reach the target size without exceeding it
- COMP-03: System respects a minimum quality floor — never compresses below perceptible quality
- COMP-04: User sees the output file size and compression ratio after processing
- COMP-05: User can download the compressed output file

**Success Criteria:**
1. User can enter any target file size (in KB) and trigger compression
2. Output file size is ≤ target; algorithm does not overshoot by more than 2KB
3. Compression loop terminates even if minimum quality floor is reached (no infinite loop)
4. A "Quality warning" appears if the quality floor was hit without reaching the target
5. User can download the compressed file with a single click; filename reflects output format

**Depends on:** Phase 1

**Plans:**
- 2.1 — Design compression API route (`POST /api/compress`) accepting file + target size
- 2.2 — Implement recursive Sharp compression loop with binary-search quality tuning
- 2.3 — Add minimum quality floor guard and quality-warning response
- 2.4 — Build compression controls UI (target size input, progress indicator)
- 2.5 — Build output panel: file size, compression ratio, download button

---

### Phase 3: Resize & Aspect Ratio Engine (✅ COMPLETE)

**Goal:** Add dimension control — users can specify target width/height (px or mm), and the system resizes while maintaining aspect ratio by default, or applies smart crop to fill exact dimensions.

**UI hint:** yes

**Requirements:**
- RSZR-01: User can specify target output dimensions (width × height in px or mm)
- RSZR-02: System auto-resizes while maintaining original aspect ratio by default
- RSZR-03: User can toggle "Smart Crop" to fill exact dimensions by cropping from center
- RSZR-04: User can choose crop anchor (center, top, face-aware) when smart crop is enabled

**Success Criteria:**
1. User can input target dimensions in pixels or millimetres (with DPI selector)
2. Default resize maintains aspect ratio — no stretching or distortion
3. Smart Crop toggle fills the exact canvas; no black bars or letterboxing
4. Crop anchor options: Center, Top, and (if face detected) Face-aware
5. Preview updates to show the cropped/resized result before download

**Depends on:** Phase 1

**Plans:**
- 3.1 — Add dimension input controls (px/mm units, DPI presets: 72, 96, 300)
- 3.2 — Implement aspect-ratio-preserving resize via Sharp `.resize()` with `fit: inside`
- 3.3 — Implement smart crop mode with `fit: cover` and configurable `position`
- 3.4 — Integrate resize into the existing compression API route (combined pipeline)
- 3.5 — Update preview pane to reflect post-resize dimensions

---

### Phase 4: Format Conversion (✅ COMPLETE)

**Goal:** Add bi-directional format conversion — users can select any output format (JPEG, PNG, WEBP, AVIF, TIFF) and convert from any input including HEIC and RAW.

**UI hint:** yes

**Requirements:**
- CONV-01: User can select any supported output format (JPEG, PNG, WEBP, TIFF, AVIF)
- CONV-02: System converts input file to the selected output format during processing
- CONV-03: User can convert HEIC/RAW inputs to any output format

**Success Criteria:**
1. Output format selector shows: JPEG, PNG, WEBP, AVIF, TIFF options
2. A HEIC file converts successfully to JPEG or any other target format
3. A RAW file (CR2, NEF, ARW) converts to JPEG without manual pre-conversion
4. Format conversion chains correctly with compression and resize in one pass
5. Converted file downloads with the correct extension and MIME type

**Depends on:** Phase 2, Phase 3

**Plans:**
- 4.1 — Add output format selector component to UI
- 4.2 — Integrate heic-convert for HEIC → buffer decode pre-processing
- 4.3 — Integrate libraw/dcraw binding or alternative for RAW decode
- 4.4 — Wire format selection into the compression + resize pipeline (single Sharp chain)
- 4.5 — Validate output MIME types and file extensions on download

---

### Phase 5: UI Polish & UX Hardening

**Goal:** Elevate the UI to production-quality: responsive layout, loading/error states, accessible components, dark mode, and micro-animations.

**UI hint:** yes

**Requirements:** (cross-cutting quality concerns — all UPLD, COMP, RSZR, CONV)

**Success Criteria:**
1. App is fully responsive from 320px (mobile) to 1440px (desktop)
2. All loading states have skeleton loaders or progress indicators — no blank flashes
3. All error states show user-friendly messages with actionable recovery steps
4. App passes WCAG 2.1 AA contrast checks (axe-core audit clean)
5. Drag-and-drop, format picker, and download interactions have hover/active micro-animations

**Depends on:** Phase 4

**Plans:**
- 5.1 — Implement global design system (color tokens, typography, spacing) in CSS/Tailwind
- 5.2 — Add skeleton loaders and progress indicators for upload and processing states
- 5.3 — Add error boundary and per-field error messaging
- 5.4 — Implement dark mode toggle with system-preference detection
- 5.5 — Add micro-animations: upload drop zone, processing spinner, download button pulse

---

### Phase 6: Vercel Deployment & CI

**Goal:** Ship to production on Vercel; set up GitHub Actions for CI on every pull request; validate production environment with Sharp (Node.js runtime, not Edge).

**UI hint:** no

**Requirements:** (infrastructure — enables all v1 requirements in production)

**Success Criteria:**
1. `git push` to `main` triggers a successful Vercel production deployment
2. GitHub Actions CI runs lint + type-check + build on every PR
3. Sharp API routes run on Node.js runtime (not Edge) in Vercel production
4. Production app processes a HEIC → JPEG compression end-to-end without errors
5. Vercel function timeout is set appropriately (≥ 30s) for large-file compression loops

**Depends on:** Phase 5

**Plans:**
- 6.1 — Initialize GitHub repository and push initial scaffold
- 6.2 — Configure Vercel project with Node.js runtime for API routes (`runtime: 'nodejs'`)
- 6.3 — Set up GitHub Actions workflow: lint → typecheck → build
- 6.4 — Configure environment variables and Vercel project settings
- 6.5 — Run end-to-end smoke test on production URL

---

## Backlog (v2 — Pro Features)

| # | Feature | Phase Owner |
|---|---------|-------------|
| B1 | Preset Library (Passport, LinkedIn, Amazon, etc.) | Post-M1 |
| B2 | Privacy-First WASM mode (zero server footprint) | Post-M1 |
| B3 | Signature Extractor (background removal) | Post-M1 |
| B4 | Document Cleaner (white balance, contrast, deskew) | Post-M1 |
| B5 | Multi-Page PDF Generator | Post-M1 |

---
*Roadmap created: 2026-04-23*
*Milestone: M1 — MVP (v1)*
*Next action: `/gsd-plan-phase 5`*
