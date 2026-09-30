import OnboardingPage from '../../pages/Intramed/OnboardingPage-Intramed'
import { buildDatosPersonales } from '../../utils/onboarding.data'
import { dump } from './recon.helper'

const EMAIL_REGISTRADO = 'martin.barroso@conexa.ai'

describe('[recon] Onboarding — validaciones del paso 1', () => {
  it('releva emails inválidos y el email ya registrado', async () => {
    await OnboardingPage.abrirRegistro()
    await dump('onb-val-00-inicial')

    for (const [i, invalido] of [
      'test@',
      'test.com',
      '@dominio.com',
    ].entries()) {
      await OnboardingPage.completarEmail(invalido)
      await driver.pause(1500)
      await dump(`onb-val-01-email-invalido-${i}`)
      console.log(
        `>>> "${invalido}" → Siguiente habilitado: ${await OnboardingPage.siguienteHabilitado().catch(() => '<error>')}`,
      )
    }

    const datos = buildDatosPersonales({ email: EMAIL_REGISTRADO })
    await OnboardingPage.completarDatosPersonales(datos)
    await dump('onb-val-02-form-completo')
    console.log(
      `>>> form completo con email registrado → Siguiente habilitado: ${await OnboardingPage.siguienteHabilitado().catch(() => '<error>')}`,
    )

    await OnboardingPage.tocarSiguiente()
    for (const ms of [1500, 1500, 2000, 3000, 5000, 8000]) {
      await driver.pause(ms)
      await dump(`onb-val-03-post-siguiente-${ms}`)
    }
  })
})
