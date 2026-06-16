import fs from 'fs'
import path from 'path'
import { config as sharedConfig } from './wdio.shared.conf'

const APPS_DIR = path.resolve('./apps')
const apks = fs.existsSync(APPS_DIR)
  ? fs.readdirSync(APPS_DIR).filter((f) => f.endsWith('.apk'))
  : []

if (apks.length === 0) {
  throw new Error(
    'No hay ningún .apk en ./apps. Copiá el APK antes de correr los tests.',
  )
}
if (apks.length > 1) {
  throw new Error(
    `Hay ${apks.length} .apk en ./apps (${apks.join(', ')}). Dejá solo uno.`,
  )
}
const APP_PATH = path.resolve(APPS_DIR, apks[0])

export const config: Record<string, any> = {
  ...sharedConfig,
  specs: [['../src/specs/**/*.spec.ts']],
  connectionRetryTimeout: 300000,
  port: 4723,
  services: [
    [
      'appium',
      {
        args: {
          relaxedSecurity: true,
          log: path.resolve('./logs/appium-android.log'),
        },
        command: 'appium',
      },
    ],
  ],
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'emulator-5554',
      'appium:avd': process.env.ANDROID_AVD,
      'appium:avdLaunchTimeout': 240000,
      'appium:avdReadyTimeout': 240000,
      'appium:app': APP_PATH,
      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
      'appium:uiautomator2ServerLaunchTimeout': 60000,
      'appium:chromeOptions': { args: ['--disable-gpu'] },
    },
  ],
}
