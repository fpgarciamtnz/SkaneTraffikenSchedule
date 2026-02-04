export default defineNuxtRouteMiddleware(async () => {
  const { authState, checkSession } = useAuth()

  if (!authState.value.authenticated) {
    await checkSession()
  }

  if (!authState.value.authenticated) {
    return navigateTo('/admin/login')
  }
})
