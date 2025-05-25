import React, { useState } from 'react';
import { PixelCanvas } from './PixelCanvas';
import { LayerBitmap } from '../model/LayerBitmap';

export interface PixelDrawingAppProps {
  width: number;
  height: number;
  pixelSize?: number;
  initialColor?: string;
}

/**
 * PixelDrawingApp - Demo component showcasing Plan 11: Draw Pixel Action
 * Integrates PixelCanvas with LayerBitmap for pixel drawing functionality
 */
export const PixelDrawingApp: React.FC<PixelDrawingAppProps> = ({
  width,
  height,
  pixelSize = 16,
  initialColor = '#000000',
}) => {
  // State management for the bitmap and selected color
  const [bitmap] = useState(() => new LayerBitmap(width, height, initialColor));
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [, forceUpdate] = useState({});

  // Handle pixel clicks - this is the core Plan 11 functionality
  const handlePixelClick = (x: number, y: number) => {
    bitmap.setPixel(x, y, selectedColor);
    // Force re-render to show the change (in a real app, this would be handled differently)
    forceUpdate({});
  };

  // Get pixel data for rendering
  const getPixelData = (): Array<{ x: number; y: number; color: string }> => {
    const pixels = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = bitmap.getPixel(x, y);
        if (color !== initialColor) {
          pixels.push({ x, y, color });
        }
      }
    }
    return pixels;
  };

  return (
    <div className="pixel-drawing-app" data-testid="pixel-drawing-app">
      <div className="controls" style={{ marginBottom: '10px' }}>
        <label>
          Selected Color:
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            data-testid="color-picker"
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>

      <PixelCanvas
        width={width}
        height={height}
        pixelSize={pixelSize}
        onPixelClick={handlePixelClick}
        pixelData={getPixelData()}
      />

      <div className="info" style={{ marginTop: '10px', fontSize: '12px' }}>
        Canvas: {width}x{height} | Current Color: {selectedColor}
      </div>
    </div>
  );
};
