import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/apiClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await login({ email, password });
      if (response.user.role === 'Admin') {
        navigate('/admin/products');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant w-full max-w-[420px] p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-primary mb-2">ElectroTech</h1>
          <p className="text-3xl font-semibold text-on-surface">Đăng nhập</p>
          <p className="text-base text-secondary mt-2">Truy cập vào hệ thống quản lý của bạn</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">mail</span>
              <input className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all" id="email" type="email" placeholder="nhapemail@congty.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-on-surface" htmlFor="password">Mật khẩu</label>
              <a className="text-sm font-medium text-primary-container hover:text-primary transition-colors" href="#">Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">lock</span>
              <input className="block w-full pl-10 pr-10 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all" id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <input className="h-4 w-4 border-outline-variant rounded cursor-pointer" id="remember" type="checkbox" />
            <label className="ml-2 text-base text-secondary cursor-pointer" htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>
          <button 
            disabled={isLoading}
            className="w-full py-2.5 rounded shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2" 
            type="submit"
          >
            {isLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : 'Đăng nhập'}
          </button>
          <p className="text-center text-base text-secondary mt-6">Chưa có tài khoản? <Link to="/register" className="text-sm font-medium text-primary-container hover:text-primary transition-colors">Đăng ký ngay</Link></p>
        </form>
      </div>
    </div>
  );
}
