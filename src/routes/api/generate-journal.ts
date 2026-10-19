import { createFileRoute } from '@tanstack/react-router'
import { handleGenerateJournal } from '@/features/journal/journal.server'

export const Route = createFileRoute('/api/generate-journal')({
  server: {
    handlers: {
      POST: ({ request }) => handleGenerateJournal(request),
    },
  },
})
