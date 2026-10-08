import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { orderService } from '../services/orderService'
import MockBankPage from './MockBankPage'

vi.mock('../services/orderService', () => ({ orderService: { getMockPayment: vi.fn(), confirmMockPayment: vi.fn() } }))

describe('MockBankPage', () => {
  const payment = {
    orderID: 9, amount: 25, currency: 'VND' as const, transferContent: 'ELECTROTECH DH9',
    bankName: 'ElectroTech Demo Bank', accountNumber: '0000 0000 0000',
    accountName: 'ELECTROTECH DEMO', paymentStatus: 'PENDING',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(orderService.getMockPayment).mockResolvedValue(payment)
    vi.mocked(orderService.confirmMockPayment).mockResolvedValue({ ...payment, paymentStatus: 'PAID' })
  })
  afterEach(cleanup)

  it('confirms the server order and shows PAID only after the API responds', async () => {
    render(<MemoryRouter initialEntries={['/mock-bank/orders/9?amount=1.00&content=FAKE']}><Routes>
      <Route path="/mock-bank/orders/:id" element={<MockBankPage />} />
    </Routes></MemoryRouter>)

    expect(await screen.findByText('ELECTROTECH DH9')).toBeInTheDocument()
    expect(screen.getByText(/25\s*₫/)).toBeInTheDocument()
    expect(screen.queryByText('FAKE')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận thanh toán thử' }))
    await waitFor(() => expect(orderService.confirmMockPayment).toHaveBeenCalledWith(9))
    expect(await screen.findByRole('status')).toHaveTextContent('Thanh toán thử thành công')
    expect(screen.getByRole('status')).toHaveTextContent('Đơn hàng #9')
    expect(screen.getByRole('status')).toHaveTextContent('PAID')
    expect(screen.queryByRole('button', { name: 'Xác nhận thanh toán thử' })).not.toBeInTheDocument()
  })

  it('keeps the order pending when confirmation fails', async () => {
    vi.mocked(orderService.confirmMockPayment).mockRejectedValue(new Error('The request conflicts with existing state.'))
    render(<MemoryRouter initialEntries={['/mock-bank/orders/9']}><Routes>
      <Route path="/mock-bank/orders/:id" element={<MockBankPage />} />
    </Routes></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận thanh toán thử' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('The request conflicts with existing state.')
    expect(screen.getByText('Đang chờ thanh toán (PENDING)')).toBeInTheDocument()
  })
})
