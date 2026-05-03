import type { CreateSourceInput, SourceIntakeDocument } from './source.types'

export function buildCreateSourceInput(
  document: SourceIntakeDocument,
  selectedChapterIds: string[],
): CreateSourceInput {
  return {
    title: titleFromFileName(document.file.name),
    kind: 'pdf' as const,
    author: document.author,
    originalFilename: document.file.name,
    selections: document.chapters
      .filter((chapter) => selectedChapterIds.includes(chapter.id))
      .map((chapter) => ({
        kind: 'chapter' as const,
        title: chapter.title,
        label: String(chapter.number).padStart(2, '0'),
        position: { ordinal: chapter.number },
        locator: {
          type: 'page_range' as const,
          start: chapter.page,
          end: chapter.page,
        },
      })),
  }
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').trim() || fileName
}
