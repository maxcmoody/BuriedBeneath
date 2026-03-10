import { manhattanDistance, neighborsOrthogonal } from './movement';
import type { EncounterState, EnemyBehaviorStep, EnemyState, GridPosition, HeroState } from './types';

interface Context {
  encounter: EncounterState;
  enemy: EnemyState;
}

const closestHero = (enemy: EnemyState, heroes: HeroState[]): HeroState | null => {
  const live = heroes.filter((h) => !h.defeated);
  if (!live.length) return null;
  return [...live].sort((a, b) => {
    const d = manhattanDistance(enemy.position, a.position) - manhattanDistance(enemy.position, b.position);
    if (d !== 0) return d;
    return a.hp - b.hp;
  })[0];
};

const occupied = (encounter: EncounterState): Set<string> => {
  const occ = new Set<string>();
  encounter.heroes.filter((h) => !h.defeated).forEach((h) => occ.add(`${h.position.x},${h.position.y}`));
  encounter.enemies.filter((e) => !e.defeated).forEach((e) => occ.add(`${e.position.x},${e.position.y}`));
  return occ;
};

const moveToward = (enemy: EnemyState, target: GridPosition, steps: number, encounter: EncounterState): EnemyState => {
  let current = enemy.position;
  let remaining = steps;
  while (remaining > 0) {
    const options = neighborsOrthogonal(current)
      .filter((p) => p.x >= 0 && p.y >= 0 && p.x < encounter.width && p.y < encounter.height)
      .filter((p) => !occupied(encounter).has(`${p.x},${p.y}`));
    if (!options.length) break;
    options.sort((a, b) => manhattanDistance(a, target) - manhattanDistance(b, target));
    if (manhattanDistance(options[0], target) >= manhattanDistance(current, target)) break;
    current = options[0];
    remaining -= 1;
  }
  return { ...enemy, position: current };
};

const attackAdjacent = (ctx: Context, mult: number): { encounter: EncounterState; text: string | null } => {
  const target = closestHero(ctx.enemy, ctx.encounter.heroes);
  if (!target || manhattanDistance(ctx.enemy.position, target.position) > 1) return { encounter: ctx.encounter, text: null };
  const enemyDef = ctx.encounter.enemyDefinitions[ctx.enemy.definitionId];
  const damage = enemyDef.damage * mult + ctx.encounter.corruption.bonusDamage;
  const blocked = Math.min(target.shield, damage);
  const hpLoss = Math.max(0, damage - blocked);
  const heroes = ctx.encounter.heroes.map((h) =>
    h.id === target.id ? { ...h, shield: h.shield - blocked, hp: h.hp - hpLoss, defeated: h.hp - hpLoss <= 0 } : h
  );
  return { encounter: { ...ctx.encounter, heroes }, text: `${ctx.enemy.id} hits ${target.name} for ${hpLoss} (${blocked} blocked)` };
};

const runStep = (ctx: Context, step: EnemyBehaviorStep, adjacent: boolean): Context & { text?: string } => {
  switch (step.type) {
    case 'moveTowardNearestHero': {
      const target = closestHero(ctx.enemy, ctx.encounter.heroes);
      if (!target) return ctx;
      const def = ctx.encounter.enemyDefinitions[ctx.enemy.definitionId];
      const moved = moveToward(ctx.enemy, target.position, (step.value ?? def.move) + ctx.encounter.corruption.bonusMove, ctx.encounter);
      const enemies = ctx.encounter.enemies.map((e) => (e.id === ctx.enemy.id ? moved : e));
      return { encounter: { ...ctx.encounter, enemies }, enemy: moved };
    }
    case 'attackAdjacent': {
      const attacked = attackAdjacent(ctx, step.value ?? 1);
      return { encounter: attacked.encounter, enemy: ctx.enemy, text: attacked.text ?? undefined };
    }
    case 'gainShield': {
      const enemy = { ...ctx.enemy, shield: ctx.enemy.shield + (step.value ?? 1) };
      const enemies = ctx.encounter.enemies.map((e) => (e.id === enemy.id ? enemy : e));
      return { encounter: { ...ctx.encounter, enemies }, enemy, text: `${enemy.id} gains ${step.value ?? 1} shield` };
    }
    case 'conditionalIfAdjacent': {
      if (!adjacent) return ctx;
      return (step.children ?? []).reduce((acc, child) => runStep(acc, child, adjacent), ctx);
    }
    case 'conditionalElse': {
      if (adjacent) return ctx;
      return (step.children ?? []).reduce((acc, child) => runStep(acc, child, adjacent), ctx);
    }
    default:
      return ctx;
  }
};

export const resolveEnemyTurn = (encounter: EncounterState): EncounterState => {
  let next = { ...encounter };
  for (const enemy of next.enemies.filter((e) => !e.defeated)) {
    const script = next.enemyDefinitions[enemy.definitionId].scripts.find((s) => s.id === enemy.selectedScriptId);
    if (!script) continue;
    const target = closestHero(enemy, next.heroes);
    const isAdj = !!target && manhattanDistance(enemy.position, target.position) <= 1;
    const startCtx: Context = { encounter: next, enemy };
    const endCtx = script.steps.reduce((acc, step) => {
      const out = runStep(acc, step, isAdj);
      if (out.text) out.encounter.log = [out.text, ...out.encounter.log].slice(0, 50);
      return out;
    }, startCtx);
    next = endCtx.encounter;
  }
  if (next.heroes.every((h) => h.defeated)) return { ...next, status: 'defeat' };
  return next;
};

export const rollEnemyIntents = (encounter: EncounterState): EncounterState => {
  const enemies = encounter.enemies.map((e) => {
    const def = encounter.enemyDefinitions[e.definitionId];
    const script = def.scripts[Math.floor(Math.random() * def.scripts.length)];
    return { ...e, selectedScriptId: script.id };
  });
  return { ...encounter, enemies };
};
