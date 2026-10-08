import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, readSession, saveSession } from './authSession'

const session = {
  token: 'test-token',
  user: { id: 1, email: 'customer@test.local', fullName: 'Customer', role: 'Customer' as const },
}

describe('authSession', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('keeps a non-remembered login in the browser session only', () => {
    saveSession(session, false)
    expect(sessionStorage.getItem('token')).toBe('test-token')
    expect(localStorage.getItem('token')).toBeNull()
    expect(readSession()).toEqual(session)
    clearSession()
    expect(sessionStorage.getItem('token')).toBeNull()
  })

  it('moves a remembered login to persistent storage', () => {
    saveSession(session, false)
    saveSession(session, true)
    expect(localStorage.getItem('token')).toBe('test-token')
    expect(sessionStorage.getItem('token')).toBeNull()
  })
})
