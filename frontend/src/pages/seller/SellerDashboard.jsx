import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiArrowRight, FiPlus } from 'react-icons/fi';
import { sellerAPI, categoryAPI } from '../../services/api';
import { useSellerStore } from '../../store/sellerStore';
import SellerLayout from './SellerLayout';

const StatCard = ({ title, value, icon: Icon, color, subtext, linkTo }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
          View <FiArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
  </motion.div>
);

export default function SellerDashboard() {
  const { seller } = useSellerStore();
  const [earnings, setEarnings] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [earningsData, productsData, ordersData] = await Promise.all([
          sellerAPI.getEarnings(),
          sellerAPI.getProducts({ limit: 5 }),
          sellerAPI.getOrders({ limit: 5 }),
        ]);
        setEarnings(earningsData.earnings);
        setProducts(productsData.products || []);
        setOrders(ordersData.orders || []);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {seller?.shopName}! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's what's happening in your shop today.</p>
        </div>
        <Link to="/seller/products?add=1"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md">
          <FiPlus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Sales" icon={FiDollarSign} color="bg-green-100 text-green-600"
              value={fmt(earnings?.totalSales)} subtext={`Net: ${fmt(earnings?.netEarnings)}`}
              linkTo="/seller/earnings"
            />
            <StatCard
              title="Total Orders" icon={FiShoppingBag} color="bg-blue-100 text-blue-600"
              value={earnings?.totalOrders || 0} subtext="Delivered orders"
              linkTo="/seller/orders"
            />
            <StatCard
              title="Available Balance" icon={FiDollarSign} color="bg-indigo-100 text-indigo-600"
              value={fmt(earnings?.availableBalance)} subtext="Ready to withdraw"
              linkTo="/seller/earnings"
            />
            <StatCard
              title="This Month" icon={FiTrendingUp} color="bg-purple-100 text-purple-600"
              value={fmt(earnings?.monthSales)} subtext={`Net: ${fmt(earnings?.monthNet)}`}
              linkTo="/seller/earnings"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">My Products</h3>
                <Link to="/seller/products" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No products yet</p>
                    <Link to="/seller/products?add=1" className="text-indigo-600 text-sm font-medium mt-2 inline-block">Add your first product →</Link>
                  </div>
                ) : products.map(p => (
                  <div key={p._id} className="flex items-center gap-3 px-6 py-3">
                    <img src={p.images?.[0] || p.variants?.[0]?.images?.[0]} alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.category} · {p.subCategory || p.productType || '—'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">₹{p.price}</p>
                      <p className="text-xs text-gray-400">{p.stock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                <Link to="/seller/orders" className="text-xs text-indigo-600 font-medium hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <FiShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No orders yet</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order._id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">₹{order.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </SellerLayout>
  );
}
