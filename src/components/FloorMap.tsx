import type { FloorState } from '../game/core/types';

export function FloorMap({ floor, onSelect }: { floor: FloorState; onSelect: (nodeId: string) => void }) {
  return (
    <section className="panel">
      <h2>Floor 1 Route</h2>
      <div className="row">
        {floor.nodes.map((n) => (
          <button key={n.id} disabled={!n.unlocked || n.completed || n.type === 'start'} onClick={() => onSelect(n.id)}>
            {n.label} {n.completed ? '✓' : ''}
          </button>
        ))}
      </div>
    </section>
  );
}
