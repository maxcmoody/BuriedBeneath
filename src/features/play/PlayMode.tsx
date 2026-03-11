import type { Dispatch, SetStateAction } from 'react';
import type { ContentGroup } from '../../data/schemas/contentSchemas';
import { CONTENT_SCHEMAS } from '../../data/schemas/contentSchemas';
import { drawInitiative, endRound, escalationLabel, refillInitiativeBag, resolveEnemyTurn, rollHeroDice, type AppState, type Position, type TileKind } from '../../lib/state/appState';
import { manhattanDistance } from '../../lib/rules/gameRules';

type Props = {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  onQuickAdjust: (group: ContentGroup, rowIndex: number) => void;
  onLiveReload: () => void;
};

const tiles: TileKind[] = ['empty', 'spawn', 'objective', 'blocked'];

export const PlayMode = ({ state, setState, onQuickAdjust, onLiveReload }: Props) => {
  const encounter = state.encounter;
  const activeHero = encounter.heroes.find((hero) => hero.id === encounter.activeTokenId) ?? encounter.heroes[0];

  const moveToken = (kind: 'hero' | 'enemy', id: string, pos: Position) => {
    setState((prev) => ({
      ...prev,
      encounter: {
        ...prev.encounter,
        heroes: kind === 'hero' ? prev.encounter.heroes.map((hero) => (hero.id === id ? { ...hero, position: pos } : hero)) : prev.encounter.heroes,
        enemies: kind === 'enemy' ? prev.encounter.enemies.map((enemy) => (enemy.id === id ? { ...enemy, position: pos } : enemy)) : prev.encounter.enemies
      }
    }));
  };

  return (
    <div className="layout">
      <section className="panel">
        <h2>Encounter Controls</h2>
        <p>Floor {encounter.floor} Room {encounter.room} | Round {encounter.round}</p>
        <p>Corruption: {encounter.corruption} ({escalationLabel(encounter.corruption)})</p>
        <div className="row">
          <button onClick={() => setState((prev) => ({ ...prev, encounter: refillInitiativeBag(prev.encounter) }))}>Refill Initiative Bag</button>
          <button onClick={() => setState((prev) => ({ ...prev, encounter: drawInitiative(prev.encounter) }))}>Draw Token</button>
          <button onClick={() => setState((prev) => ({ ...prev, encounter: endRound(prev.encounter) }))}>End Round</button>
        </div>
        <div className="row">
          <button onClick={() => onQuickAdjust('playerBoards', 0)}>Quick Adjust Hero</button>
          <button onClick={() => onQuickAdjust('enemies', 0)}>Quick Adjust Enemy</button>
          <button onClick={onLiveReload}>Live Reload Content</button>
        </div>
        <p>Active token: {encounter.activeTokenId ?? 'none'}</p>
        <p>Bag: {encounter.initiativeBag.join(', ') || 'empty'}</p>
      </section>

      <section className="panel grid-panel">
        <h2>Grid Sandbox</h2>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${encounter.gridSize}, 70px)` }}>
          {Array.from({ length: encounter.gridSize * encounter.gridSize }, (_, i) => {
            const x = i % encounter.gridSize;
            const y = Math.floor(i / encounter.gridSize);
            const key = `${x},${y}`;
            const hero = encounter.heroes.find((entry) => entry.position.x === x && entry.position.y === y);
            const enemy = encounter.enemies.find((entry) => entry.position.x === x && entry.position.y === y);
            return (
              <button key={key} className={`tile ${encounter.overlays[key] ?? 'empty'}`} onClick={() => {
                const next = tiles[(tiles.indexOf(encounter.overlays[key] ?? 'empty') + 1) % tiles.length];
                setState((prev) => ({ ...prev, encounter: { ...prev.encounter, overlays: { ...prev.encounter.overlays, [key]: next } } }));
              }}>
                <small>{x},{y}</small>
                {hero && <strong>H:{hero.name}</strong>}
                {enemy && <strong>E:{enemy.nickname}</strong>}
              </button>
            );
          })}
        </div>
        <p>Click tile to cycle overlay type.</p>
      </section>

      <section className="panel">
        <h2>Heroes</h2>
        {encounter.heroes.map((hero, idx) => (
          <article key={hero.id} className="card">
            <h3>{hero.name}</h3>
            <p>HP <input type="number" value={hero.hp} onChange={(e) => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, heroes: prev.encounter.heroes.map((h) => h.id === hero.id ? { ...h, hp: Number(e.target.value) } : h) } }))} /> / {hero.maxHp}</p>
            <p>Shield <input type="number" value={hero.shield} onChange={(e) => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, heroes: prev.encounter.heroes.map((h) => h.id === hero.id ? { ...h, shield: Number(e.target.value) } : h) } }))} /></p>
            <p>Pos x <input type="number" value={hero.position.x} onChange={(e) => moveToken('hero', hero.id, { x: Number(e.target.value), y: hero.position.y })} /> y <input type="number" value={hero.position.y} onChange={(e) => moveToken('hero', hero.id, { x: hero.position.x, y: Number(e.target.value) })} /></p>
            <div className="row">
              <button onClick={() => setState((prev) => ({ ...prev, encounter: rollHeroDice(prev.encounter, hero.id) }))}>Roll</button>
              <button onClick={() => setState((prev) => ({ ...prev, encounter: rollHeroDice(prev.encounter, hero.id, true) }))}>Reroll ({encounter.rerollsLeft[hero.id]})</button>
              <button onClick={() => onQuickAdjust('playerBoards', idx)}>Edit Board</button>
            </div>
            <div className="dice-line">
              {encounter.diceByHero[hero.id].map((die) => (
                <button key={die.id} className={die.locked ? 'locked' : ''} onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, diceByHero: { ...prev.encounter.diceByHero, [hero.id]: prev.encounter.diceByHero[hero.id].map((entry) => entry.id === die.id ? { ...entry, locked: !entry.locked } : entry) } } }))}>{die.face}{die.spent ? '*' : ''}</button>
              ))}
            </div>
            <p>Powers: {hero.powers.join(', ') || 'none'}</p>
            <p>Items: {hero.items.join(', ') || 'none'}</p>
            <div className="row">
              <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, log: [...prev.encounter.log, `${hero.name} Resolve Power: manual helper (damage/shield/heal/move/status).`] } }))}>Resolve Power (manual)</button>
              <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, log: [...prev.encounter.log, `${hero.name} Resolve Item: manual override.`] } }))}>Resolve Item (manual)</button>
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Enemies</h2>
        <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, enemies: prev.encounter.enemies.map((enemy, i) => ({ ...enemy, script: state.content[enemy.kind === 'boss' ? 'bosses' : 'enemies'][i % state.content.enemies.length]?.[`Move${Math.ceil(Math.random() * 4)}`] ?? enemy.script })) } }))}>Roll/Select Behavior</button>
        {encounter.enemies.map((enemy, idx) => (
          <article key={enemy.id} className="card">
            <h3>{enemy.nickname} ({enemy.kind})</h3>
            <p>HP <input type="number" value={enemy.hp} onChange={(e) => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, enemies: prev.encounter.enemies.map((n) => n.id === enemy.id ? { ...n, hp: Number(e.target.value) } : n) } }))} /> / {enemy.maxHp}</p>
            <p>Script: {enemy.script}</p>
            <p>Pos x <input type="number" value={enemy.position.x} onChange={(e) => moveToken('enemy', enemy.id, { x: Number(e.target.value), y: enemy.position.y })} /> y <input type="number" value={enemy.position.y} onChange={(e) => moveToken('enemy', enemy.id, { x: enemy.position.x, y: Number(e.target.value) })} /></p>
            <p>Target distance to {activeHero.name}: {manhattanDistance(enemy.position, activeHero.position)}</p>
            <div className="row">
              <button onClick={() => setState((prev) => ({ ...prev, encounter: resolveEnemyTurn(prev.encounter, enemy.id) }))}>Resolve Enemy Turn</button>
              <button onClick={() => onQuickAdjust(enemy.kind === 'boss' ? 'bosses' : 'enemies', idx)}>Edit</button>
            </div>
          </article>
        ))}
      </section>

      <section className="panel log">
        <h2>Combat Log</h2>
        <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, log: [] } }))}>Clear Log</button>
        {encounter.log.slice(-18).map((line, idx) => <p key={`${line}-${idx}`}>{line}</p>)}
      </section>

      <section className="panel">
        <h2>Data Actions</h2>
        <p>Dirty groups: {Object.entries(state.dirty).filter(([, dirty]) => dirty).map(([group]) => CONTENT_SCHEMAS[group as ContentGroup].label).join(', ') || 'none'}</p>
        <button onClick={() => localStorage.setItem('pyramid-roguelite-save-slot', JSON.stringify(state))}>Save State Slot</button>
        <button onClick={() => {
          const raw = localStorage.getItem('pyramid-roguelite-save-slot');
          if (raw) setState(JSON.parse(raw) as AppState);
        }}>Load State Slot</button>
        <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, corruption: prev.encounter.corruption + 1 } }))}>+ Corruption</button>
        <button onClick={() => setState((prev) => ({ ...prev, encounter: { ...prev.encounter, corruption: Math.max(0, prev.encounter.corruption - 1) } }))}>- Corruption</button>
      </section>
    </div>
  );
};
