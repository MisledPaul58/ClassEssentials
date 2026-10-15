/**
 * ClassEssentials - Lógica Principal de la Aplicación
 * IES Las Encinas - 1º DAM (Curso 2026-2027)
 */

import { ACADEMIC_INFO, MODULES_DATA, HOLIDAYS_DATA, MILESTONES_DATA, DEFAULT_ANNOUNCEMENTS, ADMIN_CONFIG } from './data.js';

// Claves de LocalStorage
const STORAGE_KEYS = {
    ABSENCES: 'classessentials_absences_v1',
    COMMUNITY_POSTS: 'classessentials_community_posts_v1',
    OFFICIAL_CUSTOM_POSTS: 'classessentials_official_custom_v1',
    DELETED_OFFICIAL_POSTS: 'classessentials_deleted_official_v1',
    THEME: 'classessentials_theme_v1',
    MATRICULA_SCOPE: 'classessentials_matricula_scope_v1', // '1st_year' (150h) o 'full_cycle' (300h)
    ADMIN_SESSION: 'classessentials_admin_active_v1'
};

// Estado global de la aplicación
const AppState = {
    currentDate: new Date(),
    absences: {}, // { moduleId: { justified: 0, unjustified: 0 } }
    communityPosts: [],
    officialCustomPosts: [],
    deletedOfficialPostIds: [],
    isAdmin: false,
    matriculaScope: '1st_year', // Por defecto 1º DAM (1.000h -> 150h límite)
    calendarFilter: 'all',
    resourceSearchQuery: '',
    resourceCategoryFilter: 'all'
};

/* ==========================================================================
   INICIALIZACIÓN Y GESTIÓN DE ALMACENAMIENTO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadStoredData();
    renderHeaderDate();
    renderHeroWidgets();
    renderMatriculaSummary();
    renderModulesGrid();
    renderCalendar();
    renderUpcomingHolidayBanner();
    renderAnnouncements();
    updateAdminUiState();
    initEventListeners();
});

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const iconEl = document.getElementById('theme-icon');
    if (iconEl) {
        iconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
    showToast(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
}

function loadStoredData() {
    // 1. Cargar faltas
    try {
        const storedAbsences = localStorage.getItem(STORAGE_KEYS.ABSENCES);
        if (storedAbsences) {
            AppState.absences = JSON.parse(storedAbsences);
        } else {
            MODULES_DATA.forEach(mod => {
                AppState.absences[mod.id] = { justified: 0, unjustified: 0 };
            });
        }
    } catch (e) {
        console.error("Error al cargar faltas guardadas:", e);
        MODULES_DATA.forEach(mod => {
            AppState.absences[mod.id] = { justified: 0, unjustified: 0 };
        });
    }

    MODULES_DATA.forEach(mod => {
        if (!AppState.absences[mod.id]) {
            AppState.absences[mod.id] = { justified: 0, unjustified: 0 };
        }
    });

    // 2. Cargar publicaciones comunitarias
    try {
        const storedPosts = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS);
        if (storedPosts) {
            AppState.communityPosts = JSON.parse(storedPosts);
        }
    } catch (e) {
        console.error("Error al cargar posts comunitarios:", e);
    }

    // 3. Cargar anuncios oficiales añadidos por el dueño
    try {
        const storedOfficialCustom = localStorage.getItem(STORAGE_KEYS.OFFICIAL_CUSTOM_POSTS);
        if (storedOfficialCustom) {
            AppState.officialCustomPosts = JSON.parse(storedOfficialCustom);
        }
    } catch (e) {
        console.error("Error al cargar posts oficiales personalizados:", e);
    }

    // 4. Cargar IDs de anuncios oficiales eliminados por el admin
    try {
        const storedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED_OFFICIAL_POSTS);
        if (storedDeleted) {
            AppState.deletedOfficialPostIds = JSON.parse(storedDeleted);
        }
    } catch (e) {
        console.error("Error al cargar lista negra de anuncios oficiales:", e);
    }

    // 5. Cargar sesión de administrador
    AppState.isAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';

    // 6. Cargar ámbito de matrícula
    const storedScope = localStorage.getItem(STORAGE_KEYS.MATRICULA_SCOPE);
    if (storedScope === 'full_cycle' || storedScope === '1st_year') {
        AppState.matriculaScope = storedScope;
    }
}

function saveAbsences() {
    try {
        localStorage.setItem(STORAGE_KEYS.ABSENCES, JSON.stringify(AppState.absences));
    } catch (e) {
        console.error("Error al guardar faltas:", e);
    }
}

function saveCommunityPosts() {
    try {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(AppState.communityPosts));
    } catch (e) {
        console.error("Error al guardar posts comunitarios:", e);
    }
}

function saveOfficialCustomPosts() {
    try {
        localStorage.setItem(STORAGE_KEYS.OFFICIAL_CUSTOM_POSTS, JSON.stringify(AppState.officialCustomPosts));
    } catch (e) {
        console.error("Error al guardar posts oficiales:", e);
    }
}

function saveDeletedOfficialPosts() {
    try {
        localStorage.setItem(STORAGE_KEYS.DELETED_OFFICIAL_POSTS, JSON.stringify(AppState.deletedOfficialPostIds));
    } catch (e) {
        console.error("Error al guardar lista negra de anuncios:", e);
    }
}

/* ==========================================================================
   FECHAS, FESTIVOS Y CALENDARIO
   ========================================================================== */

