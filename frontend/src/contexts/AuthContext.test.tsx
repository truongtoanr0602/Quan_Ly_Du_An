import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider, { useAuth } from './AuthContext'
import { saveSession } from '../services/authSession'
import { authService } from '../services/authService'

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

const user = {
  id: 1,
  email: 'admin@example.test',
  fullName: 'Admin',
  role: 'Admin' as const,
}

function AuthProbe() {
  const { user: currentUser, isAuthenticated, login, logout } = useAuth()

  return (
    <>
      <p>{currentUser?.fullName ?? 'Anonymous'}</p>
      <p>{isAuthenticated ? 'Authenticated' : 'Signed out'}</p>
      <button onClick={() => login({ email: user.email, password: 'secret' })}>Log in</button>
      <button onClick={logout}>Log out</button>
    </>
  )
}

describe('AuthProvider', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('restores a valid stored session', () => {
    saveSession({ token: 'token', user })

    render(<MemoryRouter><AuthProvider><AuthProbe /></AuthProvider></MemoryRouter>)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Authenticated')).toBeInTheDocument()
  })

  it('saves the session after login and clears it on logout', async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: 'new-token', user })
    render(<MemoryRouter><AuthProvider><AuthProbe /></AuthProvider></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await screen.findByText('Admin')
    expect(localStorage.getItem('token')).toBe('new-token')
    expect(screen.getByText('Admin')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByText('Signed out')).toBeInTheDocument()
  })
})
