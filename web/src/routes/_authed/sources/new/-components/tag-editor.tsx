import { getTagTone } from '../-utils/tag-tone'
import { TagPill } from './tag-pill'

type TagEditorProps = {
  draftTag: string
  tags: string[]
  onDraftTagChange: (value: string) => void
  onAddTag: (value: string) => void
  onRemoveTag: (tag: string) => void
}

export function TagEditor({
  draftTag,
  tags,
  onDraftTagChange,
  onAddTag,
  onRemoveTag,
}: TagEditorProps) {
  return (
    <section className="space-y-3 border-t border-ad-border pt-6">
      <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-ad-text-secondary">
        Tags
      </h2>

      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-sm border border-ad-border bg-ad-surface-elevated px-3 py-2.5">
        {tags.map((tag) => (
          <TagPill
            key={tag}
            tone={getTagTone(tag)}
            className="min-h-7 rounded-sm text-xs font-medium normal-case"
            onRemove={() => onRemoveTag(tag)}
            removeLabel={`Remove ${tag}`}
          >
            {tag}
          </TagPill>
        ))}

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
          placeholder="Add tag..."
          className="min-w-32 flex-1 border-0 bg-transparent p-0 text-sm text-ad-text-heading outline-none placeholder:text-ad-text-muted"
        />
      </div>
    </section>
  )
}
