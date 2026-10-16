/**
 * Calendario escolar: widgets del hero, banner del próximo festivo y
 * línea temporal de festivos + hitos académicos con filtros.
 */

import { HOLIDAYS_DATA, MILESTONES_DATA } from '../data/calendar';
import { $, $all, escapeHtml } from './dom';
import { capitalize, daysBetween, formatDateSpanish, parseISODate, startOfToday } from './dates';
import { state, type CalendarFilter } from './state';
import type { CalendarEvent, Holiday } from './types';

/* -------------------------------------------------------------------------
   Cálculos de próximas fechas
   ------------------------------------------------------------------------- */

interface UpcomingHolidayInfo {
  isCurrent: boolean;
  holiday: Holiday;
  daysRemaining: number;
}

export function getUpcomingHolidayInfo(): UpcomingHolidayInfo | null {
  const today = startOfToday();

  for (const holiday of HOLIDAYS_DATA) {
    const start = parseISODate(holiday.startDate);
    const end = parseISODate(holiday.endDate);
    end.setHours(23, 59, 59, 999);
    if (today >= start && today <= end) {
      return { isCurrent: true, holiday, daysRemaining: 0 };
    }
  }

  let nextHoliday: Holiday | null = null;
  let minDiffMs = Infinity;
  for (const holiday of HOLIDAYS_DATA) {
    const diffMs = parseISODate(holiday.startDate).getTime() - today.getTime();
    if (diffMs > 0 && diffMs < minDiffMs) {
      minDiffMs = diffMs;
      nextHoliday = holiday;
    }
  }

  if (!nextHoliday) return null;
  return {
    isCurrent: false,
    holiday: nextHoliday,
    daysRemaining: Math.ceil(minDiffMs / 86_400_000)
  };
}

function getNextMilestoneInfo() {
  const today = startOfToday();
  let nextMilestone: (typeof MILESTONES_DATA)[number] | null = null;
  let minDiffMs = Infinity;

  for (const milestone of MILESTONES_DATA) {
    const diffMs = parseISODate(milestone.startDate).getTime() - today.getTime();
    if (diffMs >= 0 && diffMs < minDiffMs) {
      minDiffMs = diffMs;
      nextMilestone = milestone;
    }
  }

  if (!nextMilestone) return null;
  const days = Math.ceil(minDiffMs / 86_400_000);
  return { milestone: nextMilestone, days, isToday: days === 0 };
}

/* -------------------------------------------------------------------------
   Widgets del hero
   ------------------------------------------------------------------------- */

export function renderHeroWidgets(): void {
  const todayLabel = $('#widget-today-text');
  const holidayLabel = $('#widget-holiday-text');
  const examLabel = $('#widget-exam-text');

  if (todayLabel) {
    todayLabel.textContent = formatDateSpanish(new Date());
  }

  const holidayInfo = getUpcomingHolidayInfo();
  if (holidayLabel && holidayInfo) {
    holidayLabel.textContent = holidayInfo.isCurrent
      ? `🎉 Hoy: ${holidayInfo.holiday.title}`
      : `En ${holidayInfo.daysRemaining} ${holidayInfo.daysRemaining === 1 ? 'día' : 'días'}: ${holidayInfo.holiday.title}`;
  }

  const milestoneInfo = getNextMilestoneInfo();
  if (examLabel && milestoneInfo) {
    examLabel.textContent = milestoneInfo.isToday
      ? `🚨 ¡Hoy comienza! ${milestoneInfo.milestone.title}`
      : `En ${milestoneInfo.days} días: ${milestoneInfo.milestone.title}`;
  }
}

/* -------------------------------------------------------------------------
   Banner del próximo festivo
   ------------------------------------------------------------------------- */

