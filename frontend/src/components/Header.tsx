import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { categoryService } from '../services/categoryService'
import type { CategoryDto } from '../types/category'

const featuredCategoryNames = [
  'Cáp sạc & Hub',
  'Chuột & Bàn phím',
  'Laptops',
  'Linh kiện PC',
  'Màn hình máy tính',
]

export default function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const currentCategoryId = location.pathname === '/products'
    ? new URLSearchParams(location.search).get('categoryId')
    : null
  const selectedCategoryPath = categories.some((category) => String(category.categoryID) === currentCategoryId)
    ? `/products?categoryId=${currentCategoryId}`
    : '/products'

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = location.pathname === '/products'
        ? new URLSearchParams(location.search).get('keyword') ?? ''
        : ''
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    let mounted = true
    categoryService.getAll().then((data) => {
      if (mounted) {
        setCategories(featuredCategoryNames.flatMap((name) => {
          const category = data.find((item) =>
            item.isActive && item.categoryName.trim().toLocaleLowerCase('vi-VN') === name.toLocaleLowerCase('vi-VN'))
          return category ? [category] : []
        }))
      }
    }).catch(() => {
      // The catalog page shows the category loading error and offers a retry.
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const keyword = searchInputRef.current?.value.trim() ?? ''
    if (searchInputRef.current) searchInputRef.current.value = keyword
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex w-full max-w-7xl flex-nowrap items-center gap-3 px-4 py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight text-primary">
          <span className="material-symbols-outlined text-xl" aria-hidden="true">devices</span>
          ElectroTech
        </Link>

        <form role="search" onSubmit={handleSearch} className="relative hidden w-36 shrink-0 sm:block md:w-44 xl:w-56">
          <button type="submit" aria-label="Tìm kiếm" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-secondary hover:text-primary">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span>
          </button>
          <input ref={searchInputRef} type="search" aria-label="Tìm kiếm sản phẩm" placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-full border border-outline-variant bg-surface-container-low py-2 pl-9 pr-3 text-sm text-on-surface outline-none placeholder:text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </form>

        <select aria-label="Chọn danh mục sản phẩm" value={selectedCategoryPath}
          onChange={(event) => navigate(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-white px-2 py-1.5 text-xs text-on-surface lg:hidden">
          <option value="/products">Tất cả</option>
          {categories.map((category) => (
            <option key={category.categoryID} value={`/products?categoryId=${category.categoryID}`}>{category.categoryName}</option>
          ))}
        </select>

        <nav aria-label="Danh mục sản phẩm" className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-2 overflow-hidden whitespace-nowrap lg:flex lg:gap-3 xl:gap-4">
          <Link to="/products" className="shrink-0 text-xs font-medium text-on-surface-variant hover:text-primary">Tất cả</Link>
          {categories.map((category, index) => (
            <Link key={category.categoryID} to={`/products?categoryId=${category.categoryID}`}
              className={`${index < 3 ? 'hidden lg:inline' : 'hidden xl:inline'} shrink-0 text-xs font-medium text-on-surface-variant hover:text-primary`}>
              {category.categoryName}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user?.role === 'Customer' ? (
            <Link to="/cart" aria-label="Giỏ hàng" className="relative rounded-full p-2 text-secondary hover:bg-surface-container-low hover:text-primary">
              <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
              {cart.totalItems > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1.5 text-[10px] text-white">{cart.totalItems}</span>}
            </Link>
          ) : user?.role === 'Admin' ? (
            <span aria-label="Giỏ hàng chỉ dành cho khách hàng" className="p-2 text-secondary">
              <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
            </span>
          ) : (
            <Link to="/login" aria-label="Giỏ hàng" className="rounded-full p-2 text-secondary hover:text-primary">
              <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
            </Link>
          )}

          {user ? (
            <div ref={menuRef} className="relative">
              <button type="button" aria-label="Tài khoản" aria-expanded={menuOpen} aria-controls="account-menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full px-1.5 py-1 text-sm text-on-surface hover:bg-surface-container-low">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-xs font-bold text-primary">
                  {user.fullName.trim().charAt(0).toLocaleUpperCase('vi-VN') || 'U'}
                </span>
                <span className="hidden max-w-24 truncate sm:block">{user.fullName}</span>
                <span className="material-symbols-outlined text-base" aria-hidden="true">expand_more</span>
              </button>
              {menuOpen && (
                <div id="account-menu" className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl">
                  <div className="border-b border-outline-variant px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.fullName}</p>
                    <p className="truncate text-xs text-secondary">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-primary-fixed px-2 py-0.5 text-[10px] font-semibold text-primary">{user.role.toUpperCase()}</span>
                  </div>
                  {user.role === 'Customer' && (
                    <div className="border-b border-outline-variant py-1">
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-container-low">
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">person</span>Thông tin tài khoản
                      </Link>
                      <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-container-low">
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">receipt_long</span>Đơn mua của tôi
                      </Link>
                    </div>
                  )}
                  {user.role === 'Admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 border-b border-outline-variant px-4 py-2 text-sm text-primary hover:bg-surface-container-low">
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">admin_panel_settings</span>Trang Quản trị Admin
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-error hover:bg-surface-container-low">
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">logout</span>Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" aria-label="Đăng nhập" className="rounded-full p-2 text-secondary hover:text-primary">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
