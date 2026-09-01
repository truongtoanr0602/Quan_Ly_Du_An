import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'
import CheckoutPage from './CheckoutPage'

const refresh = vi.fn()
const useCart = vi.fn()
vi.mock('../contexts/CartContext', () => ({ useCart: () => useCart() }))
vi.mock('../services/addressService', () => ({ addressService: { list: vi.fn() } }))
vi.mock('../services/orderService', () => ({ orderService: { checkout: vi.fn() } }))

const address = { addressID: 5, receiverName: 'Customer', receiverPhone: '0900', fullAddress: '1 Test Street', isDefault: true }
const cart = { items: [{ productID: 3, productName: 'Laptop', sku: 'L3', unitPrice: 100, quantity: 2, stockQuantity: 5, lineTotal: 200 }], totalItems: 2, totalAmount: 200 }

function renderPage() {
  render(<MemoryRouter initialEntries={['/checkout']}><Routes>
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/cart" element={<p>Cart destination</p>} />
    <Route path="/orders/:id" element={<p>Order destination</p>} />
  </Routes></MemoryRouter>)
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCart.mockReturnValue({ cart, isLoading: false, refresh })
    vi.mocked(addressService.list).mockResolvedValue([address])
    vi.mocked(orderService.checkout).mockResolvedValue({ orderID: 99 } as never)
    refresh.mockResolvedValue(undefined)
  })
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('selects default address and submits COD once', async () => {
    renderPage()
    expect(await screen.findByRole('radio')).toBeChecked()
    expect(screen.getByText('Thanh toan khi nhan hang (COD)')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Ghi chu'), { target: { value: 'Call first' } })
    fireEvent.click(screen.getByRole('button', { name: 'Dat hang' }))
    await waitFor(() => expect(orderService.checkout).toHaveBeenCalledWith({ addressID: 5, paymentMethod: 'COD', note: 'Call first' }))
    expect(refresh).toHaveBeenCalled()
    expect(await screen.findByText('Order destination')).toBeInTheDocument()
  })

  it('navigates to the created order even when cart refresh fails', async () => {
    refresh.mockRejectedValue(new Error('Refresh failed'))
    renderPage()
    await screen.findByRole('radio')

    fireEvent.click(screen.getByRole('button', { name: 'Dat hang' }))

    expect(await screen.findByText('Order destination')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('retains checkout and displays API errors', async () => {
    vi.mocked(orderService.checkout).mockRejectedValue(new Error('Het hang'))
    renderPage()
    await screen.findByRole('radio')
    fireEvent.click(screen.getByRole('button', { name: 'Dat hang' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Het hang')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('redirects an empty cart and links to address management', async () => {
    useCart.mockReturnValue({ cart: { items: [], totalItems: 0, totalAmount: 0 }, isLoading: false, refresh })
    renderPage()
    expect(await screen.findByText('Cart destination')).toBeInTheDocument()
  })
})
