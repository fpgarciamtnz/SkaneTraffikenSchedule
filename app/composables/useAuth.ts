export interface AuthState {
  authenticated: boolean
  email: string | null
}

export function useAuth() {
  const authState = useState<AuthState>('auth', () => ({
    authenticated: false,
    email: null
  }))

  const pending = ref(false)

  async function checkSession() {
    pending.value = true
    try {
      const data = await $fetch('/api/auth/session')
      authState.value = {
        authenticated: data.authenticated,
        email: data.email
      }
    } catch {
      authState.value = { authenticated: false, email: null }
    } finally {
      pending.value = false
    }
  }

  async function login(email: string) {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email }
    })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    authState.value = { authenticated: false, email: null }
  }

  return {
    authState,
    pending,
    checkSession,
    login,
    logout
  }
}
