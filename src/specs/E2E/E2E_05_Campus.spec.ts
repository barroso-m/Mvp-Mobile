import CampusPage from '../../pages/Intramed/CampusPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

describe('[#campus] Oferta académica (Campus)', () => {
  it('TC16 [IE-T101] - el tab Campus muestra la Oferta académica con todas sus secciones', async () => {
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
        await CampusPage.scrollHastaTexto('Más formaciones disponibles')
        await expect(CampusPage.seccionMasFormaciones).toBeDisplayed()
      },
    )
    await step('Validar banner "Explorar toda la Oferta"', async () => {
      await CampusPage.scrollHastaTexto('Explorar catálogo')
      await expect(CampusPage.bannerExplorar).toBeDisplayed()
      await expect(CampusPage.btnExplorarCatalogo).toBeDisplayed()
    })
  })

  it('TC17 [IE-T104] - abrir el detalle de una formación desde Recomendados y volver al tab', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Campus"', () => CampusPage.abrirTab())
    await step('Tocar "Ver más" del primer recomendado', () =>
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

  it('TC36 [IE-T102] - el carrusel de Recomendados avanza con swipe horizontal', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Campus"', () => CampusPage.abrirTab())
    await step('Scrollear hasta dejar el carrusel Recomendados visible', () =>
      CampusPage.scrollHastaCarruselRecomendados(),
    )
    let titulosAntes: string[] = []
    await step(
      'Capturar títulos visibles en Recomendados antes del swipe',
      async () => {
        titulosAntes = await CampusPage.titulosEnRecomendados()
        expect(titulosAntes.length).toBeGreaterThan(0)
      },
    )
    await step(
      'Swipe horizontal (derecha → izquierda) sobre Recomendados',
      async () => {
        const y = await CampusPage.centroRecomendados()
        await CampusPage.swipeCarruselHorizontal(y)
      },
    )
    await step('Validar que aparece al menos un título nuevo', async () => {
      const titulosDespues = await CampusPage.titulosEnRecomendados()
      const nuevos = titulosDespues.filter((t) => !titulosAntes.includes(t))
      expect(nuevos.length).toBeGreaterThan(0)
    })
  })

  it('TC37 [IE-T103] - Mis inscripciones muestra badge INSCRIPTO y botón "Ver más"', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Campus"', () => CampusPage.abrirTab())
    await step('Validar sección Mis inscripciones visible', async () => {
      await expect(CampusPage.seccionMisInscripciones).toBeDisplayed()
    })
    await step('Validar que hay al menos un badge INSCRIPTO', async () => {
      const badges = await CampusPage.badgesInscripto
      expect(badges.length).toBeGreaterThan(0)
      await expect(badges[0]).toBeDisplayed()
    })
    await step(
      'Validar que hay al menos un botón "Ver más" accesible',
      async () => {
        await expect(CampusPage.btnVerMas).toBeDisplayed()
      },
    )
  })

  it('TC38 [IE-T106] - "Explorar catálogo" abre el catálogo con listado de cursos', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Campus"', () => CampusPage.abrirTab())
    await step('Tocar "Explorar catálogo"', () => CampusPage.abrirCatalogo())
    await step(
      'Validar que estamos en el catálogo (flecha Go back + cards en lista)',
      async () => {
        await expect(CampusPage.btnGoBack).toBeDisplayed()
        await expect(CampusPage.seccionMisInscripciones).not.toBeDisplayed()
        const cards = await CampusPage.cardsCatalogo
        expect(cards.length).toBeGreaterThan(0)
      },
    )
    await step('Volver al tab Campus con Go back', () =>
      CampusPage.volverDelCatalogo(),
    )
    await step('Validar que se vuelve al tab Campus', async () => {
      await expect(CampusPage.tituloOfertaAcademica).toBeDisplayed()
    })
  })
})
