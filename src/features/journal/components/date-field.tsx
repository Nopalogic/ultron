import { Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { FieldController } from '../types'

export function DateField({ control }: FieldController) {
  return (
    <Controller
      name="date"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Date</FieldLabel>
          <Input id={field.name} type="date" {...field} />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