function formatDateSpanish(dateObj) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return dateObj.toLocaleDateString('es-ES', options);
}

function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function renderHeaderDate() {
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const formatted = formatDateSpanish(AppState.currentDate);
        dateDisplay.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
}

function getUpcomingHolidayInfo() {
    const today = new Date(AppState.currentDate.getFullYear(), AppState.currentDate.getMonth(), AppState.currentDate.getDate());
    
    for (const h of HOLIDAYS_DATA) {
        const start = parseDate(h.startDate);
        const end = parseDate(h.endDate);
        end.setHours(23, 59, 59, 999);

        if (today >= start && today <= end) {
            return {
                isCurrent: true,
                holiday: h,
                daysRemaining: 0,
                message: `¡Hoy es festivo / no lectivo: ${h.title}!`
            };
        }
    }

    let nextHoliday = null;
    let minDiffMs = Infinity;

    for (const h of HOLIDAYS_DATA) {
        const start = parseDate(h.startDate);
        const diffMs = start - today;
        if (diffMs > 0 && diffMs < minDiffMs) {
            minDiffMs = diffMs;
            nextHoliday = h;
        }
    }

    if (nextHoliday) {
        const daysRemaining = Math.ceil(minDiffMs / (1000 * 60 * 60 * 24));
        return {
            isCurrent: false,
            holiday: nextHoliday,
            daysRemaining,
            message: `Faltan ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'} para: ${nextHoliday.title}`
        };
    }

    return null;
}

function getNextMilestoneInfo() {
    const today = new Date(AppState.currentDate.getFullYear(), AppState.currentDate.getMonth(), AppState.currentDate.getDate());
    let nextMilestone = null;
    let minDiffMs = Infinity;

    for (const m of MILESTONES_DATA) {
        const start = parseDate(m.startDate);
        const diffMs = start - today;
        if (diffMs >= 0 && diffMs < minDiffMs) {
            minDiffMs = diffMs;
            nextMilestone = m;
        }
    }

    if (nextMilestone) {
        const days = Math.ceil(minDiffMs / (1000 * 60 * 60 * 24));
        return {
            milestone: nextMilestone,
            days,
            isToday: days === 0
        };
    }

    return null;
}

function renderHeroWidgets() {
    const todayLabel = document.getElementById('widget-today-text');
    const holidayLabel = document.getElementById('widget-holiday-text');
    const examLabel = document.getElementById('widget-exam-text');

    if (todayLabel) {
        todayLabel.textContent = formatDateSpanish(AppState.currentDate);
    }

    const holidayInfo = getUpcomingHolidayInfo();
    if (holidayLabel && holidayInfo) {
        if (holidayInfo.isCurrent) {
            holidayLabel.textContent = `🎉 Hoy: ${holidayInfo.holiday.title}`;
        } else {
            holidayLabel.textContent = `En ${holidayInfo.daysRemaining} días: ${holidayInfo.holiday.title}`;
        }
    }

    const milestoneInfo = getNextMilestoneInfo();
    if (examLabel && milestoneInfo) {
        if (milestoneInfo.isToday) {
            examLabel.textContent = `🚨 ¡Hoy comienza! ${milestoneInfo.milestone.title}`;
        } else {
            examLabel.textContent = `En ${milestoneInfo.days} días: ${milestoneInfo.milestone.title}`;
        }
    }
}

