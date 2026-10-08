import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import AuthProvider from '../contexts/AuthContext'
import { saveSession } from '../services/authSession'
import RequireCustomer from './RequireCustomer'

function RoutesUnderTest() {
  return (
    <Routes>
      <Route element={<RequireCustomer />}>
        <Route path="/profile" element={<p>Customer profile</p>} />
      </Route>
      <Route path="/login" element={<p>Login</p>} />
      <Route path="/" element={<p>Home</p>} />
    </Routes>
  )
}

describe('RequireCustomer', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('redirects anonymous visitors to login', () => {
    render(<MemoryRouter initialEntries={['/profile']}><AuthProvider><RoutesUnderTest /></AuthProvider></MemoryRouter>)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renders the customer outlet', () => {
    saveSession({ token: 'token', user: { id: 1, email: 'customer@test.local', fullName: 'Customer', role: 'Customer' } })
    render(<MemoryRouter initialEntries={['/profile']}><AuthProvider><RoutesUnderTest /></AuthProvider></MemoryRouter>)
    expect(screen.getByText('Customer profile')).toBeInTheDocument()
  })

  it('redirects admins home', () => {
    saveSession({ token: 'token', user: { id: 2, email: 'admin@test.local', fullName: 'Admin', role: 'Admin' } })
    render(<MemoryRouter initialEntries={['/profile']}><AuthProvider><RoutesUnderTest /></AuthProvider></MemoryRouter>)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
