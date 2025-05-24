import { describe, it, expect } from 'vitest';
import { LayerBitmap } from '../src/model/LayerBitmap.js';

describe('LayerBitmap', () => {
  describe('RLE encoding/decoding', () => {
    it('should encode and decode simple patterns losslessly', () => {
      const original = ['#000000', '#000000', '#ffffff', '#ffffff', '#ffffff'];
      const encoded = LayerBitmap.encodeRLE(original);
      const decoded = LayerBitmap.decodeRLE(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle single color runs', () => {
      const original = ['#ff0000'];
      const encoded = LayerBitmap.encodeRLE(original);
      const decoded = LayerBitmap.decodeRLE(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle alternating colors efficiently', () => {
      const original = ['#000000', '#ffffff', '#000000', '#ffffff'];
      const encoded = LayerBitmap.encodeRLE(original);
      const decoded = LayerBitmap.decodeRLE(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle a 32x32 layer bitmap losslessly', () => {
      // Create a 32x32 bitmap with some patterns
      const width = 32;
      const height = 32;
      const original: string[] = [];

      // Fill with patterns to test compression
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (y < 10) {
            original.push('#000000'); // Black top
          } else if (y < 20) {
            original.push('#ffffff'); // White middle
          } else {
            original.push('#ff0000'); // Red bottom
          }
        }
      }

      const encoded = LayerBitmap.encodeRLE(original);
      const decoded = LayerBitmap.decodeRLE(encoded);

      expect(decoded).toEqual(original);
      expect(decoded.length).toBe(width * height);
    });

    it('should compress repeated colors effectively', () => {
      const original = Array(100).fill('#000000'); // 100 black pixels
      const encoded = LayerBitmap.encodeRLE(original);

      // Encoded string should be much shorter than original
      expect(encoded.length).toBeLessThan(original.join('').length);

      const decoded = LayerBitmap.decodeRLE(encoded);
      expect(decoded).toEqual(original);
    });

    it('should handle empty bitmap', () => {
      const original: string[] = [];
      const encoded = LayerBitmap.encodeRLE(original);
      const decoded = LayerBitmap.decodeRLE(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle complex patterns with mixed runs', () => {
      const original = [
        // Pattern with different run lengths
        '#000000',
        '#000000',
        '#000000', // 3 black
        '#ffffff', // 1 white
        '#ff0000',
        '#ff0000',
        '#ff0000',
        '#ff0000',
        '#ff0000', // 5 red
        '#00ff00',
        '#00ff00', // 2 green
        '#0000ff', // 1 blue
      ];

      const encoded = LayerBitmap.encodeRLE(original);
      const decoded = LayerBitmap.decodeRLE(encoded);

      expect(decoded).toEqual(original);
    });
  });

  describe('validation', () => {
    it('should validate hex color format in bitmap data', () => {
      const invalidData = ['#000000', 'invalid-color', '#ffffff'];

      expect(() => LayerBitmap.encodeRLE(invalidData)).toThrow(
        'Invalid hex color format: invalid-color',
      );
    });

    it('should handle invalid RLE encoded string', () => {
      const invalidEncoded = 'invalid-rle-data';

      expect(() => LayerBitmap.decodeRLE(invalidEncoded)).toThrow(
        'Invalid RLE encoded data',
      );
    });
  });

  describe('bitmap operations', () => {
    it('should create LayerBitmap instance with width and height', () => {
      const width = 16;
      const height = 16;
      const fillColor = '#000000';

      const bitmap = new LayerBitmap(width, height, fillColor);

      expect(bitmap.getWidth()).toBe(width);
      expect(bitmap.getHeight()).toBe(height);
      expect(bitmap.getPixelCount()).toBe(width * height);
    });

    it('should set and get individual pixels', () => {
      const bitmap = new LayerBitmap(4, 4, '#000000');

      bitmap.setPixel(2, 1, '#ff0000');
      expect(bitmap.getPixel(2, 1)).toBe('#ff0000');

      // Other pixels should remain unchanged
      expect(bitmap.getPixel(0, 0)).toBe('#000000');
      expect(bitmap.getPixel(3, 3)).toBe('#000000');
    });

    it('should validate pixel coordinates', () => {
      const bitmap = new LayerBitmap(4, 4, '#000000');

      expect(() => bitmap.setPixel(-1, 0, '#ff0000')).toThrow(
        'Pixel coordinates out of bounds',
      );
      expect(() => bitmap.setPixel(4, 0, '#ff0000')).toThrow(
        'Pixel coordinates out of bounds',
      );
      expect(() => bitmap.getPixel(0, 4)).toThrow(
        'Pixel coordinates out of bounds',
      );
    });

    it('should export to RLE and import from RLE', () => {
      const width = 8;
      const height = 8;
      const bitmap = new LayerBitmap(width, height, '#000000');

      // Set some pixels
      bitmap.setPixel(2, 2, '#ff0000');
      bitmap.setPixel(3, 2, '#ff0000');
      bitmap.setPixel(2, 3, '#00ff00');

      const encoded = bitmap.toRLE();
      const reconstructed = LayerBitmap.fromRLE(encoded, width, height);

      expect(reconstructed.getPixel(2, 2)).toBe('#ff0000');
      expect(reconstructed.getPixel(3, 2)).toBe('#ff0000');
      expect(reconstructed.getPixel(2, 3)).toBe('#00ff00');
      expect(reconstructed.getPixel(0, 0)).toBe('#000000');
    });
  });
});
