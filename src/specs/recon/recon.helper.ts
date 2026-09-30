import fs from 'fs'
import path from 'path'

const RECON_DIR = path.resolve('./recon')

export async function dump(nombre: string): Promise<string> {
  const xml = await driver.getPageSource().catch(() => '')
  if (xml) fs.writeFileSync(path.join(RECON_DIR, `${nombre}.xml`), xml)
  await driver
    .saveScreenshot(path.join(RECON_DIR, `${nombre}.png`))
    .catch(() => {})
  console.log(`>>> dump ${nombre} (${xml.length} chars)`)
  return xml
}

export async function scroll(
  direction: 'up' | 'down',
  percent = 0.6,
): Promise<void> {
  await driver
    .execute('mobile: scrollGesture', {
      left: 100,
      top: 600,
      width: 800,
      height: 1000,
      direction,
      percent,
    })
    .catch(() => {})
  await driver.pause(1000)
}

export async function volverArriba(): Promise<void> {
  for (let i = 0; i < 6; i++) await scroll('up', 0.9)
}

export async function traerALaVista(selector: string): Promise<boolean> {
  if (
    await $(selector)
      .isDisplayed()
      .catch(() => false)
  )
    return true
  await volverArriba()
  for (let i = 0; i < 8; i++) {
    if (
      await $(selector)
        .isDisplayed()
        .catch(() => false)
    )
      return true
    await scroll('down', 0.4)
  }
  return false
}

export async function completarCampo(
  selector: string,
  valor: string,
): Promise<void> {
  if (!(await traerALaVista(selector))) {
    console.log(`>>> no se pudo ubicar el campo ${selector}`)
    return
  }
  await $(selector).setValue(valor)
  await driver.hideKeyboard().catch(() => {})
  await driver.pause(500)
  console.log(`>>> ${selector} = ${valor}`)
}

export function porHint(hint: string): string {
  return `//android.widget.EditText[@hint="${hint}"]`
}

export async function elegirEnSelector(
  selectorBoton: string,
  opcion: string,
  nombreDump: string,
): Promise<void> {
  if (!(await traerALaVista(selectorBoton))) {
    console.log(`>>> no se pudo ubicar el selector ${selectorBoton}`)
    return
  }
  await $(selectorBoton).click()
  await driver.pause(2500)
  await dump(nombreDump)

  const item = await $(`//*[@text="${opcion}"]`)
  if (await item.isDisplayed().catch(() => false)) {
    await item.click()
    console.log(`>>> ${selectorBoton} = ${opcion}`)
  } else {
    console.log(`>>> opción "${opcion}" no visible en ${selectorBoton}`)
  }
  await driver.pause(1500)
}

export async function tildarCheckbox(selector: string): Promise<void> {
  if (!(await traerALaVista(selector))) {
    console.log(`>>> no se pudo ubicar el checkbox ${selector}`)
    return
  }
  const el = await $(selector)
  const loc = await el.getLocation()
  const size = await el.getSize()
  await driver.execute('mobile: clickGesture', {
    x: Math.floor(loc.x + 25),
    y: Math.floor(loc.y + size.height / 2),
  })
  await driver.pause(1000)
  console.log(`>>> ${selector} checked=${await el.getAttribute('checked')}`)
}

export async function tocarSiguiente(etapa: string): Promise<void> {
  await traerALaVista('~Siguiente')
  const btn = await $('~Siguiente')
  console.log(
    `>>> [${etapa}] Siguiente habilitado: ${await btn.isEnabled().catch(() => '<error>')}`,
  )
  await btn
    .click()
    .catch((e) =>
      console.log(`>>> [${etapa}] tap Siguiente falló: ${e.message}`),
    )
  await driver.pause(6000)
}

export async function relevarPantalla(
  nombre: string,
  scrolls = 3,
): Promise<void> {
  await dump(nombre)
  for (let i = 1; i <= scrolls; i++) {
    await scroll('down', 0.8)
    await dump(`${nombre}-scroll${i}`)
  }
  await volverArriba()
}

export async function tocarBoton(desc: string, etapa: string): Promise<void> {
  const selector = `~${desc}`
  await traerALaVista(selector)
  const btn = await $(selector)
  console.log(
    `>>> [${etapa}] "${desc}" habilitado: ${await btn.isEnabled().catch(() => '<error>')}`,
  )
  await btn
    .click()
    .catch((e) =>
      console.log(`>>> [${etapa}] tap "${desc}" falló: ${e.message}`),
    )
  await driver.pause(6000)
}

export async function elegirPrimeraOpcion(
  selectorBoton: string,
  nombreDump: string,
): Promise<void> {
  if (!(await traerALaVista(selectorBoton))) {
    console.log(`>>> no se pudo ubicar el selector ${selectorBoton}`)
    return
  }
  await $(selectorBoton).click()
  await driver.pause(2500)
  await dump(nombreDump)

  const primera =
    '(//android.view.ViewGroup[@clickable="true" and string-length(@content-desc)>0 and @content-desc!="-"])[1]'
  const el = await $(primera)
  const valor = await el.getAttribute('content-desc').catch(() => '<?>')
  await el
    .click()
    .catch((e) => console.log(`>>> tap opción falló: ${e.message}`))
  console.log(`>>> ${selectorBoton} = ${valor} (primera opción)`)
  await driver.pause(1500)
}
