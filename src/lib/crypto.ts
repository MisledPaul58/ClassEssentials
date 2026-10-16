/**
 * Utilidades criptográficas (Web Crypto API).
 * Nota: requieren contexto seguro (HTTPS o localhost), que es el caso de
 * GitHub Pages y del servidor de desarrollo local.
 */

/** Calcula el hash SHA-256 (hexadecimal) de un texto. */
export async function sha256Hex(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('La Web Crypto API no está disponible en este navegador/contexto.');
  }
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Genera un token aleatorio único por carga de página.
 * Sirve para identificar al autor de una publicación "hasta que recargue":
 * sin él, no se muestran los botones de editar/borrar sobre esa tarjeta.
 */
export function randomToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
