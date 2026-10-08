import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../services/apiClient'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'
import ProductListPage from './ProductListPage'

vi.mock('../services/productService', async () => {
  const actual = await vi.importActual<typeof import('../services/productService')>('../services/productService')
  return { ...actual, productService: { ...actual.productService, searchProducts: vi.fn(), getActiveBrands: vi.fn() } }
})

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('../contexts/CartContext', () => ({ useCart: () => ({ add: vi.fn() }) }))

vi.mock('../services/categoryService', async () => {
  const actual = await vi.importActual<typeof import('../services/categoryService')>('../services/categoryService')
  return { ...actual, categoryService: { ...actual.categoryService, getAll: vi.fn() } }
})

describe('ProductListPage', () => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoryService.getAll).mockResolvedValue([])
    vi.mocked(productService.getActiveBrands).mockResolvedValue([])
  })

  it('shows a retryable catalog error instead of an empty state', async () => {
    vi.mocked(productService.searchProducts)
      .mockRejectedValueOnce(new ApiError(500, 'Unable to load products'))
      .mockResolvedValueOnce({ items: [], totalCount: 0, pageNumber: 1, pageSize: 12 })

    render(<MemoryRouter><ProductListPage /></MemoryRouter>)

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load products')
    const retry = screen.getByRole('button', { name: /thử lại/i })
    expect(retry).toBeInTheDocument()
    retry.click()
    await waitFor(() => expect(productService.searchProducts).toHaveBeenCalledTimes(2))
  })

  it('shows a category-load alert and retries the category request', async () => {
    vi.mocked(categoryService.getAll)
      .mockRejectedValueOnce(new ApiError(503, 'Unable to load categories'))
      .mockResolvedValueOnce([])
    vi.mocked(productService.searchProducts).mockResolvedValue({ items: [], totalCount: 0, pageNumber: 1, pageSize: 12 })

    render(<MemoryRouter><ProductListPage /></MemoryRouter>)

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load categories')
    screen.getByRole('button', { name: /thử lại/i }).click()
    await waitFor(() => expect(categoryService.getAll).toHaveBeenCalledTimes(2))
  })

  it('loads the products for a category from the URL and updates the filter when cleared', async () => {
    vi.mocked(categoryService.getAll).mockResolvedValue([
      { categoryID: 7, categoryName: 'Laptops', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
    ])
    vi.mocked(productService.searchProducts).mockResolvedValue({
      items: [{ productID: 9, categoryID: 7, categoryName: 'Laptops', productName: 'ThinkPad', sku: 'TP-9', price: 1000000, brandID: 1, stockQuantity: 3, createdAt: '', isActive: true }],
      totalCount: 1, pageNumber: 1, pageSize: 12,
    })

    render(<MemoryRouter initialEntries={['/products?categoryId=7']}><ProductListPage /></MemoryRouter>)

    expect(await screen.findByText('ThinkPad')).toBeInTheDocument()
    expect(productService.searchProducts).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 7 }))
    expect(screen.getByRole('radio', { name: 'Laptops' })).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ lọc danh mục' }))
    await waitFor(() => expect(productService.searchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ categoryId: undefined })))
    expect(screen.getByRole('radio', { name: 'Laptops' })).not.toBeChecked()
  })

  it('refreshes the products when another category link is selected on the same page', async () => {
    vi.mocked(productService.searchProducts).mockImplementation(async ({ categoryId }) => ({
      items: [{
        productID: categoryId === 8 ? 10 : 9,
        categoryID: categoryId ?? 7,
        categoryName: categoryId === 8 ? 'Màn hình' : 'Laptops',
        productName: categoryId === 8 ? 'Màn hình Dell' : 'ThinkPad',
        sku: categoryId === 8 ? 'DELL-10' : 'TP-9',
        price: 1000000, brandID: 1, stockQuantity: 3, createdAt: '', isActive: true,
      }],
      totalCount: 1, pageNumber: 1, pageSize: 12,
    }))

    render(
      <MemoryRouter initialEntries={['/products?categoryId=7']}>
        <Link to="/products?categoryId=8">Màn hình</Link>
        <ProductListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('ThinkPad')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Màn hình' }))
    expect(await screen.findByText('Màn hình Dell')).toBeInTheDocument()
    expect(productService.searchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ categoryId: 8 }))
    expect(screen.queryByText('ThinkPad')).not.toBeInTheDocument()
  })

  it('loads the navbar search keyword and refreshes when another search is submitted on the same page', async () => {
    vi.mocked(productService.searchProducts).mockImplementation(async ({ keyword }) => ({
      items: [{
        productID: keyword === 'ThinkPad' ? 10 : 9,
        categoryID: 1, categoryName: 'Laptops',
        productName: keyword === 'ThinkPad' ? 'ThinkPad X1' : 'MacBook Pro',
        sku: keyword === 'ThinkPad' ? 'TP-10' : 'MB-9',
        price: 1000000, brandID: 1, stockQuantity: 3, createdAt: '', isActive: true,
      }],
      totalCount: 1, pageNumber: 1, pageSize: 12,
    }))

    render(
      <MemoryRouter initialEntries={['/products?keyword=MacBook']}>
        <Link to="/products?keyword=ThinkPad">Tìm ThinkPad</Link>
        <ProductListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('MacBook Pro')).toBeInTheDocument()
    expect(productService.searchProducts).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'MacBook' }))
    fireEvent.click(screen.getByRole('link', { name: 'Tìm ThinkPad' }))
    expect(await screen.findByText('ThinkPad X1')).toBeInTheDocument()
    expect(productService.searchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: 'ThinkPad' }))
    expect(screen.getByPlaceholderText('Tìm kiếm sản phẩm...')).toHaveValue('ThinkPad')
  })

  it('uses API brand options and sends sorting to the server before paging', async () => {
    vi.mocked(productService.getActiveBrands).mockResolvedValue(['Apple', 'Logitech'])
    vi.mocked(productService.searchProducts).mockResolvedValue({
      items: [{ productID: 9, categoryID: 7, categoryName: 'Laptops', productName: 'Mouse', sku: 'M-9', price: 100,
        brandID: 4, brandName: 'Logitech', stockQuantity: 3, createdAt: '', isActive: true }],
      totalCount: 1, pageNumber: 1, pageSize: 12,
    })

    render(<MemoryRouter><ProductListPage /></MemoryRouter>)
    expect(await screen.findByRole('radio', { name: 'Logitech' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price_asc' } })
    await waitFor(() => expect(productService.searchProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'price_asc', pageNumber: 1 }),
    ))
  })
})
