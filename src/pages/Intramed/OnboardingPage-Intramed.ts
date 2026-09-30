import { BasePage } from '../BasePage'
import { OnboardingLocators } from '../../locators/onboarding.locators'

export interface DatosPersonales {
  trato: string
  nombre: string
  apellido: string
  email: string
  fechaNacimiento: string
  tipoDocumento: string
  nroDocumento: string
}

export interface DatosContacto {
  pais: string
  provincia: string
  ciudad: string
}

export interface DatosProfesionales {
  ocupacion: string
  carrera: string
  especialidad: string
  subespecialidad: string
  tipoIdentidad: string
  nroMatricula: string
}

/**
 * Wizard de registro de IntraMed mobile.
 *
 * Es NATIVO, no un webview del signup web (relevado 2026-09-29: el package
 * sigue siendo `com.intramed.core.staging` y el único contexto es NATIVE_APP).
 * Por eso no se reusan los selectores CSS del `OnboardingPage` de web.
 *
 * Diferencias contra el wizard web, relevadas en `recon/onb-*`:
 * - El checkbox de términos está en el paso 1, no en el de contraseña.
 * - No hay campo "Género" en el paso 1; sí hay "Fecha de nacimiento".
 * - El paso 2 (contraseña) es la única pantalla de la app con `resource-id`
 *   propios (`passwordInput`, `confirmInput`).
 */
class OnboardingPage extends BasePage {
  private get loc() {
    return OnboardingLocators
  }

  get tituloCrearCuenta() {
    return $(this.loc.tituloCrearCuenta)
  }
  get tituloCrearPassword() {
    return $(this.loc.tituloCrearPassword)
  }
  get inputEmail() {
    return $(this.loc.inputEmail)
  }
  get inputPassword() {
    return $(this.loc.inputPassword)
  }
  get inputPasswordConfirm() {
    return $(this.loc.inputPasswordConfirm)
  }
  get requisitosPassword() {
    return $(this.loc.requisitosPassword)
  }
  get chkTerminos() {
    return $(this.loc.chkTerminos)
  }
  get btnSiguiente() {
    return $(this.loc.btnSiguiente)
  }
  get btnGoBack() {
    return $(this.loc.btnGoBack)
  }
  get linkYaRegistrado() {
    return $(this.loc.linkYaRegistrado)
  }
  get sheetYaRegistradoTitulo() {
    return $(this.loc.sheetYaRegistradoTitulo)
  }
  get sheetYaRegistradoMensaje() {
    return $(this.loc.sheetYaRegistradoMensaje)
  }
  get btnRecuperarPassword() {
    return $(this.loc.btnRecuperarPassword)
  }
  get btnCancelarYaRegistrado() {
    return $(this.loc.btnCancelarYaRegistrado)
  }

  get msgCodigoEnviado() {
    return $(this.loc.msgCodigoEnviado)
  }
  get msgEmailVerificado() {
    return $(this.loc.msgEmailVerificado)
  }
  get tituloContacto() {
    return $(this.loc.tituloContacto)
  }
  get tituloProfesional() {
    return $(this.loc.tituloProfesional)
  }
  get tituloComoConocio() {
    return $(this.loc.tituloComoConocio)
  }
  get btnContinuar() {
    return $(this.loc.btnContinuar)
  }
  get btnSaltear() {
    return $(this.loc.btnSaltear)
  }
  get tabInicio() {
    return $(this.loc.tabInicio)
  }
  get tabCampus() {
    return $(this.loc.tabCampus)
  }

  /** Abre el wizard desde la pantalla inicial de la app. */
  async abrirRegistro(): Promise<void> {
    await this.waitForElement($(this.loc.btnRegistrarse), 60000)
    await this.tap($(this.loc.btnRegistrarse))
    await this.waitForElement(this.tituloCrearCuenta, 30000)
  }

