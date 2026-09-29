import { BasePage } from '../BasePage'
import { ChatLocators } from '../../locators/chat.locators'

class ChatPage extends BasePage {
  get tabMensajes() {
    return $(ChatLocators.tabMensajes)
  }
  get tabMensajesConBadge() {
    return $(ChatLocators.tabMensajesConBadge)
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
  get btnAdjuntar() {
    return $(ChatLocators.btnAdjuntar)
  }
  get btnComandos() {
    return $(ChatLocators.btnComandos)
  }
  get avisoAprobacionPendiente() {
    return $(ChatLocators.avisoAprobacionPendiente)
  }
  get btnGoBack() {
    return $(ChatLocators.btnGoBack)
  }
  get tituloBuscarUsuarios() {
    return $(ChatLocators.tituloBuscarUsuarios)
  }
  get inputBuscarUsuarios() {
    return $(ChatLocators.inputBuscarUsuarios)
  }
  get hintMinimoCaracteres() {
    return $(ChatLocators.hintMinimoCaracteres)
  }
  get emptyStateSinUsuarios() {
    return $(ChatLocators.emptyStateSinUsuarios)
  }

  conversacionPorNombre(nombre: string) {
    return $(ChatLocators.conversacionPorNombre(nombre))
  }

  headerNombreUsuario(nombre: string) {
    return $(ChatLocators.headerNombreUsuario(nombre))
  }

  burbujaPorTexto(texto: string) {
    return $(ChatLocators.burbujaPorTexto(texto))
  }

  resultadoUsuarioPorNombre(nombre: string) {
    return $(ChatLocators.resultadoUsuarioPorNombre(nombre))
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

  /** Los tabs (Todas / No leídas / Solicitudes) NO reflejan su estado en el
   * árbol de accesibilidad — `selected` queda en `false` en los tres aunque
   * uno se vea resaltado. La única señal confiable de qué tab está activo es
   * el contenido de la lista, así que estos helpers solo tocan y esperan a que
   * la pantalla se estabilice. */
  async irATabNoLeidas(): Promise<void> {
    await this.waitForElement(this.tabNoLeidas)
    await this.tap(this.tabNoLeidas)
    await this.esperarListaEstable()
  }

  async irATabSolicitudes(): Promise<void> {
    await this.waitForElement(this.tabSolicitudes)
    await this.tap(this.tabSolicitudes)
    await this.esperarListaEstable()
  }

  async irATabTodas(): Promise<void> {
    await this.waitForElement(this.tabTodas)
    await this.tap(this.tabTodas)
    await this.esperarListaEstable()
  }

  /** Espera a que el tab resuelva a uno de sus dos desenlaces posibles: lista
   * con conversaciones o empty state. Sin esto, un `expect` inmediato después
   * de tocar el tab lee todavía el contenido del tab anterior. */
  private async esperarListaEstable(): Promise<void> {
    await browser.waitUntil(
      async () =>
        (await this.isVisible(this.listaConversaciones)) ||
        (await this.isVisible(this.emptyStateSinResultados)),
      {
        timeout: 15000,
        timeoutMsg:
          'La lista de conversaciones no resolvió tras cambiar de tab',
      },
    )
  }

  /** Cantidad de no leídos que el tab de la navbar prefija en su content-desc
   * ("32, Mensajes"). Devuelve 0 cuando no hay badge. */
  async contadorNoLeidosNavbar(): Promise<number> {
    if (!(await this.isVisible(this.tabMensajesConBadge))) return 0
    const desc =
      (await this.tabMensajesConBadge.getAttribute('content-desc')) ?? ''
    return parseInt(desc.split(',')[0].trim(), 10) || 0
  }

  /** Número entre paréntesis de la label del tab "Solicitudes (N)". */
  async contadorSolicitudes(): Promise<number> {
    await this.waitForElement(this.tabSolicitudes)
    const desc = (await this.tabSolicitudes.getAttribute('content-desc')) ?? ''
    const m = desc.match(/\((\d+)\)/)
    if (!m) throw new Error(`Label de Solicitudes inesperada: "${desc}"`)
    return parseInt(m[1], 10)
  }

  /** Nombres de las conversaciones visibles en la lista, leídos del
   * `content-desc` del contenedor de cada fila (formato
   * `"<nombre>, <fecha>, [Tú: , ]<último mensaje>[, <no leídos>]"`). */
  async conversacionesVisibles(): Promise<string[]> {
    const filas = await $$(
      '//android.widget.ScrollView//android.view.ViewGroup[@content-desc]',
    )
    const nombres: string[] = []
    for (const fila of filas) {
      const desc = await fila.getAttribute('content-desc')
      if (!desc?.includes(',')) continue
      const nombre = desc.split(',')[0].trim()
      if (nombre && !nombres.includes(nombre)) nombres.push(nombre)
    }
    return nombres
  }

  async abrirConversacion(nombre: string): Promise<void> {
    const fila = this.conversacionPorNombre(nombre)
    await this.waitForElement(fila, 15000)
    await this.tap(fila)
    await this.waitForElement(this.btnGoBack, 15000)
    await this.waitForElement(this.headerNombreUsuario(nombre), 15000)
  }

  /** Escribe y envía. El `send-button` arranca deshabilitado y solo se habilita
   * con texto cargado — se espera ese cambio antes de tocarlo en vez de tocar
   * a ciegas. */
  async enviarMensaje(texto: string): Promise<void> {
    await this.waitForElement(this.inputMensaje, 15000)
    await this.setValue(this.inputMensaje, texto)
    await browser.waitUntil(async () => this.btnEnviarMensaje.isEnabled(), {
      timeout: 10000,
      timeoutMsg: 'El botón de enviar nunca se habilitó con texto cargado',
    })
    await this.tap(this.btnEnviarMensaje)
  }

  async volverALaLista(): Promise<void> {
    await this.waitForElement(this.btnGoBack)
    await this.tap(this.btnGoBack)
    await this.waitForElement(this.tituloMensajes, 15000)
  }

  /** La fila de la lista NO refleja el mensaje recién enviado de inmediato: al
   * volver de la conversación queda unos segundos con el `content-desc` viejo
   * hasta que llega el refresh del backend. Leerlo de una sola vez hace flakear
   * el test (pasó en la 2ª corrida de validación), así que se poletea. */
  async esperarUltimoMensajeEnLista(
    nombre: string,
    texto: string,
  ): Promise<void> {
    const fila = this.conversacionPorNombre(nombre)
    await this.waitForElement(fila, 15000)
    await browser.waitUntil(
      async () =>
        ((await fila.getAttribute('content-desc')) ?? '').includes(texto),
      {
        timeout: 20000,
        interval: 1000,
        timeoutMsg: `La fila de "${nombre}" nunca mostró "${texto}" como último mensaje`,
      },
    )
  }

  async abrirPanelNuevoMensaje(): Promise<void> {
    await this.waitForElement(this.btnNuevo, 15000)
    await this.tap(this.btnNuevo)
    await this.waitForElement(this.tituloBuscarUsuarios, 15000)
  }

  async buscarUsuario(termino: string): Promise<void> {
    await this.waitForElement(this.inputBuscarUsuarios)
    await this.setValue(this.inputBuscarUsuarios, termino)
  }
}

export default new ChatPage()
