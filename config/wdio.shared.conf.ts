import 'dotenv/config'
import fs from 'fs'
import { execSync } from 'child_process'
import AllureReporter from '@wdio/allure-reporter'
import {
  recordResult,
  resetResults,
  uploadResults,
} from '../src/utils/zephyr-reporter'
import {
  limpiarGrabacionesHuerfanas,
  prepararGaleria,
} from '../src/utils/media.helper'

export const config: Record<string, any> = {
  runner: 'local',
  specs: ['../src/specs/**/*.spec.ts'],
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
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
      },
    ],
  ],
  onPrepare: function () {
    fs.rmSync('allure-results', { recursive: true, force: true })
    resetResults()
    prepararGaleria()
  },

  onComplete: async function () {
    // Las grabaciones de esta corrida que Appium haya dejado sueltas en
    // /sdcard no deben sobrevivir para contaminar el picker de la próxima.
    limpiarGrabacionesHuerfanas()
    try {
      execSync('npx allure generate allure-results --clean -o allure-report', {
        stdio: 'inherit',
      })
    } catch (err) {
      console.error('No se pudo generar el reporte de Allure:', err)
    }
    await uploadResults()
  },

  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  logLevel: 'warn',

  // La captura de evidencia es diagnóstico, no parte del test: si falla no debe
  // tumbar la corrida. screenrecord escribe en /sdcard y, cuando una corrida se
  // corta a mitad de escritura, deja el mount FUSE roto ("Transport endpoint is
  // not connected") — con el hook estricto eso convertía un emulador enfermo en
  // "Failed launching test session" y toda la suite en rojo.
  beforeTest: async function () {
    // Con los defaults (4 Mbps a 1080x1920) el encoder del emulador se comía
    // ~1.5 de sus 4 cores durante toda la corrida y ralentizaba cada comando.
    await driver
      .startRecordingScreen({ bitRate: 500000, videoSize: '540x960' })
      .catch(() => {})
  },

  afterTest: async function (
    test: { title: string },
    _context: unknown,
    { passed, duration }: { passed: boolean; duration: number },
  ) {
    const screenshot = await browser.takeScreenshot().catch(() => '')
    const video = await driver.stopRecordingScreen().catch(() => '')

    if (screenshot) {
      void AllureReporter.addAttachment(
        'Screenshot',
        Buffer.from(screenshot, 'base64'),
        'image/png',
      )
    }
    // El árbol de accesibilidad en el momento exacto del fallo. Sin esto, cada
    // vez que un locator deja de matchear (renombre en la app, elemento que
    // nace debajo del pliegue) hay que reproducir el estado a mano y volver a
    // correr para relevarlo — es lo que más tiempo consume en este proyecto.
    if (!passed) {
      const arbol = await driver.getPageSource().catch(() => '')
      if (arbol) {
        void AllureReporter.addAttachment(
          'Árbol de accesibilidad',
          arbol,
          'application/xml',
        )
      }
    }
    if (!passed && video) {
      void AllureReporter.addAttachment(
        'Video',
        Buffer.from(video, 'base64'),
        'video/mp4',
      )
    }

    recordResult(test.title, passed, duration)
  },
}
