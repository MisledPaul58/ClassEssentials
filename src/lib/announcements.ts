/**
 * Tablón de anuncios y recursos.
 *
 * Sistema de propiedad "sin cuentas": al cargar la página se genera un token
 * aleatorio en memoria. Las publicaciones creadas desde esta sesión guardan ese
 * token, por lo que sus botones de Editar/Borrar solo aparecen hasta que se
 * recargue la página. El dueño (modo admin) puede gestionar cualquier tarjeta.
 */

import { OWNER_CONFIG } from './config';
import { randomToken } from './crypto';
import { CloudDB, type NewAnnouncementInput, type UpdateAnnouncementInput } from './db';
import { formatShortDate, parseISODate } from './dates';
import { $, closeModal, escapeHtml, openModal, safeUrl, showToast } from './dom';
import { state } from './state';
import type { Announcement } from './types';

/** Token de autor válido "hasta que se recargue la página". */
const OWNER_TOKEN = randomToken();

/** Id de la publicación en edición (null → el modal está en modo "crear"). */
let editingId: string | null = null;
/** ¿El modal está publicando como administrador? (solo en modo creación). */
let publishingAsAdmin = false;
/** HTML original del botón de envío, para restaurarlo tras guardar. */
let submitButtonHtml = '';

/* -------------------------------------------------------------------------
   Inicialización
   ------------------------------------------------------------------------- */

export function initBoard(): void {
  CloudDB.init((posts, isCloudConnected) => {
    state.announcements = posts;
    state.isCloudConnected = isCloudConnected;
    renderDbStatus();
    renderBoard();
  });

  bindBoardToolbar();
  bindPublishModal();
  bindGridActions();
}

/* -------------------------------------------------------------------------
   Permisos
   ------------------------------------------------------------------------- */

function canManage(post: Announcement): boolean {
  if (state.isAdmin) return true;
  return Boolean(post.ownerToken && post.ownerToken === OWNER_TOKEN);
}

/* -------------------------------------------------------------------------
   Render
   ------------------------------------------------------------------------- */

export function renderDbStatus(): void {
  const badge = $('#db-connection-status');
  const text = $('#db-status-text');
  if (!badge || !text) return;

  if (state.isCloudConnected) {
    badge.className = 'db-status-badge connected';
    text.textContent = 'En la Nube (Tiempo Real)';
    badge.title = 'Conectado a Firebase Firestore: todo lo que publiques o borres se actualiza en tiempo real para todos.';
  } else {
    badge.className = 'db-status-badge fallback';
    text.textContent = 'Base de Datos Local Activa';
    badge.title = 'Tablón activo en este navegador. El dueño puede conectar Firebase para sincronización en tiempo real.';
  }
}

export function renderBoard(): void {
  const container = $('#resources-grid');
  if (!container) return;

  const query = state.resourceSearchQuery.trim().toLowerCase();
  const category = state.resourceCategoryFilter;

  const filtered = state.announcements.filter(post => {
    const matchesCategory =
      category === 'all'
        ? true
        : category === 'community'
          ? !post.isOfficial
          : category === 'official'
            ? Boolean(post.isOfficial)
            : post.category === category;

    const haystack = [post.title, post.description, post.author, post.category].join(' ').toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="board-empty">
        <p class="board-empty-title">No se encontraron recursos ni anuncios.</p>
        <p class="board-empty-sub">Prueba con otro filtro o publica el primer recurso con el botón superior.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(renderResourceCard).join('');
}

function renderResourceCard(post: Announcement): string {
  const link = safeUrl(post.link);
  const dateStr = post.date ? formatShortDate(parseISODate(post.date)) : '';
  const isEdited = Boolean(post.updatedAt);
  const manageable = canManage(post);

  const actionsHtml = manageable
    ? `
      <div class="resource-actions">
        <button type="button" class="btn-action btn-action-edit" data-action="edit" data-id="${escapeHtml(post.id)}"
          title="${state.isAdmin ? 'Editar esta publicación (Admin)' : 'Editar tu publicación (hasta que recargues la página)'}">
          <span>✏️</span> Editar
        </button>
        <button type="button" class="btn-action btn-action-delete" data-action="delete" data-id="${escapeHtml(post.id)}"
          title="${state.isAdmin ? 'Borrar esta publicación (Admin)' : 'Borrar tu publicación (hasta que recargues la página)'}">
          <span>🗑️</span> Borrar
        </button>
      </div>`
    : '';

  return `
    <article class="resource-card ${post.isOfficial ? 'owner-post' : 'peer-post'}" id="card-${escapeHtml(post.id)}">
      <header class="resource-header">
        <span class="resource-category">${escapeHtml(post.category)}</span>
        <span class="resource-badge">${escapeHtml(post.badge || (post.isOfficial ? 'Oficial' : 'Aporte de Clase'))}</span>
      </header>

      <h3 class="resource-title">${escapeHtml(post.title)}</h3>
      <p class="resource-desc">${escapeHtml(post.description)}</p>

      ${link ? `
        <div class="resource-link-row">
          <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm btn-block">
            <span>⬇️ ${escapeHtml(post.linkText || 'Acceder al Recurso / Descarga')}</span>
          </a>
        </div>` : ''}

      <footer class="resource-footer">
        <span>
          Publicado por: <span class="resource-author">${escapeHtml(post.author || 'Compañero/a de 1º DAM')}</span>
          ${isEdited ? '<span class="resource-edited" title="Esta publicación ha sido editada"> · ✏️ editada</span>' : ''}
        </span>
        <span>${escapeHtml(dateStr)}</span>
      </footer>

      ${actionsHtml}
    </article>
  `;
}

/* -------------------------------------------------------------------------
   Acciones sobre tarjetas (delegación de eventos)
   ------------------------------------------------------------------------- */

function bindGridActions(): void {
  const grid = $('#resources-grid');
  grid?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!button) return;

    const postId = button.dataset.id;
    const post = postId ? state.announcements.find(item => item.id === postId) : undefined;
    if (!post || !canManage(post)) {
      showToast('Esta publicación ya no está disponible para gestionar.', 'warn');
      return;
    }

    if (button.dataset.action === 'delete') {
      void handleDeletePost(post);
    } else if (button.dataset.action === 'edit') {
      openEditModal(post);
    }
  });
}

