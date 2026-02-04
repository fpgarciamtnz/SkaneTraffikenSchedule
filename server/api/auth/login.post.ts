import { ulid } from 'ulid'
import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required'
    })
  }

  const config = useRuntimeConfig()

  if (email !== config.adminEmail) {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized email'
    })
  }

  const db = useDb()

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const magicLink = {
    id: ulid(),
    token,
    email,
    expiresAt,
    used: false
  }

  await db.insert(schema.magicLinks).values(magicLink)

  const baseUrl = getRequestURL(event).origin
  const verifyUrl = `${baseUrl}/auth/verify?token=${token}`

  if (config.resendApiKey) {
    const resend = new Resend(config.resendApiKey)

    await resend.emails.send({
      from: 'noreply@resend.dev',
      to: email,
      subject: 'Your login link for Skånetrafiken Schedule',
      html: `
        <h1>Login to Skånetrafiken Schedule</h1>
        <p>Click the link below to log in. This link expires in 15 minutes.</p>
        <a href="${verifyUrl}">Log in</a>
        <p>Or copy this link: ${verifyUrl}</p>
      `
    })
  } else {
    console.log('Magic link (no Resend API key configured):', verifyUrl)
  }

  return { success: true }
})
