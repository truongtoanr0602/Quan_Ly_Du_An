import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../services/apiClient'
import { productService } from '../services/productService'
import ProductDetailPage from './ProductDetailPage'

vi.mock('../services/productService', async () => {
  const actual = await vi.importActual<typeof import('../services/productService')>('../services/productService')
  return { ...actual, productService: { ...actual.productService, getProductById: vi.fn() } }
})

describe('ProductDetailPage', () => {
  afterEach(cleanup)
  beforeEach(() => vi.clearAllMocks())

  const renderDetail = () => render(
    <MemoryRouter initialEntries={['/products/42']}>
      <Routes><Route path="/products/:id" element={<ProductDetailPage />} /></Routes>
    </MemoryRouter>,
  )

  it('shows a retryable detail error for request failures', async () => {
    vi.mocked(productService.getProductById)
      .mockRejectedValueOnce(new ApiError(503, 'Unable to load product'))
      .mockRejectedValueOnce(new ApiError(503, 'Unable to load product'))

    renderDetail()

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load product')
    screen.getByRole('button', { name: /thử lại/i }).click()
    await waitFor(() => expect(productService.getProductById).toHaveBeenCalledTimes(2))
  })

  it('keeps a 404 response as a not-found state without retry error UI', async () => {
    vi.mocked(productService.getProductById).mockRejectedValueOnce(new ApiError(404, 'Product not found'))

    renderDetail()

    expect(await screen.findByText('Không tìm thấy sản phẩm')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /thử lại/i })).not.toBeInTheDocument()
  })
})