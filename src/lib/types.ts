/**
 * Tipos compartidos de ClassEssentials.
 */

/** Publicación del tablón (recurso, apunte o aviso). */
export interface Announcement {
  id: string;
  title: string;
  category: string;
  author: string;
  description: string;
  link?: string;
  linkText?: string;
  badge?: string;
  isOfficial?: boolean;
  /** Fecha de publicación en formato YYYY-MM-DD. */
  date?: string;
  /** Fecha de creación original (Timestamp de Firestore o ISO en modo local). */
  createdAt?: unknown;
  /** Fecha de la última edición, si la tiene. */
  updatedAt?: unknown;
  /**
   * Token aleatorio generado en memoria al cargar la página.
   * Permite a cada alumno editar/borrar SUS publicaciones hasta que recargue
   * la página, sin necesidad de crear un sistema de cuentas.
   */
  ownerToken?: string;
}

/** Faltas registradas de un módulo. */
export interface AbsenceRecord {
  justified: number;
  unjustified: number;
}

export type AbsenceMap = Record<string, AbsenceRecord>;

/** Día festivo o periodo vacacional. */
export interface Holiday {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'nacional' | 'puente' | 'vacaciones' | 'educativo' | 'escolar';
  description: string;
}

/** Hito académico (exámenes, notas, prácticas...). */
export interface Milestone {
  id: string;
  period: string;
  title: string;
  startDate: string;
  endDate: string;
  examDays?: string[];
  type: 'exam' | 'grades' | 'internship' | 'reinforcement';
  notes: string;
}

/** Evento ya normalizado para pintar en el calendario. */
export interface CalendarEvent {
  id: string;
  category: 'holiday' | Milestone['type'];
  title: string;
  startDate: string;
  endDate: string;
  badge: string;
  description: string;
}

/** Configuración de Firebase tal y como se guarda en el entorno / localStorage. */
export interface FirebaseConfigLike {
  apiKey: string;
  projectId: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  [key: string]: unknown;
}
