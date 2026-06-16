export const webPage = {
  inputUsername: '//android.widget.EditText[@resource-id="username"]',
  inputPassword: '//android.widget.EditText[@resource-id="password"]',
  loginButton: '//android.widget.Button[@resource-id="loginButton"]',
  tituloGestionCuenta:
    'android=new UiSelector().textContains("Gestión de cuenta")',
  btnEliminarCuenta: '//android.widget.Button[@text="Eliminar"]',
} as const
