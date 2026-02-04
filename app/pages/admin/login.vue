<script setup lang="ts">
const toast = useToast()
const { login } = useAuth()

const email = ref('')
const sending = ref(false)
const sent = ref(false)

async function onSubmit() {
  if (!email.value) return

  sending.value = true

  try {
    await login(email.value)
    sent.value = true
    toast.add({
      title: 'Magic link sent',
      description: 'Check your email for the login link',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to send magic link',
      color: 'error'
    })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Admin Login</h1>
          <p class="text-gray-500 mt-1">Sign in with magic link</p>
        </div>
      </template>

      <div v-if="sent" class="text-center py-4">
        <UIcon name="i-heroicons-envelope" class="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 class="text-lg font-semibold mb-2">Check your email</h2>
        <p class="text-gray-500">
          We sent a login link to <strong>{{ email }}</strong>
        </p>
        <UButton variant="ghost" class="mt-4" @click="sent = false">
          Try different email
        </UButton>
      </div>

      <UForm v-else :state="{ email }" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            required
          />
        </UFormField>

        <UButton type="submit" block :loading="sending">
          Send Magic Link
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center">
          <UButton to="/" variant="ghost" size="sm">
            Back to calendar
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
