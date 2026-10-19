import { db } from '@/db/index'

import type { Course } from './types'

export async function listCourses(): Promise<Course[]> {
  return await db.query.courses.findMany({
    with: {
      lessons: true,
    },
  })
}
