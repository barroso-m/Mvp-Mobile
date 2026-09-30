export const OnboardingLocators = {
  // ---- Entrada ----
  btnRegistrarse: '~Registrarse',
  linkYaRegistrado: '~¿Ya está registrado? Iniciar sesión',

  // ---- Paso 1: "Crear cuenta" (datos personales) ----
  tituloCrearCuenta: '//*[@text="Crear cuenta"]',
  // El botón de Trato NO tiene content-desc estable: arranca en "Seleccione, "
  // y pasa a "<trato>, " al elegir. Se ancla al label "Trato", que no cambia.
  btnSelectorTrato:
    '//android.widget.TextView[@text="Trato"]/following::android.widget.Button[1]',
  // Las opciones de Trato viven en un bottom sheet y exponen content-desc.
  opcionTrato: (valor: string) => `~${valor}`,
  inputNombre: '//android.widget.EditText[@hint="Escriba su nombre"]',
  inputApellido: '//android.widget.EditText[@hint="Escriba su apellido"]',
  inputEmail: '//android.widget.EditText[@hint="Ej, email@gmail.com"]',
  inputFechaNacimiento: '//android.widget.EditText[@hint="DD-MM-AAAA"]',
  btnSelectorTipoDocumento: '~Abrir selector de tipo de documento',
  // A diferencia de Trato, las opciones de documento sí traen resource-id.
  opcionTipoDocumento: (valor: string) =>
    `//*[@resource-id="docTypeOption-${valor}"]`,
  inputNroDocumento: '//android.widget.EditText[@hint="ej. 11434934"]',
  // OJO: este nodo ocupa la fila entera y su centro cae sobre el texto, que es
  // un link a los términos (abre Chrome). Se tilda tocando el cuadradito del
  // borde izquierdo — ver OnboardingPage.tildarTerminos().
  chkTerminos: '~Aceptar términos y condiciones',

  // ---- Bottom sheet "¿Desea ingresar?" (email ya registrado) ----
  // Llega ~3s después de tocar "Siguiente", no en el acto.
  sheetYaRegistradoTitulo: '//*[@text="¿Desea ingresar?"]',
  sheetYaRegistradoMensaje:
    '//*[contains(@text, "ya está registrado en IntraMed")]',
  btnRecuperarPassword: '//*[@resource-id="account-exists-primary"]',
  btnCancelarYaRegistrado: '//*[@resource-id="account-exists-cancel"]',

  // ---- Paso 2: "Crear contraseña" ----
  tituloCrearPassword: '//*[@text="Crear contraseña"]',
  inputPassword: '//*[@resource-id="passwordInput"]',
  inputPasswordConfirm: '//*[@resource-id="confirmInput"]',
  btnVerPassword: '//*[@resource-id="passwordToggle"]',
  btnVerPasswordConfirm: '//*[@resource-id="confirmToggle"]',
  requisitosPassword: '//*[@text="Debe contener:"]',

  // ---- Paso 3: verificación por OTP ----
  // No hay botón: al cargar el 6º dígito el wizard verifica y avanza solo.
  msgCodigoEnviado:
    '//*[contains(@text, "Hemos enviado un código de verificación")]',
  tituloIngresarCodigo: '//*[contains(@text, "Ingresá el código")]',
  // Un EditText por dígito, en orden. Nacen debajo del pliegue.
  inputsOtp: '//android.widget.EditText',
  msgEmailVerificado:
    '//*[contains(@text, "ha sido verificado correctamente")]',

  // ---- Paso 4: "Información de contacto" ----
  tituloContacto: '//*[@text="Información de contacto"]',
  btnSelectorPais: '//*[@resource-id="countryTrigger"]',
  btnSelectorProvincia: '//*[@resource-id="stateTrigger"]',
  btnSelectorCiudad: '//*[@resource-id="cityTrigger"]',
  btnSelectorIdioma: '//*[@resource-id="languageTrigger"]',
  inputTelefono: '//android.widget.EditText[@hint="ej: 569342423"]',

  // ---- Paso 5: "Formación profesional" ----
  tituloProfesional: '//*[@text="Formación profesional"]',
  btnSelectorOcupacion: '//*[@resource-id="occupationTrigger"]',
  btnSelectorCarrera: '//*[@resource-id="careerTrigger"]',
  // Especialidad aparece al elegir carrera, y subespecialidad al elegir
  // especialidad: el formulario se va desplegando de a un campo.
  btnSelectorEspecialidad: '//*[@resource-id="specialtyTrigger"]',
  btnSelectorSubespecialidad: '//*[@resource-id="subSpecialtyTrigger"]',
  btnSelectorIdentidad: '//*[@resource-id="licenceTypeTrigger"]',
  inputNroMatricula: '//*[@resource-id="licenceNumberInput"]',
  chkResidente: '//*[@resource-id="isResidentCheckbox"]',

  // ---- Paso 6: "¿Cómo conoció Intramed?" ----
  tituloComoConocio: '//*[contains(@text, "¿Cómo conoció Intramed?")]',
  btnSelectorComoConocio: '//*[@resource-id="discoverTrigger"]',
  // Equivalente mobile del "Omitir" de web.
  btnSaltear: '~Saltear',

  // ---- Opciones de cualquier bottom sheet de selector ----
  // Listas alfabéticas y SIN buscador: hay que scrollear dentro del sheet.
  opcionSheet: (valor: string) => `~${valor}`,
  // Scroll server-side hasta la opción: UN comando en vez de N gestos.
  opcionSheetConScroll: (valor: string) =>
    `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${valor}"))`,
  bottomSheetBackdrop: '~Bottom sheet backdrop',

  // ---- Bottom nav, para validar que el alta terminó dentro de la app ----
  // Una cuenta recién creada NO trae el botón "Crear" (todavía no está
  // habilitada para publicar), así que no sirve como señal de "llegué al feed".
  tabInicio: '~Inicio',
  tabCampus: '~Campus',

  // ---- Comunes del wizard ----
  btnSiguiente: '~Siguiente',
  // Los pasos 5 y 6 usan "Continuar" en vez de "Siguiente".
  btnContinuar: '~Continuar',
  btnGoBack: '~Go back',
  // View con @text = fracción de avance ("1.0" en el paso 2 de 5).
  progresoFormulario: '//*[@resource-id="step-progress"]',
} as const
