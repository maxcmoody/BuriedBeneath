import type { GridPosition } from './types';

export const manhattanDistance = (a: GridPosition, b: GridPosition): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const isWithinBounds = (pos: GridPosition, width: number, height: number): boolean =>
  pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;

export const neighborsOrthogonal = (pos: GridPosition): GridPosition[] => [
  { x: pos.x + 1, y: pos.y },
  { x: pos.x - 1, y: pos.y },
  { x: pos.x, y: pos.y + 1 },
  { x: pos.x, y: pos.y - 1 }
];

export const reachableTiles = (
  start: GridPosition,
  move: number,
  width: number,
  height: number,
  blocked: GridPosition[]
): GridPosition[] => {
  const blockedSet = new Set(blocked.map((b) => `${b.x},${b.y}`));
  const visited = new Set<string>([`${start.x},${start.y}`]);
  const queue: Array<{ pos: GridPosition; dist: number }> = [{ pos: start, dist: 0 }];
  const result: GridPosition[] = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;
    if (current.dist > 0) result.push(current.pos);
    if (current.dist === move) continue;

    for (const next of neighborsOrthogonal(current.pos)) {
      const key = `${next.x},${next.y}`;
      if (visited.has(key) || !isWithinBounds(next, width, height) || blockedSet.has(key)) continue;
      visited.add(key);
      queue.push({ pos: next, dist: current.dist + 1 });
    }
  }

  return result;
};
