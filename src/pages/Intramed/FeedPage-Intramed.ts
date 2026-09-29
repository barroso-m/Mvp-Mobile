import { BasePage, type WdioElement } from '../BasePage'
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

  get btnEliminarPost() {
    return $(FeedLocators.btnEliminarPost)
  }

  get btnConfirmarEliminarPost() {
    return $(FeedLocators.btnConfirmarEliminarPost)
  }

  postEnFeedPorPrefijo(prefijo: string) {
    return $(FeedLocators.postPorPrefijo(prefijo))
  }

  btnVerMasDePost(texto: string) {
    return $(FeedLocators.btnVerMasDePostByText(texto))
  }

  btnMenuDePost(texto: string) {
    return $(FeedLocators.btnMenuPostByText(texto))
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

  /**
   * Espera a que el composer vuelva con la imagen ya adjuntada, usando
   * "Cambiar imagen" como señal. Absorbe los tres tropiezos del flujo del
   * picker, que no ocurren siempre ni en el mismo orden:
   *
   * 1. Entre elegir la foto y volver al composer puede meterse la pantalla de
   *    recorte ("CORTAR"). Tarda distinto según la carga del emulador: con una
   *    espera fija de 4s a veces se la perdía y el resto del flujo terminaba
   *    scrolleando DENTRO del recorte hasta timeoutear.
   * 2. En el APK 2026-09-06 "Cambiar imagen" nace DEBAJO del pliegue (la
   *    sección pasó a ser "Imagen o video", con línea extra de ayuda y preview
   *    de lo seleccionado). Esperarlo sin scrollear timeoutea con el elemento
   *    ya en el árbol pero no `displayed`.
   * 3. La franja que usa `scrollDown()` (top 800, alto 600) cae justo sobre el
   *    editor de Descripción, le da foco y abre el teclado, que vuelve a tapar
   *    la sección de imagen. Por eso baja el teclado en cada vuelta.
   */
  private async volverAlComposerConImagen(): Promise<void> {
    await browser.waitUntil(
      async () => {
        if (await this.isVisible(this.btnCortarImagen)) {
          await this.tap(this.btnCortarImagen)
          return false
        }
        await driver.hideKeyboard().catch(() => {})
        if (await this.isVisible(this.btnCambiarImagen)) return true
        await this.scrollDown()
        return false
      },
      {
        timeout: 40000,
        interval: 500,
        timeoutMsg:
          'El composer nunca volvió con la imagen adjuntada ("Cambiar imagen" no quedó visible)',
      },
    )
  }

  async crearPost(texto: string): Promise<void> {
    await this.waitForElement(this.btnSeleccionarImagen, 15000)
    await this.tap(this.btnSeleccionarImagen)
    await this.waitForElement(this.imgGaleriaItem, 10000)
    await this.tap(this.imgGaleriaItem)
    await this.volverAlComposerConImagen()
    await this.waitForElement(this.inputTexto, 10000)
    await this.setValue(this.inputTexto, texto)
    // Escribir deja el teclado abierto sobre el footer fijo: el tap en
    // "Siguiente" se lo come el teclado y el form no avanza de paso (se veía
    // como "~Publicar no aparece", con el composer todavía en el paso 1).
    await driver.hideKeyboard().catch(() => {})
    await this.tap(this.btnSiguiente)
    await this.waitForElement(this.btnPublicar, 10000)
    await this.tap(this.btnPublicar)
  }

  async refrescarFeed(): Promise<void> {
    await this.scrollUp()
  }

  async esperarPostVisible(texto: string, timeout = 30000): Promise<void> {
    await this.scrollHastaPostVisible(this.postEnFeed(texto), texto, timeout)
  }

  /**
   * Igual que `esperarPostVisible` pero anclando por prefijo. Un post largo
   * llega truncado al feed, así que su TextView nunca va a matchear por
   * igualdad con el texto que se publicó.
   */
  async esperarPostVisiblePorPrefijo(
    prefijo: string,
    timeout = 30000,
  ): Promise<void> {
    await this.scrollHastaPostVisible(
      this.postEnFeedPorPrefijo(prefijo),
      prefijo,
      timeout,
    )
  }

  private async scrollHastaPostVisible(
    post: WdioElement,
    descripcion: string,
    timeout: number,
  ): Promise<void> {
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
      `El post "${descripcion}" no apareció en el feed después de ${timeout}ms`,
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
    // `setValue` hace `clearValue` primero, y eso deja el campo con
    // focused="false": el botón de enviar del modal solo se renderiza con el
    // input enfocado, así que hay que volver a tocarlo después de escribir.
    await this.tap(this.inputComentario)
    await this.setValue(this.inputComentario, comentario)
    await this.tap(this.inputComentario)
    await this.tap(this.btnEnviarComentario)
  }

  async expandirVerMasDePost(textoPost: string): Promise<void> {
    const btn = this.btnVerMasDePost(textoPost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
  }

  async compartirPost(textoPost: string): Promise<void> {
    const btn = this.btnCompartirDePost(textoPost)
    await this.waitForElement(btn, 15000)
    await this.tap(btn)
  }

  /**
   * Borra un post propio. La app no expone el borrado en ningún gesto obvio: no
   * hay menú en la fila de acciones, el post no abre detalle al tocarlo y el
   * long-press no hace nada. Está detrás del "..." del header, que no tiene ni
   * texto ni content-desc (ver `btnMenuPostByText`), y abre un bottom sheet
   * "Editar / Eliminar" + un AlertDialog de confirmación.
   *
   * Requiere que la card del post YA esté en pantalla — sirve igual en el feed
   * que en el detalle del post, porque la card es la misma. Ancla por prefijo
   * para poder borrar también los posts largos, que llegan truncados.
   */
  async eliminarPostVisible(prefijoPost: string): Promise<void> {
    const menu = this.btnMenuDePost(prefijoPost)
    await this.waitForElement(menu, 15000)
    await this.tap(menu)
    await this.waitForElement(this.btnEliminarPost, 10000)
    await this.tap(this.btnEliminarPost)
    await this.waitForElement(this.btnConfirmarEliminarPost, 10000)
    await this.tap(this.btnConfirmarEliminarPost)
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
