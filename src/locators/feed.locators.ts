export const FeedLocators = {
  btnCrear: '~Crear',
  btnPerfil: '//android.widget.Button[@bounds="[46,116][161,231]"]',
  btnConfiguracion: '~Configuración de usuario',
  btnEliminarCuenta: '~Eliminar cuenta',
  // El APK del 2026-09-06 renombró el botón de "Seleccionar imagen" a
  // "Seleccionar imagen o video" (el composer ahora acepta MP4 hasta 50MB).
  // Se ancla por prefijo para no volver a romperse si la etiqueta sigue
  // creciendo; no es ruta caliente, corre una sola vez por TC03.
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
  // Nota: la posición XPath entre corchetes cuenta solo entre hermanos ViewGroup,
  // renumerados desde 1 — no es el atributo @index crudo del dump de uiautomator.
  // Estructura real confirmada de un post propio (hijos ViewGroup, en orden):
  // [1] like · [2] contador de likes · [3] comentar · [4] repostear ·
  // [5] contador de reposts · [6] compartir.
  btnReaccionarPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[1]`,
  btnComentarPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.ViewGroup[3]`,
  // Un post largo llega truncado al feed: su TextView expone el texto cortado, no
  // el que se publicó. Por eso se ancla por prefijo y no por igualdad exacta.
  postPorPrefijo: (prefijo: string) =>
    `//android.widget.TextView[starts-with(@text, "${prefijo}")]`,
  // El "Ver más" del post indicado, no el primero del feed: con varios posts
  // largos en pantalla el locator global expandía el que no era.
  btnVerMasDePostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]//*[@content-desc="Ver más"]`,
  // Menú "..." del post. No expone ni @text ni @content-desc: es el tercer
  // ViewGroup del header (avatar · autor · menú), y el clickeable es su HIJO, no
  // él mismo. Estructura idéntica en la card del feed y en el detalle del post
  // (relevado 2026-09-15, recon/post-menu-propio.xml).
  btnMenuPostByText: (texto: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${texto}")]/android.view.View/android.view.ViewGroup[3]/android.view.ViewGroup`,
  // Bottom sheet que abre ese menú: estas sí exponen content-desc.
  btnEditarPost: '~Editar',
  btnEliminarPost: '~Eliminar',
  // La confirmación es un AlertDialog nativo: sus botones solo tienen @text, en
  // mayúsculas y sin content-desc.
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
