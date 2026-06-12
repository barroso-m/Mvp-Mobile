import path from 'path';
import { config as sharedConfig } from './wdio.shared.conf';

export const config: Record<string, any> = {
  ...sharedConfig,
  specs: [['../src/tests/**/*.test.ts']],
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
      'appium:app': path.resolve(
        './apps/application-5565bcd9-a6d1-4831-8dc1-4394e0744fec.apk',
      ),
      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
      'appium:uiautomator2ServerLaunchTimeout': 60000,
      'appium:chromeOptions': { args: ['--disable-gpu'] },
    },
  ],
};
