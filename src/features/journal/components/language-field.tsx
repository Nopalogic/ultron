import { useMemo } from 'react'
import { Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { LANGUAGE_OPTIONS } from '../constants/option-catalog'
import type { FieldController } from '../types'

export function LanguageField({ control }: FieldController) {
  const languageMap = useMemo(
    () => new Map(LANGUAGE_OPTIONS.map((lang) => [lang.value, lang.label])),
    [LANGUAGE_OPTIONS],
  )

  return (
    <Controller
      name="language"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className='flex-1/4'>
          <FieldLabel htmlFor={field.name} hidden>
            Language
          </FieldLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select course">
                {languageMap.get(field.value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LANGUAGE_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  )
}
