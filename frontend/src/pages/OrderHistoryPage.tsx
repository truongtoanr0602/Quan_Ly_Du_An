import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { OrderDto } from '../types/order';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipping: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  Pending: 'Chờ xác nhận', Confirmed: 'Đã xác nhận', Shipping: 'Đang giao',
  Delivered: 'Đã giao', Cancelled: 'Đã hủy',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId: number) => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      const updated = await orderService.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.orderId === orderId ? updated : o));
      if (selectedOrder?.orderId === orderId) setSelectedOrder(updated);
      alert('Đã hủy đơn hàng thành công');
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Lịch sử đơn hàng</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">receipt_long</span>
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.orderId} className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-on-surface">Đơn #{order.orderId}</p>
                  <p className="text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[order.orderStatus] || order.orderStatus}
                </span>
              </div>
              <div className="space-y-2 mb-3">
                {order.items.slice(0, 2).map(item => (
                  <div key={item.orderDetailId} className="flex justify-between text-sm">
                    <span className="text-on-surface">{item.productName} x{item.quantity}</span>
                    <span className="text-on-surface-variant">{item.totalPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
                {order.items.length > 2 && <p className="text-xs text-on-surface-variant">...và {order.items.length - 2} sản phẩm khác</p>}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-outline-variant">
                <p className="font-semibold text-on-surface">Tổng: <span className="text-primary">{order.totalAmount.toLocaleString('vi-VN')}₫</span></p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedOrder(selectedOrder?.orderId === order.orderId ? null : order)}
                    className="text-sm text-primary hover:underline">Chi tiết</button>
                  {(order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed') && (
                    <button onClick={() => handleCancel(order.orderId)} className="text-sm text-error hover:underline">Hủy đơn</button>
                  )}
                </div>
              </div>
              {selectedOrder?.orderId === order.orderId && (
                <div className="mt-3 pt-3 border-t border-outline-variant space-y-2 text-sm">
                  <p><strong>Người nhận:</strong> {order.receiverName} - {order.receiverPhone}</p>
                  <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                  <p><strong>Thanh toán:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
                  {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                  <div className="mt-2">
                    <p className="font-medium mb-1">Chi tiết sản phẩm:</p>
                    {order.items.map(item => (
                      <div key={item.orderDetailId} className="flex justify-between py-1">
                        <span>{item.productName} (SKU: {item.sku}) x{item.quantity}</span>
                        <span>{item.unitPrice.toLocaleString('vi-VN')}₫ = {item.totalPrice.toLocaleString('vi-VN')}₫</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
