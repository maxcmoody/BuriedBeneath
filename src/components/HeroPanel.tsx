import type { HeroState } from '../game/core/types';

export function HeroPanel({ hero, active }: { hero: HeroState; active: boolean }) {
  return (
    <section className={`panel ${active ? 'active' : ''}`}>
      <h3>{hero.name}</h3>
      <p>HP: {hero.hp}/{hero.maxHp} | Shield: {hero.shield}</p>
      <p>Pos: ({hero.position.x},{hero.position.y})</p>
    </section>
  );
}
