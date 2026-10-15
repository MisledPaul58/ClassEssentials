/**
 * ClassEssentials - Datos Académicos 1º DAM - IES Las Encinas
 * Configuración oficial de módulos, límites de faltas, festivos y fechas clave (Curso 2026-2027)
 */

export const ACADEMIC_INFO = {
    institution: "IES Las Encinas",
    course: "1º Desarrollo de Aplicaciones Multiplataforma (DAM)",
    academicYear: "2026 - 2027",
    totalCycleHours: 2000,
    totalFirstYearHours: 1000,
    // La pérdida de matrícula se da al faltar injustificadamente al 15% de las horas totales
    // Para 1º de DAM (1.000 horas lectivas en total): 15% = 150 faltas injustificadas
    matriculaLimitHours1stYear: 150,
    matriculaLimitHoursFullCycle: 300,
    matriculaPercentage: 15
};

export const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export const ADMIN_CONFIG = {
    ownerName: "MisledPaul58",
    defaultPin: "dam2026",
    githubRepo: "MisledPaul58/ClassEssentials"
};

/**
 * Módulos oficiales de 1º DAM con sus horas y límites de faltas para pérdida de evaluación continua.
 * REGLA: Cuentan tanto faltas JUSTIFICADAS como INJUSTIFICADAS (J + I).
 */
export const MODULES_DATA = [
    {
        id: "bd",
        name: "Bases de datos",
        shortName: "BD",
        code: "0484",
        hours: 205,
        percentage: 15,
        limitHours: 30.75,
        limitAbsences: 31,
        color: "#2563eb", // Royal blue
        icon: "database",
        description: "Diseño conceptual, relacional, SQL, DDL, DML y bases de datos NoSQL."
    },
    {
        id: "ed",
        name: "Entornos de desarrollo",
        shortName: "ED",
        code: "0487",
        hours: 60,
        percentage: 30,
        limitHours: 18,
        limitAbsences: 18,
        color: "#7c3aed", // Violet
        icon: "code",
        description: "Control de versiones (Git), IDEs, pruebas unitarias y refactorización."
    },
    {
        id: "lm",
        name: "Lenguajes de marcas",
        shortName: "LMSGI",
        code: "0373",
        hours: 110,
        percentage: 15,
        limitHours: 16.5,
        limitAbsences: 17,
        color: "#059669", // Emerald
        icon: "layout",
        description: "XML, JSON, HTML5, CSS3, XPath, XSLT y sindicación de contenidos."
    },
    {
        id: "prog",
        name: "Programación",
        shortName: "PROG",
        code: "0485",
        hours: 270,
        percentage: 30,
        limitHours: 81,
        limitAbsences: 81,
        color: "#ea580c", // Amber/Orange
        icon: "cpu",
        description: "Java, POO, estructuras de datos, excepciones, ficheros y colecciones."
    },
    {
        id: "aprog",
        name: "Ampliación de Programación",
        shortName: "A-PROG",
        code: "AMP-PROG",
        hours: 50,
        percentage: 30,
        limitHours: 15,
        limitAbsences: 15,
        color: "#db2777", // Pink/Rose
        icon: "terminal",
        description: "Profundización en patrones de diseño, frameworks y buenas prácticas de código."
    },
    {
        id: "si",
        name: "Sistemas Informáticos",
        shortName: "SI",
        code: "0483",
        hours: 205,
        percentage: 30,
        limitHours: 61.5,
        limitAbsences: 62,
        color: "#0284c7", // Sky blue
        icon: "server",
        description: "Hardware, sistemas operativos Linux/Windows, redes locales y seguridad básica."
    },
    {
        id: "ipe1",
        name: "Itinerario Personal para la Empleabilidad I",
        shortName: "IPE I",
        code: "1709",
        hours: 100,
        percentage: 15,
        limitHours: 15,
        limitAbsences: 15,
        color: "#16a34a", // Green
        icon: "briefcase",
        description: "Orientación laboral, legislación laboral, nóminas y prevención de riesgos laborales."
    }
];

/**
 * Días festivos y periodos vacacionales (sin clase) para el curso 2026-2027
 */
