import React, { useState } from 'react';
import { PixelCanvas } from './PixelCanvas';
import { LayerBitmap } from '../model/LayerBitmap';

export interface MirrorDrawingAppProps {
  width: number;
  height: number;
  pixelSize?: number;
  initialColor?: string;
}

/**
 * MirrorDrawingApp - Demo component showcasing Plan 13: Mirror Drawing Toggle
 * Integrates PixelCanvas with LayerBitmap for symmetric pixel drawing functionality
 */
export const MirrorDrawingApp: React.FC<MirrorDrawingAppProps> = ({
  width,
  height,
  pixelSize = 16,
  initialColor = '#000000',
}) => {
  // State management for the bitmap, selected color, and mirror toggle
  const [bitmap] = useState(() => new LayerBitmap(width, height, initialColor));
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [isMirrorEnabled, setIsMirrorEnabled] = useState(false);
  const [, forceUpdate] = useState({});

  // Handle pixel clicks with mirror functionality
  const handlePixelClick = (x: number, y: number) => {
    // Set the original pixel
    bitmap.setPixel(x, y, selectedColor);

    // If mirror mode is enabled, also set the mirrored pixel
    if (isMirrorEnabled) {
      const mirrorX = bitmap.getWidth() - 1 - x;
      if (mirrorX !== x) {
        // Don't duplicate if it's the center line
        bitmap.setPixel(mirrorX, y, selectedColor);
      }
    }

    // Force re-render to show the change
    forceUpdate({});
  };
  // Get pixel data for rendering
  const getPixelData = (): Array<{ x: number; y: number; color: string }> => {
    const pixels = [];
    const bitmapWidth = bitmap.getWidth();
    const bitmapHeight = bitmap.getHeight();

    for (let y = 0; y < bitmapHeight; y++) {
      for (let x = 0; x < bitmapWidth; x++) {
        const color = bitmap.getPixel(x, y);
        if (color !== initialColor) {
          pixels.push({ x, y, color });
        }
      }
    }
    return pixels;
  };
  // Clear the canvas
  const clearCanvas = () => {
    const bitmapWidth = bitmap.getWidth();
    const bitmapHeight = bitmap.getHeight();

    for (let y = 0; y < bitmapHeight; y++) {
      for (let x = 0; x < bitmapWidth; x++) {
        bitmap.setPixel(x, y, initialColor);
      }
    }
    forceUpdate({});
  };

  const colors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#ffffff',
    '#000000',
    '#808080',
    '#ffa500',
    '#800080',
    '#008000',
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🪞 Mirror Drawing Demo (Plan 13)</h2>
      <p>
        Click on the canvas to draw pixels. Enable mirror mode to draw
        symmetrically!
      </p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Canvas</h3>
          <PixelCanvas
            width={width}
            height={height}
            pixelSize={pixelSize}
            pixelData={getPixelData()}
            onPixelClick={handlePixelClick}
          />
        </div>

        <div>
          <h3>Mirror Controls</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={isMirrorEnabled}
                onChange={(e) => setIsMirrorEnabled(e.target.checked)}
                data-testid="mirror-toggle"
              />
              <span style={{ marginLeft: '8px' }}>Enable Mirror Drawing</span>
            </label>
            <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
              {isMirrorEnabled
                ? '🪞 Mirror mode ON - pixels will be drawn symmetrically'
                : '🖌️ Mirror mode OFF - normal drawing'}
            </p>
          </div>

          <h4>Color Palette</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '5px',
              marginBottom: '20px',
            }}
          >
            {colors.map((color) => (
              <button
                key={color}
                style={{
                  backgroundColor: color,
                  border:
                    selectedColor === color
                      ? '3px solid #333'
                      : '1px solid #ccc',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
                onClick={() => setSelectedColor(color)}
                data-testid={`color-${color}`}
              />
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '10px 0' }}>
              Selected:
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: selectedColor,
                  border: '1px solid #333',
                  width: '20px',
                  height: '20px',
                  marginLeft: '10px',
                  verticalAlign: 'middle',
                }}
              ></span>
              <span style={{ marginLeft: '8px' }}>{selectedColor}</span>
            </p>
          </div>

          <button
            onClick={clearCanvas}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            data-testid="clear-button"
          >
            Clear Canvas
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
        }}
      >
        <h4>🎯 Plan 13 Features Demonstrated:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ Mirror drawing toggle for symmetric pixel placement</li>
          <li>✅ Automatic calculation of mirrored coordinates</li>
          <li>✅ Center line handling (no duplication on exact center)</li>
          <li>✅ Real-time mirror mode feedback</li>
          <li>✅ Integration with existing LayerBitmap and PixelCanvas</li>
          <li>✅ Visual toolbar controls for mirror toggle</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
          Mirror drawing is essential for character sprite creation, allowing
          artists to draw symmetric features efficiently. This feature
          implements the symmetric pixel placement requirement for Plan 13.
        </p>
      </div>
    </div>
  );
};
