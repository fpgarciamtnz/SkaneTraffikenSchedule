<script setup lang="ts">
const { slots, status } = useAvailabilitySlots()

const statusColors = {
  available: 'success',
  pending: 'warning',
  booked: 'error'
} as const

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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Train Pass Availability
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          View and request available time slots
        </p>
      </div>

      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <div v-else-if="!slots || slots.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-calendar" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500">No available slots at the moment</p>
      </div>

      <div v-else class="space-y-4">
        <UCard v-for="slot in slots" :key="slot.id">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold text-lg">
                {{ formatDate(slot.startDatetime) }}
              </div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ formatTime(slot.startDatetime) }} - {{ getEndTime(slot.startDatetime, slot.durationHours) }}
                ({{ slot.durationHours }}h)
              </div>
            </div>
            <div class="flex items-center gap-3">
              <UBadge :color="statusColors[slot.status]">
                {{ slot.status }}
              </UBadge>
              <UButton
                v-if="slot.status === 'available'"
                :to="`/request/${slot.id}`"
                color="primary"
              >
                Request
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
