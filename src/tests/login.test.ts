import LoginPage from '../pages/login.page';
import FeedPage from '../pages/feed.page';

describe('[#login] Login — IntraMed Android', () => {
  describe('Credenciales válidas', () => {
    it('debe mostrar el feed con la navbar tras iniciar sesión correctamente', async () => {
      await LoginPage.waitForScreenReady();

      await LoginPage.login(
        process.env.TEST_EMAIL!,
        process.env.TEST_PASSWORD!,
      );

      await FeedPage.waitForScreenReady();
      await expect(FeedPage.btnCrear).toBeDisplayed();
    });
  });
});
