import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiTrendingDown,
  FiArrowRight, FiLogOut, FiTruck, FiRefreshCw, FiAlertTriangle, FiPercent
} from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/helpers';

export const AdminNav = () => {
  const { user, logout } = useAuthStore();
  const navItems = [
    { to: '/admin', icon: '📊', label: 'Dashboard' },
    { to: '/admin/products', icon: '👗', label: 'Products' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/sellers', icon: '🏪', label: 'Sellers' },
    { to: '/admin/categories', icon: '🗂️', label: 'Categories' },
    { to: '/admin/coupons', icon: '🎫', label: 'Coupons' },
    { to: '/admin/withdrawals', icon: '💸', label: 'Withdrawals' },
    { to: '/admin/returns', icon: '🔄', label: 'Returns' },
    { to: '/admin/commission', icon: '💰', label: 'Commission' },
    { to: '/admin/banners', icon: '🖼️', label: 'Banners' },
    { to: '/admin/notifications', icon: '🔔', label: 'Notifications' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/admin/couriers', icon: '🚚', label: 'Couriers' },
    { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
    { to: '/', icon: '🏠', label: 'View Store' },
  ];
  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col fixed left-0 top-0 z-40 overflow-y-auto">
      <div className="p-5 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👗</span>
          <span className="font-display text-xl font-bold text-white">LuxeFit</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => (
          <Link key={item.to + item.label} to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span className="text-base">{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-medium truncate max-w-[120px]">{user?.name}</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

const StatCard = ({ title, value, icon, change, color, prefix = '', suffix = '' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-lg`}>{icon}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {change >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-gray-500 text-xs mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-900">{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}</p>
  </motion.div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back! Here's your store overview.</p>
          </div>
          <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Users" value={stats?.totalUsers} icon="👥" color="bg-blue-50" />
              <StatCard title="Total Sellers" value={stats?.totalSellers} icon="🏪" color="bg-purple-50" />
              <StatCard title="Total Products" value={stats?.totalProducts} icon="👗" color="bg-green-50" />
              <StatCard title="Total Orders" value={stats?.totalOrders} icon="📦" color="bg-orange-50" />
              <StatCard title="Monthly Revenue" value={stats?.currentRevenue} icon="💰" prefix="₹" color="bg-yellow-50" change={stats?.revenueGrowth} />
              <StatCard title="Commission Earned" value={stats?.totalCommissionEarned} icon="💸" prefix="₹" color="bg-indigo-50" />
              <StatCard title="Pending Orders" value={stats?.pendingOrders} icon="⏳" color="bg-red-50" />
              <StatCard title="Pending Returns" value={stats?.pendingReturns} icon="🔄" color="bg-orange-50" />
            </div>

            {/* Alert Cards */}
            {stats?.lowStockProducts > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-yellow-800 text-sm">
                  <strong>{stats.lowStockProducts} products</strong> are running low on stock.
                  <Link to="/admin/products" className="ml-2 text-yellow-600 hover:text-yellow-800 underline">View Products</Link>
                </p>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Revenue by Month */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">Monthly Revenue (Last 12 months)</h2>
                {data?.revenueByMonth?.length > 0 ? (
                  <div className="space-y-2">
                    {data.revenueByMonth.slice(-6).map((m, i) => {
                      const max = Math.max(...data.revenueByMonth.map(x => x.revenue));
                      const pct = max > 0 ? (m.revenue / max) * 100 : 0;
                      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-8">{monthNames[m._id.month]}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gray-900 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-900 w-20 text-right">₹{(m.revenue / 1000).toFixed(1)}K</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-400 text-sm">No data yet</p>}
              </div>

              {/* Orders by Status */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">Orders by Status</h2>
                {data?.ordersByStatus?.length > 0 ? (
                  <div className="space-y-2">
                    {data.ordersByStatus.map((s, i) => {
                      const total = data.ordersByStatus.reduce((sum, x) => sum + x.count, 0);
                      const pct = total > 0 ? ((s.count / total) * 100).toFixed(0) : 0;
                      const colors = { delivered: 'bg-green-500', pending: 'bg-yellow-500', cancelled: 'bg-red-500', shipped: 'bg-blue-500' };
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 capitalize w-24 truncate">{s._id?.replace(/_/g, ' ')}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className={`${colors[s._id] || 'bg-gray-500'} h-full rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-900 w-8 text-right">{s.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-400 text-sm">No data yet</p>}
              </div>
            </div>

            {/* Recent Orders + Top Products */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Recent Orders</h2>
                  <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    View all <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {data?.recentOrders?.map(order => (
                    <div key={order._id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Top Selling Products</h2>
                  <Link to="/admin/products" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    View all <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {data?.topProducts?.map((tp, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                      {tp.product?.images?.[0] && <img src={tp.product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{tp.product?.name}</p>
                        <p className="text-xs text-gray-500">{tp.totalSold} sold</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">₹{tp.revenue?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
