import type { Control } from 'react-hook-form'
import type { JournalValues } from './validation'

export type FieldController = {
  control: Control<JournalValues>
}

export type Lesson = {
  id: number
  number: number
  name: string
  objectives: string[]
}

export type Course = {
  id: number
  name: string
  lessons: Lesson[]
}
