export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)

  return {
    authenticated: !!session,
    email: session?.email || null
  }
})
