import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import React from 'react';

// Mock HTMLCanvasElement methods
beforeEach(() => {
  // Mock canvas context
  const mockContext = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    fillText: vi.fn(),
    strokeText: vi.fn(),
  };

  // Mock canvas element
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockContext,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () =>
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  );
});

// Mock react-konva components
vi.mock('react-konva', () => ({
  Stage: vi.fn((props) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'konva-stage',
        onClick: props.onClick,
        onTap: props.onTap,
      },
      React.createElement('canvas'),
      props.children,
    );
  }),
  Layer: vi.fn((props) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'konva-layer',
      },
      props.children,
    );
  }),
  Rect: vi.fn(() => {
    return React.createElement('div', {
      'data-testid': 'konva-rect',
    });
  }),
}));
