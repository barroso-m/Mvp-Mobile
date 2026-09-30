import { BasePage } from '../BasePage'
import { SideMenuLocators } from '../../locators/sideMenu.locators'

class SideMenuPage extends BasePage {
  get btnAvatarHeader() {
    return $(SideMenuLocators.btnAvatarHeader)
  }
  get tabInicio() {
    return $(SideMenuLocators.tabInicio)
  }
  get itemVerPerfil() {
    return $(SideMenuLocators.itemVerPerfil)
  }
  get itemGuardados() {
    return $(SideMenuLocators.itemGuardados)
  }
  get itemMisInscripciones() {
    return $(SideMenuLocators.itemMisInscripciones)
  }
  get itemEventos() {
    return $(SideMenuLocators.itemEventos)
  }
  get itemConfiguracion() {
    return $(SideMenuLocators.itemConfiguracion)
  }
  get itemCerrarSesion() {
    return $(SideMenuLocators.itemCerrarSesion)
  }
  get idiomaEs() {
    return $(SideMenuLocators.idiomaEs)
  }
  get idiomaEn() {
    return $(SideMenuLocators.idiomaEn)
  }
  get idiomaPt() {
    return $(SideMenuLocators.idiomaPt)
  }

  async abrir(): Promise<void> {
    if (!(await this.isVisible(this.btnAvatarHeader))) {
      await this.tap(this.tabInicio)
      await this.waitForElement(this.btnAvatarHeader, 15000)
    }
    await this.tap(this.btnAvatarHeader)
    await this.waitForElement(this.itemCerrarSesion, 15000)
  }

  async cerrarSesion(): Promise<void> {
    await this.abrir()
    await this.tap(this.itemCerrarSesion)
  }

  async irAGuardados(): Promise<void> {
    await this.abrir()
    await this.waitForElement(this.itemGuardados)
    await this.tap(this.itemGuardados)
  }

  async irAVerPerfil(): Promise<void> {
    await this.abrir()
    await this.waitForElement(this.itemVerPerfil)
    await this.tap(this.itemVerPerfil)
  }

  async irAConfiguracion(): Promise<void> {
    await this.abrir()
    await this.waitForElement(this.itemConfiguracion)
    await this.tap(this.itemConfiguracion)
  }

  async cambiarIdioma(idioma: 'ES' | 'EN' | 'PT'): Promise<void> {
    await this.abrir()
    const target =
      idioma === 'ES'
        ? this.idiomaEs
        : idioma === 'EN'
          ? this.idiomaEn
          : this.idiomaPt
    await this.waitForElement(target)
    await this.tap(target)
  }
}

export default new SideMenuPage()
