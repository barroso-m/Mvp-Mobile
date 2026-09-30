/**
 * Relevamiento del código de verificación incorrecto (`IE-T35`). NO es un test.
 *
 *   npx wdio run config/wdio.android.conf.ts --spec ./src/specs/recon/onboarding-otp-invalido.recon.ts --mochaOpts.retries 0 --mochaOpts.timeout 900000
 */
import OnboardingPage from '../../pages/Intramed/OnboardingPage-Intramed'
import {
  buildDatosPersonales,
  PASSWORD_VALIDA,
} from '../../utils/onboarding.data'
import { getOtpCode } from '../../utils/gmail-otp.helper'
import { dump } from './recon.helper'

describe('[recon] Onboarding — código de verificación incorrecto', () => {
  it('carga un código inválido y después el válido', async () => {
    const datos = buildDatosPersonales()
    const desdeCuando = new Date()

    await OnboardingPage.abrirRegistro()
    await OnboardingPage.completarDatosPersonales(datos)
    await OnboardingPage.tocarSiguiente()
    await OnboardingPage.completarPassword(PASSWORD_VALIDA)
    await OnboardingPage.tocarSiguiente()

    await dump('onb-otp-01-pantalla')

    // Código inválido: se cargan los 6 dígitos a mano porque completarOtp()
    // espera el avance al paso de contacto, que acá no va a pasar.
    const inputs = await OnboardingPage.inputsDelCodigo()
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue('0').catch(() => {})
    }
    await driver.hideKeyboard().catch(() => {})

    for (const ms of [2000, 3000, 5000]) {
      await driver.pause(ms)
      await dump(`onb-otp-02-invalido-${ms}`)
    }

    // Recuperación: el código real después del fallido.
    const codigo = await getOtpCode(datos.email, { sentAfter: desdeCuando })
    console.log(`>>> OTP real: ${codigo}`)
    const inputs2 = await OnboardingPage.inputsDelCodigo()
    for (let i = 0; i < codigo.length; i++) {
      await inputs2[i].setValue(codigo[i]).catch(() => {})
    }
    await driver.hideKeyboard().catch(() => {})
    await driver.pause(8000)
    await dump('onb-otp-03-recuperado')
  })
})
