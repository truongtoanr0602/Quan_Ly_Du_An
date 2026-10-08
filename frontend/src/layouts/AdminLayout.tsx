import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/admin', label: '📊 Tổng quan', end: true },
  { to: '/admin/orders', label: '📋 Quản lý Đơn hàng' },
  { to: '/admin/inventory', label: '🏬 Quản lý Tồn kho' },
  { to: '/admin/products', label: '📦 Quản lý Sản phẩm' },
  { to: '/admin/categories', label: '📁 Quản lý Danh mục' },
  { to: '/admin/users', label: '👥 Quản lý Người dùng' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return <div className="min-h-screen bg-surface">
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 shadow-sm md:px-8">
      <div className="flex items-center gap-6">
        <Link to="/admin" className="text-xl font-bold text-primary">ElectroTech</Link>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">Admin Portal</span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1 text-sm text-secondary hover:text-primary">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">storefront</span>Vào cửa hàng
        </Link>
        <button type="button" onClick={handleLogout} aria-label="Đăng xuất" className="rounded-full p-2 text-secondary hover:bg-surface-container-low">
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
        </button>
      </div>
    </header>
    <nav aria-label="Điều hướng quản trị" className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 border-b border-outline-variant px-4 pb-4 pt-6 sm:px-6 lg:px-8">
      {links.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) =>
        `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`
      }>{label}</NavLink>)}
    </nav>
    <Outlet />
  </div>
}
