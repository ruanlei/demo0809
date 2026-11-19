import { create } from 'zustand';
import { applyAction, initialState, type GameAction, type GameState } from './rules';

type GameStore = GameState & {
  dispatch: (action: GameAction) => void;
};

export const useGame = create<GameStore>((set) => ({
  ...initialState,
  dispatch: (action) => set((state) => applyAction(state, action)),
}));
