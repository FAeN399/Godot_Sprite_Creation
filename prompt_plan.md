````markdown
---
title: Sprite Creator Execution Plan (TDD)
project: JRPG Desktop Tool-Suite — Sprite Creator
related_spec: spec.md
version: 1.0
date: 2025-05-24
---

1. **Repo Scaffold & CI Setup (covers NFR-1, NFR-5)**  
```prompt
Scaffold `sprite-creator` package inside monorepo with pnpm workspaces.  
Add GitHub Actions workflow `ci_sprite.yml` running `pnpm install && pnpm test` on ubuntu-latest.  
Commit: "chore(sprite): scaffold package & CI".

2. **Lint / Format Baseline (covers NFR-3, NFR-5)**

```prompt
Configure ESLint (typescript-eslint) + Prettier in `packages/sprite-creator`.  
Add Husky pre-commit to run `pnpm lint`.  
Create failing Vitest `lint.spec.ts` asserting codebase passes eslint.  
Commit: "chore(sprite): lint & prettier baseline".
```

3. **Define Sprite JSON Schema (covers SPR-FR-2, SPR-FR-3, §5.1)**

```prompt
Write `schemas/sprite.schema.json`.  
Failing test: validate sample sprite JSON against schema.  
Commit: "test(sprite): sprite JSON schema + failing validation".
```

4. **Core Data Model Implementation (passes test 3)**

```prompt
Implement `src/model/Sprite.ts` with TypeBox + ajv validation.  
Make test from step 3 pass.  
Commit: "feat(model): Sprite data model".
```

5. **Palette Model & Utilities (covers SPR-FR-5, SPR-FR-6)**

```prompt
Add tests for `Palette` class: max 256 colors, import `.ase`, map swap.  
Implement `src/model/Palette.ts` utilities to pass tests.  
Commit: "feat(model): palette utilities".
```

6. **Layer Bitmap Encoding (covers SPR-FR-2)**

```prompt
Test RLE encode/decode of 32×32 layer bitmap; expect lossless.  
Implement `src/model/LayerBitmap.ts`.  
Commit: "feat(model): layer bitmap encoding".
```

7. **Animation Timeline Model (covers SPR-FR-3)**

```prompt
Failing test: create `Animation` with 8 frames, durations sum=800 ms.  
Implement `src/model/Animation.ts`.  
Commit: "feat(model): animation timeline".
```

8. **Undo/Redo Core Service (covers SPR-FR-9)**

```prompt
Test command stack push/undo/redo with 100 actions.  
Implement `src/lib/undoRedo.ts`.  
Commit: "feat(core): undo/redo service".
```

9. **Autosave Service (covers SPR-FR-9, §7)**

```prompt
Failing test: `Autosave.write()` creates file in `.autosave/` then prune >10.  
Implement `src/lib/autosave.ts`.  
Commit: "feat(core): autosave snapshots".
```

10. **Canvas Renderer Skeleton (covers SPR-FR-1, UI §4)**

```prompt
React Testing Library: mount `PixelCanvas` → renders checkerboard grid.  
Implement minimal canvas with react-konva.  
Commit: "feat(ui): canvas skeleton".
```

11. **Draw Pixel Action (covers SPR-FR-1)**

```prompt
Test: click (10,10) sets pixel color in Sprite model.  
Wire canvas mouse handler to model.  
Commit: "feat(ui): draw pixel".
```

12. **Onion-Skin Toggle (covers SPR-FR-4)**

```prompt
Test: enabling onion-skin renders previous frame ghost at 0.5 opacity.  
Implement onion-skin overlay.  
Commit: "feat(ui): onion-skin overlay".
```

13. **Mirror Drawing Toggle (covers toolbar spec)**

```prompt
Test: mirror toggle draws symmetric pixels.  
Implement mirror logic & toolbar icon.  
Commit: "feat(ui): mirror drawing".
```

14. **Layers Panel Component (covers SPR-FR-2)**

```prompt
Test: add layer button increases list count; opacity slider updates model.  
Create `LayersPanel.tsx`.  
Commit: "feat(ui): layers panel".
```

15. **Palette Panel Component (covers SPR-FR-5)**

```prompt
Test: click swatch changes active color; import .ase populates palette.  
Implement `PalettePanel.tsx`.  
Commit: "feat(ui): palette panel".
```

16. **Random Sprite Generator Component (covers SPR-FR-11)**

```prompt
Test: "Generate Random" creates sprite with head, body, accessories from component templates.  
Implement `RandomSpriteGenerator.tsx` with component selection dropdowns.  
Commit: "feat(ui): random sprite generator".
```

17. **Variant Palette-Swap Function (covers SPR-FR-6)**

```prompt
Unit: paletteSwap maps #4caf50→#2196f3 across bitmap.  
Implement `src/lib/paletteSwap.ts`.  
Commit: "feat(core): palette swap function".
```

18. **Variant UI List (covers SPR-FR-6)**

```prompt
Test: "New Palette Swap" creates variant item in list.  
Implement `VariantsPanel.tsx`.  
Commit: "feat(ui): variants panel".
```

19. **Timeline Component (covers SPR-FR-3)**

```prompt
Test: add frame duplicates bitmap; play button cycles frames.  
Create `Timeline.tsx`.  
Commit: "feat(ui): timeline".
```

20. **Toolbar & Hotkeys (covers SPR-FR-10)**

```prompt
Test: pressing `B` selects Brush tool; toolbar icon highlighted.  
Implement `Toolbar.tsx` + hotkey map.  
Commit: "feat(ui): toolbar & hotkeys".
```

21. **PNG Sheet Exporter (covers SPR-FR-7)**

```prompt
Test: exportPNG returns Buffer; size >0.  
Implement `src/export/pngExporter.ts`.  
Commit: "feat(export): PNG sheet exporter".
```

22. **SpriteFrames .tres Exporter (covers SPR-FR-7)**

```prompt
Test: exportTres returns text starting with `[resource]`.  
Implement `src/export/tresExporter.ts`.  
Commit: "feat(export): SpriteFrames tres exporter".
```

23. **GIF Preview Export (covers SPR-FR-7)**

```prompt
Test: exportGif returns <=2 MB Buffer for 8 frames.  
Implement optional GIF exporter.  
Commit: "feat(export): GIF preview exporter".
```

24. **Integration: Export Workflow (covers SPR-FR-8)**

```prompt
Playwright: create sprite → click Export PNG → file exists in `sprites/`.  
Commit: "test(integration): export workflow".
```

25. **Performance Benchmark 60 FPS (covers NFR-1)**

```prompt
Playwright perf test: canvas fps ≥60 on 128×128 sprite @400 %.  
Fail if fps <60.  
Commit: "perf: canvas benchmark".
```

26. **Autosave & Recovery Integration (covers §7)**

```prompt
E2E: draw pixel, wait 65 s, kill app; relaunch → restore autosave prompt.  
Commit: "test(integration): autosave recovery".
```

27. **Headless Godot Import Test (covers §6)**

```prompt
CI: run Godot 4.1 headless; load exported `.tres`; assert frame count=8.  
Commit: "test(integration): headless Godot import".
```

28. **I18n Extraction Test (covers NFR-6)**

```prompt
Unit: missing translation key throws during build.  
Integrate i18next parser.  
Commit: "feat(i18n): string externalization test".
```

29. **Accessibility Keyboard Nav Test (covers NFR-3)**

```prompt
Playwright: Tab cycles toolbar → layers list → canvas focus outline visible.  
Commit: "test(a11y): keyboard navigation".
```

30. **Error Toast & Logger (covers §7)**

```prompt
Test: simulate export error; toast appears; log file updated.  
Implement toast & winston logger.  
Commit: "feat(ui): error toast & logging".
```

31. **Packaging Script (covers NFR-8)**

```prompt
Configure Electron Builder for sprite-only dev build; produce installers.  
Commit: "build(sprite): packaging config".
```

32. **Docs Tooltip Lint (covers NFR-9)**

```prompt
Doc-lint test: every toolbar button has `title` attr.  
Add script to CI.  
Commit: "docs: tooltip coverage checker".
```

33. **⚠ OPEN QUESTION: GIF Color Dithering Strategy**

```prompt
Prompt dev to choose: Floyd–Steinberg vs. Ordered dithering for GIF export.  
Commit decision before coding further.
```

34. **Cross-Module Sync Trigger (covers SPR-FR-8)**

```prompt
Test: after export, emit IPC "export:sprite" → ProjectStore records file.  
Implement sync trigger.  
Commit: "feat(integration): export sync IPC".
```

35. **Version Bump & Changelog**

```prompt
Update `CHANGELOG.md` with Sprite Creator v0.1.  
Commit: "chore(sprite): update changelog for v0.1".
```

36. **Release Artefacts**

```prompt
CI job `release_sprite.yml`: build installers, upload to GitHub release `v0.1.0-sprite-creator`.  
Commit: "chore(sprite): release pipeline".
```

```
```
