import type { Dispatch, SetStateAction } from 'react';
import { createEncounter, type AppState } from '../../lib/state/appState';

type Props = { state: AppState; setState: Dispatch<SetStateAction<AppState>> };

export const RunMode = ({ state, setState }: Props) => {
  const floors = [1, 2, 3];
  const encounters = [1, 2, 3];

  return (
    <div className="layout">
      <section className="panel">
        <h2>Run / Floor Prototype</h2>
        <p>Current floor: {state.run.floor} room: {state.run.room}</p>
        <div className="row">
          {floors.map((floor) => <button key={floor} onClick={() => setState((prev) => ({ ...prev, run: { ...prev.run, floor } }))}>Go Floor {floor}</button>)}
        </div>
        <h3>Encounters</h3>
        <div className="row">
          {encounters.map((room) => (
            <button key={room} onClick={() => setState((prev) => ({
              ...prev,
              run: { ...prev.run, room, selectedEncounter: room },
              encounter: createEncounter(prev.content, prev.run.floor, room),
              mode: 'play'
            }))}>Start Encounter {room}</button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Between Encounter Rest</h3>
        <button onClick={() => setState((prev) => ({ ...prev, run: { ...prev.run, restNote: 'Healed 3' }, encounter: { ...prev.encounter, heroes: prev.encounter.heroes.map((hero) => ({ ...hero, hp: Math.min(hero.maxHp, hero.hp + 3) })) } }))}>Heal 3</button>
        <button onClick={() => setState((prev) => ({ ...prev, run: { ...prev.run, restNote: 'Removed curse + healed 3' }, encounter: { ...prev.encounter, heroes: prev.encounter.heroes.map((hero) => ({ ...hero, hp: Math.min(hero.maxHp, hero.hp + 3) })) } }))}>Remove Curse + Heal 3</button>
        <p>{state.run.restNote}</p>
      </section>

      <section className="panel">
        <h3>End-of-floor Rewards</h3>
        <button onClick={() => setState((prev) => ({ ...prev, run: { ...prev.run, powersGained: [...prev.run.powersGained, 'New Power Slot'] } }))}>Add/Upgrade Power</button>
        <button onClick={() => setState((prev) => ({ ...prev, run: { ...prev.run, itemsGained: [...prev.run.itemsGained, 'Prototype Item'] } }))}>Add Item</button>
        <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, heroes: prev.encounter.heroes.map((hero) => ({ ...hero, hp: Math.min(hero.maxHp, hero.hp + 3) })) } }))}>Floor Heal 3</button>
        <p>Powers gained: {state.run.powersGained.join(', ') || 'none'}</p>
        <p>Items gained: {state.run.itemsGained.join(', ') || 'none'}</p>
      </section>
    </div>
  );
};
