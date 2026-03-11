import type { ContentTables, CsvRow } from '../schemas/contentSchemas';
import { CONTENT_SCHEMAS } from '../schemas/contentSchemas';

const row = (values: Record<string, string>, columns: readonly string[]): CsvRow<string> =>
  Object.fromEntries(columns.map((column) => [column, values[column] ?? '']));

export const seedContent: ContentTables = {
  playerBoards: [
    row(
      {
        Copies: '1', Nickname: 'Archer', card_background: 'forest', 'Weapon Text': 'Deal 2 damage at range 3.',
        'Special Text': 'Pin Shot: apply slow.', 'Movement Text': 'Move up to 2.', 'Armor Text': 'Gain 1 shield.',
        'Hero Name': 'Archer', 'Weapon Dice': 'Attack,Attack', SpecialDice: 'Aim,Volley', 'Armor Dice': 'Shield', MovementDice: 'Star', HitPoints: '12'
      },
      CONTENT_SCHEMAS.playerBoards.columns
    ),
    row(
      {
        Copies: '1', Nickname: 'Paladin', card_background: 'temple', 'Weapon Text': 'Strike adjacent for 2.',
        'Special Text': 'Radiant Guard: heal ally 1.', 'Movement Text': 'Move 1 and push 1.', 'Armor Text': 'Gain 2 shield.',
        'Hero Name': 'Paladin', 'Weapon Dice': 'Attack,Shield', SpecialDice: 'Smite,Guard', 'Armor Dice': 'Shield', MovementDice: 'Star', HitPoints: '14'
      },
      CONTENT_SCHEMAS.playerBoards.columns
    )
  ],
  heroPowers: [
    row({ Copies: '1', Nickname: 'Archer', card_background: 'forest', Level: '1', Title: 'Piercing Shot', Description: 'Deal 3 damage in line.', Dice: 'Attack+Aim' }, CONTENT_SCHEMAS.heroPowers.columns),
    row({ Copies: '1', Nickname: 'Archer', card_background: 'forest', Level: '1', Title: 'Quickstep', Description: 'Move 2 then gain 1 shield.', Dice: 'Star' }, CONTENT_SCHEMAS.heroPowers.columns),
    row({ Copies: '1', Nickname: 'Paladin', card_background: 'temple', Level: '1', Title: 'Sanctuary', Description: 'Grant 2 shield to ally.', Dice: 'Guard+Shield' }, CONTENT_SCHEMAS.heroPowers.columns),
    row({ Copies: '1', Nickname: 'Paladin', card_background: 'temple', Level: '1', Title: 'Judgement', Description: 'Deal 2 damage and mark target.', Dice: 'Attack+Smite' }, CONTENT_SCHEMAS.heroPowers.columns)
  ],
  enemies: [
    row({ Copies: '3', Nickname: 'Bone Scout', card_background: 'crypt', CreatureImage: 'mob', Move1: 'Move 1 then attack 1', Move2: 'Attack 2 nearest hero', Move3: 'Move 2', Move4: 'Guard and attack 1', Description: 'Fast weak mob', DiceMove1: '1-2', DiceMove2: '3-4', DiceMove3: '5', DiceMove4: '6' }, CONTENT_SCHEMAS.enemies.columns),
    row({ Copies: '1', Nickname: 'Crypt Knight', card_background: 'crypt', CreatureImage: 'elite', Move1: 'Move 1 attack 2', Move2: 'Attack 3', Move3: 'Move 2 attack 1', Move4: 'Gain shield 2', Description: 'Elite bruiser', DiceMove1: '1-2', DiceMove2: '3', DiceMove3: '4-5', DiceMove4: '6' }, CONTENT_SCHEMAS.enemies.columns)
  ],
  items: [
    row({ Copies: '1', Nickname: 'Quiver Charm', card_background: 'item', Title: 'Quiver Charm', Description: 'Spend any die: +1 range this turn.', Cost: '2', 'dice zone': 'flex', itemtypeicon: 'trinket' }, CONTENT_SCHEMAS.items.columns),
    row({ Copies: '1', Nickname: 'Iron Tonic', card_background: 'item', Title: 'Iron Tonic', Description: 'Spend Shield: heal 2.', Cost: '3', 'dice zone': 'shield', itemtypeicon: 'potion' }, CONTENT_SCHEMAS.items.columns)
  ],
  bosses: [
    row({ Copies: '1', Nickname: 'Pyramid Warden', card_background: 'boss', CreatureImage: 'boss', Move1: 'Move 1 attack 3', Move2: 'Attack all adjacent for 2', Move3: 'Summon mob then move 1', Move4: 'Roar: enemies +1 damage', Description: 'Boss sample', DiceMove1: '1-2', DiceMove2: '3-4', DiceMove3: '5', DiceMove4: '6' }, CONTENT_SCHEMAS.bosses.columns)
  ],
  events: [{ id: 'event-1', text: 'Prototype event placeholder' }],
  curses: [{ id: 'curse-1', text: 'Prototype curse placeholder' }],
  manifest: [{ key: 'version', value: 'mvp' }],
  schema: [{ group: 'bosses', notes: 'Uses enemy schema for now' }]
};
