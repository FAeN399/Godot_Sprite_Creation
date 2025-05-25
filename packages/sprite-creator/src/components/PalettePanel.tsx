import React, { useCallback, useRef, useState } from 'react';
import { Palette } from '../model/Palette';

/* eslint-disable no-undef */

/**
 * Props for the PalettePanel component
 */
export interface PalettePanelProps {
  palette: Palette;
  selectedColorIndex: number | null;
  onColorSelect: (colorIndex: number) => void;
  onPaletteUpdate: (palette: Palette) => void;
  onImportASE?: (file: File) => void;
}

/**
 * PalettePanel - Plan 15: Palette management UI component with swatches and ASE import
 *
 * Features:
 * - 256-color indexed palette display as swatches
 * - Click swatch to change active color
 * - Import .ase files to populate palette
 * - Drag-drop reorder functionality
 * - Color picker for editing individual colors
 * - Add/remove colors from palette
 */
export const PalettePanel: React.FC<PalettePanelProps> = ({
  palette,
  selectedColorIndex,
  onColorSelect,
  onPaletteUpdate,
  onImportASE,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get the current colors array from palette
  const colors = palette.getColors();

  /**
   * Handle color swatch click to select color
   */
  const handleColorClick = useCallback(
    (index: number) => {
      if (index < colors.length) {
        onColorSelect(index);
      }
    },
    [colors.length, onColorSelect],
  );

  /**
   * Handle ASE file import
   */
  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const importedPalette = await Palette.fromASE(arrayBuffer);
        onPaletteUpdate(importedPalette);

        if (onImportASE) {
          onImportASE(file);
        }
      } catch (error) {
        console.error('Failed to import ASE file:', error);
        // TODO: Show user-friendly error message
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onPaletteUpdate, onImportASE],
  );

  /**
   * Trigger file import dialog
   */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle drag start for color reordering
   */
  const handleDragStart = useCallback(
    (event: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    },
    [],
  );

  /**
   * Handle drag over for color reordering
   */
  const handleDragOver = useCallback(
    (event: React.DragEvent, index: number) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    },
    [],
  );

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  /**
   * Handle drop for color reordering
   */
  const handleDrop = useCallback(
    (event: React.DragEvent, toIndex: number) => {
      event.preventDefault();

      if (draggedIndex === null || draggedIndex === toIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // Create new color array with reordered colors
      const newColors = [...colors];
      const [movedColor] = newColors.splice(draggedIndex, 1);
      newColors.splice(toIndex, 0, movedColor);

      // Create new palette with reordered colors
      const newPalette = new Palette(newColors);
      onPaletteUpdate(newPalette);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, colors, onPaletteUpdate],
  );

  /**
   * Handle color editing (double-click to edit)
   */
  const handleColorEdit = useCallback(
    (index: number) => {
      const color = colors[index];
      if (!color) return;

      // Create color input element for color picker
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = color;

      colorInput.onchange = () => {
        const newColors = [...colors];
        newColors[index] = colorInput.value;

        // Create new palette with updated color
        const newPalette = new Palette(newColors);
        onPaletteUpdate(newPalette);
      };

      colorInput.click();
    },
    [colors, onPaletteUpdate],
  );

  /**
   * Add a new color to the palette
   */
  const handleAddColor = useCallback(() => {
    if (colors.length >= 256) {
      console.warn('Cannot add color: palette already contains 256 colors');
      return;
    }

    const newColor = '#ffffff'; // Default to white
    const newPalette = new Palette([...colors, newColor]);
    onPaletteUpdate(newPalette);
    onColorSelect(colors.length); // Select the newly added color
  }, [colors, onPaletteUpdate, onColorSelect]);

  /**
   * Remove a color from the palette
   */
  const handleRemoveColor = useCallback(
    (index: number, event: React.MouseEvent) => {
      event.stopPropagation();

      const newColors = colors.filter((_, i) => i !== index);
      const newPalette = new Palette(newColors);
      onPaletteUpdate(newPalette);

      // If removed color was selected, clear selection or adjust
      if (selectedColorIndex === index) {
        onColorSelect(
          newColors.length > 0 ? Math.min(index, newColors.length - 1) : -1,
        );
      } else if (selectedColorIndex !== null && selectedColorIndex > index) {
        onColorSelect(selectedColorIndex - 1);
      }
    },
    [colors, onPaletteUpdate, selectedColorIndex, onColorSelect],
  );

  /**
   * Render a color swatch
   */
  const renderColorSwatch = (colorHex: string | null, index: number) => {
    const isSelected = selectedColorIndex === index;
    const isDragging = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    return (
      <div
        key={index}
        className={`color-swatch ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
        style={{
          backgroundColor: colorHex || 'transparent',
          border: colorHex ? '2px solid #666' : '1px dashed #999',
          borderColor: isSelected ? '#007acc' : colorHex ? '#666' : '#999',
          width: '20px',
          height: '20px',
          cursor: colorHex ? 'pointer' : 'default',
          position: 'relative',
          opacity: isDragging ? 0.5 : 1,
          borderRadius: '2px',
        }}
        draggable={!!colorHex}
        onClick={() => colorHex && handleColorClick(index)}
        onDoubleClick={() => colorHex && handleColorEdit(index)}
        onDragStart={(e) => colorHex && handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        title={colorHex ? `Color ${index}: ${colorHex}` : `Empty slot ${index}`}
      >
        {colorHex && isSelected && (
          <button
            className="remove-color-btn"
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#ff4444',
              color: 'white',
              fontSize: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1',
            }}
            onClick={(e) => handleRemoveColor(index, e)}
            title="Remove color"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Create array of 256 slots, filling with colors or null for empty slots
  const paletteSlots = Array.from({ length: 256 }, (_, index) =>
    index < colors.length ? colors[index] : null,
  );

  return (
    <div
      className="palette-panel"
      style={{ padding: '10px', border: '1px solid #ccc' }}
    >
      <div className="palette-header" style={{ marginBottom: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Palette</h3>

        <div
          className="palette-controls"
          style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
        >
          <button onClick={handleImportClick} title="Import ASE file">
            Import ASE
          </button>
          <button
            onClick={handleAddColor}
            disabled={colors.length >= 256}
            title="Add new color"
          >
            Add Color
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {colors.length}/256 colors
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".ase"
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />
      </div>

      <div
        className="palette-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(16, 1fr)',
          gap: '2px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {paletteSlots.map((colorHex, index) =>
          renderColorSwatch(colorHex, index),
        )}
      </div>
      {selectedColorIndex !== null &&
        selectedColorIndex >= 0 &&
        selectedColorIndex < colors.length && (
          <div
            className="selected-color-info"
            style={{ marginTop: '10px', fontSize: '12px' }}
          >
            Selected: Color {selectedColorIndex} - {colors[selectedColorIndex]}
          </div>
        )}
    </div>
  );
};
