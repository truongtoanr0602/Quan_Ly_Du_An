import { describe, expect, it } from 'vitest'

describe('apiBaseUrl', () => {
  it('uses the same-origin API proxy when no environment value is set', async () => {
    const { apiBaseUrl } = await import('./env')

    expect(apiBaseUrl).toBe('/api')
  })
})

