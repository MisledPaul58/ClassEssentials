/**
 * Estado compartido en memoria de la aplicación (no persistente).
 * Centralizarlo aquí evita dependencias circulares entre módulos.
 */

import type { AbsenceMap, Announcement } from './types';

export type CalendarFilter = 'all' | 'upcoming' | 'holidays' | 'exams';

export const state = {
  /** Faltas de asistencia por módulo (persistidas en localStorage). */
  absences: {} as AbsenceMap,
  /** Publicaciones del tablón (desde la nube o desde la caché local). */
  announcements: [] as Announcement[],
  /** ¿El tablón está conectado a Firebase Firestore? */
  isCloudConnected: false,
  /** ¿El dueño ha iniciado sesión en este navegador? */
  isAdmin: false,
  /** Filtro activo del calendario. */
  calendarFilter: 'all' as CalendarFilter,
  /** Búsqueda actual del tablón. */
  resourceSearchQuery: '',
  /** Categoría seleccionada en el tablón. */
  resourceCategoryFilter: 'all'
};
