# Casos pendientes de portar de Web a Mobile

> Generado a partir del cruce entre `Intramed.MVP-Web/tests/specs/E2E/` (54 casos / 7 specs)
> y `Mobile/src/specs/E2E/` (43 casos / 5 specs).
>
> **Foco actual: Onboarding e Institution** (Login/Feed/Profile/Campus/Chat cerrados).

## Resumen numérico

_Actualizado 2026-09-11, después de escribir los 5 casos pendientes de Chat._

|                              | Casos  |
| ---------------------------- | ------ |
| Web                          | 54     |
| Mobile                       | 43     |
| **Web a portar (pendiente)** | **14** |

Desglose de los 54 de web:

|                                                                                                   | Casos  |
| ------------------------------------------------------------------------------------------------- | ------ |
| Ya cubiertos en mobile                                                                            | 36     |
| Descartados (`IE-T55`, `IE-T57` web-only + `IE-T148` fuera de POC + `IE-T47` no existe en mobile) | 4      |
| **Pendientes**                                                                                    | **14** |

Los pendientes (Onboarding, Institution):

| Spec                | Faltantes | Condicionales |
| ------------------- | --------- | ------------- |
| Login               | 0         | —             |
| Feed                | 0 ✅      | —             |
| Profile             | 0 ✅      | —             |
| Campus              | 0 ✅      | —             |
| Chat                | 0 ✅      | 1 (`IE-T73`)  |
| Onboarding (nueva)  | 7         | —             |
| Institution (nueva) | 6         | —             |
| **Total**           | **13**    | **1**         |

**Estado real (2026-09-15): la suite de Feed cierra 10/10 con limpieza incluida (ver
abajo). Siguen 3 con código listo bloqueados por el cuelgue de instrumentación
UiAutomator2 (`TC27`/`TC33`/`TC34`/`TC35` Profile — ver Prioridad 2 — y `TC36`/`TC38`
Campus, pendientes de re-verificar), y 13 por escribir. Ojo: el fix de
`SideMenuPage.abrir()` del 15-sep es candidato a explicar parte de esos fallos de
Prioridad 2, porque todos pasan por el menú lateral — vale re-correrlos antes de seguir
culpando a la instrumentación.**

`TC03`/`TC04`/`TC08`/`TC20` **quedaron verdes el 2026-09-14** (dos corridas seguidas,
4/4). No eran el Photo Picker: ver la sección de Prioridad 1, que se reescribió entera
porque el diagnóstico del 07-sep era incorrecto.

**❌ El feed de Inicio es algorítmico: no sirve para ubicar un post propio (2026-09-15).**

Este es el hallazgo que invalida el supuesto sobre el que estaba armada media
suite de Feed. No es que el post "se hunda" por la acumulación de la cuenta: el
feed de Inicio directamente **no garantiza contener tus propios posts**.

Evidencia dura: una corrida publicó 3 posts (`fixture suite`, `fixture largo` y
el de `TC03`) y, minutos después, un barrido de **20 pantallas desde el tope** no
encontró **ninguno** de los tres. Los tres existían — los tres estaban listados en
"Mi actividad reciente" del perfil. Un post recién publicado aparece arriba un
rato (por eso `TC03`/`TC04`/`TC08` pasan) y desaparece apenas el feed se
refresca.

Consecuencia: `POST_ESTABLE` (el post fijo del 07-sep) nunca iba a aguantar, y
**cualquier test que busque un post específico scrolleando el feed es frágil por
construcción**, no por el estado de la cuenta.

La superficie confiable para un post propio es **perfil → "Mi actividad
reciente" → tocar la entrada**, que abre el detalle del post. Ese detalle
renderiza **la misma card que el feed**: misma fila de acciones y mismo menú
"..." (estructura comparada nodo a nodo, idéntica en ambas pantallas).

**Lo que se hizo (2026-09-15):**

- **Borrar un post propio: relevado e implementado.** No está en ningún gesto
  obvio — la fila de acciones no tiene menú, el post no abre detalle al tocarlo
  en el feed y el long-press no hace nada. Está detrás de un clickeable **sin
  `@text` ni `@content-desc`** en el header (`btnMenuPostByText`), que abre un
  bottom sheet "Editar / Eliminar" y un AlertDialog de confirmación cuyos botones
  solo exponen `@text` en mayúsculas (`ELIMINAR` / `CANCELAR`).
  Dumps: `recon/post-menu-propio.xml`, `recon/post-eliminar-confirm.xml`.
- **Precondiciones construidas.** El `before` de la spec de Feed publica sus dos
  fixtures (`POST_SUITE` y el largo para el "Ver más" de `TC09`). Verificado: los
  crea bien. Se confirmó además que el post largo **sí** renderiza "Ver más".
- **Limpieza de la cuenta**, en `src/utils/cleanup.helper.ts`, vía perfil y no vía
  feed. Verificada borrando los 3 posts que habían quedado de una corrida
  fallida: 3/3. Es best-effort (loguea y sigue); en la primera pasada uno falló
  por estado transitorio de la pantalla y salió bien al reintentar.

**Suite Feed al 2026-09-15: 5/10** (contra 2/10 el 14-sep). Verdes:
`TC03`, `TC04`, `TC08`, `TC21`, `TC22`. Rojos, todos por el mismo motivo
("el post no apareció en el feed"): `TC09`, `TC10`, `TC18`, `TC19`, `TC20`.

**✅ DECISIÓN TOMADA (2026-09-15) — cada test publica su post y opera en el acto.**

De las tres opciones sobre la mesa (mover los casos al detalle del post, que cada
test publique el suyo, o relevar si "Círculo" es cronológico) se eligó la
segunda: **mantener la superficie de lista del feed**, que es lo que dice el
título de cada caso, y pagar el costo de publicar un post por test.

Cómo quedó implementado en `E2E_02_Feed.spec.ts`:

- `publicarFixture(texto, prefijoLimpieza?)` publica el post **y lo registra** en
  `postsDeLaCorrida`. Los tests operan sobre él inmediatamente después, mientras
  sigue arriba del feed.
- `TC09`, `TC10`, `TC18`, `TC19` y `TC20` publican cada uno el suyo. `TC20` además
  lo necesita **virgen**: una vez reposteado, ese post deja de abrir el modal de
  Repostear.
- `TC04` y `TC08` siguen usándo el post de `TC03` — corren inmediatamente
  después, dentro de la misma ventana, y ya estaban verdes.
- El `after` borra todo lo registrado vía `eliminarPostsDeLaCorrida`.
- Se eliminó `POST_ESTABLE`, el post fijo del 07-sep.

**Costo asumido y riesgo conocido:** ~15s extra por test, y la validez de la
ventana depende de cuándo se refresque el feed. Si aparece flakiness
intermitente en estos cinco casos, el sospechoso número uno es esa ventana — no
el locator.

**Pendiente menor:** los **reposts** no se borran. `eliminarPostsDeLaCorrida` va
por "Mi actividad reciente", y la entrada del repost sí expone su texto en el
`content-desc` (`"Reposteaste · un día, repost automation mobile ..."`), así que
el camino probablemente sirva tal cual — falta verificar que el detalle de un
repost exponga el mismo menú "...". Hoy `TC20` deja un repost por corrida.

