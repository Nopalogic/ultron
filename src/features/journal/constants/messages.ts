export const GENERATE_SUCCESS = 'Journal draft generated'
export const PREVIEW_CLEARED = 'Generated draft cleared'
export const INVALID_FORM = 'Please complete the highlighted fields'

export type GenerationFailureCode =
  | 'provider_unavailable'
  | 'rate_limited'
  | 'context_overflow'
  | 'auth_error'
  | 'generation_failed'

const FRIENDLY_BY_CODE: Record<GenerationFailureCode, string> = {
  provider_unavailable:
    'The AI service is busy right now. Please try again in a few moments.',
  rate_limited:
    'Too many requests right now. Please wait a moment and try again.',
  context_overflow:
    'This entry is too long to process. Try shortening the notes and try again.',
  auth_error:
    'Journal generation is unavailable right now. Please contact support.',
  generation_failed: "Couldn't generate the journal. Please try again.",
}

const FALLBACK =
  "Couldn't reach the server. Check your connection and try again."

const CODE_BY_MESSAGE: Record<string, GenerationFailureCode> = {
  'Gemini API key is not configured': 'auth_error',
  'Invalid journal payload': 'generation_failed',
  'Invalid JSON body': 'generation_failed',
  'The generation response had no stream': 'generation_failed',
  'Failed to generate journal': 'generation_failed',
  'Generation produced no content': 'generation_failed',
}

function isFailureCode(value: string): value is GenerationFailureCode {
  return value in FRIENDLY_BY_CODE
}

export function toFriendlyGenerationError({
  message,
  code,
}: {
  message?: string
  code?: string
} = {}): string {
  if (code && isFailureCode(code)) return FRIENDLY_BY_CODE[code]

  if (message && CODE_BY_MESSAGE[message])
    return FRIENDLY_BY_CODE[CODE_BY_MESSAGE[message]]

  const haystack = (message ?? '').toLowerCase()
  if (/context|token limit|too long/.test(haystack)) {
    return FRIENDLY_BY_CODE.context_overflow
  }
  if (/api key|permission|unauthoriz|forbidden/.test(haystack)) {
    return FRIENDLY_BY_CODE.auth_error
  }
  if (
    /429|rate.?limit|resource_exhausted|quota|too many requests/.test(haystack)
  ) {
    return FRIENDLY_BY_CODE.rate_limited
  }
  if (/503|overload|unavailable|500|502|504/.test(haystack)) {
    return FRIENDLY_BY_CODE.provider_unavailable
  }
  return FALLBACK
}
