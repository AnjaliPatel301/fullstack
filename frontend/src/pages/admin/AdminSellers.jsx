import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiCheck, FiSlash, FiEye, FiChevronDown, FiPercent, FiUsers } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-700', badge: '🕐' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700',   badge: '✅' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700',       badge: '❌' },
  blocked:  { label: 'Blocked',  color: 'bg-gray-100 text-gray-600',     badge: '🚫' },
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [commissionInput, setCommissionInput] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [defaultCommission, setDefaultCommission] = useState('10');

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const [sellersData, analyticsData] = await Promise.all([
        adminAPI.getAllSellers({ status: statusFilter || undefined, limit: 50 }),
        adminAPI.getSellerAnalytics(),
      ]);
      setSellers(sellersData.sellers || []);
      setTotal(sellersData.total || 0);
      setAnalytics(analyticsData.analytics || null);
    } catch (err) {
      console.error('Error fetching sellers:', err);
      toast.error(err.message || 'Failed to load sellers');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSellers(); }, [statusFilter]);

  const handleStatusUpdate = async (sellerId, status, reason = '') => {
    setUpdatingId(sellerId);
    try {
      await adminAPI.updateSellerStatus(sellerId, { status, rejectionReason: reason });
      toast.success(`Seller ${status}!`);
      fetchSellers();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setUpdatingId(null); }
  };

  const handleCommissionUpdate = async (sellerId, pct) => {
    if (pct === '' || isNaN(pct) || pct < 0 || pct > 100) { toast.error('Commission must be 0–100'); return; }
    setUpdatingId(sellerId);
    try {
      await adminAPI.updateSellerCommission(sellerId, { commissionPercentage: Number(pct) });
      toast.success('Commission updated!');
      fetchSellers();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setUpdatingId(null); }
  };

  const openDetail = async (seller) => {
    setSelectedSeller(seller);
    setCommissionInput(String(seller.commissionPercentage));
    setShowDetailModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Sellers</h1>
            <p className="text-gray-500 mt-1">{total} registered sellers</p>
          </div>
          {/* Default commission */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <FiPercent className="w-4 h-4 text-gray-400" />
            <input type="number" value={defaultCommission} onChange={e => setDefaultCommission(e.target.value)}
              min={0} max={100} className="w-16 text-sm focus:outline-none text-center font-medium" />
            <span className="text-sm text-gray-500">% default</span>
            <button onClick={async () => {
              try { await adminAPI.setDefaultCommission({ defaultCommission: Number(defaultCommission) }); toast.success('Default commission set!'); }
              catch (err) { toast.error(err.message); }
            }} className="ml-2 text-xs px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-700 font-medium">Set</button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Sellers', value: analytics.totalSellers, color: 'bg-blue-50 text-blue-700' },
              { label: 'Active', value: analytics.activeSellers, color: 'bg-green-50 text-green-700' },
              { label: 'Pending', value: analytics.pendingSellers, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Commission Earned', value: fmt(analytics.totalPlatformCommission), color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Month Revenue', value: fmt(analytics.monthlySellerRevenue), color: 'bg-purple-50 text-purple-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-2xl p-4 ${color}`}>
                <p className="text-xs font-medium opacity-70">{label}</p>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white appearance-none">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Seller', 'Shop', 'Contact', 'Products', 'Revenue', 'Commission', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded-lg" /></td></tr>
                )) : sellers.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="text-center py-16 text-gray-400">
                      <FiUsers className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No sellers found</p>
                    </div>
                  </td></tr>
                ) : sellers.map(seller => {
                  const cfg = STATUS_CONFIG[seller.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{seller.user?.name}</p>
                          <p className="text-xs text-gray-400">{seller.user?.email}</p>
                          <p className="text-xs text-gray-400">{new Date(seller.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {seller.logo && <img src={seller.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{seller.shopName}</p>
                            <p className="text-xs text-gray-400">/{seller.shopSlug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600">{seller.user?.phone || '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-28">{seller.address || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-gray-800">{seller.stats?.productCount || 0}</p>
                        <p className="text-xs text-gray-400">{seller.stats?.orderCount || 0} orders</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{fmt(seller.stats?.totalRevenue)}</p>
                        <p className="text-xs text-green-600">+{fmt(seller.stats?.commissionEarned)} fee</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <input type="number" defaultValue={seller.commissionPercentage} min={0} max={100}
                            id={`commission-${seller._id}`}
                            className="w-14 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-gray-300" />
                          <span className="text-xs text-gray-400">%</span>
                          <button onClick={() => {
                            const val = document.getElementById(`commission-${seller._id}`)?.value;
                            handleCommissionUpdate(seller._id, val);
                          }} disabled={updatingId === seller._id}
                            className="text-xs px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50 transition-colors">
                            ✓
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                          {cfg.badge} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openDetail(seller)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Details">
                            <FiEye className="w-4 h-4" />
                          </button>
                          {seller.status !== 'approved' && (
                            <button onClick={() => handleStatusUpdate(seller._id, 'approved')}
                              disabled={updatingId === seller._id}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          {seller.status !== 'blocked' && seller.status !== 'rejected' && (
                            <button onClick={() => handleStatusUpdate(seller._id, 'blocked')}
                              disabled={updatingId === seller._id}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Block">
                              <FiSlash className="w-4 h-4" />
                            </button>
                          )}
                          {seller.status === 'blocked' && (
                            <button onClick={() => handleStatusUpdate(seller._id, 'approved')}
                              disabled={updatingId === seller._id}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Unblock">
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seller Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedSeller && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-800 text-lg">Seller Details</h3>
                  <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
                </div>

                {/* Shop info */}
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-5">
                  {selectedSeller.logo ? (
                    <img src={selectedSeller.logo} className="w-14 h-14 rounded-xl object-cover" alt="" />
                  ) : (
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl font-bold text-indigo-600">
                      {selectedSeller.shopName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{selectedSeller.shopName}</p>
                    <p className="text-sm text-gray-500">/{selectedSeller.shopSlug}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${STATUS_CONFIG[selectedSeller.status]?.color}`}>
                      {selectedSeller.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-5 text-sm">
                  {[
                    ['Name', selectedSeller.user?.name],
                    ['Email', selectedSeller.user?.email],
                    ['Phone', selectedSeller.user?.phone || selectedSeller.phone || '—'],
                    ['Address', selectedSeller.address || '—'],
                    ['Registered', new Date(selectedSeller.createdAt).toLocaleDateString('en-IN')],
                    ['Products', selectedSeller.stats?.productCount || 0],
                    ['Orders', selectedSeller.stats?.orderCount || 0],
                    ['Total Revenue', fmt(selectedSeller.stats?.totalRevenue)],
                    ['Commission Earned', fmt(selectedSeller.stats?.commissionEarned)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {selectedSeller.description && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm text-gray-600">
                    {selectedSeller.description}
                  </div>
                )}

                {/* Commission update */}
                <div className="bg-indigo-50 rounded-xl p-4 mb-5">
                  <p className="text-sm font-semibold text-indigo-800 mb-2">Commission: {selectedSeller.commissionPercentage}%</p>
                  <div className="flex gap-2">
                    <input type="number" value={commissionInput} onChange={e => setCommissionInput(e.target.value)}
                      min={0} max={100} className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg text-sm" placeholder="New %" />
                    <button onClick={() => handleCommissionUpdate(selectedSeller._id, commissionInput)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                      Update
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedSeller.status !== 'approved' && (
                    <button onClick={() => handleStatusUpdate(selectedSeller._id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm">
                      <FiCheck className="w-4 h-4" /> Approve
                    </button>
                  )}
                  {selectedSeller.status === 'pending' && (
                    <div className="flex gap-2 flex-1">
                      <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason..." className="flex-1 px-3 py-2 border border-red-200 rounded-xl text-sm" />
                      <button onClick={() => handleStatusUpdate(selectedSeller._id, 'rejected', rejectionReason)}
                        className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 text-sm">Reject</button>
                    </div>
                  )}
                  {selectedSeller.status === 'approved' && (
                    <button onClick={() => handleStatusUpdate(selectedSeller._id, 'blocked')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 text-sm">
                      <FiSlash className="w-4 h-4" /> Block
                    </button>
                  )}
                  {selectedSeller.status === 'blocked' && (
                    <button onClick={() => handleStatusUpdate(selectedSeller._id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm">
                      <FiCheck className="w-4 h-4" /> Unblock
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