async function handleDeletePost(post: Announcement): Promise<void> {
  const message = state.isAdmin
    ? '¿Borrar esta publicación para toda la clase?'
    : '¿Borrar tu publicación? Dejará de verse para toda la clase.';

  if (!confirm(message)) return;

  const result = await CloudDB.deleteAnnouncement(post.id);
  if (result.success) {
    showToast('Publicación eliminada del tablón', 'success');
  } else {
    showToast('No se pudo borrar: ' + (result.error || 'revisa los permisos de Firestore'), 'error');
  }
}

/* -------------------------------------------------------------------------
   Modal de publicación / edición
   ------------------------------------------------------------------------- */

function setCategoryValue(select: HTMLSelectElement, value: string): void {
  if (!Array.from(select.options).some(option => option.value === value)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
  select.value = value;
}

export function openPublishModal(asAdmin = false): void {
  editingId = null;
  publishingAsAdmin = asAdmin;

  const modal = $('#publish-modal');
  const title = $('#publish-modal-title');
  const indicator = $('#admin-publish-indicator');
  const note = $('#publish-modal-note');
  const authorInput = $('#post-author') as HTMLInputElement | null;
  const submitButton = $('#btn-submit-publish');

  const form = $('#publish-form') as HTMLFormElement | null;
  form?.reset();

  if (title) title.textContent = asAdmin ? '👑 Publicar Anuncio Oficial (Dueño)' : '📢 Compartir Recurso o Enlace Útil';
  if (indicator) indicator.style.display = asAdmin ? 'block' : 'none';
  if (note) note.textContent = 'Podrás editar o borrar tu publicación mientras no recargues la página.';
  if (authorInput) authorInput.value = asAdmin ? `${OWNER_CONFIG.name} (Admin)` : '';
  if (submitButton) submitButton.innerHTML = asAdmin ? '<span>🚀</span> Publicar como Oficial' : '<span>🚀</span> Publicar en el Tablón';

  openModal(modal);
  if (!asAdmin) {
    setTimeout(() => $('#post-title')?.focus(), 100);
  }
}

function openEditModal(post: Announcement): void {
  editingId = post.id;
  publishingAsAdmin = Boolean(post.isOfficial);

  const modal = $('#publish-modal');
  const title = $('#publish-modal-title');
  const indicator = $('#admin-publish-indicator');
  const note = $('#publish-modal-note');
  const submitButton = $('#btn-submit-publish');

  const form = $('#publish-form') as HTMLFormElement | null;
  form?.reset();

  const titleInput = $('#post-title') as HTMLInputElement | null;
  const categorySelect = $('#post-category') as HTMLSelectElement | null;
  const authorInput = $('#post-author') as HTMLInputElement | null;
  const linkInput = $('#post-link') as HTMLInputElement | null;
  const descriptionInput = $('#post-description') as HTMLTextAreaElement | null;

  if (titleInput) titleInput.value = post.title;
  if (categorySelect) setCategoryValue(categorySelect, post.category);
  if (authorInput) authorInput.value = post.author;
  if (linkInput) linkInput.value = post.link ?? '';
  if (descriptionInput) descriptionInput.value = post.description;

  if (title) title.textContent = '✏️ Editar Publicación';
  if (indicator) {
    indicator.style.display = 'block';
    indicator.textContent = state.isAdmin
      ? '👑 Editando con permisos de Administrador Oficial (IES Las Encinas)'
      : '✏️ Editando tu publicación (hasta que recargues la página)';
  }
  if (note) note.textContent = 'Los cambios se guardan para toda la clase al pulsar "Guardar Cambios".';
  if (submitButton) submitButton.innerHTML = '<span>💾</span> Guardar Cambios';

  openModal(modal);
  setTimeout(() => titleInput?.focus(), 100);
}

function closePublishModal(): void {
  editingId = null;
  publishingAsAdmin = false;
  closeModal($('#publish-modal'));
  ($('#publish-form') as HTMLFormElement | null)?.reset();
}

function setSubmitting(busy: boolean, busyText: string): void {
  const submitButton = $('#btn-submit-publish') as HTMLButtonElement | null;
  if (!submitButton) return;
  if (busy) {
    submitButtonHtml = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `<span>⏳</span> ${busyText}`;
  } else {
    submitButton.disabled = false;
    if (submitButtonHtml) submitButton.innerHTML = submitButtonHtml;
  }
}

async function handlePublishSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const title = ($('#post-title') as HTMLInputElement | null)?.value.trim() ?? '';
  const category = ($('#post-category') as HTMLSelectElement | null)?.value ?? 'Otro';
  const author =
    ($('#post-author') as HTMLInputElement | null)?.value.trim() ||
    (publishingAsAdmin ? `${OWNER_CONFIG.name} (Admin)` : 'Compañero/a de 1º DAM');
  const link = ($('#post-link') as HTMLInputElement | null)?.value.trim() ?? '';
  const description = ($('#post-description') as HTMLTextAreaElement | null)?.value.trim() ?? '';

  if (!title || !description) {
    showToast('Indica al menos el título y una breve descripción.', 'warn');
    return;
  }
  if (link && !safeUrl(link)) {
    showToast('El enlace debe empezar por https:// o http://', 'warn');
    return;
  }

  const isEditing = editingId !== null;
  setSubmitting(true, isEditing ? 'Guardando...' : 'Publicando...');

  try {
    let result;
    if (isEditing) {
      const patch: UpdateAnnouncementInput = {
        title,
        category,
        author,
        link,
        linkText: link ? 'Abrir Enlace de Descarga' : '',
        description
      };
      result = await CloudDB.updateAnnouncement(editingId as string, patch);
    } else {
      const input: NewAnnouncementInput = {
        title,
        category,
        author,
        link,
        linkText: link ? 'Abrir Enlace de Descarga' : '',
        description,
        isOfficial: publishingAsAdmin,
        ownerToken: OWNER_TOKEN
      };
      result = await CloudDB.addAnnouncement(input);
    }

    if (!result.success) {
      showToast('No se pudo guardar: ' + (result.error || 'comprueba tu conexión'), 'error');
      return;
    }

    closePublishModal();
    if (isEditing) {
      showToast('¡Publicación actualizada!', 'success');
    } else {
      showToast(result.inCloud ? '¡Publicado en el tablón de la clase!' : '¡Aporte añadido al tablón!', 'success');
    }
  } finally {
    setSubmitting(false, '');
  }
}

function bindPublishModal(): void {
  $('#publish-form')?.addEventListener('submit', event => void handlePublishSubmit(event as SubmitEvent));
  $('#btn-close-modal')?.addEventListener('click', closePublishModal);
  $('#btn-cancel-publish')?.addEventListener('click', closePublishModal);

  const modal = $('#publish-modal');
  modal?.addEventListener('click', event => {
    if (event.target === modal) closePublishModal();
  });
}

/* -------------------------------------------------------------------------
   Barra del tablón (búsqueda, categoría y botón de publicar)
   ------------------------------------------------------------------------- */

function bindBoardToolbar(): void {
  $('#btn-open-publish-modal')?.addEventListener('click', () => openPublishModal(state.isAdmin));

  const searchInput = $('#resource-search-input') as HTMLInputElement | null;
  searchInput?.addEventListener('input', () => {
    state.resourceSearchQuery = searchInput.value;
    renderBoard();
  });

  const categorySelect = $('#resource-category-filter') as HTMLSelectElement | null;
  categorySelect?.addEventListener('change', () => {
    state.resourceCategoryFilter = categorySelect.value;
    renderBoard();
  });
}
