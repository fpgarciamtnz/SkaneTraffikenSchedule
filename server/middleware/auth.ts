export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/slots') && !path.startsWith('/api/requests')) {
    return
  }

  const method = event.method

  if (path.startsWith('/api/slots') && method === 'GET') {
    return
  }

  if (path === '/api/requests' && method === 'POST') {
    return
  }

  const session = await getAdminSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const config = useRuntimeConfig()
  if (session.email !== config.adminEmail) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden'
    })
  }
})
