import { BasePage } from '../BasePage'
import { LoginLocators } from '../../locators/login.locators'

class LoginPage extends BasePage {
  private get loc() {
    return driver.isIOS ? LoginLocators.ios : LoginLocators.android
  }

  get btnIniciarSesion() {
    return $(this.loc.btnIniciarSesion)
  }
  get btnRegistrarse() {
    return $(this.loc.btnRegistrarse)
  }
  get inputEmail() {
    return $(this.loc.inputEmail)
  }
  get inputPassword() {
    return $(this.loc.inputPassword)
  }
  get msgErrorLogin() {
    return $(this.loc.msgErrorLogin)
  }

  async waitForScreenReady(): Promise<void> {
    await this.waitForElement(this.btnIniciarSesion, 30000)
  }

  async login(email: string, password: string): Promise<void> {
    if (!(await this.isVisible(this.inputEmail))) {
      await this.tap(this.btnIniciarSesion)
      await this.waitForElement(this.inputEmail)
    }
    await this.setValue(this.inputEmail, email)
    await this.setValue(this.inputPassword, password)
    await this.btnIniciarSesion.waitForEnabled({ timeout: 5000 })
    await this.tap(this.btnIniciarSesion)
  }
}

export default new LoginPage()