function renderUpcomingHolidayBanner() {
    const bannerContainer = document.getElementById('upcoming-holiday-banner-wrap');
    if (!bannerContainer) return;

    const info = getUpcomingHolidayInfo();
    if (!info) {
        bannerContainer.innerHTML = '';
        return;
    }

    const { isCurrent, holiday, daysRemaining } = info;
    const startFormatted = parseDate(holiday.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const endFormatted = parseDate(holiday.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateRangeStr = holiday.startDate === holiday.endDate ? startFormatted : `Del ${startFormatted} al ${endFormatted}`;

    bannerContainer.innerHTML = `
        <div class="upcoming-holiday-banner">
            <div class="upcoming-info">
                <div class="countdown-circle">
                    <span class="countdown-num">${isCurrent ? '🎉' : daysRemaining}</span>
                    <span class="countdown-text">${isCurrent ? 'HOY' : (daysRemaining === 1 ? 'DÍA' : 'DÍAS')}</span>
                </div>
                <div class="upcoming-title-wrap">
                    <h4>${isCurrent ? '✨ Periodo Festivo Actual' : '⏳ Próximo Día Sin Clase'}</h4>
                    <h3>${holiday.title}</h3>
                    <p>📅 <strong>${dateRangeStr}</strong> — ${holiday.description}</p>
                </div>
            </div>
            <a href="#calendario" class="btn btn-secondary btn-sm">
                <span>Ver calendario completo</span> ➔
            </a>
        </div>
    `;
}

function renderCalendar() {
    const timelineContainer = document.getElementById('calendar-timeline');
    if (!timelineContainer) return;

    const events = [];

    HOLIDAYS_DATA.forEach(h => {
        events.push({
            id: h.id,
            category: 'holiday',
            title: h.title,
            startDate: h.startDate,
            endDate: h.endDate,
            badge: 'Sin Clase / Festivo',
            description: h.description,
            type: h.type
        });
    });

    MILESTONES_DATA.forEach(m => {
        events.push({
            id: m.id,
            category: m.type,
            title: m.title,
            startDate: m.startDate,
            endDate: m.endDate,
            badge: m.period,
            description: m.notes,
            type: m.type
        });
    });

    events.sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));

    const today = new Date(AppState.currentDate.getFullYear(), AppState.currentDate.getMonth(), AppState.currentDate.getDate());

    const filtered = events.filter(ev => {
        const start = parseDate(ev.startDate);
        const end = parseDate(ev.endDate);
        end.setHours(23, 59, 59, 999);
        const isPast = end < today;

        if (AppState.calendarFilter === 'upcoming') {
            return !isPast;
        }
        if (AppState.calendarFilter === 'holidays') {
            return ev.category === 'holiday';
        }
        if (AppState.calendarFilter === 'exams') {
            return ev.category === 'exam' || ev.category === 'grades';
        }
        return true;
    });

    if (filtered.length === 0) {
        timelineContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <p style="font-size: 1.1rem; font-weight: 600;">No hay eventos con el filtro seleccionado.</p>
            </div>
        `;
        return;
    }

    timelineContainer.innerHTML = filtered.map(ev => {
        const start = parseDate(ev.startDate);
        const end = parseDate(ev.endDate);
        end.setHours(23, 59, 59, 999);
        const isPast = end < today;
        const isCurrent = today >= start && today <= end;

        const startStr = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        const dateDisplay = ev.startDate === ev.endDate ? startStr : `${startStr} – ${endStr}`;

        let statusBadge = '';
        if (isCurrent) {
            statusBadge = '<span class="meta-pill highlight">🔴 En curso ahora</span>';
        } else if (isPast) {
            statusBadge = '<span class="meta-pill">Finalizado</span>';
        } else {
            const daysLeft = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
            statusBadge = `<span class="meta-pill" style="color: var(--accent-blue);">En ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}</span>`;
        }

        return `
            <div class="event-card ${ev.category} ${isPast ? 'is-past' : ''}">
                <div class="event-card-header">
                    <span class="event-type-badge ${ev.category}">${ev.badge}</span>
                    ${statusBadge}
                </div>
                <h4 class="event-title">${ev.title}</h4>
                <div class="event-date-row">
                    <span>📅</span>
                    <span>${dateDisplay}</span>
                </div>
                <p class="event-notes">${ev.description}</p>
            </div>
        `;
    }).join('');
}

/* ==========================================================================
   CALCULADORA DE FALTAS Y EVALUACIÓN CONTINUA
   ========================================================================== */

function getMatriculaStats() {
    let totalUnjustified = 0;
    let totalJustified = 0;

    MODULES_DATA.forEach(mod => {
        const modAbs = AppState.absences[mod.id] || { justified: 0, unjustified: 0 };
        totalUnjustified += Number(modAbs.unjustified) || 0;
        totalJustified += Number(modAbs.justified) || 0;
    });

    const limit = AppState.matriculaScope === '1st_year'
        ? ACADEMIC_INFO.matriculaLimitHours1stYear
        : ACADEMIC_INFO.matriculaLimitHoursFullCycle;

    const totalHours = AppState.matriculaScope === '1st_year'
        ? ACADEMIC_INFO.totalFirstYearHours
        : ACADEMIC_INFO.totalCycleHours;

    const remaining = limit - totalUnjustified;
    const percentageUsed = Math.min(Math.round((totalUnjustified / limit) * 100), 100);

    let status = 'safe';
    let statusTitle = 'Sin Riesgo de Matrícula';
    let statusDesc = `Te quedan ${remaining} faltas injustificadas para el límite legal de pérdida de matrícula.`;

    if (totalUnjustified >= limit) {
        status = 'lost';
        statusTitle = '⚠️ Pérdida de Matrícula';
        statusDesc = `Has superado las ${limit} faltas injustificadas máximas permitidas (${ACADEMIC_INFO.matriculaPercentage}% de ${totalHours}h).`;
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
        totalUnjustified,
        totalJustified,
        totalAbsences: totalUnjustified + totalJustified,
        limit,
        totalHours,
        remaining,
        percentageUsed,
        status,
        statusTitle,
        statusDesc
    };
}

function renderMatriculaSummary() {
    const summaryCard = document.getElementById('matricula-summary-wrap');
    if (!summaryCard) return;

    const stats = getMatriculaStats();

    summaryCard.innerHTML = `
        <div class="matricula-summary-card">
            <div class="matricula-grid">
                <div class="matricula-info">
                    <h3>
                        <span>🎓 Control Global: Pérdida de Matrícula</span>
                        <span class="badge-tag" style="font-size: 0.75rem;">15% Faltas Injustificadas</span>
                    </h3>
                    <p class="matricula-desc">
                        Según la normativa de Formación Profesional, el alumno pierde el derecho a matrícula cuando acumula 
                        faltas <strong>injustificadas</strong> superiores al <strong>15% de las horas totales</strong> 
                        (${AppState.matriculaScope === '1st_year' ? '150 horas en 1º DAM' : '300 horas en el ciclo completo'}). 
                        En este cómputo <em>solo</em> cuentan las no justificadas.
                    </p>

                    <div class="matricula-stats-row">
                        <div class="stat-item">
                            <span class="stat-num" style="color: ${stats.status === 'lost' ? '#ef4444' : 'var(--text-primary)'};">${stats.totalUnjustified}</span>
                            <span class="stat-label">Injustificadas Actuales</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-num">${stats.limit} h</span>
                            <span class="stat-label">Límite Máximo (${ACADEMIC_INFO.matriculaPercentage}%)</span>
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
                            <span>Progreso hacia límite de matrícula (${stats.percentageUsed}%)</span>
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
                    
                    <div style="margin-top: 0.85rem; display: flex; gap: 0.35rem; width: 100%;">
                        <button class="btn btn-secondary btn-sm" id="btn-toggle-scope" style="width: 100%; font-size: 0.72rem; padding: 0.3rem 0.5rem;" title="Cambiar cálculo entre horas de 1º curso (1.000h) y ciclo completo (2.000h)">
                            🔄 Ámbito: ${AppState.matriculaScope === '1st_year' ? '1º Curso (1.000h)' : 'Ciclo (2.000h)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const toggleBtn = document.getElementById('btn-toggle-scope');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            AppState.matriculaScope = AppState.matriculaScope === '1st_year' ? 'full_cycle' : '1st_year';
            localStorage.setItem(STORAGE_KEYS.MATRICULA_SCOPE, AppState.matriculaScope);
            renderMatriculaSummary();
            showToast(`Cálculo de matrícula actualizado a: ${AppState.matriculaScope === '1st_year' ? '1º Curso (150h límite)' : 'Ciclo Completo (300h límite)'}`, 'info');
        });
    }
}

