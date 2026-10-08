import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import HomePage from './HomePage'

vi.mock('../services/categoryService', () => ({ categoryService: { getAll: vi.fn() } }))
vi.mock('../services/productService', () => ({ productService: { searchProducts: vi.fn() } }))
vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../contexts/CartContext', () => ({ useCart: vi.fn() }))

describe('HomePage', () => {
  const add = vi.fn()
  beforeEach(() => {
    vi.clearAllMocks()
    add.mockResolvedValue(undefined)
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, email: 'c@test.local', fullName: 'Customer', role: 'Customer' } } as ReturnType<typeof useAuth>)
    vi.mocked(useCart).mockReturnValue({ add } as unknown as ReturnType<typeof useCart>)
    vi.mocked(categoryService.getAll).mockResolvedValue([
      { categoryID: 7, categoryName: 'Laptops', parentID: null, description: null, isActive: true, createdAt: '', updatedAt: null },
    ])
    vi.mocked(productService.searchProducts).mockResolvedValue({
      items: [{ productID: 42, categoryID: 7, categoryName: 'Laptops', productName: 'ThinkPad', sku: 'TP-42', price: 1000000,
        brandID: 1, brandName: 'Lenovo', stockQuantity: 3, isActive: true, createdAt: '' }],
      totalCount: 1, pageNumber: 1, pageSize: 4,
    })
  })
  afterEach(cleanup)

  it('links real categories and adds an API product to the cart', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(await screen.findAllByText('ThinkPad')).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /Laptops/ })[0]).toHaveAttribute('href', '/products?categoryId=7')
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }))
    await waitFor(() => expect(add).toHaveBeenCalledWith(42, 1))
  })
})
