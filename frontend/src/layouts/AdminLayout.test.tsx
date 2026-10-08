import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdminLayout from './AdminLayout'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ logout: vi.fn() }) }))

describe('AdminLayout', () => {
  afterEach(cleanup)

  it('opens the dashboard and navigates to every admin screen', () => {
    render(<MemoryRouter initialEntries={['/admin/products']}><Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<h1>Dashboard screen</h1>} />
        <Route path="orders" element={<h1>Orders screen</h1>} />
        <Route path="inventory" element={<h1>Inventory screen</h1>} />
        <Route path="products" element={<h1>Products screen</h1>} />
        <Route path="categories" element={<h1>Categories screen</h1>} />
        <Route path="users" element={<h1>Users screen</h1>} />
      </Route>
    </Routes></MemoryRouter>)

    for (const [label, heading] of [
      ['Tổng quan', 'Dashboard screen'],
      ['Quản lý Đơn hàng', 'Orders screen'],
      ['Quản lý Tồn kho', 'Inventory screen'],
      ['Quản lý Sản phẩm', 'Products screen'],
      ['Quản lý Danh mục', 'Categories screen'],
      ['Quản lý Người dùng', 'Users screen'],
    ]) {
      const link = screen.getByRole('link', { name: new RegExp(label) })
      fireEvent.click(link)
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
      expect(link).toHaveAttribute('aria-current', 'page')
    }
  })
})
