import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminService } from '../../services/adminService'
import AdminDashboardPage from './AdminDashboardPage'
import OrderManagementPage from './OrderManagementPage'

vi.mock('../../services/adminService', () => ({
  adminService: {
    getDashboardSummary: vi.fn(), getRevenue: vi.fn(), getTopProducts: vi.fn(),
    getOrders: vi.fn(), getOrder: vi.fn(), updateOrderStatus: vi.fn(),
  },
}))

const order = {
  orderId: 19, userId: 2, customerName: 'Buyer', customerEmail: 'buyer@example.test',
  receiverName: 'Buyer', receiverPhone: '0900', shippingAddress: '1 Street',
  totalAmount: 100, paymentMethod: 'QR', paymentStatus: 'PAID', orderStatus: 'PENDING',
  createdAt: '2026-10-08T08:00:00Z', items: [
    { orderDetailId: 2, productId: 5, productName: 'Laptop', sku: 'LAP-5', quantity: 1, unitPrice: 100, totalPrice: 100 },
  ],
}

describe('restored admin screens', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('shows live dashboard figures and links to the order list', async () => {
    vi.mocked(adminService.getDashboardSummary).mockResolvedValue({
      totalRevenue: 100, totalOrders: 1, totalCustomers: 1, totalProducts: 1,
      pendingOrders: 1, lowStockProducts: 1,
    })
    vi.mocked(adminService.getRevenue).mockResolvedValue({ dailyRevenue: [], totalRevenue: 100, totalOrders: 1 })
    vi.mocked(adminService.getTopProducts).mockResolvedValue([])
    vi.mocked(adminService.getOrders).mockResolvedValue({ items: [order], totalCount: 1, pageNumber: 1, pageSize: 5 })

    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>)
    expect(await screen.findByText('#19')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Xem tất cả đơn hàng/ })).toHaveAttribute('href', '/admin/orders')
    expect(adminService.getOrders).toHaveBeenCalledWith(1, 5)
  })

  it('loads an order and sends an admin status change through the admin service', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(adminService.getOrders).mockResolvedValue({ items: [order], totalCount: 1, pageNumber: 1, pageSize: 10 })
    vi.mocked(adminService.getOrder).mockResolvedValue(order)
    vi.mocked(adminService.updateOrderStatus).mockResolvedValue({ ...order, orderStatus: 'CONFIRMED' })

    render(<MemoryRouter><OrderManagementPage /></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Chi tiết / Cập nhật' }))
    expect(await screen.findByText('Chi tiết đơn hàng #19')).toBeInTheDocument()
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'CONFIRMED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }))
    await waitFor(() => expect(adminService.updateOrderStatus).toHaveBeenCalledWith(19, 'CONFIRMED', ''))
    vi.mocked(window.alert).mockRestore()
  })
})
