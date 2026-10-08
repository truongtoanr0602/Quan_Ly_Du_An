import type { UserInfo } from './authService'

export type StoredSession = { token: string; user: UserInfo }

const tokenStorageKey = 'token'
const userStorageKey = 'user'
const sessionChangedEvent = 'ecommerce:auth-session-changed'

const isUserInfo = (value: unknown): value is UserInfo => {
  if (typeof value !== 'object' || value === null) return false

  const user = value as Record<string, unknown>
  return typeof user.id === 'number'
    && typeof user.email === 'string'
    && typeof user.fullName === 'string'
    && (user.role === 'Admin' || user.role === 'Customer')
}

const notifySessionChange = (): void => {
  window.dispatchEvent(new Event(sessionChangedEvent))
}

export const saveSession = (session: StoredSession): void => {
  localStorage.setItem(tokenStorageKey, session.token)
  localStorage.setItem(userStorageKey, JSON.stringify(session.user))
  notifySessionChange()
}

export const clearSession = (): void => {
  localStorage.removeItem(tokenStorageKey)
  localStorage.removeItem(userStorageKey)
  notifySessionChange()
}

export const readSession = (): StoredSession | null => {
  const token = localStorage.getItem(tokenStorageKey)
  const rawUser = localStorage.getItem(userStorageKey)
  if (!token || !rawUser) {
    if (token || rawUser) clearSession()
    return null
  }

  try {
    const user: unknown = JSON.parse(rawUser)
    if (!isUserInfo(user)) {
      clearSession()
      return null
    }

    return { token, user }
  } catch {
    clearSession()
    return null
  }
}

export const subscribeToSessionChanges = (listener: () => void): (() => void) => {
  window.addEventListener(sessionChangedEvent, listener)
  return () => window.removeEventListener(sessionChangedEvent, listener)
}
