import type { JournalValues } from '../validation'
import type { Lesson } from '../types'
import { formatCharacter, formatProgress } from '../constants/option-catalog'

const OTHER = 'other'
const OTHER_TAG = "[teacher's additional notes]"

const toBulletList = (items: string[]): string =>
  items.map((text) => `- ${text}`).join('\n')

const formatProgressList = (values: string[], otherText?: string): string => {
  const items = values.filter((value) => value !== OTHER).map(formatProgress)
  if (values.includes(OTHER) && otherText?.trim()) {
    items.push(`${otherText.trim()} [${OTHER_TAG}]`)
  }
  return toBulletList(items.length ? items : ['(no data)'])
}

const formatCharacterList = (values: string[], otherText?: string): string => {
  const items = values.filter((value) => value !== OTHER).map(formatCharacter)
  if (values.includes(OTHER) && otherText?.trim()) {
    items.push(`${otherText.trim()} [${OTHER_TAG}]`)
  }
  return items.join(', ')
}

export function promptBuilder({
  data,
  course,
  lessons,
}: {
  data: JournalValues
  course?: string
  lessons: Omit<Lesson, 'number'>[]
}) {
  if (course) {
    return buildWithLesson({ data, course, lessons })
  }
  return buildWithoutLesson({ data })
}

function buildWithLesson({
  data,
  course,
  lessons,
}: {
  data: JournalValues
  course: string
  lessons: Omit<Lesson, 'number'>[]
}) {
  const progressById = data.lessons.reduce<Record<number, string[]>>(
    (acc, { id, progress }) => {
      ;(acc[id] ??= []).push(...progress)
      return acc
    },
    {},
  )

  const otherTextById = data.lessons.reduce<Record<number, string>>(
    (acc, { id, progressOtherText }) => {
      if (progressOtherText) acc[id] = progressOtherText
      return acc
    },
    {},
  )

  const lessonList = lessons
    .map(({ id, name, objectives }) => {
      const progress = progressById[id] ?? []
      return [
        name,
        'Objectives',
        toBulletList(objectives),
        'Progress',
        formatProgressList(progress, otherTextById[id]),
      ].join('\n')
    })
    .join('\n\n')

  const characterList = formatCharacterList(
    data.character,
    data.characterOtherText,
  )

  return `
  ROLE
  You are a teacher who writes a short daily journal entry for students' parents (referred to as “parents”) summarizing their children's learning activities for the day.

  WRITING STYLE
  - Polite and casual, yet professional (not stiff or formal like an official letter).
  - Use the word “lesson” instead of “material.”
  - Write in Indonesian.

  HOW TO READ THE DATA
  Each item under “Progress” and “Character” below is tagged in square brackets, for example: “Consistent [positive].” These tags indicate the tone you should use when writing about that item; they are NOT text that should be copied into your journal:
  - [neutral] -> a description of a routine activity, without any particular emphasis on tone.
  - [positive] / [strongly positive] -> may be written in an appreciative tone.
  - [growth mindset] -> a positive attitude worth noting even if progress isn’t yet perfect (e.g., not giving up when facing difficulties).
  - [needs attention] -> MUST be written in a supportive and solution-oriented tone. Do not blame, label negatively, or cause parents undue worry—present it as an area to be explored further or addressed again.
  - [teacher’s additional notes] -> free-form text from the teacher; insert it naturally as is.

  STUDENT DATA
  Nama: ${data.name}
  Courses taken: ${course}
  Lessons taken:\n${lessonList}
  Character/behavior during class: ${characterList || '(no data)'}
  Teacher note: ${data.note}

  TASKS
  Write ONE journal paragraph (4–5 sentences) summarizing today’s lesson, the student’s progress, and their character, using a tone that matches the tags for each item. If there are any additional notes from the teacher, incorporate them naturally into the paragraph.

  After the paragraph, leave one blank line, then add a personal closing sentence (mention the student’s name).

  STRICT RULES
  - Use only the information provided in the data above. Do not add any assumptions or details not mentioned.
  - Never include the ‘[...]’ tag itself in the output—the tag is only a stylistic guide for you.
  - If the Teacher note is empty, simply skip the note section without mentioning that the note is empty.
  - The output should consist ONLY of the final journal entry (paragraph + blank line + closing sentence). Do not add titles, labels, quotation marks, or other explanations.
  - Do not use the word “material” — always replace it with “lesson.”
  - Use the term “parents” when referring to students’ parents.

  OUTPUT EXAMPLE
  Today, {“student's name”} enthusiastically participated in a lesson on addition and subtraction. Their progress shows a good understanding, although they still need more practice with word problems. During class, {“student's name”} actively asked questions and remained patient when faced with difficult problems.

  Keep up the great work, {“student name”}! You’re making good progress—just a little more to go to really solidify your skills.
  `
}

function buildWithoutLesson({ data }: { data: JournalValues }) {
  const characterList = formatCharacterList(
    data.character,
    data.characterOtherText,
  )

  const progressList = formatProgressList(
    data.lessons.flatMap((lesson) => lesson.progress),
    data.lessons.map((lesson) => lesson.progressOtherText).find(Boolean),
  )

  const course = data.courseOtherText?.trim() || 'kegiatan'

  return `
  ROLE
  You are a teacher writing a brief daily journal for students’ parents (referred to as “parents”) summarizing their children’s activities for the day.

  WRITING STYLE
  - Polite and casual, yet professional (not stiff or formal like an official letter).
  - Write in Indonesian.

  HOW TO INTERPRET THE DATA
  Each item under Progress and Character below is tagged in square brackets, for example: “Consistent [positive]”. These tags indicate the tone you should use when writing that item; they are NOT text that should be copied into the journal:
  - [neutral] -> a description of routine activities, without any particular emphasis on tone.
  - [positive] / [strongly positive] -> may be written in an appreciative tone.
  - [growth mindset] -> a positive attitude worth noting even if progress isn’t yet perfect (e.g., refusing to give up when facing difficulties).
  - [needs attention] -> MUST be written in a supportive and solution-oriented tone. Do not blame, label negatively, or cause parents undue worry—present it as an area to be explored further or addressed later.
  - [teacher’s additional notes] -> free-form text from the teacher; insert it naturally as-is.

  STUDENT DATA
  Name: ${data.name}
  Jenis kegiatan: ${course}
  Progress selama kegiatan: ${progressList}
  Karakter/sikap selama kegiatan: ${characterList || '(no data)'}
  Teacher note: ${data.note}

  TASKS
  Write ONE journal paragraph (4–5 sentences) summarizing today’s “${course}” activities, progress, and the student’s behavior, using a tone that matches the tags for each item. If there are any additional notes from the teacher, incorporate them naturally into the paragraph.

  After that paragraph, leave one blank line, then add a personal closing sentence (mention the student’s name).

  STRICT RULES
  - Use only the information provided in the data above. Do not add assumptions or details that are not mentioned.
  - Never include the ‘[...]’ tag itself in the output—the tag is only a tone guide for you.
  - If the Teacher note is empty, simply skip the note section without mentioning that it’s empty.
  - The output should consist ONLY of the final journal entry (paragraph + blank line + closing sentence). Do not add a title, label, quotation marks, or any other explanations.
  - Address the student’s parents as “parents” when referring to them.

  OUTPUT EXAMPLE
  Today, {“student name”} enthusiastically participated in the trial sessions. During the activity, they demonstrated strong skills and remained focused despite facing some challenges. The teacher noted that {“student name”} was very enthusiastic and brave in trying new things.

  Keep up the great work, {“student name”}! Preparations are going well.
  `
}
