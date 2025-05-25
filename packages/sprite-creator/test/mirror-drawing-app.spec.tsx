/**
 * Tests for MirrorDrawingApp component - React Testing Library
 * Covers Plan 13: Mirror Drawing Toggle functionality
 */
/// <reference lib="dom" />
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MirrorDrawingApp } from '../src/components/MirrorDrawingApp';

describe('MirrorDrawingApp', () => {
  it('should render the component with title and canvas', () => {
    render(<MirrorDrawingApp width={16} height={16} />);

    // Check if the title is rendered
    expect(
      screen.getByText('🪞 Mirror Drawing Demo (Plan 13)'),
    ).toBeInTheDocument();

    // Check if the canvas is rendered (via pixel-canvas test-id)
    expect(screen.getByTestId('pixel-canvas')).toBeInTheDocument();

    // Check if mirror controls are present
    expect(screen.getByText('Mirror Controls')).toBeInTheDocument();
    expect(screen.getByTestId('mirror-toggle')).toBeInTheDocument();
  });

  it('should start with mirror mode disabled', () => {
    render(<MirrorDrawingApp width={16} height={16} />);

    const mirrorToggle = screen.getByTestId('mirror-toggle');
    expect(mirrorToggle).not.toBeChecked();
    expect(
      screen.getByText('🖌️ Mirror mode OFF - normal drawing'),
    ).toBeInTheDocument();
  });

  it('should toggle mirror mode when checkbox is clicked', () => {
    render(<MirrorDrawingApp width={16} height={16} />);

    const mirrorToggle = screen.getByTestId('mirror-toggle');

    // Initially disabled
    expect(mirrorToggle).not.toBeChecked();
    expect(
      screen.getByText('🖌️ Mirror mode OFF - normal drawing'),
    ).toBeInTheDocument();

    // Click to enable
    fireEvent.click(mirrorToggle);
    expect(mirrorToggle).toBeChecked();
    expect(
      screen.getByText(
        '🪞 Mirror mode ON - pixels will be drawn symmetrically',
      ),
    ).toBeInTheDocument();

    // Click to disable
    fireEvent.click(mirrorToggle);
    expect(mirrorToggle).not.toBeChecked();
    expect(
      screen.getByText('🖌️ Mirror mode OFF - normal drawing'),
    ).toBeInTheDocument();
  });

  it('should render color palette with all expected colors', () => {
    render(<MirrorDrawingApp width={16} height={16} />);

    const expectedColors = [
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

    expectedColors.forEach((color) => {
      expect(screen.getByTestId(`color-${color}`)).toBeInTheDocument();
    });
  });

  it('should allow color selection from palette', () => {
    render(<MirrorDrawingApp width={16} height={16} />);

    // Initial color should be red
    expect(screen.getByText('#ff0000')).toBeInTheDocument();

    // Click blue color
    const blueButton = screen.getByTestId('color-#0000ff');
    fireEvent.click(blueButton);

    // Should update selected color display
    expect(screen.getByText('#0000ff')).toBeInTheDocument();
  });

  it('should have clear canvas button', () => {
    render(<MirrorDrawingApp width={16} height={16} />);

    const clearButton = screen.getByTestId('clear-button');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveTextContent('Clear Canvas');

    // Should be clickable
    fireEvent.click(clearButton);
    // The canvas clearing functionality is tested at the integration level
  });

  describe('Plan 13: Mirror Drawing Integration', () => {
    it('should demonstrate Plan 13 features in description', () => {
      render(<MirrorDrawingApp width={16} height={16} />);

      expect(
        screen.getByText('🎯 Plan 13 Features Demonstrated:'),
      ).toBeInTheDocument();

      // Check for key feature descriptions
      expect(
        screen.getByText(/Mirror drawing toggle for symmetric pixel placement/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Automatic calculation of mirrored coordinates/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Center line handling/)).toBeInTheDocument();
      expect(
        screen.getByText(/Real-time mirror mode feedback/),
      ).toBeInTheDocument();
    });

    it('should provide helpful description text', () => {
      render(<MirrorDrawingApp width={16} height={16} />);

      expect(
        screen.getByText(
          'Click on the canvas to draw pixels. Enable mirror mode to draw symmetrically!',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /Mirror drawing is essential for character sprite creation/,
        ),
      ).toBeInTheDocument();
    });

    it('should integrate PixelCanvas with mirror functionality', () => {
      render(<MirrorDrawingApp width={16} height={16} />);

      // Should render PixelCanvas component
      const canvas = screen.getByTestId('pixel-canvas');
      expect(canvas).toBeInTheDocument();

      // Canvas should be integrated with mirror drawing logic
      // (The actual mirror logic is tested in the pixel-canvas.spec.tsx)
    });
    it('should handle different canvas sizes', () => {
      // Test with different initial canvas sizes (separate renders)
      const { unmount } = render(<MirrorDrawingApp width={8} height={8} />);
      expect(screen.getByTestId('pixel-canvas')).toBeInTheDocument();
      unmount();

      render(<MirrorDrawingApp width={32} height={24} />);
      expect(screen.getByTestId('pixel-canvas')).toBeInTheDocument();
    });

    it('should maintain state when toggling mirror mode multiple times', () => {
      render(<MirrorDrawingApp width={16} height={16} />);

      const mirrorToggle = screen.getByTestId('mirror-toggle');

      // Toggle multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(mirrorToggle);
        if (i % 2 === 0) {
          expect(mirrorToggle).toBeChecked();
        } else {
          expect(mirrorToggle).not.toBeChecked();
        }
      }
    });
  });
});