export function renderUpcomingHolidayBanner(): void {
  const container = $('#upcoming-holiday-banner-wrap');
  if (!container) return;

  const info = getUpcomingHolidayInfo();
  if (!info) {
    container.innerHTML = '';
    return;
  }

  const { isCurrent, holiday, daysRemaining } = info;
  const startFormatted = parseISODate(holiday.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const endFormatted = parseISODate(holiday.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateRange = holiday.startDate === holiday.endDate ? startFormatted : `Del ${startFormatted} al ${endFormatted}`;

  container.innerHTML = `
    <div class="upcoming-holiday-banner">
      <div class="upcoming-info">
        <div class="countdown-circle">
          <span class="countdown-num">${isCurrent ? '🎉' : daysRemaining}</span>
          <span class="countdown-text">${isCurrent ? 'HOY' : (daysRemaining === 1 ? 'DÍA' : 'DÍAS')}</span>
        </div>
        <div class="upcoming-title-wrap">
          <h4>${isCurrent ? '✨ Periodo Festivo Actual' : '⏳ Próximo Día Sin Clase'}</h4>
          <h3>${escapeHtml(holiday.title)}</h3>
          <p>📅 <strong>${dateRange}</strong> — ${escapeHtml(holiday.description)}</p>
        </div>
      </div>
      <a href="#calendario" class="btn btn-secondary btn-sm">
        <span>Ver calendario completo</span> ➔
      </a>
    </div>
  `;
}

/* -------------------------------------------------------------------------
   Línea temporal de eventos
   ------------------------------------------------------------------------- */

function buildCalendarEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const holiday of HOLIDAYS_DATA) {
    events.push({
      id: holiday.id,
      category: 'holiday',
      title: holiday.title,
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      badge: 'Sin Clase / Festivo',
      description: holiday.description
    });
  }

  for (const milestone of MILESTONES_DATA) {
    events.push({
      id: milestone.id,
      category: milestone.type,
      title: milestone.title,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      badge: milestone.period,
      description: milestone.notes
    });
  }

  return events.sort((a, b) => parseISODate(a.startDate).getTime() - parseISODate(b.startDate).getTime());
}

export function renderCalendar(): void {
  const container = $('#calendar-timeline');
  if (!container) return;

  const today = startOfToday();
  const events = buildCalendarEvents();

  const filtered = events.filter(event => {
    const end = parseISODate(event.endDate);
    end.setHours(23, 59, 59, 999);
    const isPast = end < today;

    switch (state.calendarFilter) {
      case 'upcoming':
        return !isPast;
      case 'holidays':
        return event.category === 'holiday';
      case 'exams':
        return event.category === 'exam' || event.category === 'grades';
      default:
        return true;
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="timeline-empty">
        <p class="timeline-empty-title">No hay eventos con el filtro seleccionado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(event => {
    const start = parseISODate(event.startDate);
    const end = parseISODate(event.endDate);
    end.setHours(23, 59, 59, 999);
    const isPast = end < today;
    const isCurrent = today >= start && today <= end;

    const startStr = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const dateDisplay = event.startDate === event.endDate ? startStr : `${startStr} – ${endStr}`;

    let statusBadge: string;
    if (isCurrent) {
      statusBadge = '<span class="meta-pill highlight">🔴 En curso ahora</span>';
    } else if (isPast) {
      statusBadge = '<span class="meta-pill">Finalizado</span>';
    } else {
      const daysLeft = daysBetween(today, start);
      statusBadge = `<span class="meta-pill highlight">En ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}</span>`;
    }

    return `
      <article class="event-card ${event.category} ${isPast ? 'is-past' : ''}">
        <div class="event-card-header">
          <span class="event-type-badge ${event.category}">${escapeHtml(event.badge)}</span>
          ${statusBadge}
        </div>
        <h4 class="event-title">${escapeHtml(event.title)}</h4>
        <div class="event-date-row">
          <span>📅</span>
          <span>${dateDisplay}</span>
        </div>
        <p class="event-notes">${escapeHtml(event.description)}</p>
      </article>
    `;
  }).join('');
}

/** Conecta los chips de filtro del calendario. */
export function initCalendarFilters(): void {
  $all<HTMLButtonElement>('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $all('.filter-chip').forEach(other => other.classList.remove('active'));
      chip.classList.add('active');
      state.calendarFilter = (chip.dataset.filter as CalendarFilter) ?? 'all';
      renderCalendar();
    });
  });
}

/** Fecha de hoy capitalizada (por si se muestra en cabecera). */
export function getTodayLabel(): string {
  return capitalize(formatDateSpanish(new Date()));
}
