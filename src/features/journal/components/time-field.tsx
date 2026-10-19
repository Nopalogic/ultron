import { Controller } from 'react-hook-form'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { FieldController } from '../types'

export function TimeField({ control }: FieldController) {
  return (
    <Controller
      name="time"
      control={control}
      render={({ field, fieldState }) => {
        const [start = '', finish = ''] = (field.value ?? '').split('-')

        const handleChange = (part: 'start' | 'finish', value: string) => {
          const nextStart = part === 'start' ? value : start
          const nextFinish = part === 'finish' ? value : finish

          if (!nextStart && !nextFinish) {
            field.onChange('')
          } else {
            field.onChange(`${nextStart}-${nextFinish}`)
          }
        }

        return (
          <FieldGroup>
            <div className="flex gap-3">
              <Field data-invalid={fieldState.invalid} className="w-1/2">
                <FieldLabel htmlFor={`${field.name}-start`}>
                  Start Time
                </FieldLabel>
                <Input
                  id={`${field.name}-start`}
                  type="time"
                  step={900}
                  value={start}
                  onChange={(e) => handleChange('start', e.target.value)}
                  onBlur={field.onBlur}
                />
              </Field>
              <Field data-invalid={fieldState.invalid} className="w-1/2">
                <FieldLabel htmlFor={`${field.name}-finish`}>
                  Finish Time
                </FieldLabel>
                <Input
                  id={`${field.name}-finish`}
                  type="time"
                  step={900}
                  value={finish}
                  onChange={(e) => handleChange('finish', e.target.value)}
                  onBlur={field.onBlur}
                />
              </Field>
            </div>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </FieldGroup>
        )
      }}
    />
  )
}
