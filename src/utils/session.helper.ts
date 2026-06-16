import LoginPage from '../pages/Intramed/LoginPage-Intramed'
import FeedPage from '../pages/Intramed/FeedPage-Intramed'

export async function asegurarSesionEnFeed(): Promise<void> {
  await browser.waitUntil(
    async () => {
      const onFeed = await FeedPage.btnCrear.isDisplayed().catch(() => false)
      const onLogin = await LoginPage.btnIniciarSesion
        .isDisplayed()
        .catch(() => false)
      return onFeed || onLogin
    },
    {
      timeout: 30000,
      interval: 500,
      timeoutMsg:
        'No se encontró ni el feed ni la pantalla de login después de 30s',
    },
  )

  const alreadyOnFeed = await FeedPage.btnCrear.isDisplayed().catch(() => false)
  if (!alreadyOnFeed) {
    await LoginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!)
  }

  await FeedPage.waitForScreenReady()
}
