export const PLAYER_BOARD_COLUMNS = [
  'Copies',
  'Nickname',
  'card_background',
  'Weapon Text',
  'Special Text',
  'Movement Text',
  'Armor Text',
  'zone14image',
  'zone15image',
  'zone16image',
  'zone17image',
  'zone19image',
  'Hero Image',
  'Hero Name',
  'Weapon Dice',
  'SpecialDice',
  'Armor Dice',
  'MovementDice',
  'HitPoints'
] as const;

export const HERO_POWERS_COLUMNS = ['Copies', 'Nickname', 'card_background', 'Level', 'Title', 'Description', 'Dice'] as const;

export const ENEMIES_COLUMNS = [
  'Copies',
  'Nickname',
  'card_background',
  'CreatureImage',
  'Move1',
  'Move2',
  'Move3',
  'Move4',
  'Description',
  'DiceMove1',
  'DiceMove2',
  'DiceMove3',
  'DiceMove4'
] as const;

export const ITEMS_COLUMNS = [
  'Copies',
  'Nickname',
  'card_background',
  'Title',
  'Description',
  'zone4image',
  'Cost',
  'dice zone',
  'itemtypeicon'
] as const;

export type CsvRow<K extends string = string> = Record<K, string>;

type GroupSchema<K extends string> = {
  key: ContentGroup;
  label: string;
  columns: readonly K[];
  validate?: (row: CsvRow<K>) => string[];
};

export type ContentGroup =
  | 'playerBoards'
  | 'heroPowers'
  | 'enemies'
  | 'items'
  | 'bosses'
  | 'events'
  | 'curses'
  | 'manifest'
  | 'schema';

const requiredName = (value: string, field: string) => (!value.trim() ? [`${field} is recommended.`] : []);

export const CONTENT_SCHEMAS: Record<ContentGroup, GroupSchema<string>> = {
  playerBoards: {
    key: 'playerBoards',
    label: 'Player Boards',
    columns: PLAYER_BOARD_COLUMNS,
    validate: (row) => [...requiredName(row['Hero Name'] ?? '', 'Hero Name')]
  },
  heroPowers: {
    key: 'heroPowers',
    label: 'Hero Powers',
    columns: HERO_POWERS_COLUMNS,
    validate: (row) => [...requiredName(row.Title ?? '', 'Title')]
  },
  enemies: {
    key: 'enemies',
    label: 'Enemies',
    columns: ENEMIES_COLUMNS,
    validate: (row) => [...requiredName(row.Nickname ?? '', 'Nickname')]
  },
  items: {
    key: 'items',
    label: 'Items',
    columns: ITEMS_COLUMNS,
    validate: (row) => [...requiredName(row.Title ?? '', 'Title')]
  },
  bosses: {
    key: 'bosses',
    label: 'Bosses',
    columns: ENEMIES_COLUMNS,
    validate: (row) => [...requiredName(row.Nickname ?? '', 'Nickname')]
  },
  events: { key: 'events', label: 'Events', columns: ['id', 'text'] },
  curses: { key: 'curses', label: 'Curses', columns: ['id', 'text'] },
  manifest: { key: 'manifest', label: 'Manifest', columns: ['key', 'value'] },
  schema: { key: 'schema', label: 'Schema', columns: ['group', 'notes'] }
};

export type ContentTables = Record<ContentGroup, CsvRow<string>[]>;
