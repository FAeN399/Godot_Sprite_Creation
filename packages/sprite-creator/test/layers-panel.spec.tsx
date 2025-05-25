import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayersPanel } from '../src/components/LayersPanel';
import { LayerBitmap } from '../src/model/LayerBitmap';

/**
 * Plan 14: Layers Panel Test Suite
 * Tests layer management UI with visibility, lock, opacity, add/merge functionality
 */
describe('LayersPanel', () => {
  const mockLayers = [
    {
      id: 'layer1',
      name: 'Background',
      bitmap: new LayerBitmap(16, 16),
      visible: true,
      locked: false,
      opacity: 1.0,
    },
    {
      id: 'layer2',
      name: 'Character',
      bitmap: new LayerBitmap(16, 16),
      visible: true,
      locked: false,
      opacity: 0.8,
    },
  ];

  const defaultProps = {
    layers: mockLayers,
    selectedLayerId: 'layer2',
    onLayerSelect: () => {},
    onLayerAdd: () => {},
    onLayerDelete: () => {},
    onLayerVisibilityToggle: () => {},
    onLayerLockToggle: () => {},
    onLayerOpacityChange: () => {},
    onLayerRename: () => {},
    onLayerReorder: () => {},
    onLayerMergeDown: () => {},
  };

  describe('Basic Rendering', () => {
    it('should render the layers panel with title', () => {
      render(<LayersPanel {...defaultProps} />);

      expect(screen.getByText('Layers')).toBeInTheDocument();
      expect(screen.getByTestId('layers-panel')).toBeInTheDocument();
    });

    it('should render all provided layers', () => {
      render(<LayersPanel {...defaultProps} />);

      expect(screen.getByText('Background')).toBeInTheDocument();
      expect(screen.getByText('Character')).toBeInTheDocument();
      expect(screen.getAllByTestId(/layer-item-/)).toHaveLength(2);
    });

    it('should highlight the selected layer', () => {
      render(<LayersPanel {...defaultProps} />);

      const selectedLayer = screen.getByTestId('layer-item-layer2');
      expect(selectedLayer).toHaveClass('selected');
    });
  });

  describe('Layer Controls', () => {
    it('should render visibility toggle (eye icon) for each layer', () => {
      render(<LayersPanel {...defaultProps} />);

      const visibilityButtons = screen.getAllByTestId(/visibility-toggle-/);
      expect(visibilityButtons).toHaveLength(2);

      // Both layers are visible by default
      expect(visibilityButtons[0]).toHaveTextContent('👁️');
      expect(visibilityButtons[1]).toHaveTextContent('👁️');
    });

    it('should render lock toggle for each layer', () => {
      render(<LayersPanel {...defaultProps} />);

      const lockButtons = screen.getAllByTestId(/lock-toggle-/);
      expect(lockButtons).toHaveLength(2);

      // Both layers are unlocked by default
      expect(lockButtons[0]).toHaveTextContent('🔓');
      expect(lockButtons[1]).toHaveTextContent('🔓');
    });
    it('should render opacity slider for each layer', () => {
      render(<LayersPanel {...defaultProps} />);

      const opacitySliders = screen.getAllByTestId(/opacity-slider-/);
      expect(opacitySliders).toHaveLength(2);

      // Check default opacity values (layers displayed in reverse order)
      // First slider is layer2 (Character, opacity 0.8), second is layer1 (Background, opacity 1.0)
      expect(opacitySliders[0]).toHaveValue('0.8');
      expect(opacitySliders[1]).toHaveValue('1');
    });

    it('should display opacity percentage next to slider', () => {
      render(<LayersPanel {...defaultProps} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  describe('Layer Actions', () => {
    it('should render add layer button', () => {
      render(<LayersPanel {...defaultProps} />);

      const addButton = screen.getByTestId('add-layer-button');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent('+ Add Layer');
    });

    it('should render merge down button when layer is selected', () => {
      render(<LayersPanel {...defaultProps} />);

      const mergeButton = screen.getByTestId('merge-down-button');
      expect(mergeButton).toBeInTheDocument();
      expect(mergeButton).toHaveTextContent('Merge Down');
    });

    it('should disable merge down button for bottom layer', () => {
      const propsWithBottomLayerSelected = {
        ...defaultProps,
        selectedLayerId: 'layer1', // Bottom layer
      };

      render(<LayersPanel {...propsWithBottomLayerSelected} />);

      const mergeButton = screen.getByTestId('merge-down-button');
      expect(mergeButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onLayerSelect when layer is clicked', () => {
      const mockOnLayerSelect = vi.fn();
      const props = { ...defaultProps, onLayerSelect: mockOnLayerSelect };

      render(<LayersPanel {...props} />);

      const layer1 = screen.getByTestId('layer-item-layer1');
      fireEvent.click(layer1);

      expect(mockOnLayerSelect).toHaveBeenCalledWith('layer1');
    });

    it('should call onLayerVisibilityToggle when eye icon is clicked', () => {
      const mockOnVisibilityToggle = vi.fn();
      const props = {
        ...defaultProps,
        onLayerVisibilityToggle: mockOnVisibilityToggle,
      };

      render(<LayersPanel {...props} />);

      const visibilityButton = screen.getByTestId('visibility-toggle-layer1');
      fireEvent.click(visibilityButton);

      expect(mockOnVisibilityToggle).toHaveBeenCalledWith('layer1');
    });

    it('should call onLayerLockToggle when lock icon is clicked', () => {
      const mockOnLockToggle = vi.fn();
      const props = { ...defaultProps, onLayerLockToggle: mockOnLockToggle };

      render(<LayersPanel {...props} />);

      const lockButton = screen.getByTestId('lock-toggle-layer1');
      fireEvent.click(lockButton);

      expect(mockOnLockToggle).toHaveBeenCalledWith('layer1');
    });

    it('should call onLayerOpacityChange when opacity slider changes', () => {
      const mockOnOpacityChange = vi.fn();
      const props = {
        ...defaultProps,
        onLayerOpacityChange: mockOnOpacityChange,
      };

      render(<LayersPanel {...props} />);

      const opacitySlider = screen.getByTestId('opacity-slider-layer1');
      fireEvent.change(opacitySlider, { target: { value: '0.5' } });

      expect(mockOnOpacityChange).toHaveBeenCalledWith('layer1', 0.5);
    });

    it('should call onLayerAdd when add layer button is clicked', () => {
      const mockOnLayerAdd = vi.fn();
      const props = { ...defaultProps, onLayerAdd: mockOnLayerAdd };

      render(<LayersPanel {...props} />);

      const addButton = screen.getByTestId('add-layer-button');
      fireEvent.click(addButton);

      expect(mockOnLayerAdd).toHaveBeenCalled();
    });

    it('should call onLayerMergeDown when merge down button is clicked', () => {
      const mockOnMergeDown = vi.fn();
      const props = { ...defaultProps, onLayerMergeDown: mockOnMergeDown };

      render(<LayersPanel {...props} />);

      const mergeButton = screen.getByTestId('merge-down-button');
      fireEvent.click(mergeButton);

      expect(mockOnMergeDown).toHaveBeenCalledWith('layer2');
    });
  });

  describe('Layer State Display', () => {
    it('should show hidden eye icon for invisible layers', () => {
      const layersWithHidden = [
        { ...mockLayers[0], visible: false },
        mockLayers[1],
      ];
      const props = { ...defaultProps, layers: layersWithHidden };

      render(<LayersPanel {...props} />);

      const visibilityButton = screen.getByTestId('visibility-toggle-layer1');
      expect(visibilityButton).toHaveTextContent('🙈');
    });

    it('should show locked icon for locked layers', () => {
      const layersWithLocked = [
        { ...mockLayers[0], locked: true },
        mockLayers[1],
      ];
      const props = { ...defaultProps, layers: layersWithLocked };

      render(<LayersPanel {...props} />);

      const lockButton = screen.getByTestId('lock-toggle-layer1');
      expect(lockButton).toHaveTextContent('🔒');
    });
  });

  describe('Layer Thumbnail', () => {
    it('should render layer thumbnails', () => {
      render(<LayersPanel {...defaultProps} />);

      const thumbnails = screen.getAllByTestId(/layer-thumbnail-/);
      expect(thumbnails).toHaveLength(2);
    });

    it('should render thumbnail as mini canvas', () => {
      render(<LayersPanel {...defaultProps} />);

      const thumbnail = screen.getByTestId('layer-thumbnail-layer1');
      expect(thumbnail.tagName).toBe('CANVAS');
      expect(thumbnail).toHaveAttribute('width', '32');
      expect(thumbnail).toHaveAttribute('height', '32');
    });
  });

  describe('Plan 14 Integration Tests', () => {
    it('should maintain layer order (top to bottom in UI)', () => {
      render(<LayersPanel {...defaultProps} />);

      const layerItems = screen.getAllByTestId(/layer-item-/);

      // Layers should be rendered in reverse order (top layer first in UI)
      expect(layerItems[0]).toHaveAttribute('data-testid', 'layer-item-layer2');
      expect(layerItems[1]).toHaveAttribute('data-testid', 'layer-item-layer1');
    });

    it('should focus layers panel when L key is pressed', () => {
      render(<LayersPanel {...defaultProps} />);

      const layersPanel = screen.getByTestId('layers-panel');

      // Simulate L key press
      fireEvent.keyDown(document, { key: 'L', code: 'KeyL' });

      expect(layersPanel).toHaveFocus();
    });

    it('should support unlimited layers rendering', () => {
      const manyLayers = Array.from({ length: 20 }, (_, i) => ({
        id: `layer${i + 1}`,
        name: `Layer ${i + 1}`,
        bitmap: new LayerBitmap(16, 16),
        visible: true,
        locked: false,
        opacity: 1.0,
      }));

      const props = { ...defaultProps, layers: manyLayers };
      render(<LayersPanel {...props} />);

      expect(screen.getAllByTestId(/layer-item-/)).toHaveLength(20);
      expect(screen.getByText('Layer 1')).toBeInTheDocument();
      expect(screen.getByText('Layer 20')).toBeInTheDocument();
    });
  });
});