  async waitForScreenReady(): Promise<void> {
    await this.waitForElement(this.tituloCrearCuenta, 30000)
  }

  /**
   * Trae un campo al viewport buscando SOLO hacia abajo.
   *
   * El formulario es más alto que la pantalla y los campos se completan en
   * orden, así que alcanza con avanzar. Buscar en las dos direcciones —o
   * volver al tope antes de cada campo— deja el scroll pasado de largo y los
   * campos siguientes fuera de alcance: así se perdieron "Fecha de nacimiento"
   * y el botón "Siguiente" durante el relevamiento.
   */
  /**
   * Devuelve el formulario al tope. El llenado avanza en un solo sentido, así
   * que cualquier consulta previa que haya scrolleado (por ejemplo mirar si
   * "Siguiente" está habilitado) deja los primeros campos arriba del viewport
   * y fuera de alcance.
   */
  /**
   * Vuelve al tope del formulario del paso indicado.
   *
   * Recibe el título de ESE paso a propósito. Chequear varios títulos "por si
   * acaso" significa una búsqueda XPath que NO matchea por cada uno, y un
   * findElement negativo obliga a UiAutomator2 a recorrer el árbol entero: con
   * 8 vueltas de loop eso son 16 barridos completos, que es exactamente lo que
   * mataba la instrumentación en el paso de formación profesional (mismo
   * patrón que documenta PENDIENTES.md para el feed).
   */
  async irAlTopeDelFormulario(
    selectorTitulo: string = this.loc.tituloCrearCuenta,
  ): Promise<void> {
    for (let i = 0; i < 8; i++) {
      // Corte temprano: el título es lo primero del formulario. Sin esto se
      // pagaban los 8 scrolls incluso estando ya arriba, y entre los 7 campos
      // del paso 1 eso solo alcanzaba para pasarse del timeout de mocha.
      if (await this.isVisible($(selectorTitulo))) return
      await this.scrollFormulario('up', 0.9)
    }
  }

  /**
   * Scroll del formulario del wizard.
   *
   * No se usan `scrollDown`/`scrollDownSmall` de BasePage: su franja de
   * 400x600 en (100,800) no engancha el ScrollView de este wizard — con el
   * teclado recién cerrado el gesto no movía la pantalla NI UN PIXEL y los 10
   * intentos de `scrollHastaCampo` terminaban en "no se pudo traer al
   * viewport" con el formulario todavía en el tope (TC49, 2026-09-29).
   * Esta franja de 800x1000 es la que se validó durante el relevamiento.
   */
  private async scrollFormulario(
    direction: 'up' | 'down',
    percent = 0.4,
  ): Promise<void> {
    await driver
      .execute('mobile: scrollGesture', {
        left: 100,
        top: 600,
        width: 800,
        height: 1000,
        direction,
        percent,
      })
      .catch(() => {})
    await driver.pause(300)
  }

  private async scrollHastaCampo(selector: string): Promise<void> {
    await driver.hideKeyboard().catch(() => {})
    for (let i = 0; i < 12; i++) {
      if (await this.isVisible($(selector))) return
      await this.scrollFormulario('down')
    }
    throw new Error(`No se pudo traer al viewport el campo ${selector}`)
  }

  private async completarCampo(selector: string, valor: string): Promise<void> {
    await this.scrollHastaCampo(selector)
    await this.setValue($(selector), valor)
    await driver.hideKeyboard().catch(() => {})
  }

  /** Abre un selector y elige una opción. */
  private async elegirEnSelector(
    selectorBoton: string,
    selectorOpcion: string,
  ): Promise<void> {
    await this.scrollHastaCampo(selectorBoton)
    await this.tap($(selectorBoton))
    await this.waitForElement($(selectorOpcion), 15000)
    await this.tapCuandoQuieto($(selectorOpcion))
    await driver.pause(800)
  }

