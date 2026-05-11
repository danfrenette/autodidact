import { useState } from 'react'

export function useChapterTagDrafts() {
  const [draftsByChapterId, setDraftsByChapterId] = useState<
    Record<string, string>
  >({})

  function setDraft(chapterId: string, value: string) {
    setDraftsByChapterId((currentDrafts) => ({
      ...currentDrafts,
      [chapterId]: value,
    }))
  }

  function clearDraft(chapterId: string) {
    setDraft(chapterId, '')
  }

  function getDraft(chapterId: string) {
    return draftsByChapterId[chapterId] ?? ''
  }

  return {
    clearDraft,
    draftsByChapterId,
    getDraft,
    setDraft,
  }
}
