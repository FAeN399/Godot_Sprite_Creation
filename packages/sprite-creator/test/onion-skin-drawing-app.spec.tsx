import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnionSkinDrawingApp } from '../src/components/OnionSkinDrawingApp';

// Mock react-konva
interface MockStageProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: unknown;
}

interface MockLayerProps {
  children?: React.ReactNode;
}

interface MockRectProps {
  fill?: string;
  opacity?: number;
  [key: string]: unknown;
}

vi.mock('react-konva', () => ({
  Stage: ({ children, onClick, ...props }: MockStageProps) => (
    <div data-testid="konva-stage" onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Layer: ({ children }: MockLayerProps) => (
    <div data-testid="konva-layer">{children}</div>
  ),
  Rect: ({ fill, opacity, ...props }: MockRectProps) => (
    <div
      data-testid="konva-rect"
      data-fill={fill}
      data-opacity={opacity}
      {...props}
    />
  ),
}));

describe('OnionSkinDrawingApp', () => {
  describe('Plan 12: Onion-Skin Overlay Integration', () => {
    it('should render the onion-skin drawing app with controls', () => {
      render(<OnionSkinDrawingApp />);

      expect(
        screen.getByText('🧅 Onion-Skin Drawing Demo (Plan 12)'),
      ).toBeInTheDocument();
      expect(screen.getByText('Controls')).toBeInTheDocument();
      expect(screen.getByText('Animation Frame')).toBeInTheDocument();
      expect(screen.getByText('Onion Skin Settings')).toBeInTheDocument();
      expect(screen.getByText('Color Palette')).toBeInTheDocument();
    });

    it('should display frame navigation buttons', () => {
      render(<OnionSkinDrawingApp />);

      const frameButtons = screen.getAllByText(/Frame \d+/);
      expect(frameButtons).toHaveLength(3);
      expect(screen.getByText('Frame 1')).toBeInTheDocument();
      expect(screen.getByText('Frame 2')).toBeInTheDocument();
      expect(screen.getByText('Frame 3')).toBeInTheDocument();
    });

    it('should allow switching between animation frames', () => {
      render(<OnionSkinDrawingApp />);

      const frame2Button = screen.getByText('Frame 2');
      fireEvent.click(frame2Button);

      // Frame 2 button should now be highlighted (different background color)
      expect(frame2Button).toHaveStyle('background-color: rgb(79, 195, 247)');
    });

    it('should have onion skin controls', () => {
      render(<OnionSkinDrawingApp />);

      const onionSkinCheckbox = screen.getByRole('checkbox', {
        name: /Enable Onion Skin Overlay/,
      });
      expect(onionSkinCheckbox).toBeInTheDocument();
      expect(onionSkinCheckbox).toBeChecked();

      const opacitySlider = screen.getByRole('slider');
      expect(opacitySlider).toBeInTheDocument();
      expect(opacitySlider).toHaveValue('0.5');
    });

    it('should toggle onion skin overlay', () => {
      render(<OnionSkinDrawingApp />);

      const onionSkinCheckbox = screen.getByRole('checkbox', {
        name: /Enable Onion Skin Overlay/,
      });

      // Should start enabled
      expect(onionSkinCheckbox).toBeChecked();

      // Disable onion skin
      fireEvent.click(onionSkinCheckbox);
      expect(onionSkinCheckbox).not.toBeChecked();

      // Enable again
      fireEvent.click(onionSkinCheckbox);
      expect(onionSkinCheckbox).toBeChecked();
    });

    it('should adjust onion skin opacity', () => {
      render(<OnionSkinDrawingApp />);

      const opacitySlider = screen.getByRole('slider');

      // Change opacity to 70%
      fireEvent.change(opacitySlider, { target: { value: '0.7' } });
      expect(opacitySlider).toHaveValue('0.7');

      // Check that the opacity label updates
      expect(screen.getByText('Opacity: 70%')).toBeInTheDocument();
    });

    it('should display color palette with selection', () => {
      render(<OnionSkinDrawingApp />);

      // Should have multiple color buttons
      const colorButtons = screen
        .getAllByRole('button')
        .filter(
          (button) =>
            button.style.backgroundColor && button.style.width === '24px',
        );
      expect(colorButtons.length).toBeGreaterThan(8);

      // Red should be initially selected
      expect(screen.getByText('Selected: #ff0000')).toBeInTheDocument();
    });

    it('should allow color selection', () => {
      render(<OnionSkinDrawingApp />);

      // Find a green color button and click it
      const colorButtons = screen
        .getAllByRole('button')
        .filter((button) => button.style.backgroundColor === 'rgb(0, 255, 0)');

      if (colorButtons.length > 0) {
        fireEvent.click(colorButtons[0]);
        expect(screen.getByText('Selected: #00ff00')).toBeInTheDocument();
      }
    });

    it('should render pixel canvas with onion skin props', () => {
      render(<OnionSkinDrawingApp />);

      // Should have the konva stage from PixelCanvas
      const stage = screen.getByTestId('konva-stage');
      expect(stage).toBeInTheDocument();
    });

    it('should show plan 12 features list', () => {
      render(<OnionSkinDrawingApp />);

      expect(
        screen.getByText('🎯 Plan 12 Features Demonstrated:'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Onion-skin overlay rendering/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Toggle to enable\/disable/)).toBeInTheDocument();
      expect(screen.getByText(/Configurable opacity/)).toBeInTheDocument();
    });
    it('should display educational onion skin explanation', () => {
      render(<OnionSkinDrawingApp />);

      expect(
        screen.getByText(/helps animators.*smooth animation transitions/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Onion skinning/)).toBeInTheDocument();
    });
  });
});
