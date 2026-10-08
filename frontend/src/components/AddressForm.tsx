import { useState, type FormEvent } from 'react'
import type { Address, AddressWriteRequest } from '../types/address'

interface Props {
  initial?: Address
  onSubmit: (request: AddressWriteRequest) => void | Promise<void>
  onCancel?: () => void
  submitLabel: string
  isSubmitting?: boolean
}

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel, isSubmitting = false }: Props) {
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
    <form onSubmit={submit} className="grid gap-3 rounded border p-4">
      <label>Nguoi nhan<input aria-label="Nguoi nhan" required maxLength={100} value={receiverName} onChange={(event) => setReceiverName(event.target.value)} className="block w-full rounded border p-2" /></label>
      <label>So dien thoai<input aria-label="So dien thoai" required maxLength={20} value={receiverPhone} onChange={(event) => setReceiverPhone(event.target.value)} className="block w-full rounded border p-2" /></label>
      <label>Tinh/Thanh<input value={province} maxLength={100} onChange={(event) => setProvince(event.target.value)} className="block w-full rounded border p-2" /></label>
      <label>Quan/Huyen<input value={district} maxLength={100} onChange={(event) => setDistrict(event.target.value)} className="block w-full rounded border p-2" /></label>
      <label>Phuong/Xa<input value={ward} maxLength={100} onChange={(event) => setWard(event.target.value)} className="block w-full rounded border p-2" /></label>
      <label>Dia chi day du<textarea aria-label="Dia chi day du" required maxLength={500} value={fullAddress} onChange={(event) => setFullAddress(event.target.value)} className="block w-full rounded border p-2" /></label>
      <label className="flex gap-2"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />Dat lam mac dinh</label>
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded bg-primary px-4 py-2 text-white">{submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded border px-4 py-2">Huy</button>}
      </div>
    </form>
  )
}
