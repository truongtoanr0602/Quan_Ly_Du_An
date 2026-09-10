import { useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../services/profileService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await profileService.forgotPassword(email);
      setToken(result.resetToken);
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 bg-surface-container-low rounded-3xl border border-outline-variant">
        <h1 className="text-2xl font-bold text-on-surface text-center mb-2">Quên mật khẩu</h1>
        {!submitted ? (
          <>
            <p className="text-center text-on-surface-variant mb-6">Nhập email để nhận liên kết đặt lại mật khẩu</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">check_circle</span>
            <p className="text-on-surface-variant mb-4">Yêu cầu đã được gửi! Sử dụng token bên dưới để đặt lại mật khẩu (MVP):</p>
            <code className="block p-3 bg-surface-container rounded-xl text-sm text-on-surface break-all mb-4">{token}</code>
            <Link to={`/reset-password?token=${token}`} className="inline-block bg-primary text-on-primary px-6 py-2 rounded-full font-medium hover:opacity-90">
              Đặt lại mật khẩu
            </Link>
          </div>
        )}
        <p className="text-center text-sm text-on-surface-variant mt-6">
          <Link to="/login" className="text-primary hover:underline">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
