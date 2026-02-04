import { ulid } from 'ulid'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { slotId, name, phone, facebookTag, message } = body

  if (!slotId || !name) {
    throw createError({
      statusCode: 400,
      message: 'slotId and name are required'
    })
  }

  if (!phone && !facebookTag) {
    throw createError({
      statusCode: 400,
      message: 'Either phone or facebookTag is required'
    })
  }

  const db = useDb()

  const slots = await db.select().from(schema.availabilitySlots).where(eq(schema.availabilitySlots.id, slotId))

  if (slots.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Slot not found'
    })
  }

  const slot = slots[0]

  if (slot.status !== 'available') {
    throw createError({
      statusCode: 400,
      message: 'Slot is not available'
    })
  }

  const request = {
    id: ulid(),
    slotId,
    name,
    phone: phone || null,
    facebookTag: facebookTag || null,
    message: message || null,
    status: 'pending' as const,
    createdAt: new Date().toISOString()
  }

  await db.insert(schema.bookingRequests).values(request)

  await db.update(schema.availabilitySlots).set({ status: 'pending' }).where(eq(schema.availabilitySlots.id, slotId))

  return request
})
