import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../contexts/CartContext'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function CartPage() {
  const { cart, isLoading, error, update, remove, clear } = useCart()
  const [pendingProductID, setPendingProductID] = useState<number | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  const mutateItem = async (productID: number, operation: () => Promise<void>) => {
    if (pendingProductID !== null) return
    setPendingProductID(productID)
    try {
      await operation()
    } catch {
      // CartContext exposes the recoverable error inline.
    } finally {
      setPendingProductID(null)
    }
  }

  if (isLoading) return <p className="p-8">Dang tai gio hang...</p>

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gio hang</h1>
        {cart.items.length > 0 && <button disabled={isClearing} onClick={() => {
          setIsClearing(true)
          void clear().catch(() => undefined).finally(() => setIsClearing(false))
        }} className="text-red-600 disabled:opacity-50">Xoa gio hang</button>}
      </div>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      {cart.items.length === 0 ? (
        <p>Gio hang dang trong.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <ul className="grid gap-4">
            {cart.items.map((item) => (
              <li key={item.productID} className="flex gap-4 rounded border p-4">
                <div className="flex-1">
                  <h2 className="font-semibold">{item.productName}</h2>
                  <p>{item.sku}</p>
                  <p>{formatPrice(item.unitPrice)}</p>
                </div>
                <input
                  aria-label={`So luong ${item.productName}`}
                  type="number"
                  min={1}
                  max={item.stockQuantity}
                  defaultValue={item.quantity}
                  disabled={pendingProductID !== null}
                  onBlur={(event) => void mutateItem(item.productID, () => update(item.productID, Number(event.target.value)))}
                  className="h-10 w-20 rounded border p-2"
                />
                <button disabled={pendingProductID !== null} onClick={() => void mutateItem(item.productID, () => remove(item.productID))} className="text-red-600 disabled:opacity-50">Xoa</button>
              </li>
            ))}
          </ul>
          <aside className="rounded border p-4">
            <p>{cart.totalItems} san pham</p>
            <p className="my-4 text-xl font-bold">{formatPrice(cart.totalAmount)}</p>
            <Link to="/checkout" className="block rounded bg-primary px-4 py-2 text-center text-white">Thanh toan</Link>
          </aside>
        </div>
      )}
    </section>
  )
}
