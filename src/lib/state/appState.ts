import { seedContent } from '../../data/seed/seedContent';
import { CONTENT_SCHEMAS, type ContentGroup, type ContentTables, type CsvRow } from '../../data/schemas/contentSchemas';
import { chooseEnemyTarget, coreDieFaces, corruptionEscalation, rollFromFaces, type DieFace } from '../rules/gameRules';

export type Position = { x: number; y: number };
export type TileKind = 'empty' | 'spawn' | 'objective' | 'blocked';
export type Mode = 'play' | 'editor' | 'run';
export type TokenKind = 'hero' | 'enemy';

export type HeroState = { id: string; name: string; hp: number; maxHp: number; shield: number; position: Position; specialFaces: string[]; powers: string[]; items: string[]; };
export type EnemyState = { id: string; nickname: string; hp: number; maxHp: number; position: Position; script: string; kind: 'mob' | 'elite' | 'boss'; status: string; };
export type DieState = { id: string; face: DieFace; locked: boolean; spent: boolean; type: 'core' | 'special'; };
export type EncounterState = {
  floor: number; room: number; round: number; corruption: number; heroes: HeroState[]; enemies: EnemyState[]; activeTokenId: string | null;
  initiativeBag: string[]; drawn: string[]; log: string[]; gridSize: number; overlays: Record<string, TileKind>; diceByHero: Record<string, DieState[]>; rerollsLeft: Record<string, number>;
};
export type RunState = { floor: number; room: number; hpCarryover: Record<string, number>; powersGained: string[]; itemsGained: string[]; restNote: string; selectedEncounter: number; };

export type AppState = { mode: Mode; quickAdjust: { group: ContentGroup; rowIndex: number } | null; content: ContentTables; encounter: EncounterState; run: RunState; dirty: Record<ContentGroup, boolean>; };

const STORAGE_KEY = 'pyramid-roguelite-prototype-v1';

const makeHero = (board: CsvRow<string>, idx: number): HeroState => ({
  id: `hero-${idx}`,
  name: board['Hero Name'] || board.Nickname || `Hero ${idx + 1}`,
  hp: Number(board.HitPoints || 12),
  maxHp: Number(board.HitPoints || 12),
  shield: 0,
  position: { x: idx, y: 0 },
  specialFaces: (board.SpecialDice || 'SpecialA,SpecialB').split(',').map((v) => v.trim()).filter(Boolean),
  powers: [],
  items: []
});

const makeEnemy = (row: CsvRow<string>, idx: number, kind: 'mob' | 'elite' | 'boss'): EnemyState => ({
  id: `${kind}-${idx}`,
  nickname: row.Nickname || kind,
  hp: kind === 'boss' ? 20 : kind === 'elite' ? 10 : 6,
  maxHp: kind === 'boss' ? 20 : kind === 'elite' ? 10 : 6,
  position: { x: 1 + idx, y: 1 },
  script: row.Move1 || 'Move 1 then Attack 1',
  kind,
  status: ''
});

const initDice = (hero: HeroState): DieState[] => {
  const specials = hero.specialFaces.length ? hero.specialFaces : ['SpecialA', 'SpecialB'];
  return [
    ...Array.from({ length: 3 }, (_, i) => ({ id: `${hero.id}-core-${i}`, face: 'Attack' as DieFace, locked: false, spent: false, type: 'core' as const })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: `${hero.id}-special-${i}`, face: specials[i % specials.length], locked: false, spent: false, type: 'special' as const }))
  ];
};

export const createEncounter = (content: ContentTables, floor = 1, room = 1): EncounterState => {
  const heroes = content.playerBoards.slice(0, 2).map(makeHero);
  const powersByHero = new Map(content.heroPowers.map((p) => [p.Nickname, p.Title]));
  heroes.forEach((hero) => {
    hero.powers = content.heroPowers.filter((p) => p.Nickname === hero.name || p.Nickname === hero.name.split(' ')[0]).map((p) => p.Title);
    if (!hero.powers.length) {
      const fallback = powersByHero.get(hero.name);
      if (fallback) hero.powers = [fallback];
    }
  });
  heroes.forEach((hero) => { hero.items = content.items.slice(0, 1).map((item) => item.Title); });
  const enemies = [makeEnemy(content.enemies[0], 0, 'mob'), makeEnemy(content.enemies[1] ?? content.enemies[0], 1, 'elite'), makeEnemy(content.bosses[0], 0, 'boss')];
  const diceByHero = Object.fromEntries(heroes.map((hero) => [hero.id, initDice(hero)]));
  const rerollsLeft = Object.fromEntries(heroes.map((hero) => [hero.id, 2]));
  return {
    floor,
    room,
    round: 1,
    corruption: 0,
    heroes,
    enemies,
    activeTokenId: null,
    initiativeBag: [],
    drawn: [],
    log: ['Encounter started. Roll enemy behavior and draw initiative.'],
    gridSize: floor === 1 ? 2 : floor === 2 ? 3 : 4,
    overlays: {},
    diceByHero,
    rerollsLeft
  };
};

