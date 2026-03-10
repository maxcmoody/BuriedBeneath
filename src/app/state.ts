import { floor1Definition, eliteRewards } from '../game/content/floors';
import { heroDefinitions } from '../game/content/heroes';
import { itemCards } from '../game/content/items';
import { createEncounter } from '../game/core/combat';
import type { GameState, HeroState, RewardOption } from '../game/core/types';

const buildRunHeroes = (): HeroState[] =>
  Object.values(heroDefinitions).map((h, idx) => ({
    id: h.id,
    name: h.name,
    hp: h.maxHp,
    maxHp: h.maxHp,
    shield: 0,
    position: { x: 1 + idx, y: 4 },
    powers: [...h.powers],
    items: [h.startingItem],
    defeated: false
  }));

export const initialGameState = (): GameState => ({
  view: 'map',
  run: {
    floor: JSON.parse(JSON.stringify(floor1Definition)),
    heroes: buildRunHeroes(),
    inventory: ['scout_boots', 'buckler_charm'],
    gold: 0,
    completed: false,
    rewardPending: false
  },
  encounter: null,
  message: 'Select the next node to begin Floor 1.'
});

export const startNode = (state: GameState, nodeId: string): GameState => {
  const node = state.run.floor.nodes.find((n) => n.id === nodeId && n.unlocked && !n.completed);
  if (!node) return { ...state, message: 'Node unavailable.' };

  if (node.type === 'combat' || node.type === 'elite') {
    const encounter = createEncounter(node.encounterId!, state.run.heroes);
    return { ...state, view: 'combat', encounter, message: `${node.label} started.` };
  }
  if (node.type === 'merchant') return { ...state, view: 'merchant', message: 'Merchant open.' };
  return { ...state, message: 'Move forward to the first combat.' };
};

export const completeCurrentNode = (state: GameState): GameState => {
  const floor = { ...state.run.floor, nodes: [...state.run.floor.nodes] };
  const currentIndex = floor.nodes.findIndex((n) => n.unlocked && !n.completed && (n.type !== 'start' || n.id === floor.currentNodeId));
  const nodeIndex = state.encounter
    ? floor.nodes.findIndex((n) => n.encounterId === state.encounter?.id)
    : floor.nodes.findIndex((n) => !n.completed && n.id !== 'start');
  const idx = nodeIndex >= 0 ? nodeIndex : currentIndex;
  if (idx >= 0) {
    floor.nodes[idx] = { ...floor.nodes[idx], completed: true };
    if (floor.nodes[idx + 1]) floor.nodes[idx + 1] = { ...floor.nodes[idx + 1], unlocked: true };
  }
  return { ...state, run: { ...state.run, floor } };
};

export const afterCombatVictory = (state: GameState): GameState => {
  if (!state.encounter) return state;
  let next: GameState = {
    ...state,
    run: {
      ...state.run,
      heroes: state.encounter.heroes,
      gold: state.run.gold + state.encounter.currencyReward
    },
    encounter: null,
    view: 'map',
    message: `Combat won! +${state.encounter.currencyReward} gold.`
  };
  next = completeCurrentNode(next);
  const wasElite = state.encounter.id === 'elite_1';
  if (wasElite) {
    next = { ...next, view: 'reward', run: { ...next.run, rewardPending: true } };
  }
  return next;
};

export const buyItem = (state: GameState, itemId: string): GameState => {
  const item = itemCards[itemId];
  if (!item?.price) return state;
  if (state.run.gold < item.price) return { ...state, message: 'Not enough gold.' };
  return {
    ...state,
    run: { ...state.run, gold: state.run.gold - item.price, inventory: [...state.run.inventory, itemId] },
    message: `Bought ${item.name}.`
  };
};

export const leaveMerchant = (state: GameState): GameState => ({
  ...completeCurrentNode(state),
  view: 'map',
  message: 'Leaving merchant.'
});

export const resolveReward = (state: GameState, option: RewardOption): GameState => {
  let gold = state.run.gold;
  if (option.type === 'treasure') gold += 6;
  return {
    ...state,
    view: 'runComplete',
    run: { ...state.run, gold, rewardPending: false, completed: true },
    message: `Reward chosen: ${option.label}`
  };
};

export { eliteRewards };
