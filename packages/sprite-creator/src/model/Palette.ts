/**
 * Palette management utilities for sprite creation
 * Supports up to 256 colors with import/export capabilities
 */
export class Palette {
  private colors: string[] = [];

  constructor(colors: string[] = []) {
    this.validateColors(colors);
    if (colors.length > 256) {
      throw new Error('Palette cannot contain more than 256 colors');
    }
    this.colors = [...colors];
  }

  /**
   * Validates hex color format
   */
  private validateColors(colors: string[]): void {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    for (const color of colors) {
      if (!hexColorRegex.test(color)) {
        throw new Error(`Invalid hex color format: ${color}`);
      }
    }
  }

  /**
   * Gets all colors in the palette
   */
  getColors(): string[] {
    return [...this.colors];
  }

  /**
   * Gets the number of colors in the palette
   */
  size(): number {
    return this.colors.length;
  }

  /**
   * Adds a color to the palette
   */
  addColor(color: string): void {
    this.validateColors([color]);

    if (this.colors.length >= 256) {
      throw new Error('Cannot add color: palette already contains 256 colors');
    }

    if (!this.colors.includes(color)) {
      this.colors.push(color);
    }
  }

  /**
   * Removes a color from the palette
   */
  removeColor(color: string): void {
    const index = this.colors.indexOf(color);
    if (index !== -1) {
      this.colors.splice(index, 1);
    }
  }

  /**
   * Gets the index of a color in the palette
   */
  indexOf(color: string): number {
    return this.colors.indexOf(color);
  }

  /**
   * Checks if the palette contains a specific color
   */
  hasColor(color: string): boolean {
    return this.colors.includes(color);
  }

  /**
   * Creates a swap mapping between two palettes
   */
  static createSwapMap(
    originalPalette: Palette,
    targetPalette: Palette,
  ): Record<string, string> {
    const swapMap: Record<string, string> = {};
    const originalColors = originalPalette.getColors();
    const targetColors = targetPalette.getColors();

    for (let i = 0; i < originalColors.length; i++) {
      // If target palette is shorter, repeat the last color
      const targetIndex = Math.min(i, targetColors.length - 1);
      swapMap[originalColors[i]] =
        targetColors[targetIndex] || targetColors[targetColors.length - 1];
    }

    return swapMap;
  }

  /**
   * Applies a palette swap to bitmap data
   */
  applySwap(bitmapData: string[], swapMap: Record<string, string>): string[] {
    return bitmapData.map((color) => swapMap[color] || color);
  }

  /**
   * Imports a palette from ASE (Adobe Swatch Exchange) format
   */
  static async fromASE(buffer: ArrayBuffer): Promise<Palette> {
    const view = new DataView(buffer);

    // Check ASE signature
    if (buffer.byteLength < 4) {
      throw new Error('Invalid ASE file format');
    }

    const signature = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3),
    );

    if (signature !== 'ASEF') {
      throw new Error('Invalid ASE file format');
    }

    const colors: string[] = [];

    // This is a simplified ASE parser
    // In a real implementation, you would need to parse the full ASE format
    // For now, we'll extract basic RGB colors

    try {
      // Skip header (12 bytes: signature + version + block count)
      let offset = 12;

      while (offset < buffer.byteLength - 20) {
        // Read block type (2 bytes)
        const blockType = view.getUint16(offset, false);
        offset += 2;

        // Read block length (4 bytes)
        const blockLength = view.getUint32(offset, false);
        offset += 4;

        if (blockType === 0x0001) {
          // Color block
          // Skip name length and name
          const nameLength = view.getUint16(offset, false);
          offset += 2 + nameLength * 2; // UTF-16 encoding

          // Read color space (4 bytes)
          const colorSpace = String.fromCharCode(
            view.getUint8(offset),
            view.getUint8(offset + 1),
            view.getUint8(offset + 2),
            view.getUint8(offset + 3),
          );
          offset += 4;

          if (colorSpace === 'RGB ') {
            // Read RGB values (3 * 4 bytes as floats)
            const r = Math.round(view.getFloat32(offset, false) * 255);
            const g = Math.round(view.getFloat32(offset + 4, false) * 255);
            const b = Math.round(view.getFloat32(offset + 8, false) * 255);

            const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            colors.push(hexColor);

            offset += 12; // Skip RGB values
          }

          offset += 2; // Skip color type
        } else {
          // Skip unknown block
          offset += blockLength - 6; // -6 because we already read type and length
        }
      }
    } catch {
      throw new Error('Invalid ASE file format');
    }

    return new Palette(colors);
  }

  /**
   * Serializes the palette to JSON
   */
  toJSON(): { colors: string[] } {
    return {
      colors: this.getColors(),
    };
  }

  /**
   * Creates a palette from JSON data
   */
  static fromJSON(json: { colors: string[] }): Palette {
    return new Palette(json.colors);
  }
}
