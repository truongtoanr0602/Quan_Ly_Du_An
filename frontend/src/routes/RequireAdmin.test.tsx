import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import AuthProvider from '../contexts/AuthContext'
import { saveSession } from '../services/authSession'
import RequireAdmin from './RequireAdmin'

const customer = {
  id: 1,
  email: 'customer@example.test',
  fullName: 'Customer',
  role: 'Customer' as const,
}

function GuardRoutes() {
  return (
    <Routes>
      <Route element={<RequireAdmin />}>
        <Route path="/admin/products" element={<p>Admin products</p>} />
      </Route>
      <Route path="/login" element={<p>Login</p>} />
      <Route path="/" element={<p>Home</p>} />
    </Routes>
  )
}

describe('RequireAdmin', () => {
  beforeEach(() => localStorage.clear())

  it('redirects an anonymous visitor from an Admin route to login', () => {
    render(<MemoryRouter initialEntries={['/admin/products']}><AuthProvider><GuardRoutes /></AuthProvider></MemoryRouter>)

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('redirects a Customer from an Admin route home', () => {
    saveSession({ token: 'token', user: customer })

    render(<MemoryRouter initialEntries={['/admin/products']}><AuthProvider><GuardRoutes /></AuthProvider></MemoryRouter>)

    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