---

## ✅ Suite Feed cerrada en verde (2026-09-15)

**10/10, hook `after` incluido, limpieza 4/4, en 3m23s.** Zephyr `IE-R96`: 7/7.
Es la primera corrida de Feed completamente limpia del proyecto.

Camino hasta acá, porque cada escalón dejó algo aprendido:

| Corrida | Resultado | Qué dejó en claro                                               |
| ------- | --------- | --------------------------------------------------------------- |
| 1       | 5/10      | Cuelgue del publish al 4º post. `TC09`/`TC10` verdes por 1ª vez |
| 2       | 10/10     | Bajar a 4 publicaciones esquivó el cuelgue                      |
| 3       | 6/10      | Ambiente lento + 2 defectos propios                             |
| 4       | 10/10     | Tests verdes, pero la limpieza seguía fallando                  |
| 5 y 6   | —         | **Matadas por el SO por falta de memoria**, sin tests en rojo   |
| 7       | **10/10** | Todo verde, limpieza incluida                                   |

### Los cuatro defectos que hubo que corregir

1. **La memoización del post compartido anulaba el retry de Mocha.**
   `obtenerPostCompartido()` devolvía el mismo post en 0ms aunque el feed hubiera
   dejado de mostrarlo, así que el reintento estaba condenado a fallar igual.
   Ahora verifica que el feed todavía lo muestre y, si no, publica otro.

2. **`SideMenuPage.abrir()` no contenía el scroll del header.** El avatar vive en
   el header, que **no es fijo** — scrollea con el feed — y está anclado por
   `@bounds` porque no tiene accessibility-id. El `after` corre justo cuando el
   feed quedó más abajo de toda la suite, así que el avatar no estaba ni en el
   árbol. Comprobado en el device: con el feed 15 pantallas abajo desaparece, y
   tocando el tab **"Inicio"** vuelve.
   Se resolvió con el tab y **no scrolleando**: es UN gesto en vez de muchos, y el
   flood de `scrollGesture` es el disparador sospechado del cuelgue de la
   instrumentación. (El primer intento — scroll-up con presupuesto de 5 — no
   alcanzaba: cada uno mueve ~450px.)

3. **La limpieza borraba en el orden equivocado.** "Mi actividad reciente" muestra
   solo las **3 entradas más recientes**, y una corrida completa genera 5. Yendo
   del más viejo al más nuevo, los primeros nunca estaban a la vista. Ahora borra
   **del más nuevo al más viejo**: al eliminar el de arriba, el siguiente sube al
   preview. El orden no es cosmético.

4. **`POST_TEXT` se registraba al cargar el módulo**, así que corriendo un
   subconjunto el `after` perdía 15s buscando un post que esa corrida nunca creó.
   Ahora se registra cuando `TC03` lo publica.

### ✅ Los reposts SÍ se pueden borrar (relevado 2026-09-15)

Se había anotado como duda; quedó confirmado en el device. El camino es el mismo
que el de un post: entrada de "Mi actividad reciente" → detalle → menú "..." →
bottom sheet → confirmación. Dos diferencias:

- El sheet del repost trae **solo "Eliminar"** (el del post trae "Editar" y
  "Eliminar"). Mismo `~Eliminar`, misma confirmación `ELIMINAR`/`CANCELAR`.
- **Lo que falta es el locator:** en el detalle de un repost **ningún nodo expone
  el texto en `@content-desc`** (confirmado: 0 nodos), así que
  `btnMenuPostByText()` no matchea. Hay que anclar por el `TextView` del texto y
  navegar por eje, como ya hace `btnGuardarRepostByText`.

Mientras tanto `TC20` deja **un repost por corrida**. Cada uno ocupa de forma
permanente uno de los 3 lugares del preview, así que acumulados van a volver a
romper la limpieza. Los 2 que había se borraron a mano el 15-sep; la cuenta quedó
limpia.

### ⚠️ El cuelgue del publish sigue latente

No se arregló: se esquivó bajando a 4 publicaciones por corrida. Sigue sin
explicación por qué una publicación **no resuelve ni da error ni timeout** (paso 2
del composer, botón en spinner indefinido). Vale la pena decidir si se reporta
como bug de producto. Si reaparece, la palanca que queda es bajar a **3**: `TC20`
corre último y es el único que consume el post, así que podría usar el compartido
en vez de publicar el suyo.

### ⚠️ La máquina, no el código

Dos corridas seguidas murieron por **falta de memoria del SO**, sin ningún test en
rojo. 15 GB totales, el emulador se lleva ~4.6 GB y el resto IDE/Chrome: quedaban
~1.5 GB libres. Además, cada corrida abortada deja **Appium y wdio huérfanos**
(~460 MB) que hay que matar a mano. Si aparecen corridas que mueren sin
explicación, mirar memoria antes que código.

**✅ VERIFICADO (2026-09-15) — `TC03` con el video en la galería: resuelto.**
Al agregar `test-data/media/test-video.mp4` (fixture para `IE-T148`), `TC03` se había
quedado colgado en el paso 1 del composer: sin adjuntar imagen, sin escribir el texto y sin
tocar "Siguiente". **La hipótesis del 14-sep era correcta:** `crearPost()` elige la PRIMERA
miniatura del picker sea lo que sea; el .mp4 le ganaba en fecha a la imagen, el test
adjuntaba el video y el composer dejaba de exponer "Cambiar imagen", que es la señal que
espera el flujo.

El fix que se había aplicado a ciegas quedó confirmado: `prepararGaleria()` empuja solo
imágenes por defecto y borra del device los videos que hayan quedado (ordenar por `touch`
no alcanzaba — precisión de segundos, los dos fixtures caían en el mismo). El video se
empuja solo con `{ incluirVideos: true }`.

Evidencia de la corrida del 15-sep: el device arrancaba con `test-image.jpg` y
`test-video.mp4` **con el mismo timestamp** (17:54 del 14-sep) — el escenario exacto que
dispara el bug. `prepararGaleria()` logó "Galería preparada con 1 fixture(s):
test-image.jpg", el .mp4 desapareció del device y `TC03` pasó (junto con `TC04`, que el
grep arrastró). Ciclo Zephyr `IE-R87`: `IE-T28` Pass, `IE-T29` Pass.

El ambiente también salió de mantenimiento: el login anda sin tocarle nada y la
instrumentación de UiAutomator2 no se colgó en esta corrida.

Sigue pendiente para `IE-T148`: `crearPost()` tiene que elegir el fixture **por nombre** y
no por posición — eso necesita un relevamiento del picker con imagen y video presentes.

Última numeración usada: **TC43**. Los nuevos arrancan en **TC44**.

---

## Casos mobile-only (no portar, ya existen)

Estos no tienen equivalente en web — son propios de la plataforma nativa:
`TC05` gestión de cuenta · `TC06` cerrar sesión · `TC07` sesión persiste al reabrir ·
`TC09` expandir con Ver más · `TC10` share sheet nativo · `TC12` items de Configuración ·
`TC13` acceder a Guardados

