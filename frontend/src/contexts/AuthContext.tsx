import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import type { AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '../services/authService'
import { clearSession, readSession, saveSession, subscribeToSessionChanges } from '../services/authSession'

export interface AuthContextValue {
  user: UserInfo | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<AuthResponse>
  register: (request: RegisterRequest) => Promise<AuthResponse>
  logout: () => void
  updateUser: (user: UserInfo) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => readSession()?.user ?? null)

  useEffect(() => subscribeToSessionChanges(() => {
    setUser(readSession()?.user ?? null)
  }), [])

  const login = async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await authService.login(request)
    saveSession(response)
    setUser(response.user)
    return response
  }

  const register = async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await authService.register(request)
    saveSession(response)
    setUser(response.user)
    return response
  }

  const updateUser = (updatedUser: UserInfo): void => {
    const session = readSession()
    if (session) {
      saveSession({ ...session, user: updatedUser })
    }
    setUser(updatedUser)
  }

  const logout = (): void => {
    clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export default AuthProvider
