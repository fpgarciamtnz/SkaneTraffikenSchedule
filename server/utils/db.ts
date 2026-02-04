import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

export { schema }

export function useDb() {
  return drizzle(hubDatabase(), { schema })
}
