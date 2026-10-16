/**
 * Utilidades del DOM: consultas, escapado de HTML, modales y notificaciones.
 */

export function $<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

export function $all<T extends HTMLElement = HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapa cualquier valor antes de inyectarlo con innerHTML.
 * Imprescindible para el contenido que escriben los compañeros (títulos,
 * descripciones, autores...) y evitar inyección de HTML/scripts.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPES[char] ?? char);
}

/**
 * Valida y normaliza un enlace aportado por un usuario.
 * Solo se permiten http(s) y mailto; cualquier otro esquema (javascript:, data:...)
 * se descarta devolviendo null.
 */
export function safeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : null;
}

/* -------------------------------------------------------------------------
   Modales
   ------------------------------------------------------------------------- */

export function openModal(modal: HTMLElement | null): void {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

export function closeModal(modal: HTMLElement | null): void {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-backdrop.active')) {
    document.body.style.overflow = '';
  }
}

/** Cierra todos los modales abiertos (por ejemplo, con la tecla Escape). */
export function closeActiveModals(): void {
  document.querySelectorAll<HTMLElement>('.modal-backdrop.active').forEach(modal => closeModal(modal));
}

/* -------------------------------------------------------------------------
   Notificaciones tipo "toast"
   ------------------------------------------------------------------------- */

export type ToastType = 'info' | 'success' | 'warn' | 'error';

const TOAST_ICONS: Record<ToastType, string> = {
  info: 'ℹ️',
  success: '✅',
  warn: '⚠️',
  error: '❌'
};

export function showToast(message: string, type: ToastType = 'info'): void {
  const container = $('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = document.createElement('span');
  icon.textContent = TOAST_ICONS[type];

  const text = document.createElement('span');
  text.textContent = message; // textContent evita inyecciones con el mensaje

  toast.append(icon, text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
