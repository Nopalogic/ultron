import { createServerFn } from '@tanstack/react-start'

import { listCourses } from './course.server'

export const getCourses = createServerFn({ method: 'GET' }).handler(
  async () => await listCourses(),
)
