import LoginPage from '../../pages/Intramed/LoginPage-Intramed'
import FeedPage from '../../pages/Intramed/FeedPage-Intramed'
import SideMenuPage from '../../pages/Intramed/SideMenuPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

const EMAIL = process.env.TEST_EMAIL!
const PASSWORD = process.env.TEST_PASSWORD!

describe('[#login] Login', () => {
  it('TC01 [IE-T26] - login inválido muestra mensaje de error', async () => {
    await step('Esperar pantalla de login', () =>
      LoginPage.waitForScreenReady(),
    )
    await step('Intentar login con credenciales inválidas', () =>
      LoginPage.login('test', PASSWORD),
    )
    await step('Validar mensaje de error', async () => {
      await expect(LoginPage.msgErrorLogin).toBeDisplayed()
    })
  })

  it('TC02 [IE-T27] - login exitoso con credenciales válidas', async () => {
    await step('Login con credenciales válidas', () =>
      LoginPage.login(EMAIL, PASSWORD),
    )
    await step('Esperar feed listo', () => FeedPage.waitForScreenReady())
    await step('Validar botón "Crear" visible', async () => {
      await expect(FeedPage.btnCrear).toBeDisplayed()
    })
  })

  it('TC06 [IE-T87] - cerrar sesión desde el menú lateral vuelve a la pantalla inicial', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir menú lateral y tocar "Cerrar sesión"', () =>
      SideMenuPage.cerrarSesion(),
    )
    await step('Validar que se muestra la pantalla inicial', async () => {
      await LoginPage.waitForScreenReady()
      await expect(LoginPage.btnIniciarSesion).toBeDisplayed()
      await expect(LoginPage.btnRegistrarse).toBeDisplayed()
    })
  })

  it('TC07 [IE-T88] - la sesión persiste al cerrar y reabrir la app', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Cerrar la app en background', () =>
      driver.background(-1).catch(() => driver.pause(500)),
    )
    await step('Reabrir la app (activateApp)', async () => {
      const appId = (await driver.getCurrentPackage?.()) ?? 'com.intramed.app'
      await driver.execute('mobile: activateApp', { appId })
    })
    await step('Validar feed visible sin pedir credenciales', async () => {
      await FeedPage.waitForScreenReady()
      await expect(FeedPage.btnCrear).toBeDisplayed()
    })
  })
})
