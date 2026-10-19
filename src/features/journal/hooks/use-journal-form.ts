import { useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { INVALID_FORM } from '../constants/messages'
import { journalSchema } from '../validation'
import type { JournalValues } from '../validation'
import { useGenerateContent } from './use-generate-content'

const formatDate = (d: Date) => d.toISOString().slice(0, 10)

export const useJournalForm = () => {
  const form = useForm<JournalValues>({
    resolver: zodResolver(journalSchema),
    mode: 'onTouched',
    defaultValues: {
      date: formatDate(new Date()),
      time: '',
      class: '',
      name: '',
      language: 'Indonesian',
      courseId: '',
      courseOtherText: '',
      lessons: [],
      character: [],
      characterOtherText: '',
      note: '',
      generated_report: '',
    },
  })

  const courseId = useWatch({ control: form.control, name: 'courseId' })

  useEffect(() => {
    form.resetField('lessons', { defaultValue: [] })
    form.resetField('courseOtherText', { defaultValue: '' })
  }, [courseId, form])

  const { generate, isGenerating, error } = useGenerateContent({
    onChunk: (text) =>
      form.setValue('generated_report', text, { shouldDirty: true }),
  })

  const onSubmit = async (payload: JournalValues) => {
    form.setValue('generated_report', '', { shouldDirty: true })
    await generate(payload)
  }

  const submit = form.handleSubmit(onSubmit, () => {
    toast.error(INVALID_FORM)
  })

  const clearForm = useCallback(() => {
    form.reset()
    toast.info('Form already clear')
  }, [form])

  return { form, submit, isGenerating, generateError: error, clearForm }
}
