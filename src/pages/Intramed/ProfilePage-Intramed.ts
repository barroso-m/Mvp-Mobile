import { BasePage } from '../BasePage'
import { FeedLocators } from '../../locators/feed.locators'
import { webPage } from '../../locators/webPage.locators'
import { ProfileLocators } from '../../locators/profile.locators'
import SideMenuPage from './SideMenuPage-Intramed'

/** Alto del bottom nav fijo del emulador (items en y=1684..1826 sobre una
 * pantalla de 1920). Se usa para no tocar elementos que quedan debajo. */
const ALTO_BOTTOM_NAV = 236

class ProfilePage extends BasePage {
  get btnPerfil() {
    return $(FeedLocators.btnPerfil)
  }
  get btnConfiguracion() {
    return $(FeedLocators.btnConfiguracion)
  }
  get btnEliminarCuenta() {
    return $(FeedLocators.btnEliminarCuenta)
  }

  get inputUsernameWeb() {
    return $(webPage.inputUsername)
  }
  get inputPasswordWeb() {
    return $(webPage.inputPassword)
  }
  get btnLoginWeb() {
    return $(webPage.loginButton)
  }
  get tituloGestionCuenta() {
    return $(ProfileLocators.tituloGestionCuenta)
  }
  get btnEliminarCuentaWeb() {
    return $(webPage.btnEliminarCuenta)
  }
  get btnEliminarCuentaNative() {
    return $(ProfileLocators.btnEliminarCuentaNative)
  }

  get seccionSobreMi() {
    return $(ProfileLocators.seccionSobreMi)
  }
  get lapizSobreMi() {
    return $(ProfileLocators.lapizSobreMi)
  }
  get inputSobreMi() {
    return $(ProfileLocators.inputSobreMi)
  }
  get btnGuardarSobreMi() {
    return $(ProfileLocators.btnGuardarSobreMi)
  }
  get btnVolverSobreMi() {
    return $(ProfileLocators.btnVolverSobreMi)
  }

  get tituloConfiguracion() {
    return $(ProfileLocators.tituloConfiguracion)
  }
  get itemCuenta() {
    return $(ProfileLocators.itemCuenta)
  }
  get itemInicioSesionSeguridad() {
    return $(ProfileLocators.itemInicioSesionSeguridad)
  }
  get itemNewsletter() {
    return $(ProfileLocators.itemNewsletter)
  }
  get itemNotificaciones() {
    return $(ProfileLocators.itemNotificaciones)
  }
  get itemDatosPersonalesNested() {
    return $(ProfileLocators.itemDatosPersonalesNested)
  }
  get itemDatosProfesionalesNested() {
    return $(ProfileLocators.itemDatosProfesionalesNested)
  }
  get itemGestionCuenta() {
    return $(ProfileLocators.itemGestionCuenta)
  }
  get itemEliminarCuenta() {
    return this.btnEliminarCuentaNative
  }

  get tituloDatosPersonales() {
    return $(ProfileLocators.tituloDatosPersonales)
  }
  get tituloDatosProfesionales() {
    return $(ProfileLocators.tituloDatosProfesionales)
  }
  get inputTelefonoNumero() {
    return $(ProfileLocators.inputTelefonoNumero)
  }
  get msgErrorTelefono() {
    return $(ProfileLocators.msgErrorTelefono)
  }
  get switchPushDispositivo() {
    return $(ProfileLocators.switchPushDispositivo)
  }
  get switchEnLaAplicacion() {
    return $(ProfileLocators.switchEnLaAplicacion)
  }
  get btnGuardarCambios() {
    return $(ProfileLocators.btnGuardarCambios)
  }
  get toastCambiosGuardados() {
    return $(ProfileLocators.toastCambiosGuardados)
  }

  get btnVerMasActividad() {
    return $(ProfileLocators.btnVerMasActividad)
  }
  get tituloInfoProfesional() {
    return $(ProfileLocators.tituloInfoProfesional)
  }
  get btnComenzarSeccionProfesional() {
    return $(ProfileLocators.btnComenzarSeccionProfesional)
  }
  get headingAgregarSeccion() {
    return $(ProfileLocators.headingAgregarSeccion)
  }
  get headingOrdenarSecciones() {
    return $(ProfileLocators.headingOrdenarSecciones)
  }

