export type GameAction =
  | 'collectKey'
  | 'interactWithNpc'
  | 'tryOpenDoor'
  | 'closeDialogue';

export type GameEvent =
  | 'keyCollected'
  | 'keyAlreadyCollected'
  | 'doorBlocked'
  | 'doorOpened'
  | 'doorAlreadyOpen'
  | 'dialogueOpened'
  | 'dialogueClosed';

export type GameState = {
  inventory: 'empty' | 'key';
  door: 'locked' | 'open';
  dialogue: 'closed' | 'open';
  lastEvent: GameEvent | null;
};

export const initialState: GameState = {
  inventory: 'empty',
  door: 'locked',
  dialogue: 'closed',
  lastEvent: null,
};

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action) {
    case 'collectKey':
      if (state.inventory === 'key') {
        return { ...state, lastEvent: 'keyAlreadyCollected' };
      }
      return { ...state, inventory: 'key', lastEvent: 'keyCollected' };
    case 'interactWithNpc':
      return { ...state, dialogue: 'open', lastEvent: 'dialogueOpened' };
    case 'closeDialogue':
      return { ...state, dialogue: 'closed', lastEvent: 'dialogueClosed' };
    case 'tryOpenDoor':
      if (state.inventory === 'empty') {
        return { ...state, lastEvent: 'doorBlocked' };
      }
      if (state.door === 'open') {
        return { ...state, lastEvent: 'doorAlreadyOpen' };
      }
      return { ...state, door: 'open', lastEvent: 'doorOpened' };
  }
}
