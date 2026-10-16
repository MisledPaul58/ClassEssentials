/**
 * Configuración pública de la aplicación.
 * Los valores sensibles llegan desde variables de entorno en tiempo de build
 * (ver `.env.example`): nunca se escriben en el código fuente.
 */

import type { FirebaseConfigLike } from './types';

function parseFirebaseConfig(raw: string | undefined): FirebaseConfigLike | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as FirebaseConfigLike;
    if (parsed && typeof parsed === 'object' && parsed.projectId && parsed.apiKey) {
      return parsed;
    }
  } catch (error) {
    console.warn('PUBLIC_FIREBASE_CONFIG no contiene un JSON válido:', error);
  }
  return null;
}

/** Configuración de Firebase (null → el tablón funciona en modo local). */
export const FIREBASE_CONFIG: FirebaseConfigLike | null = parseFirebaseConfig(import.meta.env.PUBLIC_FIREBASE_CONFIG);

/** Hash SHA-256 (hex) de la contraseña del dueño. Cadena vacía → login deshabilitado. */
export const ADMIN_PIN_HASH: string = (import.meta.env.PUBLIC_ADMIN_PIN_HASH ?? '').trim().toLowerCase();

/** Datos del dueño de la web. */
export const OWNER_CONFIG = {
  name: 'MisledPaul58',
  repositoryUrl: 'https://github.com/MisledPaul58/ClassEssentials'
} as const;