  /**
   * Elige una opción de un bottom sheet de selector.
   *
   * Las listas (países, ciudades, especialidades) son alfabéticas y NO tienen
   * buscador: la opción puede estar muy abajo y hay que scrollear dentro del
   * propio sheet hasta encontrarla.
   */
  private async elegirEnSheet(
    selectorBoton: string,
    valor: string,
  ): Promise<void> {
    await this.scrollHastaCampo(selectorBoton)
    await this.tap($(selectorBoton))
    // El sheet entra con animación: esperar su backdrop (búsqueda positiva,
    // barata) evita darlo por "no encontrado" cuando todavía no montó.
    await $(this.loc.bottomSheetBackdrop)
      .waitForExist({ timeout: 10000 })
      .catch(() => {})

    const opcion = this.loc.opcionSheet(valor)
    const visible = await $(opcion)
      .waitForDisplayed({ timeout: 8000 })
      .then(() => true)
      .catch(() => false)

    if (!visible) {
      // Solo para listas largas (países, ciudades, especialidades). Buscar a
      // fuerza de gestos costaba hasta 15 `scrollGesture` por selector y
      // `scrollIntoView` lo resuelve server-side en un solo comando.
      //
      // Se deja como ÚLTIMO recurso a propósito: cuando el sheet es corto no
      // hay ningún contenedor `scrollable(true)` que matchear, y ahí
      // UiScrollable se cuelga hasta matar la instrumentación. Eso es lo que
      // rompía el paso "¿Cómo conoció Intramed?", cuya lista entra entera en
      // pantalla.
      await $(this.loc.opcionSheetConScroll(valor)).waitForExist({
        timeout: 20000,
        timeoutMsg: `La opción "${valor}" no apareció en ${selectorBoton}`,
      })
    }
    await this.tapCuandoQuieto($(opcion))
    // El sheet tarda en cerrarse y su backdrop ocupa la pantalla entera: si se
    // sigue de largo, el toque siguiente se lo come el backdrop. Pasó con
    // "Continuar" del último paso, que quedaba sin efecto y el alta no
    // terminaba (el paso daba OK en 700ms y la pantalla no cambiaba).
    await $(this.loc.bottomSheetBackdrop)
      .waitForExist({ reverse: true, timeout: 10000 })
      .catch(() => {})
    await driver.pause(500)
  }

  /**
   * Carga el código de verificación, un dígito por EditText.
   *
   * La pantalla no tiene botón de confirmación: al completar el 6º dígito el
   * wizard verifica contra el backend y avanza solo al paso de contacto.
   */
  async completarOtp(codigo: string): Promise<void> {
    await this.waitForElement(this.msgCodigoEnviado, 30000)
    const inputs = await this.inputsDelCodigo(codigo.length)
    const cantidad = await inputs.length
    if (cantidad < codigo.length) {
      throw new Error(
        `La pantalla de OTP expone ${cantidad} inputs para un código de ${codigo.length} dígitos`,
      )
    }
    for (let i = 0; i < codigo.length; i++) {
      await inputs[i].setValue(codigo[i])
    }
    await driver.hideKeyboard().catch(() => {})
    // La verificación es contra el backend: la pantalla siguiente no es
    // inmediata.
    await this.waitForElement(this.tituloContacto, 60000)
  }

  /**
   * Devuelve los EditText del código, trayéndolos al viewport.
   *
   * Nacen debajo del pliegue: consultarlos sin scrollear devuelve una lista
   * vacía y el llenado explota con "Cannot read properties of undefined".
   */
  async inputsDelCodigo(minimo = 6) {
    for (let i = 0; i < 8; i++) {
      const encontrados = await $$(this.loc.inputsOtp)
      if ((await encontrados.length) >= minimo) return encontrados
      await this.scrollFormulario('down', 0.4)
    }
    return $$(this.loc.inputsOtp)
  }

