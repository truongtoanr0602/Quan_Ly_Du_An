import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, type Product } from '../services/productService';
import { cartService } from '../services/cartService';
import { useToast } from '../contexts/ToastContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const data = await productService.getProductById(Number(id));
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] flex-col gap-4">
        <span className="material-symbols-outlined text-5xl text-secondary">inventory_2</span>
        <h2 className="text-xl font-medium text-on-surface">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="text-primary hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
        title: 'Chưa đăng nhập',
        actionText: 'Đăng nhập ngay',
        actionPath: '/login'
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await cartService.addItem({
        productId: product.productID,
        quantity,
      });
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 4000);
      toast.success(`Đã thêm ${quantity} x "${product.productName}" vào giỏ hàng!`, {
        title: 'Thành công',
        actionText: 'Xem giỏ hàng',
        actionPath: '/cart'
      });
    } catch (err: any) {
      toast.error(err.message || 'Không thể thêm vào giỏ hàng.', {
        title: 'Lỗi giỏ hàng'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-secondary text-sm font-medium">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
          <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
          <li><Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link></li>
          <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
          <li aria-current="page" className="text-on-surface line-clamp-1">{product.productName}</li>
        </ol>
      </nav>

      {/* Product Core Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Product Images */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-square bg-surface-container-low rounded-xl border border-outline-variant p-8 flex items-center justify-center">
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/600?text=No+Image'} 
              alt={product.productName} 
              className="object-contain w-full h-full mix-blend-multiply" 
            />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6 border-b border-outline-variant pb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-secondary uppercase tracking-wider">{product.brandName || product.categoryName}</span>
              {product.stockQuantity > 0 ? (
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">Còn hàng</span>
              ) : (
                <span className="bg-error-container text-on-error-container text-xs font-medium px-2 py-0.5 rounded">Hết hàng</span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-on-surface leading-tight mb-4">{product.productName}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base font-semibold text-on-surface mb-3">Số lượng</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  readOnly
                  className="w-14 h-10 text-center border-x border-outline-variant bg-transparent font-medium focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <span className="text-sm text-secondary">{product.stockQuantity} sản phẩm có sẵn</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <button 
                disabled={product.stockQuantity <= 0 || isAddingToCart}
                onClick={handleAddToCart}
                className="flex-1 bg-accent hover:bg-accent-hover text-white py-3.5 px-6 rounded-lg font-medium text-base transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
            </div>
            {cartSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  Đã thêm sản phẩm vào giỏ hàng!
                </span>
                <Link to="/cart" className="text-primary font-semibold hover:underline text-xs">
                  Xem giỏ hàng &rarr;
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-outline-variant grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <span>Miễn phí vận chuyển</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span>Bảo hành 12 tháng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Area */}
      <div className="mt-16 md:mt-24 border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
        <div className="flex border-b border-outline-variant">
          <button 
            className={`flex-1 py-4 text-base font-semibold transition-colors ${activeTab === 'desc' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'}`}
            onClick={() => setActiveTab('desc')}
          >
            Mô tả sản phẩm
          </button>
        </div>
        <div className="p-6 md:p-10">
          {activeTab === 'desc' && (
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              {product.description ? (
                <p className="whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p>Chưa có mô tả cho sản phẩm này.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
