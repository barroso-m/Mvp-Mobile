import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const DEVICE_DIR = '/sdcard/Pictures/IntramedQA'
const MEDIA_DIR = path.resolve('./test-data/media')

function esImagen(archivo: string): boolean {
  return /\.(png|jpe?g)$/i.test(archivo)
}

function adb(args: string[]): string {
  return execFileSync('adb', args, { encoding: 'utf8' })
}

function escanear(rutaEnDevice: string): void {
  adb([
    'shell',
    'am',
    'broadcast',
    '-a',
    'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
    '-d',
    `file://${rutaEnDevice}`,
  ])
}

export function limpiarGrabacionesHuerfanas(): void {
  try {
    const salida = adb(['shell', 'ls', '/sdcard/'])
    const huerfanas = salida
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^[0-9a-f]{8}\.mp4$/i.test(l))

    for (const archivo of huerfanas) {
      adb(['shell', 'rm', '-f', `/sdcard/${archivo}`])
      escanear(`/sdcard/${archivo}`)
    }

    if (huerfanas.length > 0) {
      console.log(
        `[media] Eliminadas ${huerfanas.length} grabación(es) de Appium de /sdcard: ${huerfanas.join(', ')}`,
      )
    }
  } catch (err) {
    console.warn('[media] No se pudieron limpiar las grabaciones sueltas:', err)
  }
}

export function prepararGaleria({ incluirVideos = false } = {}): void {
  try {
    if (!fs.existsSync(MEDIA_DIR)) {
      console.warn(`[media] No existe ${MEDIA_DIR}, se omite la preparación.`)
      return
    }

    limpiarGrabacionesHuerfanas()

    const todos = fs
      .readdirSync(MEDIA_DIR)
      .filter((f) => /\.(png|jpe?g|mp4)$/i.test(f))
    const fixtures = incluirVideos ? todos : todos.filter(esImagen)

    if (!incluirVideos) {
      for (const video of todos.filter((f) => !esImagen(f))) {
        const enDevice = `${DEVICE_DIR}/${video}`
        adb(['shell', 'rm', '-f', enDevice])
        escanear(enDevice)
      }
    }

    if (fixtures.length === 0) {
      console.warn(`[media] No hay fixtures de imagen en ${MEDIA_DIR}.`)
      return
    }

    adb(['shell', 'mkdir', '-p', DEVICE_DIR])

    for (const fixture of fixtures) {
      const destino = `${DEVICE_DIR}/${fixture}`
      adb(['push', path.join(MEDIA_DIR, fixture), destino])
      adb(['shell', 'touch', destino])
      escanear(destino)
    }

    console.log(
      `[media] Galería preparada con ${fixtures.length} fixture(s): ${fixtures.join(', ')}`,
    )
  } catch (err) {
    console.warn('[media] No se pudo preparar la galería:', err)
  }
}
