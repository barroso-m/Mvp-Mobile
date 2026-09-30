/**
 * Lectura del código OTP de onboarding desde Gmail.
 *
 * El OTP de registro llega por EMAIL (remitente `info@intramed.net`), no por
 * SMS: `otp.helper.ts` —que lee el inbox de SMS del emulador— no sirve para
 * esta suite.
 *
 * Portado de `Intramed.MVP-Web/utils/gmail-otp.ts`, pero contra la API REST de
 * Gmail con `fetch` en vez del SDK `googleapis`, para no sumar una dependencia
 * pesada al repo mobile. Node 24 ya trae `fetch` global.
 *
 * Requiere en `.env`: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET,
 * GMAIL_REFRESH_TOKEN y GMAIL_TEST_INBOX (ver `.env.example`).
 */

const OTP_SENDER = 'info@intramed.net'
const CODE_REGEX =
  /c[oó]digo de verificaci[oó]n:[\s\S]{0,400}?(?<![#\d])(\d{6})(?!\d)/i
const OTP_TIMEOUT = 60000
const POLL_INTERVAL = 3000

interface GmailMessagePart {
  body?: { data?: string }
  parts?: GmailMessagePart[]
}

/** Intercambia el refresh token por un access token de corta vida. */
async function getAccessToken(): Promise<string> {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } =
    process.env
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error(
      'Faltan GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN en .env — ' +
        'sin eso la suite de Onboarding no puede leer el OTP.',
    )
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    throw new Error(
      `No se pudo renovar el access token de Gmail (HTTP ${res.status}): ${await res.text()}`,
    )
  }

  const { access_token: accessToken } = (await res.json()) as {
    access_token?: string
  }
  if (!accessToken) throw new Error('Gmail no devolvió access_token')
  return accessToken
}

async function gmailGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/${path}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) {
    throw new Error(
      `Gmail API falló en ${path} (HTTP ${res.status}): ${await res.text()}`,
    )
  }
  return (await res.json()) as T
}

/** El cuerpo puede venir en la raíz o repartido en partes MIME anidadas. */
function extractBody(part: GmailMessagePart | undefined): string {
  if (!part) return ''
  if (part.body?.data) {
    return Buffer.from(part.body.data, 'base64').toString('utf-8')
  }
  if (part.parts) return part.parts.map(extractBody).join('\n')
  return ''
}

interface GetOtpCodeOptions {
  timeoutMs?: number
  pollIntervalMs?: number
  /** Ignora mails anteriores a esta fecha — clave en `IE-T35`, que pide un
   *  segundo código después de fallar con uno incorrecto. */
  sentAfter?: Date
}

async function getOtpCode(
  recipientEmail: string,
  options: GetOtpCodeOptions = {},
): Promise<string> {
  const {
    timeoutMs = OTP_TIMEOUT,
    pollIntervalMs = POLL_INTERVAL,
    sentAfter,
  } = options

  const accessToken = await getAccessToken()
  const deadline = Date.now() + timeoutMs
  const afterQuery = sentAfter
    ? ` after:${Math.floor(sentAfter.getTime() / 1000)}`
    : ''
  const query = encodeURIComponent(
    `to:${recipientEmail} from:${OTP_SENDER}${afterQuery}`,
  )

  while (Date.now() < deadline) {
    const list = await gmailGet<{ messages?: { id?: string }[] }>(
      `messages?q=${query}&maxResults=5`,
      accessToken,
    )

    for (const { id } of list.messages ?? []) {
      if (!id) continue
      const message = await gmailGet<{ payload?: GmailMessagePart }>(
        `messages/${id}?format=full`,
        accessToken,
      )
      const match = extractBody(message.payload).match(CODE_REGEX)
      if (match) return match[1]
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(
    `No se encontró el código OTP para ${recipientEmail} dentro de ${timeoutMs}ms`,
  )
}

/**
 * Arma un email único con plus-addressing sobre la casilla de prueba
 * (`automation+onb1234@gmail.com`). Gmail entrega todo al mismo inbox, así que
 * cada corrida registra una cuenta nueva sin pedir casillas nuevas.
 */
function buildOnboardingTestEmail(label: string): string {
  const inbox = process.env.GMAIL_TEST_INBOX ?? 'automationintramed@gmail.com'
  const [user, domain] = inbox.split('@')
  return `${user}+${label}${Date.now()}@${domain}`
}

export { getOtpCode, buildOnboardingTestEmail }
