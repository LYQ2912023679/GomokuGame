import type { GameConfig, Theme } from '../types';

const THEME_KEY = 'gomoku.theme';
const CONFIG_KEY = 'gomoku.lastConfig';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function loadTheme(): Theme | null {
  const value = safeGet(THEME_KEY);
  if (value === 'light' || value === 'dark') return value;
  return null;
}

export function saveTheme(theme: Theme): void {
  safeSet(THEME_KEY, theme);
}

export function loadLastConfig(): Partial<GameConfig> | null {
  const value = safeGet(CONFIG_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as Partial<GameConfig>;
  } catch {
    return null;
  }
}

export function saveLastConfig(config: GameConfig): void {
  safeSet(CONFIG_KEY, JSON.stringify(config));
}