import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import { InfoPanel } from './components/InfoPanel';
import { ResultModal } from './components/ResultModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import type { Theme } from './types';
import { loadTheme, saveTheme } from './utils/storage';
import './App.css';

function getInitialTheme(): Theme {
  const stored = loadTheme();
  if (stored) return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function App() {
  const status = useGameStore((s) => s.status);
  const resign = useGameStore((s) => s.resign);
  const backToMenu = useGameStore((s) => s.backToMenu);
  const restart = useGameStore((s) => s.restart);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [confirm, setConfirm] = useState<{ type: 'resign' | 'back'; message: string } | null>(null);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    saveTheme(next);
  };

  const handleResignRequest = () => setConfirm({ type: 'resign', message: '确认认输？' });
  const handleBackRequest = () => setConfirm({ type: 'back', message: '确认返回主菜单？当前对局将丢失。' });
  const handleConfirm = () => {
    if (confirm?.type === 'resign') resign();
    else if (confirm?.type === 'back') backToMenu();
    setConfirm(null);
  };

  return (
    <div className={theme === 'dark' ? 'app app-dark' : 'app'}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="切换主题">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {status === 'idle' ? (
        <MainMenu />
      ) : (
        <div className="game-view">
          <GameBoard />
          <InfoPanel onResign={handleResignRequest} onBackToMenu={handleBackRequest} />
        </div>
      )}

      <ResultModal onRestart={restart} onBackToMenu={handleBackRequest} />

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default App;