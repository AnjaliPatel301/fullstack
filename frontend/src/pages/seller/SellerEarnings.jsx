import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiClock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatBox = ({ label, value, sub, color, icon: Icon }) => (
  <div className={`rounded-2xl p-5 ${color}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-5 h-5 opacity-70" />
      <span className="text-sm font-medium opacity-80">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
  </div>
);

export default function SellerEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await sellerAPI.getEarnings();
      setData(res);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchEarnings(); }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) < 100) {
      toast.error('Minimum withdrawal is ₹100'); return;
    }
    setSubmitting(true);
    try {
      await sellerAPI.requestWithdrawal({ amount: Number(withdrawAmount), notes: withdrawNotes });
      toast.success('Withdrawal request submitted!');
      setShowWithdrawForm(false);
      setWithdrawAmount(''); setWithdrawNotes('');
      fetchEarnings();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const WITHDRAWAL_STATUS = {
    pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700', icon: FiClock },
    approved:  { label: 'Approved',  color: 'bg-blue-100 text-blue-700',     icon: FiCheck },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700',   icon: FiCheck },
    rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700',       icon: FiX },
  };

  if (loading) return (
    <SellerLayout>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
      </div>
    </SellerLayout>
  );

  const e = data?.earnings || {};
  const maxRev = Math.max(...(data?.revenueByMonth?.map(r => r.revenue) || [1]));

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 text-sm mt-1">Commission: {e.commissionPercentage}% (set by admin)</p>
        </div>
        <button onClick={() => setShowWithdrawForm(true)}
          className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm shadow-md">
          Request Withdrawal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatBox label="Total Sales" value={fmt(e.totalSales)} sub={`${e.totalOrders} orders delivered`}
          color="bg-gradient-to-br from-green-500 to-emerald-400 text-white" icon={FiDollarSign} />
        <StatBox label="Net Earnings" value={fmt(e.netEarnings)} sub={`After ${e.commissionPercentage}% commission`}
          color="bg-gradient-to-br from-indigo-500 to-purple-500 text-white" icon={FiTrendingUp} />
        <StatBox label="Available Balance" value={fmt(e.availableBalance)} sub="Ready to withdraw"
          color="bg-gradient-to-br from-blue-500 to-cyan-400 text-white" icon={FiDollarSign} />
        <StatBox label="This Month Sales" value={fmt(e.monthSales)} sub={`Net: ${fmt(e.monthNet)}`}
          color="bg-white border border-gray-100 text-gray-800" icon={FiTrendingUp} />
        <StatBox label="Commission Deducted" value={fmt(e.totalCommission)} sub="Platform fee"
          color="bg-white border border-gray-100 text-gray-800" icon={FiAlertCircle} />
        <StatBox label="Total Withdrawn" value={fmt(e.totalWithdrawn)} sub="All time"
          color="bg-white border border-gray-100 text-gray-800" icon={FiCheck} />
      </div>

      {/* Revenue Chart */}
      {data?.revenueByMonth?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-5">Monthly Revenue</h3>
          <div className="flex items-end gap-2 h-40">
            {data.revenueByMonth.map((m, i) => {
              const height = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{fmt(m.revenue)}</span>
                  <div className="w-full bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-lg"
                    style={{ height: `${Math.max(height, 4)}%` }} title={fmt(m.revenue)} />
                  <span className="text-xs text-gray-400">{MONTHS[(m._id.month || 1) - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Withdrawal History</h3>
        </div>
        {!data?.withdrawals?.length ? (
          <div className="py-10 text-center text-gray-400">
            <p className="text-sm">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.withdrawals.map(w => {
              const cfg = WITHDRAWAL_STATUS[w.status] || WITHDRAWAL_STATUS.pending;
              return (
                <div key={w._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-800">{fmt(w.amount)}</p>
                    <p className="text-xs text-gray-400">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</p>
                    {w.transactionId && <p className="text-xs text-gray-500 mt-0.5">Txn: {w.transactionId}</p>}
                    {w.adminNotes && <p className="text-xs text-amber-600 mt-0.5">{w.adminNotes}</p>}
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800 text-lg">Request Withdrawal</h3>
                <button onClick={() => setShowWithdrawForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
              </div>
              <div className="bg-green-50 rounded-xl p-4 mb-5">
                <p className="text-sm text-green-700">
                  <strong>Available Balance:</strong> {fmt(e.availableBalance)}
                </p>
                <p className="text-xs text-green-600 mt-1">Minimum withdrawal: ₹100</p>
              </div>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₹) *</label>
                  <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    min={100} max={e.availableBalance} required placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (optional)</label>
                  <textarea value={withdrawNotes} onChange={e => setWithdrawNotes(e.target.value)} rows={2}
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                  Payment will be processed to your registered bank account. Ensure your bank details are updated in Shop Settings.
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowWithdrawForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 text-sm">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SellerLayout>
  );
}
