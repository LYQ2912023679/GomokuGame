import { BOARD_SIZE, BLACK } from '../constants/board';
import './GameBoard.css';

export function Stone({
  player,
  row,
  col,
  isLast,
  isWin,
}: {
  player: 1 | 2;
  row: number;
  col: number;
  isLast: boolean;
  isWin: boolean;
}) {
  const left = (col / (BOARD_SIZE - 1)) * 100;
  const top = (row / (BOARD_SIZE - 1)) * 100;
  const className = [
    'stone',
    player === BLACK ? 'stone-black' : 'stone-white',
    isLast ? 'stone-last' : '',
    isWin ? 'stone-win' : '',
  ].join(' ').trim();

  return (
    <div
      className={className}
      style={{ left: `${left}%`, top: `${top}%` }}
    />
  );
}