import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chatService } from '../services/chatService'
import ChatBot from './ChatBot'

vi.mock('../services/chatService', () => ({ chatService: { sendMessage: vi.fn() } }))

describe('ChatBot', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('opens, sends a question, and links a recommended product', async () => {
    vi.mocked(chatService.sendMessage).mockResolvedValue({
      reply: 'Mời xem Laptop Acme',
      products: [{ productId: 5, productName: 'Laptop Acme', price: 100 }],
    })
    render(<MemoryRouter><ChatBot /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý AI' }))
    fireEvent.change(screen.getByPlaceholderText('Hỏi về sản phẩm...'), { target: { value: 'Gợi ý laptop' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi tin nhắn' }))

    expect(await screen.findByText('Mời xem Laptop Acme')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Laptop Acme/ })).toHaveAttribute('href', '/products/5')
    expect(chatService.sendMessage).toHaveBeenCalledWith('Gợi ý laptop', [])
  })
})
