import { createFileRoute } from '@tanstack/react-router'
import { useCreateSource } from '#/features/sources/hooks/use-create-source'
import { buildCreateSourceInput } from '#/features/sources/source.mappers'
import { ActionBar } from './-components/action-bar'
import { ChapterSelection } from './-components/chapter-selection'
import { ConnectionPreview } from './-components/connection-preview'
import { FileIntakePanel } from './-components/file-intake-panel'
import { SourceModeTabs } from './-components/source-mode-tabs'
import { TagEditor } from './-components/tag-editor'
import { defaultModelLabel, defaultTags } from './-constants'
import { useConnectionPreview } from './-hooks/use-connection-preview'
import { usePdfIntake } from './-hooks/use-pdf-intake'
import { useSourceTags } from './-hooks/use-source-tags'

export const Route = createFileRoute('/_authed/sources/new')({
  component: AddSourceRoute,
})

function AddSourceRoute() {
  const {
    document,
    errorMessage,
    isReading,
    loadFile,
    removeDocument,
    selectAllChapters,
    selectedChapterIds,
    toggleChapter,
  } = usePdfIntake()
  const createSource = useCreateSource()
  const { addTag, draftTag, removeTag, setDraftTag, tags } =
    useSourceTags(defaultTags)
  const connections = useConnectionPreview(tags)
  const selectedChapterCount = selectedChapterIds.length
  const canProcess = Boolean(document && selectedChapterCount > 0)
  const createSourceErrorMessage =
    createSource.error instanceof Error ? createSource.error.message : null

  function createFromSelectedChapters() {
    if (!document) return

    createSource.mutate(buildCreateSourceInput(document, selectedChapterIds))
  }

  return (
    <div className="min-h-full px-12 py-8">
      <div className="max-w-[1104px] space-y-8">
        <header className="space-y-1.5">
          <h1 className="font-serif text-[32px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
            Add Source
          </h1>
          <p className="text-sm text-ad-text-muted">
            Import material from files, URLs, or paste raw text.
          </p>
        </header>

        <div className="space-y-4">
          <div className="space-y-3">
            <SourceModeTabs activeMode="file" />
            <FileIntakePanel
              document={document}
              errorMessage={errorMessage}
              isReading={isReading}
              onFileSelect={loadFile}
              onRemove={removeDocument}
            />
          </div>

          <ChapterSelection
            chapters={document?.chapters ?? []}
            selectedChapterIds={selectedChapterIds}
            onSelectAll={selectAllChapters}
            onToggleChapter={toggleChapter}
          />

          <div className="space-y-3">
            <TagEditor
              draftTag={draftTag}
              tags={tags}
              onDraftTagChange={setDraftTag}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
            <ConnectionPreview connections={connections} />
          </div>

          <ActionBar
            modelLabel={defaultModelLabel}
            processLabel={
              canProcess
                ? `Process ${selectedChapterCount} Chapters`
                : 'Process 0 Chapters'
            }
            canProcess={canProcess}
            errorMessage={createSourceErrorMessage}
            isProcessing={createSource.isPending}
            onProcess={createFromSelectedChapters}
          />
        </div>
      </div>
    </div>
  )
}