  get headingAgregarEducacion() {
    return $(ProfileLocators.headingAgregarEducacion)
  }
  get dropdownNivelEducacion() {
    return $(ProfileLocators.dropdownNivelEducacion)
  }
  get inputNombreInstitucion() {
    return $(ProfileLocators.inputNombreInstitucion)
  }
  get inputTituloObtenido() {
    return $(ProfileLocators.inputTituloObtenido)
  }
  get inputDescripcionEducacion() {
    return $(ProfileLocators.inputDescripcionEducacion)
  }
  get dropdownPaisEducacion() {
    return $(ProfileLocators.dropdownPaisEducacion)
  }
  get dropdownProvinciaEducacion() {
    return $(ProfileLocators.dropdownProvinciaEducacion)
  }
  get dropdownCiudadEducacion() {
    return $(ProfileLocators.dropdownCiudadEducacion)
  }
  get inputFechaInicioEducacion() {
    return $(ProfileLocators.inputFechaInicioEducacion)
  }
  get checkboxActualmenteEstudiando() {
    return $(ProfileLocators.checkboxActualmenteEstudiando)
  }
  get btnAgregarEducacionSubmit() {
    return $(ProfileLocators.btnAgregarEducacionSubmit)
  }
  get btnEliminarEducacion() {
    return $(ProfileLocators.btnEliminarEducacion)
  }

  get tituloGuardados() {
    return $(ProfileLocators.tituloGuardados)
  }

  textoSobreMiPor(texto: string) {
    return $(ProfileLocators.textoSobreMiPor(texto))
  }

  opcionSeccion(nombre: string) {
    return $(ProfileLocators.opcionSeccion(nombre))
  }

  filtroActividad(label: string) {
    return $(ProfileLocators.filtroActividad(label))
  }

  switchNewsletterPorTitulo(titulo: string) {
    return $(ProfileLocators.switchNewsletterPorTitulo(titulo))
  }

  filaNotificacion(titulo: string) {
    return $(ProfileLocators.filaNotificacion(titulo))
  }

  opcionListaPicker(valor: string) {
    return $(ProfileLocators.opcionListaPicker(valor))
  }

  async irAEliminarCuenta(): Promise<void> {
    await this.waitForElement(this.btnPerfil)
    await this.tap(this.btnPerfil)
    await this.waitForElement(this.btnConfiguracion)
    await this.tap(this.btnConfiguracion)
    await this.waitForElement(this.btnEliminarCuenta)
    await this.tap(this.btnEliminarCuenta)
  }

  async loginWebSiEsNecesario(email: string, password: string): Promise<void> {
    await browser.waitUntil(
      async () => {
        if (await this.isVisible(this.inputUsernameWeb)) return true
        if (await this.isVisible(this.tituloGestionCuenta)) return true
        await browser.getPageSource().catch(() => {})
        return false
      },
      {
        timeout: 60000,
        interval: 1000,
        timeoutMsg:
          'La web no mostró ni el login ni "Gestión de cuenta" después de 60s',
      },
    )

    if (await this.isVisible(this.inputUsernameWeb)) {
      await this.setValue(this.inputUsernameWeb, email)
      await this.setValue(this.inputPasswordWeb, password)
      await this.tap(this.btnLoginWeb)
    }
  }

  /** Configuración de usuario > Cuenta > Gestión de cuenta. Pantalla 100% nativa
   * ahora (dejó de redirigir a la web). Solo valida, nunca tocar "Eliminar". */
  async irAGestionCuentaNativa(): Promise<void> {
    await SideMenuPage.irAConfiguracion()
    await this.waitForElement(this.itemCuenta)
    await this.tap(this.itemCuenta)
    await this.waitForElement(this.itemGestionCuenta)
    await this.tap(this.itemGestionCuenta)
  }

  // Idempotente: actualizarTelefono/ingresarTelefonoInvalido la llaman de
  // nuevo para volver a Datos personales después de guardar, y ese segundo
  // llamado puede ejecutarse ya parado en Datos personales o en Cuenta. Si se
  // repitiera la navegación completa desde cero (SideMenuPage.irAConfiguracion,
  // que abre el menú lateral tocando el avatar) el tap cae en cualquier Button
  // de la pantalla en la que ya estemos (ej. el "Go back" del header), no en
  // el avatar — rompe la navegación en vez de repetirla.
  async irADatosPersonales(): Promise<void> {
    // El heading "Datos personales" solo es visible con el form scrolleado
    // arriba del todo — actualizarTelefono() deja la pantalla scrolleada
    // hasta Teléfono, así que también hace falta chequear ese campo para no
    // creer erróneamente que no estamos ya en la pantalla.
    const yaEnDatosPersonales =
      (await this.isVisible(this.tituloDatosPersonales)) ||
      (await this.isVisible(this.inputTelefonoNumero))
    if (yaEnDatosPersonales) return

    const enCuenta = await this.isVisible(this.itemDatosPersonalesNested)
    if (!enCuenta) {
      await SideMenuPage.irAConfiguracion()
      await this.waitForElement(this.itemCuenta)
      await this.tap(this.itemCuenta)
    }
    await this.waitForElement(this.itemDatosPersonalesNested)
    await this.tap(this.itemDatosPersonalesNested)
    await this.waitForElement(this.tituloDatosPersonales)
  }

