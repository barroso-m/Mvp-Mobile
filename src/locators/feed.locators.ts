export const FeedLocators = {
  btnCrear: '~Crear',
  btnPerfil: '//android.widget.Button[@bounds="[46,116][161,231]"]',
  btnConfiguracion: '~Configuración de usuario',
  btnEliminarCuenta: '~Eliminar cuenta',
  btnSeleccionarImagen: '~Seleccionar imagen',
  imgGaleriaItem:
    '//android.widget.ImageView[@resource-id="com.google.android.providers.media.module:id/icon_thumbnail"]',
  btnCambiarImagen: '~Cambiar imagen',
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
} as const
