import type { CreateSourceInput, SourceIntakeDocument } from './source.types'

export function buildCreateSourceInput(
  document: SourceIntakeDocument,
  selectedChapterIds: string[],
): CreateSourceInput {
  return {
    title: titleFromFileName(document.file.name),
    kind: 'pdf',
    originalFilename: document.file.name,
    selections: document.chapters
      .filter((chapter) => selectedChapterIds.includes(chapter.id))
      .map((chapter) => ({
        kind: 'chapter',
        title: chapter.title,
        label: String(chapter.number).padStart(2, '0'),
        position: { ordinal: chapter.number },
        locator: {
          type: 'page_range',
          start: chapter.page,
          end: chapter.page,
        },
      })),
  }
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').trim() || fileName
}
