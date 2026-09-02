import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CartPage from './CartPage'

const useCart = vi.fn()
vi.mock('../contexts/CartContext', () => ({ useCart: () => useCart() }))

describe('CartPage', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('shows an empty cart state', () => {
    useCart.mockReturnValue({
      cart: { items: [], totalItems: 0, totalAmount: 0 },
      isLoading: false, error: null,
      update: vi.fn(), remove: vi.fn(), clear: vi.fn(),
    })
    render(<MemoryRouter><CartPage /></MemoryRouter>)
    expect(screen.getByText('Gio hang dang trong.')).toBeInTheDocument()
  })

  it('shows server items, totals and checkout action', () => {
    useCart.mockReturnValue({
      cart: {
        items: [{ productID: 3, productName: 'Laptop', sku: 'LAP-3', unitPrice: 100, quantity: 2, stockQuantity: 5, lineTotal: 200 }],
        totalItems: 2, totalAmount: 200,
      },
      isLoading: false, error: null,
      update: vi.fn(), remove: vi.fn(), clear: vi.fn(),
    })
    render(<MemoryRouter><CartPage /></MemoryRouter>)
    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.getByText('2 san pham')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Thanh toan' })).toHaveAttribute('href', '/checkout')
  })
})
