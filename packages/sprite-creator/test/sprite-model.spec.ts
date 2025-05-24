import { describe, test, expect } from 'vitest';
import { SpriteModel, validateSpriteData } from '../src/model/Sprite.js';

describe('Sprite Model', () => {
  const validSpriteData = {
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

  test('should create a valid sprite model', () => {
    const sprite = SpriteModel.create(validSpriteData);
    expect(sprite).toBeDefined();
    expect(sprite.validate()).toBe(true);
  });

  test('should get canvas data', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const canvas = sprite.getCanvas();
    expect(canvas.w).toBe(128);
    expect(canvas.h).toBe(128);
    expect(canvas.pixelSize).toBe(1);
  });

  test('should get layer data', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const layers = sprite.getLayers();
    expect(layers).toHaveLength(1);
    expect(layers[0].id).toBe('layer0');
    expect(layers[0].name).toBe('Ink');

    const layer = sprite.getLayer('layer0');
    expect(layer).toBeDefined();
    expect(layer?.id).toBe('layer0');
  });

  test('should get animation data', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const animations = sprite.getAnimations();
    expect(animations.walk).toBeDefined();
    expect(animations.walk.frames).toHaveLength(2);

    const walkAnimation = sprite.getAnimation('walk');
    expect(walkAnimation).toBeDefined();
    expect(walkAnimation?.frames[0].duration).toBe(100);
  });

  test('should get palette data', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const palette = sprite.getPalette();
    expect(palette).toEqual(['#000000', '#FFFFFF', '#4caf50']);
  });

  test('should get variant data', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const variants = sprite.getVariants();
    expect(variants?.blue).toBeDefined();

    const blueVariant = sprite.getVariant('blue');
    expect(blueVariant?.paletteMap['#4caf50']).toBe('#2196f3');
  });

  test('should throw error for invalid sprite data', () => {
    const invalidData = {
      version: 1,
      canvas: { w: 1000, h: 128, pixelSize: 1 }, // exceeds 512 max
      layers: [],
      animations: {},
      palette: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => SpriteModel.create(invalidData as any)).toThrow();
  });

  test('should validate sprite data', () => {
    expect(validateSpriteData(validSpriteData)).toBe(true);

    const invalidData = { version: 'invalid' };
    expect(validateSpriteData(invalidData)).toBe(false);
  });

  test('should convert to/from JSON', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const json = sprite.toJSON();
    expect(json).toBeDefined();

    const restored = SpriteModel.fromJSON(json);
    expect(restored.getData()).toEqual(validSpriteData);
  });

  test('should clone sprite', () => {
    const sprite = SpriteModel.create(validSpriteData);
    const cloned = sprite.clone();

    expect(cloned.getData()).toEqual(sprite.getData());
    expect(cloned).not.toBe(sprite); // Different instances
  });

  test('should handle sprite with generator components', () => {
    const spriteWithGenerator = {
      ...validSpriteData,
      generatorComponents: {
        heads: [
          {
            id: 'human_male',
            layers: ['head_outline', 'eyes', 'hair'],
            palette: ['skin', 'eye', 'hair'],
          },
        ],
        colorSchemes: {
          skin: ['#f4c2a1', '#d4a574', '#8b5a3c'],
        },
      },
    };

    const sprite = SpriteModel.create(spriteWithGenerator);
    expect(sprite.validate()).toBe(true);

    const components = sprite.getGeneratorComponents();
    expect(components?.heads?.[0].id).toBe('human_male');
    expect(components?.colorSchemes?.skin).toHaveLength(3);
  });
});
