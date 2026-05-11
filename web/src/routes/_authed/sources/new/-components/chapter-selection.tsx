import { useState } from 'react'
import { useBulkTagEditor } from '../-hooks/use-bulk-tag-editor'
import { useChapterTagDrafts } from '../-hooks/use-chapter-tag-drafts'
import type { ChapterTagMap } from '../-hooks/use-chapter-tags'
import type { ParsedChapter } from '../-types'
import { ChapterTagEditor, ChapterTagSummary } from './chapter-row-tags'
import { TagPill } from './tag-pill'

type ChapterSelectionProps = {
  chapters: ParsedChapter[]
  chapterTagMap: ChapterTagMap
  selection: ChapterSelectionControls
}

export type ChapterSelectionControls = {
  selectedIds: string[]
  select: (chapterId: string) => void
  selectAll: () => void
  toggle: (chapterId: string) => void
}

export function ChapterSelection({
  chapters,
  chapterTagMap,
  selection,
}: ChapterSelectionProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    null,
  )
  const bulkTagEditor = useBulkTagEditor()
  const chapterTagDrafts = useChapterTagDrafts()

  if (!chapters.length) return null

  function addChapterTagAndClearDraft(chapterId: string, value: string) {
    selection.select(chapterId)
    chapterTagMap.addChapterTag(chapterId, value)
    chapterTagDrafts.clearDraft(chapterId)
  }

  function appendBulkTags() {
    chapterTagMap.appendTagsToChapters(
      selection.selectedIds,
      bulkTagEditor.tags,
    )
    bulkTagEditor.clear()
  }

  function toggleChapter(chapterId: string, isSelected: boolean) {
    if (isSelected && expandedChapterId === chapterId) {
      setExpandedChapterId(null)
    }

    selection.toggle(chapterId)
  }

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ad-text-secondary">
          Review selections
        </h2>
        <button
          type="button"
          onClick={selection.selectAll}
          className="text-xs font-medium text-ad-text-muted transition-colors hover:text-ad-text-heading"
        >
          Select all
        </button>
      </div>

      <div className="border border-ad-border bg-ad-surface-elevated p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-ad-text-secondary">
              Append tags to {selection.selectedIds.length} selected chapters.
            </p>
            <p className="text-xs text-ad-text-muted">
              Existing chapter tags stay intact.
            </p>
          </div>
          <button
            type="button"
            onClick={appendBulkTags}
            disabled={
              !bulkTagEditor.tags.length || !selection.selectedIds.length
            }
            className="shrink-0 bg-ad-accent px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-ad-text-heading transition-opacity disabled:opacity-40"
          >
            Tag selected
          </button>
        </div>
        <div className="mt-3 space-y-2">
          <input
            value={bulkTagEditor.draftTag}
            onChange={(event) => bulkTagEditor.setDraftTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault()
                bulkTagEditor.addTag(bulkTagEditor.draftTag)
              }
            }}
            onBlur={() => bulkTagEditor.addTag(bulkTagEditor.draftTag)}
            placeholder="Search or create tag..."
            className="w-full border border-ad-border bg-ad-background px-3 py-2 font-mono text-xs text-ad-text-heading outline-none placeholder:text-ad-text-muted"
          />
          {bulkTagEditor.tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {bulkTagEditor.tags.map((tag) => (
                <TagPill
                  key={tag}
                  onRemove={() => bulkTagEditor.removeTag(tag)}
                  removeLabel={`Remove ${tag}`}
                >
                  {tag}
                </TagPill>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-0.5">
        {chapters.map((chapter) => {
          const isSelected = selection.selectedIds.includes(chapter.id)
          const tags = chapterTagMap.getTags(chapter.id)
          const isExpanded = chapter.id === expandedChapterId

          return (
            <div
              key={chapter.id}
              className={[
                'rounded-sm transition-colors',
                isSelected
                  ? 'bg-ad-surface-elevated'
                  : 'hover:bg-ad-surface-elevated/60',
              ].join(' ')}
            >
              <div className="flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left">
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id, isSelected)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={[
                      'h-3.5 w-3.5 shrink-0 rounded-[2px] border border-ad-border',
                      isSelected
                        ? 'border-ad-accent bg-ad-accent'
                        : 'bg-transparent',
                    ].join(' ')}
                    aria-hidden="true"
                  />
                  <span className="w-6 shrink-0 font-mono text-[11px] text-ad-text-muted">
                    {chapter.number.toString().padStart(2, '0')}
                  </span>
                  <span
                    className={[
                      'min-w-0 flex-1 truncate text-[13px]',
                      isSelected
                        ? 'font-medium text-ad-text-heading'
                        : 'text-ad-text-secondary',
                    ].join(' ')}
                  >
                    {chapter.title}
                  </span>
                </button>

                <ChapterTagSummary
                  chapterTitle={chapter.title}
                  tags={tags}
                  onOpenEditor={() => setExpandedChapterId(chapter.id)}
                />

                <span className="w-14 shrink-0 text-right font-mono text-[11px] text-ad-text-muted">
                  p. {chapter.page}
                </span>
              </div>

              {isExpanded ? (
                <ChapterTagEditor
                  draftTag={chapterTagDrafts.getDraft(chapter.id)}
                  tags={tags}
                  onAddTag={(value) =>
                    addChapterTagAndClearDraft(chapter.id, value)
                  }
                  onDraftTagChange={(value) =>
                    chapterTagDrafts.setDraft(chapter.id, value)
                  }
                  onRemoveTag={(tag) =>
                    chapterTagMap.removeChapterTag(chapter.id, tag)
                  }
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
