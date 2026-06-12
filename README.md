# qa-mobile-automation

Automatización mobile con **WebdriverIO v9 + Appium** para la app **IntraMed**.

## Requisitos previos

| Componente | Versión |
|---|---|
| Node.js | ≥ 20 |
| Appium | 3.x (instalado globalmente) |
| UIAutomator2 driver | instalado vía `appium driver install uiautomator2` |
| Android emulador | Pixel API 34 — `emulator-5554` activo |

## Instalación

```bash
npm install
```

Copiar `.env.example` a `.env` y completar credenciales:

```bash
cp .env.example .env
```

Colocar el APK de IntraMed en `apps/intramed.apk`.

## Ejecución

```bash
# Android
npm run test:android

# iOS (macOS solamente)
npm run test:ios
```

## Estructura

```
config/          Configuraciones WDIO por plataforma
src/
  locators/      Selectores nativos (Android XPath / iOS Accessibility ID)
  pages/         Page Objects — lógica de pantalla, multiplataforma
  tests/         Tests organizados por feature
  utils/         Helpers: context switch WebView, OTP/SMS
apps/            Binarios .apk / .ipa (ignorados en git)
logs/            Logs de sesión Appium (ignorados en git)
```

## Antes de ejecutar por primera vez

Los locators en `src/locators/` son placeholders. Validarlos con **Appium Inspector**:

```bash
# Iniciar servidor Appium
npm run appium

# En otra terminal, abrir inspector
npx appium-inspector
```

Usar las capabilities de `config/wdio.android.conf.js` en el inspector para conectar al emulador e identificar los `resource-id` reales de cada elemento.
