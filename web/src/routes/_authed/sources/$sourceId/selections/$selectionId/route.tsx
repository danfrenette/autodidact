import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useConcepts } from '#/features/sources/hooks/use-concepts'
import { useSource } from '#/features/sources/hooks/use-source'
import { ConceptCard } from './-components/concept-card'
import { TabButton } from './-components/tab-button'

export const Route = createFileRoute(
  '/_authed/sources/$sourceId/selections/$selectionId',
)({
  component: ChapterAnalysisPage,
})

type Tab = 'concepts' | 'quotes' | 'questions'

function ChapterAnalysisPage() {
  const { sourceId, selectionId } = Route.useParams()
  const [activeTab, setActiveTab] = useState<Tab>('concepts')

  const {
    data: sourceData,
    isLoading: sourceLoading,
    error: sourceError,
  } = useSource(sourceId)
  const { data: conceptsData, isLoading: conceptsLoading } =
    useConcepts(selectionId)

  const source = sourceData?.data
  const selection = source?.selections?.find((s) => s.id === selectionId)
  const concepts = conceptsData ?? []

  if (sourceLoading || conceptsLoading) {
    return (
      <div className="flex h-full items-center justify-center text-ad-text-secondary">
        Loading chapter analysis...
      </div>
    )
  }

  if (sourceError || !source || !selection) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-ad-text-secondary">
        <p>Failed to load chapter</p>
        <Link
          to="/sources"
          className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-[13px] font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          Back to Sources
        </Link>
      </div>
    )
  }

  const isComplete = selection.status === 'complete'

  return (
    <div className="flex flex-col gap-8 py-8 px-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em]">
          <Link
            to="/sources"
            className="text-ad-text-muted hover:text-ad-text-secondary"
          >
            Sources
          </Link>
          <span className="text-ad-text-muted">/</span>
          <Link
            to="/sources/$sourceId"
            params={{ sourceId }}
            className="text-ad-text-muted hover:text-ad-text-secondary"
          >
            {source.kind === 'pdf' ? 'Book' : source.kind}
          </Link>
          <span className="text-ad-text-muted">/</span>
          <span className="text-ad-text-secondary">Ch. {selection.label}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="truncate font-sans text-[32px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
              {selection.title}
            </h1>
            {source.author && (
              <p className="truncate font-sans text-sm font-medium text-ad-text-muted">
                {source.title} — {source.author}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span
              className={`size-1.5 rounded-full ${isComplete ? 'bg-ad-text-secondary' : 'bg-ad-accent'}`}
            />
            <span
              className={`font-sans text-[10px] font-medium uppercase tracking-[0.08em] ${isComplete ? 'text-ad-text-secondary' : 'text-ad-accent'}`}
            >
              {isComplete ? 'Complete' : 'Processing'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-ad-border pb-0">
        <TabButton
          label="Concepts"
          isActive={activeTab === 'concepts'}
          onClick={() => setActiveTab('concepts')}
        />
        <TabButton
          label="Quotes"
          isActive={activeTab === 'quotes'}
          onClick={() => setActiveTab('quotes')}
        />
        <TabButton
          label="Questions"
          isActive={activeTab === 'questions'}
          onClick={() => setActiveTab('questions')}
        />
      </div>

      <div className="flex flex-col gap-0">
        {activeTab === 'concepts' && (
          <div className="flex flex-col">
            {concepts.length === 0 ? (
              <div className="py-12 text-center text-ad-text-muted">
                No concepts found for this chapter.
              </div>
            ) : (
              concepts.map((concept, index) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  isLast={index === concepts.length - 1}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="py-12 text-center text-ad-text-muted">
            Quotes feature coming soon.
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="py-12 text-center text-ad-text-muted">
            Questions feature coming soon.
          </div>
        )}
      </div>
    </div>
  )
}
