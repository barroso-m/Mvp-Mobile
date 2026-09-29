import SideMenuPage from '../pages/Intramed/SideMenuPage-Intramed'
import ProfilePage from '../pages/Intramed/ProfilePage-Intramed'
import FeedPage from '../pages/Intramed/FeedPage-Intramed'
import { asegurarSesionEnFeed } from './session.helper'

/**
 * Borra los posts que publicó la corrida, para que la cuenta de prueba no
 * acumule uno por ejecución.
 *
 * Por qué pasa por el perfil y no por el feed: el feed de Inicio es
 * algorítmico. Un post recién publicado aparece arriba un rato y desaparece
 * apenas el feed se refresca — el 2026-09-15 se barrieron 20 pantallas desde el
 * tope sin encontrar ninguno de los 3 posts que esa misma corrida había
 * publicado, aunque los tres seguían existiendo. "Mi actividad reciente" del
 * perfil sí los lista de forma determinística, y el detalle que abre renderiza
 * la misma card que el feed (mismo menú "...", mismo bottom sheet).
 *
 * **Borra del más nuevo al más viejo, y el orden no es cosmético.** "Mi actividad
 * reciente" del perfil muestra solo las **3 entradas más recientes**. Yendo del
 * más viejo al más nuevo, los primeros de la lista nunca están a la vista y el
 * borrado falla con "la entrada no aparece". Al revés funciona solo: cada vez
 * que se borra el de arriba, el siguiente sube al preview.
 *
 * ⚠️ Esto se apoya en que lo único que queda sin borrar son los reposts (hoy
 * `TC20` deja uno por corrida, ver PENDIENTES.md). Cada repost sin borrar ocupa
 * uno de los 3 lugares de forma permanente: acumulados a lo largo de varias
 * corridas van a terminar tapando el preview entero y esto va a volver a
 * fallar. Es deuda con fecha de vencimiento, no un detalle.
 *
 * Es best-effort a propósito: que la limpieza falle no tiene que teñir de rojo
 * una suite que pasó. Informa por consola qué pudo borrar y qué no.
 */
export async function eliminarPostsDeLaCorrida(
  prefijos: string[],
): Promise<void> {
  for (const prefijo of [...prefijos].reverse()) {
    // Un intento puede fallar por el estado en el que lo dejó el borrado
    // anterior (la pantalla de detalle no navega sola después de eliminar).
    // Reintentar una vez, ya desde el feed, alcanzó en todos los casos vistos.
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
