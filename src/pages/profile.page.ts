import { BasePage } from './base.page';
import { FeedLocators } from '../locators/feed.locators';
import { webPage } from '../locators/webPage.locators';

class ProfilePage extends BasePage {
    // Navegación nativa (app)
    get btnPerfil() { return $(FeedLocators.btnPerfil); }
    get btnConfiguracion() { return $(FeedLocators.btnConfiguracion); }
    get btnEliminarCuenta() { return $(FeedLocators.btnEliminarCuenta); }

    // Web de gestión de cuenta (Chrome). UiAutomator expone el contenido web
    // como widgets nativos, por eso no hace falta cambiar de contexto.
    get inputLoginWeb() { return $(webPage.inputLogin); }
    get inputPasswordWeb() { return $(webPage.inputPassword); }
    get btnIniciarSesionWeb() { return $(webPage.btnIniciarSesion); }
    get tituloGestionCuenta() { return $(webPage.tituloGestionCuenta); }
    get btnEliminarCuentaWeb() { return $(webPage.btnEliminarCuenta); }

    async irAEliminarCuenta(): Promise<void> {
        await this.waitForElement(this.btnPerfil);
        await this.tap(this.btnPerfil);
        await this.waitForElement(this.btnConfiguracion);
        await this.tap(this.btnConfiguracion);
        await this.waitForElement(this.btnEliminarCuenta);
        await this.tap(this.btnEliminarCuenta);
    }

    async loginWebSiEsNecesario(email: string, password: string): Promise<void> {
        // La web puede abrir directo en "Gestión de cuenta" (sesión web activa)
        // o pedir login primero.
        await browser.waitUntil(
            async () => {
                if (await this.isVisible(this.inputLoginWeb)) return true;
                if (await this.isVisible(this.tituloGestionCuenta)) return true;
                // Chrome a veces renderiza la página pero tarda en exponerla al
                // árbol de accesibilidad que usa UiAutomator; pedir el pageSource
                // fuerza un refresh completo de ese árbol.
                await browser.getPageSource().catch(() => {});
                return false;
            },
            {
                timeout: 60000,
                interval: 1000,
                timeoutMsg:
                    'La web no mostró ni el login ni "Gestión de cuenta" después de 60s',
            },
        );

        if (await this.isVisible(this.inputLoginWeb)) {
            await this.setValue(this.inputLoginWeb, email);
            await this.setValue(this.inputPasswordWeb, password);
            await this.tap(this.btnIniciarSesionWeb);
        }
    }
}

export default new ProfilePage();
