import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { orderService } from '../services/orderService'
import OrderDetailPage from './OrderDetailPage'

vi.mock('../services/orderService', () => ({ orderService: { get: vi.fn() } }))

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
})
