import { useState } from 'react';
import type { Difficulty, GameMode, Side } from '../types';
import { useGameStore } from '../store/gameStore';
import { loadLastConfig } from '../utils/storage';
import './MainMenu.css';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

export function MainMenu() {
  const startGame = useGameStore((s) => s.startGame);
  const lastConfig = loadLastConfig();

  const [mode, setMode] = useState<GameMode>(lastConfig?.mode ?? 'pvp');
  const [humanSide, setHumanSide] = useState<Side>(lastConfig?.humanSide ?? 'black');
  const [difficulty, setDifficulty] = useState<Difficulty>(lastConfig?.difficulty ?? 'normal');

  const handleStart = () => {
    startGame({ mode, humanSide, difficulty });
  };

  return (
    <div className="main-menu">
      <h1 className="menu-title">五子棋</h1>
      <p className="menu-subtitle">五子连珠，先者为胜</p>

      <section className="menu-section">
        <h2 className="section-label">对局模式</h2>
        <div className="btn-group">
          <button
            className={mode === 'pvp' ? 'btn btn-active' : 'btn'}
            onClick={() => setMode('pvp')}
          >
            人人对战
          </button>
          <button
            className={mode === 'pve' ? 'btn btn-active' : 'btn'}
            onClick={() => setMode('pve')}
          >
            人机对战
          </button>
        </div>
      </section>

      {mode === 'pve' && (
        <>
          <section className="menu-section">
            <h2 className="section-label">执子方</h2>
            <div className="btn-group">
              <button
                className={humanSide === 'black' ? 'btn btn-active' : 'btn'}
                onClick={() => setHumanSide('black')}
              >
                执黑（先手）
              </button>
              <button
                className={humanSide === 'white' ? 'btn btn-active' : 'btn'}
                onClick={() => setHumanSide('white')}
              >
                执白（后手）
              </button>
            </div>
          </section>

          <section className="menu-section">
            <h2 className="section-label">AI 难度</h2>
            <div className="btn-group">
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className={difficulty === d ? 'btn btn-active' : 'btn'}
                  onClick={() => setDifficulty(d)}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <button className="start-btn" onClick={handleStart}>
        开始对局
      </button>
    </div>
  );
}