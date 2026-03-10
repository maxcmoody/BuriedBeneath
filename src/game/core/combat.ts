import { enemyDefinitions } from '../content/enemies';
import { heroDefinitions } from '../content/heroes';
import { itemCards } from '../content/items';
import { powerCards } from '../content/powers';
import { CORRUPTION_THRESHOLDS, GRID_HEIGHT, GRID_WIDTH } from './constants';
import { canAfford, initializeDiceState, resetHeroDiceTurn, rollHeroDice, spendDice, toggleLock } from './dice';
import { resolveEnemyTurn, rollEnemyIntents } from './enemyAI';
import { buildInitiativeBag } from './initiative';
import { manhattanDistance, reachableTiles } from './movement';
import type { EncounterState, EnemyState, GridPosition, HeroState, TokenType } from './types';

const createBaseHeroes = (): HeroState[] => {
  const archer = heroDefinitions.archer;
  const paladin = heroDefinitions.paladin;
  return [
    {
      id: archer.id,
      name: archer.name,
      hp: archer.maxHp,
      maxHp: archer.maxHp,
      shield: 0,
      position: { x: 1, y: 4 },
      powers: archer.powers,
      items: [archer.startingItem],
      defeated: false
    },
    {
      id: paladin.id,
      name: paladin.name,
      hp: paladin.maxHp,
      maxHp: paladin.maxHp,
      shield: 0,
      position: { x: 2, y: 4 },
      powers: paladin.powers,
      items: [paladin.startingItem],
      defeated: false
    }
  ];
};

const enemyId = (base: string, i: number) => `${base}_${i + 1}`;

const createEncounterEnemies = (encounterId: string): EnemyState[] => {
  if (encounterId === 'combat_1') {
    return [0, 1, 2].map((i) => ({
      id: enemyId('scavenger', i),
      definitionId: 'scavenger',
      hp: enemyDefinitions.scavenger.maxHp,
      shield: 0,
      position: { x: 3 + (i % 2), y: 1 + Math.floor(i / 2) },
      selectedScriptId: enemyDefinitions.scavenger.scripts[0].id,
      defeated: false
    }));
  }
  return [
    {
      id: 'bone_warden_1',
      definitionId: 'bone_warden',
      hp: enemyDefinitions.bone_warden.maxHp,
      shield: 0,
      position: { x: 3, y: 1 },
      selectedScriptId: enemyDefinitions.bone_warden.scripts[0].id,
      defeated: false
    }
  ];
};

const drawToken = (bag: TokenType[]): { token: TokenType | null; bag: TokenType[] } => {
  if (!bag.length) return { token: null, bag: [] };
  const [token, ...rest] = bag;
  return { token, bag: rest };
};

const applyCorruption = (encounter: EncounterState): EncounterState => {
  let bonusDamage = 0;
  let bonusMove = 0;
  for (const threshold of CORRUPTION_THRESHOLDS) {
    if (encounter.corruption.value >= threshold.at) {
      bonusDamage = threshold.bonusDamage;
      bonusMove = threshold.bonusMove;
    }
  }
  return { ...encounter, corruption: { ...encounter.corruption, bonusDamage, bonusMove } };
};

export const createEncounter = (encounterId: string, runHeroes?: HeroState[]): EncounterState => {
  const heroes = (runHeroes ?? createBaseHeroes()).map((h) => ({ ...h }));
  const enemies = createEncounterEnemies(encounterId);
  const dice = initializeDiceState(
    heroes,
    Object.fromEntries(Object.values(heroDefinitions).map((h) => [h.id, h.specialFace]))
  );
  const bag = buildInitiativeBag(heroes.map((h) => h.id));
  const draw = drawToken(bag);
  return rollEnemyIntents({
    id: encounterId,
    name: encounterId === 'combat_1' ? 'Hallway Skirmish' : 'Bone Warden Gate',
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    heroes,
    enemies,
    enemyDefinitions,
    powers: powerCards,
    items: itemCards,
    dice,
    corruption: { value: 0, bonusDamage: 0, bonusMove: 0 },
    bag: draw.bag,
    currentToken: draw.token,
    round: 1,
    activeHeroId: draw.token?.kind === 'hero' ? draw.token.heroId : null,
    selectedActionId: null,
    selectedActionType: null,
    movePreview: [],
    currencyReward: encounterId === 'combat_1' ? 6 : 10,
    log: ['Encounter begins'],
    status: 'ongoing'
  });
};

