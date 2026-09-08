import { BasePage } from '../BasePage'
import { ChatLocators } from '../../locators/chat.locators'

class ChatPage extends BasePage {
  get tabMensajes() {
    return $(ChatLocators.tabMensajes)
  }
  get tituloMensajes() {
    return $(ChatLocators.tituloMensajes)
  }
  get btnNuevo() {
    return $(ChatLocators.btnNuevo)
  }
  get inputBuscador() {
    return $(ChatLocators.inputBuscador)
  }
  get tabTodas() {
    return $(ChatLocators.tabTodas)
  }
  get tabNoLeidas() {
    return $(ChatLocators.tabNoLeidas)
  }
  get tabSolicitudes() {
    return $(ChatLocators.tabSolicitudes)
  }
  get listaConversaciones() {
    return $(ChatLocators.listaConversaciones)
  }
  get emptyStateSinResultados() {
    return $(ChatLocators.emptyStateSinResultados)
  }
  get inputMensaje() {
    return $(ChatLocators.inputMensaje)
  }
  get btnEnviarMensaje() {
    return $(ChatLocators.btnEnviarMensaje)
  }

  conversacionPorNombre(nombre: string) {
    return $(ChatLocators.conversacionPorNombre(nombre))
  }

  async abrirTab(): Promise<void> {
    await this.waitForElement(this.tabMensajes, 15000)
    await this.tap(this.tabMensajes)
    await this.waitForElement(this.tituloMensajes, 15000)
  }

  async buscarConversacion(termino: string): Promise<void> {
    await this.waitForElement(this.inputBuscador)
    await this.setValue(this.inputBuscador, termino)
  }

  async limpiarBuscador(): Promise<void> {
    await this.waitForElement(this.inputBuscador)
    await this.inputBuscador.clearValue()
  }
}

export default new ChatPage()
