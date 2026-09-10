import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import type { CartDto } from '../types/cart';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    receiverName: '', receiverPhone: '', shippingAddress: '',
    province: '', district: '', ward: '', note: '',
  });

  useEffect(() => {
    cartService.getCart().then(setCart).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.receiverName || !form.receiverPhone || !form.shippingAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    try {
      setSubmitting(true);
      await orderService.createOrder({
        ...form,
        paymentMethod: 'COD',
      });
      alert('Đặt hàng thành công!');
      navigate('/orders');
    } catch (err: any) {
      alert(err.message || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Đang tải...</div>;
  if (!cart || cart.items.length === 0) {
    return <div className="p-8 text-center text-on-surface-variant">Giỏ hàng trống. Không thể thanh toán.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Thanh toán</h1>
      <div className="grid md:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-on-surface">Thông tin giao hàng</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Tên người nhận *" value={form.receiverName}
              onChange={e => setForm(p => ({ ...p, receiverName: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
            <input type="tel" placeholder="Số điện thoại *" value={form.receiverPhone}
              onChange={e => setForm(p => ({ ...p, receiverPhone: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="Tỉnh/Thành" value={form.province}
                onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <input type="text" placeholder="Quận/Huyện" value={form.district}
                onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <input type="text" placeholder="Phường/Xã" value={form.ward}
                onChange={e => setForm(p => ({ ...p, ward: e.target.value }))}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <input type="text" placeholder="Địa chỉ chi tiết *" value={form.shippingAddress}
              onChange={e => setForm(p => ({ ...p, shippingAddress: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
            <textarea placeholder="Ghi chú (tùy chọn)" value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={3}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <h3 className="font-medium text-on-surface mb-2">Phương thức thanh toán</h3>
            <label className="flex items-center gap-3 p-3 bg-surface-container rounded-lg cursor-pointer">
              <input type="radio" checked readOnly className="accent-primary" />
              <span className="text-on-surface">Thanh toán khi nhận hàng (COD)</span>
            </label>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-primary text-on-primary py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant sticky top-24">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Đơn hàng ({cart.totalItems} sản phẩm)</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.items.map(item => (
                <div key={item.cartItemId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-surface-container rounded-lg flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-sm text-on-surface-variant">image</span></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface line-clamp-1">{item.productName}</p>
                    <p className="text-on-surface-variant">x{item.quantity}</p>
                  </div>
                  <p className="font-medium text-on-surface whitespace-nowrap">{item.subTotal.toLocaleString('vi-VN')}₫</p>
                </div>
              ))}
            </div>
            <hr className="my-3 border-outline-variant" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-on-surface-variant"><span>Tạm tính</span><span>{cart.totalPrice.toLocaleString('vi-VN')}₫</span></div>
              <div className="flex justify-between text-on-surface-variant"><span>Phí vận chuyển</span><span>Miễn phí</span></div>
              <div className="flex justify-between text-lg font-bold text-on-surface pt-2 border-t border-outline-variant">
                <span>Tổng cộng</span><span className="text-primary">{cart.totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
