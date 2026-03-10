import type { DiceFace } from './types';

export const CORE_DIE_SIDES: DiceFace[] = ['sword', 'sword', 'shield', 'shield', 'star', 'skull'];
export const SPECIAL_DIE_SIDES = (face: DiceFace): DiceFace[] => [face, face, 'sword', 'shield', 'star', 'star'];

export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 6;

export const CORRUPTION_THRESHOLDS = [
  { at: 4, bonusDamage: 1, bonusMove: 0 },
  { at: 7, bonusDamage: 1, bonusMove: 1 },
  { at: 10, bonusDamage: 2, bonusMove: 1 }
];

// assumption: each core skull on each roll (including rerolls) adds corruption immediately
export const CORRUPTION_PER_SKULL_ROLL = 1;
