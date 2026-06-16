# Archivo de Buenas Prácticas (`BEST_PRACTICES.md`)

Este documento sirve como guía de estilo y normativa para mantener la calidad del código en el equipo.

# Estándares de Automatización y Buenas Prácticas

Este documento define las reglas para la creación, mantenimiento y ejecución de pruebas automatizadas mobile (Appium + WebdriverIO) de Intramed.

## 1. Nomenclatura de Archivos

Es mandatorio seguir estrictamente las siguientes convenciones de nombres para mantener el orden en el repositorio:

### Archivos de Test (`/src/specs`)

Deben indicar claramente el tipo de prueba, un identificador numérico y una descripción breve.

- **E2E:** `E2E_xx_{descripcion}.spec.ts`
  - _Ejemplo:_ `E2E_01_Login.spec.ts`

### Page Objects (`/src/pages`)

Deben indicar el nombre de la pantalla y el cliente al que pertenecen.

- **Formato:** `{NombrePagina}Page-{Cliente}.ts`
  - _Ejemplo:_ `LoginPage-Intramed.ts`
  - _Ejemplo:_ `FeedPage-Intramed.ts`
- `BasePage.ts` contiene las interacciones genéricas compartidas (tap, setValue, scroll, cambio de contexto nativo/webview).

### Locators (`/src/locators`)

Los locators viven SIEMPRE separados de los Page Objects, en archivos propios por pantalla.

- **Formato:** `{pantalla}.locators.ts`
  - _Ejemplo:_ `login.locators.ts`
- Cada archivo exporta un objeto con claves por plataforma (`android` / `ios`). Esto es un requisito de escalabilidad: cuando se agregue iOS, solo se completan los locators de esa plataforma sin tocar los Page Objects.
- El Page Object resuelve la plataforma en runtime (`driver.isIOS`) y nunca contiene selectores hardcodeados.

## 2. Estructura de los Casos de Prueba

- Los títulos de los tests siguen el formato `TCxx - descripción` (cuando los casos existan en Zephyr, se antepone el ID: `[IE-Txx] TCxx - descripción`).
- La numeración de TC es secuencial y única en todo el proyecto, no por archivo.
- Cada `describe` lleva al inicio el tag de suite para filtrar con grep: `[#login]`, `[#feed]`, `[#profile]`.
  - _Ejemplo:_ `describe('[#login] Login', () => { ... })`
- Para facilitar la legibilidad y el reporte de errores, los pasos lógicos de un flujo largo deben separarse en bloques `it` individuales dentro del mismo `describe`.

## 3. Calidad de Código y Limpieza

Sin Comentarios: El código debe ser autodescriptivo. Las variables y funciones deben tener nombres claros que expliquen su propósito. No se permiten comentarios explicando "qué hace el código". Solo se aceptan comentarios que expliquen un workaround o una restricción no obvia (ej: limitaciones del árbol de accesibilidad de UiAutomator).

Código Sencillo: Evitar lógica compleja dentro de los tests. La lógica pesada debe ir a la carpeta `/src/utils` o encapsulada en los Page Objects.

## 4. Seguridad y Configuración

Cero Hardcoding: Está estrictamente prohibido incluir credenciales, tokens, contraseñas o URLs fijas dentro del código fuente.

Variables de Entorno: Todos los datos sensibles o configurables deben ser llamados desde `process.env` (cargados vía dotenv en `wdio.shared.conf.ts`).

Bien: `await LoginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);`

Mal: `await LoginPage.login('usuario@mail.com', '123456');`

## 5. Flujo de Trabajo (Git Workflow)

Branching: Nunca trabajar directamente sobre la rama main.

Creación de Rama: Crear una rama a partir de main con el formato `feature/nombre-del-ticket`.

Push: Crear la rama en el origen (remoto) antes de finalizar.

Merge: Una vez probada la integración localmente, crear un Pull Request (PR) hacia main. El merge solo se realiza tras la aprobación y validación de los tests.

## 6. Documentación

Cualquier documento funcional, planes de prueba (Test Plans) o diagramas técnicos deben alojarse únicamente en la carpeta `/specs`.
