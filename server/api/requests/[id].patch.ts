import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Request ID is required'
    })
  }

  const { status } = body

  if (!status || !['approved', 'rejected'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'status must be "approved" or "rejected"'
    })
  }

  const db = useDb()

  const requests = await db.select().from(schema.bookingRequests).where(eq(schema.bookingRequests.id, id))

  if (requests.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Request not found'
    })
  }

  const request = requests[0]

  await db.update(schema.bookingRequests).set({ status }).where(eq(schema.bookingRequests.id, id))

  if (status === 'approved') {
    await db.update(schema.availabilitySlots).set({ status: 'booked' }).where(eq(schema.availabilitySlots.id, request.slotId))

    await db
      .update(schema.bookingRequests)
      .set({ status: 'rejected' })
      .where(eq(schema.bookingRequests.slotId, request.slotId))

    await db.update(schema.bookingRequests).set({ status: 'approved' }).where(eq(schema.bookingRequests.id, id))
  } else if (status === 'rejected') {
    const otherPendingRequests = await db
      .select()
      .from(schema.bookingRequests)
      .where(eq(schema.bookingRequests.slotId, request.slotId))

    const hasPendingRequests = otherPendingRequests.some((r) => r.id !== id && r.status === 'pending')

    if (!hasPendingRequests) {
      await db.update(schema.availabilitySlots).set({ status: 'available' }).where(eq(schema.availabilitySlots.id, request.slotId))
    }
  }

  return { success: true }
})
