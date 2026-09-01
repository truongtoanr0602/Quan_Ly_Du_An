import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AddressForm from './AddressForm'

describe('AddressForm', () => {
  afterEach(cleanup)

  it('submits trimmed shipping fields', () => {
    const submit = vi.fn()
    render(<AddressForm onSubmit={submit} submitLabel="Luu dia chi" />)

    fireEvent.change(screen.getByLabelText('Nguoi nhan'), { target: { value: '  Customer  ' } })
    fireEvent.change(screen.getByLabelText('So dien thoai'), { target: { value: ' 0900000000 ' } })
    fireEvent.change(screen.getByLabelText('Dia chi day du'), { target: { value: ' 1 Test Street ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Luu dia chi' }))

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      receiverName: 'Customer',
      receiverPhone: '0900000000',
      fullAddress: '1 Test Street',
      isDefault: false,
    }))
  })
})
