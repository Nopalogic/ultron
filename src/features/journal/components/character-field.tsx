import { Controller, useWatch } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { FieldController } from '../types'
import { CHARACTER_OPTIONS } from '../constants/option-catalog'

function CharacterOtherInput({ control }: FieldController) {
  const character = useWatch({ control, name: 'character' })
  if (!character.includes('other')) return null

  return (
    <Controller
      control={control}
      name="characterOtherText"
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor="characterOtherText">
            Please specify
          </FieldLabel>
          <Input
            id="characterOtherText"
            placeholder="Type your answer..."
            {...field}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function CharacterField({ control }: FieldController) {
  return (
    <>
      <Controller
        name="character"
        control={control}
        render={({ field, fieldState }) => {
          const toggleOption = (optionId: string) => {
            const current = field.value
            const checked = current.includes(optionId)
            const next = checked
              ? current.filter((v) => v !== optionId)
              : [...current, optionId]
            field.onChange(next)
          }

          return (
            <FieldSet>
              <FieldLegend variant="label">Characters</FieldLegend>
              <FieldDescription>
                Select the character traits observed during this session.
              </FieldDescription>
              <FieldGroup>
                {CHARACTER_OPTIONS.map((option) => {
                  const checked = field.value.includes(option.value) || false

                  return (
                    <Field key={option.value} orientation="horizontal">
                      <Checkbox
                        id={`character-${option.value}`}
                        name={`character-${option.value}`}
                        checked={checked}
                        onCheckedChange={() => toggleOption(option.value)}
                      />
                      <FieldLabel
                        htmlFor={`character-${option.value}`}
                        className="font-normal"
                      >
                        {option.label}
                      </FieldLabel>
                    </Field>
                  )
                })}
                <Field orientation="horizontal">
                  <Checkbox
                    id="character-other"
                    name="character-other"
                    checked={field.value.includes('other') || false}
                    onCheckedChange={() => toggleOption('other')}
                  />
                  <FieldLabel htmlFor="character-other" className="font-normal">
                    Other
                  </FieldLabel>
                </Field>
              </FieldGroup>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )
        }}
      />
      <CharacterOtherInput control={control} />
    </>
  )
}
