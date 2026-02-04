import { ulid } from 'ulid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { startDatetime, durationHours } = body

  if (!startDatetime || !durationHours) {
    throw createError({
      statusCode: 400,
      message: 'startDatetime and durationHours are required'
    })
  }

  if (![4, 8, 12, 24, 48].includes(durationHours)) {
    throw createError({
      statusCode: 400,
      message: 'durationHours must be 4, 8, 12, 24, or 48'
    })
  }

  const db = useDb()

  const slot = {
    id: ulid(),
    startDatetime,
    durationHours,
    status: 'available' as const,
    createdAt: new Date().toISOString()
  }

  await db.insert(schema.availabilitySlots).values(slot)

  return slot
})
