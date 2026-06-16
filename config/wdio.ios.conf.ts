import path from 'path'
import { config as sharedConfig } from './wdio.shared.conf'

export const config: Record<string, any> = {
  ...sharedConfig,
  port: 4723,
  services: [
    [
      'appium',
      {
        args: {
          relaxedSecurity: true,
          log: path.resolve('./logs/appium-ios.log'),
        },
        command: 'appium',
      },
    ],
  ],
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': 'iPhone 15',
      'appium:platformVersion': '17.0',
      'appium:app': path.resolve(
        './apps/application-bafb528a-2001-4694-890e-d9dcbd12b0dd.ipa',
      ),
      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
      'appium:wdaLaunchTimeout': 120000,
    },
  ],
}