  /**
   * Carga un código y NO espera que el wizard avance.
   *
   * Con un código incorrecto la app no muestra ningún mensaje —a diferencia de
   * web, que muestra "¡Código incorrecto!"—: simplemente limpia los inputs y se
   * queda en la pantalla. Esperar el avance, como hace `completarOtp`, sería
   * esperar 60s para nada.
   */
  async cargarCodigoSinEsperar(codigo: string): Promise<void> {
    await this.waitForElement(this.msgCodigoEnviado, 30000)
    const inputs = await this.inputsDelCodigo(codigo.length)
    for (let i = 0; i < codigo.length; i++) {
      await inputs[i].setValue(codigo[i])
    }
    await driver.hideKeyboard().catch(() => {})
    await driver.pause(5000)
  }

  async completarContacto(datos: DatosContacto): Promise<void> {
    await this.waitForElement(this.tituloContacto, 30000)
    await this.irAlTopeDelFormulario(this.loc.tituloContacto)
    await this.elegirEnSheet(this.loc.btnSelectorPais, datos.pais)
    await this.elegirEnSheet(this.loc.btnSelectorProvincia, datos.provincia)
    await this.elegirEnSheet(this.loc.btnSelectorCiudad, datos.ciudad)
  }

  /**
   * Completa "Formación profesional".
   *
   * Los campos se despliegan de a uno: "Especialidad" recién aparece al elegir
   * carrera, y "Subespecialidad" al elegir especialidad. Por eso el orden no es
   * negociable.
   */
  async completarProfesional(datos: DatosProfesionales): Promise<void> {
    await this.waitForElement(this.tituloProfesional, 30000)
    await this.irAlTopeDelFormulario(this.loc.tituloProfesional)
    await this.elegirEnSheet(this.loc.btnSelectorOcupacion, datos.ocupacion)
    await this.elegirEnSheet(this.loc.btnSelectorCarrera, datos.carrera)
    await this.elegirEnSheet(
      this.loc.btnSelectorEspecialidad,
      datos.especialidad,
    )
    await this.elegirEnSheet(
      this.loc.btnSelectorSubespecialidad,
      datos.subespecialidad,
    )
    // OJO: la primera opción de este selector es "-", un placeholder que deja
    // el formulario inválido y "Continuar" deshabilitado sin ningún mensaje.
    await this.elegirEnSheet(this.loc.btnSelectorIdentidad, datos.tipoIdentidad)
    await this.completarCampo(this.loc.inputNroMatricula, datos.nroMatricula)
  }

  /** El botón de los pasos 5 y 6 se llama "Continuar", no "Siguiente". */
  async tocarContinuar(): Promise<void> {
    await this.scrollHastaCampo(this.loc.btnContinuar)
    await this.tapCuandoQuieto(this.btnContinuar)
  }

  async continuarHabilitado(): Promise<boolean> {
    await this.scrollHastaCampo(this.loc.btnContinuar)
    return this.btnContinuar.isEnabled()
  }

  /**
   * Espera a que el alta termine y la app quede autenticada.
   *
   * Resuelto con UN `getPageSource` por vuelta y matching por string, NO con
   * `findElement`: apenas termina el registro la app entra al feed, y un
   * findElement que no matchea obliga a UiAutomator2 a recorrer el árbol
   * entero del feed — el patrón que PENDIENTES.md documenta como causa del
   * cuelgue de la instrumentación, y que acá tumbaba el último assert.
   *
   * No se usa "Crear" como señal: una cuenta recién creada todavía no está
   * habilitada para publicar y su bottom nav no lo trae.
   */
  async esperarAppAutenticada(timeout = 90000): Promise<void> {
    await browser.waitUntil(
      async () => {
        const src = await driver.getPageSource().catch(() => '')
        return (
          src.includes('content-desc="Inicio"') &&
          src.includes('content-desc="Campus"')
        )
      },
      {
        timeout,
        interval: 2000,
        timeoutMsg:
          'El alta no terminó de entrar a la app autenticada (no aparecieron los tabs Inicio/Campus)',
      },
    )
  }

