import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { orderService } from '../services/orderService'
import OrderDetailPage from './OrderDetailPage'

vi.mock('../services/orderService', () => ({ orderService: { get: vi.fn(), getMockPayment: vi.fn() } }))
vi.mock('qrcode.react', () => ({ QRCodeSVG: ({ value }: { value: string }) => <output data-testid="payment-qr">{value}</output> }))

describe('OrderDetailPage', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })
  it('renders immutable shipping and product snapshots', async () => {
    vi.mocked(orderService.get).mockResolvedValue({
      orderID: 9, userID: 7, receiverName: 'Receiver', receiverPhone: '0900',
      shippingAddress: 'Old address', subTotal: 20, shippingFee: 0, totalAmount: 20,
      paymentMethod: 'COD', paymentStatus: 'PENDING', orderStatus: 'PENDING',
      createdAt: '2026-01-02', items: [{ productID: 2, productName: 'Snapshot', sku: 'SKU', quantity: 2, unitPrice: 10, totalPrice: 20 }],
    })
    render(<MemoryRouter initialEntries={['/orders/9']}><Routes><Route path="/orders/:id" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
    expect(await screen.findByText('Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Old address')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /huy/i })).not.toBeInTheDocument()
  })

  it('shows a safe error for a missing order', async () => {
    vi.mocked(orderService.get).mockRejectedValue(new Error('Resource was not found.'))
    render(<MemoryRouter initialEntries={['/orders/99']}><Routes><Route path="/orders/:id" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
    expect(await screen.findByRole('alert')).toHaveTextContent('Resource was not found.')
  })

  it('announces a newly placed COD order without claiming it was paid', async () => {
    vi.mocked(orderService.get).mockResolvedValue({
      orderID: 9, userID: 7, receiverName: 'Receiver', receiverPhone: '0900',
      shippingAddress: 'Old address', subTotal: 20, shippingFee: 0, totalAmount: 20,
      paymentMethod: 'COD', paymentStatus: 'PENDING', orderStatus: 'PENDING',
      createdAt: '2026-01-02', items: [],
    })
    render(<MemoryRouter initialEntries={[{ pathname: '/orders/9', state: { justPlaced: true } }]}><Routes>
      <Route path="/orders/:id" element={<OrderDetailPage />} />
    </Routes></MemoryRouter>)

    expect(await screen.findByRole('status')).toHaveTextContent('Đặt hàng thành công')
    expect(screen.getByRole('status')).toHaveTextContent('thanh toán khi nhận hàng')
    expect(screen.getByRole('status')).not.toHaveTextContent('PAID')
  })

  it('shows a scannable mock bank URL with the saved invoice amount and content', async () => {
    vi.mocked(orderService.get).mockResolvedValue({
      orderID: 9, userID: 7, receiverName: 'Receiver', receiverPhone: '0900',
      shippingAddress: 'Old address', subTotal: 25, shippingFee: 0, totalAmount: 25,
      paymentMethod: 'QR', paymentStatus: 'PENDING', orderStatus: 'PENDING',
      createdAt: '2026-01-02', items: [],
    })
    vi.mocked(orderService.getMockPayment).mockResolvedValue({
      orderID: 9, amount: 25, currency: 'VND', transferContent: 'ELECTROTECH DH9',
      bankName: 'ElectroTech Demo Bank', accountNumber: '0000 0000 0000',
      accountName: 'ELECTROTECH DEMO', paymentStatus: 'PENDING',
    })

    render(<MemoryRouter initialEntries={[{ pathname: '/orders/9', state: { justPlaced: true } }]}><Routes><Route path="/orders/:id" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
    const qrValue = await screen.findByTestId('payment-qr')
    const confirmation = screen.getByRole('heading', { name: 'Đặt hàng thành công' }).parentElement
    expect(confirmation).toHaveAttribute('role', 'status')
    expect(confirmation).toHaveTextContent('Quét mã QR')
    const url = new URL(qrValue.textContent ?? '')
    expect(url.pathname).toBe('/mock-bank/orders/9')
    expect(url.searchParams.get('amount')).toBe('25.00')
    expect(url.searchParams.get('content')).toBe('ELECTROTECH DH9')
    expect(screen.getByText(/Số tiền theo hóa đơn:/)).toHaveTextContent(/25\s*₫/)
  })
})
