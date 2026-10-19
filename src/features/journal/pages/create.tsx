import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'

import { DateField } from '../components/date-field'
import { TimeField } from '../components/time-field'
import { NameField } from '../components/name-field'
import { ClassField } from '../components/class-field'
import { CourseField } from '../components/course-field'
import { NoteField } from '../components/note-field'
import { LessonField } from '../components/lesson-field'
import { CharacterField } from '../components/character-field'
import { JournalPreview } from '../components/journal-preview'

import { useJournalForm } from '../hooks/use-journal-form'
import { coursesQueryOptions } from '../queries'
import { buildLessonList, journalFormatter } from '../utils/journal-formatter'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageField } from '../components/language-field'

export default function JournalCreate() {
  const { data: courses } = useSuspenseQuery(coursesQueryOptions())
  const { form, submit, isGenerating, generateError, clearForm } =
    useJournalForm()

  const values = form.watch()
  const generated = values.generated_report
  const showPreview =
    isGenerating || Boolean(generated) || Boolean(generateError)

  const report = journalFormatter({
    date: values.date,
    className: values.class,
    time: values.time ?? '',
    name: values.name,
    lessonList: buildLessonList(courses, values.courseId, values.lessons),
    generatedJournal: generated,
  })

  return (
    <>
      <header className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <h1 className="flex-1 truncate text-base font-semibold">
          Create Journal
        </h1>

        <Button onClick={clearForm}>Clear All</Button>
      </header>
      <form onSubmit={submit} className="space-y-6 mt-16 p-4">
        <DateField control={form.control} />
        <TimeField control={form.control} />
        <ClassField control={form.control} />
        <NameField control={form.control} />
        <CourseField control={form.control} courseOptions={courses} />
        <LessonField control={form.control} lessonOptions={courses} />
        <CharacterField control={form.control} />
        <NoteField control={form.control} />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || isGenerating}
        >
          {isGenerating ? 'Generating…' : 'Generate'}
        </Button>

        {showPreview && (
          <JournalPreview
            report={report}
            hasContent={Boolean(generated)}
            isGenerating={isGenerating}
            error={generateError}
          />
        )}
      </form>
    </>
  )
}
