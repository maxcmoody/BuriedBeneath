import type { EnemyDefinition } from '../core/types';

export const enemyDefinitions: Record<string, EnemyDefinition> = {
  scavenger: {
    id: 'scavenger',
    name: 'Crypt Scavenger',
    maxHp: 4,
    move: 2,
    damage: 2,
    color: '#9c6f44',
    scripts: [
      {
        id: 'rush_bite',
        name: 'Rush & Bite',
        steps: [
          { type: 'conditionalIfAdjacent', children: [{ type: 'attackAdjacent', value: 1 }] },
          { type: 'conditionalElse', children: [{ type: 'moveTowardNearestHero', value: 2 }, { type: 'attackAdjacent', value: 1 }] }
        ]
      },
      {
        id: 'brace_then_pounce',
        name: 'Brace then Pounce',
        steps: [{ type: 'gainShield', value: 1 }, { type: 'moveTowardNearestHero', value: 1 }]
      }
    ]
  },
  bone_warden: {
    id: 'bone_warden',
    name: 'Bone Warden',
    maxHp: 14,
    move: 2,
    damage: 3,
    color: '#5d5dd8',
    isElite: true,
    scripts: [
      {
        id: 'crushing_advance',
        name: 'Crushing Advance',
        steps: [
          { type: 'moveTowardNearestHero', value: 2 },
          { type: 'attackAdjacent', value: 1 },
          { type: 'gainShield', value: 1 }
        ]
      },
      {
        id: 'unyielding_guard',
        name: 'Unyielding Guard',
        steps: [
          { type: 'gainShield', value: 2 },
          { type: 'conditionalIfAdjacent', children: [{ type: 'attackAdjacent', value: 1 }] },
          { type: 'conditionalElse', children: [{ type: 'moveTowardNearestHero', value: 1 }] }
        ]
      }
    ]
  }
};
