import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'
import type { Address } from '../types/address'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, refresh } = useCart()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressID, setAddressID] = useState(0)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR'>('COD')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    addressService.list()
      .then((items) => {
        setAddresses(items)
        setAddressID((items.find((item) => item.isDefault) ?? items[0])?.addressID ?? 0)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Khong the tai dia chi.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (!isCartLoading && cart.items.length === 0) return <Navigate to="/cart" replace />

  const submit = async () => {
    if (!addressID || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const order = await orderService.checkout({
        addressID,
        paymentMethod,
        note: note.trim() || undefined,
      })
      navigate('/orders/' + order.orderID)
      void refresh().catch(() => undefined)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the dat hang.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Thanh toan</h1>
        {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
        <h2 className="mb-3 font-semibold">Dia chi giao hang</h2>
        {isLoading ? <p>Dang tai dia chi...</p> : addresses.length === 0 ? (
          <p>Chua co dia chi. <Link className="text-primary" to="/addresses">Them dia chi giao hang</Link></p>
        ) : (
          <div className="grid gap-3">
            {addresses.map((address) => (
              <label key={address.addressID} className="flex cursor-pointer gap-3 rounded border p-4">
                <input type="radio" name="address" value={address.addressID}
                  checked={addressID === address.addressID}
                  onChange={() => setAddressID(address.addressID)} />
                <span><strong>{address.receiverName}</strong> - {address.receiverPhone}<br />{address.fullAddress}</span>
              </label>
            ))}
          </div>
        )}
        <h2 className="mb-3 mt-6 font-semibold">Phuong thuc thanh toan</h2>
        <div className="grid gap-3">
          <label className="flex cursor-pointer gap-3 rounded border p-4">
            <input type="radio" name="paymentMethod" value="COD"
              checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
            <span>Thanh toan khi nhan hang (COD)</span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded border p-4">
            <input type="radio" name="paymentMethod" value="QR"
              checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} />
            <span>Chuyen khoan bang QR</span>
          </label>
        </div>
        {paymentMethod === 'QR' && (
          <div className="mt-3 rounded border border-primary/30 p-4 text-center">
            <p className="font-semibold text-primary">Thanh toan mo phong - khong chuyen tien that</p>
            <img src="/mock-payment-qr.svg" alt="Ma QR thanh toan mo phong"
              className="mx-auto my-3 h-44 w-44 rounded border bg-white p-2" />
            <div className="space-y-1 text-sm">
              <p>Ngan hang: ElectroTech Demo Bank</p>
              <p>So tai khoan: 0000 0000 0000</p>
              <p>Noi dung: ELECTROTECH DEMO</p>
              <p className="font-semibold">So tien: {formatPrice(cart.totalAmount)}</p>
            </div>
            <p className="mt-2 text-xs">Don hang se co trang thai thanh toan dang cho xac nhan.</p>
          </div>
        )}
        <label className="mt-6 block">Ghi chu
          <textarea aria-label="Ghi chu" maxLength={1000} value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-2 block min-h-24 w-full rounded border p-3" />
        </label>
      </div>
      <aside className="h-fit rounded border p-4">
        <h2 className="font-semibold">Don hang</h2>
        <p className="my-3">{cart.totalItems} san pham</p>
        <p className="text-xl font-bold">{formatPrice(cart.totalAmount)}</p>
        <button type="button" onClick={() => void submit()}
          disabled={!addressID || isSubmitting || isLoading}
          className="mt-4 w-full rounded bg-primary px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? 'Dang dat hang...' : 'Dat hang'}
        </button>
      </aside>
    </section>
  )
}
