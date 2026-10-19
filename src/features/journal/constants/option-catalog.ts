export const PROGRESS_OPTIONS = [
  { value: 'new-lesson', label: 'Mulai lesson baru' },
  { value: 'continuing-progress', label: 'Melanjutkan progress' },
  { value: 'project', label: 'Mengerjakan project' },
  { value: 'exam', label: 'Mengerjakan exam' },

  { value: 'understanding', label: 'Memahami lesson' },
  { value: 'improving', label: 'Menunjukkan Peningkatan' },
  { value: 'consistent', label: 'Konsisten' },
  { value: 'exceeds-expectations', label: 'Melampaui Target' },

  { value: 'needs-review', label: 'Butuh Pengulangan' },
  { value: 'not-completed', label: 'Tidak menyelesaikan lesson' },
  { value: 'struggling', label: 'Kesulitan Memahami' },
  { value: 'stagnant', label: 'Tidak Ada Perkembangan' },
]

export const CHARACTER_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'focused', label: 'Fokus' },
  { value: 'creative', label: 'Kreatif' },
  { value: 'collaborative', label: 'Kolaboratif' },
  { value: 'enthusiast', label: 'Antusias' },
  { value: 'independent', label: 'Mandiri' },

  { value: 'explore', label: 'Exploring' },
  { value: 'resilient', label: 'Pantang Menyerah' },

  { value: 'distracted', label: 'Mudah Terdistraksi' },
  { value: 'disruptive', label: 'Sering Mengganggu' },
  { value: 'stubborn', label: 'Keras Kepala' },
  { value: 'unmotivated', label: 'Kurang Motivasi' },
]

export type Tone =
  | 'neutral'
  | 'positive'
  | 'strongly positive'
  | 'growth mindset'
  | 'needs attention'
  | "teacher's additional notes"

const PROGRESS_TONES: Record<string, Tone> = {
  'new-lesson': 'neutral',
  'continuing-progress': 'neutral',
  project: 'neutral',
  exam: 'neutral',
  understanding: 'positive',
  improving: 'positive',
  consistent: 'positive',
  'exceeds-expectations': 'strongly positive',
  'needs-review': 'needs attention',
  'not-completed': 'needs attention',
  struggling: 'needs attention',
  stagnant: 'needs attention',
}

const CHARACTER_TONES: Record<string, Tone> = {
  active: 'positive',
  focused: 'positive',
  creative: 'positive',
  collaborative: 'positive',
  enthusiast: 'positive',
  independent: 'positive',
  explore: 'growth mindset',
  resilient: 'growth mindset',
  distracted: 'needs attention',
  disruptive: 'needs attention',
  stubborn: 'needs attention',
  unmotivated: 'needs attention',
}

const labelByValue = (
  options: { value: string; label: string }[],
  value: string,
) => options.find((option) => option.value === value)?.label ?? value

export const formatProgress = (value: string): string =>
  `${labelByValue(PROGRESS_OPTIONS, value)} [${PROGRESS_TONES[value] ?? 'neutral'}]`

export const formatCharacter = (value: string): string =>
  `${labelByValue(CHARACTER_OPTIONS, value)} [${
    CHARACTER_TONES[value] ?? 'neutral'
  }]`

export const formatLessonLabel = (lesson: {
  number: number
  name: string
}): string => `Lesson ${lesson.number} - ${lesson.name}`
