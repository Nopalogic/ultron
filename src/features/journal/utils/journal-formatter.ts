import { formatLessonLabel } from '../constants/option-catalog'
import type { Course } from '../types'

type Params = {
  date: string
  className: string
  time: string
  name: string
  lessonList: string
  generatedJournal: string
}

export function journalFormatter({
  date,
  className,
  time,
  name,
  lessonList,
  generatedJournal,
}: Params): string {
  const formatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' })
  return `${formatter.format(new Date(date))} - ${className.toUpperCase()} ${time}\n${name}\n${lessonList}\n\n${generatedJournal}`
}

export function buildLessonList(
  courses: Course[],
  courseId: string | undefined,
  lessons: { id: number }[],
): string {
  const course = courses.find((item) => String(item.id) === courseId)
  if (!course) return ''

  const selected = new Set(lessons.map((lesson) => lesson.id))
  return course.lessons
    .filter((lesson) => selected.has(lesson.id))
    .map(formatLessonLabel)
    .join('\n')
}
