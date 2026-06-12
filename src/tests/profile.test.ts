import LoginPage from '../pages/login.page';
import FeedPage from '../pages/feed.page';
import ProfilePage from '../pages/profile.page';

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

describe('[#profile] Perfil — Gestión de cuenta — IntraMed Android', () => {
  describe('Eliminación de cuenta (solo validación, sin eliminar)', () => {
    it('debe llegar a la web de Gestión de cuenta y mostrar el botón de eliminar cuenta', async () => {
      await asegurarSesionEnFeed();

      await ProfilePage.irAEliminarCuenta();

      await ProfilePage.loginWebSiEsNecesario(
        process.env.TEST_EMAIL!,
        process.env.TEST_PASSWORD!,
      );

      await expect(ProfilePage.tituloGestionCuenta).toBeDisplayed();
      await expect(ProfilePage.btnEliminarCuentaWeb).toBeDisplayed();
      // IMPORTANTE: solo se valida la presencia del botón.
      // NUNCA hacer click en "Eliminar cuenta".
    });
  });
});
