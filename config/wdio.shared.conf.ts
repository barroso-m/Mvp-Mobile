import 'dotenv/config'
import fs from 'fs'
import { execSync } from 'child_process'
import AllureReporter from '@wdio/allure-reporter'
import {
  recordResult,
  resetResults,
  uploadResults,
} from '../src/utils/zephyr-reporter'

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
  },

  onComplete: async function () {
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

  beforeTest: async function () {
    await driver.startRecordingScreen()
  },

  afterTest: async function (
    test: { title: string },
    _context: unknown,
    { passed, duration }: { passed: boolean; duration: number },
  ) {
    const screenshot = await browser.takeScreenshot()
    const video = await driver.stopRecordingScreen()

    void AllureReporter.addAttachment(
      'Screenshot',
      Buffer.from(screenshot, 'base64'),
      'image/png',
    )
    if (!passed) {
      void AllureReporter.addAttachment(
        'Video',
        Buffer.from(video, 'base64'),
        'video/mp4',
      )
    }

    recordResult(test.title, passed, duration)
  },
}
