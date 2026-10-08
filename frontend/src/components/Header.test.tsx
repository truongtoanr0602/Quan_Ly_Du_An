import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { categoryService } from '../services/categoryService'
import Header from './Header'

const useAuth = vi.fn()
const useCart = vi.fn()
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => useAuth() }))
vi.mock('../contexts/CartContext', () => ({ useCart: () => useCart() }))
vi.mock('../services/categoryService', () => ({ categoryService: { getAll: vi.fn() } }))

function SearchLocation() {
  const location = useLocation()
  return <p>Trang hiện tại: {location.pathname}; từ khóa: {new URLSearchParams(location.search).get('keyword') ?? ''}</p>
}

describe('Header', () => {
  beforeEach(() => {
    useCart.mockReturnValue({ cart: { totalItems: 2 } })
    vi.mocked(categoryService.getAll).mockResolvedValue([
      { categoryID: 1, categoryName: 'Laptops', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
      { categoryID: 2, categoryName: 'Smartphones', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
      { categoryID: 4, categoryName: 'Chuột & Bàn phím', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
      { categoryID: 6, categoryName: 'Màn hình máy tính', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
      { categoryID: 7, categoryName: 'Linh kiện PC', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
      { categoryID: 8, categoryName: 'Cáp sạc & Hub', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
      { categoryID: 9, categoryName: 'Đã ẩn', parentID: null, description: null, isActive: false, createdAt: '', updatedAt: null },
    ])
  })
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('links active categories to their product filters and shows the customer menu', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, fullName: 'Nguyễn Nam', email: 'nam@example.test', role: 'Customer' },
      logout: vi.fn(),
    })
    render(<MemoryRouter><Header /></MemoryRouter>)

    expect(await screen.findByRole('link', { name: 'Cáp sạc & Hub', hidden: true })).toHaveAttribute('href', '/products?categoryId=8')
    expect(screen.getByRole('link', { name: 'Tất cả' })).toHaveAttribute('href', '/products')
    expect(within(screen.getByRole('navigation', { name: 'Danh mục sản phẩm' })).getAllByRole('link', { hidden: true }).map((link) => link.textContent)).toEqual([
      'Tất cả', 'Cáp sạc & Hub', 'Chuột & Bàn phím', 'Laptops', 'Linh kiện PC', 'Màn hình máy tính',
    ])
    expect(within(screen.getByRole('combobox', { name: 'Chọn danh mục sản phẩm' })).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Tất cả', 'Cáp sạc & Hub', 'Chuột & Bàn phím', 'Laptops', 'Linh kiện PC', 'Màn hình máy tính',
    ])
    fireEvent.change(screen.getByRole('combobox', { name: 'Chọn danh mục sản phẩm' }), { target: { value: '/products?categoryId=8' } })
    expect(screen.getByRole('combobox', { name: 'Chọn danh mục sản phẩm' })).toHaveValue('/products?categoryId=8')
    expect(screen.queryByRole('link', { name: 'Smartphones' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Đã ẩn' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Giỏ hàng' })).toHaveAttribute('href', '/cart')
    fireEvent.click(screen.getByRole('button', { name: 'Tài khoản' }))
    expect(screen.getByRole('link', { name: 'Thông tin tài khoản' })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: 'Đơn mua của tôi' })).toHaveAttribute('href', '/orders')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('link', { name: 'Đơn mua của tôi' })).not.toBeInTheDocument()
  })

  it('shows admin navigation without customer-only routes and logs out', () => {
    const logout = vi.fn()
    useAuth.mockReturnValue({
      user: { id: 2, fullName: 'Admin', email: 'admin@example.test', role: 'Admin' },
      logout,
    })
    render(<MemoryRouter><Header /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Tài khoản' }))
    expect(screen.getByRole('link', { name: 'Trang Quản trị Admin' })).toHaveAttribute('href', '/admin')
    expect(screen.queryByRole('link', { name: 'Đơn mua của tôi' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }))
    expect(logout).toHaveBeenCalledOnce()
  })

  it('searches all products from the navbar after the search button is pressed', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    render(<MemoryRouter initialEntries={['/']}><Header /><SearchLocation /></MemoryRouter>)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm kiếm sản phẩm' }), { target: { value: '  ThinkPad X1  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(screen.getByText('Trang hiện tại: /products; từ khóa: ThinkPad X1')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm sản phẩm' })).toHaveValue('ThinkPad X1')
  })
})

