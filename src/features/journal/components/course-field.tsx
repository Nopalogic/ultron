import { useMemo } from 'react'
import { Controller, useWatch } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { FieldController, Course } from '../types'

type Props = {
  courseOptions: Omit<Course, 'lessons'>[]
} & FieldController

export function CourseField({ control, courseOptions }: Props) {
  const courseId = useWatch({ control, name: 'courseId' })
  const isOther = courseId === 'other'

  const courseNameMap = useMemo(
    () => new Map(courseOptions.map((c) => [String(c.id), c.name])),
    [courseOptions],
  )

  return (
    <>
      <Controller
        name="courseId"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Course</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select course">
                  {field.value === 'other' ? (
                    <span>Other</span>
                  ) : field.value ? (
                    (courseNameMap.get(field.value) ?? 'Select course')
                  ) : (
                    <span>Select course</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {courseOptions.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {isOther && (
        <Controller
          name="courseOtherText"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="course_other_text">
                Purpose / Course name
              </FieldLabel>
              <Input
                id="courseOtherText"
                placeholder="e.g. Trials report, Competition preparation…"
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}
    </>
  )
}