  /** "Saltear" del paso "¿Cómo conoció Intramed?" — el "Omitir" de web. */
  async tocarSaltear(): Promise<void> {
    await this.scrollHastaCampo(this.loc.btnSaltear)
    await this.tapCuandoQuieto(this.btnSaltear)
  }

  async elegirComoConocio(valor: string): Promise<void> {
    await this.waitForElement(this.tituloComoConocio, 30000)
    await this.elegirEnSheet(this.loc.btnSelectorComoConocio, valor)
  }

  /**
   * Tilda "Aceptar términos y condiciones".
   *
   * El nodo CheckBox ocupa la fila completa y su centro cae sobre el texto,
   * que es un LINK: un `click()` normal abre
   * `front.qa.intramed.net/intern/terms-of-use` en Chrome y saca al test de la
   * app (pasó en la 1ª pasada de relevamiento). Se toca el cuadradito, pegado
   * al borde izquierdo del nodo.
   */
  async tildarTerminos(): Promise<void> {
    await this.scrollHastaCampo(this.loc.chkTerminos)
    const el = this.chkTerminos
    const { x, y } = await el.getLocation()
    const { height } = await el.getSize()
    await driver.execute('mobile: clickGesture', {
      x: Math.floor(x + 25),
      y: Math.floor(y + height / 2),
    })
    await driver.pause(600)
  }

  /**
   * Completa el paso 1. `tildarTerminos` se puede desactivar para el caso de
   * campos obligatorios, que necesita ver el formulario completo PERO con
   * "Siguiente" todavía deshabilitado.
   */
  /**
   * Deja el checkbox de términos destildado.
   *
   * El wizard RETIENE el estado del formulario entre entradas: al salir y
   * volver a entrar, los campos y el tilde siguen como quedaron. El caso de
   * campos obligatorios necesita arrancar sin tildar, así que no alcanza con
   * asumir un formulario limpio.
   */
  async asegurarTerminosDestildados(): Promise<void> {
    await this.scrollHastaCampo(this.loc.chkTerminos)
    if ((await this.chkTerminos.getAttribute('checked')) === 'true') {
      await this.tildarTerminos()
    }
  }

  async completarDatosPersonales(
    datos: DatosPersonales,
    conTerminos = true,
  ): Promise<void> {
    await this.irAlTopeDelFormulario()
    await this.elegirEnSelector(
      this.loc.btnSelectorTrato,
      this.loc.opcionTrato(datos.trato),
    )
    await this.completarCampo(this.loc.inputNombre, datos.nombre)
    await this.completarCampo(this.loc.inputApellido, datos.apellido)
    await this.completarCampo(this.loc.inputEmail, datos.email)
    await this.completarCampo(
      this.loc.inputFechaNacimiento,
      datos.fechaNacimiento,
    )
    await this.elegirEnSelector(
      this.loc.btnSelectorTipoDocumento,
      this.loc.opcionTipoDocumento(datos.tipoDocumento),
    )
    await this.completarCampo(this.loc.inputNroDocumento, datos.nroDocumento)
    if (conTerminos) await this.tildarTerminos()
  }

  async completarPassword(password: string): Promise<void> {
    await this.completarSoloPassword(password)
    await this.completarConfirmacionPassword(password)
  }

  /**
   * Espera la pantalla de contraseña.
   *
   * Avanzar del paso 1 no es instantáneo: la app consulta al backend si el
   * email ya existe (es la misma consulta que dispara el sheet de "¿Desea
   * ingresar?"). Bajo carga eso se pasa de los 15s por defecto de `expect`, y
   * era lo que dejaba a TC49 flaky.
   */
  async esperarPantallaPassword(timeout = 45000): Promise<void> {
    await this.waitForElement(this.tituloCrearPassword, timeout)
  }

