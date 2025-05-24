/**
 * Tests for Animation model - timeline frames and durations
 * Covers SPR-FR-3: animation timelines up to 256 frames per animation
 */
import { describe, it, expect } from 'vitest';
import { Animation, AnimationFrame } from '../src/model/Animation';

describe('AnimationFrame', () => {
  it('should create frame with layer references and duration', () => {
    const frame = new AnimationFrame(['layer1', 'layer2'], 100);
    expect(frame.getLayerRefs()).toEqual(['layer1', 'layer2']);
    expect(frame.getDuration()).toBe(100);
  });

  it('should validate layer reference format', () => {
    expect(() => new AnimationFrame(['layer1'], 100)).not.toThrow();
    expect(() => new AnimationFrame(['layer123'], 100)).not.toThrow();
    expect(() => new AnimationFrame(['invalidlayer'], 100)).toThrow(
      'Invalid layer reference format: invalidlayer',
    );
    expect(() => new AnimationFrame(['layer'], 100)).toThrow(
      'Invalid layer reference format: layer',
    );
    expect(() => new AnimationFrame(['layer1a'], 100)).toThrow(
      'Invalid layer reference format: layer1a',
    );
  });

  it('should require positive duration', () => {
    expect(() => new AnimationFrame(['layer1'], 0)).toThrow(
      'Duration must be positive',
    );
    expect(() => new AnimationFrame(['layer1'], -1)).toThrow(
      'Duration must be positive',
    );
    expect(() => new AnimationFrame(['layer1'], 1)).not.toThrow();
  });

  it('should allow empty layer references', () => {
    const frame = new AnimationFrame([], 100);
    expect(frame.getLayerRefs()).toEqual([]);
  });

  it('should update layer references', () => {
    const frame = new AnimationFrame(['layer1'], 100);
    frame.setLayerRefs(['layer2', 'layer3']);
    expect(frame.getLayerRefs()).toEqual(['layer2', 'layer3']);
  });

  it('should update duration', () => {
    const frame = new AnimationFrame(['layer1'], 100);
    frame.setDuration(200);
    expect(frame.getDuration()).toBe(200);
    expect(() => frame.setDuration(0)).toThrow('Duration must be positive');
  });

  it('should clone frame correctly', () => {
    const original = new AnimationFrame(['layer1', 'layer2'], 150);
    const clone = original.clone();

    expect(clone.getLayerRefs()).toEqual(original.getLayerRefs());
    expect(clone.getDuration()).toBe(original.getDuration());

    // Verify independence
    clone.setDuration(300);
    expect(original.getDuration()).toBe(150);
    expect(clone.getDuration()).toBe(300);
  });
});

