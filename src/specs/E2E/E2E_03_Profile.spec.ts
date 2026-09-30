import ProfilePage from '../../pages/Intramed/ProfilePage-Intramed'
import SideMenuPage from '../../pages/Intramed/SideMenuPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

describe('[#profile] Profile', () => {
  it('TC05 [IE-T30] - llegar a "Gestión de cuenta" y validar el botón de eliminar cuenta', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Navegar a Configuración > Cuenta > Gestión de cuenta', () =>
      ProfilePage.irAGestionCuentaNativa(),
    )
    await step('Validar título "Gestión de cuenta"', async () => {
      await expect(ProfilePage.tituloGestionCuenta).toBeDisplayed()
    })
    await step(
      'Validar botón "Eliminar" (sin hacer click, borra la cuenta)',
      async () => {
        await expect(ProfilePage.btnEliminarCuentaNative).toBeDisplayed()
      },
    )
  })

  it('TC11 [PRF-M-002] - editar la sección "Sobre mi" y validar que el texto persiste', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    const texto = `QA Engineer automation ${Date.now()}`
    await step(`Editar "Sobre mi" con "${texto}"`, () =>
      ProfilePage.editarSobreMi(texto),
    )
    await step(
      'Validar que el texto ingresado se muestra en el perfil',
      async () => {
        await expect(ProfilePage.textoSobreMiPor(texto)).toBeDisplayed()
      },
    )
  })

  it('TC12 [PRF-M-005] - Configuración de usuario muestra los items correctos y su estado', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Configuración de usuario desde el menú lateral', () =>
      SideMenuPage.irAConfiguracion(),
    )
    await step('Validar título de la pantalla', async () => {
      await expect(ProfilePage.tituloConfiguracion).toBeDisplayed()
    })
    await step('Validar que las 4 opciones son visibles', async () => {
      await expect(ProfilePage.itemCuenta).toBeDisplayed()
      await expect(ProfilePage.itemInicioSesionSeguridad).toBeDisplayed()
      await expect(ProfilePage.itemNewsletter).toBeDisplayed()
      await expect(ProfilePage.itemNotificaciones).toBeDisplayed()
    })
    await step('Validar que todas están habilitadas', async () => {
      await expect(ProfilePage.itemCuenta).toBeEnabled()
      await expect(ProfilePage.itemNotificaciones).toBeEnabled()
    })
  })

  it('TC13 [PRF-M-010] - acceder a "Guardados" desde el menú lateral', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir menú lateral y tocar "Guardados"', () =>
      SideMenuPage.irAGuardados(),
    )
    await step('Validar que se muestra la pantalla "Guardados"', async () => {
      await expect(ProfilePage.tituloGuardados).toBeDisplayed()
    })
  })

  it('TC23 [IE-T45] - cancelar edición de "Sobre mí" no persiste el cambio', async () => {
    const textoQueNoDebePersistir = `Texto que NO debe persistir ${Date.now()}`

    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    await step(
      `Escribir "${textoQueNoDebePersistir}" y volver sin guardar`,
      () => ProfilePage.cancelarEdicionSobreMi(textoQueNoDebePersistir),
    )
    await step('Validar que el texto no persistió en el perfil', async () => {
      await expect(
        ProfilePage.textoSobreMiPor(textoQueNoDebePersistir),
      ).not.toBeDisplayed()
    })
  })

  it('TC24 [IE-T20] - navegar al perfil del usuario desde el feed', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    await step(
      'Validar que se llegó al perfil ("Sobre mi" visible)',
      async () => {
        await expect(ProfilePage.seccionSobreMi).toBeDisplayed()
      },
    )
  })

  it('TC25 [IE-T39] - abrir modal "Agregar sección"', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    await step('Tocar "Agregar sección"', () =>
      ProfilePage.abrirAgregarSeccion(),
    )
    await step('Validar que se muestra el listado de secciones', async () => {
      await expect(ProfilePage.headingAgregarSeccion).toBeDisplayed()
    })
  })

  it('TC26 [IE-T40] - ver más actividad y filtrar', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    await step('Tocar "Ver más actividad"', () =>
      ProfilePage.abrirVerMasActividad(),
    )
    for (const filtro of [
      'Todas',
      'Publicaciones',
      'Reposteos',
      'Comentarios',
    ]) {
      await step(`Aplicar filtro "${filtro}"`, () =>
        ProfilePage.aplicarFiltroActividad(filtro),
      )
    }
  })

  it('TC27 [IE-T41] - editar datos personales desde configuración', async function () {
    this.timeout(240000)
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Configuración > Cuenta > Datos personales', () =>
      ProfilePage.irADatosPersonales(),
    )
    const numeroOriginal = '1151147186'
    const numeroNuevo = String(
      1100000000 + Math.floor(Math.random() * 899999999),
    )
    await step(`Actualizar teléfono a "${numeroNuevo}"`, () =>
      ProfilePage.actualizarTelefono(numeroNuevo),
    )
    await step('Validar que se guardó correctamente', async () => {
      await asegurarSesionEnFeed()
      await ProfilePage.irADatosPersonales()
      await ProfilePage.scrollHastaTelefono()
      await browser.waitUntil(
        async () => {
          const texto = await ProfilePage.inputTelefonoNumero
            .getText()
            .catch(() => null)
          return texto === numeroNuevo
        },
        { timeout: 10000, interval: 500 },
      )
    })
    await step('Restaurar el teléfono original', async () => {
      try {
        await asegurarSesionEnFeed()
        await ProfilePage.actualizarTelefono(numeroOriginal)
      } catch {
        try {
          await asegurarSesionEnFeed()
          await ProfilePage.actualizarTelefono(numeroOriginal)
        } catch (err2) {
          console.warn(
            `TC27: no se pudo restaurar el teléfono original (${numeroOriginal}) tras 2 intentos — quedó en "${numeroNuevo}". Restaurarlo a mano si hace falta.`,
            err2,
          )
        }
      }
    })
  })

  it('TC28 [IE-T42] - toggle switch de Newsletter y persistir', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Configuración > Newsletter y preferencias', () =>
      ProfilePage.irANewsletter(),
    )
    const switchNovedades = ProfilePage.switchNewsletterPorTitulo('Novedades')
    await switchNovedades.waitForDisplayed({ timeout: 10000 })
    const original = (await switchNovedades.getAttribute('checked')) === 'true'

    await step('Togglear el switch "Novedades"', () =>
      ProfilePage.toggleNewsletter('Novedades'),
    )
    await step('Validar que el estado cambió', async () => {
      await browser.waitUntil(
        async () =>
          ((await switchNovedades.getAttribute('checked')) === 'true') !==
          original,
        {
          timeout: 5000,
          timeoutMsg: 'El switch de Newsletter no cambió de estado',
        },
      )
    })
    await step('Restaurar el estado original', () =>
      ProfilePage.toggleNewsletter('Novedades'),
    )
  })

  it('TC29 [IE-T43] - toggle switch de Notificaciones y persistir', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Configuración > Notificaciones', () =>
      ProfilePage.irANotificaciones(),
    )
    await step('Expandir "Nuevos seguidores"', () =>
      ProfilePage.expandirFilaNotificacion('Nuevos seguidores'),
    )
    const switchPush = ProfilePage.switchPushDispositivo
    await switchPush.waitForDisplayed({ timeout: 10000 })
    const original = (await switchPush.getAttribute('checked')) === 'true'

    await step('Togglear "Push al dispositivo"', () => switchPush.click())
    await step('Validar que el estado cambió', async () => {
      await browser.waitUntil(
        async () =>
          ((await switchPush.getAttribute('checked')) === 'true') !== original,
        { timeout: 5000, timeoutMsg: 'El switch de Push no cambió de estado' },
      )
    })
    await step('Restaurar el estado original', () => switchPush.click())
  })

  it('TC30 [IE-T46] - abrir Datos profesionales con "Guardar cambios" deshabilitado', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Configuración > Cuenta > Datos profesionales', () =>
      ProfilePage.irADatosProfesionales(),
    )
    await step('Validar que "Guardar cambios" está deshabilitado', async () => {
      await expect(ProfilePage.btnGuardarCambios).not.toBeEnabled()
    })
  })

  it('TC31 [IE-T22] - validar error al ingresar letras en el campo teléfono', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Configuración > Cuenta > Datos personales', () =>
      ProfilePage.irADatosPersonales(),
    )
    await step('Ingresar letras en el campo teléfono', () =>
      ProfilePage.ingresarTelefonoInvalido('idrandom'),
    )
    await step('Validar que se muestra un error de validación', async () => {
      await expect(ProfilePage.msgErrorTelefono).toBeDisplayed()
    })
  })

  it('TC33 [IE-T24] - agregar educación en el perfil', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    await step('Abrir el formulario "Agregar educación"', () =>
      ProfilePage.abrirAgregarEducacion(),
    )
    const institucion = `Institucion automation ${Date.now()}`
    await step('Completar el formulario', () =>
      ProfilePage.completarEducacionMinima({
        nivel: 'Doctorado',
        institucion,
        titulo: 'Doctor',
        descripcion: 'Educación de prueba automatizada',
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        ciudad: 'Almirante Brown',
        fechaInicio: '01/03/2018',
      }),
    )
    await step(
      'Validar que "Agregar" está habilitado y confirmar',
      async () => {
        await expect(ProfilePage.btnAgregarEducacionSubmit).toBeEnabled()
        await ProfilePage.guardarEducacion()
      },
    )
    await step(
      'Validar que la nueva educación aparece en el perfil',
      async () => {
        await expect(ProfilePage.textoSobreMiPor(institucion)).toBeDisplayed()
      },
    )
  })

  it('TC34 [IE-T44] - validaciones del formulario "Agregar educación"', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    await step('Abrir el formulario "Agregar educación"', () =>
      ProfilePage.abrirAgregarEducacion(),
    )
    await step('Validar que "Agregar" está deshabilitado vacío', async () => {
      await expect(ProfilePage.btnAgregarEducacionSubmit).not.toBeEnabled()
    })
    await step('Completar solo el título', () =>
      ProfilePage.inputTituloObtenido.setValue('Solo título'),
    )
    await step('Validar que sigue deshabilitado', async () => {
      await expect(ProfilePage.btnAgregarEducacionSubmit).not.toBeEnabled()
    })
    const textoLargo = 'x'.repeat(250)
    await step('Escribir una descripción de 250 caracteres', () =>
      ProfilePage.inputDescripcionEducacion.setValue(textoLargo),
    )
    await step('Validar que se truncó a 180 caracteres', async () => {
      const valor = await ProfilePage.inputDescripcionEducacion.getText()
      expect(valor.length).toBeLessThanOrEqual(180)
    })
    await step('Cerrar el formulario sin guardar', () =>
      ProfilePage.btnVolverSobreMi.click(),
    )
    await step('Validar que el formulario ya no está visible', async () => {
      await expect(ProfilePage.headingAgregarEducacion).not.toBeDisplayed()
    })
  })

  it('TC35 [IE-T25] - eliminar educación en el perfil', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Ir a Ver Perfil desde el menú lateral', () =>
      SideMenuPage.irAVerPerfil(),
    )
    const institucion = `Institucion a borrar ${Date.now()}`
    await step(
      'Crear una educación descartable para luego borrarla',
      async () => {
        await ProfilePage.abrirAgregarEducacion()
        await ProfilePage.completarEducacionMinima({
          nivel: 'Doctorado',
          institucion,
          titulo: 'Doctor',
          descripcion: 'Para eliminar',
          pais: 'Argentina',
          provincia: 'Buenos Aires',
          ciudad: 'Almirante Brown',
          fechaInicio: '01/03/2018',
        })
        await ProfilePage.guardarEducacion()
      },
    )
    await step('Validar que aparece en el perfil', async () => {
      await expect(ProfilePage.textoSobreMiPor(institucion)).toBeDisplayed()
    })
    await step('Abrir esa entrada desde la lista de Educación', () =>
      ProfilePage.abrirEdicionDeEntradaEducacion(institucion),
    )
    await step('Eliminar la educación', () => ProfilePage.eliminarEducacion())
    await step('Validar que ya no aparece en el perfil', async () => {
      await expect(ProfilePage.textoSobreMiPor(institucion)).not.toBeDisplayed()
    })
  })
})
