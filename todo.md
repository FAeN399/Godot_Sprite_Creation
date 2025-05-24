```markdown
---
title: Sprite Creator To-Do Checklist
project: JRPG Desktop Tool-Suite — Sprite Creator
related_plan: prompt_plan.md
related_spec: spec.md
date: 2025-05-24
---

### Phase 1 – Infrastructure & Standards
- [x] **Repo Scaffold & CI** – monorepo package + CI workflow (Plan 1, NFR-1/NFR-5)
- [x] **Lint / Format Baseline** – ESLint + Prettier + Husky (Plan 2, NFR-3/NFR-5)

### Phase 2 – Core Data Models
- [x] **Sprite JSON Schema** – define & failing validation test (Plan 3, SPR-FR-2/3)
- [x] **Data Model Implementation** – make schema test pass (Plan 4)
- [ ] **Palette Utilities** – 256-color palette ops (Plan 5, SPR-FR-5/6)
- [ ] **Layer Bitmap Encoding** – RLE encode/decode (Plan 6, SPR-FR-2)
- [ ] **Animation Timeline Model** – frames & durations (Plan 7, SPR-FR-3)
- [ ] **Undo/Redo Service** – command stack (Plan 8, SPR-FR-9)
- [ ] **Autosave Service** – write/prune snapshots (Plan 9, SPR-FR-9)

### Phase 3 – Canvas & Editing Tools
- [ ] **Canvas Renderer Skeleton** – checkerboard grid (Plan 10, SPR-FR-1)
- [ ] **Draw Pixel Action** – mouse input → model (Plan 11, SPR-FR-1)
- [ ] **Onion-Skin Overlay** – ghost frames (Plan 12, SPR-FR-4)
- [ ] **Mirror Drawing** – symmetric pixels (Plan 13, toolbar spec)

### Phase 4 – UI Panels
- [ ] **Layers Panel** – thumbnails, opacity, add/merge (Plan 14, SPR-FR-2)
- [ ] **Palette Panel** – swatches, import `.ase` (Plan 15, SPR-FR-5)
- [ ] **Random Sprite Generator** – component selection & generation (Plan 16, SPR-FR-11)
- [ ] **Variants Panel** – palette-swap list (Plan 18, SPR-FR-6)
- [ ] **Timeline Component** – frame thumbnails & playback (Plan 19, SPR-FR-3)
- [ ] **Toolbar & Hotkeys** – icons + keyboard map (Plan 20, SPR-FR-10)

### Phase 5 – Exporters
- [ ] **PNG Sheet Exporter** – generate sprite-sheet (Plan 21, SPR-FR-7)
- [ ] **SpriteFrames `.tres` Exporter** – Godot resource (Plan 22, SPR-FR-7)
- [ ] **GIF Preview Exporter** – optional animated gif (Plan 23, SPR-FR-7)
- [ ] **Export Workflow Integration** – file in `sprites/` (Plan 24, SPR-FR-8)

### Phase 6 – Quality & Performance
- [ ] **Performance Benchmark 60 FPS** – Playwright probe (Plan 25, NFR-1)
- [ ] **Autosave & Recovery Test** – end-to-end (Plan 26, §7)
- [ ] **Headless Godot Import Test** – `.tres` validity (Plan 27, §6)
- [ ] **I18n Extraction Test** – missing key guard (Plan 28, NFR-6)
- [ ] **Accessibility Keyboard Nav Test** – tab focus order (Plan 29, NFR-3)
- [ ] **Error Toast & Logger** – user feedback + log (Plan 30, §7)

### Phase 7 – Packaging & Docs
- [ ] **Packaging Script** – Electron Builder installers (Plan 31, NFR-8)
- [ ] **Tooltip Lint Coverage** – doc-lint CI (Plan 32, NFR-9)

### Phase 8 – Design Decision
- [ ] **⚠ Decide GIF Dithering Strategy** – choose FS vs. Ordered (Plan 33, open)

### Phase 9 – Integration & Release
- [ ] **Export Sync IPC** – trigger ProjectStore update (Plan 34, SPR-FR-8)
- [ ] **Changelog Update** – Sprite Creator v0.1 entry (Plan 35)
- [ ] **Release Pipeline** – build & upload installers (Plan 36)
```
