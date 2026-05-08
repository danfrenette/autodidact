export function formatSourceTitle(title: string, maxLength = 72) {
  if (title.length <= maxLength) return title

  const keep = maxLength - 1
  const headLength = Math.ceil(keep * 0.62)
  const tailLength = keep - headLength

  return `${title.slice(0, headLength)}…${title.slice(-tailLength)}`
}
