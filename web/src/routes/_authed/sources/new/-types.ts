export type IntakeMode = 'file' | 'url' | 'text'

export type ParsedChapter = {
  id: string
  number: number
  title: string
  page: number
}

export type ParsedDocument = {
  file: File
  author: string | null
  pageCount: number
  chapters: ParsedChapter[]
}

export type TagTone = 'accent' | 'ember' | 'muted'

export type ConnectionPreviewItem = {
  id: string
  title: string
  matchingTags: string[]
}