function renderModulesGrid() {
    const gridContainer = document.getElementById('modules-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = MODULES_DATA.map(mod => {
        const modAbs = AppState.absences[mod.id] || { justified: 0, unjustified: 0 };
        const justified = Number(modAbs.justified) || 0;
        const unjustified = Number(modAbs.unjustified) || 0;
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
            statusText = `⚠️ ¡Evaluación continua perdida! (Superado por ${excess} ${excess === 1 ? 'falta' : 'faltas'})`;
            bannerIcon = '🔴';
        } else if (totalPercent >= 80) {
            statusClass = 'danger';
            statusText = `🚨 ¡Riesgo alto! Solo te quedan ${remaining} ${remaining === 1 ? 'falta' : 'faltas'}`;
            bannerIcon = '🟠';
        } else if (totalPercent >= 50) {
            statusClass = 'warn';
            statusText = `⚠️ Precaución: te quedan ${remaining} faltas`;
            bannerIcon = '🟡';
        }

        return `
            <div class="module-card" data-module-id="${mod.id}">
                <div class="module-header">
                    <div class="module-title-area">
                        <div class="module-badge-icon" style="background: ${mod.color};">
                            <span>${mod.shortName.substring(0, 3)}</span>
                        </div>
                        <div>
                            <h3 class="module-name">${mod.name}</h3>
                            <div class="module-meta-tags">
                                <span class="meta-pill highlight">${mod.hours}h totales</span>
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
                            <button class="stepper-btn" data-action="dec" data-type="justified" data-module="${mod.id}" title="Restar 1 falta justificada">-</button>
                            <input 
                                type="number" 
                                id="input-justified-${mod.id}"
                                class="stepper-input" 
                                min="0" 
                                max="300"
                                value="${justified}"
                                data-type="justified"
                                data-module="${mod.id}"
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
                            <button class="stepper-btn" data-action="dec" data-type="unjustified" data-module="${mod.id}" title="Restar 1 falta injustificada">-</button>
                            <input 
                                type="number" 
                                id="input-unjustified-${mod.id}"
                                class="stepper-input" 
                                min="0" 
                                max="300"
                                value="${unjustified}"
                                data-type="unjustified"
                                data-module="${mod.id}"
                            />
                            <button class="stepper-btn" data-action="inc" data-type="unjustified" data-module="${mod.id}" title="Sumar 1 falta injustificada">+</button>
                        </div>
                    </div>
                </div>

                <div class="module-progress-section">
                    <div class="module-progress-header">
                        <span class="module-total-label">Total faltas acumuladas (J + I):</span>
                        <span class="module-total-counter" style="color: ${totalAbsences >= limit ? '#ef4444' : 'var(--text-primary)'};">
                            ${totalAbsences} <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: normal;">/ ${limit}</span>
                        </span>
                    </div>

                    <div class="module-progress-bar-wrap" title="${justified} Justificadas + ${unjustified} Injustificadas = ${totalAbsences} de ${limit}">
                        <div class="bar-segment-justified" style="width: ${percentJustified}%;"></div>
                        <div class="bar-segment-unjustified ${totalAbsences >= limit ? 'bar-segment-danger' : ''}" style="width: ${percentUnjustified}%;"></div>
                    </div>
                </div>

                <div class="module-status-banner ${statusClass}">
                    <span>${bannerIcon} ${statusText}</span>
                    <span class="remaining-count">${remaining > 0 ? `${remaining} restantes` : '0'}</span>
                </div>
            </div>
        `;
    }).join('');

    attachModuleEvents();
}

