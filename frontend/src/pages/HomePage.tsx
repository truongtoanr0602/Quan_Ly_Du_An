import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-surface-container-low group cursor-pointer border border-outline-variant hover:border-outline transition-colors">
          <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACu1lgviid4VH1YYBHFRY02bFykTSMuJcB9tJSUj88W1I26LOz_sXwoiV9ei0ZMwg1HR9iBOLuviGMk3fUkedCYrAMnnMC8pLgZJLbn6tUyuJw0_kGfH8MNYMeSuLij9zoqPb4JSkOudgnS5qUozitZojgv2BOU0QnHfMioInbPezPr9gQkr7Dbv45Yv6hvQYCa6d0Mbzd9bLmASfXhMKgFxh7ZIwEkQSPVAiB8TCUBbqpRQcRyztr" alt="iPhone 15 Pro Max hero banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-on-primary">
            <span className="inline-block px-3 py-1 mb-4 bg-primary text-on-primary text-sm font-medium rounded-full uppercase tracking-wider">Ưu Đãi Đặc Biệt</span>
            <h1 className="text-5xl font-bold mb-4 leading-tight text-white">iPhone 15 Pro Max</h1>
            <p className="text-lg text-surface-container mb-6 max-w-md">Trải nghiệm sức mạnh titan vô song cùng hệ thống camera tiên tiến nhất. Giảm ngay 2.000.000đ khi thanh toán qua thẻ.</p>
            <Link to="/products" className="inline-block bg-primary text-on-primary text-sm font-medium px-6 py-3 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm hover:shadow-md">Khám Phá Ngay</Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex-1 relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer">
            <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDamfnkJC9NHF8R_rr-trdmmuj4HmLlv6h5_dyjfD42Apy-dTdYHhSourp-mCLjzJpkLz-v24mrpIZO0KdNBosSnoRvo9D6iFyOelvMxF1dQaGAvIT4cyo1qTEIHKdvcYnu6rT7o_Dh3bLlyYAqjoZfdzwbAUk7jdCGM6SQaAecXI-p2LngBHA4MsideyKAkp18-pSZ-39He3tmeKhu1ZIHuDJHRSqrvP6GJNtbBAwfnvC4x37XZFvN" alt="Gaming Laptops" />
            <div className="absolute inset-0 bg-on-surface/40 group-hover:bg-on-surface/30 transition-colors" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl font-semibold text-white mb-2">Gaming Laptops Mới</h3>
              <p className="text-base text-surface-container mb-4">Sức mạnh vượt trội cho mọi tựa game.</p>
              <span className="text-primary-fixed-dim text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">Xem thêm <span className="material-symbols-outlined text-[16px]">arrow_forward</span></span>
            </div>
          </div>
          <div className="flex-1 relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant group cursor-pointer">
            <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGq_jxZ2ATPeqpGef8poRPd3rldcohkWY4K8Ho_oa-RrKE4-RDOOX8A2neP_mbSQBvbZzfYvBmCleP7_ctqhEAIFZTDk74J0CafWlJmYSk-KkhNlxnILlkAwxC1vzwOC8Bs6jaLUMeoGP2apVMUrbx13_ycq__rAsrR9DvV4aJerGPAmj6bMEr2u9bcT81qJJDz4lc9ttKsywNekyX-Cq4MYG3YDR2EZb-Bo0vsXmgT9wjLn5TXXv" alt="PC Components" />
            <div className="absolute inset-0 bg-on-surface/40 group-hover:bg-on-surface/30 transition-colors" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl font-semibold text-white mb-2">Linh Kiện PC Cao Cấp</h3>
              <p className="text-base text-surface-container mb-4">Nâng cấp hệ thống của bạn ngay hôm nay.</p>
              <span className="text-primary-fixed-dim text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">Xem thêm <span className="material-symbols-outlined text-[16px]">arrow_forward</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
          <h2 className="text-3xl font-semibold text-on-background">Danh Mục Nổi Bật</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: 'laptop_mac', name: 'Laptops' },
            { icon: 'smartphone', name: 'Điện Thoại' },
            { icon: 'memory', name: 'Linh Kiện' },
            { icon: 'headphones', name: 'Phụ Kiện' },
          ].map((cat) => (
            <Link key={cat.name} to="/products" className="group flex flex-col items-center justify-center p-8 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
              <span className="material-symbols-outlined text-[48px] text-secondary group-hover:text-primary transition-colors mb-4">{cat.icon}</span>
              <span className="text-xl font-semibold text-on-surface text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
          <h2 className="text-3xl font-semibold text-on-background">Sản Phẩm Bán Chạy</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">Xem tất cả <span className="material-symbols-outlined text-[16px]">chevron_right</span></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'MacBook Pro 14" M3 Pro', specs: ['Chip M3 Pro 11-core CPU', '18GB Unified Memory', '512GB SSD'], price: '49.990.000₫', badge: 'Còn hàng', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmwHrLZC0DaLrnRFKQ0oL5CPmeZHXc-iYvVvKn4_GWzkvYioZL4j_rl6R-1jxEDsLFR3msa15cvh7ODPq61ghUMR1InYiaMLUd3-4Maa1_XPMkrerRn7eEO34lpDC-Xq_fJws-LdwQutle-Wqi1mhtiCHtoHLAuT8CsO9SZUXU-1smoRJwS8OJsS9ZRO0t297rp5yULcGujzadyG3YQaBpwW0q_QYJi6sPh_JFdRVTwq5Mq4ryNKY1' },
            { name: 'Chuột Gaming Logitech G Pro X Superlight', specs: ['Trọng lượng siêu nhẹ <63g', 'Cảm biến HERO 25K'], price: '2.990.000₫', oldPrice: '3.490.000₫', badge: 'Giảm 15%', badgeColor: 'error', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbfTmrP8ACkft0Sfg7TxlzAWaiJa5mqPTBipOb0BXeOv_l-zcPKEmUFakcZW8YJlB-3hURl6cMrxTkKN_11QRYw9mpTk-dXx5bQ8214Y29pcQP0mHu9BqmQCPS0_vOksBbp0AAiItTZexo1xOWcMOU3nObOZf8wBt0oao0SFhFDZZQlACDPFDwn-_ofQV4IR8zbopPMt5CHMPrjSTgRbvcHjSyRoNLpyv3i6GDk-n4T05bAXJWXGt' },
            { name: 'Màn hình Dell UltraSharp 27" 4K', specs: ['Độ phân giải 4K UHD', 'Tấm nền IPS Black', 'Hub USB-C 90W'], price: '14.500.000₫', badge: 'Còn hàng', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNpk-eTqvy2lTXH6LCE9WJaKLuwicDPwwt3PSlSnSb2WvRZOQGH8r_rIXBxeHrSxI9gXA7Jp7CppamFaa0govonshP67J0ph8MzvYqjDuZbWrngIUX3YunFbgwSYj2yXpzUexnzz9Wq_-PDfbCSG7g354VWM7ClR97uaGk2enAXPkNFcO_5oEkV0IhVcc55MwcfgHxd4ceaGdgyI1c5-4Dpf0W5BHl4FncjzqlIro7B_dyoGSLXqbG' },
            { name: 'Tai nghe Sony WH-1000XM5', specs: ['Chống ồn chủ động ANC', 'Pin 30 giờ'], price: '7.990.000₫', badge: 'Sắp về', disabled: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ8ZHFUTuWewzL3H1Lv-akvwJLYaEkFSV7IT5xqGvIYz3iG5C6OJ6exbfh654P2V4-a8PlCDcVlXCaSxdWFZ_7COxawatTO1kVmexV-jfZa6FLCslXHkG3T743FUpJK95BmldjrGs-EYDhEXcv1ui6jDah7RjwhdNx4SljrIomEhb0mBRh3-4jhHIVLRaYyIE79RGtBbcnFbelHXNjvfTD4H6fqUldVYHhtvcGe2iz0YTQoz2RQXgd' },
          ].map((p) => (
            <div key={p.name} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-outline transition-all group flex flex-col relative">
              <div className="absolute top-3 left-3 z-10">
                <span className={`${p.badgeColor === 'error' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'} text-[11px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider`}>{p.badge}</span>
              </div>
              <div className="h-64 bg-surface-bright flex items-center justify-center p-6 overflow-hidden">
                <img className={`object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300 ${p.disabled ? 'opacity-80' : ''}`} src={p.img} alt={p.name} />
              </div>
              <div className="p-5 flex flex-col flex-grow border-t border-outline-variant">
                <h3 className="text-xl font-semibold text-on-surface line-clamp-2 mb-2">{p.name}</h3>
                <ul className="mb-4 space-y-1">
                  {p.specs.map((s) => (
                    <li key={s} className="text-[13px] font-semibold text-on-surface-variant flex items-center gap-2 before:content-[''] before:block before:w-1 before:h-1 before:bg-outline before:rounded-full">{s}</li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col">
                  {p.oldPrice && <span className="text-base text-on-surface-variant line-through text-sm">{p.oldPrice}</span>}
                  <span className="text-xl font-bold text-primary">{p.price}</span>
                </div>
                <button disabled={p.disabled} className={`mt-4 w-full ${p.disabled ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-surface-container-lowest border border-primary text-primary hover:bg-primary hover:text-on-primary'} text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2`}>
                  <span className="material-symbols-outlined text-[18px]">{p.disabled ? 'notifications' : 'shopping_cart'}</span>
                  {p.disabled ? 'Nhận thông báo' : 'Thêm vào giỏ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
