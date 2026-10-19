import { memo, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
} from 'react-hook-form'
import type { Control } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { JournalValues } from '../validation'
import {
  PROGRESS_OPTIONS,
  formatLessonLabel,
} from '../constants/option-catalog'
import type { Course, FieldController, Lesson } from '../types'

const OTHER_ID = 'other'

type JournalControl = Control<JournalValues>
type ProgressOption = { value: string; label: string }

const LessonSelect = memo(function LessonSelect({
  control,
  index,
  lessons,
}: {
  control: JournalControl
  index: number
  lessons: Lesson[]
}) {
  return (
    <Controller
      name={`lessons.${index}.id`}
      control={control}
      render={({ field, fieldState }) => {
        const current = lessons.find((l) => l.id === field.value)

        return (
          <Field data-invalid={fieldState.invalid} className="flex-1">
            <Select
              value={field.value ? String(field.value) : ''}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select lesson">
                  {field.value ? formatLessonLabel(current!) : <span>Select lesson</span>}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {lessons.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {formatLessonLabel(item)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
})

const LessonProgress = memo(function LessonProgress({
  control,
  index,
  options,
}: {
  control: JournalControl
  index: number
  options: ProgressOption[]
}) {
  const allOptions = [...options, { value: OTHER_ID, label: 'Other' }]

  return (
    <Controller
      name={`lessons.${index}.progress`}
      control={control}
      render={({ field, fieldState }) => {
        const value = field.value
        const toggle = (id: string) =>
          field.onChange(
            value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
          )

        return (
          <FieldSet>
            <FieldDescription>
              Select the progress types that apply to this lesson.
            </FieldDescription>
            <FieldGroup>
              {allOptions.map((option) => {
                const inputId = `lessons-${index}-${option.value}`
                return (
                  <Field key={option.value} orientation="horizontal">
                    <Checkbox
                      id={inputId}
                      name={inputId}
                      checked={value.includes(option.value)}
                      onCheckedChange={() => toggle(option.value)}
                    />
                    <FieldLabel htmlFor={inputId} className="font-normal">
                      {option.label}
                    </FieldLabel>
                  </Field>
                )
              })}
            </FieldGroup>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )
      }}
    />
  )
})

function ProgressOtherText({
  control,
  index,
}: {
  control: JournalControl
  index: number
}) {
  return (
    <Controller
      name={`lessons.${index}.progressOtherText`}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Please specify</FieldLabel>
          <Input
            id={field.name}
            placeholder="Type your answer..."
            {...field}
            value={field.value || ''}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

/** Isolated subscriber — only re-renders when `lessons` values change. */
function ProgressOtherGate({
  control,
  index,
}: {
  control: JournalControl
  index: number
}) {
  const lessons = useWatch({ control, name: 'lessons' })
  const hasOther = lessons[index]?.progress.includes(OTHER_ID) ?? false
  if (!hasOther) return null
  return <ProgressOtherText index={index} control={control} />
}

interface LessonRowProps extends FieldController {
  index: number
  lessons: Lesson[]
  onRemove: () => void
}

function LessonRow({ control, index, lessons, onRemove }: LessonRowProps) {
  const isLessonSelected = useWatch({
    control,
    name: `lessons.${index}.id`,
  })

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <LessonSelect control={control} index={index} lessons={lessons} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove lesson"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {isLessonSelected !== 0 && (
        <LessonProgress
          control={control}
          index={index}
          options={PROGRESS_OPTIONS}
        />
      )}

      <ProgressOtherGate index={index} control={control} />
    </div>
  )
}

type LessonFieldProps = {
  control: JournalControl
  lessonOptions: Course[]
}

export function LessonField({ control, lessonOptions }: LessonFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lessons',
  })
  const { errors } = useFormState({ control, name: 'lessons' })
  const courseId = useWatch({ control, name: 'courseId' })

  const lessons = useMemo(
    () =>
      lessonOptions.find((course) => String(course.id) === courseId)?.lessons ??
      [],
    [lessonOptions, courseId],
  )

  if (courseId === 'other') {
    return null
  }

  const canAdd = courseId && fields.length < lessons.length
  const arrayError = errors.lessons?.root?.message ?? errors.lessons?.message
  return (
    <FieldSet>
      {fields.map((row, index) => (
        <LessonRow
          key={row.id}
          control={control}
          index={index}
          lessons={lessons}
          onRemove={() => remove(index)}
        />
      ))}

      {arrayError && <FieldError errors={[{ message: arrayError }]} />}

      <Button
        type="button"
        variant="outline"
        disabled={!canAdd}
        onClick={() =>
          append({
            id: 0,
            progress: [],
            progressOtherText: '',
          })
        }
      >
        <Plus className="mr-2 size-4" />
        Add lesson
      </Button>
    </FieldSet>
  )
}
