import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

interface AddToCartButtonProps {
  productID: number
  stockQuantity: number
  className?: string
}

export default function AddToCartButton({ productID, stockQuantity, className = '' }: AddToCartButtonProps) {
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const unavailable = stockQuantity <= 0
  const admin = user?.role === 'Admin'

  const handleClick = async () => {
    if (pending || unavailable || admin) return
    if (!user) {
      navigate('/login')
      return
    }
    setPending(true)
    setMessage(null)
    setError(null)
    try {
      await add(productID, 1)
      setMessage('Đã thêm vào giỏ')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể thêm vào giỏ')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={() => void handleClick()} disabled={pending || unavailable || admin}
        className={className}>
        <span className="material-symbols-outlined text-sm" aria-hidden="true">shopping_cart</span>
        {unavailable ? 'Hết hàng' : admin ? 'Chỉ dành cho khách hàng' : pending ? 'Đang thêm...' : 'Thêm vào giỏ'}
      </button>
      {message && <p role="status" className="mt-2 text-sm text-green-700">{message}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    </div>
  )
}
