/**
 * ClassEssentials — Calendario escolar 2026-2027:
 * días festivos, periodos vacacionales e hitos académicos de 1º DAM.
 */

import type { Holiday, Milestone } from '../lib/types';

/** Días festivos y periodos vacacionales (sin clase) del curso 2026-2027. */
export const HOLIDAYS_DATA: Holiday[] = [
  {
    id: 'festivo-1',
    title: 'Fiesta Nacional de España',
    startDate: '2026-10-12',
    endDate: '2026-10-12',
    type: 'nacional',
    description: 'Día de la Hispanidad / Fiesta Nacional.'
  },
  {
    id: 'festivo-2',
    title: 'Todos los Santos (Traslado)',
    startDate: '2026-11-02',
    endDate: '2026-11-02',
    type: 'nacional',
    description: 'Día no lectivo por traslado de la festividad de Todos los Santos.'
  },
  {
    id: 'festivo-3',
    title: 'Puente de la Constitución e Inmaculada',
    startDate: '2026-12-07',
    endDate: '2026-12-08',
    type: 'puente',
    description: 'Día de la Constitución Española y Día de la Inmaculada Concepción.'
  },
  {
    id: 'festivo-4',
    title: 'Vacaciones de Navidad',
    startDate: '2026-12-23',
    endDate: '2027-01-08',
    type: 'vacaciones',
    description: 'Periodo vacacional de invierno (ambos inclusive).'
  },
  {
    id: 'festivo-5',
    title: 'Día de la Comunidad Educativa',
    startDate: '2027-02-12',
    endDate: '2027-02-12',
    type: 'educativo',
    description: 'Día festivo escolar en centros educativos.'
  },
  {
    id: 'festivo-6',
    title: 'Día no lectivo',
    startDate: '2027-02-15',
    endDate: '2027-02-15',
    type: 'escolar',
    description: 'Día no lectivo acordado en el calendario escolar.'
  },
  {
    id: 'festivo-7',
    title: 'Semana Santa y Festividades de Primavera',
    startDate: '2027-03-19',
    endDate: '2027-03-29',
    type: 'vacaciones',
    description: 'San José y periodo vacacional de Semana Santa (ambos inclusive).'
  }
];

/** Hitos académicos, semanas de exámenes y entrega de notas de 1º DAM. */
export const MILESTONES_DATA: Milestone[] = [
  {
    id: 'eval-1-exam',
    period: '1ª Evaluación',
    title: 'Semana de Exámenes de la 1ª Evaluación',
    startDate: '2026-11-18',
    endDate: '2026-11-24',
    examDays: ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23', '2026-11-24'],
    type: 'exam',
    notes: 'Días oficiales de pruebas: 18, 19, 20, 23 y 24 de noviembre de 2026.'
  },
  {
    id: 'eval-1-notes',
    period: '1ª Evaluación',
    title: 'Entrega de Notas de la 1ª Evaluación',
    startDate: '2026-12-04',
    endDate: '2026-12-04',
    type: 'grades',
    notes: 'Publicación oficial de calificaciones del primer trimestre.'
  },
  {
    id: 'eval-2-exam',
    period: '2ª Evaluación',
    title: 'Semana de Exámenes de la 2ª Evaluación',
    startDate: '2027-02-18',
    endDate: '2027-02-23',
    examDays: ['2027-02-18', '2027-02-19', '2027-02-22', '2027-02-23'],
    type: 'exam',
    notes: 'Días oficiales de pruebas: 18, 19, 22 y 23 de febrero de 2027.'
  },
  {
    id: 'eval-2-notes',
    period: '2ª Evaluación',
    title: 'Entrega de Notas de la 2ª Evaluación',
    startDate: '2027-02-26',
    endDate: '2027-02-26',
    type: 'grades',
    notes: 'Entrega de boletines y calificaciones a partir del 26 de febrero de 2027.'
  },
  {
    id: 'eval-3-exam',
    period: '3ª Evaluación',
    title: 'Exámenes de la 3ª Evaluación',
    startDate: '2027-04-19',
    endDate: '2027-04-23',
    type: 'exam',
    notes: 'Semana de pruebas correspondientes a la tercera evaluación (19 al 23 de abril de 2027).'
  },
  {
    id: 'ffe-period',
    period: 'Prácticas',
    title: 'FFE (Formación en Empresa)',
    startDate: '2027-04-26',
    endDate: '2027-05-21',
    type: 'internship',
    notes: 'Periodo de estancia formativa en empresas del 26 de abril al 21 de mayo de 2027.'
  },
  {
    id: 'eval-ord-exam',
    period: 'Final Ordinaria',
    title: 'Exámenes de la Convocatoria Final Ordinaria',
    startDate: '2027-05-24',
    endDate: '2027-05-27',
    type: 'exam',
    notes: 'Pruebas finales ordinarias de recuperación y globales (24 al 27 de mayo de 2027).'
  },
  {
    id: 'eval-ord-notes',
    period: 'Final Ordinaria',
    title: 'Entrega de Notas de la Convocatoria Ordinaria',
    startDate: '2027-06-01',
    endDate: '2027-06-01',
    type: 'grades',
    notes: 'Publicación de notas finales ordinarias (1 de junio de 2027).'
  },
  {
    id: 'eval-extra-reinforce',
    period: 'Evaluación Extraordinaria',
    title: 'Actividades de Refuerzo Extraordinarias',
    startDate: '2027-05-31',
    endDate: '2027-06-09',
    type: 'reinforcement',
    notes: 'Clases y tutorías de apoyo previo a las pruebas extraordinarias (31 mayo al 9 junio).'
  },
  {
    id: 'eval-extra-exam',
    period: 'Evaluación Extraordinaria',
    title: 'Semana de Exámenes de la Convocatoria Extraordinaria',
    startDate: '2027-06-10',
    endDate: '2027-06-15',
    examDays: ['2027-06-10', '2027-06-11', '2027-06-14', '2027-06-15'],
    type: 'exam',
    notes: 'Exámenes extraordinarios: 10, 11, 14 y 15 de junio de 2027.'
  },
  {
    id: 'eval-extra-notes',
    period: 'Evaluación Extraordinaria',
    title: 'Entrega de Notas de la Convocatoria Extraordinaria',
    startDate: '2027-06-18',
    endDate: '2027-06-18',
    type: 'grades',
    notes: 'Cierre de actas y entrega final de calificaciones (18 de junio de 2027).'
  }
];