  async irADatosProfesionales(): Promise<void> {
    await SideMenuPage.irAConfiguracion()
    await this.waitForElement(this.itemCuenta)
    await this.tap(this.itemCuenta)
    await this.waitForElement(this.itemDatosProfesionalesNested)
    await this.tap(this.itemDatosProfesionalesNested)
    await this.waitForElement(this.tituloDatosProfesionales)
  }

  async irANewsletter(): Promise<void> {
    await SideMenuPage.irAConfiguracion()
    await this.waitForElement(this.itemNewsletter)
    await this.tap(this.itemNewsletter)
  }

  async irANotificaciones(): Promise<void> {
    await SideMenuPage.irAConfiguracion()
    await this.waitForElement(this.itemNotificaciones)
    await this.tap(this.itemNotificaciones)
  }

  async editarSobreMi(texto: string): Promise<void> {
    await this.waitForElement(this.lapizSobreMi, 15000)
    await this.tap(this.lapizSobreMi)
    await this.waitForElement(this.inputSobreMi, 10000)
    await this.setValue(this.inputSobreMi, texto)
    await this.tap(this.btnGuardarSobreMi)
  }

  /** Escribe en "Sobre mí" y vuelve con la flecha del header (no guarda). */
  async cancelarEdicionSobreMi(texto: string): Promise<void> {
    await this.waitForElement(this.lapizSobreMi, 15000)
    await this.tap(this.lapizSobreMi)
    await this.waitForElement(this.inputSobreMi, 10000)
    await this.setValue(this.inputSobreMi, texto)
    await this.tap(this.btnVolverSobreMi)
  }

  // "Teléfono" está bastante más abajo de lo que parece a simple vista:
  // Trato/Nombre/Apellido/Tipo de doc./Número/Género/Fecha de nacimiento/
  // Idioma/País/Provincia/Ciudad vienen todos antes. Con scrollDownSmall()
  // solo (pensado para distancias cortas) hacen falta más pasos de los que
  // alcanza a dar de forma confiable — usar el scroll grande primero para
  // cubrir la distancia y afinar con scrolls chicos al final.
  async scrollHastaTelefono(): Promise<void> {
    for (
      let i = 0;
      i < 6 && !(await this.isVisible(this.inputTelefonoNumero));
      i++
    ) {
      await this.scrollDown()
    }
    for (
      let i = 0;
      i < 6 && !(await this.isVisible(this.inputTelefonoNumero));
      i++
    ) {
      await this.scrollDownSmall()
    }
  }

  // Cuando esta pantalla ya estaba abierta (ej. la llamada inmediatamente
  // siguiente para "restaurar" el teléfono), a veces el re-render deja
  // stale la referencia recién resuelta y clearValue()/setValue() fallan con
  // "element wasn't found" aunque el campo siga en pantalla. `obtenerElemento`
  // se llama de nuevo en cada intento para forzar una búsqueda fresca (no
  // alcanza con reintentar sobre la misma referencia ya resuelta).
  private async setValueConReintento(
    obtenerElemento: () => ReturnType<typeof $>,
    valor: string,
  ): Promise<void> {
    const intentos = 3
    for (let i = 0; i < intentos; i++) {
      try {
        await this.waitForElement(obtenerElemento(), 10000)
        await this.setValue(obtenerElemento(), valor)
        return
      } catch (err) {
        if (i === intentos - 1) throw err
        await driver.pause(800)
      }
    }
  }