---

## Cómo retomar esto en Claude Code

1. Abrí el emulador con la app de IntraMed logueada.
2. Para cada pantalla de la tabla "Dumps necesarios", navegá hasta el estado y corré:
   ```powershell
   .\recon\dump.ps1 <nombre>
   ```
   (o usá mobile-mcp directamente si lo tenés configurado).
3. Con el XML a la vista, agregá los locators a `src/locators/`, los métodos a
   `src/pages/Intramed/`, y los `it()` a la spec correspondiente.

**Sobre correr headless** (`npm run test:android:headless`): evaluado el 2026-09-11, **no
resuelve los problemas de estabilidad del emulador** y hoy directamente no hace nada.

- `wdio.android.headless.conf.ts` solo agrega `appium:avdArgs: '-no-window ...'`, y Appium
  **únicamente honra `avdArgs` cuando es él quien levanta el AVD** (vía `appium:avd`). Con
  el emulador ya abierto —que es como se trabaja acá— la capability se ignora por completo.
- Aunque se lanzara bien, `-no-window` solo saca la ventana: los dos bloqueantes reales de
  este proyecto son el **cuelgue del proceso de instrumentación de UiAutomator2** (timeouts
  de protocolo, ver Prioridad 2). El otro bloqueante histórico (el Photo Picker) resultó ser
  un falso diagnóstico y quedó resuelto el 2026-09-14 — ver Prioridad 1.
  Ninguno de los dos depende del renderizado de la ventana.
- Y tiene costo: todo el flujo de agregar casos es _navegar a mano hasta un estado →
  `dump.ps1` → escribir locators_. Los dumps y los screenshots siguen andando por `adb`,
  pero sin ver la pantalla en vivo llegar al estado que se quiere relevar es mucho más lento.

Lo que sí bajaría la carga sobre la instrumentación, en orden de costo/beneficio:

1. ~~**Wipe Data del AVD + cold boot**~~ — se creía necesario para destrabar el Photo
   Picker; el 2026-09-14 se comprobó que ese diagnóstico era falso. **No hace falta.**
2. **Hacer opt-in la grabación de video** del `beforeTest` de `wdio.shared.conf.ts`: el
   encoder corre en TODOS los tests y se come ~1 core de los 4 del AVD durante la corrida
   entera, aunque el video solo se adjunte cuando el test falla.
3. **Migrar los XPath con `following::`/`contains()` de las rutas más transitadas** a
   accessibility-id / resource-id (sospecha de presión de memoria/GC documentada abajo).
4. **Más RAM/cores al AVD** (hoy: 4 cores / 4 GB).

**Convenciones del repo** (respetarlas):

- Locators: preferir `~accessibility-id` y `@resource-id`. La app es WebView-based.
- Locators dinámicos: funciones que reciben texto, ej.
  `postContainerByText: (texto: string) => \`//android.view.ViewGroup[contains(@content-desc, "${texto}")]\``
- Nomenclatura de tests: `it('TC<n> [<ID-Zephyr>] - descripción en minúscula', ...)`
- La numeración `TC<n>` es correlativa **global** en todo el proyecto, no por spec.
  Último usado: **TC43** (Chat). Los nuevos arrancan en **TC44**.

---

## Ya cubiertos (no tocar)

| Web                               | Mobile equivalente                       |
| --------------------------------- | ---------------------------------------- |
| `IE-T17` login fallido            | `TC01 [IE-T26]`                          |
| `IE-T18` login exitoso            | `TC02 [IE-T27]`                          |
| `IE-T50` abrir comentarios        | `TC08 [FEED-M-003]` (comenta, cubre más) |
| `IE-T21` editar descripción       | `TC11 [PRF-M-002]` Sobre mí              |
| `IE-T61` visualización oferta     | `TC16 [OFA-M-001]`                       |
| `IE-T64` Ver más → detalle        | `TC17 [OFA-M-004]`                       |
| `IE-T69` visualización mensajería | `TC14 [CHT-M-001]`                       |
| `IE-T76` buscador filtra          | `TC15 [CHT-M-008]`                       |

---

## PRIORIDAD 1 — `E2E_02_Feed.spec.ts` (2026-09-07)

| Web ID    | Caso                                           | Estado                                                                                         |
| --------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `IE-T48`  | Abrir modal Repostear                          | ✅ `TC18` — validado 2x contra el emulador                                                     |
| `IE-T58`  | Validación mínimo 50 caracteres en repost      | ✅ `TC19` — validado 2x contra el emulador                                                     |
| `IE-T49`  | Guardar y desguardar publicación desde el feed | ✅ `TC20` (repostea y guarda/desguarda el repost) — código validado, ver nota de bloqueo abajo |
| `IE-T52`  | Aplicar y limpiar filtros del feed             | ✅ `TC21` (filtro "Personas") — validado 2x contra el emulador                                 |
| `IE-T54`  | Filtro Encuestas navega correctamente          | ✅ `TC22` — validado 2x contra el emulador                                                     |
| `IE-T148` | Publicar publicación con video                 | 🚫 **Fuera de alcance de la POC**, ver nota abajo                                              |

**Ampliaciones de casos existentes:**

- `IE-T60` — ✅ `TC04` ahora da like, valida el contador +1, quita el like y valida que vuelve al original. **Verde desde 2026-09-14.**
- `IE-T19` — ✅ `TC03` ahora agrega un emoji (💪) al `POST_TEXT`, cubre toda la cadena TC03/04/08. **Verde desde 2026-09-14.**

**Descartados (web-only):** `IE-T55` (módulos columna derecha), `IE-T57` (card de perfil del sidebar).

**✅ RESUELTO 2026-09-14 — `TC03`/`TC04`/`TC08`/`TC20` verdes.**

**El diagnóstico del 07-sep era incorrecto: el Photo Picker nunca estuvo roto.** Lo que se
leyó como "miniatura cacheada y corrupta" era real, pero la causa no era el picker: el
`beforeTest` de `wdio.shared.conf.ts` graba la pantalla en TODOS los tests y Appium
escribe esos .mp4 en la raíz de /sdcard con nombre aleatorio. MediaStore los indexa y el
picker los ofrece como si fueran fotos. La miniatura "corrupta" (`454d19c6.mp4`) era una
grabación de nuestra propia suite, y `imgGaleriaItem` agarra siempre la PRIMERA miniatura.
**El "Wipe Data del AVD" que quedó pendiente del 07-sep no hacía falta en ningún momento.**

Solución aplicada — los fixtures ya no dependen del estado del emulador:

- `test-data/media/` guarda las imágenes versionadas en el repo.
- `src/utils/media.helper.ts` → `prepararGaleria()` corre en `onPrepare`: borra las
  grabaciones huérfanas (`/sdcard/<8-hex>.mp4`), empuja los fixtures a
  `/sdcard/Pictures/IntramedQA`, les hace `touch` (el picker ordena por fecha del archivo,
  no del push) y dispara `MEDIA_SCANNER_SCAN_FILE`. `limpiarGrabacionesHuerfanas()` corre
  además en `onComplete`. Todo best-effort: si adb falla, avisa y no tumba la corrida.
