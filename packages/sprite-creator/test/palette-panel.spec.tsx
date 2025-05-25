/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PalettePanel,
  PalettePanelProps,
} from '../src/components/PalettePanel';
import { Palette } from '../src/model/Palette';

describe('PalettePanel', () => {
  let defaultProps: PalettePanelProps;
  let testPalette: Palette;

  beforeEach(() => {
    // Create test palette with some colors
    testPalette = new Palette(['#ff0000', '#00ff00', '#0000ff']);

    defaultProps = {
      palette: testPalette,
      selectedColorIndex: 0,
      onColorSelect: vi.fn(),
      onPaletteUpdate: vi.fn(),
      onImportASE: vi.fn(),
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the palette panel with title', () => {
      render(<PalettePanel {...defaultProps} />);
      expect(screen.getByText('Palette')).toBeInTheDocument();
    });

    it('renders control buttons', () => {
      render(<PalettePanel {...defaultProps} />);
      expect(screen.getByText('Import ASE')).toBeInTheDocument();
      expect(screen.getByText('Add Color')).toBeInTheDocument();
    });

    it('displays color count correctly', () => {
      render(<PalettePanel {...defaultProps} />);
      expect(screen.getByText('3/256 colors')).toBeInTheDocument();
    });

    it('renders 256 color swatches', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');
      expect(swatches).toHaveLength(256);
    });

    it('displays colors correctly in swatches', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      // First three swatches should have the colors from our palette
      expect(swatches[0]).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(swatches[1]).toHaveStyle('background-color: rgb(0, 255, 0)');
      expect(swatches[2]).toHaveStyle('background-color: rgb(0, 0, 255)');

      // Fourth swatch should be empty - browser interprets transparent as rgba(0,0,0,0)
      const computedStyle = window.getComputedStyle(swatches[3]);
      expect(computedStyle.backgroundColor).toMatch(
        /transparent|rgba\(0,\s*0,\s*0,\s*0\)/,
      );
    });
  });

  describe('Color Selection', () => {
    it('highlights selected color', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={1} />);
      const swatches = document.querySelectorAll('.color-swatch');
      expect(swatches[1]).toHaveClass('selected');
      expect(swatches[0]).not.toHaveClass('selected');
    });

    it('calls onColorSelect when clicking a color swatch', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      fireEvent.click(swatches[1]);
      expect(defaultProps.onColorSelect).toHaveBeenCalledWith(1);
    });

    it('does not call onColorSelect when clicking empty swatch', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      // Click an empty swatch (index 10)
      fireEvent.click(swatches[10]);
      expect(defaultProps.onColorSelect).not.toHaveBeenCalled();
    });

    it('displays selected color info', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={0} />);
      expect(
        screen.getByText('Selected: Color 0 - #ff0000'),
      ).toBeInTheDocument();
    });

    it('hides selected color info when no selection', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={null} />);
      expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
    });
  });

  describe('Adding Colors', () => {
    it('calls onPaletteUpdate when adding a color', () => {
      render(<PalettePanel {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Color'));

      expect(defaultProps.onPaletteUpdate).toHaveBeenCalled();
      expect(defaultProps.onColorSelect).toHaveBeenCalledWith(3); // New color at end
    });

    it('adds white color by default', () => {
      render(<PalettePanel {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Color'));

      const call = (defaultProps.onPaletteUpdate as any).mock.calls[0][0];
      const newColors = call.getColors();
      expect(newColors).toHaveLength(4);
      expect(newColors[3]).toBe('#ffffff');
    });

    it('disables add button when palette is full', () => {
      // Create a full palette (256 colors)
      const fullColors = Array.from(
        { length: 256 },
        (_, i) => `#${i.toString(16).padStart(6, '0')}`,
      );
      const fullPalette = new Palette(fullColors);

      render(<PalettePanel {...defaultProps} palette={fullPalette} />);

      const addButton = screen.getByText('Add Color');
      expect(addButton).toBeDisabled();
    });
  });

  describe('Removing Colors', () => {
    it('shows remove button only for selected color', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={0} />);

      const removeButtons = document.querySelectorAll('.remove-color-btn');
      expect(removeButtons).toHaveLength(1);
    });

    it('calls onPaletteUpdate when removing a color', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={0} />);

      const removeButton = document.querySelector(
        '.remove-color-btn',
      ) as HTMLElement;
      fireEvent.click(removeButton);

      expect(defaultProps.onPaletteUpdate).toHaveBeenCalled();
      const call = (defaultProps.onPaletteUpdate as any).mock.calls[0][0];
      const newColors = call.getColors();
      expect(newColors).toHaveLength(2);
      expect(newColors).toEqual(['#00ff00', '#0000ff']);
    });

    it('adjusts selection when removing selected color', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={1} />);

      const removeButton = document.querySelector(
        '.remove-color-btn',
      ) as HTMLElement;
      fireEvent.click(removeButton);

      expect(defaultProps.onColorSelect).toHaveBeenCalledWith(1); // Adjusted to new length - 1
    });

    it('adjusts selection when removing color before selected', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={2} />);

      // Click on first color to select it, then remove it
      const firstSwatch = document.querySelectorAll('.color-swatch')[0];
      fireEvent.click(firstSwatch);

      // Now render with first color selected and remove it
      const props = { ...defaultProps, selectedColorIndex: 0 };
      render(<PalettePanel {...props} />);

      const removeButton = document.querySelector(
        '.remove-color-btn',
      ) as HTMLElement;
      fireEvent.click(removeButton);

      expect(props.onColorSelect).toHaveBeenCalled();
    });
  });

  describe('Color Editing', () => {
    it('opens color picker on double-click', () => {
      // Test the double-click behavior by checking if the onPaletteUpdate would be called
      // when simulating the color input change flow
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      // Mock createElement just for this test in an isolated way
      const originalCreateElement = document.createElement;
      const mockInput = {
        type: '',
        value: '',
        click: vi.fn(),
        onchange: null as (() => void) | null,
      };

      document.createElement = vi.fn((tagName) => {
        if (tagName === 'input') return mockInput as any;
        return originalCreateElement.call(document, tagName);
      });

      try {
        fireEvent.doubleClick(swatches[0]);

        expect(mockInput.type).toBe('color');
        expect(mockInput.value).toBe('#ff0000');
        expect(mockInput.click).toHaveBeenCalled();
      } finally {
        document.createElement = originalCreateElement;
      }
    });

    it('updates palette when color is changed', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      const originalCreateElement = document.createElement;
      const mockInput = {
        type: '',
        value: '#ff0000',
        click: vi.fn(),
        onchange: null as (() => void) | null,
      };

      document.createElement = vi.fn((tagName) => {
        if (tagName === 'input') return mockInput as any;
        return originalCreateElement.call(document, tagName);
      });

      try {
        fireEvent.doubleClick(swatches[0]);

        // Simulate color change
        mockInput.value = '#ffff00';
        mockInput.onchange?.();

        expect(defaultProps.onPaletteUpdate).toHaveBeenCalled();
      } finally {
        document.createElement = originalCreateElement;
      }
    });
  });

  describe('ASE Import', () => {
    it('renders hidden file input', () => {
      render(<PalettePanel {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.style.display).toBe('none');
    });

    it('opens file dialog when clicking Import ASE button', () => {
      render(<PalettePanel {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.click(screen.getByText('Import ASE'));

      expect(clickSpy).toHaveBeenCalled();
    });
    it('handles successful ASE import', async () => {
      const mockImportedPalette = new Palette(['#123456', '#789abc']);
      const fromASESpy = vi
        .spyOn(Palette, 'fromASE')
        .mockResolvedValue(mockImportedPalette);

      render(<PalettePanel {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const mockFile = new File(['mock content'], 'test.ase', {
        type: 'application/octet-stream',
      });
      // Add arrayBuffer method to mock file
      mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(defaultProps.onPaletteUpdate).toHaveBeenCalledWith(
          mockImportedPalette,
        );
        expect(defaultProps.onImportASE).toHaveBeenCalledWith(mockFile);
      });

      fromASESpy.mockRestore();
    });

    it('handles ASE import error gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const fromASESpy = vi
        .spyOn(Palette, 'fromASE')
        .mockRejectedValue(new Error('Invalid ASE file'));

      render(<PalettePanel {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const mockFile = new File(['invalid content'], 'test.ase', {
        type: 'application/octet-stream',
      });
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to import ASE file:',
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
      fromASESpy.mockRestore();
    });
    it('resets file input after import', async () => {
      const mockImportedPalette = new Palette(['#123456']);
      const fromASESpy = vi
        .spyOn(Palette, 'fromASE')
        .mockResolvedValue(mockImportedPalette);

      render(<PalettePanel {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const mockFile = new File(['mock content'], 'test.ase', {
        type: 'application/octet-stream',
      });
      // Add arrayBuffer method to mock file
      mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });

      fromASESpy.mockRestore();
    });
  });

  describe('Drag and Drop', () => {
    it('sets draggable attribute only for colors', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      // First 3 should be draggable (have colors)
      expect(swatches[0]).toHaveAttribute('draggable', 'true');
      expect(swatches[1]).toHaveAttribute('draggable', 'true');
      expect(swatches[2]).toHaveAttribute('draggable', 'true');
      // Empty slots should not be draggable
      expect(swatches[3]).toHaveAttribute('draggable', 'false');
    });

    it('handles drag start correctly', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatch = document.querySelectorAll('.color-swatch')[0];

      let effectAllowed = '';
      const mockDataTransfer = {
        get effectAllowed() {
          return effectAllowed;
        },
        set effectAllowed(value) {
          effectAllowed = value;
        },
        setData: vi.fn(),
      };
      const dragEvent = new Event('dragstart') as any;
      dragEvent.dataTransfer = mockDataTransfer;

      // Use fireEvent.dragStart which properly triggers the React event handler
      fireEvent.dragStart(swatch, { dataTransfer: mockDataTransfer });

      expect(mockDataTransfer.effectAllowed).toBe('move');
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');
    });

    it('reorders colors on successful drop', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      // Create a more complete mock DataTransfer
      let storedData: { [key: string]: string } = {};
      let effectAllowed = '';
      const mockDataTransfer = {
        get effectAllowed() {
          return effectAllowed;
        },
        set effectAllowed(value) {
          effectAllowed = value;
        },
        setData: vi.fn((type, data) => {
          storedData[type] = data;
        }),
        getData: vi.fn((type) => storedData[type] || ''),
        dropEffect: '',
      };
      // Start drag on first swatch
      fireEvent.dragStart(swatches[0], { dataTransfer: mockDataTransfer });

      // Drop on third swatch
      fireEvent.drop(swatches[2], { dataTransfer: mockDataTransfer });

      expect(defaultProps.onPaletteUpdate).toHaveBeenCalled();
      const call = (defaultProps.onPaletteUpdate as any).mock.calls[0][0];
      const newColors = call.getColors();
      expect(newColors).toEqual(['#00ff00', '#0000ff', '#ff0000']);
    });
  });

  describe('Empty Palette', () => {
    it('handles empty palette correctly', () => {
      const emptyPalette = new Palette([]);
      render(<PalettePanel {...defaultProps} palette={emptyPalette} />);

      expect(screen.getByText('0/256 colors')).toBeInTheDocument();

      const swatches = document.querySelectorAll('.color-swatch');
      // Check that all swatches are transparent/empty
      swatches.forEach((swatch) => {
        const computedStyle = window.getComputedStyle(swatch);
        expect(computedStyle.backgroundColor).toMatch(
          /transparent|rgba\(0,\s*0,\s*0,\s*0\)/,
        );
      });
    });

    it('can add colors to empty palette', () => {
      const emptyPalette = new Palette([]);
      render(<PalettePanel {...defaultProps} palette={emptyPalette} />);

      fireEvent.click(screen.getByText('Add Color'));

      expect(defaultProps.onPaletteUpdate).toHaveBeenCalled();
      expect(defaultProps.onColorSelect).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('provides proper tooltips for color swatches', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      expect(swatches[0]).toHaveAttribute('title', 'Color 0: #ff0000');
      expect(swatches[1]).toHaveAttribute('title', 'Color 1: #00ff00');
      expect(swatches[3]).toHaveAttribute('title', 'Empty slot 3');
    });

    it('provides proper tooltips for control buttons', () => {
      render(<PalettePanel {...defaultProps} />);

      expect(screen.getByTitle('Import ASE file')).toBeInTheDocument();
      expect(screen.getByTitle('Add new color')).toBeInTheDocument();
    });

    it('provides tooltip for remove button', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={0} />);

      expect(screen.getByTitle('Remove color')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid file selection', () => {
      render(<PalettePanel {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      // Simulate no file selected
      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(defaultProps.onPaletteUpdate).not.toHaveBeenCalled();
    });

    it('handles double-click on empty swatch gracefully', () => {
      render(<PalettePanel {...defaultProps} />);
      const swatches = document.querySelectorAll('.color-swatch');

      // Double-click on empty swatch (index 10)
      fireEvent.doubleClick(swatches[10]);

      // Should not crash or call any callbacks
      expect(defaultProps.onPaletteUpdate).not.toHaveBeenCalled();
    });

    it('prevents event bubbling on remove button click', () => {
      render(<PalettePanel {...defaultProps} selectedColorIndex={0} />);

      const removeButton = document.querySelector(
        '.remove-color-btn',
      ) as HTMLElement;
      const stopPropagationSpy = vi.fn();

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'stopPropagation', {
        value: stopPropagationSpy,
        writable: false,
      });

      fireEvent(removeButton, clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });
});
