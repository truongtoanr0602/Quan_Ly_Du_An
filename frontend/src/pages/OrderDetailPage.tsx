import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { orderService } from '../services/orderService'
import type { OrderDetail } from '../types/order'

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    orderService.get(Number(id)).then(setOrder)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Khong the tai don hang.'))
  }, [id])
  if (error) return <p role="alert" className="mx-auto max-w-5xl p-8 text-red-600">{error}</p>
  if (!order) return <p className="p-8">Dang tai don hang...</p>
  return <section className="mx-auto w-full max-w-5xl px-4 py-8">
    <h1 className="text-2xl font-bold">Don #{order.orderID}</h1>
    <p className="mb-6">{order.orderStatus} ? {order.paymentMethod} ? {order.paymentStatus}</p>
    <div className="mb-6 rounded border p-4"><h2 className="font-semibold">Thong tin giao hang</h2>
      <p>{order.receiverName} - {order.receiverPhone}</p><p>{order.shippingAddress}</p></div>
    <ul className="grid gap-3">{order.items.map((item) => <li key={item.productID} className="flex justify-between rounded border p-4">
      <span><strong>{item.productName}</strong><br />{item.sku} ? {item.quantity}</span><span>{money(item.totalPrice)}</span>
    </li>)}</ul>
    <div className="mt-6 text-right"><p>Tam tinh: {money(order.subTotal)}</p><p>Phi giao hang: {money(order.shippingFee)}</p>
      <p className="text-xl font-bold">Tong: {money(order.totalAmount)}</p></div>
  </section>
}
