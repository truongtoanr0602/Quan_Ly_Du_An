import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { orderService } from '../services/orderService'
import OrderHistoryPage from './OrderHistoryPage'

vi.mock('../services/orderService', () => ({ orderService: { list: vi.fn() } }))

describe('OrderHistoryPage', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })
  it('renders owned order summaries and detail links', async () => {
    vi.mocked(orderService.list).mockResolvedValue({
      items: [{ orderID: 9, totalAmount: 200, paymentMethod: 'COD', paymentStatus: 'PENDING', orderStatus: 'PENDING', createdAt: '2026-01-02', totalItems: 2 }],
      totalCount: 1, pageNumber: 1, pageSize: 10, totalPages: 1,
    })
    render(<MemoryRouter><OrderHistoryPage /></MemoryRouter>)
    expect(await screen.findByText('Don #9')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem chi tiet' })).toHaveAttribute('href', '/orders/9')
    expect(screen.queryByRole('button', { name: /huy/i })).not.toBeInTheDocument()
  })
})