describe('Animation', () => {
  it('should create animation with name and frames', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
    ];
    const animation = new Animation('walk', frames);

    expect(animation.getName()).toBe('walk');
    expect(animation.getFrames()).toEqual(frames);
    expect(animation.getFrameCount()).toBe(2);
  });

  it('should validate animation name format', () => {
    const frame = new AnimationFrame(['layer1'], 100);

    expect(() => new Animation('walk', [frame])).not.toThrow();
    expect(() => new Animation('run_fast', [frame])).not.toThrow();
    expect(() => new Animation('idle123', [frame])).not.toThrow();
    expect(() => new Animation('Attack_01', [frame])).not.toThrow();

    expect(() => new Animation('', [frame])).toThrow(
      'Invalid animation name format',
    );
    expect(() => new Animation('123walk', [frame])).toThrow(
      'Invalid animation name format',
    );
    expect(() => new Animation('walk-fast', [frame])).toThrow(
      'Invalid animation name format',
    );
    expect(() => new Animation('walk fast', [frame])).toThrow(
      'Invalid animation name format',
    );
  });

  it('should require at least one frame', () => {
    expect(() => new Animation('walk', [])).toThrow(
      'Animation must have at least one frame',
    );
  });

  it('should enforce maximum 256 frames', () => {
    const frames = Array.from(
      { length: 256 },
      (_, i) => new AnimationFrame([`layer${i + 1}`], 100),
    );
    expect(() => new Animation('long', frames)).not.toThrow();

    const tooManyFrames = Array.from(
      { length: 257 },
      (_, i) => new AnimationFrame([`layer${i + 1}`], 100),
    );
    expect(() => new Animation('tooLong', tooManyFrames)).toThrow(
      'Animation cannot have more than 256 frames',
    );
  });

  it('should calculate total duration correctly', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
      new AnimationFrame(['layer3'], 500),
    ];
    const animation = new Animation('test', frames);
    expect(animation.getTotalDuration()).toBe(800);
  });

  it('should add frames to animation', () => {
    const animation = new Animation('test', [
      new AnimationFrame(['layer1'], 100),
    ]);

    animation.addFrame(new AnimationFrame(['layer2'], 200));
    expect(animation.getFrameCount()).toBe(2);
    expect(animation.getTotalDuration()).toBe(300);

    // Test max frames limit
    const frames = Array.from(
      { length: 254 },
      () => new AnimationFrame(['layer1'], 50),
    );
    frames.forEach((frame) => animation.addFrame(frame));
    expect(animation.getFrameCount()).toBe(256);

    expect(() =>
      animation.addFrame(new AnimationFrame(['layer1'], 50)),
    ).toThrow('Cannot add frame: animation already has maximum of 256 frames');
  });

  it('should remove frames by index', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
      new AnimationFrame(['layer3'], 300),
    ];
    const animation = new Animation('test', frames);

    animation.removeFrame(1);
    expect(animation.getFrameCount()).toBe(2);
    expect(animation.getFrame(0).getDuration()).toBe(100);
    expect(animation.getFrame(1).getDuration()).toBe(300);

    expect(() => animation.removeFrame(5)).toThrow('Frame index out of bounds');
    expect(() => animation.removeFrame(-1)).toThrow(
      'Frame index out of bounds',
    );
  });

  it('should not allow removing the last frame', () => {
    const animation = new Animation('test', [
      new AnimationFrame(['layer1'], 100),
    ]);
    expect(() => animation.removeFrame(0)).toThrow(
      'Cannot remove the last frame',
    );
  });
  it('should get frame by index', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
    ];
    const animation = new Animation('test', frames);

    expect(animation.getFrame(0)).toStrictEqual(frames[0]);
    expect(animation.getFrame(1)).toStrictEqual(frames[1]);
    expect(() => animation.getFrame(2)).toThrow('Frame index out of bounds');
    expect(() => animation.getFrame(-1)).toThrow('Frame index out of bounds');
  });
  it('should set frame at index', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
    ];
    const animation = new Animation('test', frames);

    const newFrame = new AnimationFrame(['layer3'], 300);
    animation.setFrame(1, newFrame);

    expect(animation.getFrame(1)).toStrictEqual(newFrame);
    expect(animation.getTotalDuration()).toBe(400);

    expect(() => animation.setFrame(2, newFrame)).toThrow(
      'Frame index out of bounds',
    );
  });
  it('should reorder frames', () => {
    const frame1 = new AnimationFrame(['layer1'], 100);
    const frame2 = new AnimationFrame(['layer2'], 200);
    const frame3 = new AnimationFrame(['layer3'], 300);
    const animation = new Animation('test', [frame1, frame2, frame3]);

    animation.moveFrame(0, 2); // Move first frame to last position

    expect(animation.getFrame(0)).toStrictEqual(frame2);
    expect(animation.getFrame(1)).toStrictEqual(frame3);
    expect(animation.getFrame(2)).toStrictEqual(frame1);
  });

  it('should validate frame reorder indices', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
    ];
    const animation = new Animation('test', frames);

    expect(() => animation.moveFrame(-1, 1)).toThrow(
      'Frame index out of bounds',
    );
    expect(() => animation.moveFrame(1, 2)).toThrow(
      'Frame index out of bounds',
    );
    expect(() => animation.moveFrame(0, -1)).toThrow(
      'Frame index out of bounds',
    );
  });

  it('should create animation with 8 frames and 800ms total duration', () => {
    // This is the specific test case mentioned in the prompt plan
    const frames = Array.from(
      { length: 8 },
      (_, i) => new AnimationFrame([`layer${i + 1}`], 100),
    );
    const animation = new Animation('testAnimation', frames);

    expect(animation.getFrameCount()).toBe(8);
    expect(animation.getTotalDuration()).toBe(800);
    expect(animation.getName()).toBe('testAnimation');
  });

  it('should clone animation correctly', () => {
    const frames = [
      new AnimationFrame(['layer1'], 100),
      new AnimationFrame(['layer2'], 200),
    ];
    const original = new Animation('original', frames);
    const clone = original.clone();

    expect(clone.getName()).toBe(original.getName());
    expect(clone.getFrameCount()).toBe(original.getFrameCount());
    expect(clone.getTotalDuration()).toBe(original.getTotalDuration());

    // Verify deep independence
    clone.getFrame(0).setDuration(500);
    expect(original.getFrame(0).getDuration()).toBe(100);
    expect(clone.getFrame(0).getDuration()).toBe(500);
  });

  it('should export to JSON schema format', () => {
    const frames = [
      new AnimationFrame(['layer1', 'layer2'], 100),
      new AnimationFrame(['layer3'], 200),
    ];
    const animation = new Animation('walk', frames);
    const json = animation.toJSON();

    expect(json).toEqual({
      frames: [
        { layerRefs: ['layer1', 'layer2'], duration: 100 },
        { layerRefs: ['layer3'], duration: 200 },
      ],
    });
  });

  it('should create from JSON schema format', () => {
    const json = {
      frames: [
        { layerRefs: ['layer1', 'layer2'], duration: 100 },
        { layerRefs: ['layer3'], duration: 200 },
      ],
    };

    const animation = Animation.fromJSON('walk', json);

    expect(animation.getName()).toBe('walk');
    expect(animation.getFrameCount()).toBe(2);
    expect(animation.getFrame(0).getLayerRefs()).toEqual(['layer1', 'layer2']);
    expect(animation.getFrame(0).getDuration()).toBe(100);
    expect(animation.getFrame(1).getLayerRefs()).toEqual(['layer3']);
    expect(animation.getFrame(1).getDuration()).toBe(200);
  });
});
