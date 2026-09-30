export const ChatLocators = {
  tabMensajes:
    '//android.view.View[@content-desc="Mensajes" or contains(@content-desc, ", Mensajes")]',
  tabMensajesConBadge:
    '//android.view.View[contains(@content-desc, ", Mensajes")]',
  tituloMensajes: '(//android.widget.TextView[@text="Mensajes"])[1]',
  btnNuevo: '~Nuevo',
  inputBuscador: '//android.widget.EditText',
  tabTodas: '~Todas',
  tabNoLeidas: '~No leídas',
  tabSolicitudes: '//*[contains(@content-desc, "Solicitudes")]',
  listaConversaciones: '//android.widget.ScrollView',
  emptyStateSinResultados: '//*[@text="No se encontraron resultados"]',

  inputMensaje: '//*[@resource-id="auto-complete-text-input"]',
  btnEnviarMensaje: '//*[@resource-id="send-button"]',
  btnAdjuntar: '//*[@resource-id="attach-button"]',
  btnComandos: '//*[@resource-id="commands-button"]',
  avisoAprobacionPendiente: '//*[contains(@text, "aprobación del usuario")]',
  btnGoBack: '~Go back',
  headerNombreUsuario: (nombre: string) =>
    `//android.widget.TextView[@text="${nombre}"]`,
  burbujaPorTexto: (texto: string) =>
    `//android.widget.TextView[@text="${texto}"]`,
  conversacionPorNombre: (nombre: string) =>
    `//android.view.ViewGroup[starts-with(@content-desc, "${nombre},")]`,

  tituloBuscarUsuarios: '//*[@text="Buscar usuarios"]',
  inputBuscarUsuarios: '//android.widget.EditText',
  hintMinimoCaracteres: '//*[contains(@text, "al menos 3 caracteres")]',
  emptyStateSinUsuarios:
    '//*[contains(@text, "No hay usuarios que coincidan")]',
  resultadoUsuarioPorNombre: (nombre: string) =>
    `//android.view.ViewGroup[starts-with(@content-desc, "${nombre}")]`,
} as const