function attachModuleEvents() {
    document.querySelectorAll('.stepper-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            const type = btn.dataset.type;
            const moduleId = btn.dataset.module;
            const currentVal = Number(AppState.absences[moduleId]?.[type]) || 0;

            let newVal = currentVal;
            if (action === 'inc') {
                newVal += 1;
            } else if (action === 'dec' && currentVal > 0) {
                newVal -= 1;
            }

            updateAbsenceValue(moduleId, type, newVal);
        });
    });

    document.querySelectorAll('.stepper-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const type = input.dataset.type;
            const moduleId = input.dataset.module;
            let val = parseInt(input.value, 10);
            if (isNaN(val) || val < 0) val = 0;
            updateAbsenceValue(moduleId, type, val);
        });
    });
}

function updateAbsenceValue(moduleId, type, val) {
    if (!AppState.absences[moduleId]) {
        AppState.absences[moduleId] = { justified: 0, unjustified: 0 };
    }
    AppState.absences[moduleId][type] = val;
    saveAbsences();
    renderModulesGrid();
    renderMatriculaSummary();
}

function resetAllAbsences() {
    if (confirm('¿Estás seguro de que deseas poner a 0 todas las faltas registradas?')) {
        MODULES_DATA.forEach(mod => {
            AppState.absences[mod.id] = { justified: 0, unjustified: 0 };
        });
        saveAbsences();
        renderModulesGrid();
        renderMatriculaSummary();
        showToast('Todas las faltas han sido reiniciadas a 0', 'info');
    }
}

function exportDataAsJSON() {
    const dataToExport = {
        exportDate: new Date().toISOString(),
        institution: ACADEMIC_INFO.institution,
        course: ACADEMIC_INFO.course,
        absences: AppState.absences,
        matriculaScope: AppState.matriculaScope
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClassEssentials_Faltas_1DAM_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos de faltas exportados en JSON', 'success');
}

function triggerImportJSON() {
    const fileInput = document.getElementById('json-file-input');
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data && data.absences) {
                AppState.absences = data.absences;
                if (data.matriculaScope) {
                    AppState.matriculaScope = data.matriculaScope;
                }
                saveAbsences();
                renderModulesGrid();
                renderMatriculaSummary();
                showToast('¡Faltas importadas con éxito!', 'success');
            } else {
                throw new Error("Formato no válido");
            }
        } catch (err) {
            alert('El archivo seleccionado no tiene un formato JSON válido de ClassEssentials.');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

/* ==========================================================================
   TABLÓN DE ANUNCIOS, MODO ADMINISTRADOR Y BORRADO FÁCIL
   ========================================================================== */

function renderAnnouncements() {
    renderAdminToolbar();

    const container = document.getElementById('resources-grid');
    if (!container) return;

    // Filtrar los anuncios oficiales que el admin haya borrado
    const activeDefaultAnnouncements = DEFAULT_ANNOUNCEMENTS.filter(
        post => !AppState.deletedOfficialPostIds.includes(post.id)
    ).map(p => ({ ...p, isCommunity: false, isCustomOfficial: false }));

    const activeCustomOfficialPosts = AppState.officialCustomPosts.map(p => ({
        ...p, isCommunity: false, isCustomOfficial: true
    }));

    const communityPosts = AppState.communityPosts.map(p => ({
        ...p, isCommunity: true, isCustomOfficial: false
    }));

    // Lista unificada
    const allPosts = [
        ...activeCustomOfficialPosts,
        ...communityPosts,
        ...activeDefaultAnnouncements
    ];

    const query = AppState.resourceSearchQuery.trim().toLowerCase();
    const category = AppState.resourceCategoryFilter;

    const filtered = allPosts.filter(post => {
        const matchesCategory = category === 'all' || 
            (category === 'Comunidad' ? post.isCommunity : post.category.toLowerCase() === category.toLowerCase());
        
        const matchesQuery = !query || 
            post.title.toLowerCase().includes(query) ||
            post.description.toLowerCase().includes(query) ||
            post.author.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query);

        return matchesCategory && matchesQuery;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <p style="font-size: 1.1rem; font-weight: 600;">No se encontraron recursos ni anuncios.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Prueba con otra búsqueda o publica un nuevo enlace con el botón superior.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(post => {
        const isOwner = !post.isCommunity;
        const dateStr = post.date ? new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const hasLink = post.link && post.link.trim() !== '';

        return `
            <div class="resource-card ${isOwner ? 'owner-post' : 'peer-post'}" id="card-${post.id}">
                <div class="resource-header">
                    <span class="resource-category">${post.category}</span>
                    <span class="resource-badge">${post.badge || (isOwner ? 'Oficial' : 'Aporte de Clase')}</span>
                </div>

                <h3 class="resource-title">${post.title}</h3>
                <p class="resource-desc">${post.description}</p>

                ${hasLink ? `
                    <div style="margin-top: 0.5rem;">
                        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width: 100%;">
                            <span>⬇️ ${post.linkText || 'Acceder al Recurso / Descarga'}</span>
                        </a>
                    </div>
                ` : ''}

                <div class="resource-footer">
                    <span>Publicado por: <span class="resource-author">${post.author}</span></span>
                    <span>${dateStr}</span>
                </div>

                <!-- Botón de Borrado: Visible para posts propios o siempre si está en MODO ADMIN -->
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; margin-top: 0.35rem; padding-top: 0.35rem; border-top: 1px dashed var(--border-color);">
                    ${AppState.isAdmin ? `
                        <button class="btn-admin-delete" data-id="${post.id}" data-is-community="${post.isCommunity}" data-is-custom-official="${post.isCustomOfficial || false}" title="Eliminar este anuncio como Administrador">
                            <span>🗑️</span> Borrar Anuncio (Admin)
                        </button>
                    ` : (post.isCommunity ? `
                        <button class="btn btn-danger-outline btn-sm btn-delete-post" data-id="${post.id}" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
                            🗑️ Eliminar de mi navegador
                        </button>
                    ` : '')}
                </div>
            </div>
        `;
    }).join('');

    // Listener para borrado en MODO ADMIN
    document.querySelectorAll('.btn-admin-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = btn.dataset.id;
            const isCommunity = btn.dataset.isCommunity === 'true';
            const isCustomOfficial = btn.dataset.isCustomOfficial === 'true';

            deleteAnnouncementAsAdmin(postId, isCommunity, isCustomOfficial);
        });
    });

    // Listener para borrado de post propio por compañeros
    document.querySelectorAll('.btn-delete-post').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = btn.dataset.id;
            if (confirm('¿Deseas eliminar este aporte de tu navegador?')) {
                AppState.communityPosts = AppState.communityPosts.filter(p => p.id !== postId);
                saveCommunityPosts();
                renderAnnouncements();
                showToast('Aporte eliminado', 'info');
            }
        });
    });
}

