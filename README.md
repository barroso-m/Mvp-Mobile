# qa-mobile-automation

Automatización mobile con **WebdriverIO v9 + Appium** para la app **IntraMed**.

Guía pensada para seguir los pasos y dejar todo listo desde cero en una máquina Windows: instalar las herramientas, configurar las variables de entorno, levantar el emulador, inspeccionar la app y finalmente correr los tests.

---

## 1. Programas a instalar

Descargar e instalar, en este orden:

| Herramienta               | Para qué sirve                                                                                                                                                                                                                            | Dónde se baja                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Node.js 24 o superior** | Ejecuta el proyecto y los tests. La versión exacta usada por el equipo está fijada en el archivo `.nvmrc` del repo — si tenés [nvm](https://github.com/coreybutler/nvm-windows) instalado, basta con correr `nvm use` dentro del proyecto | https://nodejs.org/                                                              |
| **Java JDK 17**           | Requisito de Android para correr el emulador                                                                                                                                                                                              | https://adoptium.net/                                                            |
| **Android Studio**        | Trae el SDK de Android, el emulador y el Device Manager                                                                                                                                                                                   | https://developer.android.com/studio                                             |
| **Appium Server**         | Es el "puente" entre los tests y el celular/emulador                                                                                                                                                                                      | Una vez instalado Node, abrir PowerShell y ejecutar: `npm install -g appium`     |
| **Driver UIAutomator2**   | Es lo que le enseña a Appium a manejar apps Android                                                                                                                                                                                       | `appium driver install uiautomator2`                                             |
| **Appium Inspector**      | App de escritorio para "ver por dentro" la pantalla del emulador y descubrir los locators (los IDs de los botones)                                                                                                                        | https://github.com/appium/appium-inspector/releases (bajar el `.exe` de Windows) |

**Cómo verificar que todo quedó instalado.** Abrir PowerShell y ejecutar:

```powershell
node --version
java --version
appium --version
```

Cada comando debería responder con un número de versión. Si alguno dice "no se reconoce el comando", la instalación de ese programa falló o falta configurar la variable de entorno (siguiente sección).

---

## 2. Configurar las variables de entorno en Windows

Las variables de entorno le dicen al sistema **dónde** están instaladas las herramientas. Sin ellas, los comandos de Android no funcionan.

### 2.1. Abrir el panel de variables de entorno

1. Presionar la tecla **Windows** y escribir "**variables de entorno**".
2. Click en "**Editar las variables de entorno del sistema**".
3. En la ventana que se abre, click en el botón "**Variables de entorno...**" abajo a la derecha.

### 2.2. Crear las variables necesarias

En la sección **"Variables del usuario"**, agregar (botón "Nueva..."):

| Nombre de la variable | Valor (ajustar la ruta según donde quedó instalado)                              |
| --------------------- | -------------------------------------------------------------------------------- |
| `ANDROID_HOME`        | `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`                                  |
| `JAVA_HOME`           | `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (la versión exacta varía) |

> Para saber la ruta exacta del SDK de Android: abrir Android Studio → File → Settings → Languages & Frameworks → Android SDK → arriba de todo dice "Android SDK Location".

### 2.3. Agregar carpetas al `Path`

En la lista de variables del usuario, buscar la variable llamada **`Path`** y darle doble click. Agregar estas líneas, una por una, con el botón "Nuevo":

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%JAVA_HOME%\bin
```

Aceptar todo. **Cerrar y volver a abrir PowerShell** para que tome los cambios.

### 2.4. Verificar que funcionan

```powershell
adb version
emulator -list-avds
```

`adb version` debería responder con un número. `emulator -list-avds` debería listar los emuladores creados (si todavía no creaste ninguno, sale vacío, eso es normal).

---

## 3. Crear el emulador de Android

1. Abrir **Android Studio**.
2. En la pantalla de bienvenida, click en "**More Actions**" → "**Virtual Device Manager**". (Si ya tenés un proyecto abierto, ir a "Tools" → "Device Manager".)
3. Click en "**Create Device**".
4. Elegir un teléfono Pixel (recomendado: **Pixel 7**) → "Next".
5. Elegir una imagen de Android — usar **API 34 (Android 14)** → "Next" → "Finish".
6. Una vez creado, click en el botón de "play" (▷) al lado del emulador para arrancarlo. La primera vez tarda unos minutos.

**Verificar que el emulador es visible para Appium.** Con el emulador prendido, en PowerShell:

```powershell
adb devices
```

Debería aparecer algo como `emulator-5554 device`. Ese `emulator-5554` es el ID que usa el proyecto.

---

## 4. Inspeccionar la app con Appium Inspector

Esto sirve cuando hay que agregar un test nuevo o adaptar un locator que cambió. **No es necesario para correr los tests existentes**; es solo para descubrir IDs de elementos nuevos.

### 4.1. Arrancar el servidor Appium

En una terminal PowerShell, ejecutar:

```powershell
appium
```

La terminal va a quedar mostrando logs. **No cerrarla** mientras inspeccionamos. Esa terminal queda "ocupada" — para los próximos pasos abrir **otra** terminal.

### 4.2. Tener el emulador corriendo

Confirmar con `adb devices` que aparece `emulator-5554`.

### 4.3. Abrir Appium Inspector y configurar las capabilities

1. Abrir la app **Appium Inspector**.
2. En "Remote Host" dejar `127.0.0.1`, en "Remote Port" dejar `4723`, "Remote Path" `/`.
3. En la sección "**Capabilities**" (formato JSON), pegar lo siguiente, ajustando la ruta del APK:

```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "emulator-5554",
  "appium:app": "C:\\Users\\TU_USUARIO\\OneDrive\\Desktop\\Automation\\Intramed\\Mobile\\apps\\intramed.apk",
  "appium:noReset": false,
  "appium:newCommandTimeout": 240
}
```

4. Click en "**Start Session**".

Si todo está bien, después de unos segundos Appium Inspector va a abrir una vista con la pantalla del emulador a la izquierda y el árbol de elementos a la derecha. Click en cualquier elemento de la pantalla → del lado derecho aparece su `resource-id`, `content-desc`, etc. **Esos son los locators que usa el proyecto.**

> Tip: cuando un locator dice por ejemplo `~Crear`, eso significa "buscar por accessibility id (content-desc) = Crear". Cuando dice `//android.widget.Button[@resource-id="loginButton"]`, eso es un XPath buscando el botón por su ID.

---

## 5. Instalar y correr el proyecto

### 5.1. Antes de clonar — pedirle al equipo

Hay tres cosas que no están en el repositorio y que hay que conseguir aparte (por seguridad: son binarios o credenciales que no se versionan):

| Qué                                         | Para qué                                                             | A quién pedírselo     |
| ------------------------------------------- | -------------------------------------------------------------------- | --------------------- |
| **APK de IntraMed**                         | Es la app que se va a testear                                        | Equipo de QA / Mobile |
| **Email y password de la cuenta de prueba** | Credenciales para loguear en la app y en la web de gestión de cuenta | Equipo de QA          |
| **Acceso al repositorio**                   | Para poder clonar                                                    | Líder técnico         |

### 5.2. Clonar el repositorio

```powershell
git clone https://github.com/barroso-m/Mvp-Mobile.git
cd Mvp-Mobile
```

### 5.3. Asegurar la versión correcta de Node

Si tenés [nvm-windows](https://github.com/coreybutler/nvm-windows) instalado:

```powershell
nvm use
```

Va a leer el archivo `.nvmrc` y cambiar automáticamente a la versión de Node correcta. Si no tenés `nvm`, asegurate de tener instalada manualmente la versión que indica ese archivo (o una superior).

### 5.4. Instalar las dependencias

```powershell
npm install
```

### 5.5. Crear el archivo `.env` con las credenciales de prueba

En la raíz del proyecto hay un archivo llamado **`.env.example`** que sirve de plantilla. Copiarlo a `.env`:

```powershell
copy .env.example .env
```

Después abrir el `.env` recién creado y reemplazar los valores con las credenciales reales que te pasó el equipo (paso 5.1) y con el nombre exacto del emulador que creaste en el paso 3:

```env
TEST_EMAIL=usuario.de.prueba@conexa.ai
TEST_PASSWORD=la-password-de-prueba
ANDROID_AVD=Pixel_7_API_34
```

> El nombre del `ANDROID_AVD` tiene que coincidir con el nombre del emulador. Para verlo exacto: `emulator -list-avds`.

### 5.6. Colocar el APK de IntraMed

Copiar el archivo `.apk` de IntraMed (el que te pasó el equipo en el paso 5.1) dentro de la carpeta `apps/` del proyecto. El nombre del archivo no importa: el proyecto detecta automáticamente cualquier `.apk` que encuentre ahí adentro. Tiene que haber **un solo** `.apk` en esa carpeta.

### 5.7. Levantar el emulador

Abrir el emulador desde Android Studio (paso 3) y esperar a que la pantalla de inicio esté visible. **El emulador tiene que estar corriendo antes** de ejecutar los comandos de la próxima sección.

### 5.8. Correr los tests

| Comando                         | Qué hace                                                                    |
| ------------------------------- | --------------------------------------------------------------------------- |
| `npm run test:android`          | Corre **todos** los casos en el emulador con la pantalla visible            |
| `npm run test:android:headless` | Igual que el anterior pero sin mostrar la ventana del emulador (más rápido) |
| `npm run test:android:login`    | Corre solo los casos de **Login**                                           |
| `npm run test:android:feed`     | Corre solo los casos del **Feed** (crear post, reaccionar, comentar)        |
| `npm run test:android:profile`  | Corre solo el caso de **Profile** (gestión de cuenta)                       |
| `npm run report`                | Genera y abre el reporte de Allure con los resultados de la última corrida  |

Al terminar la suite, Allure abre automáticamente un reporte HTML con todos los pasos, capturas y videos. El reporte queda guardado en `allure-report/index.html` por si querés volver a abrirlo después.

### 5.9. Configurar la subida a Zephyr (opcional)

Al terminar la corrida, el proyecto puede subir los resultados automáticamente a **Zephyr Essential** (el sistema de gestión de pruebas que usa el equipo en Jira). Esto crea un ciclo nuevo dentro de una carpeta del proyecto y registra cada caso con su estado (Pass / Fail).

**Si no completás estas variables, los tests corren igual** — simplemente se omite la subida y aparece un mensaje en consola avisando.

#### 5.9.1. Variables a configurar en `.env`

```env
# Zephyr config
ZEPHYR_PROJECT_KEY=IE
ZEPHYR_FOLDER_ID=46522900
ZEPHYR_AUTH_TOKEN=eyJ0eXAi...
```

| Variable             | Qué es                                                                                    | Cómo conseguirlo                                                                                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ZEPHYR_PROJECT_KEY` | El prefijo del proyecto en Jira/Zephyr. Para IntraMed mobile es `IE`                      | En Jira, abrir el proyecto y mirar el prefijo de cualquier issue (ej: `IE-123`)                                                                                                                                                                                                    |
| `ZEPHYR_FOLDER_ID`   | El ID numérico de la carpeta dentro de Zephyr donde van a aparecer los ciclos automáticos | En Zephyr Essential → "Ciclos de prueba" → click derecho sobre la carpeta deseada → "Editar carpeta". El ID aparece en la URL del navegador (`...folderId=46522900`). Si no querés que vaya a ninguna carpeta puntual, dejar la variable vacía y el ciclo va a aparecer en la raíz |
| `ZEPHYR_AUTH_TOKEN`  | Token JWT que autoriza al proyecto a crear ciclos y ejecuciones                           | En Jira: foto de perfil arriba a la derecha → "Apps" → "Zephyr Essential" → "API Access Tokens" → "Generate new token". Pegar el JWT completo (sin el prefijo `Bearer`). El token tiene fecha de expiración — si se vence, regenerarlo                                             |

#### 5.9.2. Mapear cada `it(...)` con un caso de Zephyr

Para que la subida sepa a qué caso corresponde cada test, el título del `it(...)` tiene que incluir la **clave del caso de Zephyr** entre corchetes, con el formato `[XX-Tnnn]`:

```ts
it('TC01 [IE-T26] - login inválido muestra mensaje de error', async () => { ... })
```

> Si el caso aún no existe en Zephyr, primero crearlo (manualmente o importando un CSV con el formato de Zephyr) y después poner el tag con la key que asignó Zephyr en el `it(...)`. Tests sin tag `[XX-Tnnn]` se ejecutan igual pero no se suben.

#### 5.9.3. Qué pasa después de cada corrida

Al final de `npm run test:android` (o cualquier variante), si las tres variables están configuradas, vas a ver en consola algo así:

```
[zephyr] Creando ciclo "Mobile Run — 19/6/2026 01:58:08"
[zephyr] Tests: 5 (✅ 5 / ❌ 0)
[zephyr] Ciclo creado: IE-R9
  ✅ IE-T26: Pass
  ✅ IE-T27: Pass
  ...
[zephyr] Subida completada.
```

En Zephyr, dentro de la carpeta configurada, va a aparecer un ciclo nuevo (`IE-R9` en el ejemplo) con las ejecuciones del run.

---

## 6. Estructura del proyecto

```
config/                     Configuraciones de WebdriverIO por plataforma
contextfiles/               Buenas prácticas y guías de estilo
src/
  locators/                 IDs de los elementos (separados por plataforma)
  pages/
    BasePage.ts             Funciones comunes (tap, scroll, esperar)
    Intramed/               Un archivo por pantalla — patrón Page Object
  specs/
    E2E/                    Los casos de prueba — formato E2E_xx_{Nombre}.spec.ts
  utils/                    Helpers: sesión, logger, OTP, contexto WebView
apps/                       Binarios .apk / .ipa (ignorados por git)
logs/                       Logs de Appium (ignorados por git)
allure-results/             Datos crudos del último run
allure-report/              Reporte HTML generado
```

---

## 7. Buenas prácticas

- **Antes de cada cambio, levantar el emulador y correr el test que se va a modificar**, para confirmar que está verde antes de tocar nada.
- **Datos únicos por corrida.** Los specs generan posts y comentarios con timestamp (`Date.now()`) para evitar falsos positivos de corridas previas.
- **Un caso de prueba = un `it(...)`.** Si un caso es muy largo, dividirlo. Lo importante es que cada `it` valide una sola cosa.
- **Locators centralizados.** Nunca poner un XPath o `~accessibility-id` dentro de un Page Object — siempre va en `src/locators/`. Si cambia el ID, se actualiza un solo lugar.
- **No interactuar con elementos sin esperarlos primero.** Usar `waitForElement` antes de cualquier `tap`/`setValue`. Los emuladores son lentos y los elementos pueden tardar en aparecer.
- **El feed no se refresca solo.** Después de publicar un post, hacer pull-to-refresh con `FeedPage.refrescarFeed()` antes de validar que apareció.
- **Sesión compartida.** Los tests corren en orden y comparten la sesión de la app. Si un test rompe la app (la deja en una pantalla rara), el siguiente puede fallar por arrastre. En esos casos, cerrar el emulador y volverlo a arrancar.
- **Reporte y videos.** Si un test falla, Allure guarda automáticamente un video y un screenshot. Revisarlos antes de tocar el código — muchas veces el fallo es un problema de timing, no un bug real.

---

## 8. Solución de problemas comunes

| Síntoma                                                  | Posible causa                                                  | Cómo arreglar                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `adb` no se reconoce como comando                        | El `Path` no incluye `platform-tools`                          | Volver a la sección 2.3 y verificar                                                           |
| Appium no encuentra el emulador                          | El emulador no está prendido o el ID es otro                   | Correr `adb devices`, ajustar `deviceName` si hace falta                                      |
| El test queda colgado esperando un elemento              | El locator cambió en la última versión de la app               | Abrir Appium Inspector (sección 4) y buscar el nuevo ID                                       |
| El test pasa una vez y después falla siempre             | La app quedó en una pantalla intermedia de la corrida anterior | Cerrar y volver a abrir el emulador                                                           |
| `Cannot find module` al correr `npm install`             | Falta la versión correcta de Node                              | Verificar con `node --version` que coincide con `.nvmrc`. Si no, correr `nvm use`             |
| `No hay ningún .apk en ./apps` al correr los tests       | Falta el APK en la carpeta                                     | Volver a la sección 5.6 y copiar el `.apk` ahí                                                |
| `[zephyr] Faltan ZEPHYR_AUTH_TOKEN o ZEPHYR_PROJECT_KEY` | Las variables de Zephyr no están en el `.env`                  | Configurar las variables de la sección 5.9 — o ignorar el mensaje si no querés subir a Zephyr |
| `[zephyr] No se pudo crear el ciclo (status 401)`        | El `ZEPHYR_AUTH_TOKEN` venció o es inválido                    | Regenerar el token desde Zephyr Essential → "API Access Tokens" y pegar el nuevo en `.env`    |
| `[zephyr] No se pudo crear el ciclo (status 400)`        | `ZEPHYR_FOLDER_ID` apunta a una carpeta que no existe          | Verificar el ID de la carpeta en la URL de Zephyr o dejar la variable vacía para usar la raíz |
