import type { RewardOption } from '../game/core/types';

export function RewardScreen({ options, onPick }: { options: RewardOption[]; onPick: (o: RewardOption) => void }) {
  return (
    <section className="panel">
      <h2>Elite Reward</h2>
      {options.map((o) => (
        <button key={o.id} onClick={() => onPick(o)}>
          <strong>{o.label}</strong>
          <div>{o.description}</div>
        </button>
      ))}
    </section>
  );
}
