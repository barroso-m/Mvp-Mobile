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
    // El avatar vive en el header, que NO es fijo: scrollea junto con el feed, y
    // está anclado por @bounds porque no tiene accessibility-id. Con el feed
    // scrolleado no matchea nada y el wait se come los 15s enteros — así se caía
    // la limpieza del `after` de la spec de Feed, que corre justo cuando el feed
    // quedó más abajo de todo (2026-09-15).
    //
    // Se vuelve al tope tocando el tab "Inicio" y no scrolleando: es UN gesto en
    // vez de muchos, y es determinístico. Comprobado en el device: con el feed 15
    // pantallas abajo el avatar no está en el árbol, y tras tocar "Inicio" vuelve.
    // Importa que sea un solo gesto — el flood de `scrollGesture` es el
    // disparador sospechado del cuelgue de la instrumentación (ver PENDIENTES.md).
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
