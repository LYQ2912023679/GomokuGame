import type { Board, Coord, Player } from '../types';
import { BOARD_SIZE, EMPTY } from '../constants/board';
import { isInRange } from '../logic/board';
import { evaluatePoint, opponent } from './evaluator';

export interface Candidate {
  coord: Coord;
  score: number;
}

export function getCandidates(board: Board, radius = 2): Candidate[] {
  const visited = new Set<string>();
  const candidates: Candidate[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) continue;
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (!isInRange({ row: nr, col: nc })) continue;
          if (board[nr][nc] !== EMPTY) continue;
          const key = `${nr},${nc}`;
          if (visited.has(key)) continue;
          visited.add(key);
          candidates.push({ coord: { row: nr, col: nc }, score: 0 });
        }
      }
    }
  }

  return candidates;
}

export function hasAnyStone(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell !== EMPTY) return true;
    }
  }
  return false;
}

const TIME_LIMIT_MS = 1400;

export function findBestMove(
  board: Board,
  player: Player,
  depth: number,
): Coord {
  const startTime = Date.now();
  const center = Math.floor(BOARD_SIZE / 2);

  if (!hasAnyStone(board)) {
    return { row: center, col: center };
  }

  let candidates = getCandidates(board, 2);
  if (candidates.length === 0) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === EMPTY) return { row: r, col: c };
      }
    }
    return { row: center, col: center };
  }

  for (const cand of candidates) {
    cand.score = evaluatePoint(board, cand.coord, player);
  }
  candidates.sort((a, b) => b.score - a.score);

  if (candidates[0].score >= 1_000_000) {
    return candidates[0].coord;
  }

  const topK = Math.min(candidates.length, depth >= 3 ? 10 : 20);
  candidates = candidates.slice(0, topK);

  let bestCoord = candidates[0].coord;
  let bestValue = -Infinity;
  const alpha = -Infinity;
  const beta = Infinity;

  for (const cand of candidates) {
    board[cand.coord.row][cand.coord.col] = player;
    const value = -minimax(
      board,
      depth - 1,
      -beta,
      -alpha,
      opponent(player),
      player,
      startTime,
    );
    board[cand.coord.row][cand.coord.col] = EMPTY;

    if (value > bestValue) {
      bestValue = value;
      bestCoord = cand.coord;
    }
    if (bestValue > alpha) {
      // update alpha
    }
    if (Date.now() - startTime > TIME_LIMIT_MS) break;
  }

  return bestCoord;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  current: Player,
  rootPlayer: Player,
  startTime: number,
): number {
  if (depth === 0 || Date.now() - startTime > TIME_LIMIT_MS) {
    return evaluateBoardForPlayer(board, rootPlayer);
  }

  const candidates = getCandidates(board, 2);
  if (candidates.length === 0) {
    return evaluateBoardForPlayer(board, rootPlayer);
  }

  for (const cand of candidates) {
    cand.score = evaluatePoint(board, cand.coord, current);
  }
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, Math.min(candidates.length, 8));

  let best = -Infinity;
  for (const cand of top) {
    board[cand.coord.row][cand.coord.col] = current;
    const value = -minimax(
      board,
      depth - 1,
      -beta,
      -alpha,
      opponent(current),
      rootPlayer,
      startTime,
    );
    board[cand.coord.row][cand.coord.col] = EMPTY;

    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
    if (Date.now() - startTime > TIME_LIMIT_MS) break;
  }

  return best;
}

function evaluateBoardForPlayer(board: Board, player: Player): number {
  let myScore = 0;
  let oppScore = 0;


  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) continue;
      const s = evaluatePoint(board, { row: r, col: c }, board[r][c] as Player);
      if (board[r][c] === player) myScore += s;
      else oppScore += s;
    }
  }

  return myScore - oppScore;
}

export function findBestMoveSimple(board: Board, player: Player): Coord {
  const center = Math.floor(BOARD_SIZE / 2);
  if (!hasAnyStone(board)) {
    return { row: center, col: center };
  }

  const candidates = getCandidates(board, 2);
  if (candidates.length === 0) {
    return { row: center, col: center };
  }

  let bestCoord = candidates[0].coord;
  let bestScore = -Infinity;
  for (const cand of candidates) {
    const score = evaluatePoint(board, cand.coord, player);
    if (score > bestScore) {
      bestScore = score;
      bestCoord = cand.coord;
    }
  }

  return bestCoord;
}

export function findRandomMove(board: Board): Coord {
  const center = Math.floor(BOARD_SIZE / 2);
  if (!hasAnyStone(board)) {
    return { row: center, col: center };
  }

  const candidates = getCandidates(board, 1);
  if (candidates.length === 0) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === EMPTY) return { row: r, col: c };
      }
    }
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return pick.coord;
}