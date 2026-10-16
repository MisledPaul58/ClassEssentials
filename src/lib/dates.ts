/**
 * Utilidades de fechas (en horario local de España).
 */

/** Convierte "YYYY-MM-DD" en un Date local (evita desfases de zona horaria). */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "viernes, 16 de octubre de 2026" */
export function formatDateSpanish(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** "16 oct 2026" */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Medianoche de hoy (para comparar solo días, no horas). */
export function startOfToday(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Diferencia en días entre dos fechas (redondeada hacia arriba). */
export function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
}

/** Pone en mayúscula la primera letra. */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
