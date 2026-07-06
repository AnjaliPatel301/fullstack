import { useState, useEffect } from 'react';
import { FiTrendingUp, FiPackage, FiDollarSign, FiStar } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SellerAnalytics() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sellerAPI.getDashboardStats(),
      sellerAPI.getOrders({ limit: 200 }),
    ]).then(([statsData, ordersData]) => {
      setStats(statsData.stats || statsData);
      // Compute top products from orders
      const productMap = {};
      (ordersData.orders || []).forEach(o => {
        (o.items || []).forEach(item => {
          if (!productMap[item.name]) productMap[item.name] = { name: item.name, quantity: 0, revenue: 0, image: item.image };
          productMap[item.name].quantity += item.quantity || 1;
          productMap[item.name].revenue += (item.price * item.quantity) || 0;
        });
      });
      const sorted = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      setTopProducts(sorted);
      // Monthly revenue from orders
      const monthMap = {};
      (ordersData.orders || []).forEach(o => {
        const m = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!monthMap[m]) monthMap[m] = 0;
        monthMap[m] += o.totalPrice || 0;
      });
      setRevenueData(Object.entries(monthMap).slice(-6));
    }).catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading analytics...</div>;

  const maxRevenue = Math.max(...revenueData.map(([, v]) => v), 1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Analytics</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Products', value: stats.totalProducts, icon: FiPackage, color: 'bg-blue-50 text-blue-700' },
            { label: 'Total Orders', value: stats.totalOrders, icon: FiTrendingUp, color: 'bg-green-50 text-green-700' },
            { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Avg. Rating', value: stats.avgRating?.toFixed(1) || '—', icon: FiStar, color: 'bg-purple-50 text-purple-700' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                <Icon className="w-6 h-6 mb-2" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium mt-1 opacity-80">{s.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Monthly Revenue</h2>
          {revenueData.length === 0 ? (
            <p className="text-gray-400 text-sm">No order data yet</p>
          ) : (
            <div className="space-y-3">
              {revenueData.map(([month, rev]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14">{month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-gray-900 h-full rounded-full transition-all" style={{ width: `${(rev / maxRevenue) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-20 text-right">₹{rev.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">No product data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.quantity} units sold</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">₹{p.revenue.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
