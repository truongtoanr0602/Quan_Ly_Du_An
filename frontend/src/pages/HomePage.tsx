import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { useToast } from '../contexts/ToastContext';

interface ProductItem {
  id: number;
  name: string;
  specs: string[];
  price: string;
  oldPrice?: string;
  badge: string;
  badgeColor?: 'primary' | 'error' | 'surface';
  img: string;
  disabled?: boolean;
}

export default function HomePage() {
  const toast = useToast();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [dbImages, setDbImages] = useState<Record<number, string>>({});

  useEffect(() => {
    productService.searchProducts({ pageNumber: 1, pageSize: 50 })
      .then(res => {
        const imgMap: Record<number, string> = {};
        res.items.forEach(p => {
          if (p.imageUrl) {
            imgMap[p.productID] = p.imageUrl;
          }
        });
        setDbImages(imgMap);
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = async (product: ProductItem) => {
    if (product.disabled) return;
    if (!authService.getCurrentUser()) {
      toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
        title: 'Chưa đăng nhập',
        actionText: 'Đăng nhập ngay',
        actionPath: '/login'
      });
      return;
    }

    try {
      setAddingId(product.id);
      await cartService.addItem({ productId: product.id, quantity: 1 });
      window.dispatchEvent(new CustomEvent('cart-updated'));
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        title: 'Thành công',
        actionText: 'Xem giỏ hàng',
        actionPath: '/cart'
      });
    } catch (err: any) {
      toast.error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng.', {
        title: 'Lỗi giỏ hàng'
      });
    } finally {
      setAddingId(null);
    }
  };

  // Group 1: Laptops & Thiết bị cao cấp
  const laptopAndMobiles: ProductItem[] = [
    {
      id: 2,
      name: 'MacBook Pro 14" M3 Pro',
      specs: ['Chip M3 Pro 11-core CPU', '18GB Unified Memory', '512GB SSD'],
      price: '49.990.000₫',
      oldPrice: '52.990.000₫',
      badge: 'Bán chạy',
      badgeColor: 'primary',
      img: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR0ybwvZLFCfi-gp1FrKXbzbv1r0yaeIFoDj82QfwO1fN5OJsx9EKIJXyKmgn5S2xruEYy8nGwj7B4kGGWiYnq2BkxxTYTmzgZeeKmeWJI3Wfk3qInwd4yPq9yXs8tBbDPiH9b5YQ&usqp=CAc'
    },
    {
      id: 1,
      name: 'Asus ROG Zephyrus G14 OLED',
      specs: ['AMD Ryzen 9 8945HS', 'RTX 4060 8GB', '3K OLED 120Hz'],
      price: '42.590.000₫',
      badge: 'Gaming đỉnh',
      badgeColor: 'primary',
      img: 'https://bizweb.dktcdn.net/100/512/769/products/legion-5-15imh05h-2020.jpg?v=1718703360580'
    },
    {
      id: 3,
      name: 'Lenovo Legion 5 Gaming',
      specs: ['Intel Core i7-13700H', 'RTX 4050 6GB', 'Màn hình 165Hz'],
      price: '25.550.000₫',
      oldPrice: '27.990.000₫',
      badge: 'Ưu đãi hot',
      badgeColor: 'error',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRjqsLklosNlEAzAwrTeO5dFRBQU2Jc1QCKk1d8Q7lkg&s=10'
    },
    {
      id: 10,
      name: 'iPhone 15 Pro Max 256GB',
      specs: ['Khung viền Titan siêu nhẹ', 'Chip A17 Pro mạnh mẽ', 'Camera Zoom 5x quang học'],
      price: '20.000.000₫',
      oldPrice: '22.500.000₫',
      badge: 'Giảm 11%',
      badgeColor: 'error',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQagO-Cg7xOrz3x75Pwv5XRrhO-hv2Cg-sKRx8iZCQf7Q&s=10'
    },
  ];

  // Group 2: Phụ kiện & Âm thanh
  const accessoriesAndAudio: ProductItem[] = [
    {
      id: 11,
      name: 'Chuột Gaming Logitech G Pro X Superlight 2',
      specs: ['Trọng lượng siêu nhẹ <60g', 'Cảm biến HERO 2 32K DPI', 'Switch quang học LIGHTFORCE'],
      price: '3.290.000₫',
      oldPrice: '3.690.000₫',
      badge: 'Hot phụ kiện',
      badgeColor: 'primary',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbfTmrP8ACkft0Sfg7TxlzAWaiJa5mqPTBipOb0BXeOv_l-zcPKEmUFakcZW8YJlB-3hURl6cMrxTkKN_11QRYw9mpTk-dXx5bQ8214Y29pcQP0mHu9BqmQCPS0_vOksBbp0AAiItTZexo1xOWcMOU3nObOZf8wBt0oao0SFhFDZZQlACDPFDwn-_ofQV4IR8zbopPMt5CHMPrjSTgRbvcHjSyRoNLpyv3i6GDk-n4T05bAXJWXGt'
    },
    {
      id: 12,
      name: 'Tai nghe Sony WH-1000XM5 Chống Ồn',
      specs: ['Chống ồn chủ động đỉnh cao ANC', 'Âm thanh Hi-Res LDAC', 'Thời lượng pin tới 30 giờ'],
      price: '7.990.000₫',
      badge: 'Âm thanh Hi-Res',
      badgeColor: 'primary',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ8ZHFUTuWewzL3H1Lv-akvwJLYaEkFSV7IT5xqGvIYz3iG5C6OJ6exbfh654P2V4-a8PlCDcVlXCaSxdWFZ_7COxawatTO1kVmexV-jfZa6FLCslXHkG3T743FUpJK95BmldjrGs-EYDhEXcv1ui6jDah7RjwhdNx4SljrIomEhb0mBRh3-4jhHIVLRaYyIE79RGtBbcnFbelHXNjvfTD4H6fqUldVYHhtvcGe2iz0YTQoz2RQXgd'
    },
    {
      id: 14,
      name: 'Bàn phím cơ không dây Logitech MX Mechanical',
      specs: ['Phím cơ Low-profile êm ái', 'Đèn nền thông minh cảm biến', 'Kết nối 3 thiết bị cùng lúc'],
      price: '3.590.000₫',
      oldPrice: '3.990.000₫',
      badge: 'Phím cơ',
      badgeColor: 'surface',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiiunur2cb18j9GGf34YaSRUCAHZlvs6SqELI1WO8xfA&s=10'
    },
    {
      id: 15,
      name: 'Củ sạc đôi Apple 35W USB-C Compact Power',
      specs: ['Công suất 35W chuẩn GaN', '2 cổng USB-C sạc cùng lúc', 'Tương thích iPhone, MacBook Air'],
      price: '1.290.000₫',
      badge: 'Chính hãng',
      badgeColor: 'surface',
      img: 'https://cdn2.cellphones.com.vn/x/media/catalog/product/g/r/group_8_1__2.png'
    }
  ];

  // Group 3: Màn hình & Linh kiện PC
  const pcAndMonitors: ProductItem[] = [
    {
      id: 13,
      name: 'Màn hình Dell UltraSharp 27" 4K IPS Black U2723QE',
      specs: ['Độ phân giải 4K UHD 3840x2160', 'Tấm nền IPS Black tương phản 2000:1', 'Hub USB-C 90W sạc laptop'],
      price: '14.500.000₫',
      oldPrice: '16.200.000₫',
      badge: 'Chuẩn đồ họa',
      badgeColor: 'primary',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNpk-eTqvy2lTXH6LCE9WJaKLuwicDPwwt3PSlSnSb2WvRZOQGH8r_rIXBxeHrSxI9gXA7Jp7CppamFaa0govonshP67J0ph8MzvYqjDuZbWrngIUX3YunFbgwSYj2yXpzUexnzz9Wq_-PDfbCSG7g354VWM7ClR97uaGk2enAXPkNFcO_5oEkV0IhVcc55MwcfgHxd4ceaGdgyI1c5-4Dpf0W5BHl4FncjzqlIro7B_dyoGSLXqbG'
    },
    {
      id: 16,
      name: 'RAM DDR5 32GB (2x16GB) 6000MHz RGB',
      specs: ['Tốc độ cao 6000MHz CL30', 'Tản nhiệt nhôm LED RGB', 'Hỗ trợ Intel XMP 3.0 & AMD EXPO'],
      price: '2.950.000₫',
      badge: 'Linh kiện PC',
      badgeColor: 'surface',
      img: 'https://hoanghapc.vn/media/product/4789_ddr5_gskill_trident_z5_rgb_black_ha4.jpg'
    }
  ];

  const renderProductCard = (p: ProductItem) => (
    <div key={p.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-primary/40 transition-all duration-300 group flex flex-col relative">
      <div className="absolute top-3 left-3 z-10">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          p.badgeColor === 'error'
            ? 'bg-error-container text-on-error-container'
            : p.badgeColor === 'primary'
            ? 'bg-primary/10 text-primary'
            : 'bg-surface-container text-on-surface-variant'
        }`}>
          {p.badge}
        </span>
      </div>
      <Link to={`/products/${p.id}`} className="h-60 bg-surface-bright/50 flex items-center justify-center p-6 overflow-hidden">
        <img
          className={`object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ${p.disabled ? 'opacity-70' : ''}`}
          src={dbImages[p.id] || p.img}
          alt={p.name}
          loading="lazy"
        />
      </Link>
      <div className="p-5 flex flex-col flex-grow border-t border-outline-variant">
        <Link to={`/products/${p.id}`}>
          <h3 className="text-base font-semibold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {p.name}
          </h3>
        </Link>
        <ul className="mb-4 space-y-1">
          {p.specs.map((s, idx) => (
            <li key={idx} className="text-xs text-secondary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
              <span className="truncate">{s}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-2">
          {p.oldPrice && (
            <span className="text-xs text-secondary line-through block mb-0.5">{p.oldPrice}</span>
          )}
          <span className="text-lg font-bold text-primary">{p.price}</span>
        </div>
        <button
          onClick={() => handleAddToCart(p)}
          disabled={p.disabled || addingId === p.id}
          className={`mt-4 w-full text-sm font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            p.disabled
              ? 'bg-surface-container text-secondary cursor-not-allowed'
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-98'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {p.disabled ? 'notifications' : addingId === p.id ? 'progress_activity' : 'shopping_cart'}
          </span>
          {p.disabled ? 'Nhận thông báo' : addingId === p.id ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[480px]">
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-surface-container-low group cursor-pointer border border-outline-variant hover:border-primary/40 transition-colors shadow-sm">
          <img
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACu1lgviid4VH1YYBHFRY02bFykTSMuJcB9tJSUj88W1I26LOz_sXwoiV9ei0ZMwg1HR9iBOLuviGMk3fUkedCYrAMnnMC8pLgZJLbn6tUyuJw0_kGfH8MNYMeSuLij9zoqPb4JSkOudgnS5qUozitZojgv2BOU0QnHfMioInbPezPr9gQkr7Dbv45Yv6hvQYCa6d0Mbzd9bLmASfXhMKgFxh7ZIwEkQSPVAiB8TCUBbqpRQcRyztr"
            alt="iPhone 15 Pro Max hero banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="inline-block px-3 py-1 mb-3 bg-primary text-white text-xs font-semibold rounded-full uppercase tracking-wider">
              Ưu Đãi Đặc Biệt
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight text-white">iPhone 15 Pro Max</h1>
            <p className="text-base sm:text-lg text-white/90 mb-6 max-w-md">
              Sức mạnh titan vô song cùng hệ thống camera tiên tiến. Giảm ngay 2.500.000đ khi thanh toán COD.
            </p>
            <Link
              to="/products/10"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Khám Phá Ngay
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer shadow-sm">
            <img
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDamfnkJC9NHF8R_rr-trdmmuj4HmLlv6h5_dyjfD42Apy-dTdYHhSourp-mCLjzJpkLz-v24mrpIZO0KdNBosSnoRvo9D6iFyOelvMxF1dQaGAvIT4cyo1qTEIHKdvcYnu6rT7o_Dh3bLlyYAqjoZfdzwbAUk7jdCGM6SQaAecXI-p2LngBHA4MsideyKAkp18-pSZ-39He3tmeKhu1ZIHuDJHRSqrvP6GJNtbBAwfnvC4x37XZFvN"
              alt="Gaming Laptops"
            />
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <h3 className="text-xl font-bold mb-1">Gaming Laptops Cao Cấp</h3>
              <p className="text-sm text-white/80 mb-3">Sức mạnh vượt trội cho lập trình viên & gamers.</p>
              <Link
                to="/products?category=1"
                className="text-white text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Khám phá ngay <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer shadow-sm">
            <img
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src="/images/pc_components_banner.jpg"
              alt="Linh Kiện PC Cao Cấp"
            />
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <h3 className="text-xl font-bold mb-1">Linh Kiện PC & Phụ Kiện</h3>
              <p className="text-sm text-white/80 mb-3">Nâng tầm setup bàn làm việc với phụ kiện hàng đầu.</p>
              <Link
                to="/products?category=7"
                className="text-white text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Xem chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Accessories Quick Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-3">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Danh Mục & Phụ Kiện Nổi Bật</h2>
            <p className="text-sm text-secondary mt-0.5">Tìm kiếm nhanh theo thiết bị hoặc loại phụ kiện bạn quan tâm</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: 'laptop_mac', name: 'Laptops', url: '/products?category=1', desc: 'Apple, Asus, Lenovo' },
            { icon: 'smartphone', name: 'Điện Thoại', url: '/products?category=2', desc: 'iPhone, Galaxy' },
            { icon: 'mouse', name: 'Chuột & Phím', url: '/products?category=4', desc: 'Logitech, Cơ không dây' },
            { icon: 'headphones', name: 'Tai Nghe & Loa', url: '/products?category=5', desc: 'Sony ANC, Hi-Res' },
            { icon: 'monitor', name: 'Màn Hình', url: '/products?category=6', desc: 'Dell 4K, Gaming' },
            { icon: 'memory', name: 'Linh Kiện & Hub', url: '/products?category=7', desc: 'RAM, SSD, Cáp GaN' },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={cat.url}
              className="group flex flex-col items-center p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:border-primary hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              </div>
              <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{cat.name}</span>
              <span className="text-xs text-secondary mt-1">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Group 1: Laptop & Thiết Bị Di Động */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">laptop_mac</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Laptop & Thiết Bị Di Động Hàng Đầu</h2>
              <p className="text-sm text-secondary">Các sản phẩm laptop cấu hình cao, ultrabook và smartphone flagship</p>
            </div>
          </div>
          <Link to="/products?category=1" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {laptopAndMobiles.map(renderProductCard)}
        </div>
      </section>

      {/* Group 2: Phụ Kiện & Âm Thanh Chuyên Nghiệp */}
      <section className="p-6 sm:p-8 bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-outline-variant pb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">headphones</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Phụ Kiện & Âm Thanh Cao Cấp</h2>
              <p className="text-sm text-secondary">Chuột gaming, bàn phím cơ và tai nghe chống ồn chính hãng</p>
            </div>
          </div>
          <Link to="/products?category=4" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Khám phá phụ kiện <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessoriesAndAudio.map(renderProductCard)}
        </div>
      </section>

      {/* Group 3: Màn Hình & Linh Kiện PC */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">desktop_windows</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Màn Hình Đồ Họa & Linh Kiện PC</h2>
              <p className="text-sm text-secondary">Màn hình chuẩn màu sắc 4K IPS và linh kiện nâng cấp tốc độ máy tính</p>
            </div>
          </div>
          <Link to="/products?category=6" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Xem toàn bộ linh kiện <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pcAndMonitors.map(renderProductCard)}

          {/* Promotional Banner Card */}
          <div className="sm:col-span-2 relative rounded-2xl overflow-hidden bg-primary/5 border border-primary/20 p-6 flex flex-col justify-between group">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                Tư vấn cấu hình PC
              </span>
              <h3 className="text-2xl font-bold text-on-surface">Bạn cần build PC hoặc tìm phụ kiện phù hợp?</h3>
              <p className="text-sm text-secondary max-w-md">
                Sử dụng trợ lý AI Chatbot của ElectroTech để so sánh hiệu năng, kiểm tra tính tương thích và nhận đề xuất sản phẩm tốt nhất theo ngân sách của bạn!
              </p>
            </div>
            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/products?category=7"
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
              >
                Xem linh kiện PC
              </Link>
              <span className="text-xs text-secondary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
                Trợ lý AI sẵn sàng 24/7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Value Propositions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-outline-variant pt-8">
        {[
          { icon: 'local_shipping', title: 'Giao hàng siêu tốc', desc: 'Miễn phí vận chuyển toàn quốc cho mọi đơn hàng' },
          { icon: 'verified', title: '100% Chính hãng', desc: 'Bảo hành điện tử từ 12 đến 36 tháng uy tín' },
          { icon: 'sync', title: 'Đổi trả 30 ngày', desc: 'Đổi mới nhanh chóng nếu phát sinh lỗi nhà sản xuất' },
          { icon: 'smart_toy', title: 'Trợ lý AI thông minh', desc: 'Đề xuất và so sánh sản phẩm tức thì theo nhu cầu' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">{item.title}</h4>
              <p className="text-xs text-secondary mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
