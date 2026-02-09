<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

const { slots, status } = useAvailabilitySlots()

const selectedDate = ref<DateValue>(today(getLocalTimeZone()))

const statusColors = {
  available: 'success' as const,
  pending: 'warning' as const,
  booked: 'error' as const
}

// Group slots by date (YYYY-MM-DD)
const slotsByDate = computed(() => {
  const map = new Map<string, typeof slots.value>()
  if (!slots.value) return map
  for (const slot of slots.value) {
    const dateKey = slot.startDatetime.slice(0, 10)
    if (!map.has(dateKey)) map.set(dateKey, [])
    map.get(dateKey)!.push(slot)
  }
  return map
})

// Dates that have at least one available slot
const availableDateKeys = computed(() => {
  const keys = new Set<string>()
  if (!slots.value) return keys
  for (const slot of slots.value) {
    if (slot.status === 'available') {
      keys.set(slot.startDatetime.slice(0, 10))
    }
  }
  return keys
})

// Mark dates as unavailable if they have no available slots
function isDateUnavailable(date: DateValue) {
  const key = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return !availableDateKeys.value.has(key)
}

// Slots for the currently selected date
const selectedDaySlots = computed(() => {
  if (!selectedDate.value) return []
  const key = `${selectedDate.value.year}-${String(selectedDate.value.month).padStart(2, '0')}-${String(selectedDate.value.day).padStart(2, '0')}`
  return slotsByDate.value.get(key) || []
})

function formatSelectedDate(date: DateValue) {
  const jsDate = new Date(date.year, date.month - 1, date.day)
  return jsDate.toLocaleDateString('sv-SE', {
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
          Select a date to see available time slots
        </p>
      </div>

      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <template v-else>
        <div class="flex flex-col items-center gap-8">
          <!-- Calendar -->
          <UCalendar
            v-model="selectedDate"
            :is-date-unavailable="isDateUnavailable"
            size="lg"
          />

          <!-- Time slots for selected day -->
          <div class="w-full max-w-lg">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
              {{ formatSelectedDate(selectedDate) }}
            </h2>

            <div v-if="selectedDaySlots.length === 0" class="text-center py-8">
              <UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p class="text-gray-500">No available time slots for this date</p>
            </div>

            <div v-else class="space-y-3">
              <UCard v-for="slot in selectedDaySlots" :key="slot.id">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-semibold text-lg">
                      {{ formatTime(slot.startDatetime) }} - {{ getEndTime(slot.startDatetime, slot.durationHours) }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ slot.durationHours }}h duration
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
                      size="sm"
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
    </div>
  </div>
</template>
