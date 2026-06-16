const WEBVIEW_WAIT_TIMEOUT = 20000
const POLL_INTERVAL = 500

async function getContexts(): Promise<string[]> {
  const contexts = await driver.getContexts()
  return contexts.map((ctx) =>
    typeof ctx === 'string' ? ctx : (ctx as { id: string }).id,
  )
}

async function switchToWebView(urlContains?: string): Promise<string> {
  const deadline = Date.now() + WEBVIEW_WAIT_TIMEOUT

  while (Date.now() < deadline) {
    const contexts = await getContexts()
    const webViews = contexts.filter((ctx) => ctx.startsWith('WEBVIEW'))

    if (webViews.length > 0) {
      const target = urlContains
        ? (webViews.find((ctx) => ctx.includes(urlContains)) ?? webViews[0])
        : webViews[0]
      await driver.switchContext(target)
      return target
    }

    await driver.pause(POLL_INTERVAL)
  }

  const available = await getContexts()
  throw new Error(
    `No WebView encontrado después de ${WEBVIEW_WAIT_TIMEOUT}ms. Contextos: ${JSON.stringify(available)}`,
  )
}

async function switchToNative(): Promise<void> {
  await driver.switchContext('NATIVE_APP')
}

export { switchToWebView, switchToNative, getContexts }
