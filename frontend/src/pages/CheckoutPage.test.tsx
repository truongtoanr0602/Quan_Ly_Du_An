import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'
import CheckoutPage from './CheckoutPage'

const refresh = vi.fn()
const useCart = vi.fn()
vi.mock('../contexts/CartContext', () => ({ useCart: () => useCart() }))
vi.mock('../services/addressService', () => ({ addressService: { list: vi.fn(), create: vi.fn() } }))
vi.mock('../services/orderService', () => ({ orderService: { checkout: vi.fn() } }))

const address = { addressID: 5, receiverName: 'Customer', receiverPhone: '0900', fullAddress: '1 Test Street', isDefault: true }
const cart = { items: [{ productID: 3, productName: 'Laptop', sku: 'L3', unitPrice: 100, quantity: 2, stockQuantity: 5, lineTotal: 200 }], totalItems: 2, totalAmount: 200 }

function renderPage() {
  function OrderDestination() {
    const location = useLocation()
    return <p>Order destination {location.state?.justPlaced ? 'Order created' : 'No confirmation'}</p>
  }
  render(<MemoryRouter initialEntries={['/checkout']}><Routes>
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/cart" element={<p>Cart destination</p>} />
    <Route path="/orders/:id" element={<OrderDestination />} />
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
    expect((await screen.findAllByRole('radio'))[0]).toBeChecked()
    expect(screen.getByText('Thanh toán khi nhận hàng (COD)')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Ghi chú'), { target: { value: 'Call first' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đặt hàng' }))
    await waitFor(() => expect(orderService.checkout).toHaveBeenCalledWith({ addressID: 5, paymentMethod: 'COD', note: 'Call first' }))
    expect(refresh).toHaveBeenCalled()
    expect(await screen.findByText('Order destination Order created')).toBeInTheDocument()
  })

  it('navigates to the created order even when cart refresh fails', async () => {
    refresh.mockRejectedValue(new Error('Refresh failed'))
    renderPage()
    await screen.findAllByRole('radio')

    fireEvent.click(screen.getByRole('button', { name: 'Đặt hàng' }))

    expect(await screen.findByText('Order destination Order created')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('retains checkout and displays API errors', async () => {
    vi.mocked(orderService.checkout).mockRejectedValue(new Error('Het hang'))
    renderPage()
    await screen.findAllByRole('radio')
    fireEvent.click(screen.getByRole('button', { name: 'Đặt hàng' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Het hang')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('redirects an empty cart and links to address management', async () => {
    useCart.mockReturnValue({ cart: { items: [], totalItems: 0, totalAmount: 0 }, isLoading: false, refresh })
    renderPage()
    expect(await screen.findByText('Cart destination')).toBeInTheDocument()
  })

  it('explains that the QR is generated after the server creates the order', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('radio', { name: 'QR mô phỏng' }))

    expect(screen.getByText('Thanh toán mô phỏng – không chuyển tiền thật')).toBeInTheDocument()
    expect(screen.getByText(/Mã QR sẽ được tạo sau khi đơn hàng được lưu/)).toBeInTheDocument()
    expect(screen.queryByAltText('Mã QR thanh toán mô phỏng')).not.toBeInTheDocument()
  })

  it('submits QR as the selected payment method', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('radio', { name: 'QR mô phỏng' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tạo đơn và lấy mã QR' }))

    await waitFor(() => expect(orderService.checkout).toHaveBeenCalledWith({
      addressID: 5,
      paymentMethod: 'QR',
      note: undefined,
    }))
  })

  it('creates a shipping address and submits the order from checkout', async () => {
    vi.mocked(addressService.list).mockResolvedValue([])
    vi.mocked(addressService.create).mockResolvedValue(address)
    renderPage()

    fireEvent.change(await screen.findByLabelText('Nguoi nhan'), { target: { value: 'Customer' } })
    fireEvent.change(screen.getByLabelText('So dien thoai'), { target: { value: '0900' } })
    fireEvent.change(screen.getByLabelText('Dia chi day du'), { target: { value: '1 Test Street' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đặt hàng' }))

    await waitFor(() => expect(addressService.create).toHaveBeenCalled())
    await waitFor(() => expect(orderService.checkout).toHaveBeenCalledWith({ addressID: 5, paymentMethod: 'COD', note: undefined }))
    expect(await screen.findByText('Order destination Order created')).toBeInTheDocument()
  })
})
