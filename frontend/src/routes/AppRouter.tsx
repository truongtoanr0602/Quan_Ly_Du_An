import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage';
import InventoryManagementPage from '../pages/admin/InventoryManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ProfilePage from '../pages/ProfilePage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import AddressesPage from '../pages/AddressesPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import MockBankPage from '../pages/MockBankPage';
import AuthProvider from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import RequireAdmin from './RequireAdmin';
import RequireCustomer from './RequireCustomer';
import ChatBot from '../components/ChatBot';

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
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/mock-bank/orders/:id" element={<MockBankPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
          </Route>
        </Route>

        {/* Auth pages (no header/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
