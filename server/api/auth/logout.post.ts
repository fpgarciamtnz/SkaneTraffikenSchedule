export default defineEventHandler(async (event) => {
  await clearAdminSession(event)

  return { success: true }
})
