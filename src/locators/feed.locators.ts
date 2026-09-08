export const FeedLocators = {
  btnCrear: '~Crear',
  btnPerfil: '//android.widget.Button[@bounds="[46,116][161,231]"]',
  btnConfiguracion: '~Configuración de usuario',
  btnEliminarCuenta: '~Eliminar cuenta',
  btnSeleccionarImagen: '~Seleccionar imagen',
  imgGaleriaItem:
    '//android.widget.ImageView[@resource-id="com.google.android.providers.media.module:id/icon_thumbnail"]',
  btnCambiarImagen: '~Cambiar imagen',
  btnCortarImagen:
    '//*[@resource-id="com.intramed.core.staging:id/crop_image_menu_crop"]',
  inputTexto: '//android.widget.EditText',
  btnSiguiente: '~Siguiente',
  btnPublicar: '~Publicar',
  toastExito: '//*[@text="Publicación creada con éxito."]',
  inputComentario: '//android.widget.EditText',
  btnEnviarComentario: '~comentario',
  postContainerByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]`,
  // Nota: la posición XPath entre corchetes cuenta solo entre hermanos ViewGroup,
  // renumerados desde 1 — no es el atributo @index crudo del dump de uiautomator.
  // Estructura real confirmada de un post propio (hijos ViewGroup, en orden):
  // [1] like · [2] contador de likes · [3] comentar · [4] repostear ·
  // [5] contador de reposts · [6] compartir.
  btnReaccionarPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[1]`,
  btnComentarPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[3]`,
  btnVerMas: '~Ver más',
  btnCompartirPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[6]`,
  contadorComentariosDePost: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]//android.widget.TextView[contains(@text, "comentario")]`,
  btnRepostearPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[4]`,
  contadorLikesPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[2]/android.widget.TextView`,
  // El post reposteado no expone su texto en @content-desc (a diferencia de un post
  // propio), por eso se ubica por el TextView exacto y se navega por eje following::.
  btnGuardarRepostByText: (texto: string) =>
    `//android.widget.TextView[@text="${texto}"]/following::android.view.ViewGroup[9]`,
  repostEditor: '//android.widget.EditText',
  btnRepostearSubmit: '~Repostear',
  btnFiltro: '//android.view.ViewGroup[@bounds="[976,145][1034,203]"]',
  btnAplicarFiltros: '~Aplicar filtros',
  btnLimpiarFiltros: '~Limpiar',
  chipFiltro: (label: string) => `~${label}`,
} as const
