import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { returnAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pickup_scheduled: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  refund_initiated: 'bg-orange-100 text-orange-800',
  refund_completed: 'bg-emerald-100 text-emerald-800',
};

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', adminNotes: '', refundAmount: '', refundMethod: 'original_payment' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [returnsData, statsData] = await Promise.all([
        returnAPI.adminGetAll({ status: statusFilter || undefined }),
        returnAPI.adminGetStats(),
      ]);
      setReturns(returnsData.returns || []);
      setStats(statsData.stats || {});
    } catch { toast.error('Failed to load returns'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const openDetail = (ret) => {
    setSelected(ret);
    setForm({ status: ret.status, adminNotes: ret.adminNotes || '', refundAmount: ret.refundAmount || '', refundMethod: ret.refundMethod || 'original_payment' });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await returnAPI.adminUpdate(selected._id, form);
      toast.success('Return updated!');
      setSelected(null);
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Return & Refund Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending', value: stats.pending || 0, color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Approved', value: stats.approved || 0, color: 'bg-green-100 text-green-800' },
            { label: 'Rejected', value: stats.rejected || 0, color: 'bg-red-100 text-red-800' },
            { label: 'Refunded', value: stats.refunded || 0, color: 'bg-emerald-100 text-emerald-800' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{s.label} Returns</p>
              <p className={`text-2xl font-bold px-2 py-1 rounded-lg inline-block ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-3 flex-wrap">
          {['', 'pending', 'under_review', 'approved', 'rejected', 'refund_completed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : returns.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No returns found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Customer', 'Product', 'Reason', 'Refund Amt', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returns.map(ret => (
                  <tr key={ret._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">#{ret.order?.orderNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{ret.user?.name}</div>
                      <div className="text-gray-500 text-xs">{ret.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{ret.product?.name?.slice(0, 25) || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ret.reason?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{ret.refundAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ret.status] || 'bg-gray-100 text-gray-700'}`}>
                        {ret.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(ret.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(ret)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                        <FiEye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Return Request Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><span className="text-gray-500">Customer:</span> <strong>{selected.user?.name}</strong></div>
                <div><span className="text-gray-500">Order:</span> <strong>#{selected.order?.orderNumber}</strong></div>
                <div><span className="text-gray-500">Reason:</span> <strong>{selected.reason?.replace(/_/g, ' ')}</strong></div>
                <div><span className="text-gray-500">Refund Amount:</span> <strong>₹{selected.refundAmount}</strong></div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Description:</p>
                <p className="text-sm bg-gray-50 rounded-lg p-3">{selected.description}</p>
              </div>
              {selected.images?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Evidence Images:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.images.map((img, i) => (
                      <img key={i} src={img} alt="evidence" className="w-16 h-16 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Update Return</h3>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {['pending','under_review','approved','rejected','pickup_scheduled','picked_up','refund_initiated','refund_completed'].map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Refund Method</label>
                  <select value={form.refundMethod} onChange={e => setForm({...form, refundMethod: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="original_payment">Original Payment Source</option>
                    <option value="wallet">Wallet Refund</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Refund Amount (₹)</label>
                  <input type="number" value={form.refundAmount} onChange={e => setForm({...form, refundAmount: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Admin Notes</label>
                  <textarea value={form.adminNotes} onChange={e => setForm({...form, adminNotes: e.target.value})} rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdate} disabled={updating}
                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {updating ? 'Updating...' : 'Update Return'}
                  </button>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
