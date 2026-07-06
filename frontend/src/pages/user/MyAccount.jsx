import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiPackage, FiMapPin, FiStar, FiRefreshCw, FiHeart, FiHelpCircle,
  FiBell, FiShield, FiChevronRight, FiLogOut, FiHome, FiTruck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { orderAPI, userAPI, reviewAPI, returnAPI, notificationAPI } from '../../services/api';
import MyOrders from './MyOrders';
import MyProfile from './MyProfile';
import OrderTracking from './OrderTracking';
import MyReviews from './MyReviews';
import MyReturns from './MyReturns';
import MyWishlist from './MyWishlist';
import MyNotifications from './MyNotifications';
import HelpCenter from './HelpCenter';
import SecuritySettings from './SecuritySettings';

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: FiHome },
  { key: 'orders', label: 'My Orders', icon: FiPackage },
  { key: 'tracking', label: 'Order Tracking', icon: FiTruck },
  { key: 'reviews', label: 'My Reviews', icon: FiStar },
  { key: 'returns', label: 'Returns & Refunds', icon: FiRefreshCw },
  { key: 'wishlist', label: 'Wishlist', icon: FiHeart },
  { key: 'profile', label: 'My Profile', icon: FiUser },
  { key: 'notifications', label: 'Notifications', icon: FiBell },
  { key: 'help', label: 'Help Center', icon: FiHelpCircle },
  { key: 'security', label: 'Security Settings', icon: FiShield },
];

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    orderAPI.getMyOrders({ limit: 100 }).then(d => {
      const orders = d.orders || [];
      setStats({
        total: orders.length,
        pending: orders.filter(o => ['pending','confirmed','packed'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        returned: orders.filter(o => ['returned','refunded'].includes(o.status)).length,
        recent: orders.slice(0, 5),
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-300 text-sm">{user?.email}</p>
            <p className="text-gray-400 text-xs mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Delivered', value: stats.delivered, color: 'bg-green-50 text-green-700' },
            { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 text-red-700' },
            { label: 'Returned', value: stats.returned, color: 'bg-purple-50 text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      {stats?.recent?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/my-account/orders" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recent.map(order => (
              <div key={order._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.items?.length} item(s) · ₹{order.totalPrice}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyAccount() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [active, setActive] = useState(section || 'dashboard');

  useEffect(() => {
    if (section) setActive(section);
  }, [section]);

  const handleNav = (key) => {
    setActive(key);
    navigate(`/my-account/${key}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out!');
  };

  const renderContent = () => {
    switch (active) {
      case 'orders': return <MyOrders />;
      case 'tracking': return <OrderTracking />;
      case 'reviews': return <MyReviews />;
      case 'returns': return <MyReturns />;
      case 'wishlist': return <MyWishlist />;
      case 'profile': return <MyProfile />;
      case 'notifications': return <MyNotifications />;
      case 'help': return <HelpCenter />;
      case 'security': return <SecuritySettings />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user?.name}</p>
                    <p className="text-gray-400 text-xs">My Account</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {MENU_ITEMS.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.key} onClick={() => handleNav(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                        active === item.key ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                      {active === item.key && <FiChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100 pt-4">
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
