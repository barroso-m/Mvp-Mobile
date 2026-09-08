export const CampusLocators = {
  tabCampus: '~Campus',
  tituloOfertaAcademica: '//*[@text="Oferta académica"]',
  subtituloOferta: '//*[contains(@text, "Cursos, programas y actividades")]',
  seccionMisInscripciones: '//*[@text="Mis inscripciones"]',
  seccionRecomendados: '//*[@text="Recomendados para vos"]',
  seccionMasFormaciones: '//*[@text="Más formaciones disponibles"]',
  bannerExplorar: '//*[contains(@text, "Explorar toda la Oferta")]',
  btnExplorarCatalogo: '~Explorar catálogo',
  btnVerCurso: '~Ver curso',
  badgeInscripto: '//*[@text="INSCRIPTO"]',
  btnVolverHeader: '//android.widget.ImageButton[@content-desc="Navigate up"]',
  tagOfertaAcademicaDetalle: '//*[@text="Oferta académica"]',
  contenidoAutor: '//*[contains(@text, "Autor")]',
  cardPorTitulo: (titulo: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${titulo}")]`,
  btnVerCursoPorTitulo: (titulo: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${titulo}")]//*[@content-desc="Ver curso"]`,
} as const
