import { useState } from 'react'

export function useSourceTags(initialTags: string[]) {
  const [tags, setTags] = useState(initialTags)
  const [draftTag, setDraftTag] = useState('')

  function addTag(rawValue: string) {
    const normalizedTag = normalizeTag(rawValue)

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

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}
