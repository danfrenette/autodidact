import type { Tag } from '#/features/sources/source.types'
import { TagPill } from './tag-pill'

type ChapterTagSummaryProps = {
  chapterTitle: string
  tags: Tag[]
  onOpenEditor: () => void
}

type ChapterTagEditorProps = {
  draftTag: string
  onAddTag: (value: string) => void
  onDraftTagChange: (value: string) => void
  onRemoveTag: (tag: Tag) => void
  tags: Tag[]
}

export function ChapterTagSummary({
  chapterTitle,
  tags,
  onOpenEditor,
}: ChapterTagSummaryProps) {
  return (
    <div className="flex w-52 shrink-0 items-center gap-1.5">
      {tags[0] ? (
        <TagPill className="max-w-28 truncate">{tags[0]}</TagPill>
      ) : (
        <span className="border border-dashed border-ad-border px-2 py-1 font-mono text-xs text-ad-text-muted">
          No tags
        </span>
      )}
      {tags.length > 1 ? (
        <span className="border border-ad-chip-strong bg-ad-chip-accent px-2 py-1 font-mono text-xs text-ad-accent">
          +{tags.length - 1}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onOpenEditor}
        className="border border-ad-chip-strong px-2 py-1 font-mono text-xs text-ad-accent"
        aria-label={`Edit tags for ${chapterTitle}`}
      >
        +
      </button>
    </div>
  )
}

export function ChapterTagEditor({
  draftTag,
  onAddTag,
  onDraftTagChange,
  onRemoveTag,
  tags,
}: ChapterTagEditorProps) {
  return (
    <div className="mb-3 ml-16 max-w-2xl space-y-4 border border-ad-border bg-ad-base px-3 py-4">
      <div className="max-w-xl space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
          Tags for this chapter
        </h3>
        <p className="text-sm leading-5 text-ad-text-secondary">
          Tags guide note generation and source connections for this chapter.
          Use concise topic tags when this selection differs from the source as
          a whole.
        </p>
      </div>
      <input
        value={draftTag}
        onChange={(event) => onDraftTagChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            onAddTag(draftTag)
          }
        }}
        onBlur={() => onAddTag(draftTag)}
        placeholder="Enter creates. × removes immediately."
        className="w-full max-w-sm border border-ad-border bg-ad-surface-elevated px-3 py-2 font-mono text-xs text-ad-text-heading outline-none placeholder:text-ad-text-muted"
      />
      <div className="flex flex-wrap gap-1.5">
        {tags.length ? (
          tags.map((tag) => (
            <TagPill
              key={tag}
              onRemove={() => onRemoveTag(tag)}
              removeLabel={`Remove ${tag}`}
            >
              {tag}
            </TagPill>
          ))
        ) : (
          <span className="font-mono text-xs text-ad-text-muted">No tags</span>
        )}
      </div>
    </div>
  )
}
