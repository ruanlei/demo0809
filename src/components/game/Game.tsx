'use client';

import dynamic from 'next/dynamic';
import { useGame } from '../../lib/game/store';
import type { GameEvent } from '../../lib/game/rules';

const GameScene = dynamic(() => import('./GameScene'), {
  ssr: false,
  loading: () => <p className="scene-note">Loading the room…</p>,
});

const messages: Record<GameEvent, string> = {
  keyCollected: 'You picked up the brass key.',
  keyAlreadyCollected: 'The key is already in your inventory.',
  doorBlocked: 'The door is locked. Find the key first.',
  doorOpened: 'The door is open. You solved the puzzle!',
  doorAlreadyOpen: 'The door is already open.',
  dialogueOpened: 'The caretaker greets you.',
  dialogueClosed: 'You end the conversation.',
};

export default function Game() {
  const { inventory, door, dialogue, lastEvent, dispatch } = useGame();

  return (
    <main>
      <header>
        <h1>The Lantern Room</h1>
        <p>Find the brass key and open the door.</p>
      </header>
      <div className="game">
        <section aria-label="3D room" className="room">
          <GameScene />
          <p className="hint">Drag to orbit · Scroll or pinch to zoom · Click objects to interact</p>
        </section>
        <section aria-label="Game controls" className="controls">
          <dl>
            <div><dt>Inventory</dt><dd>{inventory === 'key' ? 'Brass key' : 'Empty'}</dd></div>
            <div><dt>Door</dt><dd>{door === 'open' ? 'Open' : 'Locked'}</dd></div>
          </dl>
          <div className="actions">
            <button disabled={inventory === 'key'} onClick={() => dispatch('collectKey')}>Collect key</button>
            <button onClick={() => dispatch('interactWithNpc')}>Talk to caretaker</button>
            <button onClick={() => dispatch('tryOpenDoor')}>Try door</button>
          </div>
          <p role="status">{lastEvent ? messages[lastEvent] : 'The caretaker is waiting inside.'}</p>
          {dialogue === 'open' && (
            <section aria-label="Caretaker dialogue" className="dialogue">
              <h2>Caretaker</h2>
              <p>{inventory === 'key' ? 'That brass key fits the door.' : 'Look for the brass key on the pedestal.'}</p>
              <button onClick={() => dispatch('closeDialogue')}>Close dialogue</button>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
