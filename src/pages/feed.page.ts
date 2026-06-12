import { BasePage } from './base.page';
import { FeedLocators } from '../locators/feed.locators';

class FeedPage extends BasePage {
  get btnCrear() { return $(FeedLocators.btnCrear); }
  get btnSeleccionarImagen() { return $(FeedLocators.btnSeleccionarImagen); }
  get imgGaleriaItem() { return $(FeedLocators.imgGaleriaItem); }
  get btnCambiarImagen() { return $(FeedLocators.btnCambiarImagen); }
  get inputTexto() { return $(FeedLocators.inputTexto); }
  get btnSiguiente() { return $(FeedLocators.btnSiguiente); }
  get btnPublicar() { return $(FeedLocators.btnPublicar); }
  get toastExito() { return $(FeedLocators.toastExito); }

  postEnFeed(texto: string) {
    return $(`//android.widget.TextView[@text="${texto}"]`);
  }

  async waitForScreenReady(): Promise<void> {
    await this.waitForElement(this.btnCrear, 30000);
  }

  async abrirCreacionPost(): Promise<void> {
    await this.tap(this.btnCrear);
  }

  async crearPost(texto: string): Promise<void> {
    await this.waitForElement(this.btnSeleccionarImagen, 15000);
    await this.tap(this.btnSeleccionarImagen);
    await this.waitForElement(this.imgGaleriaItem, 10000);
    await this.tap(this.imgGaleriaItem);
    await this.waitForElement(this.btnCambiarImagen, 10000);
    await this.scrollDown();
    await this.waitForElement(this.inputTexto, 10000);
    await this.setValue(this.inputTexto, texto);
    await this.tap(this.btnSiguiente);
    await this.waitForElement(this.btnPublicar, 10000);
    await this.tap(this.btnPublicar);
  }

  async refrescarFeed(): Promise<void> {
    await this.scrollUp();
  }
}

export default new FeedPage();
