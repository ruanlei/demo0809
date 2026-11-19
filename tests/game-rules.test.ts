import { describe, expect, it } from 'vitest';
import { applyAction, initialState } from '../src/lib/game/rules';

describe('puzzle rules', () => {
  it('denies entry without a key and preserves puzzle state', () => {
    expect(applyAction(initialState, 'tryOpenDoor')).toEqual({
      ...initialState,
      lastEvent: 'doorBlocked',
    });
  });

  it('collects the key exactly once', () => {
    const collected = applyAction(initialState, 'collectKey');
    expect(collected).toEqual({ ...initialState, inventory: 'key', lastEvent: 'keyCollected' });
    expect(applyAction(collected, 'collectKey')).toEqual({
      ...collected,
      lastEvent: 'keyAlreadyCollected',
    });
  });

  it('opens and closes dialogue independently of the puzzle', () => {
    const talking = applyAction(initialState, 'interactWithNpc');
    expect(talking).toEqual({ ...initialState, dialogue: 'open', lastEvent: 'dialogueOpened' });
    expect(applyAction(talking, 'closeDialogue')).toEqual({
      ...initialState,
      lastEvent: 'dialogueClosed',
    });
  });

  it('opens the door with the key and keeps it open', () => {
    const collected = applyAction(initialState, 'collectKey');
    const opened = applyAction(collected, 'tryOpenDoor');
    expect(opened).toEqual({ ...collected, door: 'open', lastEvent: 'doorOpened' });
    expect(applyAction(opened, 'tryOpenDoor')).toEqual({
      ...opened,
      lastEvent: 'doorAlreadyOpen',
    });
  });
});
