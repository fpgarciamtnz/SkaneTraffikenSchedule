<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { checkSession } = useAuth()

const token = route.query.token as string
const verifying = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!token) {
    error.value = 'No token provided'
    verifying.value = false
    return
  }

  try {
    await $fetch('/api/auth/verify', {
      query: { token }
    })

    await checkSession()

    toast.add({
      title: 'Logged in',
      description: 'You have been logged in successfully',
      color: 'success'
    })

    router.push('/admin')
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to verify token'
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <div class="text-center py-8">
        <template v-if="verifying">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 mx-auto animate-spin text-primary-500 mb-4" />
          <p class="text-gray-500">Verifying your login...</p>
        </template>

        <template v-else-if="error">
          <UIcon name="i-heroicons-x-circle" class="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 class="text-lg font-semibold mb-2">Verification Failed</h2>
          <p class="text-gray-500 mb-4">{{ error }}</p>
          <UButton to="/admin/login">Try again</UButton>
        </template>

        <template v-else>
          <UIcon name="i-heroicons-check-circle" class="w-16 h-16 mx-auto text-green-500 mb-4" />
          <p class="text-gray-500">Redirecting...</p>
        </template>
      </div>
    </UCard>
  </div>
</template>
