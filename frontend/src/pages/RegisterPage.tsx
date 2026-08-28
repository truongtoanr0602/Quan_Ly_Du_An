import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-primary mb-2">ElectroTech</h1>
          <h2 className="text-3xl font-semibold text-on-surface">Tạo tài khoản</h2>
          <p className="text-base text-secondary mt-2">Đăng ký để trải nghiệm dịch vụ của chúng tôi.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="fullName">Họ và tên</label>
            <input className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base text-on-surface" id="fullName" name="fullName" placeholder="Nguyễn Văn A" required value={form.fullName} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="email">Email</label>
            <input className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base text-on-surface" id="email" name="email" type="email" placeholder="name@example.com" required value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="phone">Số điện thoại</label>
            <input className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base text-on-surface" id="phone" name="phone" type="tel" placeholder="0912345678" required value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="password">Mật khẩu</label>
            <div className="relative">
              <input className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base text-on-surface" id="password" name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={form.password} onChange={handleChange} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base text-on-surface" id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required value={form.confirmPassword} onChange={handleChange} />
          </div>
          <div className="flex items-center">
            <input className="h-4 w-4 border-outline-variant rounded" id="terms" type="checkbox" required />
            <label className="ml-2 text-base text-secondary" htmlFor="terms">
              Tôi đồng ý với <a className="text-primary hover:underline" href="#">Điều khoản</a> và <a className="text-primary hover:underline" href="#">Chính sách bảo mật</a>
            </label>
          </div>
          <button 
            disabled={isLoading}
            className="w-full bg-accent text-white text-sm font-medium py-3 rounded hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2" 
            type="submit"
          >
            {isLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : 'Đăng ký'}
          </button>
        </form>
        <p className="mt-6 text-center text-base text-secondary">Đã có tài khoản? <Link to="/login" className="text-sm font-medium text-primary hover:underline ml-1">Đăng nhập ngay</Link></p>
      </main>
    </div>
  );
}
