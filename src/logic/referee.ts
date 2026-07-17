import type { Board, Coord, WinResult } from '../types';
import { EMPTY, WIN_COUNT, DIRECTIONS } from '../constants/board';
import { isInRange } from './board';

const NO_WIN: WinResult = { winner: null, line: [], direction: null };

export function checkWin(board: Board, lastMove: Coord): WinResult {
  const raw = board[lastMove.row]?.[lastMove.col];
  if (!raw) return NO_WIN;
  const player = raw;

  for (const [dr, dc, dir] of DIRECTIONS) {
    const line: Coord[] = [{ ...lastMove }];
    let count = 1;

    let r = lastMove.row + dr;
    let c = lastMove.col + dc;
    while (isInRange({ row: r, col: c }) && board[r][c] === player) {
      count++;
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    r = lastMove.row - dr;
    c = lastMove.col - dc;
    while (isInRange({ row: r, col: c }) && board[r][c] === player) {
      count++;
      line.unshift({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    if (count >= WIN_COUNT) {
      return { winner: player, line, direction: dir };
    }
  }

  return NO_WIN;
}

export function checkDraw(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell === EMPTY) return false;
    }
  }
  return true;
}