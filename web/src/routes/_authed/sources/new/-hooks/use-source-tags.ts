import { useState } from 'react'
import type { Tag } from '#/features/sources/source.types'

export function useSourceTags(initialTags: Tag[]) {
  const [tags, setTags] = useState(initialTags)
  const [draftTag, setDraftTag] = useState('')

  function addTag(rawValue: string) {
    const normalizedTag: Tag = normalizeTag(rawValue)

    if (!normalizedTag || tags.includes(normalizedTag)) return

    setTags((currentTags) => [...currentTags, normalizedTag])
    setDraftTag('')
  }

  function removeTag(tagToRemove: string) {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove))
  }

  return {
    tags,
    draftTag,
    setDraftTag,
    addTag,
    removeTag,
  }
}

export function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}
