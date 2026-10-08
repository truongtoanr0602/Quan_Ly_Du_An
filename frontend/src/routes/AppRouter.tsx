import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProfilePage from '../pages/ProfilePage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import AddressesPage from '../pages/AddressesPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import AuthProvider from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import RequireAdmin from './RequireAdmin';
import RequireCustomer from './RequireCustomer';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage';
import InventoryManagementPage from '../pages/admin/InventoryManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import { ToastProvider } from '../contexts/ToastContext';
import ChatBot from '../components/ChatBot';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ToastProvider>
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
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
          </Route>
        </Route>

        {/* Auth pages (no header/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={
            <div className="min-h-screen bg-background w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              <Outlet />
            </div>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="products" element={<ProductManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot />
        </CartProvider>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
