import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/apiClient'
import { categoryService } from '../../services/categoryService'
import CategoryManagementPage from './CategoryManagementPage'

const mockLogout = vi.hoisted(() => vi.fn())

vi.mock('../../services/categoryService', async () => {
  const actual = await vi.importActual<typeof import('../../services/categoryService')>('../../services/categoryService')
  return {
    ...actual,
    categoryService: {
      ...actual.categoryService,
      getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
    },
  }
})

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'Admin' }, isAuthenticated: true, logout: mockLogout }),
}))

describe('CategoryManagementPage', () => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogout.mockReset()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(categoryService.getAll).mockResolvedValue([{
      categoryID: 7, categoryName: 'Laptops', parentID: null, description: null,
      isActive: true, createdAt: '', updatedAt: null,
    }])
  })

  it('shows a conflict after failed delete and keeps the category row', async () => {
    vi.mocked(categoryService.delete).mockRejectedValueOnce(
      new ApiError(409, 'The request conflicts with existing state.'),
    )

    render(<MemoryRouter><CategoryManagementPage /></MemoryRouter>)
    expect(await screen.findByText('Laptops')).toBeInTheDocument()
    screen.getByRole('button', { name: 'Delete category' }).click()

    expect(await screen.findByRole('alert')).toHaveTextContent('The request conflicts with existing state.')
    expect(screen.getByText('Laptops')).toBeInTheDocument()
  })

  it('uses the auth logout action before navigating to login', async () => {
    render(<MemoryRouter><CategoryManagementPage /></MemoryRouter>)
    await waitFor(() => expect(categoryService.getAll).toHaveBeenCalled())
    screen.getAllByRole('button', { name: 'Log out' })[0].click()
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})