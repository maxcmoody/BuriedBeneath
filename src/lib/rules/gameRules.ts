export type DieFace = 'Attack' | 'Shield' | 'Star' | 'Corruption' | string;

export const coreDieFaces: DieFace[] = ['Attack', 'Attack', 'Shield', 'Shield', 'Star', 'Corruption'];

export const rollFromFaces = (faces: DieFace[]) => faces[Math.floor(Math.random() * faces.length)];

export const manhattanDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const corruptionEscalation = (value: number) => ({
  bonusDamage: (value >= 4 ? 1 : 0) + (value >= 10 ? 1 : 0),
  bonusMove: value >= 7 ? 1 : 0
});

export const chooseEnemyTarget = <T extends { hp: number; position: { x: number; y: number } }>(
  enemyPos: { x: number; y: number },
  heroes: T[]
): { candidates: T[]; reason: string } => {
  if (!heroes.length) return { candidates: [], reason: 'No heroes alive' };
  const withDist = heroes.map((hero) => ({ hero, dist: manhattanDistance(enemyPos, hero.position) }));
  const minDist = Math.min(...withDist.map((entry) => entry.dist));
  const nearest = withDist.filter((entry) => entry.dist === minDist).map((entry) => entry.hero);
  if (nearest.length === 1) return { candidates: nearest, reason: 'Closest hero' };
  const minHp = Math.min(...nearest.map((hero) => hero.hp));
  const lowest = nearest.filter((hero) => hero.hp === minHp);
  return { candidates: lowest, reason: lowest.length > 1 ? 'Tie: player choice' : 'Lowest HP among closest' };
};
