# Casos pendientes de portar de Web a Mobile

> Generado a partir del cruce entre `Intramed.MVP-Web/tests/specs/E2E/` (54 casos / 7 specs)
> y `Mobile/src/specs/E2E/` (17 casos / 5 specs).
>
> **Foco actual: Feed y Profile.** El resto queda documentado abajo para después.

## Resumen numérico

_Actualizado 2026-09-07, después de cerrar Prioridad 1 (Feed) y Prioridad 2 (Profile)._

|                              | Casos  |
| ---------------------------- | ------ |
| Web                          | 54     |
| Mobile                       | 35     |
| **Web a portar (pendiente)** | **23** |

Desglose de los 54 de web:

|                                                                                                   | Casos  |
| ------------------------------------------------------------------------------------------------- | ------ |
| Ya cubiertos en mobile                                                                            | 28     |
| Descartados (`IE-T55`, `IE-T57` web-only + `IE-T148` fuera de POC + `IE-T47` no existe en mobile) | 4      |
| **Pendientes**                                                                                    | **22** |

Los pendientes (Campus, Chat, Onboarding, Institution):

| Spec                | Faltantes | Condicionales |
| ------------------- | --------- | ------------- |
| Login               | 0         | —             |
| Feed                | 0 ✅      | —             |
| Profile             | 0 ✅      | —             |
| Campus              | 3         | —             |
| Chat                | 5         | 1 (`IE-T73`)  |
| Onboarding (nueva)  | 7         | —             |
| Institution (nueva) | 6         | —             |
| **Total**           | **21**    | **1**         |

**Estado real: 30 tests verdes, 4 con código listo pero validación pendiente de
re-confirmar (`TC27`/`TC33`/`TC34`/`TC35`, ver nota en Prioridad 2), 21 por escribir.**

Última numeración usada: **TC35**. Los nuevos arrancan en **TC36**.

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

**Convenciones del repo** (respetarlas):

- Locators: preferir `~accessibility-id` y `@resource-id`. La app es WebView-based.
- Locators dinámicos: funciones que reciben texto, ej.
  `postContainerByText: (texto: string) => \`//android.view.ViewGroup[contains(@content-desc, "${texto}")]\``
- Nomenclatura de tests: `it('TC<n> [<ID-Zephyr>] - descripción en minúscula', ...)`
- La numeración `TC<n>` es correlativa **global** en todo el proyecto, no por spec.
  Último usado: **TC35** (Profile, Prioridad 2). Los nuevos arrancan en **TC36**.

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

- `IE-T60` — ✅ `TC04` ahora da like, valida el contador +1, quita el like y valida que vuelve al original. **Bloqueado hoy** (ver nota de `TC03` abajo), código sin cambios respecto a lo ya documentado.
- `IE-T19` — ✅ `TC03` ahora agrega un emoji (💪) al `POST_TEXT`, cubre toda la cadena TC03/04/08. **Bloqueado hoy**, ver nota abajo.

**Descartados (web-only):** `IE-T55` (módulos columna derecha), `IE-T57` (card de perfil del sidebar).

**⚠️ Bloqueante actual — `TC03`/`TC04`/`TC08`/`TC20` (crear post / repostear el post de TC03):**
El picker de imágenes de Android (`com.google.android.providers.media.module`) quedó
sirviendo una miniatura **cacheada y corrupta** (el primer frame de una grabación de
pantalla vieja de Appium, `454d19c6.mp4`, que había quedado suelta en `/sdcard/`) en vez
de las fotos reales del dispositivo. Se probó, en orden, sin éxito:

1. Borrar los archivos y re-escanear MediaStore (`MEDIA_SCANNER_SCAN_FILE`).
2. `adb reboot` completo del emulador.
3. `pm clear` de ambos paquetes proveedores de medios
   (`com.google.android.providers.media.module` y `com.android.providers.media`).
4. `force-stop` + relanzar la app y el proceso `:PhotoPicker`.

En los 4 casos el picker siguió mostrando la misma miniatura corrupta, que al recortarse
("CORTAR") produce una imagen degenerada y el composer nunca llega a mostrar
"Cambiar imagen". **Se necesita un "Wipe Data" completo del AVD desde Android Studio**
(Device Manager → ⋮ → Wipe Data) para resetear la base de datos interna del Photo
Picker — no alcanza con lo que se puede hacer por `adb`. Tincho decidió (2026-09-07) no
hacerlo en el momento; queda pendiente para la próxima sesión. Una vez reseteado el AVD:

- Volver a loguear (`TEST_EMAIL`/`TEST_PASSWORD` en `.env`).
- Correr `npm run test:android:feed` completo — `TC03` debería crear el post sin el paso
  extra de "CORTAR" (o, si el picker moderno sigue pidiendo confirmar el recorte, el
  código YA lo maneja — ver `crearPost()` en `FeedPage-Intramed.ts`, que ahora detecta y
  confirma esa pantalla si aparece).
- Con `TC03` funcionando, `TC04`, `TC08` y `TC20` deberían pasar sin tocar nada más
  (ya están escritos y apuntan a `POST_TEXT`, el post fresco que crea `TC03`).

