import type { TokenType } from './types';

export const buildInitiativeBag = (heroIds: string[]): TokenType[] => {
  const bag: TokenType[] = [...heroIds.map((heroId) => ({ kind: 'hero' as const, heroId })), { kind: 'enemies' }];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};
