import { describe, test, expect } from 'vitest';
import Ajv from 'ajv';
import spriteSchema from '../schemas/sprite.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(spriteSchema);

describe('Sprite JSON Schema Validation', () => {
  test('should validate a valid sprite JSON', () => {
    const validSprite = {
      version: 1,
      canvas: { w: 128, h: 128, pixelSize: 1 },
      layers: [
        {
          id: 'layer0',
          name: 'Ink',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE-ENCODED-STRING',
        },
      ],
      animations: {
        walk: {
          frames: [
            { layerRefs: ['layer0'], duration: 100 },
            { layerRefs: ['layer0'], duration: 100 },
          ],
        },
      },
      palette: ['#000000', '#FFFFFF', '#4caf50'],
      variants: {
        blue: { paletteMap: { '#4caf50': '#2196f3' } },
      },
    };

    const isValid = validate(validSprite);
    if (!isValid) {
      console.log('Validation errors:', validate.errors);
    }
    expect(isValid).toBe(true);
  });

  test('should validate sprite with random generator components', () => {
    const spriteWithGenerator = {
      version: 1,
      canvas: { w: 32, h: 32, pixelSize: 1 },
      layers: [
        {
          id: 'layer0',
          name: 'Head',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE1',
        },
      ],
      animations: {
        idle: {
          frames: [{ layerRefs: ['layer0'], duration: 500 }],
        },
      },
      palette: ['#f4c2a1', '#2c1b18', '#1e90ff'],
      variants: {},
      generatorComponents: {
        heads: [
          {
            id: 'human_male',
            layers: ['head_outline', 'eyes', 'hair'],
            palette: ['skin', 'eye', 'hair'],
          },
        ],
        bodies: [
          {
            id: 'warrior',
            layers: ['torso', 'armor_chest'],
            palette: ['skin', 'armor'],
          },
        ],
        accessories: [
          {
            id: 'sword',
            layers: ['weapon_sword'],
            palette: ['metal', 'handle'],
          },
        ],
        colorSchemes: {
          skin: ['#f4c2a1', '#d4a574', '#8b5a3c', '#4a2c17'],
          hair: ['#2c1b18', '#8b4513', '#daa520', '#ff4500'],
        },
      },
    };

    const isValid = validate(spriteWithGenerator);
    if (!isValid) {
      console.log('Validation errors:', validate.errors);
    }
    expect(isValid).toBe(true);
  });

  test('should reject sprite with invalid canvas size', () => {
    const invalidSprite = {
      version: 1,
      canvas: { w: 1000, h: 128, pixelSize: 1 }, // exceeds 512 max
      layers: [
        {
          id: 'layer0',
          name: 'Ink',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE',
        },
      ],
      animations: {
        walk: { frames: [{ layerRefs: ['layer0'], duration: 100 }] },
      },
      palette: ['#000000'],
      variants: {},
    };

    const isValid = validate(invalidSprite);
    expect(isValid).toBe(false);
    expect(validate.errors).toBeDefined();
  });

  test('should reject sprite with too many palette colors', () => {
    const invalidSprite = {
      version: 1,
      canvas: { w: 128, h: 128, pixelSize: 1 },
      layers: [
        {
          id: 'layer0',
          name: 'Ink',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE',
        },
      ],
      animations: {
        walk: { frames: [{ layerRefs: ['layer0'], duration: 100 }] },
      },
      palette: Array(257).fill('#000000'), // exceeds 256 max
      variants: {},
    };

    const isValid = validate(invalidSprite);
    expect(isValid).toBe(false);
    expect(validate.errors).toBeDefined();
  });

  test('should reject sprite with invalid layer ID format', () => {
    const invalidSprite = {
      version: 1,
      canvas: { w: 128, h: 128, pixelSize: 1 },
      layers: [
        {
          id: 'invalid_id',
          name: 'Ink',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE',
        },
      ],
      animations: {
        walk: { frames: [{ layerRefs: ['invalid_id'], duration: 100 }] },
      },
      palette: ['#000000'],
      variants: {},
    };

    const isValid = validate(invalidSprite);
    expect(isValid).toBe(false);
    expect(validate.errors).toBeDefined();
  });

  test('should reject sprite with too many animation frames', () => {
    const invalidSprite = {
      version: 1,
      canvas: { w: 128, h: 128, pixelSize: 1 },
      layers: [
        {
          id: 'layer0',
          name: 'Ink',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE',
        },
      ],
      animations: {
        walk: {
          frames: Array(257).fill({ layerRefs: ['layer0'], duration: 100 }), // exceeds 256 max
        },
      },
      palette: ['#000000'],
      variants: {},
    };

    const isValid = validate(invalidSprite);
    expect(isValid).toBe(false);
    expect(validate.errors).toBeDefined();
  });

  test('should reject sprite with invalid hex color format', () => {
    const invalidSprite = {
      version: 1,
      canvas: { w: 128, h: 128, pixelSize: 1 },
      layers: [
        {
          id: 'layer0',
          name: 'Ink',
          opacity: 1.0,
          locked: false,
          pixels: 'RLE',
        },
      ],
      animations: {
        walk: { frames: [{ layerRefs: ['layer0'], duration: 100 }] },
      },
      palette: ['#GGGGGG'], // invalid hex
      variants: {},
    };

    const isValid = validate(invalidSprite);
    expect(isValid).toBe(false);
    expect(validate.errors).toBeDefined();
  });
});
