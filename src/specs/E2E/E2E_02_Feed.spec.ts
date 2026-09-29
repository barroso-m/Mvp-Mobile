import FeedPage from '../../pages/Intramed/FeedPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { eliminarPostsDeLaCorrida } from '../../utils/cleanup.helper'
import { step } from '../../utils/logger'

const POST_TEXT = `post automation mobile ${Date.now()} 💪`

// Todo lo que publica la suite, para que el `after` lo borre al terminar. Se
// llena a medida que cada test publica: si se corre un subconjunto (por ej.
// `--mochaOpts.grep TC18`), acá solo queda lo que esa corrida creó de verdad.
const postsDeLaCorrida: string[] = []

/**
 * Publica un post y lo registra para la limpieza final.
 *
 * Cada test que necesita un post lo crea acá y opera sobre él EN EL ACTO,
 * mientras sigue arriba del feed. No se puede reusar uno publicado antes: el
 * feed de Inicio es algorítmico y no garantiza contener tus propios posts
 * pasado ese momento — el 2026-09-15 se barrieron 20 pantallas desde el tope
 * sin encontrar ninguno de los 3 posts que esa misma corrida había publicado,
 * aunque los tres seguían existiendo (ver PENDIENTES.md).
 *
 * Eso es lo que jubiló al `POST_ESTABLE` del 07-sep, el post fijo que estos
 * tests usaban como "algún post del feed".
 *
 * `prefijoLimpieza` existe para los posts largos: llegan truncados al feed, así
 * que se los ubica y se los borra por prefijo y no por el texto completo.
 */
async function publicarFixture(
  texto: string,
  prefijoLimpieza: string = texto,
): Promise<void> {
  postsDeLaCorrida.push(prefijoLimpieza)
  await FeedPage.abrirCreacionPost()
  await FeedPage.crearPost(texto)
  await FeedPage.waitForScreenReady()
}

// TC10, TC18 y TC19 solo LEEN el post: comparten, o abren y cancelan el modal
// de Repostear. Ninguno lo consume y corren consecutivos, así que se reparten
// uno solo en vez de publicar tres.
//
// El motivo es el cuelgue del publish: a partir del cuarto post de una misma
// sesión, el composer se traba en el paso 2 con el botón en spinner y el
// request no vuelve nunca (ver PENDIENTES.md, 2026-09-15). Cuantas menos
// publicaciones por corrida, más lejos del umbral.
//
// El costo es la contracara: el post se publica en TC10 y TC19 lo usa un par de
// minutos después, con el feed pudiendo refrescarse en el medio. Si estos tres
// empiezan a fallar de forma intermitente con "el post no apareció en el feed",
// el sospechoso es esta ventana.
let postCompartido: string | undefined

async function obtenerPostCompartido(): Promise<string> {
  // No alcanza con memoizar: hay que confirmar que el feed TODAVÍA lo muestra.
  // Si se memoiza a secas y el feed deja de mostrarlo, los tests que siguen
  // fallan todos igual y —lo peor— el retry de Mocha recibe el mismo post
  // muerto en 0ms, así que está condenado a fallar de nuevo. Pasó en la corrida
  // del 2026-09-15: TC10/TC18/TC19/TC20 en rojo con sus dos intentos idénticos.
  if (postCompartido) {
    try {
      await FeedPage.esperarPostVisible(postCompartido, 15000)
      return postCompartido
    } catch {
      postCompartido = undefined
    }
  }

  const texto = `fixture compartido mobile ${Date.now()}`
  await publicarFixture(texto)
  await FeedPage.esperarPostVisible(texto)
  postCompartido = texto
  return texto
}

