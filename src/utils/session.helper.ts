import LoginPage from '../pages/Intramed/LoginPage-Intramed'
import FeedPage from '../pages/Intramed/FeedPage-Intramed'

async function enFeedOLogin(): Promise<boolean> {
  const onLogin = await LoginPage.btnIniciarSesion
    .isDisplayed()
    .catch(() => false)
  if (onLogin) return true

  const onFeed = await FeedPage.btnCrear.isDisplayed().catch(() => false)
  if (!onFeed) return false

  // El bottom tab bar (con "Crear") sigue visible en pantallas empujadas
  // dentro del mismo stack del tab (ej. Ver Perfil), así que por sí sola su
  // presencia no confirma que estemos en la raíz del Feed. Esas pantallas sí
  // muestran un botón "Go back" en el header, que la raíz del Feed nunca
  // muestra — se usa como distintivo.
  const tieneGoBack = await $('~Go back')
    .isDisplayed()
    .catch(() => false)
  return !tieneGoBack
}

export async function asegurarSesionEnFeed(): Promise<void> {
  // Un test anterior puede haber dejado la app en una pantalla "empujada" sin
  // bottom nav ni login visibles (ej. Configuración > Cuenta > Gestión de
  // cuenta). Antes de asumir que la sesión se perdió, se intenta volver con el
  // botón "Go back" del header las veces que haga falta. A propósito NO se usa
  // el back físico/hardware: en la pantalla raíz del Feed eso saca de la app en
  // vez de cerrar el teclado o navegar, y podría terminar en el launcher.
  // Si un test anterior quedó con el teclado abierto (ej. tras un setValue
  // fallido), puede tapar el botón "Go back" e impedir la recuperación.
  await driver.hideKeyboard().catch(() => {})

  const botonVolver = $('~Go back')
  for (
    let i = 0;
    i < 8 &&
    !(await enFeedOLogin()) &&
    (await botonVolver.isDisplayed().catch(() => false));
    i++
  ) {
    await botonVolver.click()
    await driver.pause(700)
  }

  await browser.waitUntil(enFeedOLogin, {
    timeout: 30000,
    interval: 500,
    timeoutMsg:
      'No se encontró ni el feed ni la pantalla de login después de 30s',
  })

  const alreadyOnFeed = await FeedPage.btnCrear.isDisplayed().catch(() => false)
  if (!alreadyOnFeed) {
    await LoginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!)
  }

  await FeedPage.waitForScreenReady()
}
