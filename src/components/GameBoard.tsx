import { useMemo } from 'react';
import type { Coord, Stone as StoneType } from '../types';
import { BOARD_SIZE } from '../constants/board';
import { useGameStore } from '../store/gameStore';
import { pixelToCoord, coordToLabel } from '../utils/coord';
import { Stone } from './Stone';
import './GameBoard.css';

export function GameBoard() {
  const board = useGameStore((s) => s.board);
  const history = useGameStore((s) => s.history);
  const winResult = useGameStore((s) => s.winResult);
  const isHumanTurn = useGameStore((s) => s.isHumanTurn);
  const place = useGameStore((s) => s.place);
  const config = useGameStore((s) => s.config);
  const aiThinking = useGameStore((s) => s.aiThinking);

  const lastMove: Coord | null = history.length > 0 ? history[history.length - 1].coord : null;
  const winSet = useMemo(() => {
    const set = new Set<string>();
    if (winResult?.line) {
      for (const c of winResult.line) set.add(`${c.row},${c.col}`);
    }
    return set;
  }, [winResult]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (aiThinking) return;
    if (config.mode === 'pve' && !isHumanTurn()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = rect.width / (BOARD_SIZE - 1);
    const coord = pixelToCoord(e.clientX, e.clientY, rect, cellSize);
    if (coord) place(coord);
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = rect.width / (BOARD_SIZE - 1);
    const coord = pixelToCoord(e.clientX, e.clientY, rect, cellSize);
    const preview = document.querySelector<HTMLDivElement>('.stone-preview');
    const label = document.querySelector<HTMLDivElement>('.coord-label');
    if (!coord || board[coord.row][coord.col] !== 0) {
      if (preview) preview.style.display = 'none';
      if (label) label.style.display = 'none';
      return;
    }
    if (preview) {
      preview.style.display = 'block';
      preview.style.left = `${(coord.col / (BOARD_SIZE - 1)) * 100}%`;
      preview.style.top = `${(coord.row / (BOARD_SIZE - 1)) * 100}%`;
    }
    if (label) {
      label.style.display = 'block';
      label.textContent = coordToLabel(coord);
      label.style.left = `${(coord.col / (BOARD_SIZE - 1)) * 100}%`;
      label.style.top = `${(coord.row / (BOARD_SIZE - 1)) * 100}%`;
    }
  };

  const handleLeave = () => {
    const preview = document.querySelector<HTMLDivElement>('.stone-preview');
    const label = document.querySelector<HTMLDivElement>('.coord-label');
    if (preview) preview.style.display = 'none';
    if (label) label.style.display = 'none';
  };

  return (
    <div
      className="board-wrapper"
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="board-grid" />
      <div className="board-stones">
        {board.map((row, r) =>
          row.map((cell: StoneType, c) => {
            const key = `${r},${c}`;
            const isLast = lastMove?.row === r && lastMove?.col === c;
            const isWin = winSet.has(key);
            if (cell === 0) return null;
            return (
              <Stone
                key={key}
                player={cell}
                row={r}
                col={c}
                isLast={isLast}
                isWin={isWin}
              />
            );
          }),
        )}
        <div className="stone-preview" style={{ display: 'none' }} />
        <div className="coord-label" style={{ display: 'none' }} />
      </div>
      {aiThinking && <div className="ai-thinking-overlay">AI 思考中…</div>}
    </div>
  );
}