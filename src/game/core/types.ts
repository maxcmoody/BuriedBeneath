export type DiceFace = 'sword' | 'shield' | 'star' | 'skull' | 'arrow' | 'light';
export type DieType = 'core' | 'special';

export interface Die {
  id: string;
  ownerHeroId: string;
  type: DieType;
  sides: DiceFace[];
  face: DiceFace | null;
  locked: boolean;
  spent: boolean;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface DiceCost {
  [face: string]: number;
}

export interface PowerEffect {
  kind: 'damage' | 'shield' | 'move' | 'pull';
  amount: number;
  range?: number;
  target: 'enemy' | 'self' | 'hero';
}

export interface PowerCard {
  id: string;
  name: string;
  heroId: string;
  cost: DiceCost;
  description: string;
  effects: PowerEffect[];
}

export interface ItemCard {
  id: string;
  name: string;
  cost: DiceCost;
  description: string;
  effects: PowerEffect[];
  price?: number;
}

export interface HeroDefinition {
  id: string;
  name: string;
  maxHp: number;
  specialFace: DiceFace;
  powers: string[];
  startingItem: string;
}

export interface HeroState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  position: GridPosition;
  powers: string[];
  items: string[];
  defeated: boolean;
}

export interface EnemyBehaviorStep {
  type: 'moveTowardNearestHero' | 'attackAdjacent' | 'gainShield' | 'conditionalIfAdjacent' | 'conditionalElse';
  value?: number;
  children?: EnemyBehaviorStep[];
}

export interface EnemyBehaviorScript {
  id: string;
  name: string;
  steps: EnemyBehaviorStep[];
}

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHp: number;
  move: number;
  damage: number;
  scripts: EnemyBehaviorScript[];
  color: string;
  isElite?: boolean;
}

export interface EnemyState {
  id: string;
  definitionId: string;
  hp: number;
  shield: number;
  position: GridPosition;
  selectedScriptId: string;
  defeated: boolean;
}

export interface CorruptionState {
  value: number;
  bonusDamage: number;
  bonusMove: number;
}

export type TokenType = { kind: 'hero'; heroId: string } | { kind: 'enemies' };

export interface DiceState {
  diceByHeroId: Record<string, Die[]>;
  rerollsLeftByHeroId: Record<string, number>;
  rolledThisTurnByHeroId: Record<string, boolean>;
}

export interface EncounterState {
  id: string;
  name: string;
  width: number;
  height: number;
  heroes: HeroState[];
  enemies: EnemyState[];
  enemyDefinitions: Record<string, EnemyDefinition>;
  powers: Record<string, PowerCard>;
  items: Record<string, ItemCard>;
  dice: DiceState;
  corruption: CorruptionState;
  bag: TokenType[];
  currentToken: TokenType | null;
  round: number;
  activeHeroId: string | null;
  selectedActionId: string | null;
  selectedActionType: 'power' | 'item' | null;
  movePreview: GridPosition[];
  currencyReward: number;
  log: string[];
  status: 'ongoing' | 'victory' | 'defeat';
}

export type EncounterNodeType = 'start' | 'combat' | 'merchant' | 'elite';

export interface EncounterNode {
  id: string;
  type: EncounterNodeType;
  label: string;
  unlocked: boolean;
  completed: boolean;
  encounterId?: string;
}

export interface FloorState {
  id: string;
  nodes: EncounterNode[];
  currentNodeId: string;
}

export interface RewardOption {
  id: string;
  label: string;
  description: string;
  type: 'upgrade' | 'newPower' | 'treasure';
}

export interface RunState {
  floor: FloorState;
  heroes: HeroState[];
  inventory: string[];
  gold: number;
  completed: boolean;
  rewardPending: boolean;
}

export interface GameState {
  view: 'map' | 'combat' | 'merchant' | 'reward' | 'runComplete';
  run: RunState;
  encounter: EncounterState | null;
  message: string | null;
}