  async actualizarTelefono(numero: string): Promise<void> {
    await this.irADatosPersonales()
    await this.scrollHastaTelefono()
    await this.setValueConReintento(() => this.inputTelefonoNumero, numero)
    // El teclado queda abierto tras el setValue y tapa el campo — hace que
    // scrollHastaTelefono() de la próxima llamada (ej. "Restaurar teléfono
    // original") lo crea no visible y siga scrolleando de más.
    await driver.hideKeyboard().catch(() => {})
    await this.waitForElement(this.btnGuardarCambios, 5000)
    await this.tap(this.btnGuardarCambios)
    // Tras guardar, la app navega sola de vuelta a "Cuenta" — pero con
    // latencia variable. Si el siguiente paso (ej. "Restaurar teléfono
    // original") arranca antes de que esa navegación termine, la agarra a
    // mitad de camino y ninguna búsqueda de elemento encuentra nada estable.
    // Esperar acá a que asiente evita esa carrera.
    await this.waitForElement(this.itemDatosPersonalesNested, 8000).catch(
      () => {},
    )
  }

  async ingresarTelefonoInvalido(texto: string): Promise<void> {
    await this.irADatosPersonales()
    await this.scrollHastaTelefono()
    await this.setValueConReintento(() => this.inputTelefonoNumero, texto)
    await driver.hideKeyboard().catch(() => {})
    await this.waitForElement(this.btnGuardarCambios, 5000)
    await this.tap(this.btnGuardarCambios)
  }

  async toggleNewsletter(titulo: string): Promise<void> {
    const el = this.switchNewsletterPorTitulo(titulo)
    await this.waitForElement(el, 10000)
    await this.tap(el)
  }

  async expandirFilaNotificacion(titulo: string): Promise<void> {
    const el = this.filaNotificacion(titulo)
    await this.waitForElement(el, 10000)
    await this.tap(el)
  }

  entradaActividad(prefijo: string) {
    return $(ProfileLocators.entradaActividadPorPrefijo(prefijo))
  }

  /**
   * Abre el detalle de un post propio desde "Mi actividad reciente".
   *
   * Es el camino confiable para llegar a un post propio: el feed de Inicio es
   * algorítmico y un post recién publicado deja de aparecer ahí apenas el feed
   * se refresca (comprobado el 2026-09-15 barriendo 20 pantallas desde el tope
   * sin encontrar ninguno de los 3 posts de la corrida).
   */
  async abrirPostDeActividad(prefijo: string): Promise<void> {
    const entrada = this.entradaActividad(prefijo)
    for (let i = 0; i < 8; i++) {
      if (await this.isVisible(entrada)) break
      await this.scrollDown()
    }
    await this.waitForElement(entrada, 15000)
    await this.tap(entrada)
  }

  async abrirVerMasActividad(): Promise<void> {
    // "Ver más actividad" está debajo del fold inicial del perfil (requiere
    // scroll para que UiAutomator2 lo considere "displayed"). Cuántos scrolls
    // hacen falta depende de cuánta actividad tenga la cuenta, así que se
    // itera en vez de asumir uno solo.
    for (
      let i = 0;
      i < 5 && !(await this.isVisible(this.btnVerMasActividad));
      i++
    ) {
      await this.scrollDown()
    }
    await this.waitForElement(this.btnVerMasActividad, 15000)
    await this.tapCuandoQuieto(this.btnVerMasActividad)
    // El page object confirma que se llegó: si no, el test falla en su primer
    // filtro y parece un problema de los chips cuando en realidad no navegó.
    await this.waitForElement(this.filtroActividad('Todas'), 15000)
  }

  async aplicarFiltroActividad(label: string): Promise<void> {
    const el = this.filtroActividad(label)
    await this.waitForElement(el, 10000)
    await this.tap(el)
  }

