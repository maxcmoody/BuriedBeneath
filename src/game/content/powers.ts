import type { PowerCard } from '../core/types';

export const powerCards: Record<string, PowerCard> = {
  archer_precise_shot: {
    id: 'archer_precise_shot',
    name: 'Precise Shot',
    heroId: 'archer',
    cost: { sword: 1, arrow: 1 },
    description: 'Deal 3 damage to an enemy within range 3.',
    effects: [{ kind: 'damage', amount: 3, range: 3, target: 'enemy' }]
  },
  archer_repositioning_volley: {
    id: 'archer_repositioning_volley',
    name: 'Repositioning Volley',
    heroId: 'archer',
    cost: { star: 1, arrow: 1 },
    description: 'Move 2 then deal 2 damage within range 2.',
    effects: [
      { kind: 'move', amount: 2, target: 'self' },
      { kind: 'damage', amount: 2, range: 2, target: 'enemy' }
    ]
  },
  archer_pinning_shot: {
    id: 'archer_pinning_shot',
    name: 'Pinning Shot',
    heroId: 'archer',
    cost: { shield: 1, arrow: 1 },
    description: 'Deal 2 damage and pull target 1 tile closer.',
    effects: [
      { kind: 'damage', amount: 2, range: 3, target: 'enemy' },
      { kind: 'pull', amount: 1, range: 3, target: 'enemy' }
    ]
  },
  paladin_valor_strike: {
    id: 'paladin_valor_strike',
    name: 'Valor Strike',
    heroId: 'paladin',
    cost: { sword: 2 },
    description: 'Deal 3 damage to adjacent enemy.',
    effects: [{ kind: 'damage', amount: 3, range: 1, target: 'enemy' }]
  },
  paladin_guarded_stance: {
    id: 'paladin_guarded_stance',
    name: 'Guarded Stance',
    heroId: 'paladin',
    cost: { shield: 1, light: 1 },
    description: 'Gain 3 shield and move 1.',
    effects: [
      { kind: 'shield', amount: 3, target: 'self' },
      { kind: 'move', amount: 1, target: 'self' }
    ]
  },
  paladin_holy_smite: {
    id: 'paladin_holy_smite',
    name: 'Holy Smite',
    heroId: 'paladin',
    cost: { star: 1, light: 1 },
    description: 'Deal 4 damage within range 2.',
    effects: [{ kind: 'damage', amount: 4, range: 2, target: 'enemy' }]
  }
};
