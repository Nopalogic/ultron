import { useLayoutEffect, useRef } from 'react'
import { CopyIcon, Loader2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-clipboard'
import { toast } from 'sonner'

type JournalPreviewProps = {
  report: string
  hasContent: boolean
  isGenerating: boolean
  error: string | null
}

export function JournalPreview({
  report,
  hasContent,
  isGenerating,
  error,
}: JournalPreviewProps) {
  const [_copiedText, copyToClipboard] = useCopyToClipboard()
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [report])

  const handleCopy = (text: string) => {
    copyToClipboard(text)
    toast.info('Journal copied')
  }

  return (
    <section aria-live="polite" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" />
          Generated preview
        </h2>
        {!isGenerating && hasContent && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(report)}
          >
            <CopyIcon className="size-3.5" />
            Copy
          </Button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="max-h-80 min-h-24 overflow-y-auto rounded-lg border border-input bg-muted/30 p-4 text-sm whitespace-pre-wrap"
      >
        {isGenerating && !hasContent ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Writing the journal…
          </span>
        ) : hasContent ? (
          report
        ) : null}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
