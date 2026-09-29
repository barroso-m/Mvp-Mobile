import { BasePage } from '../BasePage'
import { CampusLocators } from '../../locators/campus.locators'

class CampusPage extends BasePage {
  get tabCampus() {
    return $(CampusLocators.tabCampus)
  }
  get tituloOfertaAcademica() {
    return $(CampusLocators.tituloOfertaAcademica)
  }
  get subtituloOferta() {
    return $(CampusLocators.subtituloOferta)
  }
  get seccionMisInscripciones() {
    return $(CampusLocators.seccionMisInscripciones)
  }
  get seccionRecomendados() {
    return $(CampusLocators.seccionRecomendados)
  }
  get seccionMasFormaciones() {
    return $(CampusLocators.seccionMasFormaciones)
  }
  get bannerExplorar() {
    return $(CampusLocators.bannerExplorar)
  }
  get btnExplorarCatalogo() {
    return $(CampusLocators.btnExplorarCatalogo)
  }
  get btnVerMas() {
    return $(CampusLocators.btnVerMas)
  }
  get btnVolverHeader() {
    return $(CampusLocators.btnVolverHeader)
  }
  get tagOfertaAcademicaDetalle() {
    return $(CampusLocators.tagOfertaAcademicaDetalle)
  }
  get contenidoAutor() {
    return $(CampusLocators.contenidoAutor)
  }
  get badgesInscripto() {
    return $$(CampusLocators.badgeInscripto)
  }
  get btnGoBack() {
    return $(CampusLocators.btnGoBack)
  }
  get cardsCatalogo() {
    return $$(CampusLocators.cardCatalogo)
  }

  cardPorTitulo(titulo: string) {
    return $(CampusLocators.cardPorTitulo(titulo))
  }

  btnVerMasPorTitulo(titulo: string) {
    return $(CampusLocators.btnVerMasPorTitulo(titulo))
  }

  async abrirTab(): Promise<void> {
    await this.waitForElement(this.tabCampus, 15000)
    await this.tap(this.tabCampus)
    // Recién instalada la app, la Oferta tarda bastante en traer sus datos.
    // No es holgura de más: en la corrida del 2026-09-28 el único abrirTab()
    // que pasó tardó 36,4s y los otros cuatro murieron justo en los 40s que
    // había acá. Con 3,6s de margen, Campus entero era una moneda al aire.
    await this.waitForElement(this.tituloOfertaAcademica, 90000)
  }

  /** Scrollea hacia arriba hasta que "Oferta académica" sea visible.
   * Útil cuando, tras volver de una vista interior, el scroll queda en la
   * misma posición que tenía antes de navegar y hay que resetear al tope. */
  async scrollToTop(maxScrolls = 10): Promise<void> {
    for (let i = 0; i < maxScrolls; i++) {
      if (await this.isVisible(this.tituloOfertaAcademica)) return
      await this.scrollUp()
    }
  }

  /** El primer "Ver más" del árbol pertenece a "Mis inscripciones", y en un
   * curso ya inscripto ese botón abre el campus externo en Chrome en vez de
   * navegar al detalle in-app. Hay que tomar uno que caiga debajo del heading
   * de Recomendados. */
  async abrirPrimerRecomendado(): Promise<void> {
    await this.scrollHastaCarruselRecomendados()
    const yHeading = (await this.seccionRecomendados.getLocation()).y
    for (const boton of await $$(CampusLocators.btnVerMas)) {
      if ((await boton.getLocation()).y > yHeading) {
        await boton.click()
        return
      }
    }
    throw new Error('No se encontró un "Ver más" dentro de Recomendados')
  }

  async volverAlTab(): Promise<void> {
    await this.waitForElement(this.btnVolverHeader)
    await this.tap(this.btnVolverHeader)
    await this.waitForElement(this.tituloOfertaAcademica, 15000)
  }

  /** Scrollea hasta que un elemento marcador (por text visible) esté a la vista.
   * Útil para llegar a "Explorar catálogo" o similar sin saltear cuando el
   * bottom tab bar tapa parcialmente los banners. */
  async scrollHastaTexto(texto: string, maxScrolls = 8): Promise<void> {
    for (let i = 0; i < maxScrolls; i++) {
      const el = $(`//*[@text="${texto}" or @content-desc="${texto}"]`)
      if (await this.isVisible(el)) return
      await this.scrollDown()
    }
    throw new Error(
      `No se encontró "${texto}" después de ${maxScrolls} scrolls`,
    )
  }

