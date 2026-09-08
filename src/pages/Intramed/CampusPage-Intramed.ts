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
  get btnVerCurso() {
    return $(CampusLocators.btnVerCurso)
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

  cardPorTitulo(titulo: string) {
    return $(CampusLocators.cardPorTitulo(titulo))
  }

  btnVerCursoPorTitulo(titulo: string) {
    return $(CampusLocators.btnVerCursoPorTitulo(titulo))
  }

  async abrirTab(): Promise<void> {
    await this.waitForElement(this.tabCampus, 15000)
    await this.tap(this.tabCampus)
    await this.waitForElement(this.tituloOfertaAcademica, 20000)
  }

  async abrirPrimerRecomendado(): Promise<void> {
    await this.waitForElement(this.seccionRecomendados)
    await this.waitForElement(this.btnVerCurso, 15000)
    await this.tap(this.btnVerCurso)
  }

  async volverAlTab(): Promise<void> {
    await this.waitForElement(this.btnVolverHeader)
    await this.tap(this.btnVolverHeader)
    await this.waitForElement(this.tituloOfertaAcademica, 15000)
  }
}

export default new CampusPage()
