import { describe, it, expect } from 'vitest';
import { Palette } from '../src/model/Palette.js';

describe('Palette', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty palette', () => {
      const palette = new Palette();
      expect(palette.getColors()).toEqual([]);
      expect(palette.size()).toBe(0);
    });

    it('should create a palette with initial colors', () => {
      const colors = ['#000000', '#ffffff', '#ff0000'];
      const palette = new Palette(colors);
      expect(palette.getColors()).toEqual(colors);
      expect(palette.size()).toBe(3);
    });

    it('should enforce maximum 256 colors', () => {
      const colors = Array.from(
        { length: 257 },
        (_, i) => `#${i.toString(16).padStart(6, '0')}`,
      );
      expect(() => new Palette(colors)).toThrow(
        'Palette cannot contain more than 256 colors',
      );
    });

    it('should validate hex color format', () => {
      expect(() => new Palette(['invalid-color'])).toThrow(
        'Invalid hex color format: invalid-color',
      );
      expect(() => new Palette(['#gg0000'])).toThrow(
        'Invalid hex color format: #gg0000',
      );
      expect(() => new Palette(['#12345'])).toThrow(
        'Invalid hex color format: #12345',
      );
    });
  });

  describe('color management', () => {
    it('should add colors up to 256 limit', () => {
      const palette = new Palette();

      // Add 256 colors
      for (let i = 0; i < 256; i++) {
        const color = `#${i.toString(16).padStart(6, '0')}`;
        palette.addColor(color);
      }

      expect(palette.size()).toBe(256);

      // Adding 257th color should throw
      expect(() => palette.addColor('#ffffff')).toThrow(
        'Cannot add color: palette already contains 256 colors',
      );
    });

    it('should remove colors', () => {
      const palette = new Palette(['#000000', '#ffffff', '#ff0000']);
      palette.removeColor('#ffffff');
      expect(palette.getColors()).toEqual(['#000000', '#ff0000']);
      expect(palette.size()).toBe(2);
    });

    it('should find color index', () => {
      const palette = new Palette(['#000000', '#ffffff', '#ff0000']);
      expect(palette.indexOf('#ffffff')).toBe(1);
      expect(palette.indexOf('#00ff00')).toBe(-1);
    });

    it('should check if color exists', () => {
      const palette = new Palette(['#000000', '#ffffff', '#ff0000']);
      expect(palette.hasColor('#ffffff')).toBe(true);
      expect(palette.hasColor('#00ff00')).toBe(false);
    });
  });

  describe('palette swapping', () => {
    it('should create palette swap mapping', () => {
      const originalPalette = new Palette(['#000000', '#ffffff', '#ff0000']);
      const targetPalette = new Palette(['#333333', '#cccccc', '#00ff00']);

      const swapMap = Palette.createSwapMap(originalPalette, targetPalette);

      expect(swapMap).toEqual({
        '#000000': '#333333',
        '#ffffff': '#cccccc',
        '#ff0000': '#00ff00',
      });
    });

    it('should handle mismatched palette sizes in swap mapping', () => {
      const originalPalette = new Palette(['#000000', '#ffffff']);
      const targetPalette = new Palette(['#333333']);

      const swapMap = Palette.createSwapMap(originalPalette, targetPalette);

      expect(swapMap).toEqual({
        '#000000': '#333333',
        '#ffffff': '#333333', // Last color is repeated
      });
    });

    it('should apply palette swap to bitmap data', () => {
      const palette = new Palette(['#000000', '#ffffff', '#ff0000']);
      const bitmapData = ['#000000', '#ffffff', '#ff0000', '#ffffff'];
      const swapMap = {
        '#000000': '#333333',
        '#ffffff': '#cccccc',
        '#ff0000': '#00ff00',
      };

      const swappedData = palette.applySwap(bitmapData, swapMap);

      expect(swappedData).toEqual(['#333333', '#cccccc', '#00ff00', '#cccccc']);
    });
  });

  describe('ASE palette import', () => {
    it('should parse ASE palette data', async () => {
      // Mock ASE file data (simplified)
      const mockAseBuffer = new Uint8Array([
        0x41,
        0x53,
        0x45,
        0x46, // ASEF signature
        0x00,
        0x01,
        0x00,
        0x00, // Version
        0x00,
        0x00,
        0x00,
        0x03, // Number of blocks (3 colors)
        // Color block 1
        0x00,
        0x01, // Block type (color)
        0x00,
        0x00,
        0x00,
        0x20, // Block length
        0x00,
        0x08, // Name length
        0x00,
        0x43,
        0x00,
        0x6f,
        0x00,
        0x6c,
        0x00,
        0x6f,
        0x00,
        0x72,
        0x00,
        0x31,
        0x00,
        0x00, // "Color1"
        0x52,
        0x47,
        0x42,
        0x20, // RGB colorspace
        0x00,
        0x00,
        0x00,
        0x00, // R: 0.0
        0x00,
        0x00,
        0x00,
        0x00, // G: 0.0
        0x00,
        0x00,
        0x00,
        0x00, // B: 0.0
        0x00,
        0x02, // Color type
      ]);

      const palette = await Palette.fromASE(mockAseBuffer.buffer);
      expect(palette).toBeInstanceOf(Palette);
      // Note: This is a simplified test - real ASE parsing would be more complex
    });

    it('should handle invalid ASE data', async () => {
      const invalidBuffer = new ArrayBuffer(10);
      await expect(Palette.fromASE(invalidBuffer)).rejects.toThrow(
        'Invalid ASE file format',
      );
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const palette = new Palette(['#000000', '#ffffff', '#ff0000']);
      const json = palette.toJSON();

      expect(json).toEqual({
        colors: ['#000000', '#ffffff', '#ff0000'],
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        colors: ['#000000', '#ffffff', '#ff0000'],
      };

      const palette = Palette.fromJSON(json);
      expect(palette.getColors()).toEqual(['#000000', '#ffffff', '#ff0000']);
    });
  });
});
