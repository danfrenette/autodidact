import { useState } from 'react'
import type { Tag } from '#/features/sources/source.types'
import { normalizeTag } from './use-source-tags'

export function useChapterTagMap() {
  const [tagsByChapterId, setTagsByChapterId] = useState<Record<string, Tag[]>>(
    {},
  )

  function addChapterTag(chapterId: string, rawValue: string) {
    const tag: Tag = normalizeTag(rawValue)
    if (!tag) return

    setTagsByChapterId((currentTags) => {
      const tags = currentTags[chapterId] ?? []
      if (tags.includes(tag)) return currentTags

      return { ...currentTags, [chapterId]: [...tags, tag] }
    })
  }

  function removeChapterTag(chapterId: string, tagToRemove: Tag) {
    setTagsByChapterId((currentTags) => ({
      ...currentTags,
      [chapterId]: (currentTags[chapterId] ?? []).filter(
        (tag) => tag !== tagToRemove,
      ),
    }))
  }

  function clearChapterTags(chapterId: string) {
    setTagsByChapterId((currentTags) => {
      if (!currentTags[chapterId]?.length) return currentTags

      const nextTags = { ...currentTags }
      delete nextTags[chapterId]
      return nextTags
    })
  }

  function appendTagsToChapters(chapterIds: string[], tagsToAppend: Tag[]) {
    if (!tagsToAppend.length) return

    setTagsByChapterId((currentTags) => {
      const nextTags = { ...currentTags }

      chapterIds.forEach((chapterId) => {
        const tags = nextTags[chapterId] ?? []
        nextTags[chapterId] = [...new Set([...tags, ...tagsToAppend])]
      })

      return nextTags
    })
  }

  function getTags(chapterId: string) {
    return tagsByChapterId[chapterId] ?? []
  }

  return {
    tagsByChapterId,
    addChapterTag,
    appendTagsToChapters,
    clearChapterTags,
    getTags,
    removeChapterTag,
  }
}

export type ChapterTagMap = ReturnType<typeof useChapterTagMap>
