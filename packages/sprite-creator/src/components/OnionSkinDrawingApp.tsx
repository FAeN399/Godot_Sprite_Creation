import React, { useState } from 'react';
import { PixelCanvas } from './PixelCanvas';
import { LayerBitmap } from '../model/LayerBitmap';
import { Animation, AnimationFrame } from '../model/Animation';

/**
 * OnionSkinDrawingApp - Demonstrates Plan 12: Onion-Skin Overlay functionality
 * Shows ghost frames from previous/next animation frames while editing
 */
export const OnionSkinDrawingApp: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [onionSkinEnabled, setOnionSkinEnabled] = useState(true);
  const [onionSkinOpacity, setOnionSkinOpacity] = useState(0.5);

  // Create a simple 3-frame animation
  const [animation] = useState(() => {
    const frame1 = new AnimationFrame(['layer1'], 100);
    const frame2 = new AnimationFrame(['layer2'], 100);
    const frame3 = new AnimationFrame(['layer3'], 100);
    return new Animation('demo', [frame1, frame2, frame3]);
  });

  // Create layer bitmaps for each frame
  const [frameBitmaps] = useState(() => {
    const bitmaps = [
      new LayerBitmap(16, 16),
      new LayerBitmap(16, 16),
      new LayerBitmap(16, 16),
    ];

    // Frame 1: Draw a simple pattern
    bitmaps[0].setPixel(2, 2, '#ff0000');
    bitmaps[0].setPixel(3, 2, '#ff0000');
    bitmaps[0].setPixel(2, 3, '#ff0000');

    // Frame 2: Shift the pattern slightly
    bitmaps[1].setPixel(3, 2, '#00ff00');
    bitmaps[1].setPixel(4, 2, '#00ff00');
    bitmaps[1].setPixel(3, 3, '#00ff00');
    bitmaps[1].setPixel(4, 3, '#00ff00');

    // Frame 3: Another variation
    bitmaps[2].setPixel(4, 3, '#0000ff');
    bitmaps[2].setPixel(5, 3, '#0000ff');
    bitmaps[2].setPixel(4, 4, '#0000ff');
    bitmaps[2].setPixel(5, 4, '#0000ff');
    bitmaps[2].setPixel(5, 5, '#0000ff');

    return bitmaps;
  });

  const handlePixelClick = (x: number, y: number) => {
    frameBitmaps[currentFrameIndex].setPixel(x, y, selectedColor);
    // Force re-render
    setCurrentFrameIndex(currentFrameIndex);
  };

  const getCurrentFramePixelData = () => {
    const bitmap = frameBitmaps[currentFrameIndex];
    const pixels: Array<{ x: number; y: number; color: string }> = [];

    for (let y = 0; y < bitmap.getHeight(); y++) {
      for (let x = 0; x < bitmap.getWidth(); x++) {
        const color = bitmap.getPixel(x, y);
        if (color) {
          pixels.push({ x, y, color });
        }
      }
    }

    return pixels;
  };

  const getOnionSkinPixelData = () => {
    if (!onionSkinEnabled) return [];

    const pixels: Array<{ x: number; y: number; color: string }> = [];

    // Show previous frame if available
    if (currentFrameIndex > 0) {
      const prevBitmap = frameBitmaps[currentFrameIndex - 1];
      for (let y = 0; y < prevBitmap.getHeight(); y++) {
        for (let x = 0; x < prevBitmap.getWidth(); x++) {
          const color = prevBitmap.getPixel(x, y);
          if (color) {
            pixels.push({ x, y, color });
          }
        }
      }
    }

    // Show next frame if available (with different tint)
    if (currentFrameIndex < frameBitmaps.length - 1) {
      const nextBitmap = frameBitmaps[currentFrameIndex + 1];
      for (let y = 0; y < nextBitmap.getHeight(); y++) {
        for (let x = 0; x < nextBitmap.getWidth(); x++) {
          const color = nextBitmap.getPixel(x, y);
          if (color) {
            // Tint next frame slightly differently
            pixels.push({ x, y, color: color + '80' }); // Add alpha for visual distinction
          }
        }
      }
    }

    return pixels;
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
      <h2>🧅 Onion-Skin Drawing Demo (Plan 12)</h2>
      <p>Draw pixels and see ghost frames from adjacent animation frames!</p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Canvas</h3>
          <PixelCanvas
            width={16}
            height={16}
            pixelSize={24}
            pixelData={getCurrentFramePixelData()}
            onionSkinEnabled={onionSkinEnabled}
            onionSkinData={getOnionSkinPixelData()}
            onionSkinOpacity={onionSkinOpacity}
            onPixelClick={handlePixelClick}
          />
        </div>

        <div>
          <h3>Controls</h3>

          <div style={{ marginBottom: '15px' }}>
            <h4>Animation Frame</h4>
            <div style={{ display: 'flex', gap: '5px' }}>
              {animation.getFrames().map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFrameIndex(index)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor:
                      index === currentFrameIndex ? '#4fc3f7' : '#ccc',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: index === currentFrameIndex ? 'white' : 'black',
                  }}
                >
                  Frame {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>Onion Skin Settings</h4>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={onionSkinEnabled}
                onChange={(e) => setOnionSkinEnabled(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Enable Onion Skin Overlay
            </label>

            <label style={{ display: 'block' }}>
              Opacity: {(onionSkinOpacity * 100).toFixed(0)}%
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={onionSkinOpacity}
                onChange={(e) =>
                  setOnionSkinOpacity(parseFloat(e.target.value))
                }
                style={{ marginLeft: '8px', width: '100px' }}
              />
            </label>
          </div>

          <div>
            <h4>Color Palette</h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                maxWidth: '120px',
              }}
            >
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color,
                    border:
                      selectedColor === color
                        ? '3px solid #333'
                        : '1px solid #ccc',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  title={color}
                />
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Selected: {selectedColor}
            </p>
          </div>
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
        <h4>🎯 Plan 12 Features Demonstrated:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ Onion-skin overlay rendering of adjacent animation frames</li>
          <li>✅ Toggle to enable/disable onion-skin display</li>
          <li>✅ Configurable opacity for ghost frame visibility</li>
          <li>✅ Visual distinction between current frame and ghost frames</li>
          <li>✅ Multi-frame animation timeline navigation</li>
          <li>✅ Real-time onion-skin updates when switching frames</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
          🧅 <strong>Onion skinning</strong> helps animators see how the current
          frame relates to previous and next frames, making it easier to create
          smooth animation transitions.
        </p>
      </div>
    </div>
  );
};
