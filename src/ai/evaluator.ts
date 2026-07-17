import type { Board, Coord, Player, Stone } from '../types';
import { EMPTY, DIRECTIONS } from '../constants/board';
import { isInRange } from '../logic/board';

export const SCORE = {
  FIVE: 1_000_000,
  OPEN_FOUR: 100_000,
  FOUR: 10_000,
  OPEN_THREE: 1_000,
  THREE: 100,
  OPEN_TWO: 100,
  TWO: 10,
  ONE: 1,
} as const;

const BORDER: Stone = 3 as Stone;

export function opponent(player: Player): Player {
  return player === 1 ? 2 : 1;
}

function getLine(
  board: Board,
  center: Coord,
  dr: number,
  dc: number,
  radius: number,
): Stone[] {
  const line: Stone[] = [];
  for (let i = -radius; i <= radius; i++) {
    const r = center.row + dr * i;
    const c = center.col + dc * i;
    if (isInRange({ row: r, col: c })) {
      line.push(board[r][c]);
    } else {
      line.push(BORDER);
    }
  }
  return line;
}

function scoreLine(line: Stone[], player: Player): number {
  const me = player;
  const n = line.length;
  let best = 0;

  for (let start = 0; start < n; start++) {
    if (line[start] !== me) continue;
    let end = start;
    while (end < n && line[end] === me) end++;
    const count = end - start;
    const leftOpen = start > 0 && line[start - 1] === EMPTY;
    const rightOpen = end < n && line[end] === EMPTY;

    let score = 0;
    if (count >= 5) {
      score = SCORE.FIVE;
    } else if (count === 4) {
      if (leftOpen && rightOpen) score = SCORE.OPEN_FOUR;
      else if (leftOpen || rightOpen) score = SCORE.FOUR;
    } else if (count === 3) {
      if (leftOpen && rightOpen) {
        const l2Open = start - 2 >= 0 && line[start - 2] === EMPTY;
        const r2Open = end + 1 < n && line[end + 1] === EMPTY;
        if (l2Open || r2Open) score = SCORE.OPEN_THREE;
        else score = SCORE.THREE;
      } else if (leftOpen || rightOpen) {
        score = SCORE.THREE;
      }
    } else if (count === 2) {
      if (leftOpen && rightOpen) score = SCORE.OPEN_TWO;
      else if (leftOpen || rightOpen) score = SCORE.TWO;
    } else if (count === 1) {
      if (leftOpen && rightOpen) score = SCORE.ONE;
    }

    if (score > best) best = score;
    start = end - 1;
  }

  return best;
}

export function evaluatePoint(board: Board, coord: Coord, player: Player): number {
  const me = player;
  const opp = opponent(player);

  board[coord.row][coord.col] = me;
  let myScore = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const line = getLine(board, coord, dr, dc, 4);
    myScore += scoreLine(line, me);
  }
  board[coord.row][coord.col] = opp;
  let oppScore = 0;
  for (const [dr, dc] of DIRECTIONS) {
    const line = getLine(board, coord, dr, dc, 4);
    oppScore += scoreLine(line, opp);
  }
  board[coord.row][coord.col] = EMPTY;

  return Math.max(myScore, oppScore * 0.9);
}

export function evaluateBoard(board: Board, player: Player): number {
  let myScore = 0;
  let oppScore = 0;

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = board[r][c];
      if (cell === EMPTY) continue;
      const coord = { row: r, col: c };
      for (const [dr, dc] of DIRECTIONS) {
        const line = getLine(board, coord, dr, dc, 4);
        const s = scoreLine(line, cell);
        if (cell === player) myScore += s;
        else oppScore += s;
      }
    }
  }

  return myScore - oppScore;
}