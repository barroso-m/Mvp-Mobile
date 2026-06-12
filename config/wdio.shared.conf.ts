import 'dotenv/config';
import fs from 'fs';
import { execSync } from 'child_process';
import AllureReporter from '@wdio/allure-reporter';

export const config: Record<string, any> = {
  runner: 'local',
  specs: ['../src/tests/**/*.test.ts'],
  exclude: [],
  capabilities: [],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 1,
  },
  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
    }],
  ],
  onPrepare: function () {
    fs.rmSync('allure-results', { recursive: true, force: true });
  },

  // Se ejecuta siempre al final (pasen o fallen los tests), así el HTML de
  // allure-report nunca queda desactualizado respecto de allure-results.
  onComplete: function () {
    try {
      execSync('npx allure generate allure-results --clean -o allure-report', {
        stdio: 'inherit',
      });
    } catch (err) {
      console.error('No se pudo generar el reporte de Allure:', err);
    }
  },

  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  logLevel: 'debug',

  beforeTest: async function () {
    // No usar getCurrentPackage(): si el test anterior dejó Chrome en primer
    // plano, devolvería com.android.chrome y se relanzaría Chrome en vez de la app.
    const caps = driver.capabilities as any;
    const appId = driver.isIOS
      ? caps.bundleId ?? caps['appium:bundleId']
      : caps.appPackage ?? caps['appium:appPackage'];
    await driver.terminateApp(appId);
    await driver.activateApp(appId);
    await driver.startRecordingScreen();
  },

  afterTest: async function (_test: unknown, _context: unknown, { passed }: { passed: boolean }) {
    const screenshot = await browser.takeScreenshot();
    const video = await driver.stopRecordingScreen();

    AllureReporter.addAttachment('Screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
    if (!passed) {
      AllureReporter.addAttachment('Video', Buffer.from(video, 'base64'), 'video/mp4');
    }
  },
};
