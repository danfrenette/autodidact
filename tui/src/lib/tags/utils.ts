
const CREATE_SENTINEL_PREFIX = "create:";

export function normalizeTag(name: string): string | null {
  const result = name.trim().toLowerCase();
  return result.length > 0 ? result : null;
}

export function createSentinel(query: string): string {
  return `${CREATE_SENTINEL_PREFIX}${query}`;
}

export function isCreateOption(option: string): boolean {
  return option.startsWith(CREATE_SENTINEL_PREFIX);
}

export function extractCreateName(option: string): string {
  return option.slice(CREATE_SENTINEL_PREFIX.length);
}

export function appendCreateOption(filtered: string[], query: string): string[] {
  const trimmed = query.trim();
  if (
    trimmed.length > 0 &&
    !filtered.some((o) => o.toLowerCase() === trimmed.toLowerCase())
  ) {
    return [...filtered, createSentinel(trimmed)];
  }
  return filtered;
}

export function formatTagPreview(tags: string[], maxVisible = 3): string {
  if (tags.length === 0) return "+ Add tags";
  if (tags.length <= maxVisible) return tags.join(", ");
  return `${tags.slice(0, maxVisible).join(", ")} (+${tags.length - maxVisible} more)`;
}
