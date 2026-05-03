import { availableConnections } from '../-constants'

export function useConnectionPreview(tags: string[]) {
  return availableConnections.filter((connection) =>
    connection.matchingTags.some((tag) => tags.includes(tag)),
  )
}
