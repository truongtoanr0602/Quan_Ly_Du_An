import { describe, expect, it } from 'vitest'

describe('apiBaseUrl', () => {
  it('uses a stable local backend URL when no environment value is set', async () => {
    const { apiBaseUrl } = await import('./env')

    expect(apiBaseUrl).toBe('http://localhost:5296/api')
  })
})