describe('[#feed] Feed', () => {
  // Sin esto la cuenta de prueba acumula un post por test y por corrida. La
  // limpieza va por el perfil, no por el feed: ver `eliminarPostsDeLaCorrida`.
  after(async () => {
    await eliminarPostsDeLaCorrida(postsDeLaCorrida)
  })

  it('TC03 [IE-T28] - crear post con imagen, texto y emoji, validar toast y publicación en feed', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir pantalla de creación de post', () =>
      FeedPage.abrirCreacionPost(),
    )
    await step(`Publicar post "${POST_TEXT}"`, async () => {
      postsDeLaCorrida.push(POST_TEXT)
      await FeedPage.crearPost(POST_TEXT)
    })
    await step('Validar toast de éxito', async () => {
      await expect(FeedPage.toastExito).toBeDisplayed()
    })
    await step('Esperar feed listo tras publicar', () =>
      FeedPage.waitForScreenReady(),
    )
    await step(
      'Validar que el post aparezca en el feed (con pull-to-refresh)',
      () => FeedPage.esperarPostVisible(POST_TEXT),
    )
  })

  it('TC04 [IE-T29] - dar y quitar like al post creado en TC03', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step(
      'Localizar el post de TC03 (con pull-to-refresh si hace falta)',
      () => FeedPage.esperarPostVisible(POST_TEXT),
    )
    const antes = await step('Leer el contador de likes actual', () =>
      FeedPage.leerContadorLikes(POST_TEXT),
    )
    await step('Dar like al post', () => FeedPage.reaccionarPost(POST_TEXT))
    await step('Validar que el contador subió en 1', async () => {
      await browser.waitUntil(
        async () => (await FeedPage.leerContadorLikes(POST_TEXT)) === antes + 1,
        {
          timeout: 5000,
          timeoutMsg: 'El contador de likes no subió tras dar like',
        },
      )
    })
    await step('Quitar el like al post', () =>
      FeedPage.reaccionarPost(POST_TEXT),
    )
    await step('Validar que el contador volvió al valor original', async () => {
      await browser.waitUntil(
        async () => (await FeedPage.leerContadorLikes(POST_TEXT)) === antes,
        {
          timeout: 5000,
          timeoutMsg: 'El contador de likes no volvió al original',
        },
      )
    })
  })

  it('TC08 [FEED-M-003] - comentar el post recién creado y validar publicación', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Localizar el post de TC03', () =>
      FeedPage.esperarPostVisible(POST_TEXT),
    )
    const comentario = `comentario automation ${Date.now()}`
    await step(`Comentar "${comentario}"`, () =>
      FeedPage.comentarPost(POST_TEXT, comentario),
    )
    await step('Validar que el comentario aparece en el feed', async () => {
      await expect($(`//*[@text="${comentario}"]`)).toBeDisplayed()
    })
  })

  it('TC09 [FEED-M-011] - expandir una publicación larga con "Ver más"', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    // El relleno es lo que fuerza el truncado: sin él la app muestra el post
    // entero y no hay ningún "Ver más" que tocar.
    const prefijoLargo = `fixture largo mobile ${Date.now()}`
    const postLargo = `${prefijoLargo} ${'texto de relleno para forzar el truncado de la publicacion. '.repeat(10)}`

    await step('Publicar un post largo', () =>
      publicarFixture(postLargo, prefijoLargo),
    )
    // Un post largo llega truncado al feed: su TextView expone el texto
    // cortado, así que se lo ubica por prefijo y no por igualdad exacta.
    await step('Localizar el post largo recién publicado', () =>
      FeedPage.esperarPostVisiblePorPrefijo(prefijoLargo),
    )
    // Se apunta al "Ver más" de ESTE post y no al locator global: con más de un
    // post largo en pantalla, el global expandía el que no era.
    await step('Validar que el post largo muestra "Ver más"', async () => {
      await expect(FeedPage.btnVerMasDePost(prefijoLargo)).toBeDisplayed()
    })
    await step('Tocar "Ver más" para expandir la publicación', () =>
      FeedPage.expandirVerMasDePost(prefijoLargo),
    )
    await step(
      'Validar que "Ver más" ya no está visible tras expandir',
      async () => {
        await expect(FeedPage.btnVerMasDePost(prefijoLargo)).not.toBeDisplayed()
      },
    )
  })

  it('TC10 [FEED-M-012] - compartir una publicación abre el share sheet nativo', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    const post = await step(
      'Obtener el post compartido por TC10/TC18/TC19, ubicado en el feed',
      () => obtenerPostCompartido(),
    )
    await step('Tocar el ícono de compartir del post', () =>
      FeedPage.compartirPost(post),
    )
    await step('Validar que se abre el share sheet nativo', async () => {
      const chooser = await $(
        '//*[@resource-id="android:id/resolver_list" or @resource-id="android:id/chooser_header"]',
      )
      await chooser.waitForDisplayed({ timeout: 15000 })
      await expect(chooser).toBeDisplayed()
    })
    await step('Cerrar el share sheet con back', () => driver.back())
  })

  it('TC18 [IE-T48] - abrir modal Repostear y validar botón deshabilitado', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    const post = await step(
      'Obtener el post compartido por TC10/TC18/TC19, ubicado en el feed',
      () => obtenerPostCompartido(),
    )
    await step('Abrir el modal de Repostear', () =>
      FeedPage.abrirRepostModal(post),
    )
    await step(
      'Validar que el botón Repostear está deshabilitado',
      async () => {
        await expect(FeedPage.btnRepostearSubmit).not.toBeEnabled()
      },
    )
    await step('Cerrar el modal sin publicar', () => driver.back())
  })

  it('TC19 [IE-T58] - validar mínimo 50 caracteres en el modal Repostear', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    const post = await step(
      'Obtener el post compartido por TC10/TC18/TC19, ubicado en el feed',
      () => obtenerPostCompartido(),
    )
    await step('Abrir el modal de Repostear', () =>
      FeedPage.abrirRepostModal(post),
    )
    await step('Escribir un texto corto (menor a 50 caracteres)', () =>
      FeedPage.escribirTextoRepost('Texto corto'),
    )
    await step('Validar que el botón sigue deshabilitado', async () => {
      await expect(FeedPage.btnRepostearSubmit).not.toBeEnabled()
    })
    await step('Escribir un texto de 60 caracteres', () =>
      FeedPage.escribirTextoRepost('x'.repeat(60)),
    )
    await step('Validar que el botón se habilita', async () => {
      await expect(FeedPage.btnRepostearSubmit).toBeEnabled()
    })
    await step('Cerrar el modal sin publicar', () => driver.back())
  })

  it('TC20 [IE-T49] - repostear una publicación y guardar/desguardar el repost', async () => {
    // A diferencia de TC18/TC19, este test SÍ completa el repost, así que necesita
    // un post propio y virgen: una vez reposteado, ESE post deja de abrir el
    // modal de Repostear y no serviría para la próxima corrida.
    const post = `fixture repost mobile ${Date.now()}`
    const REPOST_TEXT = `repost automation mobile ${Date.now()} test automatico`

    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Publicar el post sobre el que opera el test', () =>
      publicarFixture(post),
    )
    await step('Localizar el post recién publicado', () =>
      FeedPage.esperarPostVisible(post),
    )
    await step(`Repostear el post con el texto "${REPOST_TEXT}"`, () =>
      FeedPage.repostear(post, REPOST_TEXT),
    )
    await step('Validar que el repost aparece en el feed', () =>
      FeedPage.esperarPostVisible(REPOST_TEXT),
    )
    await step('Guardar el repost', () =>
      FeedPage.toggleGuardarRepost(REPOST_TEXT),
    )
    await step('Desguardar el repost', () =>
      FeedPage.toggleGuardarRepost(REPOST_TEXT),
    )
  })

  it('TC21 [IE-T52] - aplicar y limpiar el filtro "Personas" del feed', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Aplicar el filtro "Personas"', () =>
      FeedPage.aplicarFiltro('Personas'),
    )
    await step('Validar que el chip de filtro activo aparece', async () => {
      await expect(FeedPage.chipFiltro('Personas')).toBeDisplayed()
    })
    await step('Limpiar los filtros', () => FeedPage.limpiarFiltros())
    await step('Validar que el chip de filtro ya no está', async () => {
      await expect(FeedPage.chipFiltro('Personas')).not.toBeDisplayed()
    })
  })

  it('TC22 [IE-T54] - el filtro "Encuestas" navega correctamente', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Aplicar el filtro "Encuestas"', () =>
      FeedPage.aplicarFiltro('Encuestas'),
    )
    await step('Validar que el chip de filtro activo aparece', async () => {
      await expect(FeedPage.chipFiltro('Encuestas')).toBeDisplayed()
    })
    await step('Limpiar los filtros', () => FeedPage.limpiarFiltros())
  })
})
