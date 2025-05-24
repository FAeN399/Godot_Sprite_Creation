/**
 * Animation model for sprite animation timelines
 * Supports up to 256 frames per animation with per-frame duration (ms)
 * Covers SPR-FR-3: animation timelines
 */

/**
 * Represents a single frame in an animation timeline
 */
export class AnimationFrame {
  private layerRefs: string[];
  private duration: number;

  constructor(layerRefs: string[], duration: number) {
    this.validateLayerRefs(layerRefs);
    this.validateDuration(duration);
    this.layerRefs = [...layerRefs];
    this.duration = duration;
  }

  /**
   * Validates layer reference format (must match pattern: layer[0-9]+)
   */
  private validateLayerRefs(layerRefs: string[]): void {
    const layerRefPattern = /^layer[0-9]+$/;
    for (const ref of layerRefs) {
      if (!layerRefPattern.test(ref)) {
        throw new Error(`Invalid layer reference format: ${ref}`);
      }
    }
  }

  /**
   * Validates duration is positive
   */
  private validateDuration(duration: number): void {
    if (duration <= 0) {
      throw new Error('Duration must be positive');
    }
  }

  /**
   * Gets layer references for this frame
   */
  getLayerRefs(): string[] {
    return [...this.layerRefs];
  }

  /**
   * Sets layer references for this frame
   */
  setLayerRefs(layerRefs: string[]): void {
    this.validateLayerRefs(layerRefs);
    this.layerRefs = [...layerRefs];
  }

  /**
   * Gets frame duration in milliseconds
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * Sets frame duration in milliseconds
   */
  setDuration(duration: number): void {
    this.validateDuration(duration);
    this.duration = duration;
  }

  /**
   * Creates a deep copy of this frame
   */
  clone(): AnimationFrame {
    return new AnimationFrame(this.layerRefs, this.duration);
  }

  /**
   * Exports frame to JSON schema format
   */
  toJSON(): { layerRefs: string[]; duration: number } {
    return {
      layerRefs: [...this.layerRefs],
      duration: this.duration,
    };
  }

  /**
   * Creates frame from JSON schema format
   */
  static fromJSON(json: {
    layerRefs: string[];
    duration: number;
  }): AnimationFrame {
    return new AnimationFrame(json.layerRefs, json.duration);
  }
}

/**
 * Represents a complete animation with multiple frames and timing
 */
export class Animation {
  private name: string;
  private frames: AnimationFrame[];

  constructor(name: string, frames: AnimationFrame[]) {
    this.validateName(name);
    this.validateFrames(frames);
    this.name = name;
    this.frames = frames.map((frame) => frame.clone());
  }

  /**
   * Validates animation name format (alphanumeric, underscore, must start with letter)
   */
  private validateName(name: string): void {
    const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!namePattern.test(name)) {
      throw new Error('Invalid animation name format');
    }
  }

  /**
   * Validates frame array constraints
   */
  private validateFrames(frames: AnimationFrame[]): void {
    if (frames.length === 0) {
      throw new Error('Animation must have at least one frame');
    }
    if (frames.length > 256) {
      throw new Error('Animation cannot have more than 256 frames');
    }
  }

  /**
   * Validates frame index is within bounds
   */
  private validateFrameIndex(index: number): void {
    if (index < 0 || index >= this.frames.length) {
      throw new Error('Frame index out of bounds');
    }
  }

  /**
   * Gets animation name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets all frames in the animation
   */
  getFrames(): AnimationFrame[] {
    return this.frames.map((frame) => frame.clone());
  }

  /**
   * Gets the number of frames in this animation
   */
  getFrameCount(): number {
    return this.frames.length;
  }

  /**
   * Gets total duration of the animation in milliseconds
   */
  getTotalDuration(): number {
    return this.frames.reduce((total, frame) => total + frame.getDuration(), 0);
  }

  /**
   * Gets a specific frame by index
   */
  getFrame(index: number): AnimationFrame {
    this.validateFrameIndex(index);
    return this.frames[index];
  }

  /**
   * Sets a frame at the specified index
   */
  setFrame(index: number, frame: AnimationFrame): void {
    this.validateFrameIndex(index);
    this.frames[index] = frame.clone();
  }

  /**
   * Adds a new frame to the end of the animation
   */
  addFrame(frame: AnimationFrame): void {
    if (this.frames.length >= 256) {
      throw new Error(
        'Cannot add frame: animation already has maximum of 256 frames',
      );
    }
    this.frames.push(frame.clone());
  }

  /**
   * Removes a frame at the specified index
   */
  removeFrame(index: number): void {
    this.validateFrameIndex(index);
    if (this.frames.length === 1) {
      throw new Error('Cannot remove the last frame');
    }
    this.frames.splice(index, 1);
  }

  /**
   * Moves a frame from one position to another
   */
  moveFrame(fromIndex: number, toIndex: number): void {
    this.validateFrameIndex(fromIndex);
    this.validateFrameIndex(toIndex);

    const frame = this.frames.splice(fromIndex, 1)[0];
    this.frames.splice(toIndex, 0, frame);
  }

  /**
   * Creates a deep copy of this animation
   */
  clone(): Animation {
    return new Animation(this.name, this.frames);
  }

  /**
   * Exports animation to JSON schema format
   */
  toJSON(): { frames: Array<{ layerRefs: string[]; duration: number }> } {
    return {
      frames: this.frames.map((frame) => frame.toJSON()),
    };
  }

  /**
   * Creates animation from JSON schema format
   */
  static fromJSON(
    name: string,
    json: { frames: Array<{ layerRefs: string[]; duration: number }> },
  ): Animation {
    const frames = json.frames.map((frameData) =>
      AnimationFrame.fromJSON(frameData),
    );
    return new Animation(name, frames);
  }
}
