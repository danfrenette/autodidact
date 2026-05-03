import type { TagTone } from '../-types'

const tones: TagTone[] = ['accent', 'ember', 'muted']

export function getTagTone(tag: string): TagTone {
  const hash = Array.from(tag).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )

  return tones[hash % tones.length]
}
