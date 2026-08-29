import { useState, useEffect } from 'react';
import { productService, type Product, type ProductCreateRequest, type ProductUpdateRequest } from '../../services/productService';
import { ApiError } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { categoryService } from '../../services/categoryService';
import type { CategoryDto } from '../../types/category';
import { useNavigate } from 'react-router-dom';

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [keyword, setKeyword] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductCreateRequest & { isActive?: boolean }>({
    productName: '',
    sku: '',
    categoryID: 0,
    brandID: 1, // Defaulting to 1 for MVP
    price: 0,
    stockQuantity: 0,
    description: '',
    imageUrl: '',
    isActive: true
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [page, keyword]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, categoryID: cats[0].categoryID }));
        }
      } catch (err: unknown) {
        setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Category request failed.');
      }
    };
    fetchCats();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await productService.searchProducts({
        pageNumber: page,
        pageSize: 10,
        keyword: keyword || undefined
      });
      setProducts(res.items);
      setTotalPages(Math.ceil(res.totalCount / res.pageSize) || 1);
      setTotalCount(res.totalCount);
    } catch (err: unknown) {
      setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Product request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productService.deleteProduct(id);
      await fetchProducts(); // Reload sau khi xóa
    } catch (err: unknown) {
      setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Product delete failed.');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.productID);
      setFormData({
        productName: product.productName,
        sku: product.sku,
        categoryID: product.categoryID,
        brandID: product.brandID,
        price: product.price,
        stockQuantity: product.stockQuantity,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        productName: '',
        sku: '',
        categoryID: categories.length > 0 ? categories[0].categoryID : 0,
        brandID: 1,
        price: 0,
        stockQuantity: 0,
        description: '',
        imageUrl: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData as ProductUpdateRequest);
      } else {
        await productService.createProduct(formData);
      }
      handleCloseModal();
      fetchProducts();
    } catch (err: unknown) {
      setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Product save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-surface">
      {/* TopNavBar */}
      <header className="hidden md:flex justify-end items-center h-16 px-[--spacing-gutter] w-full bg-surface-container-lowest border-b border-outline-variant shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant bg-primary text-white flex items-center justify-center font-bold">
            A
          </div>
          <button aria-label="Log out" onClick={handleLogout} className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors opacity-70 hover:opacity-100" title="Đăng xuất">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-4 md:p-8 flex-1 w-full max-w-[--spacing-max-width] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center text-sm text-secondary mb-2">
              <span>Admin</span>
              <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
              <span className="text-primary font-medium">Quản lý sản phẩm</span>
            </div>
            <h2 className="text-3xl font-semibold text-on-surface">Quản lý sản phẩm</h2>
            {loadError && <div role="alert" className="mt-4 border border-error bg-error-container text-on-error-container rounded-lg p-4 flex items-center justify-between gap-4"><span>{loadError}</span><button type="button" onClick={fetchProducts} className="underline font-medium">Thử lại</button></div>}
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm sản phẩm mới
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-base focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-medium text-secondary">Hình ảnh</th>
                  <th className="p-4 text-sm font-medium text-secondary">Tên sản phẩm</th>
                  <th className="p-4 text-sm font-medium text-secondary">Danh mục</th>
                  <th className="p-4 text-sm font-medium text-secondary">Giá (VND)</th>
                  <th className="p-4 text-sm font-medium text-secondary">Tồn kho</th>
                  <th className="p-4 text-sm font-medium text-secondary">Trạng thái</th>
                  <th className="p-4 text-sm font-medium text-secondary text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px] font-semibold text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-secondary">Không có dữ liệu</td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.productID} className="hover:bg-surface-container transition-colors group">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded bg-surface border border-outline-variant flex items-center justify-center overflow-hidden">
                        <img src={p.imageUrl || 'https://via.placeholder.com/150'} alt={p.productName} className="object-cover w-full h-full mix-blend-multiply" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm line-clamp-2">{p.productName}</div>
                      <div className="text-secondary font-normal mt-1">{p.brandName}</div>
                    </td>
                    <td className="p-4">{p.categoryName}</td>
                    <td className="p-4">{formatPrice(p.price)}</td>
                    <td className="p-4">{p.stockQuantity}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${p.stockQuantity > 0 ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-error-container text-on-error-container'}`}>
                        {p.stockQuantity > 0 ? 'Còn bán' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button aria-label="Edit product" onClick={() => handleOpenModal(p)} className="text-secondary hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button aria-label="Delete product" onClick={() => handleDelete(p.productID)} className="text-secondary hover:text-error transition-colors p-1 ml-2"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="bg-surface-container-lowest px-4 py-3 border-t border-outline-variant flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-base text-secondary">
                    Tổng cộng <span className="font-medium text-on-surface">{totalCount}</span> sản phẩm (Trang {page}/{totalPages})
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-outline-variant bg-surface-container-lowest text-sm font-medium text-secondary hover:bg-surface-container-low disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="z-10 bg-primary-fixed border-primary-fixed text-on-primary-fixed relative inline-flex items-center px-4 py-2 border text-sm font-medium">{page}</button>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-outline-variant bg-surface-container-lowest text-sm font-medium text-secondary hover:bg-surface-container-low disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modal Thêm/Sửa */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 p-4">
            <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                <button onClick={handleCloseModal} className="text-secondary hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Tên sản phẩm *</label>
                    <input required type="text" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Mã SKU *</label>
                    <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Danh mục *</label>
                    <select required value={formData.categoryID} onChange={e => setFormData({...formData, categoryID: Number(e.target.value)})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none">
                      {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Mã Thương hiệu (BrandID) *</label>
                    <input required type="number" min="1" value={formData.brandID} onChange={e => setFormData({...formData, brandID: Number(e.target.value)})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Giá (VNĐ) *</label>
                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Tồn kho *</label>
                    <input required type="number" min="0" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-on-surface-variant">Link Hình ảnh (URL)</label>
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" placeholder="https://..." />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-on-surface-variant">Mô tả sản phẩm</label>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  {editingId && (
                    <div className="space-y-1 md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-on-surface-variant">Đang mở bán (Kích hoạt)</span>
                      </label><span className="text-sm text-secondary">{formData.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  )}
                </form>
              </div>
              <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-sm font-medium text-secondary hover:bg-surface-container-low rounded border border-outline-variant transition-colors">Hủy</button>
                <button type="submit" form="productForm" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-on-primary bg-primary hover:bg-primary-container disabled:opacity-50 rounded transition-colors shadow-sm">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
