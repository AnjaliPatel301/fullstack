import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiChevronDown, FiDollarSign } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700' },
  approved:  { label: 'Approved',  color: 'bg-blue-100 text-blue-700'    },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700'  },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700'      },
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedW, setSelectedW] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllWithdrawals({ status: statusFilter || undefined });
      setWithdrawals(data.withdrawals || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWithdrawals(); }, [statusFilter]);

  const openModal = (w) => {
    setSelectedW(w);
    setTxnId(w.transactionId || '');
    setAdminNotes(w.adminNotes || '');
    setShowModal(true);
  };

  const handleUpdate = async (status) => {
    setUpdating(true);
    try {
      await adminAPI.updateWithdrawal(selectedW._id, { status, transactionId: txnId, adminNotes });
      toast.success(`Withdrawal ${status}!`);
      setShowModal(false);
      fetchWithdrawals();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  // Summary stats
  const pendingTotal = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
  const completedTotal = withdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + w.amount, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Withdrawals</h1>
            <p className="text-gray-500 mt-1">{total} withdrawal requests</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 rounded-2xl p-5">
            <p className="text-xs text-yellow-700 font-medium">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-800 mt-1">{fmt(pendingTotal)}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-5">
            <p className="text-xs text-green-700 font-medium">Completed (All Time)</p>
            <p className="text-2xl font-bold text-green-800 mt-1">{fmt(completedTotal)}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5">
            <p className="text-xs text-blue-700 font-medium">Total Requests</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{total}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white appearance-none">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Seller', 'Shop', 'Amount', 'Method', 'Requested', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded-lg" /></td></tr>
                )) : withdrawals.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="text-center py-16 text-gray-400">
                      <FiDollarSign className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No withdrawal requests</p>
                    </div>
                  </td></tr>
                ) : withdrawals.map(w => {
                  const cfg = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{w.seller?.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{w.seller?.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{w.seller?.shopName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{fmt(w.amount)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 capitalize">{w.paymentMethod?.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openModal(w)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modal */}
        <AnimatePresence>
          {showModal && selectedW && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-800 text-lg">Withdrawal Request</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2 text-sm">
                  {[
                    ['Seller', selectedW.seller?.user?.name],
                    ['Shop', selectedW.seller?.shopName],
                    ['Amount', fmt(selectedW.amount)],
                    ['Method', selectedW.paymentMethod?.replace(/_/g, ' ')],
                    ['Requested', new Date(selectedW.requestedAt).toLocaleString('en-IN')],
                    ['Status', selectedW.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-800 capitalize">{v}</span>
                    </div>
                  ))}
                  {selectedW.notes && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-500">Seller Notes:</p>
                      <p className="text-gray-700 text-xs mt-1">{selectedW.notes}</p>
                    </div>
                  )}
                </div>

                {/* Bank details */}
                {selectedW.seller?.bankDetails && Object.keys(selectedW.seller.bankDetails).length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-5 text-xs space-y-1">
                    <p className="font-semibold text-blue-800 mb-2">Bank Details</p>
                    {Object.entries(selectedW.seller.bankDetails).map(([k, v]) => v ? (
                      <div key={k} className="flex justify-between text-blue-700">
                        <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ) : null)}
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction ID</label>
                    <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="Enter transaction ID"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Admin Notes</label>
                    <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2}
                      placeholder="Notes for seller..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedW.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdate('approved')} disabled={updating}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 text-sm">
                        <FiCheck className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => handleUpdate('rejected')} disabled={updating}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 text-sm">
                        <FiX className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {selectedW.status === 'approved' && (
                    <button onClick={() => handleUpdate('completed')} disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 text-sm">
                      <FiCheck className="w-4 h-4" /> Mark as Completed
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
