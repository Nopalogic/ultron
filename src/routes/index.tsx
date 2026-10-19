import { coursesQueryOptions, JournalCreatePage } from '@/features/journal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    return context.queryClient.query(coursesQueryOptions())
  },
  component: JournalCreatePage,
})
