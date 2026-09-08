export const ProfileLocators = {
  // Sobre mí
  seccionSobreMi: '//*[@text="Sobre mi"]',
  lapizSobreMi: '~Editar sobre mí',
  inputSobreMi: '//android.widget.EditText',
  // La pantalla de edición es full-screen (no modal): "Guardar cambios" persiste,
  // la flecha "Go back" del header descarta sin guardar. No hay botón "Cancelar".
  btnGuardarSobreMi: '~Guardar cambios',
  btnVolverSobreMi: '~Go back',
  textoSobreMiPor: (texto: string) => `//*[@text="${texto}"]`,

  // Perfil: actividad y secciones
  btnVerMasActividad: '~Ver más actividad',
  // No existe un botón "Agregar sección" propio: la tarjeta vacía de
  // "información profesional" (debajo de Instituciones) tiene el CTA
  // "Comenzar", que abre el mismo modal "Agregar una sección". Solo aparece
  // si el usuario todavía no cargó ninguna sección profesional.
  // OJO: "Comenzar" NO es accessibility-id único en la pantalla — más abajo
  // hay otro botón con la misma etiqueta que abre "Crear publicación". Se
  // ancla por texto único de la tarjeta para no ambigüar.
  btnComenzarSeccionProfesional:
    '//*[@text="Aún no cargaste tu información profesional"]/following::android.widget.Button[1]',
  headingAgregarSeccion: '//*[@text="Agregar una sección"]',
  opcionSeccion: (nombre: string) => `//*[@text="${nombre}"]`,
  headingOrdenarSecciones: '//*[@text="Ordenar secciones"]',

  // Actividad (pantalla "Ver más actividad")
  filtroActividad: (label: string) => `~${label}`,

  // Educación (formulario "Agregar sección" > "Educación"). Ojo: "Instituciones"
  // en el perfil NO es Educación — es la lista de instituciones que el user
  // sigue (cada una abre la página pública de esa institución al tocarla).
  // Sin content-desc propio: los inputs de texto exponen el placeholder como
  // @text (no @content-desc) mientras están vacíos.
  headingAgregarEducacion: '//*[@text="Agregar educación"]',
  headingEditarEducacion: '//*[@text="Editar educación"]',
  dropdownNivelEducacion: '//*[@text="Seleccione nivel"]',
  inputNombreInstitucion:
    '//android.widget.EditText[@text="Ingrese el nombre de la institución"]',
  inputTituloObtenido: '//android.widget.EditText[@text="Ingrese el título"]',
  inputDescripcionEducacion:
    '//android.widget.EditText[@text="Texto descriptivo..."]',
  // Los dropdowns de ubicación son Button con content-desc "Ingrese el X, " (con
  // coma final agregada por el picker) — se matchea por contains.
  dropdownPaisEducacion: '//*[contains(@content-desc, "Ingrese el país")]',
  dropdownProvinciaEducacion:
    '//*[contains(@content-desc, "Ingrese la provincia")]',
  dropdownCiudadEducacion: '//*[contains(@content-desc, "Ingrese la ciudad")]',
  // Hay 2 EditText con el mismo placeholder "dd/mm/aaaa": Inicio y Finalización,
  // en ese orden. Se distinguen por posición.
  inputFechaInicioEducacion:
    '(//android.widget.EditText[@text="dd/mm/aaaa"])[1]',
  inputFechaFinEducacion: '(//android.widget.EditText[@text="dd/mm/aaaa"])[2]',
  checkboxActualmenteEstudiando: '~Actualmente estoy estudiando',
  btnAgregarEducacionSubmit: '~Agregar',
  btnEliminarEducacion: '//*[@text="Eliminar educación"]',
  opcionListaPicker: (valor: string) => `//*[@text="${valor}"]`,

  // Configuración de usuario
  tituloConfiguracion: '//*[@text="Configuración de usuario"]',
  itemCuenta: '~Cuenta',
  itemInicioSesionSeguridad: '~Inicio de sesión y seguridad',
  itemNewsletter: '~Newsletter y preferencias',
  itemNotificaciones: '~Notificaciones',
  // "Cuenta" ahora agrupa estos 3 antes de llegar a los datos reales (antes eran
  // ítems directos de primer nivel).
  itemDatosPersonalesNested: '//*[contains(@content-desc, "Datos personales")]',
  itemDatosProfesionalesNested:
    '//*[contains(@content-desc, "Datos profesionales")]',
  itemGestionCuenta: '//*[contains(@content-desc, "Gestión de cuenta")]',
  tituloGestionCuenta: '//*[@text="Gestión de cuenta"]',
  // Pantalla 100% nativa ahora (ya no redirige a la web). NO TOCAR este botón en
  // los tests: borra la cuenta de forma permanente sin confirmación adicional.
  btnEliminarCuentaNative: '~Eliminar',

  // Datos personales
  tituloDatosPersonales: '//*[@text="Datos personales"]',
  inputTelefonoCodigo:
    '//*[@text="Teléfono"]/following::android.widget.EditText[1]',
  inputTelefonoNumero:
    '//*[@text="Teléfono"]/following::android.widget.EditText[2]',
  // Texto real confirmado con dump: "Solo se permiten números, guiones,
  // paréntesis y espacios" (no contiene "inválido"/"Invalid" como se asumía).
  msgErrorTelefono: '//*[contains(@text, "Solo se permiten números")]',
  btnGuardarCambios: '~Guardar cambios',
  toastCambiosGuardados:
    '//*[contains(@text, "Datos guardados") or contains(@text, "Cambios guardados")]',

  // Datos profesionales
  tituloDatosProfesionales: '//*[@text="Datos profesionales"]',

  // Newsletter y preferencias — confirmado con dump: son android.widget.Switch.
  switchNewsletterPorTitulo: (titulo: string) =>
    `//*[@text="${titulo}"]/following::android.widget.Switch[1]`,

  // Notificaciones (filas agrupadas, colapsadas por default)
  filaNotificacion: (titulo: string) => `//*[@text="${titulo}"]`,
  switchPushDispositivo:
    '//*[@text="Push al dispositivo"]/following::android.widget.Switch[1]',
  switchEnLaAplicacion:
    '//*[@text="En la aplicación"]/following::android.widget.Switch[1]',

  tituloGuardados: '//*[@text="Guardados"]',
  listaGuardados: '//androidx.recyclerview.widget.RecyclerView',
} as const