  /** Swipe horizontal (derecha → izquierda) para avanzar un carrusel.
   * `centerY` debe caer dentro del carrusel objetivo (Recomendados vive a
   * mitad de pantalla cuando el heading está visible). */
  async swipeCarruselHorizontal(centerY: number): Promise<void> {
    const { width } = await driver.getWindowSize()
    await driver.execute('mobile: swipeGesture', {
      left: Math.floor(width * 0.1),
      top: centerY - 100,
      width: Math.floor(width * 0.8),
      height: 200,
      direction: 'left',
      percent: 0.85,
    })
  }

  /** Deja el carrusel de Recomendados con sus cards visibles (no solo el
   * heading, que queda tapado por el bottom tab bar cuando aparece recién por
   * el fondo). Estrategia: scrollear hasta que "Más formaciones disponibles"
   * asome — en ese momento Recomendados quedó en la parte superior/media de
   * la pantalla, cards incluidas. */
  async scrollHastaCarruselRecomendados(): Promise<void> {
    await this.waitForElement(this.seccionRecomendados, 15000)
    await this.scrollHastaTexto('Más formaciones disponibles')
  }

  /** Lee del page source los `text=` visibles entre el heading "Recomendados
   * para vos" y el heading "Más formaciones disponibles". Devuelve solo los
   * candidatos a título de card (descarta labels genéricos y el propio heading).
   * Un solo request al server, evita disparar cientos de comandos que
   * presionen la instrumentación UiAutomator2. */
  async titulosEnRecomendados(): Promise<string[]> {
    const src = await driver.getPageSource()
    const mReco = src.match(
      /text="Recomendados para vos"[^>]*?bounds="\[\d+,(\d+)\]\[\d+,(\d+)\]"/,
    )
    if (!mReco) return []
    const yStart = parseInt(mReco[2], 10)
    const mMas = src.match(
      /text="Más formaciones disponibles"[^>]*?bounds="\[\d+,(\d+)\]/,
    )
    const yEnd = mMas ? parseInt(mMas[1], 10) : yStart + 1000
    const descartar = new Set([
      'Recomendados para vos',
      'Más formaciones disponibles',
      'Ver más',
    ])
    const re =
      // `getPageSource()` NO devuelve `<node ...>`: cada elemento viene con su
      // clase como nombre de tag (`<android.widget.TextView ...>`). Los dumps
      // viejos de `recon/` sí tienen `<node>` porque salieron de
      // `adb shell uiautomator dump`, que es otro formato — de ahí la confusión.
      // Con `<node` el match era siempre vacío y TC36 fallaba en su primer
      // assert ("títulos antes del swipe" = 0) sin llegar a swipear nunca.
      /<[\w.]+[^>]*?text="([^"]+)"[^>]*?bounds="\[\d+,(\d+)\]\[\d+,\d+\]"/g
    const out: string[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(src))) {
      const y = parseInt(m[2], 10)
      if (y <= yStart || y >= yEnd) continue
      const t = m[1].trim()
      if (!t || descartar.has(t)) continue
      if (!out.includes(t)) out.push(t)
    }
    return out
  }

  /** Y central de la sección Recomendados para orientar el swipe. */
  async centroRecomendados(): Promise<number> {
    await this.waitForElement(this.seccionRecomendados)
    const loc = await this.seccionRecomendados.getLocation()
    const { height } = await driver.getWindowSize()
    // El carrusel ocupa ~700px debajo del heading, tap point a ~350px abajo
    return Math.min(loc.y + 350, height - 200)
  }

  async abrirCatalogo(): Promise<void> {
    await this.scrollHastaTexto('Explorar catálogo')
    await this.tap(this.btnExplorarCatalogo)
    await this.waitForElement(this.btnGoBack, 15000)
  }

  async volverDelCatalogo(): Promise<void> {
    await this.tap(this.btnGoBack)
    await this.waitForElement(this.tituloOfertaAcademica, 15000)
  }
}

export default new CampusPage()
