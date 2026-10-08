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

export const saveSession = (session: StoredSession, remember = true): void => {
  localStorage.removeItem(tokenStorageKey)
  localStorage.removeItem(userStorageKey)
  sessionStorage.removeItem(tokenStorageKey)
  sessionStorage.removeItem(userStorageKey)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(tokenStorageKey, session.token)
  storage.setItem(userStorageKey, JSON.stringify(session.user))
  notifySessionChange()
}

export const isSessionRemembered = (): boolean => localStorage.getItem(tokenStorageKey) !== null

export const clearSession = (): void => {
  localStorage.removeItem(tokenStorageKey)
  localStorage.removeItem(userStorageKey)
  sessionStorage.removeItem(tokenStorageKey)
  sessionStorage.removeItem(userStorageKey)
  notifySessionChange()
}

export const readSession = (): StoredSession | null => {
  const storage = localStorage.getItem(tokenStorageKey) ? localStorage : sessionStorage
  const token = storage.getItem(tokenStorageKey)
  const rawUser = storage.getItem(userStorageKey)
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
