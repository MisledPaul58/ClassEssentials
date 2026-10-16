/// <reference types="astro/client" />

// Variables de entorno públicas (se inyectan en tiempo de build).
// En local viven en `.env`; en GitHub Actions, en los Secrets del repositorio.
interface ImportMetaEnv {
  /** Objeto firebaseConfig serializado como JSON. Si está vacío, el tablón funciona en modo local. */
  readonly PUBLIC_FIREBASE_CONFIG?: string;
  /** Hash SHA-256 (hex) de la contraseña de administrador del dueño. */
  readonly PUBLIC_ADMIN_PIN_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
