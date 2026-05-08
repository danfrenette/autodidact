import type {
  Concept,
  ConceptClassification,
} from '#/features/sources/concept.types'

interface ConceptCardProps {
  concept: Concept
  isLast?: boolean
}

const pillStyles: Record<ConceptClassification, string> = {
  core: 'bg-ad-accent/20 text-ad-accent border-ad-accent/30',
  supporting: 'bg-ad-surface-elevated text-ad-text-secondary border-ad-border',
  advanced: 'bg-ad-surface text-ad-text-muted border-ad-border',
}

const pillLabels: Record<ConceptClassification, string> = {
  core: 'CORE',
  supporting: 'SUPPORTING',
  advanced: 'ADVANCED',
}

export function ConceptCard({ concept, isLast = false }: ConceptCardProps) {
  return (
    <div
      className={`flex flex-col gap-4 py-6 ${isLast ? '' : 'border-b border-ad-border'}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`rounded-sm border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.08em] ${pillStyles[concept.classification]}`}
        >
          {pillLabels[concept.classification]}
        </span>
        <h3 className="font-sans text-[18px] font-bold uppercase tracking-tight text-ad-text-heading">
          {concept.name}
        </h3>
      </div>

      {concept.definition && (
        <div className="flex flex-col gap-2">
          <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-ad-text-muted">
            Definition
          </h4>
          <p className="font-sans text-sm leading-relaxed text-ad-text-secondary">
            {concept.definition}
          </p>
        </div>
      )}

      {concept.whyItMatters && (
        <div className="flex flex-col gap-2">
          <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-ad-text-muted">
            Why It Matters
          </h4>
          <p className="font-sans text-sm leading-relaxed text-ad-text-secondary">
            {concept.whyItMatters}
          </p>
        </div>
      )}
    </div>
  )
}
