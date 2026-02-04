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

  const slots = await db.select().from(schema.availabilitySlots).where(eq(schema.availabilitySlots.id, id))

  if (slots.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Slot not found'
    })
  }

  return slots[0]
})
