/**
 * Gestión del tema claro / oscuro.
 */

import { $, showToast } from './dom';
import { STORAGE_KEYS, readString, writeString } from './storage';

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = $('#theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

export function initTheme(): void {
  const saved = readString(STORAGE_KEYS.theme);
  applyTheme(saved === 'light' ? 'light' : 'dark');
}

export function toggleTheme(): void {
  const current = document.documentElement.getAttribute('data-theme');
  const next: Theme = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  writeString(STORAGE_KEYS.theme, next);
  showToast(`Modo ${next === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
}
