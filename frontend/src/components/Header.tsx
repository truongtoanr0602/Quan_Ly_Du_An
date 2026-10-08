import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 w-full">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 w-full max-w-7xl mx-auto">
        {/* Brand & Search */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-primary tracking-tight">
            ElectroTech
          </Link>
          <div className="relative hidden md:block w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Tìm kiếm sản phẩm..."
              type="text"
            />
          </div>
        </div>

  const updateCartCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await cartService.getCart();
      setCartCount(cart.totalItems || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setUser(authService.getCurrentUser());
    updateCartCount();

    const handleCartUpdated = () => {
      updateCartCount();
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
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
    setCartCount(0);
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
            placeholder="Tìm kiếm sản phẩm..."
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
        <div className="flex items-center gap-4">
          <Link to={user ? '/cart' : '/login'} aria-label="Gio hang" className="relative text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cart.totalItems > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{cart.totalItems}</span>
            )}
          </Link>
          {user && <Link to="/orders" aria-label="Don hang" className="text-secondary hover:text-primary p-2 rounded-full">
            <span className="material-symbols-outlined">receipt_long</span>
          </Link>}
          {user ? (
            <button onClick={handleLogout} className="text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95" title="Đăng xuất" aria-label="Đăng xuất">
              <span className="material-symbols-outlined">logout</span>
            </button>
          ) : (
            <Link to="/login" className="text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
