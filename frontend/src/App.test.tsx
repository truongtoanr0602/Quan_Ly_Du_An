import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders ElectroTech branding and store navigation', () => {
    render(<App />)

    expect(screen.getAllByText('ElectroTech').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('Tìm kiếm sản phẩm...')).toBeInTheDocument()
  })
})