function renderAdminToolbar() {
    const toolbarContainer = document.getElementById('admin-toolbar-wrap');
    if (!toolbarContainer) return;

    if (!AppState.isAdmin) {
        toolbarContainer.innerHTML = '';
        return;
    }

    toolbarContainer.innerHTML = `
        <div class="admin-banner">
            <div class="admin-banner-text">
                <span class="admin-banner-title">
                    <span>👑</span> Modo Administrador Activo (Dueño de ClassEssentials)
                </span>
                <span class="admin-banner-desc">
                    Puedes borrar cualquier anuncio de la web con el botón rojo "Borrar Anuncio", crear anuncios oficiales o restaurar los predeterminados.
                </span>
            </div>

            <div class="admin-actions-group">
                <button class="btn btn-primary btn-sm" id="btn-admin-add-official">
                    <span>➕</span> Publicar Anuncio Oficial
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-admin-restore-defaults" title="Restaurar anuncios predeterminados si borraste alguno">
                    <span>🔄</span> Restaurar Originales
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-admin-export-code" title="Copiar el código de anuncios para pegarlo en data.js y guardarlo en GitHub">
                    <span>📋</span> Copiar JSON para GitHub
                </button>
                <button class="btn btn-danger-outline btn-sm" id="btn-admin-logout" title="Salir del modo administrador">
                    <span>🔒</span> Salir
                </button>
            </div>
        </div>
    `;

    // Eventos de la barra de administrador
    const btnAddOfficial = document.getElementById('btn-admin-add-official');
    if (btnAddOfficial) {
        btnAddOfficial.addEventListener('click', () => {
            openPublishModal(true); // true = modo admin
        });
    }

    const btnRestore = document.getElementById('btn-admin-restore-defaults');
    if (btnRestore) {
        btnRestore.addEventListener('click', () => {
            if (confirm('¿Deseas restaurar todos los anuncios oficiales iniciales que hayan sido borrados?')) {
                AppState.deletedOfficialPostIds = [];
                saveDeletedOfficialPosts();
                renderAnnouncements();
                showToast('Anuncios oficiales restaurados', 'success');
            }
        });
    }

    const btnExportCode = document.getElementById('btn-admin-export-code');
    if (btnExportCode) {
        btnExportCode.addEventListener('click', copyAnnouncementsCodeForGitHub);
    }

    const btnLogout = document.getElementById('btn-admin-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logoutAdmin);
    }
}

/**
 * Borra un anuncio de forma inmediata con permisos de Administrador
 */
