import ChatPage from '../../pages/Intramed/ChatPage-Intramed'
import { asegurarSesionEnFeed } from '../../utils/session.helper'
import { step } from '../../utils/logger'

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
})
