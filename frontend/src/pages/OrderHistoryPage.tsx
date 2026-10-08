import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../services/orderService'
import type { PagedOrders } from '../types/order'

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function OrderHistoryPage() {
  const [data, setData] = useState<PagedOrders | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    setError(null)
    orderService.list(page, 10).then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Khong the tai don hang.'))
  }, [page])
  return <section className="mx-auto w-full max-w-5xl px-4 py-8">
    <h1 className="mb-6 text-2xl font-bold">Don hang cua toi</h1>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {!data && !error ? <p>Dang tai don hang...</p> : data?.items.length === 0 ? <p>Chua co don hang.</p> : <div className="grid gap-4">
      {data?.items.map((order) => <article key={order.orderID} className="rounded border p-4">
        <div className="flex justify-between"><h2 className="font-semibold">Don #{order.orderID}</h2><span>{order.orderStatus}</span></div>
        <p>{new Date(order.createdAt).toLocaleDateString('vi-VN')} ? {order.totalItems} san pham</p>
        <p className="font-bold">{money(order.totalAmount)}</p>
        <Link className="text-primary" to={'/orders/' + order.orderID}>Xem chi tiet</Link>
      </article>)}
      {data && data.totalPages > 1 && <div className="flex gap-3">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Trang truoc</button>
        <span>{page}/{data.totalPages}</span>
        <button disabled={page === data.totalPages} onClick={() => setPage(page + 1)}>Trang sau</button>
      </div>}
    </div>}
  </section>
}
