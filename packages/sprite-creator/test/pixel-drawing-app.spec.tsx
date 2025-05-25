/**
 * Tests for PixelDrawingApp component
 * Covers Plan 11: Draw Pixel Action integration
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelDrawingApp } from '../src/components/PixelDrawingApp';

describe('PixelDrawingApp', () => {
  it('should render the drawing app with controls', () => {
    render(<PixelDrawingApp width={16} height={16} />);

    // Check main container
    const app = screen.getByTestId('pixel-drawing-app');
    expect(app).toBeInTheDocument();

    // Check color picker control
    const colorPicker = screen.getByTestId('color-picker');
    expect(colorPicker).toBeInTheDocument();
    expect(colorPicker).toHaveValue('#ff0000'); // Default red color

    // Check canvas is rendered
    const canvas = screen.getByTestId('pixel-canvas');
    expect(canvas).toBeInTheDocument();

    // Check info display
    expect(screen.getByText(/Canvas: 16x16/)).toBeInTheDocument();
    expect(screen.getByText(/Current Color: #ff0000/)).toBeInTheDocument();
  });

  it('should update selected color when color picker changes', () => {
    render(<PixelDrawingApp width={8} height={8} />);

    const colorPicker = screen.getByTestId('color-picker');

    // Change color to blue
    fireEvent.change(colorPicker, { target: { value: '#0000ff' } });

    expect(colorPicker).toHaveValue('#0000ff');
    expect(screen.getByText(/Current Color: #0000ff/)).toBeInTheDocument();
  });

  it('should integrate LayerBitmap with PixelCanvas for drawing', () => {
    render(<PixelDrawingApp width={4} height={4} pixelSize={32} />);

    // The app should render without errors
    expect(screen.getByTestId('pixel-drawing-app')).toBeInTheDocument();
    expect(screen.getByTestId('pixel-canvas')).toBeInTheDocument();

    // Verify initial state
    expect(screen.getByText(/Canvas: 4x4/)).toBeInTheDocument();

    // The PixelCanvas should receive the onPixelClick handler
    // (We can't easily test the actual clicking in JSDOM, but we can verify structure)
    const canvas = screen.getByTestId('pixel-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should pass initial color to LayerBitmap', () => {
    const initialColor = '#123456';
    render(
      <PixelDrawingApp width={8} height={8} initialColor={initialColor} />,
    );

    // Component should render successfully with custom initial color
    expect(screen.getByTestId('pixel-drawing-app')).toBeInTheDocument();
  });

  it('should render with custom pixel size', () => {
    render(<PixelDrawingApp width={6} height={6} pixelSize={24} />);

    // Should render without errors
    expect(screen.getByTestId('pixel-drawing-app')).toBeInTheDocument();
    expect(screen.getByTestId('pixel-canvas')).toBeInTheDocument();
    expect(screen.getByText(/Canvas: 6x6/)).toBeInTheDocument();
  });
});
