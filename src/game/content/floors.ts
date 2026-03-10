import type { FloorState, RewardOption } from '../core/types';

export const floor1Definition: FloorState = {
  id: 'floor1',
  currentNodeId: 'start',
  nodes: [
    { id: 'start', type: 'start', label: 'Start Camp', unlocked: true, completed: false },
    { id: 'combat_1', type: 'combat', label: 'Hallway Skirmish', unlocked: true, completed: false, encounterId: 'combat_1' },
    { id: 'merchant_1', type: 'merchant', label: 'Wandering Merchant', unlocked: false, completed: false },
    { id: 'elite_1', type: 'elite', label: 'Bone Warden Gate', unlocked: false, completed: false, encounterId: 'elite_1' }
  ]
};

export const eliteRewards: RewardOption[] = [
  { id: 'reward_upgrade', label: 'Upgrade a Power', description: 'Placeholder: improve a starting power next iteration.', type: 'upgrade' },
  { id: 'reward_new_power', label: 'Gain a New Power', description: 'Placeholder: add a new power card.', type: 'newPower' },
  { id: 'reward_treasure', label: 'Gain Treasure', description: 'Gain +6 gold immediately.', type: 'treasure' }
];
