import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sql } from 'drizzle-orm'

import type { Course } from '@/features/journal'

import { courses, lessons } from '../schema'
import type { DB } from '../seed'

export async function courseSeeder(db: DB) {
  const file = resolve(process.cwd(), 'src/db/seeders/data/courses.json')
  const data: Course[] = JSON.parse(readFileSync(file, 'utf-8'))

  await db.transaction(async (tx) => {
    await tx.delete(lessons)
    await tx.delete(courses)

    await tx
      .insert(courses)
      .values(data.map((c) => ({ id: c.id, name: c.name })))

    await tx.insert(lessons).values(
      data.flatMap((c) =>
        c.lessons.map((l) => ({
          id: l.id,
          courseId: c.id,
          name: l.name,
          number: l.number,
          objectives: l.objectives,
        })),
      ),
    )

    await tx.execute(
      sql`SELECT setval(pg_get_serial_sequence('courses', 'id'), (SELECT MAX(id) FROM courses))`,
    )
    await tx.execute(
      sql`SELECT setval(pg_get_serial_sequence('lessons', 'id'), (SELECT MAX(id) FROM lessons))`,
    )
  })

  const lessonCount = data.reduce((n, c) => n + c.lessons.length, 0)
  console.log(`Seeded ${data.length} courses and ${lessonCount} lessons`)

  await db.$client.end()
}
