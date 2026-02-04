import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDb()

  const requests = await db
    .select({
      id: schema.bookingRequests.id,
      slotId: schema.bookingRequests.slotId,
      name: schema.bookingRequests.name,
      phone: schema.bookingRequests.phone,
      facebookTag: schema.bookingRequests.facebookTag,
      message: schema.bookingRequests.message,
      status: schema.bookingRequests.status,
      createdAt: schema.bookingRequests.createdAt,
      slotStartDatetime: schema.availabilitySlots.startDatetime,
      slotDurationHours: schema.availabilitySlots.durationHours
    })
    .from(schema.bookingRequests)
    .leftJoin(schema.availabilitySlots, eq(schema.bookingRequests.slotId, schema.availabilitySlots.id))
    .orderBy(desc(schema.bookingRequests.createdAt))

  return requests
})
