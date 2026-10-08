import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../contexts/AuthContext'
import LoginPage from './LoginPage'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

describe('LoginPage', () => {
  afterEach(cleanup)

  it('stores a login only for the browser session when remember is unchecked', async () => {
    const login = vi.fn().mockResolvedValue({
      token: 'test-token',
      user: { id: 1, email: 'customer@test.local', fullName: 'Customer', role: 'Customer' },
    })
    vi.mocked(useAuth).mockReturnValue({ login } as unknown as ReturnType<typeof useAuth>)

    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@test.local' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' }))
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    await waitFor(() => expect(login).toHaveBeenCalledWith(
      { email: 'customer@test.local', password: 'password123' }, false,
    ))
  })

  it('returns a customer to the scanned mock payment after login', async () => {
    const login = vi.fn().mockResolvedValue({
      token: 'test-token',
      user: { id: 1, email: 'customer@test.local', fullName: 'Customer', role: 'Customer' },
    })
    vi.mocked(useAuth).mockReturnValue({ login } as unknown as ReturnType<typeof useAuth>)

    render(<MemoryRouter initialEntries={[{
      pathname: '/login',
      state: { from: { pathname: '/mock-bank/orders/9', search: '?amount=25.00', hash: '' } },
    }]}><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mock-bank/orders/:id" element={<p>Mock bank destination</p>} />
    </Routes></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@test.local' } })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText('Mock bank destination')).toBeInTheDocument()
  })
})
