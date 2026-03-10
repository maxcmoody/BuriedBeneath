import { canAfford } from '../game/core/dice';
import type { Die, ItemCard, PowerCard } from '../game/core/types';

interface Props {
  powers: PowerCard[];
  items: ItemCard[];
  dice: Die[];
  selectedId: string | null;
  onSelect: (kind: 'power' | 'item', id: string) => void;
}

const costLabel = (cost: Record<string, number>) => Object.entries(cost).map(([f, n]) => `${f}:${n}`).join(' ');

export function ActionCards({ powers, items, dice, selectedId, onSelect }: Props) {
  return (
    <section className="panel">
      <h3>Powers</h3>
      <div className="cards">
        {powers.map((p) => (
          <button key={p.id} disabled={!canAfford(dice, p.cost)} className={selectedId === p.id ? 'selected' : ''} onClick={() => onSelect('power', p.id)}>
            <strong>{p.name}</strong>
            <div>{p.description}</div>
            <small>Cost: {costLabel(p.cost)}</small>
          </button>
        ))}
      </div>
      <h3>Items</h3>
      <div className="cards">
        {items.map((i) => (
          <button key={i.id} disabled={!canAfford(dice, i.cost)} className={selectedId === i.id ? 'selected' : ''} onClick={() => onSelect('item', i.id)}>
            <strong>{i.name}</strong>
            <div>{i.description}</div>
            <small>Cost: {costLabel(i.cost)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