export const maybeStartNextRound = (encounter: EncounterState): EncounterState => {
  if (encounter.bag.length || encounter.currentToken) return encounter;
  const cleared = {
    ...encounter,
    heroes: encounter.heroes.map((h) => ({ ...h, shield: 0 })),
    enemies: encounter.enemies.map((e) => ({ ...e, shield: 0 })),
    round: encounter.round + 1
  };
  const withIntent = rollEnemyIntents(applyCorruption(cleared));
  const bag = buildInitiativeBag(withIntent.heroes.filter((h) => !h.defeated).map((h) => h.id));
  const draw = drawToken(bag);
  return { ...withIntent, bag: draw.bag, currentToken: draw.token, activeHeroId: draw.token?.kind === 'hero' ? draw.token.heroId : null };
};

export const advanceToken = (encounter: EncounterState): EncounterState => {
  if (encounter.status !== 'ongoing') return encounter;
  const draw = drawToken(encounter.bag);
  const next = { ...encounter, bag: draw.bag, currentToken: draw.token, activeHeroId: draw.token?.kind === 'hero' ? draw.token.heroId : null };
  return maybeStartNextRound(next);
};

export const handleEnemyToken = (encounter: EncounterState): EncounterState => {
  if (encounter.currentToken?.kind !== 'enemies') return encounter;
  const resolved = resolveEnemyTurn(encounter);
  return advanceToken(resolved);
};

export const rollForHero = (encounter: EncounterState, heroId: string): EncounterState => {
  const rolled = rollHeroDice(encounter.dice, heroId);
  return {
    ...encounter,
    dice: rolled.diceState,
    corruption: { ...encounter.corruption, value: encounter.corruption.value + rolled.skulls },
    log: [`${heroId} rolled dice (+${rolled.skulls} corruption)`, ...encounter.log].slice(0, 50)
  };
};

export const rerollForHero = (encounter: EncounterState, heroId: string): EncounterState => {
  const remaining = encounter.dice.rerollsLeftByHeroId[heroId] ?? 0;
  if (remaining <= 0) return encounter;
  const rolled = rollHeroDice(encounter.dice, heroId);
  return {
    ...encounter,
    dice: { ...rolled.diceState, rerollsLeftByHeroId: { ...rolled.diceState.rerollsLeftByHeroId, [heroId]: remaining - 1 } },
    corruption: { ...encounter.corruption, value: encounter.corruption.value + rolled.skulls },
    log: [`${heroId} rerolled (${remaining - 1} rerolls left)`, ...encounter.log].slice(0, 50)
  };
};

export const toggleDieLock = (encounter: EncounterState, heroId: string, dieId: string): EncounterState => ({
  ...encounter,
  dice: toggleLock(encounter.dice, heroId, dieId)
});

const applyDamageToEnemy = (encounter: EncounterState, enemyId: string, amount: number): EncounterState => {
  const enemies = encounter.enemies.map((e) => {
    if (e.id !== enemyId) return e;
    const blocked = Math.min(e.shield, amount);
    const hpLoss = Math.max(0, amount - blocked);
    const hp = e.hp - hpLoss;
    return { ...e, shield: e.shield - blocked, hp, defeated: hp <= 0 };
  });
  const status = enemies.every((e) => e.defeated) ? 'victory' : encounter.status;
  return { ...encounter, enemies, status };
};

const blockedPositions = (encounter: EncounterState, ignoreHeroId?: string): GridPosition[] => [
  ...encounter.heroes.filter((h) => !h.defeated && h.id !== ignoreHeroId).map((h) => h.position),
  ...encounter.enemies.filter((e) => !e.defeated).map((e) => e.position)
];

export const selectAction = (encounter: EncounterState, kind: 'power' | 'item', actionId: string): EncounterState => {
  const heroId = encounter.activeHeroId;
  if (!heroId) return encounter;
  const card = kind === 'power' ? encounter.powers[actionId] : encounter.items[actionId];
  if (!card) return encounter;
  const hero = encounter.heroes.find((h) => h.id === heroId);
  if (!hero) return encounter;
  const moveEffect = card.effects.find((e) => e.kind === 'move');
  const movePreview = moveEffect
    ? reachableTiles(hero.position, moveEffect.amount, encounter.width, encounter.height, blockedPositions(encounter, hero.id))
    : [];
  return { ...encounter, selectedActionId: actionId, selectedActionType: kind, movePreview };
};

