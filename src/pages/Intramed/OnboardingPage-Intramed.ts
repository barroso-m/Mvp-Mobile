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

  async abrirRegistro(): Promise<void> {
    await this.waitForElement($(this.loc.btnRegistrarse), 60000)
    await this.tap($(this.loc.btnRegistrarse))
    await this.waitForElement(this.tituloCrearCuenta, 30000)
  }

  async waitForScreenReady(): Promise<void> {
    await this.waitForElement(this.tituloCrearCuenta, 30000)
  }

  async irAlTopeDelFormulario(
    selectorTitulo: string = this.loc.tituloCrearCuenta,
  ): Promise<void> {
    for (let i = 0; i < 8; i++) {
      if (await this.isVisible($(selectorTitulo))) return
      await this.scrollFormulario('up', 0.9)
    }
  }

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

  private async elegirEnSheet(
    selectorBoton: string,
    valor: string,
  ): Promise<void> {
    await this.scrollHastaCampo(selectorBoton)
    await this.tap($(selectorBoton))
    await $(this.loc.bottomSheetBackdrop)
      .waitForExist({ timeout: 10000 })
      .catch(() => {})

    const opcion = this.loc.opcionSheet(valor)
    const visible = await $(opcion)
      .waitForDisplayed({ timeout: 8000 })
      .then(() => true)
      .catch(() => false)

    if (!visible) {
      await $(this.loc.opcionSheetConScroll(valor)).waitForExist({
        timeout: 20000,
        timeoutMsg: `La opción "${valor}" no apareció en ${selectorBoton}`,
      })
    }
    await this.tapCuandoQuieto($(opcion))
    await $(this.loc.bottomSheetBackdrop)
      .waitForExist({ reverse: true, timeout: 10000 })
      .catch(() => {})
    await driver.pause(500)
  }

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
    await this.waitForElement(this.tituloContacto, 60000)
  }

  async inputsDelCodigo(minimo = 6) {
    for (let i = 0; i < 8; i++) {
      const encontrados = await $$(this.loc.inputsOtp)
      if ((await encontrados.length) >= minimo) return encontrados
      await this.scrollFormulario('down', 0.4)
    }
    return $$(this.loc.inputsOtp)
  }

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
    await this.elegirEnSheet(this.loc.btnSelectorIdentidad, datos.tipoIdentidad)
    await this.completarCampo(this.loc.inputNroMatricula, datos.nroMatricula)
  }

  async tocarContinuar(): Promise<void> {
    await this.scrollHastaCampo(this.loc.btnContinuar)
    await this.tapCuandoQuieto(this.btnContinuar)
  }

  async continuarHabilitado(): Promise<boolean> {
    await this.scrollHastaCampo(this.loc.btnContinuar)
    return this.btnContinuar.isEnabled()
  }

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

  async tocarSaltear(): Promise<void> {
    await this.scrollHastaCampo(this.loc.btnSaltear)
    await this.tapCuandoQuieto(this.btnSaltear)
  }

  async elegirComoConocio(valor: string): Promise<void> {
    await this.waitForElement(this.tituloComoConocio, 30000)
    await this.elegirEnSheet(this.loc.btnSelectorComoConocio, valor)
  }

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

  async enElWizard(): Promise<boolean> {
    return (
      (await this.isVisible($(this.loc.progresoFormulario))) ||
      (await this.isVisible(this.tituloCrearCuenta)) ||
      (await this.isVisible(this.msgCodigoEnviado)) ||
      (await this.isVisible(this.linkYaRegistrado))
    )
  }

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

  async tocarSiguiente(): Promise<void> {
    await this.scrollHastaCampo(this.loc.btnSiguiente)
    await this.tapCuandoQuieto(this.btnSiguiente)
  }

  async siguienteHabilitado(): Promise<boolean> {
    await this.scrollHastaCampo(this.loc.btnSiguiente)
    return this.btnSiguiente.isEnabled()
  }

  async esperarSheetYaRegistrado(): Promise<void> {
    await this.waitForElement(this.sheetYaRegistradoTitulo, 30000)
  }

  async cancelarYaRegistrado(): Promise<void> {
    await this.tap(this.btnCancelarYaRegistrado)
    await driver.pause(1000)
  }

  async completarEmail(email: string): Promise<void> {
    await this.irAlTopeDelFormulario()
    await this.completarCampo(this.loc.inputEmail, email)
  }
}

export default new OnboardingPage()