export const HOLIDAYS_DATA = [
    {
        id: "festivo-1",
        title: "Fiesta Nacional de España",
        startDate: "2026-10-12",
        endDate: "2026-10-12",
        type: "nacional",
        description: "Día de la Hispanidad / Fiesta Nacional."
    },
    {
        id: "festivo-2",
        title: "Todos los Santos (Traslado)",
        startDate: "2026-11-02",
        endDate: "2026-11-02",
        type: "nacional",
        description: "Día no lectivo por traslado de la festividad de Todos los Santos."
    },
    {
        id: "festivo-3",
        title: "Puente de la Constitución e Inmaculada",
        startDate: "2026-12-07",
        endDate: "2026-12-08",
        type: "puente",
        description: "Día de la Constitución Española y Día de la Inmaculada Concepción."
    },
    {
        id: "festivo-4",
        title: "Vacaciones de Navidad",
        startDate: "2026-12-23",
        endDate: "2027-01-08",
        type: "vacaciones",
        description: "Periodo vacacional de invierno (ambos inclusive)."
    },
    {
        id: "festivo-5",
        title: "Día de la Comunidad Educativa",
        startDate: "2027-02-12",
        endDate: "2027-02-12",
        type: "educativo",
        description: "Día festivo escolar en centros educativos."
    },
    {
        id: "festivo-6",
        title: "Día no lectivo",
        startDate: "2027-02-15",
        endDate: "2027-02-15",
        type: "escolar",
        description: "Día no lectivo acordado en el calendario escolar."
    },
    {
        id: "festivo-7",
        title: "Semana Santa y Festividades de Primavera",
        startDate: "2027-03-19",
        endDate: "2027-03-29",
        type: "vacaciones",
        description: "San José y periodo vacacional de Semana Santa (ambos inclusive)."
    }
];

/**
 * Hitos académicos, semanas de exámenes y entrega de notas para 1º DAM
 */
export const MILESTONES_DATA = [
    {
        id: "eval-1-exam",
        period: "1ª Evaluación",
        title: "Semana de Exámenes de la 1ª Evaluación",
        startDate: "2026-11-18",
        endDate: "2026-11-24",
        examDays: ["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-23", "2026-11-24"],
        type: "exam",
        notes: "Días oficiales de pruebas: 18, 19, 20, 23 y 24 de noviembre de 2026."
    },
    {
        id: "eval-1-notes",
        period: "1ª Evaluación",
        title: "Entrega de Notas de la 1ª Evaluación",
        startDate: "2026-12-04",
        endDate: "2026-12-04",
        type: "grades",
        notes: "Publicación oficial de calificaciones del primer trimestre."
    },
    {
        id: "eval-2-exam",
        period: "2ª Evaluación",
        title: "Semana de Exámenes de la 2ª Evaluación",
        startDate: "2027-02-18",
        endDate: "2027-02-23",
        examDays: ["2027-02-18", "2027-02-19", "2027-02-22", "2027-02-23"],
        type: "exam",
        notes: "Días oficiales de pruebas: 18, 19, 22 y 23 de febrero de 2027."
    },
    {
        id: "eval-2-notes",
        period: "2ª Evaluación",
        title: "Entrega de Notas de la 2ª Evaluación",
        startDate: "2027-02-26",
        endDate: "2027-02-26",
        type: "grades",
        notes: "Entrega de boletines y calificaciones a partir del 26 de febrero de 2027."
    },
    {
        id: "eval-3-exam",
        period: "3ª Evaluación",
        title: "Exámenes de la 3ª Evaluación",
        startDate: "2027-04-19",
        endDate: "2027-04-23",
        type: "exam",
        notes: "Semana de pruebas correspondientes a la tercera evaluación (19 al 23 de abril de 2027)."
    },
    {
        id: "ffe-period",
        period: "Prácticas",
        title: "FFE (Formación en Empresa)",
        startDate: "2027-04-26",
        endDate: "2027-05-21",
        type: "internship",
        notes: "Periodo de estancia formativa en empresas del 26 de abril al 21 de mayo de 2027."
    },
    {
        id: "eval-ord-exam",
        period: "Final Ordinaria",
        title: "Exámenes de la Convocatoria Final Ordinaria",
        startDate: "2027-05-24",
        endDate: "2027-05-27",
        type: "exam",
        notes: "Pruebas finales ordinarias de recuperación y globales (24 al 27 de mayo de 2027)."
    },
    {
        id: "eval-ord-notes",
        period: "Final Ordinaria",
        title: "Entrega de Notas de la Convocatoria Ordinaria",
        startDate: "2027-06-01",
        endDate: "2027-06-01",
        type: "grades",
        notes: "Publicación de notas finales ordinarias (1 de junio de 2027)."
    },
    {
        id: "eval-extra-reinforce",
        period: "Evaluación Extraordinaria",
        title: "Actividades de Refuerzo Extraordinarias",
        startDate: "2027-05-31",
        endDate: "2027-06-09",
        type: "reinforcement",
        notes: "Clases y tutorías de apoyo previo a las pruebas extraordinarias (31 mayo al 9 junio)."
    },
    {
        id: "eval-extra-exam",
        period: "Evaluación Extraordinaria",
        title: "Semana de Exámenes de la Convocatoria Extraordinaria",
        startDate: "2027-06-10",
        endDate: "2027-06-15",
        examDays: ["2027-06-10", "2027-06-11", "2027-06-14", "2027-06-15"],
        type: "exam",
        notes: "Exámenes extraordinarios: 10, 11, 14 y 15 de junio de 2027."
    },
    {
        id: "eval-extra-notes",
        period: "Evaluación Extraordinaria",
        title: "Entrega de Notas de la Convocatoria Extraordinaria",
        startDate: "2027-06-18",
        endDate: "2027-06-18",
        type: "grades",
        notes: "Cierre de actas y entrega final de calificaciones (18 de junio de 2027)."
    }
];

