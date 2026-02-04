import type { H3Event } from 'h3'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_PREFIX = 'session:'

export async function createAdminSession(event: H3Event, email: string): Promise<string> {
  const sessionId = crypto.randomUUID()
  const kv = hubKV()

  await kv.set(`${SESSION_PREFIX}${sessionId}`, { email, createdAt: new Date().toISOString() }, { ttl: 60 * 60 * 24 * 7 })

  setCookie(event, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  return sessionId
}

export async function getAdminSession(event: H3Event): Promise<{ email: string } | null> {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (!sessionId) return null

  const kv = hubKV()
  const session = await kv.get<{ email: string }>(`${SESSION_PREFIX}${sessionId}`)

  return session
}

export async function clearAdminSession(event: H3Event): Promise<void> {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (sessionId) {
    const kv = hubKV()
    await kv.del(`${SESSION_PREFIX}${sessionId}`)
  }

  deleteCookie(event, SESSION_COOKIE_NAME)
}
