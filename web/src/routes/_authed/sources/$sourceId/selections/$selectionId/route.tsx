import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { Question, Quote } from '#/features/sources/analysis.schemas'
import { useRetrySource } from '#/features/sources/hooks/use-retry-source'
import { useSelectionAnalysis } from '#/features/sources/hooks/use-selection-analysis'
import type { SourceSelection } from '#/features/sources/source.types'
import { selectionStatus } from '#/features/sources/source-status'
import { TagPill } from '../../../new/-components/tag-pill'
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
  const retrySource = useRetrySource(sourceId)

  const {
    data: analysisData,
    isLoading,
    error,
  } = useSelectionAnalysis(selectionId)

  const analysis = analysisData?.data
  const source = analysis?.source
  const selection = analysis?.selection
  const concepts = analysis?.concepts ?? []
  const quotes = analysis?.quotes ?? []
  const questions = analysis?.questions ?? []

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-ad-text-secondary">
        Loading chapter analysis...
      </div>
    )
  }

  if (error || !source || !selection) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-ad-text-secondary">
        <p>Failed to load chapter</p>
        <Link
          to="/sources"
          className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-sm font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          Back to Sources
        </Link>
      </div>
    )
  }

  const status = selectionStatus(selection)
  return (
    <div className="flex flex-col gap-8 py-8 px-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-widest">
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
            className="max-w-60 truncate text-ad-text-muted hover:text-ad-text-secondary"
            title={source.title}
          >
            {source.title}
          </Link>
          <span className="text-ad-text-muted">/</span>
          <span className="text-ad-text-secondary">Ch. {selection.label}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="truncate font-sans text-3xl font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
              {selection.title}
            </h1>
            {source.author && (
              <p className="truncate font-sans text-sm font-medium text-ad-text-muted">
                {source.title} — {source.author}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span className={`size-1.5 rounded-full ${status.dotClassName}`} />
            <span
              className={`font-sans text-xs font-medium uppercase tracking-widest ${status.textClassName}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        {selection.tags.length ? (
          <div className="flex items-center">
            <div className="flex flex-wrap items-center gap-1.5">
              {selection.tags.map((tag, index) => (
                <TagPill
                  key={tag}
                  tone={index === 0 ? 'ember' : 'muted'}
                  className="font-sans text-xs normal-case tracking-wide"
                >
                  {tag}
                </TagPill>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {status.isFailed ? (
        <FailurePanel
          selection={selection}
          onRetry={() => retrySource.mutate()}
          isRetrying={retrySource.isPending}
        />
      ) : null}

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
        {status.isFailed
          ? null
          : activeTab === 'concepts' && (
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

        {status.isFailed
          ? null
          : activeTab === 'quotes' && <QuoteList quotes={quotes} />}

        {status.isFailed
          ? null
          : activeTab === 'questions' && <QuestionList questions={questions} />}
      </div>
    </div>
  )
}

function FailurePanel({
  selection,
  onRetry,
  isRetrying,
}: {
  selection: SourceSelection
  onRetry: () => void
  isRetrying: boolean
}) {
  const status = selectionStatus(selection)

  return (
    <div className="rounded-sm border border-ad-accent/40 bg-ad-accent/10 px-4 py-4">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-ad-accent">
        Processing failed
      </p>
      <p className="mt-2 text-sm leading-6 text-ad-text-secondary">
        {selection.errorMessage ??
          'The analysis pipeline failed for this chapter.'}
      </p>
      {status.action === 'provider_settings' ? (
        <Link
          to="/settings/providers"
          className="mt-4 inline-flex min-h-9 items-center justify-center rounded-sm bg-ad-accent px-4 text-xs font-medium uppercase tracking-widest text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          Switch providers
        </Link>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-4 inline-flex min-h-9 items-center justify-center rounded-sm bg-ad-accent px-4 text-xs font-medium uppercase tracking-widest text-ad-text-heading transition-colors hover:bg-ad-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? 'Retrying...' : 'Retry processing'}
        </button>
      )}
    </div>
  )
}

function QuoteList({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) {
    return (
      <div className="py-12 text-center text-ad-text-muted">
        No quotes found for this chapter.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {quotes.map((quote, index) => (
        <div
          key={quote.id}
          className={`flex flex-col gap-3 py-6 ${index === quotes.length - 1 ? '' : 'border-b border-ad-border'}`}
        >
          <blockquote className="font-serif text-xl leading-relaxed text-ad-text-heading">
            “{quote.text}”
          </blockquote>
          {quote.note && (
            <p className="font-sans text-sm leading-relaxed text-ad-text-secondary">
              {quote.note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function QuestionList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    return (
      <div className="py-12 text-center text-ad-text-muted">
        No questions found for this chapter.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className={`flex flex-col gap-4 py-6 ${index === questions.length - 1 ? '' : 'border-b border-ad-border'}`}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-sm border border-ad-border bg-ad-surface-elevated px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
              Tier {question.tier}
            </span>
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-ad-text-muted">
              {question.tierName}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-ad-text-heading">
              {question.text}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-ad-text-secondary">
              {question.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
