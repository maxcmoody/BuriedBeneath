import type { HeroDefinition } from '../core/types';

export const heroDefinitions: Record<string, HeroDefinition> = {
  archer: {
    id: 'archer',
    name: 'Archer',
    maxHp: 11,
    specialFace: 'arrow',
    powers: ['archer_precise_shot', 'archer_repositioning_volley', 'archer_pinning_shot'],
    startingItem: 'scout_boots'
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    maxHp: 13,
    specialFace: 'light',
    powers: ['paladin_valor_strike', 'paladin_guarded_stance', 'paladin_holy_smite'],
    startingItem: 'buckler_charm'
  }
};
