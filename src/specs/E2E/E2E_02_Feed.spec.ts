import FeedPage from '../../pages/Intramed/FeedPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

const POST_TEXT = `post automation mobile ${Date.now()} 💪`
// Post estable ya existente en el feed (no depende de que TC03 haya corrido en esta
// misma ejecución). Se usa en los tests que solo necesitan "algún post" y NO lo
// modifican (compartir, abrir/cancelar el modal de repostear). Importante: no debe
// usarse para un repost real — una vez reposteado, ESE post deja de abrir el modal
// de Repostear (ver TC20, que por eso depende del post fresco de TC03 en su lugar).
const POST_ESTABLE = 'Post automatizado 1786559253287💪'

describe('[#feed] Feed', () => {
  it('TC03 [IE-T28] - crear post con imagen, texto y emoji, validar toast y publicación en feed', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir pantalla de creación de post', () =>
      FeedPage.abrirCreacionPost(),
    )
    await step(`Publicar post "${POST_TEXT}"`, () =>
      FeedPage.crearPost(POST_TEXT),
    )
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
    await step('Validar que existe un link "Ver más" en el feed', async () => {
      await expect(FeedPage.btnVerMas).toBeDisplayed()
    })
    await step('Tocar "Ver más" para expandir la publicación', () =>
      FeedPage.expandirVerMas(),
    )
    await step(
      'Validar que "Ver más" ya no está visible tras expandir',
      async () => {
        await expect(FeedPage.btnVerMas).not.toBeDisplayed()
      },
    )
  })

  it('TC10 [FEED-M-012] - compartir una publicación abre el share sheet nativo', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Localizar un post existente en el feed', () =>
      FeedPage.esperarPostVisible(POST_ESTABLE),
    )
    await step('Tocar el ícono de compartir del post', () =>
      FeedPage.compartirPost(POST_ESTABLE),
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
    await step('Localizar un post existente en el feed', () =>
      FeedPage.esperarPostVisible(POST_ESTABLE),
    )
    await step('Abrir el modal de Repostear', () =>
      FeedPage.abrirRepostModal(POST_ESTABLE),
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
    await step('Localizar un post existente en el feed', () =>
      FeedPage.esperarPostVisible(POST_ESTABLE),
    )
    await step('Abrir el modal de Repostear', () =>
      FeedPage.abrirRepostModal(POST_ESTABLE),
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
    // A diferencia de TC18/TC19, este test SÍ completa el repost — necesita el post
    // recién creado por TC03 (no el POST_ESTABLE) para no dejar sin repostear-de-nuevo
    // un post fijo que se reutiliza en cada corrida.
    const REPOST_TEXT = `repost automation mobile ${Date.now()} test automatico`

    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Localizar el post de TC03', () =>
      FeedPage.esperarPostVisible(POST_TEXT),
    )
    await step(`Repostear el post con el texto "${REPOST_TEXT}"`, () =>
      FeedPage.repostear(POST_TEXT, REPOST_TEXT),
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
