import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError } from './apiClient'

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('clears the auth session after a 401 Problem Details response', async () => {
    localStorage.setItem('token', 'old-token')
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'admin@example.test',
      fullName: 'Admin',
      role: 'Admin',
    }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ title: 'Invalid email or password.' }),
      { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
    )))

    await expect(apiClient('/auth/login')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password.',
    })
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('uses legacy API messages and preserves validation errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        message: 'Validation failed.',
        errors: { Email: ['Email is required.'] },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )))

    await expect(apiClient('/auth/register')).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        message: 'Validation failed.',
        validationErrors: { Email: ['Email is required.'] },
      } satisfies Partial<ApiError>),
    )
    expect(localStorage.getItem('token')).toBeNull()
  })
})
