# Godot Integration Specification

## 🎯 Primary Mission
**Zero-friction sprite creation workflow for Godot game development**

The Sprite Creator's core purpose is to eliminate manual asset pipeline steps by providing direct, automated export to Godot-compatible formats with real-time project synchronization.

---

## 🔄 Export/Import Pipeline

### Core Export Formats

#### 1. **SpriteFrames .tres Resource** (Primary Target)
```gdscript
[gd_resource type="SpriteFrames" format=3]

[resource]
animations = [{
    "frames": [{
        "duration": 0.1,
        "texture": preload("res://sprites/character_walk.png")
    }, {
        "duration": 0.1, 
        "texture": preload("res://sprites/character_walk.png")
    }],
    "loop": true,
    "name": "walk",
    "speed": 10.0
}]
```

**Mapping from Animation Model:**
- `Animation.getName()` → `animations[].name`
- `AnimationFrame.getDuration()` → `animations[].frames[].duration` (ms → seconds)
- `Animation.getFrames()` → `animations[].frames[]` with texture references
- Layer composition → Individual texture frames in sprite sheet

#### 2. **PNG Sprite Sheet** (Texture Source)
```
Format: Indexed PNG (1-256 colors)
Layout: Grid-based with consistent frame dimensions
Naming: <sprite_name>.png
Frame Extraction: Godot automatically slices based on .tres frame rectangles
```

#### 3. **Animation Metadata** (Frame Positioning)
```json
{
  "sprite_name": "character_walk",
  "sheet_dimensions": { "w": 512, "h": 256 },
  "frame_size": { "w": 64, "h": 64 },
  "animations": {
    "walk": {
      "frames": [
        { "x": 0, "y": 0, "w": 64, "h": 64, "duration_ms": 100 },
        { "x": 64, "y": 0, "w": 64, "h": 64, "duration_ms": 100 }
      ]
    }
  }
}
```

---

## 🔗 Data Model → Godot Mapping

### Animation Timeline → SpriteFrames
| Sprite Creator | Godot SpriteFrames | Notes |
|----------------|-------------------|-------|
| `Animation.name` | `animation.name` | Direct mapping |
| `AnimationFrame.duration` (ms) | `frame.duration` (seconds) | Convert ms → s |
| `AnimationFrame.layerRefs` | Composed texture frame | Render layers to single frame |
| `Animation.frames[]` | `animation.frames[]` | 1:1 frame correspondence |
| Loop behavior | `animation.loop = true` | Always enable looping |

### Palette → Godot ColorPalette
| Sprite Creator | Godot | Notes |
|----------------|-------|-------|
| `Palette.colors[]` | PNG indexed colors | Preserve color indices |
| `Variant.paletteMap` | Additional PNG variants | Generate `<name>_<variant>.png` |
| Max 256 colors | PNG palette limit | Natural compatibility |

### Layer System → Texture Composition
| Sprite Creator | Godot | Notes |
|----------------|-------|-------|
| `Layer.pixels` (RLE) | Rendered bitmap | Decompress → composite → PNG |
| `Layer.opacity` | Alpha blending | Apply during composition |
| Multiple layers | Single texture | Flatten for each frame |

---

## 🛠 Export Implementation Strategy

### Phase 1: Core Exporters (Plans 21-23)

#### PNG Sheet Exporter (`src/export/pngExporter.ts`)
```typescript
interface PngExportOptions {
  spriteModel: SpriteModel;
  animation: string;
  variant?: string;
  outputPath: string;
}

export class PngExporter {
  async exportSpriteSheet(options: PngExportOptions): Promise<Buffer>
  async exportAllVariants(spriteModel: SpriteModel): Promise<Map<string, Buffer>>
}
```

#### SpriteFrames Exporter (`src/export/tresExporter.ts`)
```typescript
interface TresExportOptions {
  spriteModel: SpriteModel;
  texturePaths: Map<string, string>; // animation → PNG path
  outputPath: string;
}

export class TresExporter {
  async exportSpriteFrames(options: TresExportOptions): Promise<string>
  private convertDurationToSeconds(ms: number): number
  private generateFrameReferences(animation: Animation, texturePath: string): string
}
```

#### Export Workflow (`src/export/godotWorkflow.ts`)
```typescript
export class GodotExportWorkflow {
  async exportForGodot(spriteModel: SpriteModel, projectPath: string): Promise<{
    pngFiles: string[];
    tresFile: string;
    variantFiles: string[];
  }>
}
```

### Phase 2: Project Integration (Plan 24)

#### ProjectStore Integration
```typescript
interface GodotProjectConfig {
  projectPath: string;
  spritesDirectory: string; // "res://sprites/"
  autoSync: boolean;
  watchMode: boolean;
}

export class ProjectStore {
  async saveSprite(sprite: SpriteModel): Promise<void>
  async exportToGodot(spriteName: string, config: GodotProjectConfig): Promise<void>
  async triggerGodotSync(files: string[]): Promise<void>
}
```

---

## 🔄 Godot Sync Addon

### Addon Structure
```
addons/
  sprite_creator_sync/
    plugin.cfg
    plugin.gd
    sync_manager.gd
    file_watcher.gd
```

### File Watcher Implementation
```gdscript
# file_watcher.gd
extends Node

signal sprite_files_changed(files: Array[String])

func _init():
    var watcher = FileSystemWatcher.new()
    watcher.watch_directory("res://sprites/")
    watcher.file_changed.connect(_on_sprite_file_changed)

func _on_sprite_file_changed(path: String):
    if path.ends_with(".tres") or path.ends_with(".png"):
        emit_signal("sprite_files_changed", [path])
```

