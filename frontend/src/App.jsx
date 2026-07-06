import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import SellerRoute from './components/common/SellerRoute';
import CourierRoute from './components/common/CourierRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';

// User Account (My Account hub)
import MyAccount from './pages/user/MyAccount';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSellers from './pages/admin/AdminSellers';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminReturns from './pages/admin/AdminReturns';
import AdminCommission from './pages/admin/AdminCommission';
import AdminBanners from './pages/admin/AdminBanners';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCouriers from './pages/admin/AdminCouriers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminReports from './pages/admin/AdminReports';

// Additional Seller pages
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerNotifications from './pages/seller/SellerNotifications';

// Seller pages
import SellerRegister from './pages/seller/SellerRegister';
import SellerLogin from './pages/seller/SellerLogin';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerEarnings from './pages/seller/SellerEarnings';
import SellerShopSettings from './pages/seller/SellerShopSettings';
import SellerProfile from './pages/seller/SellerProfile';
import SellerInventory from './pages/seller/SellerInventory';
import SellerReviews from './pages/seller/SellerReviews';
import SellerReturns from './pages/seller/SellerReturns';

// Courier pages
import CourierLogin from './pages/courier/CourierLogin';
import CourierRegister from './pages/courier/CourierRegister';
import CourierDashboard from './pages/courier/CourierDashboard';

import { useAuthStore } from './store/authStore';
import { useSellerStore } from './store/sellerStore';
import { useCartStore } from './store/cartStore';
import { useWishlistStore } from './store/wishlistStore';
import { useCourierStore } from './store/courierStore';

export default function App() {
  const { pathname } = useLocation();
  const { initAuth, isAuthenticated } = useAuthStore();
  const { initSeller } = useSellerStore();
  const { initCourier } = useCourierStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    initAuth();
    initSeller();
    initCourier();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller') && !['/seller/login', '/seller/register'].includes(pathname);
  const isCourierRoute = pathname.startsWith('/courier') && !['/courier/login', '/courier/register'].includes(pathname);
  const isAuthRoute = ['/login', '/register', '/seller/login', '/seller/register', '/courier/login', '/courier/register'].includes(pathname);

  const showLayout = !isAdminRoute && !isSellerRoute && !isCourierRoute && !isAuthRoute;

  return (
    <>
      <ScrollToTop />
      {showLayout && <Navbar />}
      {showLayout && <CartDrawer />}
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Customer Protected Routes ── */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

        {/* ── My Account (User Hub) ── */}
        <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
        <Route path="/my-account/:section" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
        <Route path="/admin/sellers" element={<AdminRoute><AdminSellers /></AdminRoute>} />
        <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
        <Route path="/admin/returns" element={<AdminRoute><AdminReturns /></AdminRoute>} />
        <Route path="/admin/commission" element={<AdminRoute><AdminCommission /></AdminRoute>} />
        <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
        <Route path="/admin/couriers" element={<AdminRoute><AdminCouriers /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/complaints" element={<AdminRoute><AdminComplaints /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

        {/* ── Seller Routes ── */}
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
        <Route path="/seller/products" element={<SellerRoute><SellerProducts /></SellerRoute>} />
        <Route path="/seller/orders" element={<SellerRoute><SellerOrders /></SellerRoute>} />
        <Route path="/seller/earnings" element={<SellerRoute><SellerEarnings /></SellerRoute>} />
        <Route path="/seller/inventory" element={<SellerRoute><SellerInventory /></SellerRoute>} />
        <Route path="/seller/reviews" element={<SellerRoute><SellerReviews /></SellerRoute>} />
        <Route path="/seller/returns" element={<SellerRoute><SellerReturns /></SellerRoute>} />
        <Route path="/seller/analytics" element={<SellerRoute><SellerAnalytics /></SellerRoute>} />
        <Route path="/seller/notifications" element={<SellerRoute><SellerNotifications /></SellerRoute>} />
        <Route path="/seller/settings" element={<SellerRoute><SellerShopSettings /></SellerRoute>} />
        <Route path="/seller/profile" element={<SellerRoute><SellerProfile /></SellerRoute>} />

        {/* ── Courier Routes ── */}
        <Route path="/courier/login" element={<CourierLogin />} />
        <Route path="/courier/register" element={<CourierRegister />} />
        <Route path="/courier/dashboard" element={<CourierRoute><CourierDashboard /></CourierRoute>} />
      </Routes>
      {showLayout && <Footer />}
    </>
  );
}
