import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import './PixelCanvas.css';

export interface PixelCanvasProps {
  width: number;
  height: number;
  pixelSize?: number;
  onPixelClick?: (x: number, y: number) => void;
}

/**
 * PixelCanvas component - Main drawing canvas with checkerboard background
 * Uses react-konva for efficient 2D canvas rendering
 */
export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  width,
  height,
  pixelSize = 16,
  onPixelClick,
}) => {
  const stageWidth = width * pixelSize;
  const stageHeight = height * pixelSize;

  // Generate checkerboard pattern for transparency visualization
  const checkerboardTiles = [];
  const tileSize = pixelSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isLight = (x + y) % 2 === 0;
      checkerboardTiles.push(
        <Rect
          key={`checker-${x}-${y}`}
          x={x * tileSize}
          y={y * tileSize}
          width={tileSize}
          height={tileSize}
          fill={isLight ? '#ffffff' : '#cccccc'}
        />,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStageClick = (e: any) => {
    if (!onPixelClick) return;

    const pos = e.target.getStage().getPointerPosition();
    const x = Math.floor(pos.x / pixelSize);
    const y = Math.floor(pos.y / pixelSize);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      onPixelClick(x, y);
    }
  };

  return (
    <div
      data-testid="pixel-canvas"
      className="pixel-canvas-container checkerboard-bg"
    >
      <Stage
        width={stageWidth}
        height={stageHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>{checkerboardTiles}</Layer>
      </Stage>
    </div>
  );
};
