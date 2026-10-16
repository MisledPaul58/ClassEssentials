/**
 * Modo dueño (administrador):
 *  - Inicio de sesión secreto mediante contraseña verificada por hash SHA-256
 *    (nunca se guarda ni se publica la contraseña en claro).
 *  - Barra de gestión del tablón: editar/borrar cualquier publicación,
 *    publicar anuncios oficiales, restaurar contenido y conectar Firebase.
 *  - TRIGGERS SECRETOS: triple clic en el logo, clic en el punto del pie de
 *    página, Ctrl+Shift+A / Alt+A o la URL con `#admin`.
 */

import { renderBoard, openPublishModal } from './announcements';
import { ADMIN_PIN_HASH, OWNER_CONFIG } from './config';
import { sha256Hex } from './crypto';
import { CloudDB } from './db';
import { $, closeModal, openModal, showToast } from './dom';
import { state } from './state';
import { STORAGE_KEYS, readString, removeKey, writeString } from './storage';
import type { FirebaseConfigLike } from './types';

export function initAdmin(): void {
  state.isAdmin = readString(STORAGE_KEYS.adminSession) === 'true';
  updateOwnerBadge();

  bindSecretTriggers();
  bindLoginModal();
  bindChangePasswordModal();
  bindDbConfigModal();

  $('#btn-owner-logout-pill')?.addEventListener('click', logoutAdmin);
}

/* -------------------------------------------------------------------------
   Estado e insignia flotante
   ------------------------------------------------------------------------- */

function updateOwnerBadge(): void {
  const badge = $('#owner-floating-badge');
  if (badge) badge.style.display = state.isAdmin ? 'flex' : 'none';
}

function logoutAdmin(): void {
  if (!confirm('¿Deseas cerrar la sesión de administrador?')) return;
  state.isAdmin = false;
  removeKey(STORAGE_KEYS.adminSession);
  updateOwnerBadge();
  renderAdminToolbar();
  renderBoard();
  showToast('Sesión de administrador cerrada', 'info');
}

/* -------------------------------------------------------------------------
   Barra de gestión del dueño
   ------------------------------------------------------------------------- */

