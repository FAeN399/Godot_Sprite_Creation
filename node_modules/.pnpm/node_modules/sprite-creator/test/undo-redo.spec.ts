/**
 * Tests for UndoRedoService - command pattern implementation
 * Covers SPR-FR-9: undo/redo with 100+ operations
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { UndoRedoService, Command } from '../src/lib/undoRedo';

interface TestState {
  value: number;
}

class IncrementCommand implements Command {
  private state: TestState;
  private amount: number;

  constructor(state: TestState, amount: number = 1) {
    this.state = state;
    this.amount = amount;
  }

  execute(): void {
    this.state.value += this.amount;
  }

  undo(): void {
    this.state.value -= this.amount;
  }
}

describe('UndoRedoService', () => {
  let service: UndoRedoService;
  let testState: TestState;

  beforeEach(() => {
    service = new UndoRedoService();
    testState = { value: 0 };
  });

  describe('Command Stack Operations', () => {
    it('should execute commands and add to undo stack', () => {
      const cmd1 = new IncrementCommand(testState, 5);
      const cmd2 = new IncrementCommand(testState, 3);

      service.executeCommand(cmd1);
      expect(testState.value).toBe(5);
      expect(service.canUndo()).toBe(true);
      expect(service.canRedo()).toBe(false);

      service.executeCommand(cmd2);
      expect(testState.value).toBe(8);
      expect(service.getUndoStackSize()).toBe(2);
    });

    it('should undo commands correctly', () => {
      const cmd1 = new IncrementCommand(testState, 10);
      const cmd2 = new IncrementCommand(testState, 7);

      service.executeCommand(cmd1);
      service.executeCommand(cmd2);
      expect(testState.value).toBe(17);

      service.undo();
      expect(testState.value).toBe(10);
      expect(service.canUndo()).toBe(true);
      expect(service.canRedo()).toBe(true);

      service.undo();
      expect(testState.value).toBe(0);
      expect(service.canUndo()).toBe(false);
      expect(service.canRedo()).toBe(true);
    });

    it('should redo commands correctly', () => {
      const cmd = new IncrementCommand(testState, 15);

      service.executeCommand(cmd);
      service.undo();
      expect(testState.value).toBe(0);

      service.redo();
      expect(testState.value).toBe(15);
      expect(service.canUndo()).toBe(true);
      expect(service.canRedo()).toBe(false);
    });

    it('should clear redo stack when new command is executed after undo', () => {
      const cmd1 = new IncrementCommand(testState, 5);
      const cmd2 = new IncrementCommand(testState, 3);
      const cmd3 = new IncrementCommand(testState, 2);

      service.executeCommand(cmd1);
      service.executeCommand(cmd2);
      service.undo(); // testState.value = 5, can redo

      expect(service.canRedo()).toBe(true);

      service.executeCommand(cmd3); // Should clear redo stack
      expect(testState.value).toBe(7);
      expect(service.canRedo()).toBe(false);
      expect(service.getUndoStackSize()).toBe(2);
    });
  });

  describe('Large Command Stack (100+ operations)', () => {
    it('should handle 100+ commands efficiently', () => {
      // Execute 150 commands
      for (let i = 1; i <= 150; i++) {
        const cmd = new IncrementCommand(testState, 1);
        service.executeCommand(cmd);
      }

      expect(testState.value).toBe(150);
      expect(service.getUndoStackSize()).toBe(150);
      expect(service.canUndo()).toBe(true);

      // Undo 50 commands
      for (let i = 0; i < 50; i++) {
        service.undo();
      }

      expect(testState.value).toBe(100);
      expect(service.getUndoStackSize()).toBe(100);
      expect(service.getRedoStackSize()).toBe(50);

      // Redo 25 commands
      for (let i = 0; i < 25; i++) {
        service.redo();
      }

      expect(testState.value).toBe(125);
      expect(service.getRedoStackSize()).toBe(25);
    });

    it('should maintain stack size limits if configured', () => {
      const limitedService = new UndoRedoService(50); // Max 50 commands

      // Execute 75 commands
      for (let i = 1; i <= 75; i++) {
        const cmd = new IncrementCommand(testState, 1);
        limitedService.executeCommand(cmd);
      }

      expect(testState.value).toBe(75);
      expect(limitedService.getUndoStackSize()).toBe(50); // Should be capped at 50

      // Undo all 50 commands
      for (let i = 0; i < 50; i++) {
        limitedService.undo();
      }

      expect(testState.value).toBe(25); // 75 - 50 = 25 (lost first 25 commands)
      expect(limitedService.canUndo()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undo when stack is empty', () => {
      expect(service.canUndo()).toBe(false);
      expect(() => service.undo()).not.toThrow();
      expect(testState.value).toBe(0);
    });

    it('should handle redo when stack is empty', () => {
      expect(service.canRedo()).toBe(false);
      expect(() => service.redo()).not.toThrow();
      expect(testState.value).toBe(0);
    });

    it('should clear both stacks', () => {
      const cmd = new IncrementCommand(testState, 5);
      service.executeCommand(cmd);
      service.undo();

      expect(service.canUndo()).toBe(false);
      expect(service.canRedo()).toBe(true);

      service.clear();

      expect(service.canUndo()).toBe(false);
      expect(service.canRedo()).toBe(false);
      expect(service.getUndoStackSize()).toBe(0);
      expect(service.getRedoStackSize()).toBe(0);
    });
  });

  describe('Stack Information', () => {
    it('should provide accurate stack sizes', () => {
      expect(service.getUndoStackSize()).toBe(0);
      expect(service.getRedoStackSize()).toBe(0);

      const cmd1 = new IncrementCommand(testState, 1);
      const cmd2 = new IncrementCommand(testState, 1);

      service.executeCommand(cmd1);
      expect(service.getUndoStackSize()).toBe(1);
      expect(service.getRedoStackSize()).toBe(0);

      service.executeCommand(cmd2);
      expect(service.getUndoStackSize()).toBe(2);

      service.undo();
      expect(service.getUndoStackSize()).toBe(1);
      expect(service.getRedoStackSize()).toBe(1);
    });
  });
});
