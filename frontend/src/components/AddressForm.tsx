import { useState, type FormEvent } from 'react'
import type { Address, AddressWriteRequest } from '../types/address'

interface Props {
  id?: string
  initial?: Address
  onSubmit: (request: AddressWriteRequest) => void | Promise<void>
  onCancel?: () => void
  submitLabel: string
  isSubmitting?: boolean
  hideActions?: boolean
}

const fieldClass = 'w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none placeholder:text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function AddressForm({ id, initial, onSubmit, onCancel, submitLabel, isSubmitting = false, hideActions = false }: Props) {
  const [receiverName, setReceiverName] = useState(initial?.receiverName ?? '')
  const [receiverPhone, setReceiverPhone] = useState(initial?.receiverPhone ?? '')
  const [province, setProvince] = useState(initial?.province ?? '')
  const [district, setDistrict] = useState(initial?.district ?? '')
  const [ward, setWard] = useState(initial?.ward ?? '')
  const [fullAddress, setFullAddress] = useState(initial?.fullAddress ?? '')
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void onSubmit({
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      province: province.trim() || undefined,
      district: district.trim() || undefined,
      ward: ward.trim() || undefined,
      fullAddress: fullAddress.trim(),
      isDefault,
    })
  }

  return (
    <form id={id} onSubmit={submit} className="grid gap-3">
      <input aria-label="Nguoi nhan" required maxLength={100} placeholder="Tên người nhận *"
        value={receiverName} onChange={(event) => setReceiverName(event.target.value)} className={fieldClass} />
      <input aria-label="So dien thoai" type="tel" required maxLength={20} placeholder="Số điện thoại *"
        value={receiverPhone} onChange={(event) => setReceiverPhone(event.target.value)} className={fieldClass} />
      <div className="grid gap-3 sm:grid-cols-3">
        <input aria-label="Tinh/Thanh" maxLength={100} placeholder="Tỉnh/Thành"
          value={province} onChange={(event) => setProvince(event.target.value)} className={fieldClass} />
        <input aria-label="Quan/Huyen" maxLength={100} placeholder="Quận/Huyện"
          value={district} onChange={(event) => setDistrict(event.target.value)} className={fieldClass} />
        <input aria-label="Phuong/Xa" maxLength={100} placeholder="Phường/Xã"
          value={ward} onChange={(event) => setWard(event.target.value)} className={fieldClass} />
      </div>
      <input aria-label="Dia chi day du" required maxLength={500} placeholder="Địa chỉ chi tiết *"
        value={fullAddress} onChange={(event) => setFullAddress(event.target.value)} className={fieldClass} />
      <label className="flex items-center gap-2 text-sm text-secondary">
        <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
        Đặt làm địa chỉ mặc định
      </label>
      {!hideActions && (
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-container disabled:opacity-50">
            {isSubmitting ? 'Đang lưu...' : submitLabel}
          </button>
          {onCancel && <button type="button" onClick={onCancel} className="rounded-full border border-outline-variant px-5 py-2.5">Hủy</button>}
        </div>
      )}
    </form>
  )
}
