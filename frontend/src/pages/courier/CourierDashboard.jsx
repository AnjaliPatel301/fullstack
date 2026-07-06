import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTruck, FiPackage, FiCheck, FiClock, FiXCircle, FiLogOut, FiMapPin, FiCamera, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { courierAPI } from '../../services/api';
import { useCourierStore } from '../../store/courierStore';

const TRACKING_STATUSES = [
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'reached_sorting_center', label: 'Reached Sorting Center' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'reached_destination_city', label: 'Reached Destination City' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed_delivery', label: 'Failed Delivery' },
];

const FAILURE_REASONS = [
  { value: 'customer_not_available', label: 'Customer Not Available' },
  { value: 'wrong_address', label: 'Wrong Address' },
  { value: 'delivery_refused', label: 'Delivery Refused' },
  { value: 'reschedule_requested', label: 'Reschedule Requested' },
];

function CourierSidebar() {
  const { courier, courierLogout } = useCourierStore();
  const navigate = useNavigate();
  const handleLogout = () => { courierLogout(); navigate('/courier/login'); toast.success('Logged out!'); };

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <FiTruck className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-white text-lg">Courier Panel</span>
        </div>
        <p className="text-gray-400 text-xs">{courier?.companyName}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {[
          { to: '/courier/dashboard', icon: '📊', label: 'Dashboard' },
          { to: '/courier/dashboard?tab=assigned', icon: '📦', label: 'Assigned Orders' },
          { to: '/courier/dashboard?tab=pickup', icon: '🏃', label: 'Pickups' },
          { to: '/courier/dashboard?tab=transit', icon: '🚚', label: 'In Transit' },
          { to: '/courier/dashboard?tab=delivered', icon: '✅', label: 'Delivered' },
        ].map(item => (
          <Link key={item.label} to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {courier?.deliveryPersonName?.charAt(0)}
          </div>
          <div>
            <p className="text-white text-xs font-medium">{courier?.deliveryPersonName}</p>
            <p className="text-gray-400 text-xs">Courier Partner</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-2 py-2 rounded-lg hover:bg-gray-800">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default function CourierDashboard() {
  const { courier } = useCourierStore();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ status: '', location: '', note: '', failureReason: '', otp: '' });
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        courierAPI.getStats(),
        courierAPI.getOrders({ status: statusFilter || undefined }),
      ]);
      setStats(statsData.stats);
      setOrders(ordersData.orders || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleUpdateTracking = async () => {
    if (!trackingForm.status || !trackingForm.location) return toast.error('Status and location required');
    setUpdating(true);
    try {
      await courierAPI.updateTracking(selected._id, trackingForm);
      toast.success('Tracking updated!');
      setSelected(null);
      setTrackingForm({ status: '', location: '', note: '', failureReason: '', otp: '' });
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  const statCards = stats ? [
    { label: 'Total Assigned', value: stats.assigned, icon: FiPackage, color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending Pickup', value: stats.pending, icon: FiClock, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'In Transit', value: stats.inTransit, icon: FiTruck, color: 'bg-orange-50 text-orange-700' },
    { label: 'Out for Delivery', value: stats.outForDelivery, icon: FiMapPin, color: 'bg-purple-50 text-purple-700' },
    { label: 'Delivered', value: stats.delivered, icon: FiCheck, color: 'bg-green-50 text-green-700' },
    { label: 'Failed', value: stats.failed, icon: FiXCircle, color: 'bg-red-50 text-red-700' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CourierSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courier Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {courier?.deliveryPersonName}</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            Refresh
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-6 gap-4 mb-6">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 ${s.color}`}>
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs font-medium mt-1 opacity-80">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { value: '', label: 'All Orders' },
            { value: 'ready_for_pickup', label: 'Ready for Pickup' },
            { value: 'picked_up', label: 'Picked Up' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'failed_delivery', label: 'Failed' },
          ].map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map(order => (
                <div key={order._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-gray-900">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'failed_delivery' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{order.status?.replace(/_/g, ' ')}</span>
                        {order.trackingNumber && <span className="text-xs text-gray-500">TRK: {order.trackingNumber}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="font-medium text-gray-900">{order.user?.name}</p>
                          <p className="text-gray-600 text-xs">{order.user?.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Delivery Address</p>
                          <p className="text-gray-700 text-xs">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                          <p className="text-gray-700 text-xs">{order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {order.items?.length} item(s) · ₹{order.totalPrice} · {order.paymentMethod?.toUpperCase()}
                      </div>
                    </div>
                    {order.status !== 'delivered' && (
                      <button onClick={() => { setSelected(order); setTrackingForm({ status: '', location: '', note: '', failureReason: '', otp: '' }); }}
                        className="ml-4 flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                        Update Status <FiChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Tracking Modal */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-lg w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Update Tracking Status</h2>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <div className="mb-4 bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="font-medium">Order: #{selected.orderNumber}</p>
                  <p className="text-gray-600">{selected.shippingAddress?.street}, {selected.shippingAddress?.city}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">New Status *</label>
                    <select value={trackingForm.status} onChange={e => setTrackingForm({...trackingForm, status: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">Select status...</option>
                      {TRACKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  {trackingForm.status === 'failed_delivery' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Failure Reason</label>
                      <select value={trackingForm.failureReason} onChange={e => setTrackingForm({...trackingForm, failureReason: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <option value="">Select reason...</option>
                        {FAILURE_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  )}
                  {trackingForm.status === 'delivered' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery OTP (ask the customer)</label>
                      <input type="text" value={trackingForm.otp} onChange={e => setTrackingForm({...trackingForm, otp: e.target.value})}
                        placeholder="4-digit OTP"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Current Location *</label>
                    <input type="text" value={trackingForm.location} onChange={e => setTrackingForm({...trackingForm, location: e.target.value})}
                      placeholder="e.g. Bhopal Sorting Center"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Tracking Note</label>
                    <textarea value={trackingForm.note} onChange={e => setTrackingForm({...trackingForm, note: e.target.value})} rows={3}
                      placeholder="Additional notes..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleUpdateTracking} disabled={updating}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {updating ? 'Updating...' : 'Update Tracking'}
                  </button>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
