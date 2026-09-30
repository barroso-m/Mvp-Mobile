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

// Un findElement por accessibility id que NO matchea obliga a UiAutomator2 a
// recorrer el árbol entero y devolver un error; sobre el feed de React Native
// con muchos posts cargados eso llegó a tardar 52s y a matar la instrumentación
// (exit code 255). Como el predicado de abajo necesita justamente dos chequeos
// negativos, se resuelve todo con un único dump del árbol y matching por string.
// Algunos botones de la app ("Ver más" de un curso ya inscripto, links de
// contenido) abren Chrome en vez de navegar dentro de la app. Ahí el árbol
// nativo no tiene ninguno de los locators conocidos y la recuperación por
// "Go back" no aplica, así que todos los tests siguientes caen en cascada.
// Además Chrome queda consumiendo CPU en background y enlentece al emulador.
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

/**
 * Cierra un bottom sheet tocando la zona atenuada POR ENCIMA de él.
 *
 * Antes se hacía `$('~Bottom sheet backdrop').click()`. Ese nodo ocupa la
 * pantalla entera, así que el click va a su centro: con el sheet de comentarios
 * —bajito— el centro cae en la zona atenuada y lo descarta, y por eso funcionó
 * mucho tiempo. Pero el sheet de "Agregar una sección" arranca en y≈431 sobre
 * 1920: ahí el centro cae DENTRO del sheet, no lo cierra, se agotan los 8
 * reintentos de `asegurarSesionEnFeed` y todo lo que sigue muere con "No se
 * encontró ni el feed ni la pantalla de login". El 2026-09-16 eso hizo que TC25
 * —al pasar por primera vez y dejar su sheet abierto— se llevara puestos a
 * TC26..TC35.
 *
 * Se calcula el borde superior real del sheet y se toca por encima.
 */
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
    // Ojo: el match incluye la comilla de cierre a propósito, para no comerse
    // el "Cerrar sesión" del menú lateral.
    cerrar: src.includes('content-desc="Cerrar"'),
  }
}

function enFeedRaiz(p: Pantalla): boolean {
  // El bottom tab bar (con "Crear") sigue visible en pantallas empujadas dentro
  // del mismo stack del tab (ej. Ver Perfil), así que por sí sola su presencia
  // no confirma que estemos en la raíz del Feed. Esas pantallas sí muestran un
  // botón "Go back" en el header, que la raíz del Feed nunca muestra.
  //
  // Un bottom sheet (comentarios de un post) es el tercer caso y el más
  // traicionero: NO empuja pantalla, así que deja "Crear" visible y no agrega
  // "Go back" — el feed entero sigue en el árbol, detrás. Sin este chequeo el
  // helper daba "estamos en el feed" con el sheet abierto y el test siguiente
  // tocaba el sheet creyendo que tocaba un post (TC20 abriendo comentarios en
  // vez del modal de repostear, porque el sheet tapa la fila de acciones).
  return p.bottomNav && !p.goBack && !p.bottomSheet
}

export async function asegurarSesionEnFeed(): Promise<void> {
  // Un test anterior puede haber dejado la app en una pantalla "empujada" sin
  // bottom nav ni login visibles (ej. Configuración > Cuenta > Gestión de
  // cuenta). Antes de asumir que la sesión se perdió, se intenta volver con el
  // botón "Go back" del header las veces que haga falta. A propósito NO se usa
  // el back físico/hardware: en la pantalla raíz del Feed eso saca de la app en
  // vez de cerrar el teclado o navegar, y podría terminar en el launcher.
  // Si un test anterior quedó con el teclado abierto (ej. tras un setValue
  // fallido), puede tapar el botón "Go back" e impedir la recuperación.
  await driver.hideKeyboard().catch(() => {})
  await volverALaApp()

  // Las pantallas full-screen que se cierran con una X (`~Cerrar`) —el composer
  // de "Crear publicación", el modal de "Agregar Educación"— no exponen ni
  // bottom nav, ni "Go back", ni bottom sheet. Sin la rama de `cerrar` las
  // cuatro flags quedaban en false, el loop no llegaba a correr ni una vez y
  // todo terminaba en los 30s del waitUntil de abajo.
  //
  // No es teórico: el 2026-09-25 el cuelgue del publish (PENDIENTES.md, "El
  // cuelgue del publish sigue latente") dejó el composer abierto en TC10 y,
  // como los 5 specs comparten una sola sesión, se llevó puestos 13 casos de
  // Feed y Profile en cascada.
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
      // El árbol puede cambiar entre el dump de `leerPantalla()` y el click:
      // el composer cierra solo si el publish que lo dejó colgado termina
      // resolviendo. Que el nodo ya no esté no es un fallo —la vuelta
      // siguiente del loop relee la pantalla—, pero un click a secas tira
      // "element wasn't found" y tumba el test que intentaba recuperarse.
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

/**
 * Deja la app en la pantalla inicial (con "Iniciar sesión" / "Registrarse"),
 * que es de donde arranca el wizard de registro.
 *
 * La suite comparte una sola sesión, así que acá se llega desde cualquier lado:
 * logueado en el feed (las 5 specs anteriores), parado en cualquier paso del
 * wizard (los casos de esta spec que no completan el alta) o logueado con una
 * cuenta recién creada (TC44/TC45). Los tres casos se resuelven explícitamente;
 * `asegurarSesionEnFeed` queda solo como último recurso, porque no sabe salir
 * del wizard ni reconoce una cuenta nueva.
 */
export async function asegurarPantallaInicial(): Promise<void> {
  await driver.hideKeyboard().catch(() => {})

  // El orden importa y no es cosmético. Cada chequeo se hace con una búsqueda
  // POSITIVA por accessibility-id (barata) y se prueba primero la que matchea
  // en la pantalla más cara: si estamos en el feed, "Inicio" corta ahí mismo y
  // nunca se llega a buscar algo que NO está en ese árbol —que es el patrón
  // que cuelga la instrumentación—. Tampoco sirve un `getPageSource` acá: el
  // del feed cargado no responde de forma confiable.
  for (let intento = 0; intento < 5; intento++) {
    // Logueado. Ojo: una cuenta recién registrada entra SIN el botón "Crear"
    // (todavía no está habilitada para publicar), así que la señal es el tab
    // "Inicio" y no "Crear" como en `asegurarSesionEnFeed`.
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

    // Ni app, ni pantalla inicial, ni wizard: lo más probable es el feed
    // todavía cargando después de un alta. Se le da tiempo antes de rendirse.
    await driver.pause(3000)
  }

  // Último recurso: la recuperación genérica de la suite.
  await asegurarSesionEnFeed()
  await SideMenuPage.cerrarSesion()
  await LoginPage.waitForScreenReady()
}
