/**
import { promises as fs } from 'fs';
import * as path from 'path';
import { Sprite } from '../model/Sprite.js';Autosave service for creating periodic snapshots of sprite data
 * Supports automatic saving every 60 seconds with file management
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import { Sprite } from '../model/Sprite';

/**
 * Metadata stored with each autosave snapshot
 */
interface AutosaveMetadata {
  savedAt: string;
  version: string;
  originalFileName?: string;
}

/**
 * Information about an available snapshot for recovery
 */
export interface SnapshotInfo {
  fileName: string;
  timestamp: Date;
  spriteName: string;
  size: number;
}

/**
 * Complete autosave file structure
 */
interface AutosaveData {
  metadata: AutosaveMetadata;
  sprite: Record<string, unknown>; // Serialized sprite data
}

/**
 * Autosave service implementing periodic snapshot creation
 * Features:
 * - Automatic saving at configurable intervals (default 60s)
 * - File pruning to keep only 10 most recent snapshots
 * - Recovery functionality with snapshot listing
 * - Error handling for write failures
 */
export class AutosaveService {
  private baseDir: string;
  private autosaveDir: string;
  private interval: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private maxSnapshots: number = 10;

  /**
   * Create a new AutosaveService
   * @param baseDir Base directory for autosave files (will create .autosave subdirectory)
   * @param intervalMs Autosave interval in milliseconds (default: 60000 = 60 seconds)
   */
  constructor(baseDir: string, intervalMs: number = 60000) {
    this.baseDir = baseDir;
    this.autosaveDir = path.join(baseDir, '.autosave');
    this.interval = intervalMs;
  }

  /**
   * Get the current autosave interval
   */
  getInterval(): number {
    return this.interval;
  }
  /**
   * Write a snapshot of the sprite to disk
   * Creates timestamped file in .autosave directory
   */
  async writeSnapshot(sprite: Sprite): Promise<void> {
    try {
      // Ensure autosave directory exists
      await fs.mkdir(this.autosaveDir, { recursive: true }); // Generate timestamp for filename (YYYY-MM-DD_HH-MM-SS-mmm format with milliseconds)
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .replace(/\./g, '-')
        .slice(0, 23) // Include milliseconds
        .replace(/-Z$/, ''); // Remove trailing Z
      const fileName = `${sprite.getName()}_${timestamp}.sprite.json`;
      const filePath = path.join(this.autosaveDir, fileName);

      // Prepare autosave data with metadata
      const autosaveData: AutosaveData = {
        metadata: {
          savedAt: now.toISOString(),
          version: '1.0.0',
          originalFileName: sprite.getName(),
        },
        sprite: JSON.parse(sprite.toJSON()), // Parse the JSON string to get the object
      }; // Write the file
      await fs.writeFile(
        filePath,
        JSON.stringify(autosaveData, null, 2),
        'utf-8',
      );
    } catch (error) {
      throw new Error(`Failed to write autosave snapshot: ${error}`);
    }
  }

  /**
   * Prune old snapshots to keep only the most recent ones
   * Keeps maxSnapshots (default 10) most recent files
   */
  async pruneOldSnapshots(): Promise<void> {
    try {
      const files = await fs.readdir(this.autosaveDir);
      const snapshotFiles = files.filter((f) => f.endsWith('.sprite.json'));

      if (snapshotFiles.length <= this.maxSnapshots) {
        return; // No pruning needed
      }

      // Get file stats for sorting by modification time
      const fileStats = await Promise.all(
        snapshotFiles.map(async (fileName) => {
          const filePath = path.join(this.autosaveDir, fileName);
          const stats = await fs.stat(filePath);
          return { fileName, mtime: stats.mtime };
        }),
      );

      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete the oldest files
      const filesToDelete = fileStats.slice(this.maxSnapshots);
      for (const fileInfo of filesToDelete) {
        const filePath = path.join(this.autosaveDir, fileInfo.fileName);
        await fs.unlink(filePath);
      }
    } catch (error) {
      // Don't throw on pruning errors - autosave should continue working
      console.warn(`Failed to prune old snapshots: ${error}`);
    }
  }

  /**
   * List available snapshots for recovery
   * Returns snapshot information sorted by timestamp (newest first)
   */
  async listSnapshots(): Promise<SnapshotInfo[]> {
    try {
      await fs.access(this.autosaveDir);
    } catch {
      return []; // No autosave directory exists
    }

    const files = await fs.readdir(this.autosaveDir);
    const snapshotFiles = files.filter((f) => f.endsWith('.sprite.json'));

    const snapshots = await Promise.all(
      snapshotFiles.map(async (fileName) => {
        const filePath = path.join(this.autosaveDir, fileName);
        const stats = await fs.stat(filePath);

        // Extract sprite name from filename (before the timestamp)
        const spriteName = fileName.split('_')[0];

        return {
          fileName,
          timestamp: stats.mtime,
          spriteName,
          size: stats.size,
        };
      }),
    );

    // Sort by timestamp (newest first)
    return snapshots.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }
  /**
   * Recover a sprite from a snapshot file
   * @param fileName Name of the snapshot file to recover
   * @returns Sprite instance created from the snapshot
   */
  async recoverSnapshot(fileName: string): Promise<Sprite> {
    const filePath = path.join(this.autosaveDir, fileName);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const autosaveData: AutosaveData = JSON.parse(content);

      // Create sprite from saved data
      return Sprite.fromJSON(JSON.stringify(autosaveData.sprite));
    } catch (error) {
      throw new Error(`Failed to recover snapshot ${fileName}: ${error}`);
    }
  }

  /**
   * Start automatic saving at the configured interval
   * @param sprite Sprite to save automatically
   */
  startAutoSave(sprite: Sprite): void {
    // Stop any existing timer to prevent multiple timers
    this.stopAutoSave();

    this.timer = setInterval(async () => {
      try {
        await this.writeSnapshot(sprite);
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, this.interval);
  }

  /**
   * Stop automatic saving
   */
  stopAutoSave(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Check if autosave is currently running
   */
  isAutoSaveActive(): boolean {
    return this.timer !== null;
  }
}
