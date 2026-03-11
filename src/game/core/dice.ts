import { CORE_DIE_SIDES, CORRUPTION_PER_SKULL_ROLL, SPECIAL_DIE_SIDES } from './constants';
import type { DiceCost, DiceState, Die, DiceFace, HeroState } from './types';

export const makeHeroDice = (hero: HeroState, specialFace: DiceFace): Die[] => {
  const core: Die[] = [0, 1, 2].map((n) => ({
    id: `${hero.id}_core_${n}`,
    ownerHeroId: hero.id,
    type: 'core',
    sides: CORE_DIE_SIDES,
    face: null,
    locked: false,
    spent: false
  }));
  const special: Die[] = [0, 1].map((n) => ({
    id: `${hero.id}_special_${n}`,
    ownerHeroId: hero.id,
    type: 'special',
    sides: SPECIAL_DIE_SIDES(specialFace),
    face: null,
    locked: false,
    spent: false
  }));
  return [...core, ...special];
};

export const initializeDiceState = (heroes: HeroState[], specialFaces: Record<string, DiceFace>): DiceState => ({
  diceByHeroId: Object.fromEntries(heroes.map((h) => [h.id, makeHeroDice(h, specialFaces[h.id])])),
  rerollsLeftByHeroId: Object.fromEntries(heroes.map((h) => [h.id, 2])),
  rolledThisTurnByHeroId: Object.fromEntries(heroes.map((h) => [h.id, false]))
});

const rollFace = (sides: DiceFace[]) => sides[Math.floor(Math.random() * sides.length)];

export const rollHeroDice = (diceState: DiceState, heroId: string): { diceState: DiceState; skulls: number } => {
  const dice = diceState.diceByHeroId[heroId] ?? [];
  let skulls = 0;
  const updated = dice.map((die) => {
    if (die.spent) return die;
    if (die.locked && die.face) return die;
    const face = rollFace(die.sides);
    if (die.type === 'core' && face === 'skull') skulls += CORRUPTION_PER_SKULL_ROLL;
    return { ...die, face };
  });

  return {
    skulls,
    diceState: {
      ...diceState,
      diceByHeroId: { ...diceState.diceByHeroId, [heroId]: updated },
      rolledThisTurnByHeroId: { ...diceState.rolledThisTurnByHeroId, [heroId]: true }
    }
  };
};

export const toggleLock = (diceState: DiceState, heroId: string, dieId: string): DiceState => {
  const updated = (diceState.diceByHeroId[heroId] ?? []).map((d) => (d.id === dieId && d.face ? { ...d, locked: !d.locked } : d));
  return { ...diceState, diceByHeroId: { ...diceState.diceByHeroId, [heroId]: updated } };
};

export const spendDice = (dice: Die[], cost: DiceCost): Die[] | null => {
  const working = dice.map((d) => ({ ...d }));
  for (const [face, needed] of Object.entries(cost)) {
    let remaining = needed;
    for (const die of working) {
      if (remaining === 0) break;
      if (!die.spent && die.face === face) {
        die.spent = true;
        remaining -= 1;
      }
    }
    if (remaining > 0) return null;
  }
  return working;
};

export const canAfford = (dice: Die[], cost: DiceCost): boolean => spendDice(dice, cost) !== null;

export const resetHeroDiceTurn = (diceState: DiceState, heroId: string): DiceState => ({
  ...diceState,
  diceByHeroId: {
    ...diceState.diceByHeroId,
    [heroId]: (diceState.diceByHeroId[heroId] ?? []).map((d) => ({ ...d, face: null, locked: false, spent: false }))
  },
  rerollsLeftByHeroId: { ...diceState.rerollsLeftByHeroId, [heroId]: 2 },
  rolledThisTurnByHeroId: { ...diceState.rolledThisTurnByHeroId, [heroId]: false }
});
