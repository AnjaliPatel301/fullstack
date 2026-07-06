import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiSearch, FiChevronRight } from 'react-icons/fi';
import { orderAPI } from '../../services/api';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700',
  refunded: 'bg-teal-100 text-teal-700',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    orderAPI.getMyOrders({ limit: 100 }).then(d => setOrders(d.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some(i => i.name?.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Orders</h2>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex gap-2 flex-wrap mb-3">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order ID or product name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Order Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-gray-900">#{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">₹{order.totalPrice}</span>
                  <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-50">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price} · {item.size} {item.color}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="px-4 py-2 text-xs text-gray-500">+{order.items.length - 3} more items</div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">{order.paymentMethod?.toUpperCase()} · {order.isPaid ? 'Paid' : 'Unpaid'}</span>
                <div className="flex gap-2">
                  {order.trackingNumber && (
                    <Link to={`/my-account/tracking?orderId=${order._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      Track Order <FiChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                  <Link to={`/order/${order._id}`} className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                    View Details <FiChevronRight className="w-3 h-3" />
                  </Link>
                  {order.status === 'delivered' && (
                    <Link to={`/my-account/returns?orderId=${order._id}`} className="text-xs text-orange-600 hover:text-orange-800 font-medium">
                      Return/Refund
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
