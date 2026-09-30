export const FeedLocators = {
  btnCrear: '~Crear',
  btnPerfil: '//android.widget.Button[@bounds="[46,116][161,231]"]',
  btnConfiguracion: '~Configuración de usuario',
  btnEliminarCuenta: '~Eliminar cuenta',
  btnSeleccionarImagen: '//*[starts-with(@content-desc, "Seleccionar imagen")]',
  imgGaleriaItem:
    '//android.widget.ImageView[@resource-id="com.google.android.providers.media.module:id/icon_thumbnail"]',
  btnCambiarImagen: '//*[starts-with(@content-desc, "Cambiar imagen")]',
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
  btnReaccionarPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[1]`,
  btnComentarPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[3]`,
  postPorPrefijo: (prefijo: string) =>
    `//android.widget.TextView[starts-with(@text, "${prefijo}")]`,
  btnVerMasDePostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]//*[@content-desc="Ver más"]`,
  btnMenuPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.View/android.view.ViewGroup[3]/android.view.ViewGroup`,
  btnEditarPost: '~Editar',
  btnEliminarPost: '~Eliminar',
  btnConfirmarEliminarPost: '//android.widget.Button[@text="ELIMINAR"]',
  btnCancelarEliminarPost: '//android.widget.Button[@text="CANCELAR"]',
  btnCompartirPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[6]`,
  contadorComentariosDePost: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]//android.widget.TextView[contains(@text, "comentario")]`,
  btnRepostearPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[4]`,
  contadorLikesPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[2]/android.widget.TextView`,
  btnGuardarRepostByText: (texto: string) =>
    `//android.widget.TextView[@text="${texto}"]/following::android.view.ViewGroup[9]`,
  repostEditor: '//android.widget.EditText',
  btnRepostearSubmit: '~Repostear',
  btnFiltro: '//android.view.ViewGroup[@bounds="[976,145][1034,203]"]',
  btnAplicarFiltros: '~Aplicar filtros',
  btnLimpiarFiltros: '~Limpiar',
  chipFiltro: (label: string) => `~${label}`,
} as const
