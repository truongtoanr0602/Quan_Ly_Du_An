import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/apiClient'
import { categoryService } from '../../services/categoryService'
import { productService } from '../../services/productService'
import ProductManagementPage from './ProductManagementPage'

vi.mock('../../services/productService', async () => {
  const actual = await vi.importActual<typeof import('../../services/productService')>('../../services/productService')
  return {
    ...actual,
    productService: {
      ...actual.productService,
      searchProducts: vi.fn(), createProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(),
    },
  }
})

vi.mock('../../services/categoryService', async () => {
  const actual = await vi.importActual<typeof import('../../services/categoryService')>('../../services/categoryService')
  return { ...actual, categoryService: { ...actual.categoryService, getAll: vi.fn() } }
})

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'Admin' }, isAuthenticated: true, logout: vi.fn() }),
}))

describe('ProductManagementPage', () => {
  afterEach(cleanup)
  const product = {
    productID: 9, categoryID: 3, categoryName: 'Laptops', productName: 'ThinkPad', sku: 'TP-9',
    description: 'Business laptop', price: 100, brandID: 1, brandName: 'Lenovo', imageUrl: '',
    stockQuantity: 4, createdAt: '', updatedAt: '', isActive: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoryService.getAll).mockResolvedValue([{
      categoryID: 3, categoryName: 'Laptops', parentID: null, description: null,
      isActive: true, createdAt: '', updatedAt: null,
    }])
    vi.mocked(productService.searchProducts).mockResolvedValue({
      items: [product], totalCount: 1, pageNumber: 1, pageSize: 10,
    })
  })

  it('shows a save error and keeps the edit modal and row after failure', async () => {
    vi.mocked(productService.updateProduct).mockRejectedValueOnce(
      new ApiError(409, 'The request conflicts with existing state.'),
    )

    render(<MemoryRouter><ProductManagementPage /></MemoryRouter>)
    expect(await screen.findByText('ThinkPad')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit product' }))
    expect(screen.getByText(/inactive/i)).toBeInTheDocument()
    fireEvent.submit(document.getElementById('productForm')!)

    expect(await screen.findByRole('alert')).toHaveTextContent('The request conflicts with existing state.')
    expect(screen.getByText('Sửa sản phẩm')).toBeInTheDocument()
    expect(screen.getByText('ThinkPad')).toBeInTheDocument()
  })

  it('shows a category-load alert and retries the category request', async () => {
    vi.mocked(categoryService.getAll)
      .mockRejectedValueOnce(new ApiError(503, 'Unable to load categories'))
      .mockResolvedValueOnce([])
    vi.mocked(productService.searchProducts).mockResolvedValue({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 })

    render(<MemoryRouter><ProductManagementPage /></MemoryRouter>)

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load categories')
    screen.getByRole('button', { name: /thử lại/i }).click()
    await waitFor(() => expect(categoryService.getAll).toHaveBeenCalledTimes(2))
  })
})