- **Ojo:** con más de un fixture en la carpeta, el picker ofrece el último tocado. Si hace
  falta determinismo, elegir por nombre en vez de "la primera miniatura".
- **Pendiente recomendado:** hacer opt-in la grabación de video (mitigación #2 más
  arriba). La limpieza tapa el síntoma; eso elimina la causa y libera ~1 core del AVD.

Las causas reales de `TC03`, todas del APK del 2026-09-06, encadenadas:

1. El botón del composer se renombró de "Seleccionar imagen" a **"Seleccionar imagen o
   video"**. `btnSeleccionarImagen` y `btnCambiarImagen` ahora anclan por prefijo
   (`starts-with`) para no romperse si la etiqueta vuelve a crecer.
2. La sección creció (línea extra de ayuda + preview de lo seleccionado), así que
   **"Cambiar imagen" nace debajo del pliegue**: esperarlo sin scrollear timeoutea con el
   elemento ya en el árbol pero no `displayed`.
3. La franja que usa `scrollDown()` (top 800, alto 600) **cae sobre el editor de
   Descripción**, le da foco y abre el teclado, que vuelve a tapar la sección de imagen.
4. El teclado abierto tras escribir **se come el tap en "Siguiente"** — se manifestaba
   como "`~Publicar` no aparece", con el composer todavía en el paso 1.
5. La pantalla de recorte ("CORTAR") aparece con **timing variable**; los 4s fijos de
   espera a veces se la perdían y el flujo seguía scrolleando dentro del recorte.

Los cinco se resolvieron en `crearPost()` + `volverAlComposerConImagen()`, que reemplaza
las esperas fijas por un `waitUntil` que tolera orden y timing.

**`TC08` — el input del modal de comentarios pierde el foco.** `setValue` hace
`clearValue` primero y eso deja el campo con `focused="false"`; el botón de enviar solo se
renderiza con el input enfocado, así que `~comentario` **no existía en el árbol** (no era
un rename). Se toca el input antes y después de escribir.

**`TC20` — `asegurarSesionEnFeed` no detectaba un bottom sheet abierto.** `TC08` deja
abierto el sheet de comentarios. A diferencia de una pantalla empujada, un bottom sheet
**no agrega `~Go back` y deja `~Crear` visible**, con el feed entero todavía en el árbol
detrás — así que `enFeedRaiz()` devolvía `true`, `esperarPostVisible` encontraba el post
(tapado) y el tap en "Repostear" (y≈1058-1147, justo bajo el borde del sheet) aterrizaba
en el sheet, abriendo comentarios. `leerPantalla()` ahora detecta
`content-desc="Bottom Sheet"` y el loop de recuperación lo cierra por el backdrop.

**Diagnóstico más rápido:** `afterTest` ahora adjunta a Allure el **árbol de accesibilidad**
cuando un test falla. Sin eso, cada locator que deja de matchear exige reproducir el estado
a mano y volver a correr; con eso, en una sola corrida se descartó que `~comentario` fuera
un rename y se identificó el bottom sheet de `TC20`.

**`IE-T148` (publicar con video) — REVISAR EL SCOPE.** Se había descartado porque el
composer declaraba "Imagen — PNG, JPG, hasta 2MB." y el picker filtraba `image/*`. El APK
del 2026-09-06 declara textual **"PNG, JPG, hasta 2MB y Videos (MP4), hasta 50MB."**: la
app ya lo soporta. Decisión de producto pendiente con Tincho. Si entra, el .mp4 va en
`test-data/media/` y `prepararGaleria()` lo empuja sin tocar código.

**Hallazgos de la implementación (útiles para Prioridad 2 en adelante):**

- Los posts **propios** (con texto plano) exponen su contenido en `@content-desc` del
  contenedor → se pueden ubicar con `postContainerByText`. Los posts de tipo **repost**
  NO exponen texto en `@content-desc` (el contenedor lo deja vacío) → hay que ubicarlos
  por el `TextView` exacto del texto reposteado y navegar con eje `following::`
  (ver `btnGuardarRepostByText` en `feed.locators.ts`).
- El botón "Guardar" (bookmark) solo aparece en posts de tipo **repost**; los posts propios
  de texto plano no lo muestran (muestran like/comentario/repostear/compartir en su lugar).
- Los chips de filtro del modal ("Personas", "Encuestas", etc.) no reflejan su estado
  seleccionado en el árbol de accesibilidad (`selected` queda en `false` aunque se vea
  resaltado visualmente). La validación confiable es el **chip de filtro activo** que
  aparece arriba del feed tras tocar "Aplicar filtros" (con su botón "Limpiar" al lado),
  que sí es un elemento real con `content-desc` propio.
- El ícono de filtros (embudo, arriba a la derecha) no tiene `content-desc` — el locator
  `btnFiltro` es por `bounds` fijos, mismo tipo de deuda técnica que `btnPerfil` (ver
  sección "Deuda técnica detectada" al final de este archivo). Además el header **no es
  fijo**: scrollea junto con el feed, así que `abrirFiltros()` primero hace scroll-up
  hasta que el ícono aparece (si un test anterior dejó el feed scrolleado, si no se hace
  esto el filtro "desaparece" de la pantalla).
- **Ojo con la posición XPath vs. el atributo `@index` del dump de uiautomator**: son
  cosas distintas. `@index` es el índice crudo entre TODOS los hijos (de cualquier clase)
  tal como lo vuelca uiautomator; la posición entre corchetes de un locator XPath
  (`ViewGroup[N]`) cuenta solo entre HERMANOS DE LA MISMA CLASE, renumerados desde 1.
  Para un post propio, los hijos `ViewGroup` reales son (en este orden): like, contador
  de likes, comentar, repostear, contador de reposts, compartir — por eso
  `btnReaccionarPostByText` usa `[1]`, `btnComentarPostByText` usa `[3]`,
  `btnRepostearPostByText` usa `[4]` y `contadorLikesPostByText` usa `[2]`. Confundir
  ambos esquemas hace que un tap "funcione" (no tira error) pero termine tocando OTRO
  ícono — pasó hoy con Repostear vs. Compartir.
- **El repost icon queda inerte una vez que ESE post ya fue reposteado** (al menos por el
  mismo usuario): tocar "Repostear" en un post con contador de reposts ≥ 1 no abre el
  modal ni cambia el contador — no tira error, simplemente no pasa nada. Por eso
  `TC18`/`TC19` (que abren el modal pero NO llegan a repostear) usan un post fijo
  (`POST_ESTABLE`, actualmente `"Post automatizado 1786559253287💪"`) que hay que
  mantener virgen — **nunca usarlo para completar un repost real**. `TC20` (que sí
  completa el repost) por eso apunta al post fresco de `TC03` (`POST_TEXT`) y no a
  `POST_ESTABLE`: si usara un post fijo, la primera corrida lo "gastaría" para siempre.
