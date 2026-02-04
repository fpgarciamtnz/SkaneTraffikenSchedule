export interface AvailabilitySlot {
  id: string
  startDatetime: string
  durationHours: number
  status: 'available' | 'pending' | 'booked'
  createdAt: string
}

export function useAvailabilitySlots() {
  const { data: slots, refresh, status } = useFetch<AvailabilitySlot[]>('/api/slots', {
    default: () => []
  })

  async function createSlot(startDatetime: string, durationHours: number) {
    await $fetch('/api/slots', {
      method: 'POST',
      body: { startDatetime, durationHours }
    })
    await refresh()
  }

  async function deleteSlot(id: string) {
    await $fetch(`/api/slots/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return {
    slots,
    refresh,
    status,
    createSlot,
    deleteSlot
  }
}
