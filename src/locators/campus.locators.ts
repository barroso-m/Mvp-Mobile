export const CampusLocators = {
  tabCampus: '~Campus',
  tituloOfertaAcademica: '//*[@text="Oferta académica"]',
  subtituloOferta: '//*[contains(@text, "Cursos, programas y actividades")]',
  seccionMisInscripciones: '//*[@text="Mis inscripciones"]',
  seccionRecomendados: '//*[@text="Recomendados para vos"]',
  seccionMasFormaciones: '//*[@text="Más formaciones disponibles"]',
  bannerExplorar: '//*[contains(@text, "Explorar toda la Oferta")]',
  btnExplorarCatalogo: '//*[contains(@text, "Explorar catálogo")]',
  btnVerMas: '//*[contains(@text, "Ver más")]',
  badgeInscripto: '//*[@text="INSCRIPTO"]',
  btnVolverHeader: '//android.widget.ImageButton[@content-desc="Navigate up"]',
  btnGoBack:
    '//android.widget.Button[@content-desc="Go back"] | //android.widget.Button[@content-desc="Go back"]/android.widget.ImageView',
  tagOfertaAcademicaDetalle: '//*[@text="Oferta académica"]',
  contenidoAutor: '//*[contains(@text, "Autor")]',
  cardPorTitulo: (titulo: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${titulo}")]`,
  btnVerMasPorTitulo: (titulo: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${titulo}")]//*[@content-desc="Ver más"]`,
  cardCatalogo: '//android.view.ViewGroup[contains(@content-desc, ". ")]',
} as const
