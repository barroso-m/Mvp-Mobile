import { BasePage } from '../BasePage'
import { FeedLocators } from '../../locators/feed.locators'
import { webPage } from '../../locators/webPage.locators'

class ProfilePage extends BasePage {
  get btnPerfil() {
    return $(FeedLocators.btnPerfil)
  }
  get btnConfiguracion() {
    return $(FeedLocators.btnConfiguracion)
  }
  get btnEliminarCuenta() {
    return $(FeedLocators.btnEliminarCuenta)
  }

  get inputUsernameWeb() {
    return $(webPage.inputUsername)
  }
  get inputPasswordWeb() {
    return $(webPage.inputPassword)
  }
  get btnLoginWeb() {
    return $(webPage.loginButton)
  }
  get tituloGestionCuenta() {
    return $(webPage.tituloGestionCuenta)
  }
  get btnEliminarCuentaWeb() {
    return $(webPage.btnEliminarCuenta)
  }

  async irAEliminarCuenta(): Promise<void> {
    await this.waitForElement(this.btnPerfil)
    await this.tap(this.btnPerfil)
    await this.waitForElement(this.btnConfiguracion)
    await this.tap(this.btnConfiguracion)
    await this.waitForElement(this.btnEliminarCuenta)
    await this.tap(this.btnEliminarCuenta)
  }

  async loginWebSiEsNecesario(email: string, password: string): Promise<void> {
    await browser.waitUntil(
      async () => {
        if (await this.isVisible(this.inputUsernameWeb)) return true
        if (await this.isVisible(this.tituloGestionCuenta)) return true
        await browser.getPageSource().catch(() => {})
        return false
      },
      {
        timeout: 60000,
        interval: 1000,
        timeoutMsg:
          'La web no mostró ni el login ni "Gestión de cuenta" después de 60s',
      },
    )

    if (await this.isVisible(this.inputUsernameWeb)) {
      await this.setValue(this.inputUsernameWeb, email)
      await this.setValue(this.inputPasswordWeb, password)
      await this.tap(this.btnLoginWeb)
    }
  }
}

export default new ProfilePage()
