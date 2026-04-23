# Requirements: PicSize Pro

**Defined:** 2026-04-23
**Core Value:** Upload any image → instantly get a file that meets exact format, dimension, and size requirements — no manual trial-and-error needed.

---

## v1 Requirements (MVP)

Requirements for the initial release. Each maps to a roadmap phase.

### Upload

- [ ] **UPLD-01**: User can upload a single image via drag-and-drop or file picker
- [ ] **UPLD-02**: User can upload files in HEIC, RAW, WEBP, PNG, JPG, SVG, and TIFF formats
- [ ] **UPLD-03**: User sees an immediate preview of the uploaded image before processing
- [ ] **UPLD-04**: User sees file metadata on upload (original format, dimensions, file size)

### Compression

- [ ] **COMP-01**: User can specify a maximum target file size (e.g., 49KB, 100KB, 200KB)
- [ ] **COMP-02**: System applies recursive compression to reach the target size without exceeding it
- [ ] **COMP-03**: System respects a minimum quality floor — never compresses below perceptible quality
- [ ] **COMP-04**: User sees the output file size and compression ratio after processing
- [ ] **COMP-05**: User can download the compressed output file

### Resize & Aspect Ratio

- [ ] **RSZR-01**: User can specify target output dimensions (width × height in px or mm)
- [ ] **RSZR-02**: System auto-resizes while maintaining original aspect ratio by default
- [ ] **RSZR-03**: User can toggle "Smart Crop" to fill exact dimensions by cropping from center
- [ ] **RSZR-04**: User can choose crop anchor (center, top, face-aware) when smart crop is enabled

### Format Conversion

- [ ] **CONV-01**: User can select any supported output format (JPEG, PNG, WEBP, TIFF, AVIF)
- [ ] **CONV-02**: System converts input file to the selected output format during processing
- [ ] **CONV-03**: User can convert HEIC/RAW inputs to any output format

---

## v2 Requirements (Pro Features)

Deferred to enhanced release. Tracked but not in current roadmap.

### Presets

- **PRES-01**: User can select from a preset library (Passport India, Passport US, LinkedIn Banner, Amazon Product, etc.)
- **PRES-02**: Selecting a preset auto-fills target format, dimensions, and max file size
- **PRES-03**: User can save custom presets for reuse

### Privacy-First Mode

- **PRIV-01**: User can toggle Privacy-First mode to process files entirely via WASM in-browser
- **PRIV-02**: In Privacy-First mode, zero bytes of the original file are sent to any server
- **PRIV-03**: System shows a visible indicator when Privacy-First mode is active

### Signature Extractor

- **SIGN-01**: User can trigger background removal on a signature scan to isolate ink on transparent background
- **SIGN-02**: System detects white/near-white background and removes it cleanly

### Document Cleaner

- **DOCC-01**: User can apply auto white balance to scanned ID documents
- **DOCC-02**: User can apply contrast boost to improve legibility of scanned documents
- **DOCC-03**: User can apply deskew to straighten slightly rotated scans

### PDF Generator

- **PDFF-01**: User can upload multiple images and combine them into a single PDF
- **PDFF-02**: User can set a target max file size for the combined PDF
- **PDFF-03**: System applies per-image compression to bring the PDF under the target size

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first; mobile PWA is post-v2 |
| Video conversion | Image-only tool — video is a different domain |
| User accounts / cloud storage | Stateless tool in v1/v2; no auth complexity |
| Real-time collaboration | Single-user tool |
| AI image generation | Transformer/optimizer only, not a generative tool |
| OCR / text extraction | Out of domain for an image size tool |
| Background removal (general) | Only for signature extraction use case in v2 |

---

## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPLD-01 | Phase 1 | Pending |
| UPLD-02 | Phase 1 | Pending |
| UPLD-03 | Phase 1 | Pending |
| UPLD-04 | Phase 1 | Pending |
| COMP-01 | Phase 2 | Pending |
| COMP-02 | Phase 2 | Pending |
| COMP-03 | Phase 2 | Pending |
| COMP-04 | Phase 2 | Pending |
| COMP-05 | Phase 2 | Pending |
| RSZR-01 | Phase 3 | Pending |
| RSZR-02 | Phase 3 | Pending |
| RSZR-03 | Phase 3 | Pending |
| RSZR-04 | Phase 3 | Pending |
| CONV-01 | Phase 4 | Pending |
| CONV-02 | Phase 4 | Pending |
| CONV-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-23*
*Last updated: 2026-04-23 after initial definition*
