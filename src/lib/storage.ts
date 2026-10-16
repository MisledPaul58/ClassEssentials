/**
 * Acceso tipado y seguro a localStorage.
 */

export const STORAGE_KEYS = {
  absences: 'classessentials_absences_v1',
  theme: 'classessentials_theme_v1',
  adminSession: 'classessentials_admin_active_v1',
  /** Hash SHA-256 (hex) de la contraseña personalizada del dueño en este navegador. */
  customAdminPwdHash: 'classessentials_custom_admin_pwd_hash_v1',
  /** Clave antigua (texto plano). Se migra automáticamente al iniciar sesión. */
  legacyCustomAdminPwd: 'classessentials_custom_admin_pwd_v1',
  /** Configuración de Firebase guardada desde el panel del dueño (modo avanzado). */
  firebaseConfig: 'classessentials_firebase_custom_config_v1',
  /** Caché local del tablón para funcionar sin conexión. */
  announcementsCache: 'classessentials_cloud_announcements_cache_v2'
} as const;

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Almacenamiento no disponible (modo privado, cuota llena...) */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Ignorar */
  }
}

export function readJSON<T>(key: string): T | null {
  const raw = readString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  writeString(key, JSON.stringify(value));
}
