import { useState } from 'react'
import type { Tag } from '#/features/sources/source.types'
import { normalizeTag } from './use-source-tags'

export function useBulkTagEditor() {
  const [draftTag, setDraftTag] = useState('')
  const [tags, setTags] = useState<Tag[]>([])

  function addTag(rawValue: string) {
    const tag: Tag = normalizeTag(rawValue)
    if (!tag || tags.includes(tag)) return

    setTags((currentTags) => [...currentTags, tag])
    setDraftTag('')
  }

  function removeTag(tagToRemove: Tag) {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove))
  }

  function clear() {
    setTags([])
    setDraftTag('')
  }

  return {
    addTag,
    clear,
    draftTag,
    removeTag,
    setDraftTag,
    tags,
  }
}
