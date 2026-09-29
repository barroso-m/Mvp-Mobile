import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

/**
 * Deja la galería del emulador en un estado conocido antes de la corrida.
 *
 * Por qué existe: `crearPost()` elige SIEMPRE la primera miniatura del Photo
 * Picker (`imgGaleriaItem`), así que el test depende de qué haya en la galería.
 * Y la propia suite la ensuciaba: el `beforeTest` de `wdio.shared.conf.ts` graba
 * la pantalla en todos los tests y Appium escribe esos .mp4 en la raíz de
 * /sdcard con nombre aleatorio; MediaStore los indexa y el picker los ofrece
 * como si fueran fotos. Eso fue lo que en 2026-09-07 se leyó como "el picker
 * quedó sirviendo una miniatura cacheada y corrupta" (era el primer frame de
 * `454d19c6.mp4`, una grabación de Appium) y costó dos sesiones.
 *
 * La solución es no depender del estado del AVD: la imagen vive versionada en
 * `test-data/media/` y se empuja al device en cada corrida. Así el fixture es
 * el mismo en cualquier máquina y sobrevive a un Wipe Data.
 */

const DEVICE_DIR = '/sdcard/Pictures/IntramedQA'
const MEDIA_DIR = path.resolve('./test-data/media')

function esImagen(archivo: string): boolean {
  return /\.(png|jpe?g)$/i.test(archivo)
}

function adb(args: string[]): string {
  return execFileSync('adb', args, { encoding: 'utf8' })
}

/** MediaStore no indexa solo un archivo recién empujado por adb: hay que pedirle
 * el scan explícito, o el picker no lo muestra. */
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

/**
 * Borra las grabaciones que Appium deja sueltas en la raíz de /sdcard. Son las
 * que contaminan el picker (ver comentario de arriba). No toca nada dentro de
 * subcarpetas: solo el patrón `/sdcard/<hex>.mp4` que genera Appium.
 */
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

/**
 * Empuja los fixtures de `test-data/media/` al device y los deja como lo más
 * reciente de la galería, para que el picker los ofrezca primero.
 *
 * **Por defecto empuja SOLO imágenes, y borra del device cualquier video que
 * haya quedado de una corrida anterior.** `crearPost()` elige la primera
 * miniatura del picker, sea lo que sea: si hay un .mp4 más reciente que la
 * imagen, TC03 adjunta el video y el composer deja de exponer "Cambiar imagen"
 * (el flujo se queda esperando en el paso 1 sin escribir el texto ni tocar
 * "Siguiente"). Ordenar por fecha de push no alcanza — el `touch` tiene
 * precisión de segundos y el desempate deja de ser confiable.
 *
 * Para el caso de publicar video (`IE-T148`) hay que llamarlo con
 * `{ incluirVideos: true }` Y enseñarle a `crearPost()` a elegir el fixture por
 * nombre en vez de por posición; hasta entonces, el video no debe estar en la
 * galería.
 *
 * Es best-effort a propósito: si adb no está disponible no debe tumbar la
 * corrida entera — los tests que no usan el picker tienen que poder correr.
 */
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
      // Un video de una corrida anterior sigue en la galería y puede ganarle en
      // fecha a la imagen. Se borra explícitamente.
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
      // El picker ordena por fecha descendente y toma la del archivo, no la del
      // push: sin esto un fixture "viejo" queda debajo de cualquier captura que
      // haya quedado en el device.
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
