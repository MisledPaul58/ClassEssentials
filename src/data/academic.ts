/**
 * ClassEssentials — Datos académicos de 1º DAM (IES Las Encinas, curso 2026-2027).
 */

export const ACADEMIC_INFO = {
  institution: 'IES Las Encinas',
  course: '1º Desarrollo de Aplicaciones Multiplataforma (DAM)',
  academicYear: '2026 - 2027',
  /** Horas lectivas totales del curso (1º de DAM). */
  firstYearHours: 1000,
  /** Porcentaje de faltas injustificadas que provoca la pérdida de matrícula. */
  matriculaPercentage: 15,
  /**
   * Límite de faltas injustificadas para perder la matrícula.
   * La normativa solo computa las horas del curso (1º DAM: 1.000 h) →
   * 15% de 1.000 h = 150 faltas injustificadas.
   */
  matriculaLimitHours: 150
} as const;

/**
 * Módulos oficiales de 1º DAM con sus horas y límites de faltas para la
 * pérdida de evaluación continua.
 * REGLA: cuentan tanto faltas JUSTIFICADAS como INJUSTIFICADAS (J + I).
 */
export const MODULES_DATA = [
  {
    id: 'bd',
    name: 'Bases de datos',
    shortName: 'BD',
    code: '0484',
    hours: 205,
    percentage: 15,
    limitHours: 30.75,
    limitAbsences: 31,
    color: '#2563eb',
    description: 'Diseño conceptual, relacional, SQL, DDL, DML y bases de datos NoSQL.'
  },
  {
    id: 'ed',
    name: 'Entornos de desarrollo',
    shortName: 'ED',
    code: '0487',
    hours: 60,
    percentage: 30,
    limitHours: 18,
    limitAbsences: 18,
    color: '#7c3aed',
    description: 'Control de versiones (Git), IDEs, pruebas unitarias y refactorización.'
  },
  {
    id: 'lm',
    name: 'Lenguajes de marcas',
    shortName: 'LMSGI',
    code: '0373',
    hours: 110,
    percentage: 15,
    limitHours: 16.5,
    limitAbsences: 17,
    color: '#059669',
    description: 'XML, JSON, HTML5, CSS3, XPath, XSLT y sindicación de contenidos.'
  },
  {
    id: 'prog',
    name: 'Programación',
    shortName: 'PROG',
    code: '0485',
    hours: 270,
    percentage: 30,
    limitHours: 81,
    limitAbsences: 81,
    color: '#ea580c',
    description: 'Java, POO, estructuras de datos, excepciones, ficheros y colecciones.'
  },
  {
    id: 'aprog',
    name: 'Ampliación de Programación',
    shortName: 'A-PROG',
    code: 'AMP-PROG',
    hours: 50,
    percentage: 30,
    limitHours: 15,
    limitAbsences: 15,
    color: '#db2777',
    description: 'Profundización en patrones de diseño, frameworks y buenas prácticas de código.'
  },
  {
    id: 'si',
    name: 'Sistemas Informáticos',
    shortName: 'SI',
    code: '0483',
    hours: 205,
    percentage: 30,
    limitHours: 61.5,
    limitAbsences: 62,
    color: '#0284c7',
    description: 'Hardware, sistemas operativos Linux/Windows, redes locales y seguridad básica.'
  },
  {
    id: 'ipe1',
    name: 'Itinerario Personal para la Empleabilidad I',
    shortName: 'IPE I',
    code: '1709',
    hours: 100,
    percentage: 15,
    limitHours: 15,
    limitAbsences: 15,
    color: '#16a34a',
    description: 'Orientación laboral, legislación laboral, nóminas y prevención de riesgos laborales.'
  }
] as const;