- `esperarPostVisible` dejó de usar `UiScrollable(...).scrollIntoView(...)`: ese scroll
  "de un salto" confunde el tracking de posición de la lista de React Native y termina
  reseteándola al tope unos segundos después (el post se pierde de nuevo). Ahora hace
  swipes incrementales (`scrollDown()`) como un dedo real, y además exige que el post
  quede con **~350px de margen debajo** (no alcanza con que un solo píxel del texto sea
  técnicamente "visible" — la fila de like/comentar/repostear/compartir vive bien debajo
  del texto dentro de la card, y si solo se scrollea hasta el borde justo del texto esa
  fila queda fuera de pantalla).
- El picker de imágenes ahora puede mostrar una pantalla de **confirmar recorte**
  ("CORTAR") entre elegir la foto y volver al formulario. `crearPost()` ya la detecta
  (`btnCortarImagen`, por `resource-id="...:id/crop_image_menu_crop"`, estable) y la
  confirma si aparece, sin romper el flujo cuando no aparece.

---

## Profile — sesión del 2026-09-16

Se corrió la suite de Profile (16 casos). Arrancó en **9/16**. Lo que sigue son
causas **verificadas con capturas**, no hipótesis.

### Hallazgo transversal: los árboles de accesibilidad de Allure no son confiables

Varios fallos adjuntan un árbol con **cero nodos con texto** mientras la captura
de la misma pantalla muestra todo renderizado perfectamente. Diagnosticar por el
árbol adjunto lleva a conclusiones falsas: **usar las capturas**.

### Arreglado y verificado

- **`TC24`** — la app renderiza "Sobre **mí**" CON tilde; `seccionSobreMi` buscaba
  `"Sobre mi"` sin tilde. La navegación siempre había funcionado.
- **`TC25`** — tres causas encadenadas, todas reales:
  1. **Pasarse de scroll virtualiza la tarjeta** de información profesional. El
     perfil es un árbol PLANO (título y botón son hermanos, no hay contenedor de
     tarjeta al que acotar), así que con la tarjeta fuera del render
     `following::Button[1]` resuelve al OTRO "Comenzar" de la pantalla — el que
     abre "Crear publicación". El test terminaba en el composer. **Subir el
     presupuesto de scroll de 5 a 10 lo empeoró.** La solución es scrollear hasta
     el **título** de la tarjeta (`tituloInfoProfesional`), no hasta el botón.
  2. **El tap se lo comía el momentum**: `mobile: scrollGesture` vuelve apenas
     lanza el fling. Nuevo `BasePage.tapCuandoQuieto()`: espera a que la posición
     del elemento se estabilice antes de tocar.
  3. **El botón quedaba tapado por el bottom nav**: UiAutomator2 lo da por
     `displayed` porque asoma, pero su centro —donde cae el tap— está debajo de
     la barra. Se lo termina de subir con `scrollDownSmall()` comparando contra
     `ALTO_BOTTOM_NAV`.
- **`asegurarSesionEnFeed()` no podía cerrar bottom sheets altos.** Cerraba con
  `$('~Bottom sheet backdrop').click()`; ese nodo ocupa la pantalla entera, así
  que el click va al centro. Con el sheet de comentarios —bajito— el centro cae
  en la zona atenuada y funciona; con el de "Agregar una sección", que arranca en
  **y≈431 sobre 1920**, cae DENTRO del sheet y no cierra nunca. Se agotaban los 8
  reintentos y **todo lo posterior moría** con "No se encontró ni el feed ni la
  pantalla de login". Apareció recién cuando `TC25` empezó a pasar y dejó su
  sheet abierto: se llevó puestos a `TC26`..`TC35`. Ahora se calcula el borde
  superior real del sheet y se toca por encima.
- **`TC26`** — mismo problema de momentum. Además `abrirVerMasActividad()` ahora
  confirma que llegó (espera el chip "Todas"), en vez de dejar que el test falle
  en su primer filtro aparentando un problema de chips.

### Corrección a un diagnóstico previo

`TC13` **no** está roto por un título inexistente. Se dijo eso leyendo una
captura donde el header mostraba solo el logo; en una corrida posterior **pasó**,
con el título "Guardados" tardando ~14s en aparecer. Es lentitud de carga.

### Sin medición final

El número real de la suite tras estos arreglos **quedó sin medir**. Las dos
últimas corridas no sirven: una fue cascada desde `TC26` (antes del fix del
sheet) y la otra corrió con la máquina ahogada —pasos de 38s y 58s donde toman
3-10s— hasta que el **OOM killer se llevó el emulador**. Al retomar: liberar
memoria, levantar el AVD y correr `npm run test:android:profile`.

### Pendiente, sin diagnosticar

`TC33`/`TC34`/`TC35` (Educación). Todos caían por cascada del sheet abierto, así
que **su estado real se desconoce** — hay que volver a medirlos ahora que el
sheet se cierra bien. `TC34` depende además de que la cuenta NO tenga secciones
profesionales cargadas (usa el CTA de la tarjeta vacía): si `TC33` agrega una
educación y `TC35` no llega a borrarla, `TC34` queda sin precondición.

### Ojo con los fines de línea

`src/utils/session.helper.ts` usa **LF**; la mayoría de los `.ts` del repo usan
**CRLF**. Editar con el salto equivocado hace que no matcheen los reemplazos.

---

## PRIORIDAD 2 — `E2E_03_Profile.spec.ts` (2026-09-07)

| Web ID   | Caso                                                   | Estado                                                                         |
| -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `IE-T30` | Gestión de cuenta / validar botón eliminar (`TC05`)    | ✅ validado                                                                    |
| `IE-T20` | Navegar al perfil del usuario desde el feed (`TC24`)   | ✅ validado                                                                    |
| `IE-T39` | Abrir modal Agregar sección (`TC25`)                   | ✅ validado                                                                    |
| `IE-T40` | Ver más actividad y filtrar (`TC26`)                   | ✅ validado                                                                    |
| `IE-T45` | Cancelar edición de Sobre mí no persiste (`TC23`)      | ✅ validado                                                                    |
| `IE-T42` | Toggle switch Newsletter y persistir (`TC28`)          | ✅ validado                                                                    |
| `IE-T43` | Toggle switch Notificaciones y persistir (`TC29`)      | ✅ validado                                                                    |
| `IE-T46` | Datos profesionales con Guardar deshabilitado (`TC30`) | ✅ validado                                                                    |
| `IE-T22` | Error al ingresar letras en teléfono (`TC31`)          | ✅ validado                                                                    |
| `IE-T41` | Editar datos personales desde configuración (`TC27`)   | ✅ funcionalidad validada (falla solo el housekeeping final — infra, ver nota) |
| `IE-T24` | Agregar educación (`TC33`)                             | ⚠️ código avanzado y probablemente correcto, sin corrida limpia — ver nota     |
| `IE-T44` | Validaciones del modal Agregar educación (`TC34`)      | ⚠️ mismo bloqueo de infraestructura que `TC33`                                 |
| `IE-T25` | Eliminar educación (`TC35`)                            | ⚠️ mismo bloqueo de infraestructura que `TC33`/`TC34`                          |

