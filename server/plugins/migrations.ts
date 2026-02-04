import { consola } from 'consola'
import { migrate } from 'drizzle-orm/d1/migrator'

export default defineNitroPlugin(async () => {
  if (!import.meta.dev) return

  onHubReady(async () => {
    const db = useDb()

    await migrate(db, {
      migrationsFolder: 'server/database/migrations'
    })

    consola.success('Database migrations applied')
  })
})
