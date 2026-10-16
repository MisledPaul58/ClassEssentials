/**
 * Calculadora de faltas:
 *  - Evaluación continua: por módulo, cuentan JUSTIFICADAS + INJUSTIFICADAS.
 *  - Pérdida de matrícula: global, solo faltas INJUSTIFICADAS y calculada
 *    únicamente con las horas del curso (1º DAM: 1.000 h → 150 faltas).
 */

import { ACADEMIC_INFO, MODULES_DATA } from '../data/academic';
import { $, showToast } from './dom';
import { state } from './state';
import { STORAGE_KEYS, readJSON, writeJSON } from './storage';
import type { AbsenceMap, AbsenceRecord } from './types';

/** Tope de seguridad del formulario (ningún módulo llega a tantas horas). */
const MAX_ABSENCES_PER_MODULE = 300;

function clampAbsence(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), MAX_ABSENCES_PER_MODULE);
}

/** Normaliza cualquier estructura de faltas para que sea siempre válida. */
function sanitizeAbsences(raw: unknown): AbsenceMap {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, Partial<AbsenceRecord>>;
  const sanitized: AbsenceMap = {};
  for (const mod of MODULES_DATA) {
    const record = source[mod.id] ?? {};
    sanitized[mod.id] = {
      justified: clampAbsence(record.justified ?? 0),
      unjustified: clampAbsence(record.unjustified ?? 0)
    };
  }
  return sanitized;
}

export function loadAbsences(): void {
  state.absences = sanitizeAbsences(readJSON<AbsenceMap>(STORAGE_KEYS.absences));
}

function saveAbsences(): void {
  writeJSON(STORAGE_KEYS.absences, state.absences);
}

/* -------------------------------------------------------------------------
   Pérdida de matrícula (global del curso)
   ------------------------------------------------------------------------- */

export interface MatriculaStats {
  totalJustified: number;
  totalUnjustified: number;
  totalAbsences: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  status: 'safe' | 'warn' | 'danger' | 'lost';
  statusTitle: string;
  statusDesc: string;
}

export function getMatriculaStats(): MatriculaStats {
  let totalJustified = 0;
  let totalUnjustified = 0;

  for (const mod of MODULES_DATA) {
    const record = state.absences[mod.id] ?? { justified: 0, unjustified: 0 };
    totalJustified += record.justified;
    totalUnjustified += record.unjustified;
  }

  const limit = ACADEMIC_INFO.matriculaLimitHours;
  const remaining = limit - totalUnjustified;
  const percentageUsed = Math.min(Math.round((totalUnjustified / limit) * 100), 100);

  let status: MatriculaStats['status'] = 'safe';
  let statusTitle = 'Sin Riesgo de Matrícula';
  let statusDesc = `Te quedan ${remaining} faltas injustificadas para el límite legal de pérdida de matrícula.`;

  if (totalUnjustified >= limit) {
    status = 'lost';
    statusTitle = '⚠️ Pérdida de Matrícula';
    statusDesc = `Has superado las ${limit} faltas injustificadas máximas permitidas (${ACADEMIC_INFO.matriculaPercentage}% de ${ACADEMIC_INFO.firstYearHours} h del curso).`;
  } else if (percentageUsed >= 80) {
    status = 'danger';
    statusTitle = '🚨 Riesgo Crítico';
    statusDesc = `¡Alerta máxima! Solo te quedan ${remaining} faltas injustificadas antes de perder la matrícula.`;
  } else if (percentageUsed >= 50) {
    status = 'warn';
    statusTitle = '⚠️ Precaución';
    statusDesc = `Has acumulado ${totalUnjustified} faltas injustificadas. Te quedan ${remaining} para el límite.`;
  }

  return {
    totalJustified,
    totalUnjustified,
    totalAbsences: totalJustified + totalUnjustified,
    limit,
    remaining,
    percentageUsed,
    status,
    statusTitle,
    statusDesc
  };
}

