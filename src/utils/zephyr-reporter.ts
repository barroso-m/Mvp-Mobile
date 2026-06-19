import fs from 'fs'
import path from 'path'

const RESULTS_FILE = path.resolve(process.cwd(), '.zephyr-results.json')
const ZEPHYR_KEY_REGEX = /\[([A-Z]+-T\d+)\]/
const ZEPHYR_BASE_URL = 'https://prod-api.zephyr4jiracloud.com/v2'

type ZephyrStatus = 'Pass' | 'Fail' | 'Not Executed'

interface ZephyrResult {
  zephyrKey: string
  testName: string
  status: ZephyrStatus
  durationMs: number
}

function readResults(): ZephyrResult[] {
  if (!fs.existsSync(RESULTS_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8')) as ZephyrResult[]
  } catch {
    return []
  }
}

function writeResults(results: ZephyrResult[]): void {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
}

export function resetResults(): void {
  if (fs.existsSync(RESULTS_FILE)) fs.unlinkSync(RESULTS_FILE)
}

export function recordResult(
  testTitle: string,
  passed: boolean,
  durationMs: number,
): void {
  const keyMatch = testTitle.match(ZEPHYR_KEY_REGEX)
  if (!keyMatch) return

  const result: ZephyrResult = {
    zephyrKey: keyMatch[1],
    testName: testTitle,
    status: passed ? 'Pass' : 'Fail',
    durationMs,
  }

  const existing = readResults().filter((r) => r.zephyrKey !== result.zephyrKey)
  existing.push(result)
  writeResults(existing)
}

export async function uploadResults(): Promise<void> {
  const results = readResults()
  if (results.length === 0) {
    console.log(
      '[zephyr] No hay resultados taggeados con [XX-Tn], se omite la subida.',
    )
    return
  }

  const token = process.env.ZEPHYR_AUTH_TOKEN
  const projectKey = process.env.ZEPHYR_PROJECT_KEY
  if (!token || !projectKey) {
    console.warn(
      '[zephyr] Faltan ZEPHYR_AUTH_TOKEN o ZEPHYR_PROJECT_KEY — se omite la subida.',
    )
    return
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const folderId = process.env.ZEPHYR_FOLDER_ID
    ? Number(process.env.ZEPHYR_FOLDER_ID)
    : undefined

  const now = new Date()
  const cycleName = `Mobile Run — ${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR')}`

  const passed = results.filter((r) => r.status === 'Pass').length
  const failed = results.filter((r) => r.status === 'Fail').length

  console.log(`\n[zephyr] Creando ciclo "${cycleName}"`)
  console.log(`[zephyr] Tests: ${results.length} (✅ ${passed} / ❌ ${failed})`)

  try {
    const cycleRes = await fetch(`${ZEPHYR_BASE_URL}/testcycles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectKey,
        name: cycleName,
        description: `Ejecución automatizada mobile (WDIO + Appium) — ${now.toISOString()}`,
        ...(folderId !== undefined && { folderId }),
      }),
    })

    if (!cycleRes.ok) {
      const text = await cycleRes.text().catch(() => '')
      console.error(
        `[zephyr] No se pudo crear el ciclo (status ${cycleRes.status}): ${text}`,
      )
      return
    }

    const cycleData = (await cycleRes.json()) as { key: string }
    const cycleKey = cycleData.key
    console.log(`[zephyr] Ciclo creado: ${cycleKey}`)

    for (const result of results) {
      const execRes = await fetch(`${ZEPHYR_BASE_URL}/testexecutions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectKey,
          testCaseKey: result.zephyrKey,
          testCycleKey: cycleKey,
          statusName: result.status,
          executionTime: result.durationMs,
          comment: `WDIO + Appium — ${result.status} en ${(result.durationMs / 1000).toFixed(1)}s`,
        }),
      })

      const icon = execRes.ok ? (result.status === 'Pass' ? '✅' : '❌') : '⚠️'
      const detail = execRes.ok ? result.status : await execRes.text()
      console.log(`  ${icon} ${result.zephyrKey}: ${detail}`)
    }

    console.log('[zephyr] Subida completada.')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[zephyr] Excepción en la subida: ${msg}`)
  }
}
