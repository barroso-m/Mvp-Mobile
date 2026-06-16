import { config as androidConfig } from './wdio.android.conf'

export const config: Record<string, any> = {
  ...androidConfig,
  capabilities: androidConfig.capabilities.map((cap: Record<string, any>) => ({
    ...cap,
    'appium:avdArgs': '-no-window -no-snapshot-load -no-audio',
  })),
}
