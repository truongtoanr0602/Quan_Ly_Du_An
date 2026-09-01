import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function CartPage() {
  const { cart, isLoading, error, update, remove, clear } = useCart()

  if (isLoading) return <p className="p-8">Dang tai gio hang...</p>

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gio hang</h1>
        {cart.items.length > 0 && <button onClick={() => void clear()} className="text-red-600">Xoa gio hang</button>}
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
                  value={item.quantity}
                  onChange={(event) => void update(item.productID, Number(event.target.value))}
                  className="h-10 w-20 rounded border p-2"
                />
                <button onClick={() => void remove(item.productID)} className="text-red-600">Xoa</button>
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
