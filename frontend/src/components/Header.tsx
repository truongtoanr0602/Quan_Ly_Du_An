import { Link } from 'react-router-dom';

export default function Header() {
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

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1 rounded">Deals</Link>
          <Link to="/products" className="text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1 rounded">New Arrivals</Link>
          <Link to="/products" className="text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1 rounded">Laptops</Link>
          <Link to="/products" className="text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1 rounded">Components</Link>
          <Link to="/products" className="text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1 rounded">Mobile</Link>
          <Link to="/products" className="text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1 rounded">Peripherals</Link>
        </nav>

        {/* Trailing Icons */}
        <div className="flex items-center gap-4">
          <button className="text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
          <Link to="/login" className="text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
