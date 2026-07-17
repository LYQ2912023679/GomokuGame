import type { Board, Coord, Difficulty, Player } from '../types';
import { findBestMove, findBestMoveSimple, findRandomMove } from './searcher';

export function getDifficultyDepth(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 0;
    case 'normal':
      return 1;
    case 'hard':
      return 3;
    default:
      return 1;
  }
}

export function findMoveByDifficulty(
  board: Board,
  player: Player,
  difficulty: Difficulty,
): Coord {
  switch (difficulty) {
    case 'easy':
      return findRandomMove(board);
    case 'normal':
      return findBestMoveSimple(board, player);
    case 'hard':
      return findBestMove(board, player, getDifficultyDepth('hard'));
    default:
      return findBestMoveSimple(board, player);
  }
}