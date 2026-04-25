import { startTransition, useState } from 'react'

import { acceptedSourceFileTypes } from '../-constants'
import { parsePdfDocument } from '../-utils/pdf-outline'

import type { ParsedDocument } from '../-types'

type PdfIntakeState = {
  document: ParsedDocument | null
  errorMessage: string | null
  isReading: boolean
  selectedChapterIds: string[]
}

const initialState: PdfIntakeState = {
  document: null,
  errorMessage: null,
  isReading: false,
  selectedChapterIds: [],
}

export function usePdfIntake() {
  const [state, setState] = useState<PdfIntakeState>(initialState)

  async function loadFile(file: File) {
    if (!acceptedSourceFileTypes.includes(file.type)) {
      setState((currentState) => ({
        ...currentState,
        errorMessage: 'Only PDF files are supported right now.',
      }))
      return
    }

    setState((currentState) => ({
      ...currentState,
      isReading: true,
      errorMessage: null,
    }))

    try {
      const document = await parsePdfDocument(file)

      startTransition(() => {
        setState({
          document,
          errorMessage: null,
          isReading: false,
          selectedChapterIds: document.chapters.slice(0, Math.min(3, document.chapters.length)).map((chapter) => chapter.id),
        })
      })
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        isReading: false,
        errorMessage: error instanceof Error
          ? `We could not read that PDF. ${error.message}`
          : 'We could not read that PDF.',
      }))
    }
  }

  function removeDocument() {
    setState(initialState)
  }

  function toggleChapter(chapterId: string) {
    setState((currentState) => ({
      ...currentState,
      selectedChapterIds: currentState.selectedChapterIds.includes(chapterId)
        ? currentState.selectedChapterIds.filter((id) => id !== chapterId)
        : [...currentState.selectedChapterIds, chapterId],
    }))
  }

  function selectAllChapters() {
    setState((currentState) => ({
      ...currentState,
      selectedChapterIds: currentState.document?.chapters.map((chapter) => chapter.id) ?? [],
    }))
  }

  return {
    ...state,
    loadFile,
    removeDocument,
    toggleChapter,
    selectAllChapters,
  }
}
