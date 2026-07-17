import type { Direction } from '../types';

export const BOARD_SIZE = 15;
export const WIN_COUNT = 5;

export const DIRECTIONS: ReadonlyArray<[number, number, Direction]> = [
  [0, 1, 'horizontal'],
  [1, 0, 'vertical'],
  [1, 1, 'diagonalDown'],
  [1, -1, 'diagonalUp'],
];

export const EMPTY: 0 = 0;
export const BLACK: 1 = 1;
export const WHITE: 2 = 2;