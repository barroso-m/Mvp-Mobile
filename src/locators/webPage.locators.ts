export const webPage = {
    inputLogin: '//android.widget.EditText[@text="username"]',
    inputPassword: '//android.widget.EditText[@text="password"]',
    btnIniciarSesion: '//android.widget.Button[@text="Iniciar sesión"]',
    // Chrome expone la sección como un Button cuyo @text concatena título y subtítulo.
    tituloGestionCuenta: 'android=new UiSelector().textContains("Gestión de cuenta")',
    btnEliminarCuenta: '//android.widget.Button[@text="Eliminar"]',
} as const;
