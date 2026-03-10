import { useMemo, useState } from 'react';
import './styles.css';
import { ActionCards } from './components/ActionCards';
import { BattleGrid } from './components/BattleGrid';
import { DiceTray } from './components/DiceTray';
import { EnemyPanel } from './components/EnemyPanel';
import { FloorMap } from './components/FloorMap';
import { HeroPanel } from './components/HeroPanel';
import { LogPanel } from './components/LogPanel';
import { MerchantScreen } from './components/MerchantScreen';
import { RewardScreen } from './components/RewardScreen';
import { afterCombatVictory, buyItem, eliteRewards, initialGameState, leaveMerchant, resolveReward, startNode } from './app/state';
import {
  canUseSelectedAction,
  endHeroTurn,
  handleEnemyToken,
  rerollForHero,
  rollForHero,
  selectAction,
  toggleDieLock,
  useSelectedAction
} from './game/core/combat';
import type { GridPosition } from './game/core/types';

export default function App() {
  const [state, setState] = useState(initialGameState());

  const encounter = state.encounter;
  const activeHero = encounter?.heroes.find((h) => h.id === encounter.activeHeroId);
  const activeDice = activeHero && encounter ? encounter.dice.diceByHeroId[activeHero.id] : [];

  if (encounter?.currentToken?.kind === 'enemies' && encounter.status === 'ongoing') {
    setTimeout(() => setState((s) => ({ ...s, encounter: s.encounter ? handleEnemyToken(s.encounter) : null })), 200);
  }

  if (encounter?.status === 'victory') {
    setTimeout(() => setState((s) => afterCombatVictory(s)), 50);
  }

  const message = useMemo(() => {
    if (!encounter) return state.message;
    return `Round ${encounter.round} | Corruption ${encounter.corruption.value} (enemy +${encounter.corruption.bonusDamage} dmg, +${encounter.corruption.bonusMove} move)`;
  }, [encounter, state.message]);

  const onTileClick = (pos: GridPosition) => {
    if (!encounter || !activeHero) return;
    const next = useSelectedAction(encounter, undefined, pos);
    if (next !== encounter) setState((s) => ({ ...s, encounter: next }));
  };

  const onEnemyClick = (enemyId: string) => {
    if (!encounter) return;
    const next = useSelectedAction(encounter, enemyId);
    if (next !== encounter) setState((s) => ({ ...s, encounter: next }));
  };

  return (
    <main>
      <h1>Buried Beneath - Floor 1 MVP</h1>
      <p>{message}</p>

      {state.view === 'map' && <FloorMap floor={state.run.floor} onSelect={(nodeId) => setState((s) => startNode(s, nodeId))} />}

      {state.view === 'merchant' && (
        <MerchantScreen
          gold={state.run.gold}
          onBuy={(itemId) => setState((s) => buyItem(s, itemId))}
          onLeave={() => setState((s) => leaveMerchant(s))}
        />
      )}

      {state.view === 'reward' && <RewardScreen options={eliteRewards} onPick={(o) => setState((s) => resolveReward(s, o))} />}

      {state.view === 'runComplete' && <section className="panel"><h2>Run Complete</h2><p>Gold: {state.run.gold}</p></section>}

      {state.view === 'combat' && encounter && (
        <div className="combat-layout">
          <div>
            {encounter.heroes.map((h) => <HeroPanel key={h.id} hero={h} active={encounter.activeHeroId === h.id} />)}
            <EnemyPanel encounter={encounter} />
            <LogPanel log={encounter.log} />
          </div>
          <BattleGrid encounter={encounter} onTileClick={onTileClick} onEnemyClick={onEnemyClick} />
          <div>
            {activeHero && (
              <>
                <DiceTray
                  dice={activeDice ?? []}
                  rerollsLeft={encounter.dice.rerollsLeftByHeroId[activeHero.id]}
                  hasRolled={encounter.dice.rolledThisTurnByHeroId[activeHero.id]}
                  onRoll={() => setState((s) => ({ ...s, encounter: s.encounter ? rollForHero(s.encounter, activeHero.id) : null }))}
                  onReroll={() => setState((s) => ({ ...s, encounter: s.encounter ? rerollForHero(s.encounter, activeHero.id) : null }))}
                  onToggleLock={(dieId) => setState((s) => ({ ...s, encounter: s.encounter ? toggleDieLock(s.encounter, activeHero.id, dieId) : null }))}
                />
                <ActionCards
                  powers={activeHero.powers.map((id) => encounter.powers[id])}
                  items={[...activeHero.items, ...state.run.inventory].map((id) => encounter.items[id]).filter(Boolean)}
                  dice={activeDice ?? []}
                  selectedId={encounter.selectedActionId}
                  onSelect={(kind, id) => setState((s) => ({ ...s, encounter: s.encounter ? selectAction(s.encounter, kind, id) : null }))}
                />
                <button
                  onClick={() => {
                    if (canUseSelectedAction(encounter)) setState((s) => ({ ...s, message: 'Select target tile/enemy to resolve action.' }));
                    else setState((s) => ({ ...s, message: 'Action not affordable with unspent dice.' }));
                  }}
                >Use Selected Action</button>
                <button onClick={() => setState((s) => ({ ...s, encounter: s.encounter ? endHeroTurn(s.encounter) : null }))}>End Hero Turn</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