export const canUseSelectedAction = (encounter: EncounterState): boolean => {
  const heroId = encounter.activeHeroId;
  if (!heroId || !encounter.selectedActionId || !encounter.selectedActionType) return false;
  const dice = encounter.dice.diceByHeroId[heroId] ?? [];
  const card = encounter.selectedActionType === 'power' ? encounter.powers[encounter.selectedActionId] : encounter.items[encounter.selectedActionId];
  return canAfford(dice, card.cost);
};

export const useSelectedAction = (encounter: EncounterState, targetId?: string, moveTarget?: GridPosition): EncounterState => {
  const heroId = encounter.activeHeroId;
  if (!heroId || !encounter.selectedActionId || !encounter.selectedActionType) return encounter;
  const hero = encounter.heroes.find((h) => h.id === heroId);
  if (!hero) return encounter;
  const card = encounter.selectedActionType === 'power' ? encounter.powers[encounter.selectedActionId] : encounter.items[encounter.selectedActionId];
  const updatedDice = spendDice(encounter.dice.diceByHeroId[heroId], card.cost);
  if (!updatedDice) return encounter;

  let next = { ...encounter, dice: { ...encounter.dice, diceByHeroId: { ...encounter.dice.diceByHeroId, [heroId]: updatedDice } } };

  for (const effect of card.effects) {
    if (effect.kind === 'shield') {
      next = { ...next, heroes: next.heroes.map((h) => (h.id === heroId ? { ...h, shield: h.shield + effect.amount } : h)) };
    }
    if (effect.kind === 'move' && moveTarget) {
      const heroNow = next.heroes.find((h) => h.id === heroId)!;
      if (manhattanDistance(heroNow.position, moveTarget) <= effect.amount) {
        next = { ...next, heroes: next.heroes.map((h) => (h.id === heroId ? { ...h, position: moveTarget } : h)) };
      }
    }
    if (effect.kind === 'damage' && targetId) {
      const enemy = next.enemies.find((e) => e.id === targetId && !e.defeated);
      const source = next.heroes.find((h) => h.id === heroId)!;
      if (enemy && manhattanDistance(source.position, enemy.position) <= (effect.range ?? 1)) {
        next = applyDamageToEnemy(next, targetId, effect.amount);
      }
    }
    if (effect.kind === 'pull' && targetId) {
      const enemy = next.enemies.find((e) => e.id === targetId && !e.defeated);
      const source = next.heroes.find((h) => h.id === heroId)!;
      if (enemy) {
        const candidates = [
          { x: enemy.position.x + 1, y: enemy.position.y },
          { x: enemy.position.x - 1, y: enemy.position.y },
          { x: enemy.position.x, y: enemy.position.y + 1 },
          { x: enemy.position.x, y: enemy.position.y - 1 }
        ].filter((c) => c.x >= 0 && c.y >= 0 && c.x < next.width && c.y < next.height);
        candidates.sort((a, b) => manhattanDistance(a, source.position) - manhattanDistance(b, source.position));
        const occ = new Set(blockedPositions(next).map((p) => `${p.x},${p.y}`));
        const slot = candidates.find((c) => !occ.has(`${c.x},${c.y}`));
        if (slot) next = { ...next, enemies: next.enemies.map((e) => (e.id === targetId ? { ...e, position: slot } : e)) };
      }
    }
  }

  next = {
    ...next,
    selectedActionId: null,
    selectedActionType: null,
    movePreview: [],
    log: [`${heroId} used ${card.name}`, ...next.log].slice(0, 50)
  };
  return next;
};

export const endHeroTurn = (encounter: EncounterState): EncounterState => {
  const heroId = encounter.activeHeroId;
  if (!heroId) return encounter;
  const reset = {
    ...encounter,
    dice: resetHeroDiceTurn(encounter.dice, heroId),
    selectedActionId: null,
    selectedActionType: null,
    movePreview: []
  };
  return advanceToken(reset);
};
