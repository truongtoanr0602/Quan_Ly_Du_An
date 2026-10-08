import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { profileService, type Profile } from '../services/profileService'

export default function ProfilePage() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarURL, setAvatarURL] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    profileService.get()
      .then((result) => {
        if (!active) return
        setProfile(result)
        setFullName(result.fullName)
        setPhone(result.phone ?? '')
        setAvatarURL(result.avatarURL ?? '')
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Khong the tai ho so.')
      })
    return () => { active = false }
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)
    try {
      const updated = await profileService.update({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarURL: avatarURL.trim() || undefined,
      })
      setProfile(updated)
      setFullName(updated.fullName)
      setPhone(updated.phone ?? '')
      setAvatarURL(updated.avatarURL ?? '')
      updateUser({ id: updated.userID, email: updated.email, fullName: updated.fullName, role: 'Customer' })
      setSuccess('Cap nhat ho so thanh cong.')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Khong the cap nhat ho so.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!profile && !error) return <p>Dang tai ho so...</p>

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Ho so ca nhan</h1>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-700">{success}</p>}
      {profile && (
        <form onSubmit={submit} className="grid gap-4">
          <label>Email
            <input value={profile.email} disabled className="mt-1 w-full rounded border p-2" />
          </label>
          <label>Ho ten
            <input aria-label="Ho ten" required maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1 w-full rounded border p-2" />
          </label>
          <label>So dien thoai
            <input value={phone} maxLength={20} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded border p-2" />
          </label>
          <label>Avatar URL
            <input value={avatarURL} maxLength={500} onChange={(event) => setAvatarURL(event.target.value)} className="mt-1 w-full rounded border p-2" />
          </label>
          <button type="submit" disabled={isSaving || fullName.trim().length === 0} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50">
            {isSaving ? 'Dang luu...' : 'Luu thay doi'}
          </button>
        </form>
      )}
    </section>
  )
}
