import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { OrderDto } from '../../types/order';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders(page, pageSize, selectedStatus || undefined);
      setOrders(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      alert('Lỗi tải danh sách đơn hàng: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, selectedStatus]);

  const handleOpenDetail = async (orderId: number) => {
    try {
      const order = await orderService.getOrderByIdAdmin(orderId);
      setSelectedOrder(order);
      setNewStatus(order.orderStatus);
      setStatusNote('');
    } catch (err: any) {
      alert('Lỗi xem chi tiết đơn: ' + (err.message || ''));
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      setIsUpdatingStatus(true);
      await orderService.updateOrderStatus(selectedOrder.orderId, newStatus, statusNote);
      alert('Cập nhật trạng thái đơn hàng thành công!');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert('Cập nhật thất bại: ' + (err.message || ''));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

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
          <Link to="/admin/orders" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Quản lý Đơn hàng</h2>
            <p className="text-sm text-secondary">Tổng cộng {totalCount} đơn hàng</p>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary font-medium">Trạng thái:</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-secondary flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              Đang tải danh sách đơn hàng...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase">
                    <th className="p-4">Mã đơn</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Địa chỉ giao</th>
                    <th className="p-4">Tổng tiền</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {orders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-surface-container-low/50">
                      <td className="p-4 font-semibold text-primary">#{ord.orderId}</td>
                      <td className="p-4 font-medium text-on-surface">{ord.receiverName}</td>
                      <td className="p-4 text-secondary">{ord.receiverPhone}</td>
                      <td className="p-4 text-secondary max-w-xs truncate">{ord.shippingAddress}</td>
                      <td className="p-4 font-bold">{formatPrice(ord.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[ord.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-secondary">{new Date(ord.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(ord.orderId)}
                          className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-xs font-medium transition-colors"
                        >
                          Chi tiết / Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-secondary">Không tìm thấy đơn hàng nào</td>
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

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Chi tiết đơn hàng #{selectedOrder.orderId}</h3>
                  <span className="text-xs text-secondary">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-secondary hover:text-on-surface rounded-full"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-surface-container-low p-4 rounded-lg">
                <div>
                  <span className="text-secondary text-xs block">Người nhận</span>
                  <span className="font-semibold text-on-surface">{selectedOrder.receiverName}</span>
                </div>
                <div>
                  <span className="text-secondary text-xs block">Số điện thoại</span>
                  <span className="font-semibold text-on-surface">{selectedOrder.receiverPhone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-secondary text-xs block">Địa chỉ giao nhận</span>
                  <span className="font-medium text-on-surface">{selectedOrder.shippingAddress}</span>
                </div>
                <div>
                  <span className="text-secondary text-xs block">Phương thức thanh toán</span>
                  <span className="font-semibold text-on-surface">{selectedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-secondary text-xs block">Trạng thái thanh toán</span>
                  <span className="font-semibold text-primary">{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-sm text-on-surface mb-2">Danh sách sản phẩm ({(selectedOrder.items || []).length})</h4>
                <div className="divide-y divide-outline-variant border border-outline-variant rounded-lg overflow-hidden text-sm">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.orderDetailId} className="p-3 flex justify-between items-center bg-surface-container-lowest">
                      <div>
                        <p className="font-medium text-on-surface">{item.productName}</p>
                        <span className="text-xs text-secondary font-mono">SKU: {item.sku} | Số lượng: x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-on-surface">{formatPrice(item.totalPrice)}</p>
                        <span className="text-xs text-secondary">{formatPrice(item.unitPrice)} / cái</span>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 flex justify-between items-center bg-surface-container-low font-bold">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-primary text-base">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Update Status Form (US-5) */}
              <div className="border-t border-outline-variant pt-4 space-y-3">
                <h4 className="font-semibold text-sm text-on-surface">Cập nhật trạng thái đơn (US-5)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-secondary block mb-1">Trạng thái mới</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface text-on-surface"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-secondary block mb-1">Ghi chú cập nhật (tuỳ chọn)</label>
                    <input
                      type="text"
                      placeholder="VD: Đã gửi qua ViettelPost..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2 text-sm bg-surface text-on-surface"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-outline-variant text-sm rounded-lg hover:bg-surface-container-low"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus || newStatus === selectedOrder.orderStatus}
                    onClick={handleUpdateStatus}
                    className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Đang lưu...' : 'Lưu trạng thái'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
