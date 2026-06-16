import LoginPage from '../../pages/Intramed/LoginPage-Intramed'
import FeedPage from '../../pages/Intramed/FeedPage-Intramed'
import { step } from '../../utils/logger'

const EMAIL = process.env.TEST_EMAIL!
const PASSWORD = process.env.TEST_PASSWORD!

describe('[#login] Login', () => {
  it('TC01 - login inválido muestra mensaje de error', async () => {
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

  it('TC02 - login exitoso con credenciales válidas', async () => {
    await step('Login con credenciales válidas', () =>
      LoginPage.login(EMAIL, PASSWORD),
    )
    await step('Esperar feed listo', () => FeedPage.waitForScreenReady())
    await step('Validar botón "Crear" visible', async () => {
      await expect(FeedPage.btnCrear).toBeDisplayed()
    })
  })
})
