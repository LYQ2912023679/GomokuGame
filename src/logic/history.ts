import type { Board, MoveRecord } from '../types';
import { createEmptyBoard } from './board';

export function appendMove(history: MoveRecord[], move: MoveRecord): MoveRecord[] {
  return [...history, move];
}

export function undoMoves(history: MoveRecord[], n: number): MoveRecord[] {
  return history.slice(0, Math.max(0, history.length - n));
}

export function rebuildBoard(history: MoveRecord[]): Board {
  const board = createEmptyBoard();
  for (const move of history) {
    board[move.coord.row][move.coord.col] = move.player;
  }
  return board;
}