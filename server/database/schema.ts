import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const availabilitySlots = sqliteTable('availability_slots', {
  id: text('id').primaryKey(),
  startDatetime: text('start_datetime').notNull(),
  durationHours: integer('duration_hours').notNull(),
  status: text('status', { enum: ['available', 'pending', 'booked'] }).notNull().default('available'),
  createdAt: text('created_at').notNull()
})

export const bookingRequests = sqliteTable('booking_requests', {
  id: text('id').primaryKey(),
  slotId: text('slot_id').notNull().references(() => availabilitySlots.id),
  name: text('name').notNull(),
  phone: text('phone'),
  facebookTag: text('facebook_tag'),
  message: text('message'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull()
})

export const magicLinks = sqliteTable('magic_links', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  expiresAt: text('expires_at').notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false)
})
