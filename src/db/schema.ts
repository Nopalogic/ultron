import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const courses = pgTable('courses', {
  id: serial().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const lessons = pgTable('lessons', {
  id: serial().primaryKey(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id),
  name: text().notNull(),
  number: integer().notNull(),
  objectives: text().array().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
}))

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
}))
