import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddToCartButton from '../components/AddToCartButton'
import { categoryService } from '../services/categoryService'
import { productService, type Product } from '../services/productService'
import type { CategoryDto } from '../types/category'

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND',
}).format(value)

const categoryIcons = ['laptop_mac', 'smartphone', 'memory', 'headphones']

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      categoryService.getAll(),
      productService.searchProducts({ pageNumber: 1, pageSize: 4, sort: 'newest' }),
    ]).then(([allCategories, result]) => {
      if (!active) return
      setCategories(allCategories.filter((category) => category.isActive))
      setProducts(result.items)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải sản phẩm.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const featured = products[0]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-16">
      <section className="grid h-auto grid-cols-1 gap-6 lg:h-[500px] lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low lg:col-span-2">
          {featured?.imageUrl && <img className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={featured.imageUrl} alt="" />}
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/50 to-transparent" />
          <div className="relative flex min-h-80 flex-col justify-end p-8 text-white lg:h-full">
            <span className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-sm font-medium">Sản phẩm mới</span>
            <h1 className="mb-4 text-4xl font-bold lg:text-5xl">{featured?.productName ?? 'Khám phá ElectroTech'}</h1>
            {featured && <p className="mb-6 text-lg">{formatPrice(featured.price)}</p>}
            <Link to={featured ? `/products/${featured.productID}` : '/products'}
              className="w-fit rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-container">
              Khám phá ngay
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {categories.slice(0, 2).map((category, index) => (
            <Link key={category.categoryID} to={`/products?categoryId=${category.categoryID}`}
              className="group relative flex min-h-44 flex-1 flex-col justify-end overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-6 hover:border-primary">
              <span className="material-symbols-outlined absolute right-6 top-5 text-6xl text-primary/25" aria-hidden="true">{categoryIcons[index]}</span>
              <h2 className="relative text-xl font-semibold">{category.categoryName}</h2>
              <span className="relative mt-3 flex items-center gap-1 text-sm font-medium text-primary">Xem thêm
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 border-b border-outline-variant pb-4 text-3xl font-semibold">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => (
            <Link key={category.categoryID} to={`/products?categoryId=${category.categoryID}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-8 hover:border-primary">
              <span className="material-symbols-outlined mb-4 text-5xl text-secondary group-hover:text-primary" aria-hidden="true">{categoryIcons[index]}</span>
              <span className="text-center text-xl font-semibold">{category.categoryName}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-center justify-between border-b border-outline-variant pb-4">
          <h2 className="text-3xl font-semibold">Sản phẩm mới</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">Xem tất cả</Link>
        </div>
        {loading && <p>Đang tải sản phẩm...</p>}
        {error && <p role="alert" className="text-error">{error}</p>}
        {!loading && !error && products.length === 0 && <p>Chưa có sản phẩm.</p>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.productID} className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary">
              <Link to={`/products/${product.productID}`} className="flex h-64 items-center justify-center bg-surface-bright p-6">
                {product.imageUrl ? <img className="h-full w-full object-contain" src={product.imageUrl} alt={product.productName} />
                  : <span className="material-symbols-outlined text-5xl text-secondary" aria-hidden="true">inventory_2</span>}
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <Link to={`/products/${product.productID}`} className="mb-2 line-clamp-2 text-xl font-semibold hover:text-primary">{product.productName}</Link>
                <p className="mt-auto text-xl font-bold text-primary">{formatPrice(product.price)}</p>
                <AddToCartButton productID={product.productID} stockQuantity={product.stockQuantity}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white disabled:opacity-50" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
