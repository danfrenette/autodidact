import { useRef } from 'react'

import type { ParsedDocument } from '../-types'

type FileIntakePanelProps = {
  document: ParsedDocument | null
  errorMessage: string | null
  isReading: boolean
  onFileSelect: (file: File) => Promise<void>
  onRemove: () => void
}

export function FileIntakePanel({
  document,
  errorMessage,
  isReading,
  onFileSelect,
  onRemove,
}: FileIntakePanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    await onFileSelect(file)
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          void handleFiles(event.dataTransfer.files)
        }}
        className="flex min-h-30 cursor-pointer flex-col justify-center rounded-sm border border-dashed border-ad-border bg-ad-surface-elevated px-5 text-left transition-colors hover:border-ad-border-hover"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.target.value = ''
          }}
        />

        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ad-text-secondary">
          File
        </p>
        <p className="mt-3 text-sm text-ad-text-heading">
          {isReading ? 'Reading PDF outline...' : 'Drop a PDF here or click to choose a file.'}
        </p>
        <p className="mt-2 text-[13px] leading-5 text-ad-text-muted">
          Browser-side parsing extracts the outline locally so chapter selection happens before anything is processed.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-sm border border-ad-accent/30 bg-ad-accent-subtle px-4 py-3 text-sm text-ad-accent">
          {errorMessage}
        </div>
      ) : null}

      {document ? (
        <div className="flex min-h-12 items-center justify-between rounded-sm border border-ad-border bg-ad-surface-elevated px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-ad-accent" />
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ad-accent">
                PDF loaded
              </div>
            </div>
            <div className="truncate text-sm font-medium text-ad-text-heading">{document.file.name}</div>
          </div>

          <div className="ml-4 flex shrink-0 items-center gap-4">
            <div className="font-mono text-xs text-ad-text-muted">
              {document.pageCount} pages · {document.chapters.length} chapters
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-medium text-ad-text-muted transition-colors hover:text-ad-text-heading"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
