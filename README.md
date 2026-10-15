# 📚 ClassEssentials — 1º DAM (IES Las Encinas)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=for-the-badge&logo=github)](https://misledpaul58.github.io/ClassEssentials/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![DAM 1º](https://img.shields.io/badge/Ciclo-1º%20DAM-indigo?style=for-the-badge)](https://github.com/MisledPaul58/ClassEssentials)

> **ClassEssentials** es una plataforma web académica y moderna orientada a los estudiantes de **1º de DAM (Desarrollo de Aplicaciones Multiplataforma)** en el **IES Las Encinas** para el curso escolar 2026-2027.

---

## 🚀 Acceso a la Web
Puedes acceder directamente a la aplicación desplegada en:  
👉 **[https://misledpaul58.github.io/ClassEssentials/](https://misledpaul58.github.io/ClassEssentials/)**

---

## 🎯 Funcionalidades Principales

### 1. 📊 Calculadora Inteligente de Faltas y Asistencia
La normativa de Formación Profesional en España distingue dos niveles críticos de control de faltas:

1. **Pérdida de Evaluación Continua (Individual por Módulo):**
   - **Regla:** Cuentan **tanto las faltas justificadas como las injustificadas** ($J + I$).
   - Cada módulo tiene un límite de horas en función de su carga lectiva total:
     - **Bases de datos:** 205 h → 15 % = 30,75 h → **31 faltas**
     - **Entornos de desarrollo:** 60 h → 30 % = 18 h → **18 faltas**
     - **Lenguajes de marcas:** 110 h → 15 % = 16,5 h → **17 faltas**
     - **Programación:** 270 h → 30 % = 81 h → **81 faltas**
     - **Ampliación de Programación:** 50 h → 30 % = 15 h → **15 faltas**
     - **Sistemas Informáticos:** 205 h → 30 % = 61,5 h → **62 faltas**
     - **Itinerario Personal para la Empleabilidad I (IPE I):** 100 h → 15 % = **15 faltas**
   - **Visualización:** Barras de progreso bi-color (azul para justificadas, naranja para injustificadas), con badges dinámicos de estado (*Seguro*, *Precaución*, *En Riesgo* y *Pérdida de Evaluación Continua*), indicando exactamente cuántas faltas restan antes del límite.

2. **Pérdida de Matrícula (Global de todo el curso / ciclo):**
   - **Regla:** Se produce cuando el alumno falta de forma **injustificada al 15% de las horas totales**. Solo cuentan las faltas injustificadas acumuladas entre todas las asignaturas.
   - En **1º de DAM** (1.000 horas lectivas en total): el 15% equivale a **150 faltas injustificadas**. (Incluye selector para alternar la vista entre el 1º curso de 1.000h y el ciclo completo de 2.000h).
   - Medidor global con alerta temprana e indicador de faltas restantes.

3. **Herramientas de Asistencia:**
   - Guardado automático en el navegador del alumno (`localStorage`), manteniendo la privacidad completa.
   - Exportación e importación de copias de seguridad en formato `.json`.
   - Generación de informe imprimible / PDF listo para presentar.

---

### 2. 📅 Calendario Dinámico y Próximos Festivos
La aplicación detecta automáticamente la fecha actual del sistema e informa de los próximos días festivos y periodos vacacionales sin clase:

- **12 de octubre de 2026:** Fiesta Nacional de España (Día de la Hispanidad).
- **2 de noviembre de 2026:** Todos los Santos (traslado no lectivo).
- **7 y 8 de diciembre de 2026:** Puente de la Constitución y la Inmaculada Concepción.
- **23 de diciembre de 2026 al 8 de enero de 2027:** Vacaciones de Navidad (ambos inclusive).
- **12 de febrero de 2027:** Día de la Comunidad Educativa (no lectivo).
- **15 de febrero de 2027:** Día no lectivo.
- **19 de marzo de 2027 al 29 de marzo de 2027:** Semana Santa y festividades de primavera (ambos inclusive).

Incluye un **widget de cuenta atrás en tiempo real** que destaca cuántos días faltan para el próximo festivo.

---

### 3. 🎯 Hitos Académicos y Calendario de Exámenes (Curso 2026-2027)
Organización cronológica con filtros por trimestre:

- **1ª Evaluación:**
  - Semana de exámenes: 18, 19, 20, 23 y 24 de noviembre de 2026.
  - Entrega de notas: 4 de diciembre de 2026.
- **2ª Evaluación:**
  - Semana de exámenes: 18, 19, 22 y 23 de febrero de 2027.
  - Entrega de notas: a partir del 26 de febrero de 2027.
- **3ª Evaluación y Final Ordinaria:**
  - Exámenes 3ª evaluación: 19 al 23 de abril de 2027.
  - FFE (Formación en la Empresa): 26 de abril al 21 de mayo de 2027.
  - Exámenes final ordinaria: 24 al 27 de mayo de 2027.
  - Entrega de notas: 1 de junio de 2027.
- **Evaluación Extraordinaria:**
  - Actividades de refuerzo: 31 de mayo a 9 de junio de 2027.
  - Semana de exámenes: 10, 11, 14 y 15 de junio de 2027.
  - Entrega de notas: 18 de junio de 2027.

---

### 4. 📢 Tablón de Recursos y Software Portable (Preparado para la Clase)
Espacio dedicado a enlaces directos de descarga de software portable (ideal para usar en los equipos de las aulas de informática sin necesidad de privilegios de administrador):
- **Firefox Portable:** Navegador web listo para llevar en pendrive con extensiones de depuración.
- **Visual Studio Code Portable:** Entorno ligero con extensiones para desarrollo web y Java.
- **DBeaver Community Portable:** Gestor SQL universal para Bases de Datos.
- **Chuletas y Recursos Académicos:** PDF oficial de Git de GitHub Education, guía de POO en Java 21, sintaxis SQL, etc.

#### 🤝 Escalabilidad y Aportes de Compañeros:
- Los compañeros de clase pueden pulsar en **"➕ Publicar / Compartir Recurso"** para añadir nuevos enlaces directamente en su navegador.
- Cuenta con un botón **"📋 Copiar plantilla para el dueño"**, que formatea automáticamente la propuesta para que el creador de la web pueda incorporarla al repositorio de forma oficial y permanente mediante una Issue o Pull Request.

---

## 🛠️ Tecnologías Empleadas
- **HTML5 Semántico y Accesible.**
- **CSS3 Moderno:** Variables CSS personalizadas, diseño responsive mediante Flexbox y CSS Grid, temas Dark/Light, efectos de desenfoque de fondo (*backdrop-filter*) y estilos optimizados para impresión.
- **JavaScript (ES6+):** Arquitectura modular, persistencia de estado con `localStorage`, manipulación reactiva del DOM y cálculo dinámico de fechas locales.
- **Sin dependencias pesadas:** Cero frameworks que ralenticen la carga; rendimiento instantáneo y 100% compatible con GitHub Pages.

---

## 📦 Estructura del Proyecto
```text
ClassEssentials/
├── index.html              # Estructura principal de la aplicación web
├── css/
│   └── style.css           # Estilos modernos y académicos (Dark & Light mode)
├── js/
│   ├── app.js              # Controlador principal, cálculo de faltas y eventos
│   └── data.js             # Módulos, porcentajes, límites, festivos e hitos
├── README.md               # Documentación completa del proyecto
└── LICENSE                 # Licencia de código abierto MIT
```

---

## 🧑‍💻 Autor y Créditos
- **Creador:** [MisledPaul58](https://github.com/MisledPaul58)
- **Centro:** IES Las Encinas
- **Grupo:** 1º de DAM (Desarrollo de Aplicaciones Multiplataforma)
- **Año Académico:** 2026 - 2027
