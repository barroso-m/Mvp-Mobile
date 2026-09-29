export const ChatLocators = {
  // El tab de la navbar prefija la cantidad de no leídos en el content-desc
  // ("32, Mensajes"), así que `~Mensajes` a secas NO matchea cuando hay
  // mensajes sin leer. Hay que contemplar las dos formas.
  tabMensajes:
    '//android.view.View[@content-desc="Mensajes" or contains(@content-desc, ", Mensajes")]',
  // Solo existe cuando hay no leídos: es el mismo nodo del tab, pero exigiendo
  // el prefijo numérico.
  tabMensajesConBadge:
    '//android.view.View[contains(@content-desc, ", Mensajes")]',
  // El texto "Mensajes" aparece dos veces: el título de la pantalla y la label
  // del tab de la navbar. El título va primero en el árbol.
  tituloMensajes: '(//android.widget.TextView[@text="Mensajes"])[1]',
  btnNuevo: '~Nuevo',
  inputBuscador: '//android.widget.EditText',
  tabTodas: '~Todas',
  tabNoLeidas: '~No leídas',
  tabSolicitudes: '//*[contains(@content-desc, "Solicitudes")]',
  // La lista de conversaciones es un ScrollView de React Native, no un
  // RecyclerView (la app no usa ninguno). El match es por clase exacta, así
  // que no colisiona con el HorizontalScrollView de la fila de tabs.
  listaConversaciones: '//android.widget.ScrollView',
  emptyStateSinResultados: '//*[@text="No se encontraron resultados"]',

  // --- Conversación abierta ---
  // El composer expone resource-id propios (raro en esta app, que es
  // WebView-based): preferirlos siempre sobre XPath posicional.
  inputMensaje: '//*[@resource-id="auto-complete-text-input"]',
  btnEnviarMensaje: '//*[@resource-id="send-button"]',
  btnAdjuntar: '//*[@resource-id="attach-button"]',
  btnComandos: '//*[@resource-id="commands-button"]',
  // Cuando el otro usuario todavía no aceptó la solicitud, la conversación se
  // abre SIN composer y muestra este aviso en su lugar.
  avisoAprobacionPendiente: '//*[contains(@text, "aprobación del usuario")]',
  btnGoBack: '~Go back',
  headerNombreUsuario: (nombre: string) =>
    `//android.widget.TextView[@text="${nombre}"]`,
  burbujaPorTexto: (texto: string) =>
    `//android.widget.TextView[@text="${texto}"]`,
  conversacionPorNombre: (nombre: string) =>
    `//android.view.ViewGroup[starts-with(@content-desc, "${nombre},")]`,

  // --- Panel "Nuevo mensaje" ---
  tituloBuscarUsuarios: '//*[@text="Buscar usuarios"]',
  inputBuscarUsuarios: '//android.widget.EditText',
  hintMinimoCaracteres: '//*[contains(@text, "al menos 3 caracteres")]',
  emptyStateSinUsuarios:
    '//*[contains(@text, "No hay usuarios que coincidan")]',
  resultadoUsuarioPorNombre: (nombre: string) =>
    `//android.view.ViewGroup[starts-with(@content-desc, "${nombre}")]`,
} as const
