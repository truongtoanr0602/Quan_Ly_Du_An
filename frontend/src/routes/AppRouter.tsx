import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import ProfilePage from '../pages/ProfilePage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage';
import InventoryManagementPage from '../pages/admin/InventoryManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import { ToastProvider } from '../contexts/ToastContext';
import ChatBot from '../components/ChatBot';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public layout with Header/Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Auth pages (no header/footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route path="/admin">
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="products" element={<ProductManagementPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot />
      </ToastProvider>
    </BrowserRouter>
  );
}
