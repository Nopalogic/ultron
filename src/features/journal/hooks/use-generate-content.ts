import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { JournalValues } from '../validation'
import {
  GENERATE_SUCCESS,
  toFriendlyGenerationError,
} from '../constants/messages'

class GenerationRequestError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GenerationRequestError'
    this.code = code
  }
}

async function generateJournalContent(
  payload: JournalValues,
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/generate-journal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    let message = 'Failed to generate journal'
    let code: string | undefined
    try {
      const data = (await response.json()) as { error?: string; code?: string }
      if (data.error) message = data.error
      code = data.code
    } catch {
      // keep the default message when the body is not JSON
    }
    throw new GenerationRequestError(message, code)
  }

  if (!response.body) {
    throw new Error('The generation response had no stream')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      onDelta(decoder.decode(value, { stream: true }))
    }
  } finally {
    reader.releaseLock()
  }
}

type Options = {
  onChunk?: (text: string) => void
}

export function useGenerateContent({ onChunk }: Options = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const accumulatedRef = useRef('')
  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsGenerating(false)
  }, [])

  const generate = useCallback(async (payload: JournalValues) => {
    abortRef.current?.abort()

    const controller = new AbortController()
    abortRef.current = controller
    accumulatedRef.current = ''
    setIsGenerating(true)
    setError(null)

    try {
      await generateJournalContent(
        payload,
        (delta) => {
          accumulatedRef.current += delta
          onChunkRef.current?.(accumulatedRef.current)
        },
        controller.signal,
      )
      if (!accumulatedRef.current.trim()) {
        const message = toFriendlyGenerationError({ code: 'generation_failed' })
        setError(message)
        toast.error(message)
        return
      }
      toast.success(GENERATE_SUCCESS)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message = toFriendlyGenerationError({
        message: err instanceof Error ? err.message : undefined,
        code: err instanceof GenerationRequestError ? err.code : undefined,
      })
      setError(message)
      toast.error(message)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setIsGenerating(false)
      }
    }
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  return { generate, stop, isGenerating, error }
}
