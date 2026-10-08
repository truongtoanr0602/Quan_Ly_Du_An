import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import type { DashboardSummaryDto, RevenueSummaryDto, TopProductDto } from '../../types/admin';
import type { OrderDto } from '../../types/order';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummaryDto | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductDto[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumData, revData, topData, ordData] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getRevenue(),
        adminService.getTopProducts(5),
        orderService.getAllOrders(1, 5),
      ]);
      setSummary(sumData);
      setRevenue(revData);
      setTopProducts(topData);
      setRecentOrders(ordData.items);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Processing: 'bg-purple-100 text-purple-800',
    Shipped: 'bg-indigo-100 text-indigo-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
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
          <Link to="/admin" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm">
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
          <Link to="/admin/users" className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors">
            👥 Quản lý Người dùng
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container p-4 rounded-lg">{error}</div>
        ) : (
          <>
            {/* KPI Cards (US-1, US-6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Doanh thu tích lũy</span>
                  <span className="material-symbols-outlined p-2 bg-green-50 text-green-600 rounded-lg text-xl">payments</span>
                </div>
                <div className="text-2xl font-bold text-on-surface mt-2">
                  {formatPrice(summary?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-secondary mt-1">Từ các đơn hàng đã thanh toán & hoàn tất</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Tổng số đơn hàng</span>
                  <span className="material-symbols-outlined p-2 bg-blue-50 text-blue-600 rounded-lg text-xl">receipt_long</span>
                </div>
                <div className="text-2xl font-bold text-on-surface mt-2">
                  {summary?.totalOrders ?? 0}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-600 font-semibold">{summary?.pendingOrders ?? 0} chờ xử lý</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Khách hàng</span>
                  <span className="material-symbols-outlined p-2 bg-purple-50 text-purple-600 rounded-lg text-xl">people</span>
                </div>
                <div className="text-2xl font-bold text-on-surface mt-2">
                  {summary?.totalCustomers ?? 0}
                </div>
                <p className="text-xs text-secondary mt-1">Tài khoản khách mua sắm</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Cảnh báo tồn kho</span>
                  <span className="material-symbols-outlined p-2 bg-red-50 text-red-600 rounded-lg text-xl">warning</span>
                </div>
                <div className="text-2xl font-bold text-red-600 mt-2">
                  {summary?.lowStockProducts ?? 0}
                </div>
                <p className="text-xs text-secondary mt-1">Sản phẩm có tồn kho &le; 10</p>
              </div>
            </div>

            {/* Middle Section: Top Products + Daily Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products (US-6) */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">leaderboard</span>
                    Top 5 Sản phẩm bán chạy
                  </h3>
                </div>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-secondary py-6 text-center">Chưa có dữ liệu bán hàng</p>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {topProducts.map((p, idx) => (
                      <div key={p.productId} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-bold text-secondary">{idx + 1}</span>
                          <div>
                            <p className="font-medium text-sm text-on-surface line-clamp-1">{p.productName}</p>
                            <span className="text-xs text-secondary">Đã bán: {p.totalQuantitySold} cái</span>
                          </div>
                        </div>
                        <span className="font-semibold text-sm text-primary">{formatPrice(p.totalRevenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Revenue Trend / Daily Breakdown (US-6) */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Doanh thu theo ngày gần nhất
                  </h3>
                </div>
                {revenue?.dailyRevenue.length === 0 ? (
                  <p className="text-sm text-secondary py-6 text-center">Chưa có giao dịch doanh thu</p>
                ) : (
                  <div className="space-y-3">
                    {revenue?.dailyRevenue.slice(-7).map((d) => (
                      <div key={d.date} className="flex justify-between items-center text-sm p-2 rounded hover:bg-surface-container-low">
                        <span className="text-secondary font-mono">{d.date}</span>
                        <div className="text-right">
                          <span className="font-bold text-on-surface mr-3">{formatPrice(d.revenue)}</span>
                          <span className="text-xs text-secondary">({d.orderCount} đơn)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders (US-1, US-5) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  Đơn hàng gần đây
                </h3>
                <Link to="/admin/orders" className="text-sm text-primary hover:underline font-medium">
                  Xem tất cả đơn hàng &rarr;
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase">
                      <th className="p-3">Mã đơn</th>
                      <th className="p-3">Khách hàng</th>
                      <th className="p-3">Số điện thoại</th>
                      <th className="p-3">Tổng tiền</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {recentOrders.map((ord) => (
                      <tr key={ord.orderId} className="hover:bg-surface-container-low/50">
                        <td className="p-3 font-semibold text-primary">#{ord.orderId}</td>
                        <td className="p-3 font-medium text-on-surface">{ord.receiverName}</td>
                        <td className="p-3 text-secondary">{ord.receiverPhone}</td>
                        <td className="p-3 font-semibold">{formatPrice(ord.totalAmount)}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[ord.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 text-secondary">{new Date(ord.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-secondary">Không có đơn hàng nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
