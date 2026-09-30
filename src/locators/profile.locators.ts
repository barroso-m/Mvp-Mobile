export const ProfileLocators = {
  seccionSobreMi: '//*[@text="Sobre mí"]',
  lapizSobreMi: '~Editar sobre mí',
  inputSobreMi: '//android.widget.EditText',
  btnGuardarSobreMi: '~Guardar cambios',
  btnVolverSobreMi: '~Go back',
  textoSobreMiPor: (texto: string) => `//*[@text="${texto}"]`,

  btnVerMasActividad: '~Ver más actividad',
  entradaActividadPorPrefijo: (prefijo: string) =>
    `//android.view.ViewGroup[contains(@content-desc, "${prefijo}")]`,
  tituloInfoProfesional:
    '//*[@text="Aún no cargaste tu información profesional"]',
  btnComenzarSeccionProfesional:
    '//*[@text="Aún no cargaste tu información profesional"]/following::android.widget.Button[1]',
  headingAgregarSeccion: '//*[@text="Agregar una sección"]',
  opcionSeccion: (nombre: string) => `//*[@text="${nombre}"]`,
  headingOrdenarSecciones: '//*[@text="Ordenar secciones"]',

  filtroActividad: (label: string) => `~${label}`,

  headingAgregarEducacion: '//*[@text="Agregar educación"]',
  headingEditarEducacion: '//*[@text="Editar educación"]',
  dropdownNivelEducacion: '//*[@text="Seleccione nivel"]',
  inputNombreInstitucion:
    '//android.widget.EditText[@text="Ingrese el nombre de la institución"]',
  inputTituloObtenido: '//android.widget.EditText[@text="Ingrese el título"]',
  inputDescripcionEducacion:
    '//android.widget.EditText[@text="Texto descriptivo..."]',
  dropdownPaisEducacion: '//*[contains(@content-desc, "Ingrese el país")]',
  dropdownProvinciaEducacion:
    '//*[contains(@content-desc, "Ingrese la provincia")]',
  dropdownCiudadEducacion: '//*[contains(@content-desc, "Ingrese la ciudad")]',
  inputFechaInicioEducacion:
    '(//android.widget.EditText[@text="dd/mm/aaaa"])[1]',
  inputFechaFinEducacion: '(//android.widget.EditText[@text="dd/mm/aaaa"])[2]',
  checkboxActualmenteEstudiando: '~Actualmente estoy estudiando',
  btnAgregarEducacionSubmit: '~Agregar',
  btnEliminarEducacion: '//*[@text="Eliminar educación"]',
  opcionListaPicker: (valor: string) => `//*[@text="${valor}"]`,

  tituloConfiguracion: '//*[@text="Configuración de usuario"]',
  itemCuenta: '~Cuenta',
  itemInicioSesionSeguridad: '~Inicio de sesión y seguridad',
  itemNewsletter: '~Newsletter y preferencias',
  itemNotificaciones: '~Notificaciones',
  itemDatosPersonalesNested: '//*[contains(@content-desc, "Datos personales")]',
  itemDatosProfesionalesNested:
    '//*[contains(@content-desc, "Datos profesionales")]',
  itemGestionCuenta: '//*[contains(@content-desc, "Gestión de cuenta")]',
  tituloGestionCuenta: '//*[@text="Gestión de cuenta"]',
  btnEliminarCuentaNative: '~Eliminar',

  tituloDatosPersonales: '//*[@text="Datos personales"]',
  inputTelefonoCodigo:
    '//*[@text="Teléfono"]/following::android.widget.EditText[1]',
  inputTelefonoNumero:
    '//*[@text="Teléfono"]/following::android.widget.EditText[2]',
  msgErrorTelefono: '//*[contains(@text, "Solo se permiten números")]',
  btnGuardarCambios: '~Guardar cambios',
  toastCambiosGuardados:
    '//*[contains(@text, "Datos guardados") or contains(@text, "Cambios guardados")]',

  tituloDatosProfesionales: '//*[@text="Datos profesionales"]',

  switchNewsletterPorTitulo: (titulo: string) =>
    `//*[@text="${titulo}"]/following::android.widget.Switch[1]`,

  filaNotificacion: (titulo: string) => `//*[@text="${titulo}"]`,
  switchPushDispositivo:
    '//*[@text="Push al dispositivo"]/following::android.widget.Switch[1]',
  switchEnLaAplicacion:
    '//*[@text="En la aplicación"]/following::android.widget.Switch[1]',

  tituloGuardados: '//*[@text="Guardados"]',
  listaGuardados: '//androidx.recyclerview.widget.RecyclerView',
} as const
