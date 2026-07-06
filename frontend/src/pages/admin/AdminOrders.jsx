import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiEye, FiEdit2, FiTruck } from 'react-icons/fi';
import { orderAPI, adminCourierAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import { formatPrice, formatDateShort, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STATUSES = [
  'pending', 'confirmed', 'packed', 'ready_for_pickup', 'picked_up', 'shipped',
  'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded', 'failed_delivery',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [assignTrackingId, setAssignTrackingId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const openAssignModal = async (order) => {
    setAssigningOrder(order);
    setSelectedCourierId('');
    setAssignTrackingId('');
    try {
      const data = await adminCourierAPI.getAll({ status: 'approved' });
      setCouriers(data.couriers || []);
    } catch { toast.error('Failed to load couriers'); }
  };

  const handleAssignCourier = async () => {
    if (!selectedCourierId) return toast.error('Select a courier partner');
    setAssigning(true);
    try {
      await adminCourierAPI.assignToOrder(assigningOrder._id, { courierId: selectedCourierId, trackingId: assignTrackingId });
      toast.success('Courier assigned!');
      setAssigningOrder(null);
      fetchOrders();
    } catch (err) { toast.error(err.message || 'Failed to assign courier'); }
    finally { setAssigning(false); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderAPI.getAll({ page, limit: 20, status: statusFilter || undefined });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const data = await orderAPI.updateStatus(selectedOrder._id, { status: newStatus, trackingNumber });
      toast.success('Order status updated!');
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
      setSelectedOrder(null);
    } catch (err) { toast.error(err.message || 'Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">{total} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setStatusFilter('')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!statusFilter ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'}`}>{s}</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded" /></td></tr>
                  ))
                ) : orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><p className="font-mono text-sm font-semibold text-gray-800">#{order.orderNumber}</p></td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(order.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length} items</td>
                    <td className="px-4 py-3"><span className="font-bold text-gray-900 text-sm">{formatPrice(order.totalPrice)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs px-2 py-1 ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs px-2 py-1 ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setTrackingNumber(order.trackingNumber || ''); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        {order.status === 'ready_for_pickup' && !order.assignedCourier && (
                          <button onClick={() => openAssignModal(order)} title="Assign Courier"
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                            <FiTruck className="w-4 h-4" />
                          </button>
                        )}
                        {order.assignedCourier && (
                          <span className="text-xs text-gray-400 px-1">🚚 Assigned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update status modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800">Update Order #{selectedOrder.orderNumber}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field text-sm">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tracking Number (optional)</label>
                  <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. IND123456789" className="input-field text-sm" />
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                  <Button variant="primary" fullWidth loading={updatingStatus} onClick={handleUpdateStatus}>Update Status</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Assign courier modal */}
        {assigningOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800">Assign Courier — #{assigningOrder.orderNumber}</h3>
                <button onClick={() => setAssigningOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Courier Partner</label>
                  <select value={selectedCourierId} onChange={e => setSelectedCourierId(e.target.value)} className="input-field text-sm">
                    <option value="">Select a courier...</option>
                    {couriers.map(c => (
                      <option key={c._id} value={c._id}>{c.companyName} — {c.deliveryPersonName}</option>
                    ))}
                  </select>
                  {couriers.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">No approved couriers found. Approve one from Couriers page first.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tracking ID (optional)</label>
                  <input value={assignTrackingId} onChange={e => setAssignTrackingId(e.target.value)} placeholder="Auto-generated if left blank" className="input-field text-sm" />
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setAssigningOrder(null)}>Cancel</Button>
                  <Button variant="primary" fullWidth loading={assigning} onClick={handleAssignCourier}>Assign Courier</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
