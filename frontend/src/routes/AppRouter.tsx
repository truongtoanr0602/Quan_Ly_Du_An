import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProfilePage from '../pages/ProfilePage';
import CartPage from '../pages/CartPage';
import AddressesPage from '../pages/AddressesPage';
import AuthProvider from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import RequireAdmin from './RequireAdmin';
import RequireCustomer from './RequireCustomer';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Routes>
        {/* Public layout with Header/Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route element={<RequireCustomer />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
          </Route>
        </Route>

        {/* Auth pages (no header/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={
            <div className="min-h-screen bg-background w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              <Outlet />
            </div>
          }>
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="products" element={<ProductManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
