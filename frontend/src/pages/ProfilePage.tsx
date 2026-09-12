import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import type { ProfileDto } from '../types/admin';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'info' | 'password'>('info');
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    profileService.getProfile()
      .then(data => { setProfile(data); setForm({ fullName: data.fullName, phone: data.phone || '' }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      alert('Cập nhật thành công!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { alert('Mật khẩu xác nhận không khớp!'); return; }
    if (pwForm.newPassword.length < 6) { alert('Mật khẩu mới phải ít nhất 6 ký tự!'); return; }
    try {
      setSaving(true);
      await profileService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      alert('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Đang tải...</div>;
  if (!profile) return <div className="p-8 text-center text-error">Không thể tải thông tin</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Tài khoản của tôi</h1>

      <div className="flex gap-1 mb-6 bg-surface-container-low rounded-full p-1">
        <button onClick={() => setTab('info')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${tab === 'info' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Thông tin cá nhân
        </button>
        <button onClick={() => setTab('password')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${tab === 'password' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Đổi mật khẩu
        </button>
      </div>

      {tab === 'info' ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
            <input type="email" value={profile.email} disabled className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Họ tên</label>
            <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Số điện thoại</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Vai trò</label>
            <input type="text" value={profile.role} disabled className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-primary text-on-primary py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Mật khẩu hiện tại</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Mật khẩu mới</label>
            <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Xác nhận mật khẩu mới</label>
            <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required minLength={6} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-primary text-on-primary py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      )}
    </div>
  );
}
