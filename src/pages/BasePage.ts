import { switchToWebView, switchToNative } from '../utils/context.helper'

type WdioElement = ReturnType<typeof $>

export class BasePage {
  protected async waitForElement(
    element: WdioElement,
    timeout = 15000,
  ): Promise<void> {
    await element.waitForDisplayed({ timeout })
  }

  protected async tap(element: WdioElement): Promise<void> {
    await element.click()
  }

  protected async setValue(element: WdioElement, value: string): Promise<void> {
    await element.clearValue()
    await element.setValue(value)
  }

  protected async isVisible(element: WdioElement): Promise<boolean> {
    try {
      return await element.isDisplayed()
    } catch {
      return false
    }
  }

  protected async scrollDown(): Promise<void> {
    await driver.execute('mobile: scrollGesture', {
      left: 100,
      top: 800,
      width: 400,
      height: 600,
      direction: 'down',
      percent: 0.75,
    })
  }

  /** Scroll fino para buscar un campo específico sin pasarse de largo — un
   * scrollDown() normal (75% de una franja de 600px) puede saltear un campo
   * angosto en un formulario largo. */
  protected async scrollDownSmall(): Promise<void> {
    await driver.execute('mobile: scrollGesture', {
      left: 100,
      top: 800,
      width: 400,
      height: 600,
      direction: 'down',
      percent: 0.3,
    })
  }

  protected async scrollUp(): Promise<void> {
    await driver.execute('mobile: scrollGesture', {
      left: 100,
      top: 400,
      width: 400,
      height: 600,
      direction: 'up',
      percent: 0.75,
    })
  }

  async switchToWebView(urlContains?: string): Promise<string> {
    return switchToWebView(urlContains)
  }

  async switchToNative(): Promise<void> {
    return switchToNative()
  }
}
