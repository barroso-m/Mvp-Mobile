export const ChatLocators = {
  tabMensajes: '~Mensajes',
  tituloMensajes: '//*[@text="Mensajes"]',
  btnNuevo: '~Nuevo',
  inputBuscador: '//android.widget.EditText[@hint="Buscar conversaciones..."]',
  tabTodas: '~Todas',
  tabNoLeidas: '~No leídas',
  tabSolicitudes: '//*[contains(@text, "Solicitudes")]',
  listaConversaciones: '//androidx.recyclerview.widget.RecyclerView',
  emptyStateSinResultados: '//*[contains(@text, "No hay conversaciones")]',
  inputMensaje: '//android.widget.EditText',
  btnEnviarMensaje: '~Enviar',
  headerNombreUsuario: (nombre: string) => `//*[@text="${nombre}"]`,
  conversacionPorNombre: (nombre: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${nombre}")]`,
} as const
