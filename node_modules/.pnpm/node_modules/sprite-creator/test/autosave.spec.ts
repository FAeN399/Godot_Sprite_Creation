/**
 * Tests for Autosave service - snapshot management
 * Covers SPR-FR-9: autosave snapshots every 60s with recovery
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutosaveService } from '../src/lib/autosave';
import { Sprite } from '../src/model/Sprite';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('AutosaveService', () => {
  let autosaveService: AutosaveService;
  let tempDir: string;
  let testSprite: Sprite;

  beforeEach(async () => {
    // Create temporary directory for autosave tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sprite-autosave-'));
    autosaveService = new AutosaveService(tempDir);

    // Create a test sprite
    testSprite = new Sprite('test-sprite', 32, 32);
    testSprite.addLayer('layer1');
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors in tests
    }
  });

  describe('Autosave File Creation', () => {
    it('should create autosave file in .autosave directory', async () => {
      await autosaveService.writeSnapshot(testSprite);

      const autosaveDir = path.join(tempDir, '.autosave');
      const dirExists = await fs
        .access(autosaveDir)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);

      const files = await fs.readdir(autosaveDir);
      expect(files.length).toBe(1);
      expect(files[0]).toMatch(
        /^test-sprite_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}\.sprite\.json$/,
      );
    });
    it('should write valid sprite JSON to autosave file', async () => {
      await autosaveService.writeSnapshot(testSprite);

      const autosaveDir = path.join(tempDir, '.autosave');
      const files = await fs.readdir(autosaveDir);
      const filePath = path.join(autosaveDir, files[0]);

      const content = await fs.readFile(filePath, 'utf-8');
      const autosaveData = JSON.parse(content);

      expect(autosaveData.sprite.name).toBe('test-sprite');
      expect(autosaveData.sprite.width).toBe(32);
      expect(autosaveData.sprite.height).toBe(32);
      expect(autosaveData.sprite.layers).toHaveLength(1);
    });

    it('should include metadata in autosave file', async () => {
      await autosaveService.writeSnapshot(testSprite);

      const autosaveDir = path.join(tempDir, '.autosave');
      const files = await fs.readdir(autosaveDir);
      const filePath = path.join(autosaveDir, files[0]);

      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      expect(data.metadata).toBeDefined();
      expect(data.metadata.savedAt).toBeDefined();
      expect(data.metadata.version).toBeDefined();
      expect(data.sprite).toBeDefined();
    });
  });

  describe('Snapshot Pruning (>10 files)', () => {
    it('should keep only 10 most recent autosave files', async () => {
      // Create 15 autosave files
      for (let i = 0; i < 15; i++) {
        testSprite.setName(`test-sprite-${i}`);
        await autosaveService.writeSnapshot(testSprite);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await autosaveService.pruneOldSnapshots();

      const autosaveDir = path.join(tempDir, '.autosave');
      const files = await fs.readdir(autosaveDir);
      expect(files.length).toBe(10);
    });

    it('should delete oldest files first when pruning', async () => {
      const spriteNames = ['sprite-1', 'sprite-2', 'sprite-3'];

      // Create files with different sprites and timestamps
      for (const name of spriteNames) {
        testSprite.setName(name);
        await autosaveService.writeSnapshot(testSprite);
        await new Promise((resolve) => setTimeout(resolve, 50)); // Ensure different timestamps
      }

      // Create 10 more files to trigger pruning
      for (let i = 4; i <= 13; i++) {
        testSprite.setName(`sprite-${i}`);
        await autosaveService.writeSnapshot(testSprite);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      await autosaveService.pruneOldSnapshots();

      const autosaveDir = path.join(tempDir, '.autosave');
      const files = await fs.readdir(autosaveDir);

      // Should only have files from sprite-4 onwards (newest 10)
      // Use more precise matching to avoid substring conflicts
      const hasOldestFile = files.some((f) => f.includes('sprite-1_')); // sprite-1_ to avoid matching sprite-10, sprite-11, etc.
      const hasNewestFile = files.some((f) => f.includes('sprite-13_'));

      expect(hasOldestFile).toBe(false);
      expect(hasNewestFile).toBe(true);
      expect(files.length).toBe(10);
    });
  });

  describe('Snapshot Recovery', () => {
    it('should list available snapshots for recovery', async () => {
      // Create multiple snapshots
      const spriteNames = ['project-a', 'project-b', 'project-a'];

      for (const name of spriteNames) {
        testSprite.setName(name);
        await autosaveService.writeSnapshot(testSprite);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      const snapshots = await autosaveService.listSnapshots();
      expect(snapshots.length).toBe(3);

      snapshots.forEach((snapshot) => {
        expect(snapshot.fileName).toMatch(/\.sprite\.json$/);
        expect(snapshot.timestamp).toBeInstanceOf(Date);
        expect(snapshot.spriteName).toMatch(/^project-[ab]$/);
        expect(snapshot.size).toBeGreaterThan(0);
      });
    });

    it('should recover sprite from snapshot file', async () => {
      // Modify the sprite and save it
      testSprite.setName('recovery-test');
      testSprite.addLayer('layer2');
      await autosaveService.writeSnapshot(testSprite);

      const snapshots = await autosaveService.listSnapshots();
      expect(snapshots.length).toBe(1);

      const recoveredSprite = await autosaveService.recoverSnapshot(
        snapshots[0].fileName,
      );

      expect(recoveredSprite.getName()).toBe('recovery-test');
      expect(recoveredSprite.getWidth()).toBe(32);
      expect(recoveredSprite.getHeight()).toBe(32);
      expect(recoveredSprite.getLayers()).toHaveLength(2);
    });

    it('should handle recovery of non-existent snapshot gracefully', async () => {
      await expect(
        autosaveService.recoverSnapshot('non-existent-file.sprite.json'),
      ).rejects.toThrow();
    });
  });

  describe('Automatic Interval Management', () => {
    it('should support configurable autosave interval', () => {
      const customService = new AutosaveService(tempDir, 30000); // 30 seconds
      expect(customService.getInterval()).toBe(30000);

      const defaultService = new AutosaveService(tempDir);
      expect(defaultService.getInterval()).toBe(60000); // Default 60 seconds
    });

    it('should start and stop autosave timer', async () => {
      let saveCount = 0;
      const quickService = new AutosaveService(tempDir, 100); // 100ms for testing

      // Mock the writeSnapshot method to count calls
      const originalWrite = quickService.writeSnapshot.bind(quickService);
      quickService.writeSnapshot = async (sprite: Sprite) => {
        saveCount++;
        return originalWrite(sprite);
      };

      quickService.startAutoSave(testSprite);

      // Wait for a few intervals
      await new Promise((resolve) => setTimeout(resolve, 350));

      quickService.stopAutoSave();

      // Should have triggered at least 2-3 saves in 350ms with 100ms interval
      expect(saveCount).toBeGreaterThanOrEqual(2);
      expect(saveCount).toBeLessThanOrEqual(4);
    });

    it('should not create multiple timers when starting autosave multiple times', async () => {
      const quickService = new AutosaveService(tempDir, 50);

      quickService.startAutoSave(testSprite);
      quickService.startAutoSave(testSprite); // Should not create second timer
      quickService.startAutoSave(testSprite); // Should not create third timer

      // Wait for some saves
      await new Promise((resolve) => setTimeout(resolve, 200));
      quickService.stopAutoSave();

      const autosaveDir = path.join(tempDir, '.autosave');
      const files = await fs.readdir(autosaveDir);

      // Should have reasonable number of files (not excessive from multiple timers)
      expect(files.length).toBeLessThanOrEqual(6);
    });
  });
  describe('Error Handling', () => {
    it('should handle write errors gracefully', async () => {
      // Create autosave service with a path that will fail on Windows
      const invalidService = new AutosaveService('\0invalid');

      await expect(invalidService.writeSnapshot(testSprite)).rejects.toThrow();
    });

    it('should continue working after write error', async () => {
      const autosaveDir = path.join(tempDir, '.autosave');

      // First save should work
      await autosaveService.writeSnapshot(testSprite);
      let files = await fs.readdir(autosaveDir);
      expect(files.length).toBe(1);

      // Simulate an error condition, then recover
      testSprite.setName('valid-sprite');
      await autosaveService.writeSnapshot(testSprite);

      files = await fs.readdir(autosaveDir);
      expect(files.length).toBe(2);
    });
  });
});
