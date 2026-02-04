<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const slotId = route.params.id as string

const { data: slot, status } = await useFetch(`/api/slots/${slotId}`)

const formState = reactive({
  name: '',
  phone: '',
  facebookTag: '',
  message: ''
})

const submitting = ref(false)
const submitted = ref(false)

function formatDate(datetime: string) {
  return new Date(datetime).toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getEndTime(datetime: string, hours: number) {
  const end = new Date(new Date(datetime).getTime() + hours * 60 * 60 * 1000)
  return end.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function onSubmit(event: FormSubmitEvent<typeof formState>) {
  if (!formState.phone && !formState.facebookTag) {
    toast.add({
      title: 'Contact required',
      description: 'Please provide either a phone number or Facebook tag',
      color: 'error'
    })
    return
  }

  submitting.value = true

  try {
    await $fetch('/api/requests', {
      method: 'POST',
      body: {
        slotId,
        name: formState.name,
        phone: formState.phone || null,
        facebookTag: formState.facebookTag || null,
        message: formState.message || null
      }
    })

    submitted.value = true
    toast.add({
      title: 'Request submitted',
      description: 'Your request has been submitted successfully',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to submit request',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-xl mx-auto px-4 py-8">
      <UButton
        to="/"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        class="mb-6"
      >
        Back to calendar
      </UButton>

      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <div v-else-if="!slot" class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 mx-auto text-red-400 mb-4" />
        <p class="text-gray-500">Slot not found</p>
      </div>

      <div v-else-if="slot.status !== 'available'" class="text-center py-12">
        <UIcon name="i-heroicons-x-circle" class="w-16 h-16 mx-auto text-yellow-400 mb-4" />
        <p class="text-gray-500">This slot is no longer available</p>
        <UButton to="/" class="mt-4">View other slots</UButton>
      </div>

      <div v-else-if="submitted" class="text-center py-12">
        <UIcon name="i-heroicons-check-circle" class="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 class="text-xl font-semibold mb-2">Request Submitted!</h2>
        <p class="text-gray-500 mb-4">
          Your request has been submitted. The owner will contact you if approved.
        </p>
        <UButton to="/">Back to calendar</UButton>
      </div>

      <template v-else>
        <UCard class="mb-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold mb-2">
              {{ formatDate(slot.startDatetime) }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ formatTime(slot.startDatetime) }} - {{ getEndTime(slot.startDatetime, slot.durationHours) }}
              ({{ slot.durationHours }} hours)
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Request this slot</h2>
          </template>

          <UForm :state="formState" class="space-y-4" @submit="onSubmit">
            <UFormField label="Name" name="name" required>
              <UInput v-model="formState.name" placeholder="Your name" required />
            </UFormField>

            <UFormField label="Phone" name="phone">
              <UInput v-model="formState.phone" type="tel" placeholder="+46 70 123 4567" />
            </UFormField>

            <UFormField label="Facebook" name="facebookTag">
              <UInput v-model="formState.facebookTag" placeholder="@username" />
            </UFormField>

            <p class="text-sm text-gray-500">
              Provide at least one contact method (phone or Facebook)
            </p>

            <UFormField label="Message (optional)" name="message">
              <UTextarea v-model="formState.message" placeholder="Any additional information..." />
            </UFormField>

            <UButton type="submit" block :loading="submitting">
              Submit Request
            </UButton>
          </UForm>
        </UCard>
      </template>
    </div>
  </div>
</template>
