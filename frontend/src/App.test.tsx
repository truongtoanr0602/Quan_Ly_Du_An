import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the technical baseline shell', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'ECommerce' })).toBeInTheDocument()
    expect(screen.getByText('Technical baseline ready')).toBeInTheDocument()
  })
})

