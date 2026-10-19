import z from 'zod'

const lesson = z.object({
  id: z.number().int().positive('Lesson is required'),
  progress: z.array(z.string()),
  progressOtherText: z.string(),
})

export const journalSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    time: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(val),
        { message: 'Time must be in HH:MM-HH:MM format (24-hour)' },
      ),
    name: z.string().min(1, 'Student name is required'),
    class: z.string().min(1, 'Class is required'),
    courseId: z.string().optional(),
    courseOtherText: z.string().optional(),
    lessons: z.array(lesson),
    character: z.array(z.string()).min(1, 'At least one character is required'),
    characterOtherText: z.string().optional(),
    note: z.string(),
    generated_report: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.courseId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Course is required',
        path: ['course_id'],
      })
    }

    if (data.courseId === 'other' && !data.courseOtherText?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify the course or purpose',
        path: ['course_other_text'],
      })
    }

    if (data.courseId && data.courseId !== 'other' && !data.lessons.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Lesson is required',
        path: ['lesson_ids'],
      })
    }

    if (data.character.includes('other') && !data.characterOtherText?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify the other character',
        path: ['characterOtherText'],
      })
    }
  })

export type JournalValues = z.infer<typeof journalSchema>
