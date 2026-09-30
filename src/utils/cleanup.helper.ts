import SideMenuPage from '../pages/Intramed/SideMenuPage-Intramed'
import ProfilePage from '../pages/Intramed/ProfilePage-Intramed'
import FeedPage from '../pages/Intramed/FeedPage-Intramed'
import { asegurarSesionEnFeed } from './session.helper'

export async function eliminarPostsDeLaCorrida(
  prefijos: string[],
): Promise<void> {
  for (const prefijo of [...prefijos].reverse()) {
    let borrado = false
    let ultimoError: unknown
    for (let intento = 1; intento <= 2 && !borrado; intento++) {
      try {
        await asegurarSesionEnFeed()
        await SideMenuPage.irAVerPerfil()
        await ProfilePage.abrirPostDeActividad(prefijo)
        await FeedPage.eliminarPostVisible(prefijo)
        borrado = true
      } catch (err) {
        ultimoError = err
      }
    }
    if (borrado) {
      console.log(`[cleanup] "${prefijo}": borrado`)
    } else {
      console.warn(
        `[cleanup] "${prefijo}": NO se pudo borrar, queda en la cuenta.`,
        ultimoError,
      )
    }
  }
}