export const defaultState = (): AppState => ({
  mode: 'play',
  quickAdjust: null,
  content: structuredClone(seedContent),
  encounter: createEncounter(seedContent),
  run: { floor: 1, room: 1, hpCarryover: {}, powersGained: [], itemsGained: [], restNote: '', selectedEncounter: 1 },
  dirty: Object.fromEntries(Object.keys(CONTENT_SCHEMAS).map((key) => [key, false])) as Record<ContentGroup, boolean>
});

export const loadState = (): AppState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as AppState;
    return parsed;
  } catch {
    return defaultState();
  }
};

export const saveState = (state: AppState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

export const rollHeroDice = (encounter: EncounterState, heroId: string, reroll = false): EncounterState => {
  const dice = encounter.diceByHero[heroId] ?? [];
  const rerolls = encounter.rerollsLeft[heroId] ?? 2;
  if (reroll && rerolls <= 0) return encounter;
  const rolled = dice.map((die) => {
    if (reroll && die.locked) return die;
    const face = die.type === 'core' ? rollFromFaces(coreDieFaces) : rollFromFaces((encounter.heroes.find((hero) => hero.id === heroId)?.specialFaces ?? ['Special']).map((v) => v as DieFace));
    return { ...die, face, spent: false };
  });
  const corruptionAdds = rolled.filter((d) => d.type === 'core' && d.face === 'Corruption').length;
  return {
    ...encounter,
    corruption: encounter.corruption + corruptionAdds,
    rerollsLeft: { ...encounter.rerollsLeft, [heroId]: reroll ? rerolls - 1 : rerolls },
    diceByHero: { ...encounter.diceByHero, [heroId]: rolled },
    log: [...encounter.log, `${heroId} rolled (${corruptionAdds} corruption).`]
  };
};

export const refillInitiativeBag = (encounter: EncounterState, perUnit = true): EncounterState => {
  const heroTokens = encounter.heroes.map((hero) => hero.id);
  const enemyTokens = perUnit ? encounter.enemies.map((enemy) => enemy.id) : ['enemy-group'];
  const bag = [...heroTokens, ...enemyTokens].sort(() => Math.random() - 0.5);
  return { ...encounter, initiativeBag: bag, drawn: [], activeTokenId: null, log: [...encounter.log, 'Initiative bag refilled.'] };
};

export const drawInitiative = (encounter: EncounterState): EncounterState => {
  if (!encounter.initiativeBag.length) return { ...encounter, activeTokenId: null, log: [...encounter.log, 'Bag empty. End round when ready.'] };
  const [next, ...rest] = encounter.initiativeBag;
  return { ...encounter, initiativeBag: rest, drawn: [...encounter.drawn, next], activeTokenId: next, log: [...encounter.log, `Drew token: ${next}`] };
};

export const resolveEnemyTurn = (encounter: EncounterState, enemyId: string): EncounterState => {
  const enemy = encounter.enemies.find((entry) => entry.id === enemyId);
  if (!enemy) return encounter;
  const alive = encounter.heroes.filter((hero) => hero.hp > 0);
  const target = chooseEnemyTarget(enemy.position, alive);
  return { ...encounter, log: [...encounter.log, `${enemy.nickname} script: ${enemy.script}`, `Targeting suggestion: ${target.reason} (${target.candidates.map((hero) => hero.name).join(', ') || 'none'})`] };
};

export const endRound = (encounter: EncounterState): EncounterState => ({
  ...encounter,
  round: encounter.round + 1,
  heroes: encounter.heroes.map((hero) => ({ ...hero, shield: 0 })),
  rerollsLeft: Object.fromEntries(encounter.heroes.map((hero) => [hero.id, 2])),
  initiativeBag: [],
  drawn: [],
  activeTokenId: null,
  log: [...encounter.log, `Round ended. Corruption now ${encounter.corruption}.`]
});

export const escalationLabel = (corruption: number) => {
  const escalations = corruptionEscalation(corruption);
  return `Enemy +${escalations.bonusDamage} damage, +${escalations.bonusMove} move`;
};
