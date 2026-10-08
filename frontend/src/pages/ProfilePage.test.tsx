import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../contexts/AuthContext'
import { saveSession } from '../services/authSession'
import { profileService } from '../services/profileService'
import ProfilePage from './ProfilePage'

vi.mock('../services/profileService', () => ({
  profileService: {
    get: vi.fn(),
    update: vi.fn(),
  },
}))

const profile = {
  userID: 7,
  email: 'customer@test.local',
  fullName: 'Customer One',
  phone: '0900000000',
  avatarURL: 'https://example.com/avatar.png',
}

function renderPage() {
  saveSession({
    token: 'token',
    user: { id: 7, email: profile.email, fullName: profile.fullName, role: 'Customer' },
  })
  return render(<MemoryRouter><AuthProvider><ProfilePage /></AuthProvider></MemoryRouter>)
}

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(profileService.get).mockResolvedValue(profile)
    vi.mocked(profileService.update).mockResolvedValue({ ...profile, fullName: 'Updated Customer' })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads and displays the current customer profile', async () => {
    renderPage()
    expect(await screen.findByDisplayValue('Customer One')).toBeInTheDocument()
    expect(screen.getByDisplayValue('customer@test.local')).toBeDisabled()
    expect(screen.getByDisplayValue('0900000000')).toBeInTheDocument()
  })

  it('submits trimmed editable fields and reports success', async () => {
    renderPage()
    const fullName = await screen.findByLabelText('Ho ten')
    fireEvent.change(fullName, { target: { value: '  Updated Customer  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Luu thay doi' }))

    await waitFor(() => expect(profileService.update).toHaveBeenCalledWith({
      fullName: 'Updated Customer',
      phone: '0900000000',
      avatarURL: 'https://example.com/avatar.png',
    }))
    expect(await screen.findByText('Cap nhat ho so thanh cong.')).toBeInTheDocument()
  })

  it('shows an API failure without discarding form values', async () => {
    vi.mocked(profileService.update).mockRejectedValue(new Error('Update failed'))
    renderPage()
    const fullName = await screen.findByLabelText('Ho ten')
    fireEvent.change(fullName, { target: { value: 'Still Here' } })
    fireEvent.click(screen.getByRole('button', { name: 'Luu thay doi' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Update failed')
    expect(screen.getByDisplayValue('Still Here')).toBeInTheDocument()
  })
})
