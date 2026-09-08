import { BasePage } from '../BasePage'
import { FeedLocators } from '../../locators/feed.locators'

class FeedPage extends BasePage {
  get btnCrear() {
    return $(FeedLocators.btnCrear)
  }
  get btnSeleccionarImagen() {
    return $(FeedLocators.btnSeleccionarImagen)
  }
  get imgGaleriaItem() {
    return $(FeedLocators.imgGaleriaItem)
  }
  get btnCambiarImagen() {
    return $(FeedLocators.btnCambiarImagen)
  }
  get btnCortarImagen() {
    return $(FeedLocators.btnCortarImagen)
  }
  get inputTexto() {
    return $(FeedLocators.inputTexto)
  }
  get btnSiguiente() {
    return $(FeedLocators.btnSiguiente)
  }
  get btnPublicar() {
    return $(FeedLocators.btnPublicar)
  }
  get toastExito() {
    return $(FeedLocators.toastExito)
  }
  get inputComentario() {
    return $(FeedLocators.inputComentario)
  }
  get btnEnviarComentario() {
    return $(FeedLocators.btnEnviarComentario)
  }
  get btnVerMas() {
    return $(FeedLocators.btnVerMas)
  }
  get repostEditor() {
    return $(FeedLocators.repostEditor)
  }
  get btnRepostearSubmit() {
    return $(FeedLocators.btnRepostearSubmit)
  }
  get btnFiltro() {
    return $(FeedLocators.btnFiltro)
  }
  get btnAplicarFiltros() {
    return $(FeedLocators.btnAplicarFiltros)
  }
  get btnLimpiarFiltros() {
    return $(FeedLocators.btnLimpiarFiltros)
  }

  postEnFeed(texto: string) {
    return $(`//android.widget.TextView[@text="${texto}"]`)
  }

  btnReaccionarDePost(texto: string) {
    return $(FeedLocators.btnReaccionarPostByText(texto))
  }

  btnComentarDePost(texto: string) {
    return $(FeedLocators.btnComentarPostByText(texto))
  }

  btnRepostearDePost(texto: string) {
    return $(FeedLocators.btnRepostearPostByText(texto))
  }

  btnCompartirDePost(texto: string) {
    return $(FeedLocators.btnCompartirPostByText(texto))
  }

  contadorLikesDePost(texto: string) {
    return $(FeedLocators.contadorLikesPostByText(texto))
  }

  btnGuardarDeRepost(texto: string) {
    return $(FeedLocators.btnGuardarRepostByText(texto))
  }

  chipFiltro(label: string) {
    return $(FeedLocators.chipFiltro(label))
  }

  async waitForScreenReady(): Promise<void> {
    await this.waitForElement(this.btnCrear, 30000)
  }

  async abrirCreacionPost(): Promise<void> {
    await this.tap(this.btnCrear)
  }

  async crearPost(texto: string): Promise<void> {
    await this.waitForElement(this.btnSeleccionarImagen, 15000)
    await this.tap(this.btnSeleccionarImagen)
    await this.waitForElement(this.imgGaleriaItem, 10000)
    await this.tap(this.imgGaleriaItem)
    // El picker de imágenes puede pedir confirmar el recorte antes de volver al form.
    const apareceCortar = await this.btnCortarImagen
      .waitForDisplayed({ timeout: 4000 })
      .catch(() => false)
    if (apareceCortar) {
      await this.tap(this.btnCortarImagen)
    }
    await this.waitForElement(this.btnCambiarImagen, 10000)
    await this.scrollDown()
    await this.waitForElement(this.inputTexto, 10000)
    await this.setValue(this.inputTexto, texto)
    await this.tap(this.btnSiguiente)
    await this.waitForElement(this.btnPublicar, 10000)
    await this.tap(this.btnPublicar)
  }

  async refrescarFeed(): Promise<void> {
    await this.scrollUp()
  }

