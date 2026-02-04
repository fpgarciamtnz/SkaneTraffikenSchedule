import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  const db = useDb()

  const links = await db.select().from(schema.magicLinks).where(eq(schema.magicLinks.token, token))

  if (links.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid token'
    })
  }

  const link = links[0]

  if (link.used) {
    throw createError({
      statusCode: 400,
      message: 'Token has already been used'
    })
  }

  if (new Date(link.expiresAt) < new Date()) {
    throw createError({
      statusCode: 400,
      message: 'Token has expired'
    })
  }

  await db.update(schema.magicLinks).set({ used: true }).where(eq(schema.magicLinks.id, link.id))

  await createAdminSession(event, link.email)

  return { success: true, email: link.email }
})
