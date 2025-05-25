/**
 * Tests for PixelCanvas component - React Testing Library
 * Covers Plan 10: Canvas Renderer Skeleton (SPR-FR-1)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelCanvas } from '../src/components/PixelCanvas';

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
});
