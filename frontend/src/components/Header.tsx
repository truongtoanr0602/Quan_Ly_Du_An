import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, type UserInfo } from '../services/authService';

export default function Header() {
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 w-full shadow-xs">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 w-full max-w-7xl mx-auto gap-4">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold text-primary tracking-tight flex items-center gap-1.5 flex-shrink-0">
          <span className="material-symbols-outlined text-2xl text-primary">devices</span>
          ElectroTech
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-64 lg:w-72 flex-shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Tìm phụ kiện, sản phẩm..."
          />
        </form>

        {/* Nav Links - Phụ kiện gọn gàng 1 dòng duy nhất */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-sm font-medium">
          <Link
            to="/products"
            className="text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs xl:text-sm"
          >
            Tất cả
          </Link>
          <Link
            to="/products?category=4"
            className="text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs xl:text-sm"
          >
            Chuột & Phím
          </Link>
          <Link
            to="/products?category=5"
            className="text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs xl:text-sm"
          >
            Tai nghe
          </Link>
          <Link
            to="/products?category=6"
            className="text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs xl:text-sm"
          >
            Màn hình
          </Link>
          <Link
            to="/products?category=7"
            className="text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs xl:text-sm"
          >
            Linh kiện PC
          </Link>
          <Link
            to="/products?category=8"
            className="text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs xl:text-sm"
          >
            Cáp sạc
          </Link>
        </nav>

        {/* Trailing Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cart Link */}
          <Link
            to="/cart"
            className="text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95 relative"
            title="Giỏ hàng"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
          </Link>

          {/* User Account / Profile */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-secondary hover:text-primary hover:bg-surface-container-low py-1.5 px-2.5 rounded-full transition-colors active:scale-95"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline text-on-surface max-w-[110px] truncate">
                  {user.fullName || user.email}
                </span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-2 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-outline-variant">
                    <p className="font-semibold text-on-surface truncate">{user.fullName || 'Khách hàng'}</p>
                    <p className="text-xs text-secondary truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full uppercase">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">person</span>
                    Thông tin tài khoản
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">receipt_long</span>
                    Đơn mua của tôi
                  </Link>

                  {user.role === 'Admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-primary font-medium hover:bg-primary/5 transition-colors border-t border-outline-variant mt-1 pt-2"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">admin_panel_settings</span>
                      Trang Quản trị Admin
                    </Link>
                  )}

                  <div className="border-t border-outline-variant mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
