import LoginPage from '../pages/login.page';
import FeedPage from '../pages/feed.page';

const POST_TEXT = `post automation mobile ${Date.now()}`;

// Garantiza llegar al feed tanto en corrida conjunta (sesión ya iniciada
// por el test de login) como en corrida aislada (app limpia, requiere login).
async function asegurarSesionEnFeed(): Promise<void> {
  await browser.waitUntil(
    async () => {
      const onFeed = await FeedPage.btnCrear.isDisplayed().catch(() => false);
      const onLogin = await LoginPage.btnIniciarSesion.isDisplayed().catch(() => false);
      return onFeed || onLogin;
    },
    {
      timeout: 30000,
      interval: 500,
      timeoutMsg: 'No se encontró ni el feed ni la pantalla de login después de 30s',
    },
  );

  const alreadyOnFeed = await FeedPage.btnCrear.isDisplayed().catch(() => false);
  if (!alreadyOnFeed) {
    await LoginPage.login(
      process.env.TEST_EMAIL!,
      process.env.TEST_PASSWORD!,
    );
  }

  await FeedPage.waitForScreenReady();
}

describe('[#feed] Feed — IntraMed Android', () => {
  describe('Creación de post con imagen y texto', () => {
    it('debe publicar un post y mostrarlo en el feed con toast de éxito', async () => {
      await asegurarSesionEnFeed();

      await FeedPage.abrirCreacionPost();
      await FeedPage.crearPost(POST_TEXT);

      await expect(FeedPage.toastExito).toBeDisplayed();

      await FeedPage.waitForScreenReady();

      // El feed no se refresca solo tras publicar: reintenta con pull-to-refresh.
      const postCreado = FeedPage.postEnFeed(POST_TEXT);
      await browser.waitUntil(
        async () => {
          if (await postCreado.isDisplayed().catch(() => false)) return true;
          await FeedPage.refrescarFeed();
          return postCreado.isDisplayed().catch(() => false);
        },
        {
          timeout: 30000,
          interval: 2000,
          timeoutMsg: `El post "${POST_TEXT}" no apareció en el feed después de 30s`,
        },
      );
      await expect(postCreado).toBeDisplayed();
    });
  });
});
