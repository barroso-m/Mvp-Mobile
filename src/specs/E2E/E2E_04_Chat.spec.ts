import ChatPage from '../../pages/Intramed/ChatPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

/** Precondición de datos (cuenta de prueba): tiene que existir una conversación
 * YA ACEPTADA por el otro usuario. Las conversaciones pendientes de aprobación
 * (ej. "Dr. Chat Test") se abren SIN composer y muestran "Tienes que recibir la
 * aprobación del usuario..." en su lugar — no sirven para TC39. */
const CONVERSACION_ACEPTADA = 'Ing. Tincho Barroso'

/** Términos para el buscador de usuarios del panel "Nuevo". */
const TERMINO_CON_RESULTADOS = 'Tin'
const TERMINO_SIN_RESULTADOS = 'zzzzz999'

describe('[#chat] Mensajes', () => {
  it('TC14 [CHT-M-001] - la pantalla de Mensajes se visualiza con todos sus elementos', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())
    await step('Validar título, botón Nuevo y buscador', async () => {
      await expect(ChatPage.tituloMensajes).toBeDisplayed()
      await expect(ChatPage.btnNuevo).toBeDisplayed()
      await expect(ChatPage.inputBuscador).toBeDisplayed()
    })
    await step('Validar tabs Todas / No leídas / Solicitudes', async () => {
      await expect(ChatPage.tabTodas).toBeDisplayed()
      await expect(ChatPage.tabNoLeidas).toBeDisplayed()
      await expect(ChatPage.tabSolicitudes).toBeDisplayed()
    })
    await step(
      'Validar que la lista de conversaciones es visible',
      async () => {
        await expect(ChatPage.listaConversaciones).toBeDisplayed()
      },
    )
  })

  it('TC15 [CHT-M-008] - el buscador filtra conversaciones y muestra empty state sin coincidencias', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())
    await step('Buscar término sin coincidencias', () =>
      ChatPage.buscarConversacion('zzzz123'),
    )
    await step('Validar empty state de sin resultados', async () => {
      await expect(ChatPage.emptyStateSinResultados).toBeDisplayed()
    })
    await step('Limpiar el buscador', () => ChatPage.limpiarBuscador())
    await step('Validar que vuelve a mostrarse la lista completa', async () => {
      await expect(ChatPage.listaConversaciones).toBeDisplayed()
      await expect(ChatPage.emptyStateSinResultados).not.toBeDisplayed()
    })
  })

  it('TC39 [IE-T70] - enviar un mensaje en una conversación existente', async () => {
    const mensaje = `Mensaje QA ${Date.now()}`

    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())
    await step(`Abrir la conversación con ${CONVERSACION_ACEPTADA}`, () =>
      ChatPage.abrirConversacion(CONVERSACION_ACEPTADA),
    )
    await step('Validar que el composer está disponible', async () => {
      await expect(ChatPage.avisoAprobacionPendiente).not.toBeDisplayed()
      await expect(ChatPage.inputMensaje).toBeDisplayed()
      await expect(ChatPage.btnAdjuntar).toBeDisplayed()
    })
    await step(
      'Validar que el botón de enviar arranca deshabilitado sin texto',
      async () => {
        await expect(ChatPage.btnEnviarMensaje).toBeDisabled()
      },
    )
    await step('Escribir y enviar el mensaje', () =>
      ChatPage.enviarMensaje(mensaje),
    )
    await step(
      'Validar que la burbuja aparece en la conversación',
      async () => {
        await expect(ChatPage.burbujaPorTexto(mensaje)).toBeDisplayed()
      },
    )
    await step('Validar que el composer se limpió tras enviar', async () => {
      await expect(ChatPage.btnEnviarMensaje).toBeDisabled()
    })
    await step('Volver a la lista de conversaciones', () =>
      ChatPage.volverALaLista(),
    )
    await step(
      'Validar que la conversación quedó con el mensaje como último',
      () =>
        ChatPage.esperarUltimoMensajeEnLista(CONVERSACION_ACEPTADA, mensaje),
    )
  })

  it('TC40 [IE-T71] - el panel "Nuevo mensaje" busca usuarios y resuelve con y sin resultados', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())
    await step('Abrir el panel "Nuevo"', () =>
      ChatPage.abrirPanelNuevoMensaje(),
    )
    await step('Validar el estado inicial del panel', async () => {
      await expect(ChatPage.tituloBuscarUsuarios).toBeDisplayed()
      await expect(ChatPage.inputBuscarUsuarios).toBeDisplayed()
      await expect(ChatPage.hintMinimoCaracteres).toBeDisplayed()
      await expect(ChatPage.btnGoBack).toBeDisplayed()
    })
    await step(`Buscar "${TERMINO_CON_RESULTADOS}"`, () =>
      ChatPage.buscarUsuario(TERMINO_CON_RESULTADOS),
    )
    await step('Validar que se listan usuarios', async () => {
      // El hint de "mínimo 3 caracteres" desaparece al disparar la búsqueda, y
      // la ausencia del empty state confirma que la respuesta trajo usuarios.
      await expect(ChatPage.hintMinimoCaracteres).not.toBeDisplayed()
      await expect(ChatPage.emptyStateSinUsuarios).not.toBeDisplayed()
    })
    await step(`Buscar "${TERMINO_SIN_RESULTADOS}"`, () =>
      ChatPage.buscarUsuario(TERMINO_SIN_RESULTADOS),
    )
    await step('Validar el empty state de búsqueda de usuarios', async () => {
      await expect(ChatPage.emptyStateSinUsuarios).toBeDisplayed()
    })
    await step('Cerrar el panel', async () => {
      await ChatPage.btnGoBack.click()
      await expect(ChatPage.tituloMensajes).toBeDisplayed()
    })
  })

  it('TC41 [IE-T72] - el tab "No leídas" filtra solo conversaciones sin leer', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())

    const todas = await step('Leer la lista completa en "Todas"', async () => {
      await ChatPage.irATabTodas()
      return ChatPage.conversacionesVisibles()
    })

    await step('Ir al tab "No leídas"', () => ChatPage.irATabNoLeidas())
    await step(
      'Validar que "No leídas" es un subconjunto de "Todas"',
      async () => {
        const noLeidas = await ChatPage.conversacionesVisibles()
        expect(noLeidas.length).toBeLessThanOrEqual(todas.length)
        for (const nombre of noLeidas) {
          expect(todas).toContain(nombre)
        }
      },
    )
    await step(
      'Validar consistencia con el contador de la navbar',
      async () => {
        const noLeidas = await ChatPage.conversacionesVisibles()
        const contador = await ChatPage.contadorNoLeidosNavbar()
        // El contador de la navbar cuenta MENSAJES, no conversaciones: solo se
        // puede afirmar que ambos indicadores coinciden en "hay / no hay".
        expect(contador > 0).toBe(noLeidas.length > 0)
      },
    )
    await step('Volver al tab "Todas"', () => ChatPage.irATabTodas())
    await step('Validar que se restaura la lista completa', async () => {
      const restaurada = await ChatPage.conversacionesVisibles()
      expect(restaurada).toEqual(todas)
    })
  })

  it('TC42 [IE-T75] - el tab "Solicitudes" muestra su contador y el estado correspondiente', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())
    await step('Ir al tab "Solicitudes"', () => ChatPage.irATabSolicitudes())

    await step(
      'Validar que el contenido concuerda con el contador de la label',
      async () => {
        const solicitudes = await ChatPage.contadorSolicitudes()
        if (solicitudes === 0) {
          await expect(ChatPage.emptyStateSinResultados).toBeDisplayed()
        } else {
          const filas = await ChatPage.conversacionesVisibles()
          expect(filas.length).toBe(solicitudes)
        }
      },
    )
    await step('Volver al tab "Todas"', () => ChatPage.irATabTodas())
    await step('Validar que se vuelve a ver la lista', async () => {
      await expect(ChatPage.listaConversaciones).toBeDisplayed()
    })
  })

  it('TC43 [IE-T74] - la pill de no leídos del tab Mensajes refleja el estado de la bandeja', async () => {
    await step('Asegurar que el user está logueado', () =>
      asegurarSesionEnFeed(),
    )
    // Leer la pill parado en el Feed es parte del caso: tiene que ser visible
    // desde cualquier tab, no solo dentro de Mensajes.
    await step('Validar que el tab Mensajes es visible desde el Feed', () =>
      expect(ChatPage.tabMensajes).toBeDisplayed(),
    )

    const contador = await step('Leer el valor de la pill', () =>
      ChatPage.contadorNoLeidosNavbar(),
    )

    await step('Abrir el tab "Mensajes"', () => ChatPage.abrirTab())
    await step('Ir al tab "No leídas"', () => ChatPage.irATabNoLeidas())
    await step(
      'Validar que la pill concuerda con la bandeja de no leídas',
      async () => {
        const noLeidas = await ChatPage.conversacionesVisibles()
        if (contador > 0) {
          expect(noLeidas.length).toBeGreaterThan(0)
        } else {
          await expect(ChatPage.emptyStateSinResultados).toBeDisplayed()
        }
      },
    )
    await step('Volver al tab "Todas"', () => ChatPage.irATabTodas())
  })
})
