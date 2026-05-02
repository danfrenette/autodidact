import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { createSource } from '../-create-source'

import type { ParsedDocument } from '../-types'

type CreateSourceState = {
  errorMessage: string | null
  isCreating: boolean
}

const initialState: CreateSourceState = {
  errorMessage: null,
  isCreating: false,
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').trim() || fileName
}

export function useCreateSource() {
  const createSourceFn = useServerFn(createSource)
  const [state, setState] = useState<CreateSourceState>(initialState)

  async function createFromDocument(document: ParsedDocument | null, selectedChapterIds: string[]) {
    if (!document) return

    setState({ errorMessage: null, isCreating: true })

    try {
      await createSourceFn({
        data: {
          title: titleFromFileName(document.file.name),
          kind: 'pdf',
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
        },
      })
    } catch (error) {
      setState({
        errorMessage: error instanceof Error ? error.message : 'Source could not be created.',
        isCreating: false,
      })
      return
    }

    setState({ errorMessage: null, isCreating: false })
  }

  return {
    ...state,
    createFromDocument,
  }
}
