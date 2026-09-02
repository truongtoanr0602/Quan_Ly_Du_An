import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from './AuthContext'
import { CartProvider, useCart } from './CartContext'
import { saveSession } from '../services/authSession'
import { cartService } from '../services/cartService'

vi.mock('../services/cartService', () => ({
  cartService: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}))

const emptyCart = { items: [], totalItems: 0, totalAmount: 0 }
const filledCart = {
  items: [{ productID: 3, productName: 'Laptop', sku: 'LAP-3', unitPrice: 100, quantity: 2, stockQuantity: 5, lineTotal: 200 }],
  totalItems: 2,
  totalAmount: 200,
}

function Consumer() {
  const { cart, isLoading, error, add } = useCart()
  if (isLoading) return <p>Loading cart</p>
  return (
    <>
      <p>{cart.totalItems} items</p>
      {error && <p role="alert">{error}</p>}
      <button onClick={() => void add(3, 2)}>Add</button>
    </>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
    saveSession({ token: 'token', user: { id: 7, email: 'customer@test.local', fullName: 'Customer', role: 'Customer' } })
    vi.mocked(cartService.get).mockResolvedValue(emptyCart)
    vi.mocked(cartService.add).mockResolvedValue(filledCart)
  })
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('loads the authenticated server cart and never uses the legacy storage key', async () => {
    render(<AuthProvider><CartProvider><Consumer /></CartProvider></AuthProvider>)
    expect(await screen.findByText('0 items')).toBeInTheDocument()
    expect(cartService.get).toHaveBeenCalledOnce()
    expect(localStorage.getItem('ecommerce_cart')).toBeNull()
  })

  it('replaces state with the server response after add', async () => {
    render(<AuthProvider><CartProvider><Consumer /></CartProvider></AuthProvider>)
    await screen.findByText('0 items')
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(screen.getByText('2 items')).toBeInTheDocument())
    expect(cartService.add).toHaveBeenCalledWith(3, 2)
  })
})
