import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Slot ID is required'
    })
  }

  const db = useDb()

  await db.delete(schema.bookingRequests).where(eq(schema.bookingRequests.slotId, id))

  await db.delete(schema.availabilitySlots).where(eq(schema.availabilitySlots.id, id))

  return { success: true }
})
