````markdown
---
title: Sprite Creator Specification
version: 1.0
date: 2025-05-24
author: JRPG Desktop Tool-Suite Team
related_documents:
  - prompt_plan.md
  - todo.md
---

# 1  Introduction & Goals
The **Sprite Creator** is a dedicated pixel-art editor inside the JRPG Desktop Tool-Suite.  
Its mission is to let designers **draw, animate, recolor, and export** character and object sprites in a single workflow, then deliver Godot-ready assets with zero manual post-processing.

**MVP Objectives**

* Draw 16 – 128 px pixel art with classic tools (brush, eraser, bucket, marquee).  
* Create multi-layer, multi-frame animations with onion-skin support.  
* Batch-generate palette-swap variants.  
* Export a sprite-sheet (`.png`) + **Godot SpriteFrames** resource (`.tres`) + optional preview `.gif`.  
* One-click sync to ProjectStore so the Godot addon auto-imports updated sprites.

---

# 2  Functional Requirements

| ID | Requirement |
|----|-------------|
| **SPR-FR-1** | Provide pixel-level drawing tools: Brush, Eraser, Line, Rectangle, Filled Rect, Circle, Bucket-Fill, Color-Picker. |
| **SPR-FR-2** | Support unlimited **layers** with reorder, visibility toggle, lock, and per-layer opacity. |
| **SPR-FR-3** | Support **animation timelines** up to 256 frames per animation, with per-frame duration (ms). |
| **SPR-FR-4** | Implement **onion-skin** display of ±N frames with adjustable opacity & tint. |
| **SPR-FR-5** | Offer **palette management**: 256-color indexed palette, drag-drop reorder, import `.ase` palette. |
| **SPR-FR-6** | Generate **palette-swap variants** (≥3 at once) and preview them live. |
| **SPR-FR-7** | Export to: (a) sprite-sheet `.png`, (b) `SpriteFrames.tres`, (c) optional animated `.gif`. |
| **SPR-FR-8** | Write export metadata into ProjectStore and trigger Godot sync addon. |
| **SPR-FR-9** | Provide global **Undo/Redo** stack (≥100 steps) and **autosave** every 60 s. |
| **SPR-FR-10** | Hotkeys: `B` Brush, `E` Eraser, `M` Marquee, `G` Bucket, `I` Picker, `O` Onion Toggle, `Z` Zoom tool, `Space` Pan, `Ctrl-Z/Y` Undo/Redo, `Ctrl-Shift-E` Export, `R` Random Generator. |
| **SPR-FR-11** | **Random Sprite Generator**: Create procedural sprites with configurable parameters (head type, body type, skin color, accessories). Allow full randomization or selective component randomization. |

---

# 3  Non-Functional Requirements

* **Performance** – 60 fps canvas redraw at 400 % zoom on a 128×128 sprite; CPU ≤ 30 % on 2023 mid-tier laptop.  
* **Usability** – Dark theme, WCAG AA contrast, tooltips on hover, resizable panels.  
* **Accessibility** – Full keyboard navigation; configurable high-contrast palette.  
* **Security** – No remote code execution; palette files parsed with safe libraries.  
* **Internationalization** – UI strings externalized (`i18n` JSON).  
* **Reliability** – Crash recovery must restore last autosave ≤ 60 s old.  
* **File Size** – Exported `.png` ≤ 1 MB for a 256 × 256 sheet with 256 colors (lossless indexed).  

---

# 4  UI / UX Layout

| Pane | Contents & Interactions | Hotkeys |
|------|------------------------|---------|
| **Top Menu** | File / Edit / View / Animation / Tools / Help | `Alt` + mnemonic |
| **Toolbar** | Brush, Eraser, Picker, Marquee, Move, Bucket, MirrorToggle, OnionToggle, Zoom %, Snap-to-Grid | `1-9` brush sizes; `O` toggle onion |
| **Left Sidebar – Layers** | Thumbnail list, eye icon, lock icon, opacity slider, “+ Add Layer”, “Merge Down” | `L` focus list |
| **Center Canvas** | Checkerboard grid, pixel cursor, live onion ghosts | `Space` + drag pan; scroll zoom |
| **Bottom Timeline** | Frame thumbnails (drag to reorder), play/stop, FPS dropdown, loop toggle | `,` / `.` previous/next frame |
| **Right Sidebar** | **Palette panel** (8×8 swatches, eyedropper, import .ase)  •  **Frame Variants** (palette-swap list, “New Variant” btn) | `P` palette picker |
| **Status Bar** | Hotkey hints, autosave timer, export progress | — |
| **Export Footer** | Buttons: “PNG Sheet”, “SpriteFrames .tres”, “GIF Preview” | `Ctrl-Shift-E` |

---

# 5  Data Model & Export Formats

