/**
 * LayerBitmap represents a bitmap layer with RLE compression support
 * Used for efficient storage of sprite layer data
 */
export class LayerBitmap {
  private pixels: string[];
  private width: number;
  private height: number;

  constructor(width: number, height: number, fillColor = '#000000') {
    this.width = width;
    this.height = height;
    this.pixels = Array(width * height).fill(fillColor);
    this.validateColor(fillColor);
  }

  /**
   * Gets the width of the bitmap
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Gets the height of the bitmap
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Gets the total number of pixels
   */
  getPixelCount(): number {
    return this.width * this.height;
  }

  /**
   * Sets a pixel at the given coordinates
   */
  setPixel(x: number, y: number, color: string): void {
    this.validateCoordinates(x, y);
    this.validateColor(color);
    const index = y * this.width + x;
    this.pixels[index] = color;
  }

  /**
   * Gets a pixel at the given coordinates
   */
  getPixel(x: number, y: number): string {
    this.validateCoordinates(x, y);
    const index = y * this.width + x;
    return this.pixels[index];
  }

  /**
   * Exports the bitmap to RLE encoded string
   */
  toRLE(): string {
    return LayerBitmap.encodeRLE(this.pixels);
  }

  /**
   * Creates a LayerBitmap from RLE encoded string
   */
  static fromRLE(encoded: string, width: number, height: number): LayerBitmap {
    const pixels = LayerBitmap.decodeRLE(encoded);
    if (pixels.length !== width * height) {
      throw new Error(
        `Decoded pixel count ${pixels.length} does not match expected ${width * height}`,
      );
    }

    const bitmap = new LayerBitmap(width, height);
    bitmap.pixels = pixels;
    return bitmap;
  }

  /**
   * Encodes an array of color strings using Run-Length Encoding
   * Format: count:color|count:color|...
   */
  static encodeRLE(pixels: string[]): string {
    if (pixels.length === 0) {
      return '';
    }

    // Validate all colors first
    for (const pixel of pixels) {
      if (!this.isValidHexColor(pixel)) {
        throw new Error(`Invalid hex color format: ${pixel}`);
      }
    }

    const runs: string[] = [];
    let currentColor = pixels[0];
    let count = 1;

    for (let i = 1; i < pixels.length; i++) {
      if (pixels[i] === currentColor) {
        count++;
      } else {
        // Encode the run
        runs.push(`${count}:${currentColor}`);
        currentColor = pixels[i];
        count = 1;
      }
    }

    // Add the final run
    runs.push(`${count}:${currentColor}`);

    return runs.join('|');
  }

  /**
   * Decodes an RLE encoded string back to an array of color strings
   */
  static decodeRLE(encoded: string): string[] {
    if (encoded === '') {
      return [];
    }

    try {
      const pixels: string[] = [];
      const runs = encoded.split('|');

      for (const run of runs) {
        const [countStr, color] = run.split(':');
        const count = parseInt(countStr, 10);

        if (isNaN(count) || count <= 0) {
          throw new Error('Invalid run count');
        }

        if (!this.isValidHexColor(color)) {
          throw new Error(`Invalid hex color format: ${color}`);
        }

        // Add the pixels for this run
        for (let i = 0; i < count; i++) {
          pixels.push(color);
        }
      }

      return pixels;
    } catch {
      throw new Error('Invalid RLE encoded data');
    }
  }

  /**
   * Validates hex color format
   */
  private static isValidHexColor(color: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(color);
  }

  /**
   * Validates a single color
   */
  private validateColor(color: string): void {
    if (!LayerBitmap.isValidHexColor(color)) {
      throw new Error(`Invalid hex color format: ${color}`);
    }
  }

  /**
   * Validates pixel coordinates
   */
  private validateCoordinates(x: number, y: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      throw new Error('Pixel coordinates out of bounds');
    }
  }
}
