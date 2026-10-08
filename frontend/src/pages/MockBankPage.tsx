import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderService } from '../services/orderService'
import type { MockPayment } from '../types/order'

const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function MockBankPage() {
  const { id } = useParams()
  const orderID = Number(id)
  const [payment, setPayment] = useState<MockPayment | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    orderService.getMockPayment(orderID).then((result) => {
      if (active) setPayment(result)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải thông tin thanh toán.')
    })
    return () => { active = false }
  }, [orderID])

  const confirm = async () => {
    if (isConfirming || payment?.paymentStatus !== 'PENDING') return
    setError(null)
    setIsConfirming(true)
    try {
      setPayment(await orderService.confirmMockPayment(orderID))
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể xác nhận thanh toán thử.')
    } finally {
      setIsConfirming(false)
    }
  }

  return <section className="mx-auto w-full max-w-xl px-4 py-8">
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-primary">ElectroTech Demo Bank</h1>
      <p className="mt-2 text-sm text-secondary">Đây là ngân hàng mô phỏng. Không có giao dịch hay chuyển tiền thật.</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-error-container p-3 text-on-error-container">{error}</p>}
      {!payment && !error && <p className="mt-4">Đang tải hóa đơn...</p>}
      {payment && <>
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-y border-outline-variant py-5 text-sm">
          <dt className="text-secondary">Đơn hàng</dt><dd className="font-semibold">#{payment.orderID}</dd>
          <dt className="text-secondary">Ngân hàng</dt><dd>{payment.bankName}</dd>
          <dt className="text-secondary">Số tài khoản</dt><dd>{payment.accountNumber}</dd>
          <dt className="text-secondary">Chủ tài khoản</dt><dd>{payment.accountName}</dd>
          <dt className="text-secondary">Nội dung</dt><dd className="font-semibold">{payment.transferContent}</dd>
          <dt className="text-secondary">Số tiền</dt><dd className="font-bold text-primary">{money(payment.amount)}</dd>
        </dl>
        {payment.paymentStatus === 'PAID' ? <div role="status" className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <h2 className="text-lg font-bold text-primary">Thanh toán thử thành công</h2>
          <p>Đơn hàng #{payment.orderID} đã được xác nhận thanh toán (PAID).</p>
        </div> :
          payment.paymentStatus === 'PENDING' ? <>
            <p className="mt-5 text-secondary">Đang chờ thanh toán (PENDING)</p>
            <button type="button" onClick={() => void confirm()} disabled={isConfirming}
              className="mt-4 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-container disabled:opacity-50">
              {isConfirming ? 'Đang xác nhận...' : 'Xác nhận thanh toán thử'}
            </button>
          </> : <p className="mt-5">Đơn này không thể xác nhận thanh toán thử.</p>}
        <Link to={'/orders/' + payment.orderID} className="mt-5 inline-block text-primary underline">Xem đơn hàng</Link>
      </>}
    </div>
  </section>
}
