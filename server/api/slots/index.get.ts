import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDb()

  const slots = await db.select().from(schema.availabilitySlots).orderBy(schema.availabilitySlots.startDatetime)

  return slots
})
