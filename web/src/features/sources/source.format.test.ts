import { describe, expect, it } from 'vitest'
import { formatSourceTitle } from './source.format'

describe('formatSourceTitle', () => {
  it('returns the title unchanged when shorter than maxLength', () => {
    expect(formatSourceTitle('Hello', 10)).toBe('Hello')
  })

  it('returns the title unchanged when equal to maxLength', () => {
    expect(formatSourceTitle('Hello world', 11)).toBe('Hello world')
  })

  it('middle-truncates a title longer than maxLength', () => {
    const result = formatSourceTitle(
      'The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas',
      72,
    )

    expect(result).toHaveLength(72)
    expect(result).toMatch(/^.{45}….{26}$/)
  })

  it('uses the provided maxLength', () => {
    const long = 'abcdefghijklmnopqrstuvwxyz'
    const result = formatSourceTitle(long, 10)

    expect(result.length).toBe(10)
    expect(result).toMatch(/^.{6}….{3}$/)
  })

  it('preserves start and end of long strings', () => {
    const result = formatSourceTitle(
      'The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas',
      72,
    )

    expect(result.startsWith('The Pragmatic Programmer Your Jour')).toBe(true)
    expect(result.endsWith('Hurst Thomas')).toBe(true)
  })
})
