import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, type Product } from '../services/productService';
import { ApiError } from '../services/apiClient';
import { categoryService } from '../services/categoryService';
import type { CategoryDto } from '../types/category';

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Filters state
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [category, setCategory] = useState<number | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
      if (page !== 1) setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  const fetchCategories = async () => {
    setCategoryError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: unknown) {
      setCategoryError(err instanceof ApiError || err instanceof Error ? err.message : 'Category request failed.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, category, brand, sort, debouncedKeyword, minPrice, maxPrice]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await productService.searchProducts({
        pageNumber: page,
        pageSize: 12,
        keyword: debouncedKeyword || undefined,
        categoryId: category,
        brand: brand,
        minPrice: minPrice !== '' ? minPrice : undefined,
        maxPrice: maxPrice !== '' ? maxPrice : undefined
      });
      // Giả sử API hỗ trợ sort, ta xử lý ở frontend cho đơn giản trong MVP nếu API chưa support sort field.
      let items = res.items;
      if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
      if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
      
      setProducts(items);
      setTotalPages(Math.ceil(res.totalCount / res.pageSize) || 1);
    } catch (err: unknown) {
      setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Không thể tải sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-[--spacing-gutter]">
      {/* Breadcrumb & Page Title */}
      <div className="lg:col-span-12 mb-4">
        <nav className="flex items-center gap-2 text-secondary text-sm font-medium mb-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface">Sản phẩm</span>
        </nav>
        <h1 className="text-3xl font-semibold text-on-surface">Khám phá Sản phẩm</h1>
        {categoryError && (
          <div role="alert" className="border border-error bg-error-container text-on-error-container rounded-lg p-4 mt-4 flex items-center justify-between gap-4">
            <p>{categoryError}</p>
            <button type="button" onClick={fetchCategories} className="underline font-medium">Thử lại</button>
          </div>
        )}
      </div>

      {/* Left Sidebar: Filters */}
      <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-6">
        <section className="border-b border-outline-variant pb-6">
          <h3 className="text-xl font-semibold text-on-surface mb-4">Danh mục</h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <label key={cat.categoryID} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="category"
                  checked={category === cat.categoryID}
                  onChange={() => { setCategory(cat.categoryID); setPage(1); }}
                  className="form-radio text-primary rounded-full border-outline-variant focus:ring-primary focus:ring-opacity-20 w-5 h-5 transition-all" 
                />
                <span className="text-base text-on-surface-variant group-hover:text-on-surface">{cat.categoryName}</span>
              </label>
            ))}
            {category !== undefined && (
              <button onClick={() => { setCategory(undefined); setPage(1); }} className="text-sm text-primary mt-2">Bỏ lọc danh mục</button>
            )}
          </div>
        </section>

        <section className="border-b border-outline-variant pb-6">
          <h3 className="text-xl font-semibold text-on-surface mb-4">Khoảng giá</h3>
          <div className="flex flex-col gap-3">
            <input 
              type="number" 
              placeholder="Thấp nhất (VNĐ)" 
              value={minPrice} 
              onChange={e => { setMinPrice(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
              className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none text-sm"
            />
            <input 
              type="number" 
              placeholder="Cao nhất (VNĐ)" 
              value={maxPrice} 
              onChange={e => { setMaxPrice(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
              className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none text-sm"
            />
          </div>
        </section>

        <section className="pb-6">
          <h3 className="text-xl font-semibold text-on-surface mb-4">Thương hiệu</h3>
          <div className="space-y-3">
            {['Apple', 'ASUS', 'Lenovo', 'Dell', 'Sony'].map((b) => (
              <label key={b} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="brand"
                  checked={brand === b}
                  onChange={() => { setBrand(b); setPage(1); }}
                  className="form-radio text-primary border-outline-variant focus:ring-primary w-5 h-5" 
                />
                <span className="text-base text-on-surface-variant group-hover:text-on-surface">{b}</span>
              </label>
            ))}
            {brand && (
              <button onClick={() => { setBrand(undefined); setPage(1); }} className="text-sm text-primary mt-2">Bỏ lọc thương hiệu</button>
            )}
          </div>
        </section>
      </aside>

      {/* Main Area: Sort & Product Grid */}
      <section className="col-span-1 lg:col-span-9 flex flex-col gap-6">
        
        {/* Search & Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest p-4 rounded-lg border border-outline-variant gap-4">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <span className="text-sm text-secondary whitespace-nowrap">
              Trang {page}/{totalPages}
            </span>
            <label className="text-sm font-medium text-on-surface-variant">Sắp xếp theo:</label>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)} 
              className="text-base bg-surface border border-outline-variant text-on-surface rounded focus:ring-primary focus:border-primary px-3 py-1.5 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : loadError ? (
          <div role="alert" className="border border-error bg-error-container text-on-error-container rounded-lg p-6 flex items-center justify-between gap-4">
            <p>{loadError}</p>
            <button type="button" onClick={fetchProducts} className="underline font-medium">Thử lại</button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-secondary">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">inventory_2</span>
            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[--spacing-gutter]">
            {products.map((p) => (
              <article key={p.productID} className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-outline transition-all duration-300 flex flex-col">
                <Link to={`/products/${p.productID}`} className="w-full aspect-square bg-surface-container-low relative p-4 flex items-center justify-center">
                  <img 
                    src={p.imageUrl || 'https://via.placeholder.com/400?text=No+Image'} 
                    alt={p.productName} 
                    className="object-contain w-full h-full mix-blend-multiply" 
                  />
                  {p.stockQuantity <= 0 && (
                    <div className="absolute top-3 left-3 bg-error-container text-on-error-container text-xs font-medium px-2 py-0.5 rounded-full">
                      Hết hàng
                    </div>
                  )}
                </Link>
                <div className="p-5 flex flex-col flex-grow gap-2">
                  <span className="text-xs font-medium text-secondary uppercase tracking-wider">{p.brandName || p.categoryName}</span>
                  <Link to={`/products/${p.productID}`} className="text-xl font-semibold text-on-surface line-clamp-2 hover:text-primary transition-colors">
                    {p.productName}
                  </Link>
                  <div className="text-[12px] font-semibold text-on-surface-variant flex flex-col gap-1 mt-1">
                    {p.description && <span className="line-clamp-2">{p.description}</span>}
                  </div>
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <span className="text-xl font-semibold text-primary">{formatPrice(p.price)}</span>
                  </div>
                  <button 
                    disabled={p.stockQuantity <= 0}
                    className="mt-4 w-full border border-primary text-primary hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                    Thêm vào giỏ
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-low disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              <button className="w-10 h-10 rounded bg-primary text-on-primary text-sm font-medium flex items-center justify-center">
                {page}
              </button>
              
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
