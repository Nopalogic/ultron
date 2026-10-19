import { queryOptions } from '@tanstack/react-query'

import { getCourses } from './course.function'

export const coursesQueryOptions = () =>
  queryOptions({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    staleTime: 'static',
  })
