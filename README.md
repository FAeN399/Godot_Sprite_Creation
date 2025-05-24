# Godot Sprite Creator 🎯

> **Zero-friction sprite creation and animation for Godot game developers**

A modern web-based sprite editor designed specifically for seamless Godot integration. Create pixel art sprites, animate them, and export directly to Godot-compatible formats with no manual post-processing required.

## 🎯 Core Value Proposition

**For Godot Developers:**
- **Direct .tres Export** → Import sprites as SpriteFrames resources instantly
- **PNG Sprite Sheets** → Perfect for Godot's AnimationPlayer and Sprite2D
- **Zero Manual Steps** → No external tools or format conversion needed
- **Real-time Sync** → Optional Godot addon for automatic asset updates
- **Godot-Optimized Workflow** → Built around Godot's animation system

## ✨ Features

### 🎨 Sprite Creation
- **Canvas-based pixel art editor** with zoom and grid
- **Multi-layer support** with opacity and visibility controls
- **256-color palettes** with ASE import support
- **Variant system** for palette swaps and theme variations

### 🎬 Animation Timeline
- **Frame-based animation** with custom durations
- **Multiple animation sequences** (idle, walk, attack, etc.)
- **Onion skinning** for smooth animation workflows
- **Loop preview** with real-time playback

### 🔧 Godot Integration
- **SpriteFrames .tres export** for direct Godot import
- **PNG sprite sheet export** with JSON metadata
- **Godot sync addon** (planned) for live asset updates
- **Animation Timeline Model** optimized for Godot's AnimationPlayer

### 🎲 Procedural Generation
- **Component-based generation** (heads, bodies, accessories)
- **Randomization system** for quick prototyping
- **Palette mapping** for consistent art styles

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/godot-sprite-creation.git
cd godot-sprite-creation

# Install dependencies
pnpm install

# Start development server
pnpm --filter sprite-creator dev
```

## 📁 Project Structure

```
├── packages/
│   └── sprite-creator/          # Main web application
│       ├── src/
│       │   ├── model/          # Data models (Animation, Sprite, Palette)
│       │   ├── exporters/      # Godot export functionality
│       │   └── ui/             # React components
│       └── schemas/            # JSON Schema validation
├── GODOT_INTEGRATION.md        # Detailed integration guide
├── GODOT_PRIORITY_CHECKLIST.md # Development priorities
└── spec.md                     # Technical specifications
```

## 🎯 Development Status

### ✅ Foundation Complete
- [x] Data models with JSON serialization
- [x] Canvas rendering system
- [x] Layer management
- [x] Animation timeline
- [x] Palette system with ASE import

### 🔄 Critical Path (Plans 21-24)
- [ ] **Plan 21:** PNG sprite sheet exporter
- [ ] **Plan 22:** SpriteFrames .tres exporter ⭐ **PRIMARY VALUE**
- [ ] **Plan 23:** GIF preview exporter
- [ ] **Plan 24:** Export workflow integration

### 🔮 Future Enhancements
- [ ] Godot sync addon for real-time updates
- [ ] Advanced animation tools (easing, tweening)
- [ ] Collaborative editing features
- [ ] Asset marketplace integration

## 🎮 For Godot Developers

### Typical Workflow
1. **Create** your sprite in the web editor
2. **Animate** using the timeline interface
3. **Export** as SpriteFrames .tres file
4. **Import** directly into your Godot project
5. **Use** immediately with AnimatedSprite2D nodes

### Supported Godot Features
- ✅ SpriteFrames resource format
- ✅ Multiple animation sequences
- ✅ Custom frame durations
- ✅ Loop settings and playback modes
- ✅ Texture filtering and import settings

## 🤝 Contributing

This project prioritizes Godot integration above all else. When contributing:

1. **Godot-first mindset** - Every feature should enhance the Godot workflow
2. **Export compatibility** - Maintain SpriteFrames .tres format compatibility
3. **Zero friction** - Eliminate manual steps for Godot developers
4. **Performance** - Optimize for Godot's asset pipeline

See [GODOT_PRIORITY_CHECKLIST.md](./GODOT_PRIORITY_CHECKLIST.md) for detailed contribution guidelines.

## 📄 License

MIT License - Built with ❤️ for the Godot community

---

**🎯 Remember:** This tool exists to make Godot sprite creation effortless. Every decision should serve that goal.