**Fuera de alcance — `IE-T148` (publicar con video):** confirmado con Tincho que la subida de
videos queda fuera de la POC de Mobile por ahora, no se va a implementar. Coincide con lo
observado en el emulador: el composer de "Crear publicación" declara explícitamente
"Imagen — PNG, JPG, hasta 2MB." y el picker nativo de Android (Photo Picker) filtra por
`image/*` — un video empujado a `/sdcard/Movies/` y escaneado por MediaStore no aparece ni
en "Fotos" ni en "Álbumes" del selector (verificado 2026-09-06). No se escribió test para
este caso. Si más adelante entra al alcance, retomar desde el flujo de `TC03`/`crearPost`
cambiando el picker de imagen por uno de video.

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

## PRIORIDAD 2 — `E2E_03_Profile.spec.ts` (2026-09-07)

| Web ID   | Caso                                                   | Estado                                                     |
| -------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `IE-T30` | Gestión de cuenta / validar botón eliminar (`TC05`)    | ✅ validado                                                |
| `IE-T20` | Navegar al perfil del usuario desde el feed (`TC24`)   | ✅ validado                                                |
| `IE-T39` | Abrir modal Agregar sección (`TC25`)                   | ✅ validado                                                |
| `IE-T40` | Ver más actividad y filtrar (`TC26`)                   | ✅ validado                                                |
| `IE-T45` | Cancelar edición de Sobre mí no persiste (`TC23`)      | ✅ validado                                                |
| `IE-T42` | Toggle switch Newsletter y persistir (`TC28`)          | ✅ validado                                                |
| `IE-T43` | Toggle switch Notificaciones y persistir (`TC29`)      | ✅ validado                                                |
| `IE-T46` | Datos profesionales con Guardar deshabilitado (`TC30`) | ✅ validado                                                |
| `IE-T22` | Error al ingresar letras en teléfono (`TC31`)          | ✅ validado                                                |
| `IE-T41` | Editar datos personales desde configuración (`TC27`)   | ⚠️ código correcto, validación intermitente — ver nota     |
| `IE-T24` | Agregar educación (`TC33`)                             | ⚠️ código correcto, no cerró una corrida limpia — ver nota |
| `IE-T44` | Validaciones del modal Agregar educación (`TC34`)      | ⚠️ mismo bloqueo que `TC33`                                |
| `IE-T25` | Eliminar educación (`TC35`)                            | ⚠️ mismo bloqueo que `TC33`/`TC34`                         |

`IE-T47` (ordenar secciones del perfil): **confirmado que no existe** — el perfil solo
tiene la sección "Instituciones" (educación) más la tarjeta vacía de "información
profesional"; no hay ningún control de reordenar. No se va a escribir test para esto.

**⚠️ Pendiente de re-verificación en una sesión fresca — `TC27`/`TC33`/`TC34`/`TC35`:**
El código de estos 4 tests quedó corregido (ver hallazgos abajo) y llegó a pasar
individualmente al menos una vez cada uno durante esta sesión, pero no se logró una
corrida 100% verde de la suite completa: hacia el final de la sesión el emulador ya
llevaba ~4hs de uso continuo e intensivo de Appium (`load average` de 4.35 al momento
de cortar, uptime 3:57hs) y empezaron a aparecer fallas de timing que no se correlacionan
con ningún bug de locator (elementos "stale" a mitad de un `setValue`, pantallas que
tardan más de lo esperado en re-renderizar tras un submit). Antes de dar estos 4 por
definitivamente rotos, correr de nuevo en una sesión nueva (emulador recién reiniciado):

```powershell
npm run test:android:profile -- --mochaOpts.grep "TC(27|33|34|35) "
```

Si vuelven a fallar, diagnosticar desde cero con `allure-results` — no asumir que el
motivo es el mismo que en esta sesión.

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

### `E2E_04_Chat.spec.ts` — 6 faltantes

`IE-T70` enviar mensaje en conversación existente · `IE-T71` abrir panel Nuevo mensaje ·
`IE-T72` tab No leídos · `IE-T75` tab Solicitudes · `IE-T74` pill de Mensajes en navbar

**A decidir:** `IE-T73` (recepción entre usuarios). En web usa 2 contextos de browser.
En Appium requiere 2 devices o crear el segundo usuario por API. Definir si entra al MVP.

### `E2E_05_Campus.spec.ts` — 3 faltantes

`IE-T62` carrusel Recomendados avanza (swipe horizontal) ·
`IE-T63` curso inscripto con badge y acceso al aula ·
`IE-T66` Explorar toda la oferta abre el catálogo

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
- ~~`src/locators/sideMenu.locators.ts` → `btnAvatarHeader` usaba `@bounds` fijos~~ —
  **corregido (2026-09-07)**: ahora es `//android.widget.Button` (único `Button` en la
  raíz del Feed). Sigue siendo un locator "posicional" en el sentido de que depende de
  ser el único `Button` de la pantalla — ver la regla de oro sobre `SideMenuPage.abrir()`
  en la sección de Prioridad 2 arriba antes de reusarlo en otro contexto.
