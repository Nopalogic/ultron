import { Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { FieldController } from '../types'
import { LanguageField } from './language-field'

export function NameField({ control }: FieldController) {
  return (
    <Controller
      name="name"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Student name</FieldLabel>
          <div className="flex items-end gap-4">
            <Input id={field.name} placeholder="john doe" {...field} />
            <LanguageField control={control} />
          </div>
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
