import { useEffect, useState } from 'react'
import AddressForm from '../components/AddressForm'
import { addressService } from '../services/addressService'
import type { Address, AddressWriteRequest } from '../types/address'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editing, setEditing] = useState<Address | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setAddresses(await addressService.list())
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the tai dia chi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const create = async (request: AddressWriteRequest) => {
    setIsSubmitting(true)
    try {
      await addressService.create(request)
      setShowCreate(false)
      await load()
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the tao dia chi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const update = async (request: AddressWriteRequest) => {
    if (!editing) return
    setIsSubmitting(true)
    try {
      await addressService.update(editing.addressID, request)
      setEditing(null)
      await load()
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the cap nhat dia chi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const remove = async (addressID: number) => {
    if (!window.confirm('Xoa dia chi nay?')) return
    try {
      await addressService.remove(addressID)
      await load()
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the xoa dia chi.')
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dia chi giao hang</h1>
        <button onClick={() => { setShowCreate(true); setEditing(null) }} className="rounded bg-primary px-4 py-2 text-white">Them dia chi</button>
      </div>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      {showCreate && <AddressForm onSubmit={create} onCancel={() => setShowCreate(false)} submitLabel="Luu dia chi" isSubmitting={isSubmitting} />}
      {editing && <AddressForm initial={editing} onSubmit={update} onCancel={() => setEditing(null)} submitLabel="Cap nhat dia chi" isSubmitting={isSubmitting} />}
      {isLoading ? <p>Dang tai dia chi...</p> : addresses.length === 0 ? (
        <p>Chua co dia chi giao hang.</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.addressID} className="rounded border p-4">
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold">{address.receiverName}</h2>
                {address.isDefault && <span className="rounded bg-primary/10 px-2 text-primary">Mac dinh</span>}
              </div>
              <p>{address.receiverPhone}</p>
              <p>{[address.fullAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}</p>
              <div className="mt-3 flex gap-3">
                <button onClick={() => { setEditing(address); setShowCreate(false) }}>Sua</button>
                <button onClick={() => void remove(address.addressID)} className="text-red-600">Xoa</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
