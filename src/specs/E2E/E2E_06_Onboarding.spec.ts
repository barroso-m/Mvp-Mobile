import OnboardingPage from '../../pages/Intramed/OnboardingPage-Intramed'
import LoginPage from '../../pages/Intramed/LoginPage-Intramed'
import { asegurarPantallaInicial } from '../../utils/session.helper'
import {
  buildDatosPersonales,
  buildDatosProfesionales,
  CONTACTO,
  PASSWORD_VALIDA,
} from '../../utils/onboarding.data'
import { getOtpCode } from '../../utils/gmail-otp.helper'
import { step } from '../../utils/logger'

const EMAIL_REGISTRADO = process.env.ONBOARDING_EMAIL_REGISTRADO!
const EMAILS_INVALIDOS = ['test@', 'test.com', '@dominio.com']
const COMO_CONOCIO = 'Artículo o contenido científico'
const TIMEOUT_ALTA_COMPLETA = 600000

async function registrarHastaElOtp(
  datos: ReturnType<typeof buildDatosPersonales>,
): Promise<string> {
  const desdeCuando = new Date()

  await step('Ir a la pantalla inicial', () => asegurarPantallaInicial())
  await step('Abrir el wizard de registro', () =>
    OnboardingPage.abrirRegistro(),
  )
  await step('Completar los datos personales', () =>
    OnboardingPage.completarDatosPersonales(datos),
  )
  await step('Avanzar al paso de contraseña', () =>
    OnboardingPage.tocarSiguiente(),
  )
  await step('Definir la contraseña', () =>
    OnboardingPage.completarPassword(PASSWORD_VALIDA),
  )
  await step('Avanzar al paso de verificación', () =>
    OnboardingPage.tocarSiguiente(),
  )
  return step('Leer el código de verificación del email', () =>
    getOtpCode(datos.email, { sentAfter: desdeCuando }),
  )
}

async function completarHastaElUltimoPaso(): Promise<void> {
  await step('Completar la información de contacto', () =>
    OnboardingPage.completarContacto(CONTACTO),
  )
  await step('Avanzar al paso de formación profesional', () =>
    OnboardingPage.tocarSiguiente(),
  )
  await step('Completar la formación profesional', () =>
    OnboardingPage.completarProfesional(buildDatosProfesionales()),
  )
  await step('Avanzar al último paso', () => OnboardingPage.tocarContinuar())
}

