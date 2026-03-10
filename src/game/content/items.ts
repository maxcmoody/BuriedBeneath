import type { ItemCard } from '../core/types';

export const itemCards: Record<string, ItemCard> = {
  scout_boots: {
    id: 'scout_boots',
    name: 'Scout Boots',
    cost: { star: 1 },
    description: 'Spend 1 ⭐ to move 1.',
    effects: [{ kind: 'move', amount: 1, target: 'self' }]
  },
  buckler_charm: {
    id: 'buckler_charm',
    name: 'Buckler Charm',
    cost: { shield: 1 },
    description: 'Spend 1 🛡 to gain 1 shield.',
    effects: [{ kind: 'shield', amount: 1, target: 'self' }]
  },
  torch_ember: {
    id: 'torch_ember',
    name: 'Torch Ember',
    cost: { sword: 1 },
    description: 'Spend 1 ⚔ to deal 1 damage to adjacent enemy.',
    effects: [{ kind: 'damage', amount: 1, range: 1, target: 'enemy' }]
  },
  grappling_hook: {
    id: 'grappling_hook',
    name: 'Grappling Hook',
    cost: { star: 1 },
    description: 'Move 2 quickly.',
    effects: [{ kind: 'move', amount: 2, target: 'self' }],
    price: 4
  },
  vial_of_faith: {
    id: 'vial_of_faith',
    name: 'Vial of Faith',
    cost: { shield: 1 },
    description: 'Gain 2 shield.',
    effects: [{ kind: 'shield', amount: 2, target: 'self' }],
    price: 4
  },
  splinter_bomb: {
    id: 'splinter_bomb',
    name: 'Splinter Bomb',
    cost: { sword: 1 },
    description: 'Deal 2 damage within range 2.',
    effects: [{ kind: 'damage', amount: 2, range: 2, target: 'enemy' }],
    price: 5
  }
};