export function renderAdminToolbar(): void {
  const container = $('#admin-toolbar-wrap');
  if (!container) return;

  if (!state.isAdmin) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="admin-banner">
      <div class="admin-banner-text">
        <span class="admin-banner-title"><span>👑</span> Modo Dueño Activo (${OWNER_CONFIG.name})</span>
        <span class="admin-banner-desc">
          Control total del tablón: cada tarjeta muestra botones para <strong>editar y borrar</strong>.
          También puedes crear anuncios oficiales o conectar la base de datos en la nube.
        </span>
      </div>

      <div class="admin-actions-group">
        <button class="btn btn-primary btn-sm" id="btn-admin-add-official"><span>➕</span> Publicar Anuncio Oficial</button>
        <button class="btn btn-secondary btn-sm" id="btn-admin-open-db-config" title="Conectar o editar Firebase Firestore"><span>⚙️</span> Conectar Firebase</button>
        <button class="btn btn-secondary btn-sm" id="btn-admin-open-pwd-modal" title="Cambiar la contraseña de administrador de este navegador"><span>🔑</span> Cambiar Contraseña</button>
        <button class="btn btn-secondary btn-sm" id="btn-admin-restore-defaults" title="Restaurar los anuncios predeterminados"><span>🔄</span> Restaurar Originales</button>
        <button class="btn btn-danger-outline btn-sm" id="btn-admin-logout"><span>🔒</span> Salir del Modo Dueño</button>
      </div>
    </div>
  `;

  $('#btn-admin-add-official')?.addEventListener('click', () => openPublishModal(true));

  $('#btn-admin-open-db-config')?.addEventListener('click', openDbConfigModal);

  $('#btn-admin-open-pwd-modal')?.addEventListener('click', openChangePasswordModal);

  $('#btn-admin-restore-defaults')?.addEventListener('click', () => {
    if (confirm('¿Deseas restaurar los anuncios oficiales iniciales?')) {
      void CloudDB.seedDefaultAnnouncements();
      showToast('Anuncios originales restaurados', 'success');
    }
  });

  $('#btn-admin-logout')?.addEventListener('click', logoutAdmin);
}

/* -------------------------------------------------------------------------
   Inicio de sesión
   ------------------------------------------------------------------------- */

function bindSecretTriggers(): void {
  // 1. Triple clic en el logo
  const secretLogo = $('#secret-logo-trigger');
  if (secretLogo) {
    let clicks = 0;
    let lastClick = 0;
    secretLogo.addEventListener('click', () => {
      const now = Date.now();
      clicks = now - lastClick < 600 ? clicks + 1 : 1;
      lastClick = now;
      if (clicks >= 3) {
        clicks = 0;
        openAdminLoginModal();
      }
    });
  }

  // 2. Clic en el punto del pie de página
  $('#secret-admin-trigger')?.addEventListener('click', openAdminLoginModal);

  // 3. Atajo de teclado: Ctrl+Shift+A o Alt+A
  window.addEventListener('keydown', event => {
    const isShortcut =
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') ||
      (event.altKey && event.key.toLowerCase() === 'a');
    if (isShortcut) {
      event.preventDefault();
      openAdminLoginModal();
    }
  });
}

export function openAdminLoginModal(): void {
  const modal = $('#admin-login-modal');
  const input = $('#admin-pin-input') as HTMLInputElement | null;
  if (input) input.value = '';
  openModal(modal);
  setTimeout(() => input?.focus(), 100);
}

function bindLoginModal(): void {
  const modal = $('#admin-login-modal');
  if (!modal) return;

  $('#admin-login-form')?.addEventListener('submit', event => void handleAdminLoginSubmit(event as SubmitEvent));
  $('#btn-close-admin-modal')?.addEventListener('click', () => closeModal(modal));
  $('#btn-cancel-admin-modal')?.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
}

/**
 * Comprueba la contraseña comparando hashes SHA-256:
 *  1º hash personalizado guardado en este navegador (si existe),
 *  2º contraseña global definida por el dueño en la variable de entorno.
 */
async function isPinValid(pin: string): Promise<boolean> {
  let enteredHash: string;
  try {
    enteredHash = await sha256Hex(pin);
  } catch {
    showToast('No se pudo verificar la contraseña en este navegador.', 'error');
    return false;
  }

  const customHash = readString(STORAGE_KEYS.customAdminPwdHash);
  if (customHash) return enteredHash === customHash;

  // Migración automática desde la contraseña antigua guardada en texto plano:
  // si el usuario la introduce, pasa a guardarse hasheada y se borra la vieja.
  // Si no coincide, se sigue comprobando la contraseña global (así el PIN del
  // dueño funciona aunque queden restos de la versión antigua en el navegador).
  const legacyPassword = readString(STORAGE_KEYS.legacyCustomAdminPwd);
  if (legacyPassword && pin === legacyPassword) {
    writeString(STORAGE_KEYS.customAdminPwdHash, enteredHash);
    removeKey(STORAGE_KEYS.legacyCustomAdminPwd);
    return true;
  }

  if (!ADMIN_PIN_HASH) {
    showToast('No hay contraseña de administrador configurada.', 'warn');
    return false;
  }
  return enteredHash === ADMIN_PIN_HASH;
}

async function handleAdminLoginSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const input = $('#admin-pin-input') as HTMLInputElement | null;
  const pin = input?.value.trim() ?? '';
  if (!pin) return;

  if (!(await isPinValid(pin))) {
    showToast('Contraseña incorrecta.', 'error');
    input?.select();
    return;
  }

  state.isAdmin = true;
  writeString(STORAGE_KEYS.adminSession, 'true');
  closeModal($('#admin-login-modal'));
  updateOwnerBadge();
  renderAdminToolbar();
  renderBoard();
  showToast('¡Modo Dueño activado! Ya puedes editar y gestionar el tablón.', 'success');
}

/* -------------------------------------------------------------------------
   Cambio de contraseña (solo en este navegador)
   ------------------------------------------------------------------------- */

function openChangePasswordModal(): void {
  const modal = $('#change-pwd-modal');
  ($('#new-admin-pwd-input') as HTMLInputElement | null)!.value = '';
  ($('#confirm-admin-pwd-input') as HTMLInputElement | null)!.value = '';
  openModal(modal);
  setTimeout(() => $('#new-admin-pwd-input')?.focus(), 100);
}

function bindChangePasswordModal(): void {
  const modal = $('#change-pwd-modal');
  if (!modal) return;

  $('#change-pwd-form')?.addEventListener('submit', event => void handleChangePasswordSubmit(event as SubmitEvent));
  $('#btn-close-change-pwd-modal')?.addEventListener('click', () => closeModal(modal));
  $('#btn-cancel-change-pwd-modal')?.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
}

async function handleChangePasswordSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const newPassword = ($('#new-admin-pwd-input') as HTMLInputElement | null)?.value.trim() ?? '';
  const confirmPassword = ($('#confirm-admin-pwd-input') as HTMLInputElement | null)?.value.trim() ?? '';

  if (newPassword.length < 4) {
    showToast('La contraseña debe tener al menos 4 caracteres.', 'warn');
    return;
  }
  if (newPassword !== confirmPassword) {
    showToast('Las contraseñas no coinciden.', 'warn');
    return;
  }

  try {
    writeString(STORAGE_KEYS.customAdminPwdHash, await sha256Hex(newPassword));
  } catch {
    showToast('No se pudo guardar la contraseña en este navegador.', 'error');
    return;
  }

  closeModal($('#change-pwd-modal'));
  showToast('Contraseña actualizada solo en este navegador', 'success');
}

/* -------------------------------------------------------------------------
   Conexión avanzada con Firebase (config personalizada)
   ------------------------------------------------------------------------- */

function openDbConfigModal(): void {
  const modal = $('#db-config-modal');
  const textarea = $('#firebase-config-input') as HTMLTextAreaElement | null;
  if (textarea) {
    const currentConfig = CloudDB.getConfig();
    textarea.value = currentConfig ? JSON.stringify(currentConfig, null, 2) : '';
  }
  openModal(modal);
}

function bindDbConfigModal(): void {
  const modal = $('#db-config-modal');
  if (!modal) return;

  $('#db-config-form')?.addEventListener('submit', event => void handleDbConfigSubmit(event as SubmitEvent));
  $('#btn-close-db-modal')?.addEventListener('click', () => closeModal(modal));
  $('#btn-cancel-db-modal')?.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
}

async function handleDbConfigSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const textarea = $('#firebase-config-input') as HTMLTextAreaElement | null;
  const raw = textarea?.value.trim() ?? '';

  try {
    const parsed = JSON.parse(raw) as FirebaseConfigLike;
    if (!parsed.projectId || !parsed.apiKey) {
      throw new Error('Faltan los campos projectId o apiKey');
    }

    CloudDB.saveCustomConfig(parsed);
    closeModal($('#db-config-modal'));
    showToast('Guardando configuración y conectando con Firebase...', 'info');
    await CloudDB.init();
  } catch (error) {
    showToast(
      'El JSON no es válido: ' + (error instanceof Error ? error.message : 'revisa la estructura de Firebase'),
      'error'
    );
  }
}

/* -------------------------------------------------------------------------
   Acceso rápido por URL (secret): ?admin o #admin
   ------------------------------------------------------------------------- */

export function checkUrlSecretAdminTrigger(): void {
  if (window.location.search.includes('admin') || window.location.hash === '#admin') {
    setTimeout(() => openAdminLoginModal(), 300);
  }
}
