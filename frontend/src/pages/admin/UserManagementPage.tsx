import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import type { UserListDto } from '../../types/admin';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(page, pageSize, keyword || undefined);
      setUsers(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      alert('Lỗi tải danh sách người dùng: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* Top Header */}
      <header className="flex justify-between items-center h-16 px-4 md:px-8 bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-primary">ElectroTech</Link>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Admin Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">storefront</span>
            Vào cửa hàng
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors opacity-70 hover:opacity-100"
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-outline-variant pb-4">
          <Link to="/admin" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors">
            📊 Tổng quan
          </Link>
          <Link to="/admin/orders" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors">
            📋 Quản lý Đơn hàng
          </Link>
          <Link to="/admin/inventory" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors">
            🏬 Quản lý Tồn kho
          </Link>
          <Link to="/admin/products" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors">
            📦 Quản lý Sản phẩm
          </Link>
          <Link to="/admin/categories" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors">
            📁 Quản lý Danh mục
          </Link>
          <Link to="/admin/users" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm">
            👥 Quản lý Người dùng
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Quản lý Tài khoản (US-1)</h2>
            <p className="text-sm text-secondary">Tổng số {totalCount} tài khoản trong hệ thống</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-secondary flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              Đang tải danh sách người dùng...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase">
                    <th className="p-4">ID</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4 text-center">Vai trò</th>
                    <th className="p-4 text-center">Số đơn hàng</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {users.map((u) => (
                    <tr key={u.userId} className="hover:bg-surface-container-low/50">
                      <td className="p-4 font-mono text-secondary">#{u.userId}</td>
                      <td className="p-4 font-semibold text-on-surface">{u.fullName}</td>
                      <td className="p-4 text-secondary">{u.email}</td>
                      <td className="p-4 text-secondary">{u.phone || '—'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-on-surface">
                        {u.orderCount}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="p-4 text-secondary">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-secondary">Không tìm thấy tài khoản nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-outline-variant">
              <span className="text-xs text-secondary">
                Trang {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 text-xs border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
