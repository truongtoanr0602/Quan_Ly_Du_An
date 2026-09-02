import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addressService } from '../services/addressService'
import AddressesPage from './AddressesPage'

vi.mock('../services/addressService', () => ({
  addressService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const address = {
  addressID: 5,
  receiverName: 'Customer',
  receiverPhone: '0900000000',
  province: 'Ho Chi Minh',
  district: 'District 1',
  ward: 'Ward 1',
  fullAddress: '1 Test Street',
  isDefault: true,
}

describe('AddressesPage', () => {
  beforeEach(() => {
    vi.mocked(addressService.list).mockResolvedValue([])
    vi.mocked(addressService.create).mockResolvedValue(address)
    vi.mocked(addressService.remove).mockResolvedValue(undefined)
  })
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('shows empty state and creates an address', async () => {
    render(<AddressesPage />)
    expect(await screen.findByText('Chua co dia chi giao hang.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Them dia chi' }))
    fireEvent.change(screen.getByLabelText('Nguoi nhan'), { target: { value: 'Customer' } })
    fireEvent.change(screen.getByLabelText('So dien thoai'), { target: { value: '0900000000' } })
    fireEvent.change(screen.getByLabelText('Dia chi day du'), { target: { value: '1 Test Street' } })
    fireEvent.click(screen.getByRole('button', { name: 'Luu dia chi' }))
    await waitFor(() => expect(addressService.create).toHaveBeenCalled())
  })

  it('renders default address and deletes after confirmation', async () => {
    vi.mocked(addressService.list).mockResolvedValue([address])
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<AddressesPage />)

    expect(await screen.findByText('Mac dinh')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xoa' }))
    await waitFor(() => expect(addressService.remove).toHaveBeenCalledWith(5))
  })
})
