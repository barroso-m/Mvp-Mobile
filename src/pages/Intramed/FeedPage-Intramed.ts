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

  postEnFeed(texto: string) {
    return $(`//android.widget.TextView[@text="${texto}"]`)
  }

  btnReaccionarDePost(texto: string) {
    return $(FeedLocators.btnReaccionarPostByText(texto))
  }

  btnComentarDePost(texto: string) {
    return $(FeedLocators.btnComentarPostByText(texto))
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
    if (await post.isDisplayed().catch(() => false)) return

    const scrollSelector =
      `new UiScrollable(new UiSelector().scrollable(true).instance(0))` +
      `.setAsVerticalList()` +
      `.scrollIntoView(new UiSelector().text("${texto}"))`
    try {
      await $(`android=${scrollSelector}`).waitForDisplayed({ timeout })
    } catch {
      throw new Error(
        `El post "${texto}" no apareció en el feed después de ${timeout}ms`,
      )
    }
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
}

export default new FeedPage()
