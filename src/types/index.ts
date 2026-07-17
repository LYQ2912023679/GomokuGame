export type Stone = 0 | 1 | 2;

export interface Coord {
  row: number;
  col: number;
}

export type Board = Stone[][];

export type Player = 1 | 2;
export type Side = 'black' | 'white';

export type GameMode = 'pvp' | 'pve';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameStatus = 'idle' | 'playing' | 'won' | 'draw' | 'resigned';

export type Direction = 'horizontal' | 'vertical' | 'diagonalDown' | 'diagonalUp';

export interface MoveRecord {
  player: Player;
  coord: Coord;
  stepNo: number;
  timestamp: number;
}

export interface WinResult {
  winner: Player | null;
  line: Coord[];
  direction: Direction | null;
}

export interface GameConfig {
  mode: GameMode;
  humanSide: Side;
  difficulty: Difficulty;
}

export interface GameState {
  config: GameConfig;
  board: Board;
  history: MoveRecord[];
  currentTurn: Player;
  status: GameStatus;
  winResult: WinResult | null;
  startTime: number | null;
  endTime: number | null;
}

export type Theme = 'light' | 'dark';