function deleteAnnouncementAsAdmin(postId, isCommunity, isCustomOfficial) {
    if (!confirm('¿Seguro que deseas eliminar este anuncio del tablón?')) {
        return;
    }

    if (isCustomOfficial) {
        AppState.officialCustomPosts = AppState.officialCustomPosts.filter(p => p.id !== postId);
        saveOfficialCustomPosts();
    } else if (isCommunity) {
        AppState.communityPosts = AppState.communityPosts.filter(p => p.id !== postId);
        saveCommunityPosts();
    } else {
        // Es un anuncio oficial predeterminado de DEFAULT_ANNOUNCEMENTS
        if (!AppState.deletedOfficialPostIds.includes(postId)) {
            AppState.deletedOfficialPostIds.push(postId);
            saveDeletedOfficialPosts();
        }
    }

    renderAnnouncements();
    showToast('Anuncio eliminado correctamente por el Administrador', 'success');
}

/**
 * Permite copiar el listado activo para pegarlo en data.js si el dueño quiere
 * subirlo al repositorio GitHub de manera permanente para todos los visitantes.
 */
function copyAnnouncementsCodeForGitHub() {
    const activeOfficial = [
        ...AppState.officialCustomPosts,
        ...DEFAULT_ANNOUNCEMENTS.filter(p => !AppState.deletedOfficialPostIds.includes(p.id))
    ];

    const jsonStr = JSON.stringify(activeOfficial, null, 4);

    navigator.clipboard.writeText(jsonStr).then(() => {
        showToast('JSON de anuncios copiado al portapapeles para data.js', 'success');
        alert('¡Copiado! Puedes pegar este contenido en la variable DEFAULT_ANNOUNCEMENTS de js/data.js y hacer git commit si deseas que tus cambios se publiquen de forma fija en GitHub para todos.');
    }).catch(() => {
        prompt('Copia este JSON para actualizar js/data.js:', jsonStr);
    });
}

function updateAdminUiState() {
    const toggleBtn = document.getElementById('btn-admin-toggle');
    const toggleIcon = document.getElementById('admin-toggle-icon');
    const toggleText = document.getElementById('admin-toggle-text');

    if (toggleBtn && toggleIcon && toggleText) {
        if (AppState.isAdmin) {
            toggleBtn.classList.add('is-admin');
            toggleIcon.textContent = '👑';
            toggleText.textContent = 'Admin Activo';
            toggleBtn.title = 'Modo Administrador activado. Pulsa para salir.';
        } else {
            toggleBtn.classList.remove('is-admin');
            toggleIcon.textContent = '🔒';
            toggleText.textContent = 'Acceso Admin';
            toggleBtn.title = 'Acceso para el dueño de la web para borrar y gestionar anuncios.';
        }
    }
}

function openAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const pinInput = document.getElementById('admin-pin-input');
        if (pinInput) {
            pinInput.value = '';
            setTimeout(() => pinInput.focus(), 100);
        }
    }
}

function closeAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const pinInput = document.getElementById('admin-pin-input');
    const enteredPin = pinInput ? pinInput.value.trim() : '';

    if (enteredPin === ADMIN_CONFIG.defaultPin || enteredPin === 'ieslasencinas') {
        AppState.isAdmin = true;
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        closeAdminLoginModal();
        updateAdminUiState();
        renderAnnouncements();
        showToast('¡Sesión de Administrador iniciada! Ya puedes borrar y publicar anuncios.', 'success');
    } else {
        alert('PIN incorrecto. El PIN configurado por defecto es: ' + ADMIN_CONFIG.defaultPin);
    }
}

function logoutAdmin() {
    if (confirm('¿Deseas cerrar la sesión de administrador?')) {
        AppState.isAdmin = false;
        localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        updateAdminUiState();
        renderAnnouncements();
        showToast('Sesión de administrador cerrada', 'info');
    }
}

function toggleAdminAccess() {
    if (AppState.isAdmin) {
        logoutAdmin();
    } else {
        openAdminLoginModal();
    }
}

/* ==========================================================================
   MODAL DE PUBLICACIÓN (ALUMNOS Y ADMIN)
   ========================================================================== */

let isPublishingAsAdmin = false;

