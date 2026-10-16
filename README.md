# 📚 ClassEssentials — 1º DAM (IES Las Encinas)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=for-the-badge&logo=github)](https://misledpaul58.github.io/ClassEssentials/)
[![Astro 5](https://img.shields.io/badge/Astro-5.x-ff5d01?style=for-the-badge&logo=astro)](https://astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **ClassEssentials** es una plataforma web académica para los estudiantes de **1º de DAM (Desarrollo de Aplicaciones Multiplataforma)** en el **IES Las Encinas** (curso 2026-2027): calculadora de faltas, calendario escolar, hitos de evaluación y tablón colaborativo de recursos.

🌐 **Web publicada:** [https://misledpaul58.github.io/ClassEssentials/](https://misledpaul58.github.io/ClassEssentials/)

---

## 🎯 Funcionalidades principales

### 📊 Calculadora de faltas y matrícula

- **Pérdida de evaluación continua** (por módulo): cuentan **todas** las faltas (justificadas + injustificadas) según el porcentaje de cada módulo (15% o 30%). Barras de progreso bicolor con estados *Seguro*, *Precaución*, *En Riesgo* y *Pérdida de Evaluación Continua*.
- **Pérdida de matrícula** (global): se calcula **solo con las horas del curso** (1º DAM = 1.000 h lectivas) → el 15% equivale a **150 faltas injustificadas**. Las horas del ciclo completo (2.000 h) no se tienen en cuenta.
- **Herramientas:** guardado automático en el navegador (100% privado, `localStorage`), exportar/importar copia de seguridad en `.json` e informe imprimible/PDF.

### 📅 Calendario y cuenta atrás

Detecta la fecha actual y muestra los próximos festivos, vacaciones y las semanas de exámenes de las tres evaluaciones, con un widget de cuenta atrás en tiempo real.

### 📢 Tablón colaborativo de recursos

- Cualquier compañero/a puede publicar recursos (enlaces a software portable, chuletas, apuntes…).
- **Sin cuentas ni registro:** quien publica algo puede **editar o borrar su publicación mientras no recargue la página** (una vez recargas, queda fijada y solo el dueño puede gestionarla). Las publicaciones editadas muestran el marcador *✏️ editada*.
- El dueño (modo administrador) puede **crear anuncios oficiales**, editar y borrar **cualquier** publicación.
- El tablón funciona en la nube (Firestore en tiempo real) si hay configuración de Firebase; si no, cae automáticamente en **modo local** por navegador.

---

## 🛠️ Tecnologías

| Pieza | Uso en el proyecto |
| --- | --- |
| **Astro 5** | Generación estática, componentes `.astro`, inyección de variables de entorno públicas en build |
| **TypeScript** | Lógica de la app (`src/lib/*.ts`) con tipado estricto |
| **CSS3 modular** | `src/styles/*.css` — variables, temas claro/oscuro, responsive, estilos de impresión |
| **Firebase (Firestore)** | Solo si hay configuración; se importa de forma **dinámica** (la web carga al instante si no se usa) |
| **GitHub Actions** | Build + despliegue automático en GitHub Pages |

> **Sin claves en el repositorio:** la configuración de Firebase y el hash de la contraseña del dueño se inyectan en tiempo de build desde variables de entorno (`.env` en local, *Secrets* en GitHub Actions). Ver [Seguridad](#-seguridad).

---

## 📦 Estructura del proyecto

```text
ClassEssentials/
├── .github/workflows/deploy.yml   # CI/CD: build de Astro + despliegue en Pages
├── firestore.rules                # Reglas de seguridad recomendadas para Firestore
├── astro.config.mjs               # Configuración de Astro (site + base de Pages)
├── package.json                   # Dependencias y scripts
├── .env.example                   # Plantilla de variables de entorno (sin secretos)
├── .env.test                      # Modo test: construye sin Firebase (para probar en local)
└── src/
    ├── pages/index.astro          # Página principal (SSR → HTML estático)
    ├── layouts/BaseLayout.astro   # <head>, tema pre-pintado, SEO, favicon
    ├── components/                # Secciones y modales (.astro)
    ├── data/                      # Módulos, límites, festivos, hitos y anuncios por defecto
    ├── lib/                       # Lógica en TypeScript (faltas, tablón, admin, base de datos…)
    └── styles/                    # CSS modular por sección (global, layout, board, modals…)
```

---

## 🚀 Desarrollo local

Requisitos: **Node.js 22+** y npm.

```bash
npm install          # instala dependencias
npm run dev          # servidor de desarrollo en http://localhost:4321/ClassEssentials
```

### Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` (usa `.env` para Firebase) |
| `npm run build:local` | Build **en modo test** (modo local, sin tocar Firebase) |
| `npm run preview` | Sirve `dist/` para comprobar el resultado |
| `npm run check` | Comprobación de tipos de Astro + TypeScript |

### Variables de entorno

Copia `.env.example` a `.env` y rellena tus valores (el `.env` **nunca** se sube al repositorio):

```bash
PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
PUBLIC_ADMIN_PIN_HASH=<hash sha-256 hex de tu contraseña de dueño>
```

Para generar el hash de la contraseña:

```bash
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('TU_CONTRASEÑA').digest('hex'))"
```

Consejo: usa una contraseña larga y aleatoria, por ejemplo
`node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))"`.

Si `PUBLIC_FIREBASE_CONFIG` está vacío, la web funciona igualmente en **modo local** (los anuncios se guardan solo en tu navegador). Así se construye con `npm run build:local` para hacer pruebas sin tocar la base de datos real de la clase.

---

## ☁️ Despliegue (GitHub Actions + GitHub Pages)

Cada `push` a `main` (o un lanzamiento manual desde la pestaña **Actions**) construye la web con Astro y la publica en GitHub Pages. El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) lee dos **Secrets** del repositorio:

| Secret | Contenido |
| --- | --- |
| `PUBLIC_FIREBASE_CONFIG` | Objeto `firebaseConfig` completo en **una sola línea** JSON |
| `PUBLIC_ADMIN_PIN_HASH` | Hash SHA-256 (hex) de la contraseña del dueño |

Para configurarlos: **Settings → Secrets and variables → Actions → New repository secret**.

> **Cambiar la contraseña de administrador:** actualiza el secret `PUBLIC_ADMIN_PIN_HASH` con el hash de la nueva contraseña y vuelve a lanzar el despliegue. (El cambio de contraseña desde la propia web solo afecta a ese navegador, como alternativa rápida.)

En `Settings → Pages`, la fuente de publicación debe estar en **GitHub Actions** (no en la rama `main`), ya que es el workflow quien publica el contenido generado en `dist/`.

---

## 🔐 Seguridad

Esto es una web estática sin sistema de cuentas, así que conviene ser honesto sobre lo que se puede y no se puede proteger:

- **La `apiKey` de Firebase es pública por diseño.** No es un secreto: identifica el proyecto, pero no autoriza nada por sí sola. Por eso vive fuera del código (variables de entorno) y se recomienda **rotarla** si en algún momento estuvo expuesta, además de **restringirla** en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) a los dominios de la web (HTTP referrers).
- **La protección real de los datos está en las reglas de Firestore.** En [`firestore.rules`](firestore.rules) hay reglas recomendadas (validación de formato, límites de longitud y protección de los anuncios oficiales). Para aplicarlas: consola de Firebase → Firestore → Reglas → pegar y publicar.
- **Para protección fuerte**, activa **Firebase App Check** (consola de Firebase → App Check) con reCAPTCHA v3; así solo la web real puede hablar con la base de datos.
- **Contraseña del dueño:** solo se guarda su **hash SHA-256** (nunca el texto plano) en los Secrets de GitHub. El antiguo modo administrador por defecto y la puerta trasera de versiones anteriores han sido eliminados.
- **Todo el contenido de usuarios se escapa** antes de insertarse en la página (protección XSS) y los enlaces se restringen a `http(s)`/`mailto`.

> ⚠️ Nota histórica: en versiones anteriores (antes de la migración a Astro) la configuración de Firebase estuvo incluida en el repositorio. Sigue estando en el historial de git, por eso se recomienda **rotar la apiKey** y revisar las reglas. El resto (projectId, etc.) es información pública normal de cualquier web de Firebase.

---

## 🧑‍💻 Autor y créditos

- **Creador:** [MisledPaul58](https://github.com/MisledPaul58)
- **Centro:** IES Las Encinas
- **Grupo:** 1º de DAM (Desarrollo de Aplicaciones Multiplataforma)
- **Año académico:** 2026-2027
- **Licencia:** MIT (ver [`LICENSE`](LICENSE))
