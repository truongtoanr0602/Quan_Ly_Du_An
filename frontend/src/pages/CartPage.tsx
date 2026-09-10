import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import type { CartDto } from '../types/cart';

export default function CartPage() {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const data = await cartService.updateItemQuantity(cartItemId, { quantity });
      setCart(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await cartService.removeItem(cartItemId);
      await fetchCart();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Xóa toàn bộ giỏ hàng?')) return;
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Đang tải giỏ hàng...</div>;
  if (error) return <div className="p-8 text-center text-error">{error}</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">shopping_cart</span>
        <h2 className="text-xl font-semibold text-on-surface mb-2">Giỏ hàng trống</h2>
        <p className="text-on-surface-variant mb-4">Hãy thêm sản phẩm vào giỏ hàng</p>
        <Link to="/products" className="inline-block bg-primary text-on-primary px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Giỏ hàng ({cart.totalItems} sản phẩm)</h1>
        <button onClick={handleClearCart} className="text-sm text-error hover:underline">Xóa tất cả</button>
      </div>

      <div className="space-y-4">
        {cart.items.map(item => (
          <div key={item.cartItemId} className="flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
            <div className="w-20 h-20 bg-surface-container rounded-xl flex-shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${item.productId}`} className="font-medium text-on-surface hover:text-primary transition-colors line-clamp-1">
                {item.productName}
              </Link>
              <p className="text-primary font-semibold mt-1">{item.price.toLocaleString('vi-VN')}₫</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high disabled:opacity-40 transition-colors"
                >−</button>
                <span className="w-8 text-center font-medium text-on-surface">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                  disabled={item.quantity >= item.stockQuantity}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high disabled:opacity-40 transition-colors"
                >+</button>
                <span className="text-xs text-on-surface-variant ml-2">Còn {item.stockQuantity}</span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => handleRemoveItem(item.cartItemId)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <p className="font-semibold text-on-surface">{item.subTotal.toLocaleString('vi-VN')}₫</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
        <div className="flex justify-between items-center text-lg font-bold text-on-surface">
          <span>Tổng cộng:</span>
          <span className="text-primary">{cart.totalPrice.toLocaleString('vi-VN')}₫</span>
        </div>
        <Link to="/checkout" className="mt-4 block w-full bg-primary text-on-primary text-center py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
          Tiến hành thanh toán
        </Link>
      </div>
    </div>
  );
}
