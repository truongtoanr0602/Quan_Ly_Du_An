import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AddressForm from '../components/AddressForm'
import { useCart } from '../contexts/CartContext'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'
import type { Address, AddressWriteRequest } from '../types/address'
import type { CheckoutRequest } from '../types/order'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, refresh } = useCart()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressID, setAddressID] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<CheckoutRequest['paymentMethod']>('COD')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    addressService.list()
      .then((items) => {
        setAddresses(items)
        setAddressID((items.find((item) => item.isDefault) ?? items[0])?.addressID ?? 0)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải địa chỉ.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (!isCartLoading && cart.items.length === 0) return <Navigate to="/cart" replace />

  const completeOrder = async (selectedAddressID: number) => {
    const order = await orderService.checkout({
      addressID: selectedAddressID,
      paymentMethod,
      note: note.trim() || undefined,
    })
    navigate('/orders/' + order.orderID, { state: { justPlaced: true } })
    void refresh().catch(() => undefined)
  }

  const submitExisting = async () => {
    if (!addressID || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await completeOrder(addressID)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể đặt hàng.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const createAndSubmit = async (request: AddressWriteRequest) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const created = await addressService.create(request)
      setAddresses((items) => [...items, created])
      setAddressID(created.addressID)
      setShowCreate(false)
      await completeOrder(created.addressID)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể lưu địa chỉ hoặc đặt hàng.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCreatingAddress = !isLoading && (showCreate || addresses.length === 0)

  return (
    <section className="mx-auto w-full max-w-5xl py-4 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold text-on-surface">Thanh toán</h1>
      {error && <p role="alert" className="mb-5 rounded-xl bg-error-container p-3 text-on-error-container">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="min-w-0">
          <h2 className="mb-3 text-lg font-semibold">Thông tin giao hàng</h2>
          {isLoading ? <p>Đang tải địa chỉ...</p> : (
            <>
              {addresses.length > 0 && (
                <div className="mb-4 space-y-2">
                  {addresses.map((address) => (
                    <label key={address.addressID} className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3 has-[:checked]:border-primary">
                      <input type="radio" name="address" value={address.addressID} checked={addressID === address.addressID && !showCreate}
                        onChange={() => { setAddressID(address.addressID); setShowCreate(false) }} className="mt-1 accent-primary" />
                      <span className="text-sm">
                        <strong>{address.receiverName}</strong> · {address.receiverPhone}
                        {address.isDefault && <span className="ml-2 text-primary">Mặc định</span>}
                        <br />{[address.fullAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}
                      </span>
                    </label>
                  ))}
                  <button type="button" onClick={() => setShowCreate((current) => !current)} className="text-sm font-semibold text-primary hover:underline">
                    {showCreate ? 'Dùng địa chỉ đã lưu' : '+ Nhập địa chỉ mới'}
                  </button>
                </div>
              )}
              {isCreatingAddress && (
                <AddressForm id="checkout-address-form" onSubmit={createAndSubmit} submitLabel="Đặt hàng"
                  isSubmitting={isSubmitting} hideActions />
              )}
            </>
          )}

          <label className="mt-5 block">
            <span className="sr-only">Ghi chú</span>
            <textarea aria-label="Ghi chú" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)}
              placeholder="Ghi chú (tùy chọn)"
              className="min-h-24 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 outline-none placeholder:text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </label>

          <fieldset className="mt-5 rounded-xl border border-outline-variant bg-surface-container-low p-4">
            <legend className="sr-only">Phương thức thanh toán</legend>
            <h2 className="mb-2 font-semibold">Phương thức thanh toán</h2>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-surface-container px-3 py-3">
              <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')} className="accent-primary" />
              <span>Thanh toán khi nhận hàng (COD)</span>
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg bg-surface-container px-3 py-3">
              <input type="radio" name="paymentMethod" value="QR" checked={paymentMethod === 'QR'}
                onChange={() => setPaymentMethod('QR')} className="accent-primary" />
              <span>QR mô phỏng</span>
            </label>
            {paymentMethod === 'QR' && (
              <div className="mt-3 rounded-lg border border-primary/30 bg-white p-4 text-center">
                <p className="font-semibold text-primary">Thanh toán mô phỏng – không chuyển tiền thật</p>
                <p className="mt-2 text-sm text-secondary">Mã QR sẽ được tạo sau khi đơn hàng được lưu. Số tiền và nội dung chuyển khoản sẽ lấy từ hóa đơn trên máy chủ.</p>
              </div>
            )}
          </fieldset>

          <button type={isCreatingAddress ? 'submit' : 'button'} form={isCreatingAddress ? 'checkout-address-form' : undefined}
            onClick={isCreatingAddress ? undefined : () => void submitExisting()}
            disabled={isSubmitting || isLoading || isCartLoading || (!isCreatingAddress && !addressID)}
            className="mt-4 w-full rounded-full bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-container disabled:opacity-50">
            {isSubmitting ? 'Đang đặt hàng...' : paymentMethod === 'QR' ? 'Tạo đơn và lấy mã QR' : 'Đặt hàng'}
          </button>
        </div>

        <aside className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold">Đơn hàng ({cart.totalItems} sản phẩm)</h2>
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li key={item.productID} className="flex items-center gap-3 text-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                  {item.imageURL ? <img src={item.imageURL} alt="" className="h-full w-full object-contain" />
                    : <span className="material-symbols-outlined text-secondary" aria-hidden="true">inventory_2</span>}
                </div>
                <div className="min-w-0 flex-1"><p className="line-clamp-2">{item.productName}</p><p className="text-xs text-secondary">x{item.quantity}</p></div>
                <span className="font-medium whitespace-nowrap">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-outline-variant pt-4 text-sm">
            <div className="flex justify-between gap-3"><span>Tạm tính</span><span>{formatPrice(cart.totalAmount)}</span></div>
            <div className="flex justify-between gap-3"><span>Phí vận chuyển</span><span>Miễn phí</span></div>
          </div>
          <div className="mt-4 flex justify-between gap-3 border-t border-outline-variant pt-4 font-bold">
            <span>Tổng cộng</span><span className="text-primary">{formatPrice(cart.totalAmount)}</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
