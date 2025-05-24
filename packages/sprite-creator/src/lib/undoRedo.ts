/**
 * Command interface for implementing the Command pattern
 * Each command must be able to execute and undo its action
 */
export interface Command {
  execute(): void;
  undo(): void;
}

/**
 * Undo/Redo service implementing command stack pattern
 * Supports 100+ operations with optional stack size limiting
 *
 * Features:
 * - Command execution with automatic undo stack management
 * - Undo/Redo operations with proper state tracking
 * - Stack size limiting to prevent memory issues
 * - Clear methods for resetting state
 */
export class UndoRedoService {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxStackSize: number;

  /**
   * Create a new UndoRedoService
   * @param maxStackSize Maximum number of commands to keep in memory (default: unlimited)
   */
  constructor(maxStackSize: number = Number.MAX_SAFE_INTEGER) {
    this.maxStackSize = maxStackSize;
  }

  /**
   * Execute a command and add it to the undo stack
   * Clears the redo stack since new actions invalidate redo history
   */
  executeCommand(command: Command): void {
    // Execute the command
    command.execute();

    // Add to undo stack
    this.undoStack.push(command);

    // Maintain stack size limit
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift(); // Remove oldest command
    }

    // Clear redo stack - new actions invalidate redo history
    this.redoStack = [];
  }

  /**
   * Undo the last command if available
   * Moves the command from undo stack to redo stack
   */
  undo(): void {
    if (this.undoStack.length === 0) {
      return; // Nothing to undo
    }

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
  }

  /**
   * Redo the last undone command if available
   * Moves the command from redo stack back to undo stack
   */
  redo(): void {
    if (this.redoStack.length === 0) {
      return; // Nothing to redo
    }

    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);
  }

  /**
   * Check if undo operation is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo operation is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get the current size of the undo stack
   */
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Get the current size of the redo stack
   */
  getRedoStackSize(): number {
    return this.redoStack.length;
  }

  /**
   * Clear both undo and redo stacks
   * Useful for resetting state or when starting a new document
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
