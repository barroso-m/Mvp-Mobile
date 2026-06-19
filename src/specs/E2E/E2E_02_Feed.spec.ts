import FeedPage from '../../pages/Intramed/FeedPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

const POST_TEXT = `post automation mobile ${Date.now()}`

describe('[#feed] Feed', () => {
  it('TC03 [IE-T28] - crear post con imagen y texto, validar toast y publicación en feed', async () => {
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

  it('TC04 [IE-T29] - reaccionar al post creado en TC03', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step(
      'Localizar el post de TC02 (con pull-to-refresh si hace falta)',
      () => FeedPage.esperarPostVisible(POST_TEXT),
    )
    await step('Tocar botón de reacción del post', () =>
      FeedPage.reaccionarPost(POST_TEXT),
    )
  })

  /* it('TC04 - comentar el post creado en TC02', async () => {
    await step('Asegurar que el user está logueado', () => asegurarSesionEnFeed());
    await step('Localizar el post de TC02 (con pull-to-refresh si hace falta)', () =>
      FeedPage.esperarPostVisible(POST_TEXT),
    );
    const COMENTARIO = `comentario automation ${Date.now()}`;
    await step(`Comentar "${COMENTARIO}"`, () => FeedPage.comentarPost(POST_TEXT, COMENTARIO));
  }); */
})