`IE-T47` (ordenar secciones del perfil): **confirmado que no existe** — el perfil solo
tiene la sección "Instituciones" (educación) más la tarjeta vacía de "información
profesional"; no hay ningún control de reordenar. No se va a escribir test para esto.

**⚠️ `TC27`/`TC33`/`TC34`/`TC35` — causa raíz identificada (2026-09-08), no es un bug
de código: se cuelga el proceso de instrumentación de UiAutomator2.**

Sesión 2026-09-07 había dejado estos 4 marcados como "código correcto, pendiente de
re-verificar". Se re-verificó en una sesión fresca (emulador recién reiniciado,
`uptime` de minutos, `load average` bajo) y **se encontraron y arreglaron 4 bugs reales
más**, todos confirmados con evidencia (screenshot/dump) antes de tocar código:

1. **La cuenta de prueba había quedado en portugués** (probablemente por tocar sin
   querer el selector de idioma durante una exploración manual anterior). Con la app en
   PT, `FeedPage.btnCrear` (`~Crear`) nunca matcheaba `~Criar`, rompiendo toda detección
   de "estamos en el Feed". Se volvió a cambiar a español desde la UI. **Esto no es un
   bug de test — pero si vuelve a pasar, revisar el idioma de la cuenta antes que nada.**
2. **`btnAvatarHeader` volvió a romperse** — el fix del 2026-09-07 (`//android.widget.Button`
   a secas, asumiendo que es el único `Button` de la raíz del Feed) resultó falso: un
   post institucional con "Seguir", o cualquier post con imagen/video, también renderiza
   como `Button` y puede aparecer antes que el avatar en el árbol. Se volvió a anclar por
   `@bounds` (ver "Deuda técnica" abajo).
3. **Flood de `scrollGesture`**: el paso "Validar que se guardó correctamente" de `TC27`
   llamaba `scrollHastaTelefono()` (hasta 12 scrolls) **dentro** de un `waitUntil` con
   intervalo de 300ms — si el campo nunca quedaba visible, esto disparaba cientos de
   gestos por segundo. Coincide en tiempo con los crashes de instrumentación vistos ese
   día. Se sacó el scroll de dentro del polling.
4. **`seleccionarDeLista()` (Educación) no esperaba el dropdown** antes de tocarlo —
   Provincia/Ciudad recién se habilitan después de elegir País/Provincia, y tocar antes
   de tiempo fallaba con "element wasn't found". Se agregó `waitForElement` previo.

Con los 4 fixes: **`TC27` pasa limpio hasta "Validar que se guardó correctamente"
inclusive, de forma consistente y repetida (múltiples corridas en verde)** — el
comportamiento funcional que el caso de prueba realmente certifica (se puede actualizar
el teléfono y persiste) quedó demostrado. El paso final, **"Restaurar el teléfono
original"** (housekeeping, no valida nada), sigue fallando de forma intermitente — pero
el error real esta vez fue `Timeout` en `@wdio/utils/build/index.js:1115`, un timeout de
**protocolo** de WebdriverIO (el servidor Appium/UiAutomator2 deja de responder a nivel
de comunicación), no un "elemento no encontrado". Confirmado que **ningún `try/catch` en
el código del test puede repararlo de forma confiable** — cuando el proceso de
instrumentación se cuelga a mitad de un comando, a veces ni siquiera el intento de
recuperación alcanza a ejecutarse antes de que también cuelgue. El patrón que lo dispara:
este único test recorre el camino avatar → menú lateral → Configuración → Cuenta →
Datos personales **tres veces seguidas** (inicio, validar, restaurar) — sospecha fuerte
de que XPaths complejos (`following::`, `contains()`) repetidos muchas veces en la misma
sesión de Appium presionan memoria/GC del proceso de instrumentación hasta colgarlo.

Se dejó `TC27.Restaurar` con try/catch de 2 intentos + `console.warn` (no revienta el
test si falla, y avisa por consola que el teléfono quedó con el valor de prueba en vez
del original) — mitiga el síntoma pero no la causa. **Esto ya no es responsabilidad del
código de test: es una decisión de infraestructura.** Opciones a evaluar con el equipo,
no aplicadas acá:

- Configurar Appium/UiAutomator2 para reiniciar el servidor de instrumentación entre
  tests (`resetServer` / relanzar sesión) en vez de reusarlo por spec completo.
- Aumentar `newCommandTimeout` en las capabilities.
- Reducir el uso de XPaths con `following::`/`contains()` en las rutas más transitadas
  (`SideMenuPage.abrir()`, `irADatosPersonales()`) a favor de accessibility-id donde sea
  posible — mitigaría la presión de memoria sospechada, aunque no hay accessibility-id
  disponible para el avatar (ver deuda técnica).

`TC33`/`TC34`/`TC35` (Educación) no llegaron a cerrar una corrida limpia en esta sesión
tampoco — **y no es solo por arrastre de `TC27`**: se probó corriendo `TC(33|34|35)`
completamente aislado de `TC27` y **el primer fallo de la corrida también degrada todo
lo que sigue** (mismo patrón: el test que falla primero deja algo colgado que hace que
`SideMenuPage.irAVerPerfil()` de los tests siguientes falle con el mismo timeout de
protocolo). Esto amplía la sospecha de infraestructura de arriba: no es específico de
`TC27`, es cualquier navegación de avatar repetida muchas veces en la misma sesión de
Appium.

En esa misma corrida aislada se encontró y arregló un **5º bug real**: en
`seleccionarDeLista()`, el dropdown de Provincia (que se puebla recién después de elegir
País, probablemente con una llamada de red) no siempre queda listo dentro de los 10s que
se le daba — se subió a 15s. Con este fix, `TC33` avanzó más lejos que nunca (abrió el
formulario, lo completó hasta tocar Provincia) antes de toparse con la degradación de
infraestructura de arriba en un test subsiguiente — es decir, **su código también avanzó
y probablemente esté correcto**, pero no se pudo confirmar una corrida 100% limpia por
la misma causa de infraestructura. Recomendación: correr uno a la vez, no todos juntos,
hasta que se resuelva el punto de infraestructura de arriba:

```powershell
npm run test:android:profile -- --mochaOpts.grep "TC(33|34|35) "
```

**Hallazgos de la implementación (útiles para lo que sigue):**

- **El bottom tab bar del Feed (`~Crear`) persiste en pantallas empujadas dentro del
  mismo stack** (ej. "Ver Perfil"). `asegurarSesionEnFeed()` originalmente asumía que ver
  `~Crear` alcanzaba para confirmar "estamos en el Feed" — falso: hay que chequear
  además que **no** haya un botón `~Go back` visible (la raíz del Feed nunca lo muestra,
  cualquier pantalla empujada sí). Ver `session.helper.ts`.
