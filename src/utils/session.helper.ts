import LoginPage from '../pages/Intramed/LoginPage-Intramed'
import FeedPage from '../pages/Intramed/FeedPage-Intramed'
import SideMenuPage from '../pages/Intramed/SideMenuPage-Intramed'
import OnboardingPage from '../pages/Intramed/OnboardingPage-Intramed'

type Pantalla = {
  login: boolean
  bottomNav: boolean
  goBack: boolean
  bottomSheet: boolean
  cerrar: boolean
}

async function volverALaApp(): Promise<void> {
  const caps = driver.capabilities as Record<string, string | undefined>
  const appId = caps.appPackage ?? caps['appium:appPackage']
  if (!appId) return

  const actual = await driver.getCurrentPackage().catch(() => undefined)
  if (!actual || actual === appId) return

  await driver
    .execute('mobile: terminateApp', { appId: actual })
    .catch(() => {})
  await driver.execute('mobile: activateApp', { appId })
  await driver.pause(1500)
}

async function cerrarBottomSheet(): Promise<void> {
  const { width, height } = await driver.getWindowSize()
  const sheet = await $('~Bottom Sheet')
  const pos = await sheet.getLocation().catch(() => null)
  const margen = 40
  const y = pos && pos.y > margen * 2 ? Math.floor(pos.y / 2) : margen
  await driver.execute('mobile: clickGesture', {
    x: Math.floor(width / 2),
    y: Math.min(y, height - 1),
  })
}

async function leerPantalla(): Promise<Pantalla> {
  const src = await driver.getPageSource()
  return {
    login: src.includes('content-desc="Iniciar sesión"'),
    bottomNav: src.includes('content-desc="Crear"'),
    goBack: src.includes('content-desc="Go back"'),
    bottomSheet: src.includes('content-desc="Bottom Sheet"'),
    cerrar: src.includes('content-desc="Cerrar"'),
  }
}

function enFeedRaiz(p: Pantalla): boolean {
  return p.bottomNav && !p.goBack && !p.bottomSheet
}

export async function asegurarSesionEnFeed(): Promise<void> {
  await driver.hideKeyboard().catch(() => {})
  await volverALaApp()

  let pantalla = await leerPantalla()
  for (
    let i = 0;
    i < 8 &&
    !pantalla.login &&
    !enFeedRaiz(pantalla) &&
    (pantalla.goBack || pantalla.bottomSheet || pantalla.cerrar);
    i++
  ) {
    if (pantalla.bottomSheet) {
      await cerrarBottomSheet()
    } else if (pantalla.goBack) {
      await $('~Go back').click()
    } else {
      await $('~Cerrar')
        .click()
        .catch(() => {})
    }
    await driver.pause(700)
    pantalla = await leerPantalla()
  }

  if (!pantalla.login && !enFeedRaiz(pantalla)) {
    await browser.waitUntil(
      async () => {
        pantalla = await leerPantalla()
        return pantalla.login || enFeedRaiz(pantalla)
      },
      {
        timeout: 30000,
        interval: 1500,
        timeoutMsg:
          'No se encontró ni el feed ni la pantalla de login después de 30s',
      },
    )
  }

  if (!pantalla.bottomNav) {
    await LoginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!)
  }

  await FeedPage.waitForScreenReady()
}

export async function asegurarPantallaInicial(): Promise<void> {
  await driver.hideKeyboard().catch(() => {})

  for (let intento = 0; intento < 5; intento++) {
    if (
      await $('~Inicio')
        .isDisplayed()
        .catch(() => false)
    ) {
      await SideMenuPage.cerrarSesion()
      await LoginPage.waitForScreenReady()
      return
    }

    if (await LoginPage.btnRegistrarse.isDisplayed().catch(() => false)) {
      return
    }

    if (await OnboardingPage.enElWizard()) {
      await OnboardingPage.salirDelWizard()
      continue
    }

    await driver.pause(3000)
  }

  await asegurarSesionEnFeed()
  await SideMenuPage.cerrarSesion()
  await LoginPage.waitForScreenReady()
}
