import { useGameStore } from '../store/gameStore';
import './ResultModal.css';

interface Props {
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function ResultModal({ onRestart, onBackToMenu }: Props) {
  const status = useGameStore((s) => s.status);
  const winResult = useGameStore((s) => s.winResult);
  const config = useGameStore((s) => s.config);

  if (status !== 'won' && status !== 'draw' && status !== 'resigned') return null;

  let title = '';
  let subtitle = '';

  if (status === 'draw') {
    title = '和棋';
    subtitle = '棋盘已满，难分胜负';
  } else if (status === 'won' || status === 'resigned') {
    const winner = winResult?.winner;
    const winnerSide = winner === 1 ? '黑方' : '白方';
    title = `${winnerSide}胜`;
    if (status === 'resigned') {
      subtitle = '对方认输';
    } else {
      subtitle = '五子连珠';
    }
    if (config.mode === 'pve') {
      const humanSide = config.humanSide === 'black' ? 1 : 2;
      const isHumanWin = winner === humanSide;
      title = isHumanWin ? '你赢了' : '你输了';
      subtitle = status === 'resigned'
        ? isHumanWin ? 'AI 认输' : '你已认输'
        : isHumanWin ? '五子连珠，恭喜' : 'AI 五子连珠';
    }
  }

  return (
    <div className="result-overlay">
      <div className="result-modal">
        <h2 className="result-title">{title}</h2>
        <p className="result-subtitle">{subtitle}</p>
        <div className="result-actions">
          <button className="result-btn result-primary" onClick={onRestart}>
            再来一局
          </button>
          <button className="result-btn" onClick={onBackToMenu}>
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}