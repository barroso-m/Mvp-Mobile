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
    await this.waitForElement(this.tituloOfertaAcademica, 90000)
  }

  async scrollToTop(maxScrolls = 10): Promise<void> {
    for (let i = 0; i < maxScrolls; i++) {
      if (await this.isVisible(this.tituloOfertaAcademica)) return
      await this.scrollUp()
    }
  }

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

  async scrollHastaCarruselRecomendados(): Promise<void> {
    await this.waitForElement(this.seccionRecomendados, 15000)
    await this.scrollHastaTexto('Más formaciones disponibles')
  }

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

  async centroRecomendados(): Promise<number> {
    await this.waitForElement(this.seccionRecomendados)
    const loc = await this.seccionRecomendados.getLocation()
    const { height } = await driver.getWindowSize()
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
