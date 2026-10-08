import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import type { CartItem } from '../types/cart'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function CartPage() {
  const { cart, isLoading, error, update, remove, clear } = useCart()
  const [pendingProductID, setPendingProductID] = useState<number | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const isBusy = pendingProductID !== null || isClearing

  const mutateItem = async (productID: number, operation: () => Promise<void>) => {
    if (isBusy) return
    setPendingProductID(productID)
    try {
      await operation()
    } catch {
      // CartContext displays the recoverable error.
    } finally {
      setPendingProductID(null)
    }
  }

  const changeQuantity = (item: CartItem, amount: number) => {
    const quantity = item.quantity + amount
    if (quantity < 1 || quantity > item.stockQuantity) return
    void mutateItem(item.productID, () => update(item.productID, quantity))
  }

  if (isLoading) return <p className="mx-auto max-w-3xl px-4 py-10">Đang tải giỏ hàng...</p>

  return (
    <section className="mx-auto w-full max-w-3xl py-4 sm:py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-on-surface">Giỏ hàng ({cart.totalItems} sản phẩm)</h1>
        {cart.items.length > 0 && (
          <button type="button" disabled={isBusy} onClick={() => {
            setIsClearing(true)
            void clear().catch(() => undefined).finally(() => setIsClearing(false))
          }} className="text-sm font-medium text-error hover:underline disabled:opacity-50">
            Xóa tất cả
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-error-container p-3 text-on-error-container">{error}</p>}

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center">
          <p>Giỏ hàng đang trống.</p>
          <Link to="/products" className="mt-3 inline-block font-semibold text-primary hover:underline">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li key={item.productID} className="flex gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4 shadow-sm">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24">
                  {item.imageURL ? <img src={item.imageURL} alt={item.productName} className="h-full w-full object-contain" />
                    : <span className="material-symbols-outlined text-3xl text-secondary" aria-hidden="true">inventory_2</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 font-semibold text-on-surface">{item.productName}</h2>
                    <button type="button" aria-label={`Xóa ${item.productName}`} disabled={isBusy}
                      onClick={() => void mutateItem(item.productID, () => remove(item.productID))}
                      className="shrink-0 rounded-full p-1 text-secondary hover:bg-surface-container-high hover:text-error disabled:opacity-50">
                      <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-secondary">{item.sku}</p>
                  <p className="mt-1 font-semibold text-primary">{formatPrice(item.unitPrice)}</p>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-outline-variant bg-white">
                        <button type="button" aria-label={`Giảm số lượng ${item.productName}`} disabled={isBusy || item.quantity <= 1}
                          onClick={() => changeQuantity(item, -1)} className="px-3 py-1 text-secondary disabled:opacity-40">−</button>
                        <span aria-label={`Số lượng ${item.productName}`} className="min-w-6 text-center text-sm">{item.quantity}</span>
                        <button type="button" aria-label={`Tăng số lượng ${item.productName}`} disabled={isBusy || item.quantity >= item.stockQuantity}
                          onClick={() => changeQuantity(item, 1)} className="px-3 py-1 text-secondary disabled:opacity-40">+</button>
                      </div>
                      <span className="text-xs text-secondary">Còn {item.stockQuantity}</span>
                    </div>
                    <p className="font-semibold text-on-surface">{formatPrice(item.lineTotal)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-2xl border border-outline-variant bg-surface-container-low p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4 font-semibold">
              <span>Tổng cộng:</span>
              <strong className="text-xl text-primary">{formatPrice(cart.totalAmount)}</strong>
            </div>
            <Link to="/checkout" className="mt-4 block rounded-full bg-primary px-5 py-3 text-center font-semibold text-white hover:bg-primary-container">
              Tiến hành thanh toán
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