function openPublishModal(asAdmin = false) {
    isPublishingAsAdmin = asAdmin;
    const modal = document.getElementById('publish-modal');
    const titleEl = document.getElementById('publish-modal-title');
    const indicatorEl = document.getElementById('admin-publish-indicator');
    const authorInput = document.getElementById('post-author');
    const submitBtn = document.getElementById('btn-submit-publish');

    if (modal) {
        if (asAdmin) {
            if (titleEl) titleEl.textContent = '👑 Publicar Anuncio Oficial (Dueño)';
            if (indicatorEl) indicatorEl.style.display = 'block';
            if (authorInput) authorInput.value = `${ADMIN_CONFIG.ownerName} (Prof./Admin)`;
            if (submitBtn) submitBtn.innerHTML = '<span>🚀</span> Publicar como Oficial';
        } else {
            if (titleEl) titleEl.textContent = '📢 Compartir Recurso o Enlace Útil';
            if (indicatorEl) indicatorEl.style.display = 'none';
            if (authorInput) authorInput.value = '';
            if (submitBtn) submitBtn.innerHTML = '<span>🚀</span> Publicar Recurso';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePublishModal() {
    const modal = document.getElementById('publish-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('publish-form').reset();
    }
}

function handlePublishSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const author = document.getElementById('post-author').value.trim() || (isPublishingAsAdmin ? ADMIN_CONFIG.ownerName : 'Compañero/a de 1º DAM');
    const link = document.getElementById('post-link').value.trim();
    const description = document.getElementById('post-description').value.trim();

    if (!title || !description) {
        alert('Por favor, indica al menos el título y una breve descripción del recurso.');
        return;
    }

    const newPost = {
        id: (isPublishingAsAdmin ? 'admin-post-' : 'user-post-') + Date.now(),
        title,
        category,
        author,
        link,
        linkText: link ? 'Abrir Enlace de Descarga' : '',
        description,
        badge: isPublishingAsAdmin ? 'Oficial' : 'Aporte de Clase',
        date: new Date().toISOString().slice(0, 10)
    };

    if (isPublishingAsAdmin) {
        AppState.officialCustomPosts.unshift(newPost);
        saveOfficialCustomPosts();
        showToast('¡Anuncio oficial publicado en el tablón!', 'success');
    } else {
        AppState.communityPosts.unshift(newPost);
        saveCommunityPosts();
        showToast('¡Aporte publicado en tu navegador!', 'success');
    }

    closePublishModal();
    renderAnnouncements();
}

function prepareContributionForCreator() {
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const author = document.getElementById('post-author').value.trim() || 'Alumno 1º DAM';
    const link = document.getElementById('post-link').value.trim();
    const description = document.getElementById('post-description').value.trim();

    const template = `### Sugerencia de Recurso para ClassEssentials 1º DAM
- **Título**: ${title || '[Título del Recurso]'}
- **Categoría**: ${category}
- **Autor / Alumno**: ${author}
- **Enlace de Descarga / URL**: ${link || 'N/A'}
- **Descripción**: ${description || '[Explicación de por qué es útil para la clase]'}`;

    navigator.clipboard.writeText(template).then(() => {
        showToast('Plantilla copiada al portapapeles para enviar al creador', 'success');
    }).catch(() => {
        prompt('Copia esta plantilla para enviarla al creador:', template);
    });
}

/* ==========================================================================
   TOASTS Y EVENT LISTENERS
   ========================================================================== */

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warn') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function initEventListeners() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Botón de acceso de Administrador en el header
    const adminToggleBtn = document.getElementById('btn-admin-toggle');
    if (adminToggleBtn) adminToggleBtn.addEventListener('click', toggleAdminAccess);

    // Formulario de login de Administrador
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) adminLoginForm.addEventListener('submit', handleAdminLoginSubmit);

    const btnCloseAdminModal = document.getElementById('btn-close-admin-modal');
    if (btnCloseAdminModal) btnCloseAdminModal.addEventListener('click', closeAdminLoginModal);

    const btnCancelAdminModal = document.getElementById('btn-cancel-admin-modal');
    if (btnCancelAdminModal) btnCancelAdminModal.addEventListener('click', closeAdminLoginModal);

    const adminModalBackdrop = document.getElementById('admin-login-modal');
    if (adminModalBackdrop) {
        adminModalBackdrop.addEventListener('click', (e) => {
            if (e.target === adminModalBackdrop) closeAdminLoginModal();
        });
    }

    // Botones de la calculadora
    const resetBtn = document.getElementById('btn-reset-absences');
    if (resetBtn) resetBtn.addEventListener('click', resetAllAbsences);

    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) exportBtn.addEventListener('click', exportDataAsJSON);

    const importBtn = document.getElementById('btn-import-json');
    if (importBtn) importBtn.addEventListener('click', triggerImportJSON);

    const fileInput = document.getElementById('json-file-input');
    if (fileInput) fileInput.addEventListener('change', handleFileImport);

    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Filtros de calendario
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            AppState.calendarFilter = chip.dataset.filter;
            renderCalendar();
        });
    });

    // Búsqueda y filtros de recursos
    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.resourceSearchQuery = e.target.value;
            renderAnnouncements();
        });
    }

    const categorySelect = document.getElementById('resource-category-filter');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            AppState.resourceCategoryFilter = e.target.value;
            renderAnnouncements();
        });
    }

    // Modal de publicación
    const openModalBtn = document.getElementById('btn-open-publish-modal');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            openPublishModal(AppState.isAdmin);
        });
    }

    const closeModalBtn = document.getElementById('btn-close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closePublishModal);

    const modalBackdrop = document.getElementById('publish-modal');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closePublishModal();
        });
    }

    const publishForm = document.getElementById('publish-form');
    if (publishForm) publishForm.addEventListener('submit', handlePublishSubmit);

    const btnShareCreator = document.getElementById('btn-share-creator');
    if (btnShareCreator) btnShareCreator.addEventListener('click', prepareContributionForCreator);

    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}
