<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const toast = useToast()
const { authState, logout } = useAuth()
const { slots, createSlot, deleteSlot, refresh: refreshSlots } = useAvailabilitySlots()

const { data: requests, refresh: refreshRequests } = await useFetch('/api/requests', {
  default: () => []
})

const showCreateModal = ref(false)

const newSlot = reactive({
  date: '',
  time: '',
  durationHours: 8
})

const durationOptions = [
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 },
  { label: '48 hours', value: 48 }
]

async function handleCreateSlot() {
  if (!newSlot.date || !newSlot.time) {
    toast.add({ title: 'Error', description: 'Date and time are required', color: 'error' })
    return
  }

  try {
    const startDatetime = new Date(`${newSlot.date}T${newSlot.time}`).toISOString()
    await createSlot(startDatetime, newSlot.durationHours)
    showCreateModal.value = false
    newSlot.date = ''
    newSlot.time = ''
    newSlot.durationHours = 8
    toast.add({ title: 'Slot created', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || 'Failed to create slot', color: 'error' })
  }
}

async function handleDeleteSlot(id: string) {
  try {
    await deleteSlot(id)
    toast.add({ title: 'Slot deleted', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || 'Failed to delete slot', color: 'error' })
  }
}

async function handleApprove(id: string) {
  try {
    await $fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      body: { status: 'approved' }
    })
    await refreshRequests()
    await refreshSlots()
    toast.add({ title: 'Request approved', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || 'Failed to approve', color: 'error' })
  }
}

async function handleReject(id: string) {
  try {
    await $fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      body: { status: 'rejected' }
    })
    await refreshRequests()
    await refreshSlots()
    toast.add({ title: 'Request rejected', color: 'warning' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || 'Failed to reject', color: 'error' })
  }
}

async function handleLogout() {
  await logout()
  navigateTo('/admin/login')
}

function formatDate(datetime: string) {
  return new Date(datetime).toLocaleDateString('sv-SE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusColors = {
  available: 'success',
  pending: 'warning',
  booked: 'error'
} as const

const requestStatusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
} as const

const pendingRequests = computed(() => requests.value?.filter(r => r.status === 'pending') || [])
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ authState.email }}</span>
          <UButton variant="ghost" size="sm" @click="handleLogout">
            Logout
          </UButton>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Slots Section -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Availability Slots</h2>
            <UButton icon="i-heroicons-plus" @click="showCreateModal = true">
              Add Slot
            </UButton>
          </div>

          <div v-if="!slots || slots.length === 0" class="text-center py-8 text-gray-500">
            No slots created yet
          </div>

          <div v-else class="space-y-3">
            <UCard v-for="slot in slots" :key="slot.id" class="p-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ formatDate(slot.startDatetime) }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatTime(slot.startDatetime) }} ({{ slot.durationHours }}h)
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="statusColors[slot.status]" size="sm">
                    {{ slot.status }}
                  </UBadge>
                  <UButton
                    icon="i-heroicons-trash"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="handleDeleteSlot(slot.id)"
                  />
                </div>
              </div>
            </UCard>
          </div>
        </section>

        <!-- Requests Section -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">
              Booking Requests
              <UBadge v-if="pendingRequests.length > 0" color="warning" size="sm" class="ml-2">
                {{ pendingRequests.length }} pending
              </UBadge>
            </h2>
          </div>

          <div v-if="!requests || requests.length === 0" class="text-center py-8 text-gray-500">
            No requests yet
          </div>

          <div v-else class="space-y-3">
            <UCard v-for="request in requests" :key="request.id" class="p-3">
              <div class="space-y-2">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-medium">{{ request.name }}</div>
                    <div class="text-sm text-gray-500">
                      {{ request.slotStartDatetime ? formatDate(request.slotStartDatetime) : 'Unknown slot' }}
                      {{ request.slotStartDatetime ? formatTime(request.slotStartDatetime) : '' }}
                    </div>
                  </div>
                  <UBadge :color="requestStatusColors[request.status]" size="sm">
                    {{ request.status }}
                  </UBadge>
                </div>

                <div class="text-sm space-y-1">
                  <div v-if="request.phone" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-phone" class="w-4 h-4 text-gray-400" />
                    <span>{{ request.phone }}</span>
                  </div>
                  <div v-if="request.facebookTag" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-at-symbol" class="w-4 h-4 text-gray-400" />
                    <span>{{ request.facebookTag }}</span>
                  </div>
                  <div v-if="request.message" class="text-gray-500 italic">
                    "{{ request.message }}"
                  </div>
                </div>

                <div v-if="request.status === 'pending'" class="flex gap-2 pt-2">
                  <UButton size="sm" color="success" @click="handleApprove(request.id)">
                    Approve
                  </UButton>
                  <UButton size="sm" color="error" variant="outline" @click="handleReject(request.id)">
                    Reject
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>
        </section>
      </div>
    </main>

    <!-- Create Slot Modal -->
    <UModal v-model:open="showCreateModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Create Availability Slot</h3>
              <UButton
                icon="i-heroicons-x-mark"
                variant="ghost"
                size="sm"
                @click="showCreateModal = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Date" required>
              <UInput v-model="newSlot.date" type="date" />
            </UFormField>

            <UFormField label="Start Time" required>
              <UInput v-model="newSlot.time" type="time" />
            </UFormField>

            <UFormField label="Duration">
              <USelect v-model="newSlot.durationHours" :items="durationOptions" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showCreateModal = false">
                Cancel
              </UButton>
              <UButton @click="handleCreateSlot">
                Create Slot
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
