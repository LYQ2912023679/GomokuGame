import type { MoveRecord, Player } from '../types';

export function nextTurn(current: Player): Player {
  return current === 1 ? 2 : 1;
}

export function isFirstMove(history: MoveRecord[]): boolean {
  return history.length === 0;
}

export function currentTurnAfterHistory(history: MoveRecord[]): Player {
  if (history.length === 0) return 1;
  const last = history[history.length - 1];
  return nextTurn(last.player);
}