export function renderMatriculaSummary(): void {
  const wrap = $('#matricula-summary-wrap');
  if (!wrap) return;

  const stats = getMatriculaStats();

  wrap.innerHTML = `
    <div class="matricula-summary-card">
      <div class="matricula-grid">
        <div class="matricula-info">
          <h3 class="matricula-title">
            <span>🎓 Control Global: Pérdida de Matrícula</span>
            <span class="badge-tag">15% Faltas Injustificadas</span>
          </h3>
          <p class="matricula-desc">
            La pérdida de matrícula se calcula <strong>únicamente con las horas del curso</strong>
            (1º de DAM: ${ACADEMIC_INFO.firstYearHours} h lectivas), no con el ciclo completo.
            Se pierde al acumular faltas <strong>injustificadas</strong> superiores al
            <strong>${ACADEMIC_INFO.matriculaPercentage}%</strong> de esas horas, es decir,
            <strong>${stats.limit} faltas</strong>. En este cómputo <em>solo</em> cuentan las no justificadas.
          </p>

          <div class="matricula-stats-row">
            <div class="stat-item">
              <span class="stat-num" style="color: ${stats.status === 'lost' ? '#ef4444' : 'var(--text-primary)'};">${stats.totalUnjustified}</span>
              <span class="stat-label">Injustificadas Actuales</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">${stats.limit} faltas</span>
              <span class="stat-label">Límite Máximo (${ACADEMIC_INFO.matriculaPercentage}% de ${ACADEMIC_INFO.firstYearHours} h)</span>
            </div>
            <div class="stat-item">
              <span class="stat-num" style="color: ${stats.remaining <= 0 ? '#ef4444' : 'var(--status-safe)'};">
                ${stats.remaining > 0 ? stats.remaining : 0}
              </span>
              <span class="stat-label">${stats.remaining > 0 ? 'Faltas Restantes' : 'Excedidas'}</span>
            </div>
            <div class="stat-item">
              <span class="stat-num" style="color: var(--text-muted);">${stats.totalJustified}</span>
              <span class="stat-label">Justificadas (no cuentan aquí)</span>
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-labels">
              <span>Progreso hacia el límite de matrícula (${stats.percentageUsed}%)</span>
              <span>${stats.totalUnjustified} / ${stats.limit} faltas</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar ${stats.status}" style="width: ${stats.percentageUsed}%;"></div>
            </div>
          </div>
        </div>

        <div class="matricula-status-badge ${stats.status}">
          <span class="status-badge-title">${stats.statusTitle}</span>
          <span class="status-badge-val">${stats.remaining > 0 ? `Quedan ${stats.remaining}` : '¡Límite Alcanzado!'}</span>
          <span class="status-badge-sub">${stats.statusDesc}</span>
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------
   Módulos y evaluación continua
   ------------------------------------------------------------------------- */

export function renderModulesGrid(): void {
  const grid = $('#modules-grid');
  if (!grid) return;

  grid.innerHTML = MODULES_DATA.map(mod => {
    const record = state.absences[mod.id] ?? { justified: 0, unjustified: 0 };
    const justified = record.justified;
    const unjustified = record.unjustified;
    const totalAbsences = justified + unjustified;
    const limit = mod.limitAbsences;
    const remaining = limit - totalAbsences;

    const percentJustified = Math.min((justified / limit) * 100, 100);
    const percentUnjustified = Math.min((unjustified / limit) * 100, 100 - percentJustified);
    const totalPercent = Math.min(Math.round((totalAbsences / limit) * 100), 100);

    let statusClass = 'safe';
    let statusText = `Te quedan ${remaining} faltas para perder la evaluación continua`;
    let bannerIcon = '🟢';

    if (totalAbsences >= limit) {
      statusClass = 'lost';
      const excess = totalAbsences - limit;
      statusText = `¡Evaluación continua perdida! (Superado por ${excess} ${excess === 1 ? 'falta' : 'faltas'})`;
      bannerIcon = '🔴';
    } else if (totalPercent >= 80) {
      statusClass = 'danger';
      statusText = `¡Riesgo alto! Solo te quedan ${remaining} ${remaining === 1 ? 'falta' : 'faltas'}`;
      bannerIcon = '🟠';
    } else if (totalPercent >= 50) {
      statusClass = 'warn';
      statusText = `Precaución: te quedan ${remaining} faltas`;
      bannerIcon = '🟡';
    }

    return `
      <article class="module-card" data-module-id="${mod.id}" title="${mod.description}">
        <div class="module-header">
          <div class="module-title-area">
            <div class="module-badge-icon" style="background: ${mod.color};">
              <span>${mod.shortName.substring(0, 3)}</span>
            </div>
            <div>
              <h3 class="module-name">${mod.name}</h3>
              <div class="module-meta-tags">
                <span class="meta-pill highlight">${mod.hours} h totales</span>
                <span class="meta-pill">${mod.percentage}% = ${mod.limitAbsences} faltas límite</span>
              </div>
            </div>
          </div>
        </div>

        <div class="module-inputs-row">
          <div class="absence-input-block">
            <label class="absence-input-label" for="input-justified-${mod.id}">
              <span>Justificadas</span>
              <span style="color: #38bdf8;">(J)</span>
            </label>
            <div class="absence-stepper">
              <button class="stepper-btn" data-action="dec" data-type="justified" data-module="${mod.id}" title="Restar 1 falta justificada">−</button>
              <input
                type="number"
                id="input-justified-${mod.id}"
                class="stepper-input"
                min="0"
                max="${MAX_ABSENCES_PER_MODULE}"
                value="${justified}"
                data-type="justified"
                data-module="${mod.id}"
                aria-label="Faltas justificadas de ${mod.name}"
              />
              <button class="stepper-btn" data-action="inc" data-type="justified" data-module="${mod.id}" title="Sumar 1 falta justificada">+</button>
            </div>
          </div>

          <div class="absence-input-block">
            <label class="absence-input-label" for="input-unjustified-${mod.id}">
              <span>Injustificadas</span>
              <span style="color: #fb923c;">(I)</span>
            </label>
            <div class="absence-stepper">
              <button class="stepper-btn" data-action="dec" data-type="unjustified" data-module="${mod.id}" title="Restar 1 falta injustificada">−</button>
              <input
                type="number"
                id="input-unjustified-${mod.id}"
                class="stepper-input"
                min="0"
                max="${MAX_ABSENCES_PER_MODULE}"
                value="${unjustified}"
                data-type="unjustified"
                data-module="${mod.id}"
                aria-label="Faltas injustificadas de ${mod.name}"
              />
              <button class="stepper-btn" data-action="inc" data-type="unjustified" data-module="${mod.id}" title="Sumar 1 falta injustificada">+</button>
            </div>
          </div>
        </div>

        <div class="module-progress-section">
          <div class="module-progress-header">
            <span class="module-total-label">Total faltas acumuladas (J + I):</span>
            <span class="module-total-counter" style="color: ${totalAbsences >= limit ? '#ef4444' : 'var(--text-primary)'};">
              ${totalAbsences} <span class="module-total-limit">/ ${limit}</span>
            </span>
          </div>

          <div class="module-progress-bar-wrap" title="${justified} justificadas + ${unjustified} injustificadas = ${totalAbsences} de ${limit}">
            <div class="bar-segment-justified" style="width: ${percentJustified}%;"></div>
            <div class="bar-segment-unjustified ${totalAbsences >= limit ? 'bar-segment-danger' : ''}" style="width: ${percentUnjustified}%;"></div>
          </div>
        </div>

        <div class="module-status-banner ${statusClass}">
          <span>${bannerIcon} ${statusText}</span>
          <span class="remaining-count">${remaining > 0 ? `${remaining} restantes` : '0'}</span>
        </div>
      </article>
    `;
  }).join('');
}

function updateAbsenceValue(moduleId: string, type: keyof AbsenceRecord, value: number): void {
  const record = state.absences[moduleId] ?? { justified: 0, unjustified: 0 };
  record[type] = value;
  state.absences[moduleId] = record;
  saveAbsences();
  renderModulesGrid();
  renderMatriculaSummary();
}

/* -------------------------------------------------------------------------
   Acciones de la calculadora (botones superiores)
   ------------------------------------------------------------------------- */

function resetAllAbsences(): void {
  if (!confirm('¿Estás seguro de que deseas poner a 0 todas las faltas registradas?')) return;
  for (const mod of MODULES_DATA) {
    state.absences[mod.id] = { justified: 0, unjustified: 0 };
  }
  saveAbsences();
  renderModulesGrid();
  renderMatriculaSummary();
  showToast('Todas las faltas han sido reiniciadas a 0', 'info');
}

function exportAbsencesAsJSON(): void {
  const payload = {
    app: 'ClassEssentials',
    version: 3,
    exportDate: new Date().toISOString(),
    institution: ACADEMIC_INFO.institution,
    course: ACADEMIC_INFO.course,
    absences: state.absences
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ClassEssentials_Faltas_1DAM_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Datos de faltas exportados en JSON', 'success');
}

function handleAbsencesImport(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result)) as { absences?: unknown };
      if (!data || typeof data !== 'object' || !data.absences) {
        throw new Error('Formato no válido');
      }
      state.absences = sanitizeAbsences(data.absences);
      saveAbsences();
      renderModulesGrid();
      renderMatriculaSummary();
      showToast('¡Faltas importadas con éxito!', 'success');
    } catch {
      showToast('El archivo seleccionado no tiene un formato JSON válido de ClassEssentials.', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

/** Conecta los botones de imprimir, exportar, importar y reiniciar. */
export function initCalculatorActions(): void {
  $('#btn-print-report')?.addEventListener('click', () => window.print());
  $('#btn-export-json')?.addEventListener('click', exportAbsencesAsJSON);
  $('#btn-import-json')?.addEventListener('click', () => $('#json-file-input')?.click());
  $('#json-file-input')?.addEventListener('change', handleAbsencesImport);
  $('#btn-reset-absences')?.addEventListener('click', resetAllAbsences);

  // Botones +/- y campos numéricos de cada módulo (delegación de eventos:
  // el grid se repinta por completo y no hace falta re-conectar nada).
  const grid = $('#modules-grid');
  grid?.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.stepper-btn');
    if (!button) return;
    const { action, type, module: moduleId } = button.dataset;
    if (!moduleId || !type || (type !== 'justified' && type !== 'unjustified')) return;
    const record = state.absences[moduleId] ?? { justified: 0, unjustified: 0 };
    const next = action === 'inc' ? record[type] + 1 : Math.max(record[type] - 1, 0);
    updateAbsenceValue(moduleId, type, Math.min(next, MAX_ABSENCES_PER_MODULE));
  });

  grid?.addEventListener('change', event => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('.stepper-input');
    if (!input) return;
    const { type, module: moduleId } = input.dataset;
    if (!moduleId || !type || (type !== 'justified' && type !== 'unjustified')) return;
    updateAbsenceValue(moduleId, type, clampAbsence(input.value));
  });
}
