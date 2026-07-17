import type { Board, Coord, Player, Stone } from '../types';
import { BOARD_SIZE, EMPTY } from '../constants/board';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => EMPTY as Stone),
  );
}

export function isInRange(coord: Coord): boolean {
  return (
    coord.row >= 0 &&
    coord.row < BOARD_SIZE &&
    coord.col >= 0 &&
    coord.col < BOARD_SIZE
  );
}

export function canPlace(board: Board, coord: Coord): boolean {
  if (!isInRange(coord)) return false;
  return board[coord.row][coord.col] === EMPTY;
}

export function placeStone(board: Board, coord: Coord, player: Player): Board {
  const next = board.map((row) => row.slice());
  next[coord.row][coord.col] = player;
  return next;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function isBoardFull(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) return false;
    }
  }
  return true;
}