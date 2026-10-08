import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { alert('Mật khẩu xác nhận không khớp!'); return; }
    if (newPassword.length < 6) { alert('Mật khẩu phải ít nhất 6 ký tự!'); return; }
    try {
      setLoading(true);
      await profileService.resetPassword(token, newPassword);
      alert('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 bg-surface-container-low rounded-3xl border border-outline-variant">
        <h1 className="text-2xl font-bold text-on-surface text-center mb-2">Đặt lại mật khẩu</h1>
        <p className="text-center text-on-surface-variant mb-6">Nhập mật khẩu mới</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="Mật khẩu mới" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required minLength={6} />
          <input type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required minLength={6} />
          <button type="submit" disabled={loading || !token}
            className="w-full bg-primary text-on-primary py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
        <p className="text-center text-sm text-on-surface-variant mt-6">
          <Link to="/login" className="text-primary hover:underline">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
