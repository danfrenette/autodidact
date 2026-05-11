import { getTagTone } from '../-utils/tag-tone'
import { TagPill } from './tag-pill'

type TagEditorProps = {
  draftTag: string
  tags: string[]
  onDraftTagChange: (value: string) => void
  onAddTag: (value: string) => void
  onRemoveTag: (tag: string) => void
}

const toneClasses = {
  accent: 'bg-[#3d2120] text-ad-text-heading',
  ember: 'bg-[#2e2224] text-ad-text-heading',
  muted: 'bg-[#1e1e24] text-ad-text-heading',
} as const

export function TagEditor({
  draftTag,
  tags,
  onDraftTagChange,
  onAddTag,
  onRemoveTag,
}: TagEditorProps) {
  return (
    <section className="space-y-3 border-t border-ad-border pt-6">
      <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ad-text-secondary">
        Tags
      </h2>

      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-sm border border-ad-border bg-ad-surface-elevated px-3 py-2.5">
        {tags.map((tag) => (
          <TagPill
            key={tag}
            className={[
              'min-h-7 rounded-sm text-xs font-medium normal-case',
              toneClasses[getTagTone(tag)],
            ].join(' ')}
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
          className="min-w-32 flex-1 border-0 bg-transparent p-0 text-[13px] text-ad-text-heading outline-none placeholder:text-ad-text-muted"
        />
      </div>
    </section>
  )
}