  /** El único punto de entrada real a "Agregar una sección" (educación,
   * experiencia, etc.) es el CTA "Comenzar" de la tarjeta vacía de
   * "información profesional", debajo de Instituciones. Solo está visible sin
   * scroll adicional si aún no se cargó ninguna sección. */
  async abrirAgregarSeccion(): Promise<void> {
    // "Comenzar" está bastante más abajo que "Ver más actividad" — puede
    // necesitar varios scrolls, no alcanza con uno solo.
    // Se scrollea hasta el TÍTULO de la tarjeta, no hasta el botón: pasarse de
    // largo hace que la tarjeta se virtualice y el locator del botón resuelva al
    // otro "Comenzar" de la pantalla, el que abre "Crear publicación".
    for (
      let i = 0;
      i < 8 && !(await this.isVisible(this.tituloInfoProfesional));
      i++
    ) {
      await this.scrollDown()
    }
    await this.waitForElement(this.tituloInfoProfesional, 15000)
    await this.waitForElement(this.btnComenzarSeccionProfesional, 15000)

    // Con el título recién visible, "Comenzar" queda al fondo, CORTADO por el
    // bottom nav fijo. UiAutomator2 lo da por "displayed" porque asoma, pero su
    // centro —que es donde cae el tap— está tapado por la barra: el tap se lo
    // come el nav y no pasa nada. El test fallaba después, al esperar el modal,
    // pareciendo un problema del modal (2026-09-16).
    //
    // Se lo termina de subir con scrolls finos hasta que entre entero por
    // encima de la barra.
    const { height: altoPantalla } = await driver.getWindowSize()
    const topeDelNav = altoPantalla - ALTO_BOTTOM_NAV
    for (let i = 0; i < 6; i++) {
      const pos = await this.btnComenzarSeccionProfesional
        .getLocation()
        .catch(() => null)
      const tam = await this.btnComenzarSeccionProfesional
        .getSize()
        .catch(() => null)
      if (!pos || !tam || pos.y + tam.height <= topeDelNav) break
      await this.scrollDownSmall()
    }

    await this.tapCuandoQuieto(this.btnComenzarSeccionProfesional)
    await this.waitForElement(this.headingAgregarSeccion, 15000)
  }

  async abrirAgregarEducacion(): Promise<void> {
    await this.abrirAgregarSeccion()
    const opcion = this.opcionSeccion('Educación')
    await this.waitForElement(opcion, 10000)
    await this.tap(opcion)
    await this.waitForElement(this.headingAgregarEducacion, 10000)
  }

  /** Selecciona `valor` de una lista simple (país/provincia/ciudad/nivel): toca
   * el dropdown, espera el picker y toca la opción por texto exacto. */
  async seleccionarDeLista(
    dropdown: ReturnType<typeof $>,
    valor: string,
  ): Promise<void> {
    // Provincia/Ciudad dependen del valor elegido antes (país/provincia) —
    // recién se habilitan/renderizan después de esa selección (posiblemente
    // tras una llamada de red para poblar la lista), no alcanza con tocar
    // directo. 10s no siempre es suficiente margen (visto 2026-09-08).
    await this.waitForElement(dropdown, 15000)
    await this.tap(dropdown)
    const opcion = this.opcionListaPicker(valor)
    await this.waitForElement(opcion, 10000)
    await this.tap(opcion)
  }

  async completarEducacionMinima(datos: {
    nivel: string
    institucion: string
    titulo: string
    descripcion: string
    pais: string
    provincia: string
    ciudad: string
    fechaInicio: string
  }): Promise<void> {
    await this.seleccionarDeLista(this.dropdownNivelEducacion, datos.nivel)
    await this.setValue(this.inputNombreInstitucion, datos.institucion)
    await this.setValue(this.inputTituloObtenido, datos.titulo)
    await this.setValue(this.inputDescripcionEducacion, datos.descripcion)
    // El resto del formulario (País en adelante) queda tapado por el
    // teclado/el footer fijo "Agregar" hasta hacer scroll.
    await driver.hideKeyboard().catch(() => {})
    for (
      let i = 0;
      i < 6 && !(await this.isVisible(this.dropdownPaisEducacion));
      i++
    ) {
      await this.scrollDown()
    }
    await this.seleccionarDeLista(this.dropdownPaisEducacion, datos.pais)
    await this.seleccionarDeLista(
      this.dropdownProvinciaEducacion,
      datos.provincia,
    )
    await this.seleccionarDeLista(this.dropdownCiudadEducacion, datos.ciudad)
    await this.setValue(this.inputFechaInicioEducacion, datos.fechaInicio)
    await this.tap(this.checkboxActualmenteEstudiando)
  }

  async guardarEducacion(): Promise<void> {
    await this.tap(this.btnAgregarEducacionSubmit)
  }

  // TODO: pendiente de confirmar contra una entrada real (recién agregada por
  // TC33/TC35) qué UI queda una vez que "Educación" deja de estar vacía —
  // se asume por ahora que, como con "Instituciones", tocar la fila de la
  // entrada por su texto abre directamente su edición.
  async abrirEdicionDeEntradaEducacion(
    nombreInstitucion: string,
  ): Promise<void> {
    const fila = this.textoSobreMiPor(nombreInstitucion)
    await this.waitForElement(fila, 10000)
    await this.tap(fila)
  }

  async eliminarEducacion(): Promise<void> {
    await this.waitForElement(this.btnEliminarEducacion, 10000)
    await this.tap(this.btnEliminarEducacion)
  }
}

export default new ProfilePage()
