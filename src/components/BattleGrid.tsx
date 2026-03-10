import type { EncounterState, GridPosition } from '../game/core/types';

interface Props {
  encounter: EncounterState;
  onTileClick: (pos: GridPosition) => void;
  onEnemyClick: (enemyId: string) => void;
}

export function BattleGrid({ encounter, onTileClick, onEnemyClick }: Props) {
  const preview = new Set(encounter.movePreview.map((p) => `${p.x},${p.y}`));
  const heroAt = (x: number, y: number) => encounter.heroes.find((h) => !h.defeated && h.position.x === x && h.position.y === y);
  const enemyAt = (x: number, y: number) => encounter.enemies.find((e) => !e.defeated && e.position.x === x && e.position.y === y);

  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${encounter.width}, 52px)` }}>
      {Array.from({ length: encounter.height }).flatMap((_, y) =>
        Array.from({ length: encounter.width }).map((__, x) => {
          const hero = heroAt(x, y);
          const enemy = enemyAt(x, y);
          const key = `${x},${y}`;
          return (
            <button
              key={key}
              className={`tile ${preview.has(key) ? 'preview' : ''}`}
              onClick={() => {
                if (enemy) onEnemyClick(enemy.id);
                else onTileClick({ x, y });
              }}
            >
              {hero ? `🟢 ${hero.name[0]}` : enemy ? `🔴 ${enemy.id.split('_')[0][0].toUpperCase()}` : ''}
            </button>
          );
        })
      )}
    </div>
  );
}
