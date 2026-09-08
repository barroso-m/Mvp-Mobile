import CampusPage from '../../pages/Intramed/CampusPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

describe('[#campus] Oferta académica (Campus)', () => {
  it('TC16 [OFA-M-001] - el tab Campus muestra la Oferta académica con todas sus secciones', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Campus"', () => CampusPage.abrirTab())
    await step('Validar título y subtítulo de la pantalla', async () => {
      await expect(CampusPage.tituloOfertaAcademica).toBeDisplayed()
      await expect(CampusPage.subtituloOferta).toBeDisplayed()
    })
    await step(
      'Validar secciones: Mis inscripciones, Recomendados, Más formaciones',
      async () => {
        await expect(CampusPage.seccionMisInscripciones).toBeDisplayed()
        await expect(CampusPage.seccionRecomendados).toBeDisplayed()
        await expect(CampusPage.seccionMasFormaciones).toBeDisplayed()
      },
    )
    await step('Validar banner "Explorar toda la Oferta"', async () => {
      await expect(CampusPage.bannerExplorar).toBeDisplayed()
      await expect(CampusPage.btnExplorarCatalogo).toBeDisplayed()
    })
  })

  it('TC17 [OFA-M-004] - abrir el detalle de una formación desde Recomendados y volver al tab', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Campus"', () => CampusPage.abrirTab())
    await step('Tocar "Ver curso" del primer recomendado', () =>
      CampusPage.abrirPrimerRecomendado(),
    )
    await step(
      'Validar detalle: tag Oferta académica y datos del contenido',
      async () => {
        await expect(CampusPage.tagOfertaAcademicaDetalle).toBeDisplayed()
        await expect(CampusPage.contenidoAutor).toBeDisplayed()
      },
    )
    await step('Volver al tab Campus con la flecha del header', () =>
      CampusPage.volverAlTab(),
    )
    await step('Validar que se vuelve al tab Campus', async () => {
      await expect(CampusPage.tituloOfertaAcademica).toBeDisplayed()
    })
  })
})