/**
 * Recursos y anuncios iniciales útiles para 1º DAM
 */
export const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "ann-welcome",
        title: "¡Bienvenidos a ClassEssentials para 1º DAM!",
        author: "MisledPaul58 (Creador)",
        date: "2026-10-15",
        category: "Aviso",
        badge: "Importante",
        description: "Espacio centralizado con la calculadora oficial de faltas del IES Las Encinas, el calendario de exámenes 2026-2027 y herramientas portables para que nadie se quede atrás en clase.",
        link: "",
        linkText: ""
    },
    {
        id: "ann-firefox-portable",
        title: "Firefox Portable (Ideal para los ordenadores del aula)",
        author: "MisledPaul58",
        date: "2026-10-15",
        category: "Software Portable",
        badge: "Recomendado",
        description: "Navegador web que no requiere instalación ni permisos de administrador en las máquinas del instituto. Mantén tus marcadores, extensiones de depuración web e historial en tu propio pendrive.",
        link: "https://portableapps.com/apps/internet/firefox_portable",
        linkText: "Descargar Firefox Portable"
    },
    {
        id: "ann-vsc-portable",
        title: "Visual Studio Code Portable",
        author: "MisledPaul58",
        date: "2026-10-15",
        category: "Software Portable",
        badge: "Herramienta",
        description: "Editor de código ligero con configuración de extensiones para Java, HTML, CSS y Git sin modificar el sistema operativo del instituto.",
        link: "https://code.visualstudio.com/Download#",
        linkText: "Descargar VS Code .zip"
    },
    {
        id: "ann-dbeaver",
        title: "DBeaver Community Portable (Gestor SQL / Bases de Datos)",
        author: "MisledPaul58",
        date: "2026-10-15",
        category: "Software Portable",
        badge: "Bases de Datos",
        description: "Cliente SQL universal para MySQL, PostgreSQL, SQLite y MariaDB. Muy útil para el módulo de Bases de Datos.",
        link: "https://dbeaver.io/download/",
        linkText: "Descargar DBeaver Portable (.zip)"
    },
    {
        id: "ann-git-guide",
        title: "Chuleta Rápida de Git y GitHub para Entornos de Desarrollo",
        author: "Comunidad DAM",
        date: "2026-10-15",
        category: "Guías y Chuletas",
        badge: "Académico",
        description: "Comandos fundamentales (git init, commit, branch, merge, pull, push, rebase) explicados de forma clara para el módulo de ED.",
        link: "https://education.github.com/git-cheat-sheet-education.pdf",
        linkText: "Ver PDF Oficial de GitHub"
    },
    {
        id: "ann-java-cheatsheet",
        title: "Guía de Sintaxis y POO en Java 21",
        author: "Comunidad DAM",
        date: "2026-10-15",
        category: "Guías y Chuletas",
        badge: "Programación",
        description: "Referencia rápida de Programación: tipos primitivos, bucles, clases, herencia, interfaces, ArrayList y manejo de excepciones.",
        link: "https://devhints.io/java",
        linkText: "Consultar Chuleta Java"
    }
];
