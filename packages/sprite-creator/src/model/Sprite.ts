import { Type, Static } from '@sinclair/typebox';
import Ajv from 'ajv';

// Canvas configuration schema
const CanvasSchema = Type.Object({
  w: Type.Integer({ minimum: 1, maximum: 512 }),
  h: Type.Integer({ minimum: 1, maximum: 512 }),
  pixelSize: Type.Integer({ minimum: 1 }),
});

// Layer schema
const LayerSchema = Type.Object({
  id: Type.String({ pattern: '^layer[0-9]+$' }),
  name: Type.String({ minLength: 1 }),
  opacity: Type.Number({ minimum: 0, maximum: 1 }),
  locked: Type.Boolean(),
  pixels: Type.String(),
});

// Animation frame schema
const AnimationFrameSchema = Type.Object({
  layerRefs: Type.Array(Type.String({ pattern: '^layer[0-9]+$' })),
  duration: Type.Integer({ minimum: 1 }),
});

// Animation schema
const AnimationSchema = Type.Object({
  frames: Type.Array(AnimationFrameSchema, { minItems: 1, maxItems: 256 }),
});

// Variant schema for palette swapping
const VariantSchema = Type.Object({
  paletteMap: Type.Record(
    Type.String({ pattern: '^#[0-9a-fA-F]{6}$' }),
    Type.String({ pattern: '^#[0-9a-fA-F]{6}$' }),
  ),
});

// Generator component schema for random sprite generation
const GeneratorComponentSchema = Type.Object({
  id: Type.String(),
  layers: Type.Array(Type.String()),
  palette: Type.Array(Type.String()),
});

// Generator components schema
const GeneratorComponentsSchema = Type.Optional(
  Type.Object({
    heads: Type.Optional(Type.Array(GeneratorComponentSchema)),
    bodies: Type.Optional(Type.Array(GeneratorComponentSchema)),
    accessories: Type.Optional(Type.Array(GeneratorComponentSchema)),
    colorSchemes: Type.Optional(
      Type.Record(
        Type.String({ pattern: '^[a-zA-Z][a-zA-Z0-9_]*$' }),
        Type.Array(Type.String({ pattern: '^#[0-9a-fA-F]{6}$' })),
      ),
    ),
  }),
);

// Main Sprite schema
export const SpriteSchema = Type.Object({
  version: Type.Integer({ minimum: 1 }),
  canvas: CanvasSchema,
  layers: Type.Array(LayerSchema, { minItems: 1 }),
  animations: Type.Record(
    Type.String({ pattern: '^[a-zA-Z][a-zA-Z0-9_]*$' }),
    AnimationSchema,
  ),
  palette: Type.Array(Type.String({ pattern: '^#[0-9a-fA-F]{6}$' }), {
    maxItems: 256,
  }),
  variants: Type.Optional(
    Type.Record(
      Type.String({ pattern: '^[a-zA-Z][a-zA-Z0-9_]*$' }),
      VariantSchema,
    ),
  ),
  generatorComponents: GeneratorComponentsSchema,
});

// Type definitions
export type Canvas = Static<typeof CanvasSchema>;
export type Layer = Static<typeof LayerSchema>;
export type AnimationFrame = Static<typeof AnimationFrameSchema>;
export type Animation = Static<typeof AnimationSchema>;
export type Variant = Static<typeof VariantSchema>;
export type GeneratorComponent = Static<typeof GeneratorComponentSchema>;
export type GeneratorComponents = Static<typeof GeneratorComponentsSchema>;
export type SpriteData = Static<typeof SpriteSchema>;

// Validator instance
const ajv = new Ajv();
const validateSprite = ajv.compile(SpriteSchema);

/**
 * Sprite data model class with validation capabilities
 */
export class SpriteModel {
  constructor(private data: SpriteData) {
    if (!this.validate()) {
      throw new Error(
        `Invalid sprite data: ${JSON.stringify(validateSprite.errors)}`,
      );
    }
  }

  /**
   * Validates the sprite data against the schema
   */
  validate(): boolean {
    return validateSprite(this.data);
  }

  /**
   * Gets validation errors if any
   */
  getValidationErrors() {
    return validateSprite.errors;
  }

  /**
   * Gets the sprite data
   */
  getData(): SpriteData {
    return this.data;
  }

  /**
   * Gets the canvas configuration
   */
  getCanvas(): Canvas {
    return this.data.canvas;
  }

  /**
   * Gets all layers
   */
  getLayers(): Layer[] {
    return this.data.layers;
  }

  /**
   * Gets a specific layer by ID
   */
  getLayer(id: string): Layer | undefined {
    return this.data.layers.find((layer) => layer.id === id);
  }

  /**
   * Gets all animations
   */
  getAnimations(): Record<string, Animation> {
    return this.data.animations;
  }

  /**
   * Gets a specific animation by name
   */
  getAnimation(name: string): Animation | undefined {
    return this.data.animations[name];
  }

  /**
   * Gets the color palette
   */
  getPalette(): string[] {
    return this.data.palette;
  }

  /**
   * Gets all variants
   */
  getVariants(): Record<string, Variant> | undefined {
    return this.data.variants;
  }

  /**
   * Gets a specific variant by name
   */
  getVariant(name: string): Variant | undefined {
    return this.data.variants?.[name];
  }

  /**
   * Gets generator components for random sprite generation
   */
  getGeneratorComponents(): GeneratorComponents | undefined {
    return this.data.generatorComponents;
  }

  /**
   * Creates a new sprite with the given data
   */
  static create(data: SpriteData): SpriteModel {
    return new SpriteModel(data);
  }

  /**
   * Creates a sprite from JSON string
   */
  static fromJSON(json: string): SpriteModel {
    const data = JSON.parse(json);
    return new SpriteModel(data);
  }

  /**
   * Converts sprite to JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Creates a deep clone of the sprite
   */
  clone(): SpriteModel {
    return new SpriteModel(JSON.parse(JSON.stringify(this.data)));
  }
}

/**
 * Utility function to validate sprite data without creating a model instance
 */
export function validateSpriteData(data: unknown): data is SpriteData {
  return validateSprite(data);
}

/**
 * Utility function to get validation errors for sprite data
 */
export function getSpriteValidationErrors(data: unknown) {
  validateSprite(data);
  return validateSprite.errors;
}

/**
 * Sprite class for test compatibility and simple usage
 * This provides a constructor-based interface that matches test expectations
 */
export class Sprite {
  private name: string;
  private width: number;
  private height: number;
  private layers: Array<{ id: string; name: string }> = [];

  constructor(name: string, width: number, height: number) {
    this.name = name;
    this.width = width;
    this.height = height;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  addLayer(layerName: string): void {
    const layerId = `layer${this.layers.length}`;
    this.layers.push({ id: layerId, name: layerName });
  }

  getLayers(): Array<{ id: string; name: string }> {
    return [...this.layers];
  }

  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      width: this.width,
      height: this.height,
      layers: this.layers,
    });
  }

  static fromJSON(json: string): Sprite {
    const data = JSON.parse(json);
    const sprite = new Sprite(data.name, data.width, data.height);
    if (data.layers) {
      sprite.layers = [...data.layers];
    }
    return sprite;
  }
}
