import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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
