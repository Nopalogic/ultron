import { inArray } from 'drizzle-orm'
import { chat } from '@tanstack/ai'
import { geminiText } from '@tanstack/ai-gemini'

import { db } from '@/db/index'
import { lessons } from '@/db/schema'

import { promptBuilder } from './utils/prompt-builder'
import type { JournalValues } from './validation'

export const GEMINI_JOURNAL_MODEL = 'gemini-3.6-flash'

export class JournalGenerationError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'JournalGenerationError'
    this.code = code
  }
}

type GenerationFailureCode =
  | 'provider_unavailable'
  | 'rate_limited'
  | 'context_overflow'
  | 'auth_error'
  | 'generation_failed'

function classifyGenerationError(
  error: unknown,
  code?: string,
): { status: number; code: GenerationFailureCode } {
  const message = error instanceof Error ? error.message : String(error ?? '')
  const haystack = `${code ?? ''} ${message}`.toLowerCase()

  if (
    code === 'context_overflow' ||
    /context.{0,20}(overflow|length|window)|token limit|too long/.test(haystack)
  ) {
    return { status: 422, code: 'context_overflow' }
  }
  if (/api key|permission|unauthoriz|forbidden|401|403/.test(haystack)) {
    return { status: 502, code: 'auth_error' }
  }
  if (
    /429|rate.?limit|resource_exhausted|quota|too many requests/.test(haystack)
  ) {
    return { status: 429, code: 'rate_limited' }
  }
  if (/503|overload|unavailable|500|502|504/.test(haystack)) {
    return { status: 503, code: 'provider_unavailable' }
  }
  return { status: 502, code: 'generation_failed' }
}

export const buildJournalPrompt = async (payload: JournalValues) => {
  const isOtherCourse = !payload.courseId || payload.courseId === 'other'

  if (isOtherCourse) {
    return promptBuilder({ data: payload, lessons: [] })
  }

  const lessonIds = payload.lessons.map((lesson) => Number(lesson.id))

  const course = await db.query.courses.findFirst({
    where: (courses, { eq }) => eq(courses.id, Number(payload.courseId)),
    columns: { name: true },
  })

  const learnedLessons = lessonIds.length
    ? await db
        .select({
          id: lessons.id,
          name: lessons.name,
          objectives: lessons.objectives,
        })
        .from(lessons)
        .where(inArray(lessons.id, lessonIds))
    : []

  return promptBuilder({
    data: payload,
    course: course?.name,
    lessons: learnedLessons,
  })
}

export async function* streamJournal(
  payload: JournalValues,
): AsyncGenerator<string> {
  const prompt = await buildJournalPrompt(payload)

  const stream = chat({
    adapter: geminiText(GEMINI_JOURNAL_MODEL),
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  for await (const chunk of stream) {
    if (chunk.type === 'RUN_ERROR') {
      throw new JournalGenerationError(chunk.message, chunk.code)
    }
    if (
      (chunk.type === 'TEXT_MESSAGE_CONTENT' ||
        chunk.type === 'TEXT_MESSAGE_CHUNK') &&
      typeof chunk.delta === 'string'
    ) {
      yield chunk.delta
    }
  }
}

export async function handleGenerateJournal(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = (await import('./validation')).journalSchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid journal payload', issues: parsed.error.issues },
      { status: 422 },
    )
  }

  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    return Response.json(
      { error: 'Gemini API key is not configured' },
      { status: 500 },
    )
  }

  const encoder = new TextEncoder()
  const iterator = streamJournal(parsed.data)

  let firstDelta: string
  try {
    const first = await iterator.next()
    if (first.done) {
      return Response.json(
        { error: 'Generation produced no content', code: 'generation_failed' },
        { status: 502 },
      )
    }
    firstDelta = first.value
  } catch (error) {
    console.error('Failed to generate journal', error)
    const { status, code } = classifyGenerationError(
      error,
      error instanceof JournalGenerationError ? error.code : undefined,
    )
    return Response.json(
      { error: 'Failed to generate journal', code },
      { status },
    )
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(firstDelta))
        for await (const delta of iterator) {
          controller.enqueue(encoder.encode(delta))
        }
        controller.close()
      } catch (error) {
        console.error('Failed to generate journal', error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
