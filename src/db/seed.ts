import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { courseSeeder } from './seeders/course'

export type DB = ReturnType<typeof drizzle<typeof schema>>

async function main() {
  const db = drizzle(process.env.DATABASE_URL!, { schema })

  try {
    await courseSeeder(db)
  } catch (err) {
    console.error('Seeding failed: ', err)
    process.exitCode = 1
  }
}

main()
