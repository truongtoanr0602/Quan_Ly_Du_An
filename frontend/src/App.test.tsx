import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the ElectroTech public home route', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'ElectroTech' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở trợ lý AI' })).toBeInTheDocument()
  })
})

