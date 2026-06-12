export const LoginLocators = {
  android: {
    btnIniciarSesion: '~Iniciar sesión',
    btnRegistrarse: '~Registrarse',
    inputEmail: '//android.widget.EditText[@hint="email@example.com"]',
    inputPassword: '//android.widget.EditText[@hint="Ej: Aa123456!"]',
  },
  ios: {
    btnIniciarSesion: '~Iniciar sesión',
    btnRegistrarse: '~Registrarse',
    inputEmail: '//XCUIElementTypeTextField[@value="email@example.com"]',
    inputPassword: '//XCUIElementTypeSecureTextField[@value="Ej: Aa123456!"]',
  },
} as const;
