import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    expect(screen.getByText('Giỏ hàng đang trống.')).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Giỏ hàng (2 sản phẩm)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tiến hành thanh toán' })).toHaveAttribute('href', '/checkout')
  })

  it('updates quantity with the stepper within stock limits', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    useCart.mockReturnValue({
      cart: {
        items: [{ productID: 3, productName: 'Laptop', sku: 'LAP-3', unitPrice: 100, quantity: 2, stockQuantity: 3, lineTotal: 200 }],
        totalItems: 2, totalAmount: 200,
      },
      isLoading: false, error: null,
      update, remove: vi.fn(), clear: vi.fn(),
    })
    render(<MemoryRouter><CartPage /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Tăng số lượng Laptop' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith(3, 3))
    expect(screen.getByRole('link', { name: 'Tiến hành thanh toán' })).toHaveAttribute('href', '/checkout')
  })
})
