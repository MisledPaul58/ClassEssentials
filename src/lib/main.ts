/**
 * Punto de entrada de ClassEssentials.
 * Orquesta la inicialización de todos los módulos de la interfaz.
 */

import { initCalculatorActions, loadAbsences, renderMatriculaSummary, renderModulesGrid } from './absences';
import { checkUrlSecretAdminTrigger, initAdmin, renderAdminToolbar } from './admin';
import { initBoard } from './announcements';
import { initCalendarFilters, renderCalendar, renderHeroWidgets, renderUpcomingHolidayBanner } from './calendar-view';
import { $, closeActiveModals } from './dom';
import { initTheme, toggleTheme } from './theme';

function bindGlobalEvents(): void {
  $('#theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // Escape cierra cualquier modal abierto
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeActiveModals();
  });

  // Navegación suave entre secciones
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function initApp(): void {
  // Tema y datos locales
  initTheme();
  loadAbsences();

  // Secciones estáticas con datos dinámicos
  renderMatriculaSummary();
  renderModulesGrid();
  renderHeroWidgets();
  renderUpcomingHolidayBanner();
  renderCalendar();
  initCalendarFilters();
  initCalculatorActions();

  // Administración (debe ir antes del tablón para conocer el estado de sesión)
  initAdmin();
  initBoard();
  renderAdminToolbar();

  bindGlobalEvents();
  checkUrlSecretAdminTrigger();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