- **`btnAvatarHeader` (para abrir el menú lateral) estaba con `@bounds` fijos** — además
  de ser frágil por definición (deuda técnica ya documentada más abajo para `btnPerfil`),
  en la práctica alcanza con `//android.widget.Button` porque es el único `Button` en la
  raíz del Feed. Pero **ese locator NO es seguro en ninguna otra pantalla**: Profile,
  Datos personales, etc. tienen sus propios `Button` (lápiz de "Editar sobre mí",
  dropdowns, "Go back") y `SideMenuPage.abrir()` termina tocando cualquiera de ellos si
  se lo llama fuera de la raíz del Feed. Es la causa de fondo de varias fallas en cascada
  de esta sesión (`"~Cerrar sesión" still not displayed"` después de otro test fallido).
  **Regla de oro: nunca llamar `SideMenuPage.abrir()` (ni nada que dependa de él) salvo
  parado en la raíz del Feed.**
- **El CTA "Comenzar"** (tarjeta vacía de "información profesional", debajo de
  "Instituciones") abre el mismo modal "Agregar una sección" que en Web dispara un botón
  dedicado — Mobile no tiene un botón "Agregar sección" propio. Ojo: **"Comenzar" no es
  accessibility-id único en la pantalla** — más abajo del todo hay otro botón con la
  misma etiqueta que abre "Crear publicación" (nudge de primer post). Hay que anclar el
  locator por el texto único de la tarjeta ("Aún no cargaste tu información
  profesional"), no por `~Comenzar` a secas.
- **"Instituciones" en el perfil NO es Educación** — es la lista de instituciones que el
  usuario sigue; tocar una entrada abre la página pública de esa institución (con
  seguidores, "Compartir", etc.), no un formulario de edición. La sección de Educación
  real se agrega/edita a través del modal "Agregar una sección" → "Educación".
- **El formulario "Agregar educación"** tiene su heading en minúscula ("Agregar
  educación" / "Editar educación", no "Educación" con mayúscula). Los campos País,
  Provincia, Ciudad, Fecha y el checkbox quedan tapados por el teclado y por el footer
  fijo "Agregar" — hace falta `hideKeyboard()` + scroll antes de tocarlos.
- **El campo "Teléfono" de Datos personales está mucho más abajo de lo que parece**:
  Trato/Nombre/Apellido/Tipo de doc./Número/Género/Fecha de nacimiento/Idioma/País/
  Provincia/Ciudad vienen todos antes. Un solo `scrollDown()` no alcanza; hace falta
  scroll grande + fino (`scrollHastaTelefono()` en `ProfilePage-Intramed.ts`).
- **`irADatosPersonales()` tiene que ser idempotente**: `actualizarTelefono()` lo llama
  de nuevo para volver después de guardar (para restaurar el valor original), y ese
  segundo llamado puede ejecutarse ya parado en Datos personales (scrolleado hasta
  Teléfono, con lo cual el heading "Datos personales" no es visible) o en "Cuenta". El
  chequeo de "ya estoy acá" tiene que contemplar ambos casos.
- El mensaje de error real del campo Teléfono es **"Solo se permiten números, guiones,
  paréntesis y espacios"** — no contiene "inválido"/"Invalid" como se había asumido.
- Los filtros reales de "Ver más actividad" son **Todas / Publicaciones / Reposteos /
  Comentarios** — "Guardados"/"Reacciones" no existen ahí (asunción incorrecta copiada
  del set de Web).

---

## Dumps necesarios

Feed: ✅ ya relevados, quedan en `recon/*.xml` y `recon/*.png` (ej. `feed-filtros`,
`feed-modal-repostear`, `post-repost-final`, `selector-galeria-con-video`, etc.).
No hacía falta un menú "…" separado: Repostear y Guardar son íconos directos en la fila
de acciones del post (ver hallazgos arriba).

Profile: ✅ ya relevados (ver hallazgos en la sección de Prioridad 2 arriba).

---

## Backlog (después de Feed y Profile)

### `E2E_04_Chat.spec.ts` — ✅ 0 faltantes (2026-09-11)

| Web ID   | Caso                                              | Estado                 |
| -------- | ------------------------------------------------- | ---------------------- |
| `IE-T70` | Enviar mensaje en conversación existente (`TC39`) | ✅ verde — validado 3x |
| `IE-T71` | Abrir panel Nuevo mensaje (`TC40`)                | ✅ verde — validado 3x |
| `IE-T72` | Tab "No leídas" (`TC41`)                          | ✅ verde — validado 3x |
| `IE-T75` | Tab "Solicitudes" (`TC42`)                        | ✅ verde — validado 3x |
| `IE-T74` | Pill de Mensajes en navbar (`TC43`)               | ✅ verde — validado 3x |

**A decidir:** `IE-T73` (recepción entre usuarios). En web usa 2 contextos de browser.
En Appium requiere 2 devices o crear el segundo usuario por API. Definir si entra al MVP.

**Bugs encontrados en los locators preexistentes de `TC14`/`TC15`** (los dos estaban
marcados como "ya cubiertos" pero apuntaban a nodos que no existen en la app actual —
arreglados en esta sesión):

1. `tabMensajes: '~Mensajes'` — el tab de la navbar **prefija la cantidad de no leídos en
   el `content-desc`** (`"32, Mensajes"`), así que el accessibility-id exacto no matchea
   apenas hay un mensaje sin leer. Ahora se contemplan las dos formas.
2. `listaConversaciones: '//androidx.recyclerview.widget.RecyclerView'` — **la app no usa
   ningún RecyclerView**. La lista es un `android.widget.ScrollView`. El match por clase
   exacta no colisiona con el `HorizontalScrollView` de la fila de tabs.
3. `emptyStateSinResultados: contains(@text, "No hay conversaciones")` — el texto real es
   **"No se encontraron resultados"**.

**Hallazgos del relevamiento Chat:**

- **El composer de la conversación expone `resource-id` propios** — algo raro en esta app
  (WebView-based, casi todo sin id): `auto-complete-text-input` (input), `send-button`,
  `attach-button`, `commands-button`. Usar siempre estos antes que XPath posicional.
- **`send-button` arranca `enabled="false"`** y solo se habilita con texto cargado. Sirve
  como señal de "el mensaje se envió y el composer se limpió" (vuelve a deshabilitarse),
  y evita tocar a ciegas.
- **No todas las conversaciones tienen composer**: si el otro usuario todavía no aceptó,
  la conversación se abre con el aviso _"Tienes que recibir la aprobación del usuario para
  poder seguir enviando mensajes."_ **en lugar** del input. En la cuenta de prueba están
  en ese estado `Dr. Chat Test`, `Dr. Etstchat Chat` y `Farm. Testguardados Guardado`
  (se reconocen en la lista porque su último mensaje arranca con `"Tú: "`).
  **Precondición de `TC39`: usar una conversación aceptada** — hoy `Ing. matias seeber`.
- **Los tabs Todas / No leídas / Solicitudes no reflejan su estado en el árbol** —
  `selected` queda en `false` en los tres, igual que los chips de filtro del Feed. La
  única señal confiable de qué tab está activo es el contenido de la lista.
- **`Solicitudes` lleva su contador en la propia label** (`"Solicitudes (0)"`), así que el
  locator tiene que ser por `contains`, y el contador se puede parsear de ahí para
  validar la cantidad de filas sin hardcodear datos.
- **Dos empty states distintos**, no confundirlos: la lista de conversaciones muestra
  _"No se encontraron resultados"_; el buscador de usuarios del panel "Nuevo" muestra
  _"No hay usuarios que coincidan con tu búsqueda."_
- El panel **"Nuevo"** es una pantalla empujada (`~Go back`), no un modal. Exige 3+
  caracteres: hasta entonces muestra _"Escribe al menos 3 caracteres para comenzar a
  buscar usuarios."_ Los resultados llegan con `content-desc` `"<nombre>, <especialidad>"`
  (la especialidad puede faltar).
- **La fila de la lista tarda unos segundos en reflejar el mensaje recién enviado**: al
  volver de la conversación queda con el `content-desc` viejo hasta que llega el refresh
  del backend. Leerlo de una sola vez hace flakear el test (pasó en la 2ª corrida de
  validación) — hay que poletear (`esperarUltimoMensajeEnLista`).
- El contador de la pill de la navbar cuenta **mensajes, no conversaciones**: no se puede
  igualar contra la cantidad de filas de "No leídas", solo correlacionar "hay / no hay".

### `E2E_05_Campus.spec.ts` — ✅ 0 faltantes (2026-09-11)

| Web ID   | Caso                                            | Estado                                            |
| -------- | ----------------------------------------------- | ------------------------------------------------- |
| `IE-T63` | Curso inscripto con badge + botón (`TC37`)      | ✅ verde                                          |
| `IE-T62` | Carrusel Recomendados avanza con swipe (`TC36`) | ⚠️ código listo — infra (cuelgue instrumentación) |
| `IE-T66` | Explorar catálogo abre el listado (`TC38`)      | ⚠️ código listo — infra (cuelgue instrumentación) |

**Hallazgos del relevamiento Campus (útiles para el resto del backlog):**

- El tab Campus tiene 3 carruseles horizontales: **Mis inscripciones**,
  **Recomendados para vos**, **Más formaciones disponibles**. Cada card muestra
  el mismo botón `~Ver curso` — **no hay un botón "Ir al aula" distinto** para
  cursos inscriptos (a diferencia de la web). TC37 valida presencia de badge
  `INSCRIPTO` + presencia del botón `~Ver curso`, no un botón dedicado.
- **La sección "Recomendados para vos" nace debajo del pliegue**: al abrir el
  tab por primera vez su heading queda a Y~1650 (pantalla es 1920), tapado por
  el bottom tab bar. Los cards del carrusel están fuera del viewport. Para
  interactuar hay que scrollear primero hasta que "Más formaciones disponibles"
  asome — ahí Recomendados queda en el medio y sus cards son visibles.
  `CampusPage.scrollHastaCarruselRecomendados()` hace esto.
- **`titulosEnRecomendados()` extrae del `getPageSource()`** (un solo request
  al server) los `text=` visibles entre los headings de Recomendados y Más
  formaciones. Diseño explícito para minimizar comandos a UiAutomator2 (que
  colapsa con cargas altas — ver deuda técnica al final).
- **Pantalla del catálogo** (tras `~Explorar catálogo`): mantiene el header
  "Explorar toda la Oferta" (mismo texto que el banner del tab), pero se
  distingue por (a) tener `~Go back` en el header (no `~Navigate up`), (b)
  ausencia de las secciones internas del tab (Mis inscripciones, Recomendados,
  Más formaciones), (c) lista vertical de cards con `content-desc` en formato
  `<autor>. <título>.`. TC38 valida (a)+(b)+(c) para no depender del texto del
  header que es idéntico.
- **`~Go back`** es un accessibility-id nativo de React Native (no un
  `Navigate up` estándar) — se usa en el catálogo y probablemente en otras
  vistas empujadas. Ya está en `campus.locators.ts:btnGoBack`.
- **Precondición TC37**: la cuenta de prueba tiene al menos un curso inscripto
  ("curso de prueba german", "Curso de Bienvenida"). Si en el futuro se
  desmatriculan todos, TC37 va a fallar hasta reinscribir uno.

### `E2E_06_Onboarding.spec.ts` — spec inexistente, 6 casos

`IE-T31` registro → Completar mi perfil · `IE-T32` registro → Omitir ·
`IE-T33` email ya registrado · `IE-T34` email con formato inválido ·
`IE-T35` código de verificación incorrecto · `IE-T36` campos obligatorios por paso

Ya existe `src/utils/otp.helper.ts`. Falta definir si la baja de cuentas de prueba
(`ONB-007` en web) se hace por webview o por API.

**Bloqueante:** no hay locators ni page object de Onboarding. Relevar pantallas primero.

### `E2E_07_Institution.spec.ts` — spec inexistente, 6 casos

`IE-T142` alta de institución · `IE-T143` imagen de portada · `IE-T144` gestión de permisos ·
`IE-T145` publicar a nombre de institución · `IE-T146` seguir institución sugerida ·
`IE-T147` seguir a un usuario desde su perfil

**Bloqueante:** confirmar que Instituciones existe en la app mobile. No hay locators ni page object.

---

## Deuda técnica detectada

- `src/locators/feed.locators.ts` → `btnPerfil` usa
  `//android.widget.Button[@bounds="[46,116][161,231]"]`.
  Locator por coordenadas: se rompe con cualquier cambio de resolución o densidad
  del emulador. Reemplazar por accessibility-id o resource-id.
- `src/locators/feed.locators.ts` → `btnFiltro` (ícono de embudo del feed) también es
  por `bounds` fijos (`[976,145][1034,203]`) porque el ícono no tiene `content-desc`.
  Mismo riesgo que `btnPerfil`. Si a futuro el ícono gana un accessibility-id, migrar.
- `src/locators/feed.locators.ts` → `btnGuardarRepostByText` navega con eje XPath
  `following::android.view.ViewGroup[9]` a partir del texto del repost, porque el
  contenedor del post no expone `content-desc`. Es frágil ante cambios de layout del
  card de repost (cualquier ViewGroup nuevo entre el texto y el botón "Guardar"
  corre el índice). Si el diseño cambia, re-relevar con `recon/dump.ps1`.
- `src/locators/sideMenu.locators.ts` → `btnAvatarHeader`. El 2026-09-07 se había
  cambiado de `@bounds` fijos a `//android.widget.Button` a secas, asumiendo que era
  el único `Button` de la raíz del Feed. **Esa asunción resultó falsa (2026-09-08):**
  un post institucional con "Seguir", o cualquier post con imagen ("Ver imagen") o
  video ("Reproducir video"), también renderiza como `android.widget.Button` y puede
  aparecer ANTES que el avatar en el árbol — el locator terminaba tocando ese botón
  del feed en vez de abrir el menú lateral. Se volvió a anclar por `@bounds` (posición
  fija del header, estable en todos los dumps de este proyecto pese al contenido de
  abajo) combinado con la clase. Sigue siendo frágil ante un cambio de
  resolución/densidad del emulador — no hay ninguna otra señal disponible (sin
  `resource-id` ni `content-desc` propios). Ver la regla de oro sobre
  `SideMenuPage.abrir()` en la sección de Prioridad 2 arriba antes de reusarlo.
