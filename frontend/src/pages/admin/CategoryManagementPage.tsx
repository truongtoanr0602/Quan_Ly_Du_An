import { useState, useEffect } from 'react';
import type { CategoryDto, CategoryCreateDto, CategoryUpdateDto } from '../../types/category';
import { categoryService } from '../../services/categoryService';
import { ApiError } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CategoryCreateDto>({
    categoryName: '',
    description: '',
    isActive: true,
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: unknown) {
      setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Category request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: CategoryDto) => {
    setFormError(null);
    if (cat) {
      setEditingId(cat.categoryID);
      setFormData({
        categoryName: cat.categoryName,
        description: cat.description ?? '',
        isActive: cat.isActive,
        parentID: cat.parentID,
      });
    } else {
      setEditingId(null);
      setFormData({
        categoryName: '',
        description: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormError(null);
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, formData as CategoryUpdateDto);
      } else {
        await categoryService.create(formData);
      }
      handleCloseModal();
      await fetchCategories();
    } catch (err: unknown) {
      setFormError(err instanceof ApiError || err instanceof Error ? err.message : 'Category save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await categoryService.delete(id);
      await fetchCategories();
    } catch (err: unknown) {
      setLoadError(err instanceof ApiError || err instanceof Error ? err.message : 'Category request failed.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              <span className="text-primary font-medium">Quản lý danh mục</span>
            </div>
            <h2 className="text-3xl font-semibold text-on-surface">Quản lý danh mục</h2>
            {loadError && <div role="alert" className="mt-4 border border-error bg-error-container text-on-error-container rounded-lg p-4 flex items-center justify-between gap-4"><span>{loadError}</span><button type="button" onClick={fetchCategories} className="underline font-medium">Thử lại</button></div>}
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm danh mục mới
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-4 text-sm font-medium text-secondary">ID</th>
                  <th className="p-4 text-sm font-medium text-secondary">Tên danh mục</th>
                  <th className="p-4 text-sm font-medium text-secondary">Mô tả</th>
                  <th className="p-4 text-sm font-medium text-secondary">Trạng thái</th>
                  <th className="p-4 text-sm font-medium text-secondary text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px] font-semibold text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-secondary">Không có dữ liệu</td>
                  </tr>
                ) : categories.map(c => (
                  <tr key={c.categoryID} className="hover:bg-surface-container transition-colors group">
                    <td className="p-4 text-secondary">#{c.categoryID}</td>
                    <td className="p-4 font-medium text-sm">{c.categoryName}</td>
                    <td className="p-4 text-secondary">{c.description || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-error-container text-on-error-container'}`}>
                        {c.isActive ? 'Hoạt động' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button aria-label="Edit category" onClick={() => handleOpenModal(c)} className="text-secondary hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button aria-label="Delete category" onClick={() => handleDelete(c.categoryID)} className="text-secondary hover:text-error transition-colors p-1 ml-2"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal Thêm/Sửa */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 p-4">
            <div role="dialog" aria-modal="true" aria-label="Category editor" className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg flex flex-col">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
                <button onClick={handleCloseModal} className="text-secondary hover:text-error transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {formError && <div role="alert" className="mb-4 border border-error bg-error-container text-on-error-container rounded-lg p-4"><span>{formError}</span></div>}
                <form id="categoryForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Tên danh mục *</label>
                    <input required type="text" value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-on-surface-variant">Mô tả</label>
                    <textarea rows={3} value={formData.description ?? ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-outline-variant rounded focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-on-surface-variant">Cho phép hoạt động</span>
                    </label>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-sm font-medium text-secondary hover:bg-surface-container-low rounded border border-outline-variant transition-colors">Hủy</button>
                <button type="submit" form="categoryForm" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-on-primary bg-primary hover:bg-primary-container disabled:opacity-50 rounded transition-colors shadow-sm">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
