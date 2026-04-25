import type { ParsedChapter } from '../-types'

type ChapterSelectionProps = {
  chapters: ParsedChapter[]
  selectedChapterIds: string[]
  onSelectAll: () => void
  onToggleChapter: (chapterId: string) => void
}

export function ChapterSelection({
  chapters,
  selectedChapterIds,
  onSelectAll,
  onToggleChapter,
}: ChapterSelectionProps) {
  if (!chapters.length) return null

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ad-text-secondary">
          Select chapters
        </h2>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs font-medium text-ad-text-muted transition-colors hover:text-ad-text-heading"
        >
          Select all
        </button>
      </div>

      <div className="space-y-0.5">
        {chapters.map((chapter) => {
          const isSelected = selectedChapterIds.includes(chapter.id)

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onToggleChapter(chapter.id)}
              className={[
                'flex min-h-11 w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors',
                isSelected ? 'bg-ad-surface-elevated' : 'hover:bg-ad-surface-elevated/60',
              ].join(' ')}
            >
              <span
                className={[
                  'h-3.5 w-3.5 shrink-0 rounded-[2px] border border-ad-border',
                  isSelected ? 'border-ad-accent bg-ad-accent' : 'bg-transparent',
                ].join(' ')}
                aria-hidden="true"
              />
              <span className="w-6 shrink-0 font-mono text-[11px] text-ad-text-muted">
                {chapter.number.toString().padStart(2, '0')}
              </span>
              <span className={['min-w-0 flex-1 text-[13px]', isSelected ? 'font-medium text-ad-text-heading' : 'text-ad-text-secondary'].join(' ')}>
                {chapter.title}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-ad-text-muted">p. {chapter.page}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
