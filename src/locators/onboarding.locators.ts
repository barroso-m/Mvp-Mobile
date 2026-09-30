export const OnboardingLocators = {
  btnRegistrarse: '~Registrarse',
  linkYaRegistrado: '~¿Ya está registrado? Iniciar sesión',

  tituloCrearCuenta: '//*[@text="Crear cuenta"]',
  btnSelectorTrato:
    '//android.widget.TextView[@text="Trato"]/following::android.widget.Button[1]',
  opcionTrato: (valor: string) => `~${valor}`,
  inputNombre: '//android.widget.EditText[@hint="Escriba su nombre"]',
  inputApellido: '//android.widget.EditText[@hint="Escriba su apellido"]',
  inputEmail: '//android.widget.EditText[@hint="Ej, email@gmail.com"]',
  inputFechaNacimiento: '//android.widget.EditText[@hint="DD-MM-AAAA"]',
  btnSelectorTipoDocumento: '~Abrir selector de tipo de documento',
  opcionTipoDocumento: (valor: string) =>
    `//*[@resource-id="docTypeOption-${valor}"]`,
  inputNroDocumento: '//android.widget.EditText[@hint="ej. 11434934"]',
  chkTerminos: '~Aceptar términos y condiciones',

  sheetYaRegistradoTitulo: '//*[@text="¿Desea ingresar?"]',
  sheetYaRegistradoMensaje:
    '//*[contains(@text, "ya está registrado en IntraMed")]',
  btnRecuperarPassword: '//*[@resource-id="account-exists-primary"]',
  btnCancelarYaRegistrado: '//*[@resource-id="account-exists-cancel"]',

  tituloCrearPassword: '//*[@text="Crear contraseña"]',
  inputPassword: '//*[@resource-id="passwordInput"]',
  inputPasswordConfirm: '//*[@resource-id="confirmInput"]',
  btnVerPassword: '//*[@resource-id="passwordToggle"]',
  btnVerPasswordConfirm: '//*[@resource-id="confirmToggle"]',
  requisitosPassword: '//*[@text="Debe contener:"]',

  msgCodigoEnviado:
    '//*[contains(@text, "Hemos enviado un código de verificación")]',
  tituloIngresarCodigo: '//*[contains(@text, "Ingresá el código")]',
  inputsOtp: '//android.widget.EditText',
  msgEmailVerificado:
    '//*[contains(@text, "ha sido verificado correctamente")]',

  tituloContacto: '//*[@text="Información de contacto"]',
  btnSelectorPais: '//*[@resource-id="countryTrigger"]',
  btnSelectorProvincia: '//*[@resource-id="stateTrigger"]',
  btnSelectorCiudad: '//*[@resource-id="cityTrigger"]',
  btnSelectorIdioma: '//*[@resource-id="languageTrigger"]',
  inputTelefono: '//android.widget.EditText[@hint="ej: 569342423"]',

  tituloProfesional: '//*[@text="Formación profesional"]',
  btnSelectorOcupacion: '//*[@resource-id="occupationTrigger"]',
  btnSelectorCarrera: '//*[@resource-id="careerTrigger"]',
  btnSelectorEspecialidad: '//*[@resource-id="specialtyTrigger"]',
  btnSelectorSubespecialidad: '//*[@resource-id="subSpecialtyTrigger"]',
  btnSelectorIdentidad: '//*[@resource-id="licenceTypeTrigger"]',
  inputNroMatricula: '//*[@resource-id="licenceNumberInput"]',
  chkResidente: '//*[@resource-id="isResidentCheckbox"]',

  tituloComoConocio: '//*[contains(@text, "¿Cómo conoció Intramed?")]',
  btnSelectorComoConocio: '//*[@resource-id="discoverTrigger"]',
  btnSaltear: '~Saltear',

  opcionSheet: (valor: string) => `~${valor}`,
  opcionSheetConScroll: (valor: string) =>
    `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${valor}"))`,
  bottomSheetBackdrop: '~Bottom sheet backdrop',

  tabInicio: '~Inicio',
  tabCampus: '~Campus',

  btnSiguiente: '~Siguiente',
  btnContinuar: '~Continuar',
  btnGoBack: '~Go back',
  progresoFormulario: '//*[@resource-id="step-progress"]',
} as const
