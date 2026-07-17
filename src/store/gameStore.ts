import { create } from 'zustand';
import type {
  Board,
  Coord,
  GameConfig,
  GameStatus,
  MoveRecord,
  Player,
  Side,
  WinResult,
} from '../types';
import { BLACK, WHITE } from '../constants/board';
import { canPlace, createEmptyBoard, placeStone } from '../logic/board';
import { checkDraw, checkWin } from '../logic/referee';
import { appendMove, rebuildBoard, undoMoves } from '../logic/history';
import { currentTurnAfterHistory, nextTurn } from '../logic/turn';
import { findMoveByDifficulty } from '../ai/difficulty';
import { saveLastConfig } from '../utils/storage';

export interface GameStore {
  config: GameConfig;
  board: Board;
  history: MoveRecord[];
  currentTurn: Player;
  status: GameStatus;
  winResult: WinResult | null;
  startTime: number | null;
  endTime: number | null;
  aiThinking: boolean;

  startGame: (config: GameConfig) => void;
  place: (coord: Coord) => void;
  aiMove: () => void;
  undo: () => void;
  resign: () => void;
  restart: () => void;
  backToMenu: () => void;
  getStepCount: (player: Player) => number;
  getElapsedMs: () => number;
  isHumanTurn: () => boolean;
}

function sideToPlayer(side: Side): Player {
  return side === 'black' ? BLACK : WHITE;
}

const defaultConfig: GameConfig = {
  mode: 'pvp',
  humanSide: 'black',
  difficulty: 'normal',
};

function applyMove(state: GameStore, coord: Coord): Partial<GameStore> {
  const player = state.currentTurn;
  const board = placeStone(state.board, coord, player);
  const move: MoveRecord = {
    player,
    coord,
    stepNo: state.history.length + 1,
    timestamp: Date.now(),
  };
  const history = appendMove(state.history, move);

  const winResult = checkWin(board, coord);
  if (winResult.winner) {
    return {
      board,
      history,
      status: 'won',
      winResult,
      endTime: Date.now(),
    };
  }
  if (checkDraw(board)) {
    return {
      board,
      history,
      status: 'draw',
      winResult: { winner: null, line: [], direction: null },
      endTime: Date.now(),
    };
  }
  return {
    board,
    history,
    currentTurn: nextTurn(player),
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  config: defaultConfig,
  board: createEmptyBoard(),
  history: [],
  currentTurn: BLACK,
  status: 'idle',
  winResult: null,
  startTime: null,
  endTime: null,
  aiThinking: false,

  startGame: (config) => {
    saveLastConfig(config);
    const firstPlayer: Player = config.mode === 'pve' && config.humanSide === 'white'
      ? BLACK
      : BLACK;
    set({
      config,
      board: createEmptyBoard(),
      history: [],
      currentTurn: firstPlayer,
      status: 'playing',
      winResult: null,
      startTime: Date.now(),
      endTime: null,
      aiThinking: false,
    });

    if (config.mode === 'pve' && sideToPlayer(config.humanSide) === WHITE) {
      setTimeout(() => get().aiMove(), 100);
    }
  },

  place: (coord) => {
    const state = get();
    if (state.status !== 'playing') return;
    if (state.aiThinking) return;
    if (!canPlace(state.board, coord)) return;

    set(applyMove(state, coord) as GameStore);

    const next = get();
    if (next.status === 'playing' && next.config.mode === 'pve') {
      const aiSide = next.config.humanSide === 'black' ? WHITE : BLACK;
      if (next.currentTurn === aiSide) {
        setTimeout(() => get().aiMove(), 120);
      }
    }
  },

  aiMove: () => {
    const state = get();
    if (state.status !== 'playing') return;
    if (state.config.mode !== 'pve') return;
    const aiSide = state.config.humanSide === 'black' ? WHITE : BLACK;
    if (state.currentTurn !== aiSide) return;

    set({ aiThinking: true });

    setTimeout(() => {
      const current = get();
      if (current.status !== 'playing') {
        set({ aiThinking: false });
        return;
      }
      const coord = findMoveByDifficulty(
        current.board,
        aiSide,
        current.config.difficulty,
      );
      set({ aiThinking: false });
      set(applyMove(current, coord) as GameStore);
    }, 20);
  },

  undo: () => {
    const state = get();
    if (state.status !== 'playing') return;
    if (state.history.length === 0) return;

    const n = state.config.mode === 'pve' ? 2 : 1;
    if (state.history.length < n) return;

    const history = undoMoves(state.history, n);
    const board = rebuildBoard(history);
    const currentTurn = currentTurnAfterHistory(history);

    set({
      board,
      history,
      currentTurn,
      winResult: null,
      aiThinking: false,
    });
  },

  resign: () => {
    const state = get();
    if (state.status !== 'playing') return;
    const winner: Player = nextTurn(state.currentTurn);
    set({
      status: 'resigned',
      winResult: { winner, line: [], direction: null },
      endTime: Date.now(),
      aiThinking: false,
    });
  },

  restart: () => {
    const state = get();
    const firstPlayer: Player = state.config.mode === 'pve' && state.config.humanSide === 'white'
      ? BLACK
      : BLACK;
    set({
      board: createEmptyBoard(),
      history: [],
      currentTurn: firstPlayer,
      status: 'playing',
      winResult: null,
      startTime: Date.now(),
      endTime: null,
      aiThinking: false,
    });

    if (state.config.mode === 'pve' && sideToPlayer(state.config.humanSide) === WHITE) {
      setTimeout(() => get().aiMove(), 100);
    }
  },

  backToMenu: () => {
    set({
      board: createEmptyBoard(),
      history: [],
      currentTurn: BLACK,
      status: 'idle',
      winResult: null,
      startTime: null,
      endTime: null,
      aiThinking: false,
    });
  },

  getStepCount: (player) => {
    return get().history.filter((m) => m.player === player).length;
  },

  getElapsedMs: () => {
    const state = get();
    if (!state.startTime) return 0;
    const end = state.endTime ?? Date.now();
    return end - state.startTime;
  },

  isHumanTurn: () => {
    const state = get();
    if (state.status !== 'playing') return false;
    if (state.config.mode === 'pvp') return true;
    const humanSide = sideToPlayer(state.config.humanSide);
    return state.currentTurn === humanSide && !state.aiThinking;
  },
}));