### 5.1 Internal JSON Schema (stored in `sprites/<name>.sprite.json`)
```json
{
  "version": 1,
  "canvas": { "w": 128, "h": 128, "pixelSize": 1 },
  "layers": [
    { "id": "layer0", "name": "Ink", "opacity": 1.0, "locked": false,
      "pixels": "RLE-ENCODED-STRING" }
  ],
  "animations": {
    "walk": {
      "frames": [
        { "layerRefs": ["layer0"], "duration": 100 },
        { "layerRefs": ["layer0"], "duration": 100 }
      ]
    }
  },
  "palette": ["#000000", "#FFFFFF", "#4caf50" /* … 256 max */],
  "variants": {
    "blue": { "paletteMap": { "#4caf50": "#2196f3" } }
  }
}
````

### 5.1.1 Random Sprite Generator Components

The random sprite generator uses predefined component templates to create procedural sprites:

```json
{
  "generatorComponents": {
    "heads": [
      { "id": "human_male", "layers": ["head_outline", "eyes", "hair"], "palette": ["skin", "eye", "hair"] },
      { "id": "human_female", "layers": ["head_outline", "eyes", "hair_long"], "palette": ["skin", "eye", "hair"] },
      { "id": "elf", "layers": ["head_outline", "pointed_ears", "eyes", "hair"], "palette": ["skin", "eye", "hair"] }
    ],
    "bodies": [
      { "id": "warrior", "layers": ["torso", "armor_chest"], "palette": ["skin", "armor"] },
      { "id": "mage", "layers": ["torso", "robe"], "palette": ["skin", "fabric"] },
      { "id": "rogue", "layers": ["torso", "leather_vest"], "palette": ["skin", "leather"] }
    ],
    "accessories": [
      { "id": "sword", "layers": ["weapon_sword"], "palette": ["metal", "handle"] },
      { "id": "staff", "layers": ["weapon_staff"], "palette": ["wood", "crystal"] },
      { "id": "bow", "layers": ["weapon_bow"], "palette": ["wood", "string"] }
    ],
    "colorSchemes": {
      "skin": ["#f4c2a1", "#d4a574", "#8b5a3c", "#4a2c17"],
      "hair": ["#2c1b18", "#8b4513", "#daa520", "#ff4500", "#4b0082"],
      "eye": ["#1e90ff", "#228b22", "#8b4513", "#4b0082", "#000000"]
    }
  }
}
```

### 5.2 Export Table

| Output                  | Path                            | Details                                    |
| ----------------------- | ------------------------------- | ------------------------------------------ |
| **Sprite-sheet PNG**    | `/sprites/<name>.png`           | Grid or packed, indexed-color (≤256).      |
| **SpriteFrames .tres**  | `/sprites/<name>.tres`          | Lists frame rects, animation names, pivot. |
| **Animated GIF (opt.)** | `/previews/<name>.gif`          | 256-color, 1× scale, ≤ 2 MB.               |
| **Variant PNGs**        | `/sprites/<name>_<variant>.png` | Palette-swapped sheets.                    |

---

# 6  Integration Points

* **ProjectStore** – Sprite JSON + exports saved under `sprites/`; Git-tracked.
* **Exporter Module** – Consumes internal JSON; emits `.png / .tres / .gif`.
* **Godot Sync Addon** – Watches `sprites/`; on change:

  1. Imports PNG to `ImageTexture`.
  2. Loads `.tres` to `SpriteFrames` resource.
  3. Updates any in-scene AnimatedSprite2D nodes.

---

# 7  Error-Handling & Autosave

* **Validation** – On export, verify: canvas ≤ 512 × 512, palette ≤ 256 colors, at least one animation frame.
* **Autosave** – Every 60 s write `.autosave/<name>.sprite.json`; keep last 10.
* **Recovery** – On launch after crash flag, prompt to restore latest autosave.
* **User Alerts** – Non-blocking toast for warnings; modal dialog for fatal export errors.
* **Logging** – Errors appended to `logs/sprite_creator.log`.

---

# 8  Testing & Validation Plan

| Level                | Tooling                    | Coverage                                             |
| -------------------- | -------------------------- | ---------------------------------------------------- |
| **Unit**             | Vitest                     | Layer ops, palette swap, JSON schema validation.     |
| **Component**        | React Testing Library      | Canvas render, layer list, palette panel.            |
| **Integration**      | Playwright                 | Draw pixel → undo → redo; add frame → export PNG.    |
| **Performance**      | Playwright perf probe      | 60 fps on 128 × 128 canvas @ 400 % zoom; ≤ 30 % CPU. |
| **Export Integrity** | Headless Godot import test | Load exported `.tres` → assert frame count & size.   |

---

# 9  Glossary

* **SpriteFrames .tres** – Godot resource storing per-animation frame rectangles & timing.
* **Onion-Skin** – Semi-transparent overlay of adjacent frames for animation staging.
* **Palette Swap** – Re-mapping original palette colors to produce variants (e.g., enemy recolors).
* **Layer** – Stackable bitmap plane within a sprite; each frame stores refs to layer bitmaps.
* **Pixel Cursor** – Canvas cursor snapping to pixel grid for precise editing.
