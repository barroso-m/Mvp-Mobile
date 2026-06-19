import ProfilePage from '../../pages/Intramed/ProfilePage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

const EMAIL = process.env.TEST_EMAIL!
const PASSWORD = process.env.TEST_PASSWORD!

describe('[#profile] Profile', () => {
  it('TC05 [IE-T30] - llegar a la web de Gestión de cuenta y validar el botón de eliminar cuenta', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Navegar a "Eliminar cuenta" desde el perfil', () =>
      ProfilePage.irAEliminarCuenta(),
    )
    await step('Loguear en la web si lo pide', () =>
      ProfilePage.loginWebSiEsNecesario(EMAIL, PASSWORD),
    )
    await step('Validar título "Gestión de cuenta"', async () => {
      await expect(ProfilePage.tituloGestionCuenta).toBeDisplayed()
    })
    await step(
      'Validar botón "Eliminar cuenta" (sin hacer click)',
      async () => {
        await expect(ProfilePage.btnEliminarCuentaWeb).toBeDisplayed()
      },
    )
  })
})
