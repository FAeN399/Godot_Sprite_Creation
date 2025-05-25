import React, { useEffect, useRef } from 'react';
import { LayerBitmap } from '../model/LayerBitmap';

/**
 * Layer definition interface for the LayersPanel component
 */
export interface Layer {
  id: string;
  name: string;
  bitmap: LayerBitmap;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

/**
 * Props for the LayersPanel component
 */
export interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerRename: (layerId: string, newName: string) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onLayerMergeDown: (layerId: string) => void;
}

/**
 * LayersPanel - Plan 14: Layer management UI component
 *
 * Features:
 * - Layer list with thumbnails
 * - Visibility toggle (eye icon)
 * - Lock toggle (lock icon)
 * - Opacity slider with percentage display
 * - Add layer button
 * - Merge down functionality
 * - Layer selection and focus with 'L' hotkey
 * - Support for unlimited layers
 */
export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerAdd,
  onLayerDelete: _onLayerDelete,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerOpacityChange,
  onLayerRename: _onLayerRename,
  onLayerReorder: _onLayerReorder,
  onLayerMergeDown,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle L key focus hotkey
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'L' || event.key === 'l') {
        if (panelRef.current) {
          panelRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Renders a thumbnail for a layer's bitmap
   */
  const renderLayerThumbnail = (layer: Layer) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, 32, 32);

      // Draw checkerboard background
      const checkerSize = 4;
      for (let y = 0; y < 32; y += checkerSize) {
        for (let x = 0; x < 32; x += checkerSize) {
          const isEven =
            (Math.floor(x / checkerSize) + Math.floor(y / checkerSize)) % 2 ===
            0;
          ctx.fillStyle = isEven ? '#f0f0f0' : '#e0e0e0';
          ctx.fillRect(x, y, checkerSize, checkerSize);
        }
      }

      // Draw layer bitmap scaled down
      const scaleX = 32 / layer.bitmap.getWidth();
      const scaleY = 32 / layer.bitmap.getHeight();

      for (let y = 0; y < layer.bitmap.getHeight(); y++) {
        for (let x = 0; x < layer.bitmap.getWidth(); x++) {
          const color = layer.bitmap.getPixel(x, y);
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(
              Math.floor(x * scaleX),
              Math.floor(y * scaleY),
              Math.ceil(scaleX),
              Math.ceil(scaleY),
            );
          }
        }
      }
    }, [layer.bitmap]);

    return (
      <canvas
        ref={canvasRef}
        width={32}
        height={32}
        data-testid={`layer-thumbnail-${layer.id}`}
        style={{
          border: '1px solid #ccc',
          borderRadius: '2px',
          imageRendering: 'pixelated',
        }}
      />
    );
  };

  /**
   * Gets the layer index in the array
   */
  const getLayerIndex = (layerId: string): number => {
    return layers.findIndex((layer) => layer.id === layerId);
  };

  /**
   * Checks if layer can be merged down (not the bottom layer)
   */
  const canMergeDown = (layerId: string): boolean => {
    const index = getLayerIndex(layerId);
    return index > 0; // Can merge if not at bottom (index 0)
  };

  // Reverse layers for display (top layer first in UI)
  const displayLayers = [...layers].reverse();

  return (
    <div
      ref={panelRef}
      data-testid="layers-panel"
      tabIndex={0}
      style={{
        width: '250px',
        height: '400px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        overflow: 'auto',
      }}
    >
      {/* Panel Header */}
      <div
        style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}
      >
        Layers
      </div>

      {/* Add Layer Button */}
      <button
        data-testid="add-layer-button"
        onClick={onLayerAdd}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          border: '1px solid #4caf50',
          borderRadius: '3px',
          backgroundColor: '#e8f5e8',
          color: '#2e7d32',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        + Add Layer
      </button>

      {/* Layers List */}
      <div style={{ marginBottom: '10px' }}>
        {displayLayers.map((layer) => (
          <div
            key={layer.id}
            data-testid={`layer-item-${layer.id}`}
            onClick={() => onLayerSelect(layer.id)}
            className={selectedLayerId === layer.id ? 'selected' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              marginBottom: '4px',
              border:
                selectedLayerId === layer.id
                  ? '2px solid #2196f3'
                  : '1px solid #ddd',
              borderRadius: '3px',
              backgroundColor:
                selectedLayerId === layer.id ? '#e3f2fd' : '#fff',
              cursor: 'pointer',
              gap: '8px',
            }}
          >
            {/* Layer Thumbnail */}
            <div style={{ flexShrink: 0 }}>{renderLayerThumbnail(layer)}</div>

            {/* Layer Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Layer Name */}
              <div
                style={{
                  fontWeight: selectedLayerId === layer.id ? 'bold' : 'normal',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {layer.name}
              </div>

              {/* Controls Row */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {/* Visibility Toggle */}
                <button
                  data-testid={`visibility-toggle-${layer.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle(layer.id);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px',
                  }}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? '👁️' : '🙈'}
                </button>

                {/* Lock Toggle */}
                <button
                  data-testid={`lock-toggle-${layer.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerLockToggle(layer.id);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px',
                  }}
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>

                {/* Opacity Slider */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1,
                  }}
                >
                  <input
                    type="range"
                    data-testid={`opacity-slider-${layer.id}`}
                    min="0"
                    max="1"
                    step="0.01"
                    value={layer.opacity}
                    onChange={(e) => {
                      e.stopPropagation();
                      onLayerOpacityChange(
                        layer.id,
                        parseFloat(e.target.value),
                      );
                    }}
                    style={{
                      flex: 1,
                      height: '4px',
                      cursor: 'pointer',
                    }}
                    title="Layer opacity"
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      minWidth: '30px',
                      textAlign: 'right',
                    }}
                  >
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {selectedLayerId && (
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          <button
            data-testid="merge-down-button"
            onClick={() => onLayerMergeDown(selectedLayerId)}
            disabled={!canMergeDown(selectedLayerId)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ff9800',
              borderRadius: '3px',
              backgroundColor: canMergeDown(selectedLayerId)
                ? '#fff3e0'
                : '#f5f5f5',
              color: canMergeDown(selectedLayerId) ? '#f57c00' : '#999',
              cursor: canMergeDown(selectedLayerId) ? 'pointer' : 'not-allowed',
              fontSize: '12px',
            }}
          >
            Merge Down
          </button>{' '}
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
