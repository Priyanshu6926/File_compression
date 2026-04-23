# PicSize Pro

## What This Is

PicSize Pro is a high-performance, web-based image transformation utility that accepts any image format and intelligently converts, resizes, and compresses it to meet specific portal, exam, or social media requirements. Users upload a raw file (HEIC, RAW, WEBP, PNG, JPG, SVG, TIFF) and the tool automatically transforms it to hit hard constraints like "JPEG, 35×45mm, under 100KB." A Privacy-First mode processes sensitive documents entirely in-browser via WebAssembly.

## Core Value

Upload any image → instantly get a file that meets exact format, dimension, and size requirements — no manual trial-and-error needed.

## Requirements

### Validated

<!-- None yet — ship to validate -->

(None yet — ship to validate)

### Active

- [ ] Universal upload supporting HEIC, RAW, WEBP, PNG, JPG, SVG, TIFF formats
- [ ] Hard-limit recursive compression targeting an exact max file size (e.g., ≤ 49KB) without dropping below minimum quality
- [ ] Aspect ratio engine with auto-resize and smart crop modes
- [ ] Bi-directional format conversion between all supported formats
- [ ] Preset library for common targets (Passport India/US, LinkedIn Banner, Amazon Product, etc.)
- [ ] Privacy-First WASM mode that processes files entirely in-browser (zero server footprint)
- [ ] Signature extractor with background removal for signatures on white paper
- [ ] Document cleaner with auto white balance and contrast boost for scanned IDs
- [ ] Multi-page PDF generator: combine images into a single optimized PDF under a size limit

### Out of Scope

- Native mobile app — web-first; mobile PWA considered only post-v2
- Video conversion — out of scope; image-only tool
- Cloud storage / account system — stateless tool, no user accounts in v1/v2
- Real-time collaboration — single-user tool
- AI image generation — this is a transformer/optimizer, not a generator

## Context

- Target users: anyone needing to comply with strict portal upload requirements (exam forms, visa applications, government portals, e-commerce listings, social media)
- Key insight: the pain is not "convert format" — it's "hit exact constraints without breaking quality"
- Sharp (Node.js) handles server-side heavy processing; WebAssembly (via squoosh-lib or equivalent) handles Privacy-First client-side mode
- Next.js 16 App Router is the chosen framework; deployment target is Vercel
- GSD workflow: BLAST framework (Blueprint → Linkage → Architecture → Stylize → Trigger)

## Constraints

- **Tech Stack**: Next.js 16 (App Router) — locked per project spec
- **Processing**: Sharp for server-side, WASM for client-side Privacy-First mode — both required
- **Deployment**: Vercel — serverless functions; Sharp must be handled via API routes (not edge runtime)
- **Performance**: Compression must be recursive but bounded — must not run infinitely or time out Vercel's function limits
- **Privacy**: Privacy-First mode must produce zero server-side data transfer for sensitive files
- **Format Support**: HEIC and RAW require additional decode libraries (heic-convert, dcraw/libraw bindings)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 App Router | Modern React server components + API routes in one codebase | — Pending |
| Sharp for server processing | Industry-standard Node.js image processing; fastest at compression loops | — Pending |
| WASM Privacy-First mode | Users with IDs/passports should not send files to any server | — Pending |
| Standard granularity | Balanced phase size — not too broad, not too micro | — Pending |
| YOLO mode | Auto-approve execution; user is experienced and knows the domain | — Pending |
| Vercel deployment | Zero-config Next.js hosting; serverless scales automatically | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
