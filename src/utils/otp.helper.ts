const OTP_WAIT_TIMEOUT = 30000
const POLL_INTERVAL = 2000

async function readLatestSmsFromEmulator(): Promise<string | null> {
  const result = (await browser.execute('mobile: shell', {
    command: 'content',
    args: [
      'query',
      '--uri',
      'content://sms/inbox',
      '--sort',
      'date DESC',
      '--projection',
      'body',
      '--where',
      'read=0',
    ],
  })) as string | null

  const match = String(result ?? '').match(/body=(\d{4,8})/)
  return match ? match[1] : null
}

async function waitForOtp(
  readFn: () => Promise<string | null> = readLatestSmsFromEmulator,
): Promise<string> {
  const deadline = Date.now() + OTP_WAIT_TIMEOUT
  while (Date.now() < deadline) {
    const code = await readFn()
    if (code) return code
    await driver.pause(POLL_INTERVAL)
  }
  throw new Error(`OTP no recibido después de ${OTP_WAIT_TIMEOUT}ms`)
}

export { waitForOtp, readLatestSmsFromEmulator }
