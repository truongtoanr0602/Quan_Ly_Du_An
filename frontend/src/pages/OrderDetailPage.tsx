import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { orderService } from '../services/orderService'
import type { MockPayment, OrderDetail } from '../types/order'

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

function mockBankUrl(payment: MockPayment): string {
  const url = new URL('/mock-bank/orders/' + payment.orderID, window.location.origin)
  url.searchParams.set('amount', payment.amount.toFixed(2))
  url.searchParams.set('content', payment.transferContent)
  return url.toString()
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const orderID = Number(id)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [payment, setPayment] = useState<MockPayment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    orderService.get(orderID).then(async (loadedOrder) => {
      if (!active) return
      setOrder(loadedOrder)
      if (loadedOrder.paymentMethod === 'QR' && loadedOrder.paymentStatus === 'PENDING') {
        try {
          const loadedPayment = await orderService.getMockPayment(orderID)
          if (active) setPayment(loadedPayment)
        } catch (reason: unknown) {
          if (active) setPaymentError(reason instanceof Error ? reason.message : 'Không thể tải mã QR.')
        }
      }
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải đơn hàng.')
    })
    return () => { active = false }
  }, [orderID])

  useEffect(() => {
    if (order?.paymentMethod !== 'QR' || order.paymentStatus !== 'PENDING') return
    const timer = window.setInterval(() => {
      void orderService.get(orderID).then(setOrder).catch(() => undefined)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [order?.paymentMethod, order?.paymentStatus, orderID])

  const retryPayment = async () => {
    setPaymentError(null)
    try {
      setPayment(await orderService.getMockPayment(orderID))
    } catch (reason: unknown) {
      setPaymentError(reason instanceof Error ? reason.message : 'Không thể tải mã QR.')
    }
  }

  if (error) return <p role="alert" className="mx-auto max-w-5xl p-8 text-red-600">{error}</p>
  if (!order) return <p className="p-8">Đang tải đơn hàng...</p>

  const showPayment = order.paymentMethod === 'QR' && order.paymentStatus === 'PENDING'
  const bankUrl = payment && showPayment ? mockBankUrl(payment) : null
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced === true

  return <section className="mx-auto w-full max-w-5xl px-4 py-8">
    {order.paymentMethod === 'QR' && order.paymentStatus === 'PAID' ?
      <div role="status" className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-5 text-on-surface">
        <h2 className="text-lg font-bold text-primary">Thanh toán thử thành công</h2>
        <p>Đơn hàng #{order.orderID} đã được xác nhận thanh toán (PAID).</p>
      </div> : justPlaced &&
      <div role="status" className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-5 text-on-surface">
        <h2 className="text-lg font-bold text-primary">Đặt hàng thành công</h2>
        <p>{order.paymentMethod === 'QR'
          ? 'Đơn hàng #' + order.orderID + ' đã được tạo. Quét mã QR bên dưới để hoàn tất thanh toán thử.'
          : 'Đơn hàng #' + order.orderID + ' đã được tạo. Bạn sẽ thanh toán khi nhận hàng.'}</p>
      </div>}
    <h1 className="text-2xl font-bold">Đơn #{order.orderID}</h1>
    <p className="mb-6 text-secondary">Trạng thái đơn: {order.orderStatus} · Phương thức: {order.paymentMethod} · Thanh toán: {order.paymentStatus}</p>

    {order.paymentMethod === 'QR' && <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <h2 className="text-lg font-semibold">Thanh toán QR thử</h2>
      {order.paymentStatus === 'PAID' ? <p className="mt-3 font-semibold text-primary">Đã thanh toán (PAID)</p> :
        showPayment ? <>
          <p className="mt-2 text-sm text-secondary">Ngân hàng mô phỏng · không chuyển tiền thật. Quét mã bằng camera để mở trang xác nhận thử.</p>
          {paymentError && <p role="alert" className="mt-3 text-red-600">{paymentError}</p>}
          {bankUrl && payment ? <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="w-fit rounded-xl bg-white p-3"><QRCodeSVG value={bankUrl} size={220} marginSize={2} title="Mã QR thanh toán thử" /></div>
            <div className="space-y-2 text-sm">
              <p>Ngân hàng: <strong>{payment.bankName}</strong></p>
              <p>Số tài khoản: <strong>{payment.accountNumber}</strong></p>
              <p>Chủ tài khoản: <strong>{payment.accountName}</strong></p>
              <p>Nội dung: <strong>{payment.transferContent}</strong></p>
              <p>Số tiền theo hóa đơn: <strong className="text-primary">{money(payment.amount)}</strong></p>
              <Link to={bankUrl} className="inline-block rounded-full bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-container">Mở ngân hàng thử</Link>
              <p className="text-xs text-secondary">Trạng thái sẽ tự cập nhật sau khi xác nhận thanh toán thử.</p>
              {['localhost', '127.0.0.1'].includes(window.location.hostname) &&
                <p className="text-xs text-secondary">Để quét bằng điện thoại, hãy mở cửa hàng qua địa chỉ IP của máy tính trên cùng mạng rồi xem lại đơn này.</p>}
            </div>
          </div> : !paymentError && <p className="mt-3">Đang tạo mã QR...</p>}
          {paymentError && <button type="button" onClick={() => void retryPayment()} className="mt-3 text-primary underline">Thử tải lại mã QR</button>}
        </> : <p className="mt-3">Không thể thanh toán đơn này ở trạng thái hiện tại.</p>}
    </div>}

    <div className="mb-6 rounded-xl border border-outline-variant p-4"><h2 className="font-semibold">Thông tin giao hàng</h2>
      <p>{order.receiverName} · {order.receiverPhone}</p><p>{order.shippingAddress}</p></div>
    <ul className="grid gap-3">{order.items.map((item) => <li key={item.productID} className="flex justify-between gap-4 rounded-xl border border-outline-variant p-4">
      <span><strong>{item.productName}</strong><br />{item.sku} · x{item.quantity}</span><span>{money(item.totalPrice)}</span>
    </li>)}</ul>
    <div className="mt-6 text-right"><p>Tạm tính: {money(order.subTotal)}</p><p>Phí giao hàng: {money(order.shippingFee)}</p>
      <p className="text-xl font-bold">Tổng: {money(order.totalAmount)}</p></div>
  </section>
}
