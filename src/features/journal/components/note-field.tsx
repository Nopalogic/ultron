import { Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

import type { FieldController } from '../types'

export function NoteField({ control }: FieldController) {
  return (
    <Controller
      name="note"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Teacher Note</FieldLabel>
          <Textarea id={field.name} placeholder="Type here if you need..." className='min-h-40' {...field} />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