### Auto-Import Logic
```gdscript
# sync_manager.gd
extends EditorPlugin

func _on_sprite_files_changed(files: Array[String]):
    for file_path in files:
        if file_path.ends_with(".tres"):
            _update_spriteframes_resource(file_path)
        elif file_path.ends_with(".png"):
            _reimport_texture(file_path)
    
    _update_animated_sprite_nodes()

func _update_animated_sprite_nodes():
    # Find all AnimatedSprite2D nodes in open scenes
    # Update their SpriteFrames resources if they reference updated files
    pass
```

---

## 🎯 Godot-First Design Principles

### 1. **Frame Duration Precision**
- Store durations in milliseconds internally
- Convert to Godot's float seconds during export
- Maintain precision: `duration_seconds = duration_ms / 1000.0`

### 2. **Texture Reference Consistency**
- Generate predictable file names: `<sprite>_<animation>.png`
- Use relative paths in .tres files: `preload("res://sprites/...")`
- Support texture atlasing for performance

### 3. **Animation Naming Compatibility**
- Enforce Godot-compatible naming: `^[a-zA-Z][a-zA-Z0-9_]*$`
- Prevent reserved keywords: "new", "default", etc.
- Case-sensitive mapping preservation

### 4. **Palette Variant Workflow**
- Generate separate PNG files for each variant
- Create corresponding .tres files with variant names
- Enable runtime palette swapping in Godot scripts

### 5. **Layer Composition Strategy**
- Flatten layers per frame during export
- Preserve layer order (bottom to top)
- Apply opacity and blend modes during composition
- Maintain transparent backgrounds

---

## 🔄 Real-Time Sync Workflow

### Development Flow
1. **Create/Edit Sprite** in Sprite Creator
2. **Auto-Save** triggers every 60 seconds
3. **Export on Save** generates PNG + .tres files
4. **File Watcher** detects changes in Godot project
5. **Auto-Import** updates resources and refreshes scenes
6. **Live Preview** in Godot editor shows changes immediately

### File Structure in Godot Project
```
res://
  sprites/
    characters/
      player.png
      player.tres
      player_red.png     # Palette variant
      player_blue.png    # Palette variant
    enemies/
      goblin.png
      goblin.tres
  scenes/
    player.tscn         # Uses player.tres in AnimatedSprite2D
```

---

## 🧪 Testing & Validation

### Export Validation Checklist
- [ ] PNG files load correctly in Godot
- [ ] .tres files import without errors
- [ ] Frame durations match expected timing
- [ ] Animation loops work properly
- [ ] Palette variants display correctly
- [ ] File paths resolve in Godot project
- [ ] AnimatedSprite2D nodes update automatically

### Compatibility Testing
- [ ] Godot 4.2+ compatibility
- [ ] Large sprite sheets (512x512+)
- [ ] Maximum frame count (256 frames)
- [ ] Complex animations (multiple layers)
- [ ] Palette swap performance
- [ ] File system sync reliability

---

## 📋 Implementation Roadmap

### ✅ Completed Foundation (Phase 2 & Early Phase 3)

- **✅ Plan 8**: Undo/Redo Service - Command pattern with 100+ operation support
- **✅ Plan 9**: Autosave Service - 60s snapshots with recovery functionality
- **✅ Plan 10**: Canvas Renderer Skeleton - Checkerboard grid with react-konva integration
- **✅ Plan 11**: Draw Pixel Action - Mouse input to LayerBitmap integration with real-time rendering
- **✅ Plan 12**: Onion-Skin Overlay - Ghost frame preview with configurable opacity, multi-frame navigation, and interactive demo

### 🚧 Current Focus (Phase 3: Canvas & Editing Tools)

- **Plan 13**: Mirror Drawing Toggle - Symmetric pixel placement
- **Plan 14**: Layers Panel - Layer management UI
- **Plan 15**: Palette Panel - Color selection and ASE import
- **Plan 16**: Random Sprite Generator - Procedural sprite creation

### 🎯 Next Priority (Phase 5: Godot Exporters)

- **Plan 21**: PNG Sheet Exporter → Direct Godot texture compatibility
- **Plan 22**: SpriteFrames .tres Exporter → Native Godot animation resource
- **Plan 23**: Export Workflow Integration → ProjectStore sync
- **Plan 24**: Godot Sync Addon → Real-time project updates

### Success Criteria

✅ **Zero Manual Steps**: Click export → ready in Godot  
✅ **Real-Time Sync**: Changes appear immediately in Godot editor  
✅ **Format Fidelity**: No loss of timing, colors, or animation data  
✅ **Variant Support**: Palette swaps work seamlessly  
✅ **Performance**: Large sprites export quickly (<5 seconds)

---

## 💡 Godot Integration Benefits

1. **Immediate Workflow**: No external tools or manual import steps
2. **Live Iteration**: See changes in game context instantly  
3. **Asset Consistency**: Guaranteed compatible formats
4. **Team Collaboration**: Version-controlled sprite sources
5. **Variant Management**: Easy character recoloring workflow
6. **Performance Optimization**: Optimized texture atlasing for Godot

This specification ensures every feature we build serves the primary mission: **seamless Godot game development integration**.
