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

    const inputs = await OnboardingPage.inputsDelCodigo()
    for (let i = 0; i < 6; i++) {
      await inputs[i].setValue('0').catch(() => {})
    }
    await driver.hideKeyboard().catch(() => {})

    for (const ms of [2000, 3000, 5000]) {
      await driver.pause(ms)
      await dump(`onb-otp-02-invalido-${ms}`)
    }

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