describe('[#onboarding] Registro de usuario (Onboarding)', () => {
  it('TC44 [IE-T78] - alta completa: el wizard termina en el feed autenticado', async function () {
    this.timeout(TIMEOUT_ALTA_COMPLETA)
    const datos = buildDatosPersonales()
    console.log(`>>> cuenta creada por TC44: ${datos.email}`)

    const codigo = await registrarHastaElOtp(datos)
    await step('Cargar el código de verificación', () =>
      OnboardingPage.completarOtp(codigo),
    )
    await completarHastaElUltimoPaso()
    await step('Responder "¿Cómo conoció Intramed?"', () =>
      OnboardingPage.elegirComoConocio(COMO_CONOCIO),
    )
    await step('Finalizar el alta', () => OnboardingPage.tocarContinuar())
    await step('Validar que se entra a la app autenticada', () =>
      OnboardingPage.esperarAppAutenticada(),
    )
  })

  it('TC45 [IE-T84] - alta completa salteando el último paso ("Saltear")', async function () {
    this.timeout(TIMEOUT_ALTA_COMPLETA)
    const datos = buildDatosPersonales()
    console.log(`>>> cuenta creada por TC45: ${datos.email}`)

    const codigo = await registrarHastaElOtp(datos)
    await step('Cargar el código de verificación', () =>
      OnboardingPage.completarOtp(codigo),
    )
    await completarHastaElUltimoPaso()
    await step('Saltear "¿Cómo conoció Intramed?"', () =>
      OnboardingPage.tocarSaltear(),
    )
    await step('Validar que se entra a la app autenticada', () =>
      OnboardingPage.esperarAppAutenticada(),
    )
  })

  it('TC46 [IE-T81] - registro fallido con un email ya registrado', async () => {
    await step('Ir a la pantalla inicial', () => asegurarPantallaInicial())
    await step('Abrir el wizard de registro', () =>
      OnboardingPage.abrirRegistro(),
    )
    await step('Completar el paso 1 con un email ya registrado', () =>
      OnboardingPage.completarDatosPersonales(
        buildDatosPersonales({ email: EMAIL_REGISTRADO }),
      ),
    )
    await step('Tocar "Siguiente"', () => OnboardingPage.tocarSiguiente())
    await step('Validar el aviso de cuenta existente', async () => {
      await OnboardingPage.esperarSheetYaRegistrado()
      await expect(OnboardingPage.sheetYaRegistradoMensaje).toBeDisplayed()
      await expect(OnboardingPage.btnRecuperarPassword).toBeDisplayed()
    })
    await step('Cerrar el aviso sin recuperar la contraseña', () =>
      OnboardingPage.cancelarYaRegistrado(),
    )
  })

  it('TC47 [IE-T80] - el email con formato inválido no habilita "Siguiente"', async () => {
    await step('Ir a la pantalla inicial', () => asegurarPantallaInicial())
    await step('Abrir el wizard de registro', () =>
      OnboardingPage.abrirRegistro(),
    )
    for (const invalido of EMAILS_INVALIDOS) {
      await step(`Cargar el email inválido "${invalido}"`, async () => {
        await OnboardingPage.completarEmail(invalido)
        expect(await OnboardingPage.siguienteHabilitado()).toBe(false)
      })
    }
    await step(
      'Vaciar el campo y validar que sigue deshabilitado',
      async () => {
        await OnboardingPage.completarEmail('')
        expect(await OnboardingPage.siguienteHabilitado()).toBe(false)
      },
    )
  })

  it('TC48 [IE-T83] - un código de verificación incorrecto no avanza el wizard', async function () {
    this.timeout(TIMEOUT_ALTA_COMPLETA)
    const datos = buildDatosPersonales()
    console.log(`>>> cuenta creada por TC48: ${datos.email}`)

    const codigo = await registrarHastaElOtp(datos)
    await step('Cargar un código incorrecto', () =>
      OnboardingPage.cargarCodigoSinEsperar('000000'),
    )
    await step('Validar que sigue en el paso de verificación', async () => {
      await expect(OnboardingPage.msgCodigoEnviado).toBeDisplayed()
      await expect(OnboardingPage.tituloContacto).not.toBeDisplayed()
    })
    await step('Cargar el código correcto', () =>
      OnboardingPage.completarOtp(codigo),
    )
    await step('Validar que el wizard avanza a contacto', async () => {
      await expect(OnboardingPage.tituloContacto).toBeDisplayed()
    })
  })

  it('TC49 [IE-T79] - campos obligatorios de los pasos 1 y 2 habilitan "Siguiente"', async function () {
    this.timeout(300000)
    const datos = buildDatosPersonales()

    await step('Ir a la pantalla inicial', () => asegurarPantallaInicial())
    await step('Abrir el wizard de registro', () =>
      OnboardingPage.abrirRegistro(),
    )
    await step(
      'Completar el paso 1 salvo los términos y validar "Siguiente" deshabilitado',
      async () => {
        await OnboardingPage.completarDatosPersonales({ ...datos }, false)
        await OnboardingPage.asegurarTerminosDestildados()
        expect(await OnboardingPage.siguienteHabilitado()).toBe(false)
      },
    )
    await step(
      'Tildar los términos y validar que "Siguiente" se habilita',
      async () => {
        await OnboardingPage.irAlTopeDelFormulario()
        await OnboardingPage.tildarTerminos()
        expect(await OnboardingPage.siguienteHabilitado()).toBe(true)
      },
    )
    await step('Avanzar al paso de contraseña', () =>
      OnboardingPage.tocarSiguiente(),
    )
    await step('Validar la pantalla "Crear contraseña"', async () => {
      await OnboardingPage.esperarPantallaPassword()
      await expect(OnboardingPage.requisitosPassword).toBeDisplayed()
    })
    await step(
      'Con una sola contraseña cargada, "Siguiente" sigue deshabilitado',
      async () => {
        await OnboardingPage.completarSoloPassword(PASSWORD_VALIDA)
        expect(await OnboardingPage.siguienteHabilitado()).toBe(false)
      },
    )
    await step(
      'Al repetir la contraseña, "Siguiente" se habilita',
      async () => {
        await OnboardingPage.completarConfirmacionPassword(PASSWORD_VALIDA)
        expect(await OnboardingPage.siguienteHabilitado()).toBe(true)
      },
    )
  })

  after(async () => {
    await asegurarPantallaInicial().catch(() => {})
    await LoginPage.waitForScreenReady().catch(() => {})
  })
})
