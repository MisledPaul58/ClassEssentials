/**
 * ClassEssentials — Categorías y publicaciones iniciales del tablón.
 */

import type { Announcement } from '../lib/types';

/** Categorías disponibles al publicar (etiqueta visible ↔ valor guardado). */
export const CATEGORIES = [
  { value: 'Software Portable', label: 'Software Portable' },
  { value: 'Guías y Chuletas', label: 'Guías y Chuletas' },
  { value: 'Apuntes y Ejercicios', label: 'Apuntes y Ejercicios' },
  { value: 'Aviso', label: 'Aviso de Clase' },
  { value: 'Otro', label: 'Otro' }
] as const;

/** Opciones del filtro de categorías del tablón. */
export const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas las categorías' },
  ...CATEGORIES.map(c => ({ value: c.value, label: c.label })),
  { value: 'community', label: 'Aportes de la Comunidad' },
  { value: 'official', label: 'Anuncios Oficiales' }
] as const;

/** Publicaciones de ejemplo (se usan como contenido inicial y en modo local). */
export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-welcome',
    title: '¡Bienvenidos a ClassEssentials para 1º DAM!',
    author: 'MisledPaul58 (Creador)',
    date: '2026-10-15',
    category: 'Aviso',
    badge: 'Importante',
    description:
      'Espacio centralizado con la calculadora oficial de faltas del IES Las Encinas, el calendario de exámenes 2026-2027 y herramientas portables para que nadie se quede atrás en clase.',
    link: '',
    linkText: '',
    isOfficial: true
  },
  {
    id: 'ann-firefox-portable',
    title: 'Firefox Portable (Ideal para los ordenadores del aula)',
    author: 'MisledPaul58',
    date: '2026-10-15',
    category: 'Software Portable',
    badge: 'Recomendado',
    description:
      'Navegador web que no requiere instalación ni permisos de administrador en las máquinas del instituto. Mantén tus marcadores, extensiones de depuración web e historial en tu propio pendrive.',
    link: 'https://portableapps.com/apps/internet/firefox_portable',
    linkText: 'Descargar Firefox Portable',
    isOfficial: true
  },
  {
    id: 'ann-vsc-portable',
    title: 'Visual Studio Code Portable',
    author: 'MisledPaul58',
    date: '2026-10-15',
    category: 'Software Portable',
    badge: 'Herramienta',
    description:
      'Editor de código ligero con configuración de extensiones para Java, HTML, CSS y Git sin modificar el sistema operativo del instituto.',
    link: 'https://code.visualstudio.com/Download#',
    linkText: 'Descargar VS Code .zip',
    isOfficial: true
  },
  {
    id: 'ann-dbeaver',
    title: 'DBeaver Community Portable (Gestor SQL / Bases de Datos)',
    author: 'MisledPaul58',
    date: '2026-10-15',
    category: 'Software Portable',
    badge: 'Bases de Datos',
    description:
      'Cliente SQL universal para MySQL, PostgreSQL, SQLite y MariaDB. Muy útil para el módulo de Bases de Datos.',
    link: 'https://dbeaver.io/download/',
    linkText: 'Descargar DBeaver Portable (.zip)',
    isOfficial: true
  },
  {
    id: 'ann-git-guide',
    title: 'Chuleta Rápida de Git y GitHub para Entornos de Desarrollo',
    author: 'Comunidad DAM',
    date: '2026-10-15',
    category: 'Guías y Chuletas',
    badge: 'Académico',
    description:
      'Comandos fundamentales (git init, commit, branch, merge, pull, push, rebase) explicados de forma clara para el módulo de ED.',
    link: 'https://education.github.com/git-cheat-sheet-education.pdf',
    linkText: 'Ver PDF Oficial de GitHub',
    isOfficial: true
  },
  {
    id: 'ann-java-cheatsheet',
    title: 'Guía de Sintaxis y POO en Java 21',
    author: 'Comunidad DAM',
    date: '2026-10-15',
    category: 'Guías y Chuletas',
    badge: 'Programación',
    description:
      'Referencia rápida de Programación: tipos primitivos, bucles, clases, herencia, interfaces, ArrayList y manejo de excepciones.',
    link: 'https://devhints.io/java',
    linkText: 'Consultar Chuleta Java',
    isOfficial: true
  }
];
