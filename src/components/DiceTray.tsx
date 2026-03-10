import type { Die } from '../game/core/types';

interface Props {
  dice: Die[];
  rerollsLeft: number;
  onRoll: () => void;
  onReroll: () => void;
  onToggleLock: (dieId: string) => void;
  hasRolled: boolean;
}

const icons: Record<string, string> = { sword: '⚔', shield: '🛡', star: '⭐', skull: '☠', arrow: '🏹', light: '✨' };

export function DiceTray({ dice, rerollsLeft, onRoll, onReroll, onToggleLock, hasRolled }: Props) {
  return (
    <section className="panel">
      <h3>Dice Tray</h3>
      <button onClick={onRoll} disabled={hasRolled}>Roll 5 Dice</button>
      <button onClick={onReroll} disabled={!hasRolled || rerollsLeft <= 0}>Reroll ({rerollsLeft})</button>
      <div className="row">
        {dice.map((die) => (
          <button key={die.id} className={`die ${die.locked ? 'locked' : ''} ${die.spent ? 'spent' : ''}`} onClick={() => onToggleLock(die.id)}>
            <div>{die.face ? icons[die.face] : '•'}</div>
            <small>{die.type}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
