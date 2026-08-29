import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../services/apiClient'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'
import ProductListPage from './ProductListPage'

vi.mock('../services/productService', async () => {
  const actual = await vi.importActual<typeof import('../services/productService')>('../services/productService')
  return { ...actual, productService: { ...actual.productService, searchProducts: vi.fn() } }
})

vi.mock('../services/categoryService', async () => {
  const actual = await vi.importActual<typeof import('../services/categoryService')>('../services/categoryService')
  return { ...actual, categoryService: { ...actual.categoryService, getAll: vi.fn() } }
})

describe('ProductListPage', () => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoryService.getAll).mockResolvedValue([])
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
})