  async esperarPostVisible(texto: string, timeout = 30000): Promise<void> {
    const post = this.postEnFeed(texto)
    // No alcanza con que el texto tenga algún píxel visible: la fila de acciones
    // (like/comentar/repostear/compartir) queda ~300px debajo del texto dentro de
    // la card, así que se exige un margen para que quede realmente interactuable.
    const margenFilaAcciones = 350
    const visibleConMargen = async (): Promise<boolean> => {
      if (!(await post.isDisplayed().catch(() => false))) return false
      const loc = await post.getLocation().catch(() => null)
      if (!loc) return false
      const { height } = await driver.getWindowSize()
      return loc.y <= height - margenFilaAcciones
    }

    if (await visibleConMargen()) return

    // Nota: `UiScrollable(...).scrollIntoView(...)` hace un salto que confunde el
    // tracking de scroll de la lista de React Native y termina reseteándola al
    // tope unos segundos después. Se usan swipes incrementales (igual que hace un
    // dedo real) en su lugar, que sí mantienen la posición.
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await visibleConMargen()) return
      await this.scrollDown()
    }
    throw new Error(
      `El post "${texto}" no apareció en el feed después de ${timeout}ms`,
    )
  }

  async reaccionarPost(textoPost: string): Promise<void> {
    const btn = this.btnReaccionarDePost(textoPost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
  }

  async comentarPost(textoPost: string, comentario: string): Promise<void> {
    const btn = this.btnComentarDePost(textoPost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
    await this.waitForElement(this.inputComentario, 10000)
    await this.setValue(this.inputComentario, comentario)
    await this.tap(this.btnEnviarComentario)
  }

  async expandirVerMas(): Promise<void> {
    await this.waitForElement(this.btnVerMas, 15000)
    await this.tap(this.btnVerMas)
  }

  async compartirPost(textoPost: string): Promise<void> {
    const btn = this.btnCompartirDePost(textoPost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
  }

  async abrirRepostModal(textoPost: string): Promise<void> {
    // El feed puede re-scrollear al tope solo (ej. refresco periódico), así que
    // se re-ubica el post justo antes de tocar el botón en vez de confiar en un
    // scroll hecho varios pasos antes.
    await this.esperarPostVisible(textoPost)
    const btn = this.btnRepostearDePost(textoPost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
    await this.waitForElement(this.btnRepostearSubmit, 10000)
  }

  async escribirTextoRepost(texto: string): Promise<void> {
    await this.setValue(this.repostEditor, texto)
  }

  async repostear(textoPost: string, textoRepost: string): Promise<void> {
    await this.abrirRepostModal(textoPost)
    await this.escribirTextoRepost(textoRepost)
    await this.tap(this.btnRepostearSubmit)
  }

  async leerContadorLikes(texto: string): Promise<number> {
    const valor = await this.contadorLikesDePost(texto).getText()
    return parseInt(valor.trim() || '0', 10)
  }

  async toggleGuardarRepost(textoRepost: string): Promise<void> {
    const btn = this.btnGuardarDeRepost(textoRepost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
  }

  async abrirFiltros(): Promise<void> {
    // El ícono de filtro vive en el header, que scrollea junto con el feed (no es
    // fijo) — si un test anterior dejó el feed scrolleado, hay que volver arriba.
    for (let i = 0; i < 5; i++) {
      if (await this.btnFiltro.isDisplayed().catch(() => false)) break
      await this.scrollUp()
    }
    await this.waitForElement(this.btnFiltro, 15000)
    await this.tap(this.btnFiltro)
    await this.waitForElement(this.btnAplicarFiltros, 10000)
  }

  async aplicarFiltro(label: string): Promise<void> {
    await this.abrirFiltros()
    await this.tap(this.chipFiltro(label))
    await this.tap(this.btnAplicarFiltros)
  }

  async limpiarFiltros(): Promise<void> {
    await this.waitForElement(this.btnLimpiarFiltros, 10000)
    await this.tap(this.btnLimpiarFiltros)
  }
}

export default new FeedPage()
