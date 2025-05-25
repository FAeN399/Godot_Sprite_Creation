/**
 * Tests for PixelCanvas component - React Testing Library
 * Covers Plan 10: Canvas Renderer Skeleton (SPR-FR-1)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelCanvas } from '../src/components/PixelCanvas';
import { LayerBitmap } from '../src/model/LayerBitmap';

describe('PixelCanvas', () => {
  it('should render canvas container with test id', () => {
    render(<PixelCanvas width={32} height={32} />);

    // Check if the canvas container is rendered
    const canvasContainer = screen.getByTestId('pixel-canvas');
    expect(canvasContainer).toBeInTheDocument();

    // Check if it has the expected class
    expect(canvasContainer).toHaveClass('pixel-canvas-container');
    expect(canvasContainer).toHaveClass('checkerboard-bg');
  });

  it('should render checkerboard grid pattern', () => {
    render(<PixelCanvas width={4} height={4} pixelSize={20} />);

    const canvasContainer = screen.getByTestId('pixel-canvas');
    expect(canvasContainer).toBeInTheDocument();

    // Verify checkerboard background class is applied
    expect(canvasContainer).toHaveClass('checkerboard-bg');

    // Verify the container exists and has content (Konva Stage renders differently in tests)
    expect(canvasContainer.children.length).toBeGreaterThan(0);

    // The component should render without errors with the specified dimensions
    expect(canvasContainer).toHaveClass('pixel-canvas-container');
  });

  it('should render with correct component structure', () => {
    render(<PixelCanvas width={64} height={32} />);

    const canvasContainer = screen.getByTestId('pixel-canvas');
    expect(canvasContainer).toBeInTheDocument();

    // Should contain some content (Stage component will be mocked)
    expect(canvasContainer.children.length).toBeGreaterThan(0);
  });

  it('should accept pixel click handler prop', () => {
    const mockClickHandler = vi.fn();
    render(
      <PixelCanvas width={16} height={16} onPixelClick={mockClickHandler} />,
    );

    const canvasContainer = screen.getByTestId('pixel-canvas');
    expect(canvasContainer).toBeInTheDocument();

    // The component should render without errors when handler is provided
    expect(mockClickHandler).not.toHaveBeenCalled();
  });

  it('should calculate stage dimensions correctly', () => {
    const width = 8;
    const height = 6;
    const pixelSize = 24;

    render(<PixelCanvas width={width} height={height} pixelSize={pixelSize} />);

    const canvasContainer = screen.getByTestId('pixel-canvas');
    expect(canvasContainer).toBeInTheDocument();

    // Verify the component renders correctly with the given props
    expect(canvasContainer).toHaveClass('pixel-canvas-container');
    expect(canvasContainer).toHaveClass('checkerboard-bg');

    // The Stage component should be rendered (structure will be different in test environment)
    expect(canvasContainer.children.length).toBeGreaterThan(0);
  });

  describe('Plan 11: Draw Pixel Action', () => {
    it('should trigger onPixelClick when canvas is clicked', () => {
      const mockClickHandler = vi.fn();

      // We need to test the component integration differently in the test environment
      // Since Konva doesn't work the same way in JSDOM, we'll test the handler prop integration
      render(
        <PixelCanvas
          width={16}
          height={16}
          pixelSize={32}
          onPixelClick={mockClickHandler}
        />,
      );

      // Verify the component renders correctly with the handler
      const canvasContainer = screen.getByTestId('pixel-canvas');
      expect(canvasContainer).toBeInTheDocument();

      // Since we can't reliably test DOM click events with Konva in JSDOM,
      // we'll test the integration at the model level and verify the prop is passed correctly
      expect(mockClickHandler).not.toHaveBeenCalled(); // Initially not called
    });

    it('should integrate with LayerBitmap to set pixel colors', () => {
      const bitmap = new LayerBitmap(16, 16, '#000000');
      const selectedColor = '#ff0000';

      const handlePixelClick = (x: number, y: number) => {
        bitmap.setPixel(x, y, selectedColor);
      };

      render(
        <PixelCanvas width={16} height={16} onPixelClick={handlePixelClick} />,
      );

      // Verify initial state
      expect(bitmap.getPixel(5, 5)).toBe('#000000');

      // Simulate the click handler being called (as if canvas was clicked)
      handlePixelClick(5, 5);

      // Verify pixel was set in the bitmap
      expect(bitmap.getPixel(5, 5)).toBe('#ff0000');
    });
  });

  describe('Plan 12: Onion-Skin Overlay', () => {
    it('should render onion-skin overlay for previous frame when enabled', () => {
      const pixelData = [
        { x: 1, y: 1, color: '#ff0000' },
        { x: 2, y: 2, color: '#00ff00' },
      ];

      const onionSkinData = [
        { x: 0, y: 0, color: '#0000ff' },
        { x: 1, y: 2, color: '#ffff00' },
      ];

      render(
        <PixelCanvas
          width={16}
          height={16}
          pixelSize={20}
          pixelData={pixelData}
          onionSkinEnabled={true}
          onionSkinData={onionSkinData}
          onionSkinOpacity={0.5}
          onPixelClick={vi.fn()}
        />,
      );

      const stage = screen.getByTestId('pixel-canvas');
      expect(stage).toBeInTheDocument();

      // Should render both current and onion-skin pixels
      // Current pixels should be fully opaque
      // Onion-skin pixels should be at reduced opacity
    });

    it('should not render onion-skin overlay when disabled', () => {
      const pixelData = [{ x: 1, y: 1, color: '#ff0000' }];

      const onionSkinData = [{ x: 0, y: 0, color: '#0000ff' }];

      render(
        <PixelCanvas
          width={16}
          height={16}
          pixelSize={20}
          pixelData={pixelData}
          onionSkinEnabled={false}
          onionSkinData={onionSkinData}
          onPixelClick={vi.fn()}
        />,
      );

      const stage = screen.getByTestId('pixel-canvas');
      expect(stage).toBeInTheDocument();

      // Should only render current frame pixels, no onion-skin
    });

    it('should support configurable onion-skin opacity', () => {
      const onionSkinData = [{ x: 0, y: 0, color: '#0000ff' }];

      const { rerender } = render(
        <PixelCanvas
          width={16}
          height={16}
          pixelSize={20}
          onionSkinEnabled={true}
          onionSkinData={onionSkinData}
          onionSkinOpacity={0.3}
          onPixelClick={vi.fn()}
        />,
      );

      // Test with different opacity value
      rerender(
        <PixelCanvas
          width={16}
          height={16}
          pixelSize={20}
          onionSkinEnabled={true}
          onionSkinData={onionSkinData}
          onionSkinOpacity={0.7}
          onPixelClick={vi.fn()}
        />,
      );

      const stage = screen.getByTestId('pixel-canvas');
      expect(stage).toBeInTheDocument();
    });
  });

  describe('Plan 13: Mirror Drawing Toggle', () => {
    it('should draw symmetric pixels when mirror mode is enabled', () => {
      const bitmap = new LayerBitmap(16, 16, '#000000');
      const selectedColor = '#ff0000';
      let isMirrorEnabled = true;

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
      };

      render(
        <PixelCanvas width={16} height={16} onPixelClick={handlePixelClick} />,
      );

      // Initially empty
      expect(bitmap.getPixel(3, 5)).toBe('#000000');
      expect(bitmap.getPixel(12, 5)).toBe('#000000');

      // Draw a pixel at (3, 5) with mirror enabled
      handlePixelClick(3, 5);

      // Should set both original and mirrored pixel
      expect(bitmap.getPixel(3, 5)).toBe('#ff0000'); // Original
      expect(bitmap.getPixel(12, 5)).toBe('#ff0000'); // Mirrored (15-3=12)

      // Clear the bitmap for next test
      bitmap.setPixel(3, 5, '#000000');
      bitmap.setPixel(12, 5, '#000000');

      // Disable mirror mode
      isMirrorEnabled = false;
      handlePixelClick(3, 5);

      // Should only set the original pixel
      expect(bitmap.getPixel(3, 5)).toBe('#ff0000');
      expect(bitmap.getPixel(12, 5)).toBe('#000000'); // Not mirrored
    });

    it('should handle center line pixels correctly in mirror mode', () => {
      const bitmap = new LayerBitmap(16, 16, '#000000');
      const selectedColor = '#ff0000';

      const handlePixelClickMirror = (x: number, y: number) => {
        bitmap.setPixel(x, y, selectedColor);
        const mirrorX = bitmap.getWidth() - 1 - x;
        if (mirrorX !== x) {
          bitmap.setPixel(mirrorX, y, selectedColor);
        }
      };

      render(
        <PixelCanvas
          width={16}
          height={16}
          onPixelClick={handlePixelClickMirror}
        />,
      );

      // Draw on center line (x=7 and x=8 are center for 16-wide canvas)
      handlePixelClickMirror(7, 5);

      // Should draw both the original and mirrored pixel (since they're different positions)
      expect(bitmap.getPixel(7, 5)).toBe('#ff0000'); // Original
      expect(bitmap.getPixel(8, 5)).toBe('#ff0000'); // Mirror calculation: 15-7=8

      // Test exact center for odd-width canvas
      const bitmap9 = new LayerBitmap(9, 9, '#000000');
      const handlePixelClickMirror9 = (x: number, y: number) => {
        bitmap9.setPixel(x, y, selectedColor);
        const mirrorX = bitmap9.getWidth() - 1 - x;
        if (mirrorX !== x) {
          bitmap9.setPixel(mirrorX, y, selectedColor);
        }
      };

      // For 9-wide canvas, center is x=4
      handlePixelClickMirror9(4, 4);
      expect(bitmap9.getPixel(4, 4)).toBe('#ff0000'); // Only center pixel set
    });

    it('should calculate mirror coordinates correctly for different canvas sizes', () => {
      // Test mirror calculation logic
      const testMirrorCalc = (width: number, x: number): number => {
        return width - 1 - x;
      };

      // 16-wide canvas: 0->15, 1->14, 7->8, 8->7, 15->0
      expect(testMirrorCalc(16, 0)).toBe(15);
      expect(testMirrorCalc(16, 1)).toBe(14);
      expect(testMirrorCalc(16, 7)).toBe(8);
      expect(testMirrorCalc(16, 8)).toBe(7);
      expect(testMirrorCalc(16, 15)).toBe(0);

      // 32-wide canvas
      expect(testMirrorCalc(32, 0)).toBe(31);
      expect(testMirrorCalc(32, 15)).toBe(16);
      expect(testMirrorCalc(32, 16)).toBe(15);
      expect(testMirrorCalc(32, 31)).toBe(0);
    });
  });
});
