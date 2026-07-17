import { useEffect, useState } from 'react';
import { BLACK } from '../constants/board';
import { useGameStore } from '../store/gameStore';
import type { GameConfig } from '../types';
import './InfoPanel.css';

interface Props {
  onResign: () => void;
  onBackToMenu: () => void;
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function InfoPanel({ onResign, onBackToMenu }: Props) {
  const currentTurn = useGameStore((s) => s.currentTurn);
  const status = useGameStore((s) => s.status);
  const history = useGameStore((s) => s.history);
  const config = useGameStore((s) => s.config) as GameConfig;
  const getStepCount = useGameStore((s) => s.getStepCount);
  const getElapsedMs = useGameStore((s) => s.getElapsedMs);
  const undo = useGameStore((s) => s.undo);
  const restart = useGameStore((s) => s.restart);
  const aiThinking = useGameStore((s) => s.aiThinking);

  const [, setTick] = useState(0);
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [status]);

  const blackSteps = getStepCount(BLACK);
  const whiteSteps = getStepCount(2);
  const elapsed = getElapsedMs();

  const canUndo = status === 'playing' && history.length >= (config.mode === 'pve' ? 2 : 1) && !aiThinking;

  const turnLabel = aiThinking
    ? 'AI 思考中…'
    : currentTurn === BLACK
      ? '黑方回合'
      : '白方回合';

  return (
    <div className="info-panel">
      <div className="turn-indicator">
        <span className={currentTurn === BLACK ? 'dot dot-black' : 'dot dot-white'} />
        <span className="turn-text">{turnLabel}</span>
      </div>

      <div className="stat-grid">
        <div className="stat-item">
          <span className="stat-label">黑方步数</span>
          <span className="stat-value">{blackSteps}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">白方步数</span>
          <span className="stat-value">{whiteSteps}</span>
        </div>
        <div className="stat-item stat-time">
          <span className="stat-label">用时</span>
          <span className="stat-value">{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="action-btn"
          onClick={undo}
          disabled={!canUndo}
        >
          悔棋
        </button>
        <button
          className="action-btn action-warning"
          onClick={onResign}
          disabled={status !== 'playing' || aiThinking}
        >
          认输
        </button>
        <button className="action-btn" onClick={restart}>
          重新开始
        </button>
        <button className="action-btn action-danger" onClick={onBackToMenu}>
          返回主菜单
        </button>
      </div>
    </div>
  );
}