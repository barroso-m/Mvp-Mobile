import {
  dump,
  completarCampo,
  elegirEnSelector,
  elegirPrimeraOpcion,
  porHint,
  relevarPantalla,
  tildarCheckbox,
  tocarBoton,
  tocarSiguiente,
  traerALaVista,
} from './recon.helper'
import {
  buildOnboardingTestEmail,
  getOtpCode,
} from '../../utils/gmail-otp.helper'

const PASSWORD = 'Conexa123!'

describe('[recon] Onboarding — wizard completo', () => {
  it('recorre el wizard de punta a punta dumpeando cada pantalla', async () => {
    const email = buildOnboardingTestEmail('recon')
    const desdeCuando = new Date()
    console.log(`>>> email de recon: ${email}`)

    await $('~Registrarse').waitForDisplayed({ timeout: 90000 })
    await $('~Registrarse').click()
    await driver.pause(5000)

    await elegirEnSelector(
      '//android.widget.Button[contains(@content-desc,"Seleccione")]',
      'Dr.',
      'onb-p1-selector-trato',
    )
    await completarCampo(porHint('Escriba su nombre'), 'Automation')
    await completarCampo(porHint('Escriba su apellido'), 'Recon')
    await completarCampo(porHint('Ej, email@gmail.com'), email)
    await completarCampo(porHint('DD-MM-AAAA'), '15-05-1990')
    await elegirEnSelector(
      '~Abrir selector de tipo de documento',
      'DNI',
      'onb-p1-selector-documento',
    )
    await completarCampo(porHint('ej. 11434934'), '33445566')
    await tildarCheckbox('~Aceptar términos y condiciones')
    await tocarSiguiente('paso1')

    await relevarPantalla('onb-p2-password', 1)
    await completarCampo('//*[@resource-id="passwordInput"]', PASSWORD)
    await completarCampo('//*[@resource-id="confirmInput"]', PASSWORD)
    await dump('onb-p2-password-completo')
    await tocarSiguiente('paso2')

    await relevarPantalla('onb-p3-otp', 1)
    const code = await getOtpCode(email, { sentAfter: desdeCuando }).catch(
      (e) => {
        console.log(`>>> no se pudo leer el OTP: ${e.message}`)
        return ''
      },
    )
    console.log(`>>> OTP leído: ${code || '<vacío>'}`)

    if (code) {
      const inputs = await $$('//android.widget.EditText')
      const cantidad = await inputs.length
      console.log(`>>> EditText en la pantalla de OTP: ${cantidad}`)
      if (cantidad >= code.length) {
        for (let i = 0; i < code.length; i++) {
          await inputs[i].setValue(code[i]).catch(() => {})
        }
      } else if (cantidad === 1) {
        await inputs[0].setValue(code).catch(() => {})
      }
      await driver.hideKeyboard().catch(() => {})
      await driver.pause(4000)
      await dump('onb-p3-otp-cargado')
      await tocarSiguiente('paso3')
    }

    await relevarPantalla('onb-p4-contacto', 2)
    await elegirEnSelector(
      '//*[@resource-id="countryTrigger"]',
      'Argentina',
      'onb-p4-selector-pais',
    )
    await elegirEnSelector(
      '//*[@resource-id="stateTrigger"]',
      'Buenos Aires',
      'onb-p4-selector-provincia',
    )
    await elegirEnSelector(
      '//*[@resource-id="cityTrigger"]',
      '25 de Mayo',
      'onb-p4-selector-ciudad',
    )
    await dump('onb-p4-contacto-completo')
    await tocarSiguiente('paso4')

    await relevarPantalla('onb-p5-profesional', 2)
    await elegirEnSelector(
      '//*[@resource-id="occupationTrigger"]',
      'Profesional de salud',
      'onb-p5-selector-ocupacion',
    )
    await elegirEnSelector(
      '//*[@resource-id="careerTrigger"]',
      'Medicina',
      'onb-p5-selector-carrera',
    )
    await relevarPantalla('onb-p5-profesional-con-carrera', 2)
    await elegirPrimeraOpcion(
      '//*[@resource-id="specialtyTrigger"]',
      'onb-p5-selector-especialidad',
    )
    await elegirPrimeraOpcion(
      '//*[@resource-id="subSpecialtyTrigger"]',
      'onb-p5-selector-subespecialidad',
    )
    await elegirEnSelector(
      '//*[@resource-id="licenceTypeTrigger"]',
      'Matrícula Nacional',
      'onb-p5-selector-identidad',
    )
    await completarCampo('//*[@resource-id="licenceNumberInput"]', '123456')
    await dump('onb-p5-profesional-completo')
    await tocarBoton('Continuar', 'paso5')

    await relevarPantalla('onb-p6-conocimiento', 1)
    await elegirPrimeraOpcion(
      '//*[@resource-id="discoverTrigger"]',
      'onb-p6-selector-conocimiento',
    )
    await tocarBoton('Continuar', 'paso6')

    await relevarPantalla('onb-p7-exito', 2)
    for (const opcion of [
      'Completar mi perfil',
      'Omitir',
      'Saltear',
      'Ir al feed',
      'Crear',
    ]) {
      console.log(
        `>>> "${opcion}" presente: ${await traerALaVista(`~${opcion}`)}`,
      )
    }

    for (const opcion of ['Completar mi perfil', 'Omitir']) {
      const visible = await traerALaVista(`~${opcion}`)
      console.log(`>>> "${opcion}" presente: ${visible}`)
    }
  })
})
