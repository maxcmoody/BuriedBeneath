import type { EncounterState } from '../game/core/types';

export function EnemyPanel({ encounter }: { encounter: EncounterState }) {
  return (
    <section className="panel">
      <h3>Enemies</h3>
      {encounter.enemies.filter((e) => !e.defeated).map((e) => {
        const def = encounter.enemyDefinitions[e.definitionId];
        const intent = def.scripts.find((s) => s.id === e.selectedScriptId)?.name;
        return <div key={e.id}><strong>{def.name}</strong> HP:{e.hp} Shield:{e.shield} Intent:{intent}</div>;
      })}
    </section>
  );
}
