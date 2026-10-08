import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import AddToCartButton from './AddToCartButton'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: vi.fn() }
})
vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../contexts/CartContext', () => ({ useCart: vi.fn() }))

describe('AddToCartButton', () => {
  const add = vi.fn()
  const navigate = vi.fn()

  afterEach(cleanup)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, email: 'c@test.local', fullName: 'Customer', role: 'Customer' } } as ReturnType<typeof useAuth>)
    vi.mocked(useCart).mockReturnValue({ add } as unknown as ReturnType<typeof useCart>)
    add.mockResolvedValue(undefined)
  })

  it('adds the selected product and reports success', async () => {
    render(<AddToCartButton productID={42} stockQuantity={3} />)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }))
    await waitFor(() => expect(add).toHaveBeenCalledWith(42, 1))
    expect(await screen.findByRole('status')).toHaveTextContent('Đã thêm vào giỏ')
  })

  it('sends guests to login without changing the cart', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
    render(<AddToCartButton productID={42} stockQuantity={3} />)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }))
    expect(navigate).toHaveBeenCalledWith('/login')
    expect(add).not.toHaveBeenCalled()
  })

  it('shows server errors and prevents adding unavailable products', async () => {
    add.mockRejectedValueOnce(new Error('Vượt quá tồn kho'))
    const { rerender } = render(<AddToCartButton productID={42} stockQuantity={3} />)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Vượt quá tồn kho')
    rerender(<AddToCartButton productID={42} stockQuantity={0} />)
    expect(screen.getByRole('button', { name: 'Hết hàng' })).toBeDisabled()
  })
})
