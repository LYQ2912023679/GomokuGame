import type { Coord } from '../types';
import { BOARD_SIZE } from '../constants/board';

const COL_LETTERS = 'ABCDEFGHIJKLMNO';

export function coordToLabel(coord: Coord): string {
  const col = COL_LETTERS[coord.col] ?? '?';
  const row = BOARD_SIZE - coord.row;
  return `${col}${row}`;
}

export function labelToCoord(label: string): Coord | null {
  const match = /^([A-O])(\d{1,2})$/.exec(label.toUpperCase());
  if (!match) return null;
  const col = COL_LETTERS.indexOf(match[1]);
  const row = BOARD_SIZE - parseInt(match[2], 10);
  if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) return null;
  return { row, col };
}

export function pixelToCoord(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  cellSize: number,
): Coord | null {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const col = Math.round(x / cellSize);
  const row = Math.round(y / cellSize);
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  const dx = x - col * cellSize;
  const dy = y - row * cellSize;
  if (Math.hypot(dx, dy) > cellSize / 2) return null;
  return { row, col };
}