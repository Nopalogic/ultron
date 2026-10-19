import { Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { FieldController } from '../types'

export function ClassField({ control }: FieldController) {
  return (
    <Controller
      name="class"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Class</FieldLabel>
          <Input id={field.name} placeholder="xx xx" {...field} />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