  async completarSoloPassword(password: string): Promise<void> {
    await this.waitForElement(this.tituloCrearPassword, 30000)
    await this.irAlTopeDelFormulario(this.loc.tituloCrearPassword)
    await this.completarCampo(this.loc.inputPassword, password)
  }

  async completarConfirmacionPassword(password: string): Promise<void> {
    await this.irAlTopeDelFormulario(this.loc.tituloCrearPassword)
    await this.completarCampo(this.loc.inputPasswordConfirm, password)
  }

  /**
   * ¿Estamos dentro del wizard de registro?
   *
   * Los pasos 2 en adelante comparten el indicador `step-progress`; el paso 1
   * no lo tiene, y se reconoce por su título. Listar los títulos uno por uno
   * no alcanzaba: con el wizard parado en "Formación profesional" el helper
   * decía que no estábamos en el wizard, caía en `asegurarSesionEnFeed` y se
   * llevaba puesta la spec entera en cascada.
   */
  async enElWizard(): Promise<boolean> {
    return (
      (await this.isVisible($(this.loc.progresoFormulario))) ||
      (await this.isVisible(this.tituloCrearCuenta)) ||
      // La pantalla de verificación es la excepción: no tiene `step-progress`
      // NI título propio. Sin este chequeo, un caso que queda parado ahí deja
      // al siguiente sin forma de salir, y la spec entera cae en cascada.
      (await this.isVisible(this.msgCodigoEnviado)) ||
      (await this.isVisible(this.linkYaRegistrado))
    )
  }

  /**
   * Sale del wizard y vuelve a la pantalla inicial.
   *
   * El paso 1 NO tiene "Go back" (relevado: no está en el árbol), así que la
   * salida es el back de hardware. A propósito NO se usa el link "¿Ya está
   * registrado? Iniciar sesión": ese lleva al FORMULARIO de login, no a la
   * pantalla inicial, y ahí no hay botón "Registrarse" para volver a entrar.
   * Los pasos siguientes sí tienen "Go back" en el header.
   */
  async salirDelWizard(): Promise<void> {
    for (let i = 0; i < 6; i++) {
      if (await this.isVisible($(this.loc.btnRegistrarse))) return
      if (await this.isVisible(this.btnGoBack)) {
        await this.tap(this.btnGoBack)
      } else {
        await driver.back().catch(() => {})
      }
      await driver.pause(1500)
    }
  }

  /** El botón nace fuera del árbol: hay que scrollear antes de tocarlo. */
  async tocarSiguiente(): Promise<void> {
    await this.scrollHastaCampo(this.loc.btnSiguiente)
    await this.tapCuandoQuieto(this.btnSiguiente)
  }

  async siguienteHabilitado(): Promise<boolean> {
    await this.scrollHastaCampo(this.loc.btnSiguiente)
    return this.btnSiguiente.isEnabled()
  }

  /**
   * Espera el bottom sheet de "email ya registrado". Tarda ~3s en aparecer
   * porque depende de la respuesta del backend: sin esta espera el assert
   * corre contra el paso 1 todavía intacto.
   */
  async esperarSheetYaRegistrado(): Promise<void> {
    await this.waitForElement(this.sheetYaRegistradoTitulo, 30000)
  }

  /** Cierra el sheet de "ya registrado" sin ir a recuperar contraseña. */
  async cancelarYaRegistrado(): Promise<void> {
    await this.tap(this.btnCancelarYaRegistrado)
    await driver.pause(1000)
  }

  /**
   * Completa solo el email — para los casos de validación de formato, que lo
   * reescriben varias veces y entre medio consultan "Siguiente" (que vive al
   * fondo). Vuelve al tope antes, o el llenado forward-only no lo encuentra.
   */
  async completarEmail(email: string): Promise<void> {
    await this.irAlTopeDelFormulario()
    await this.completarCampo(this.loc.inputEmail, email)
  }
}

export default new OnboardingPage()
