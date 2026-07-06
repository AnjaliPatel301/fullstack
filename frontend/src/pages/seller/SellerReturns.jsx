import { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  refund_completed: 'bg-emerald-100 text-emerald-700',
};

export default function SellerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerAPI.getReturns().then(d => setReturns(d.returns || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Return Requests</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FiRefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No return requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Product', 'Reason', 'Refund', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">#{r.order?.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-gray-900">{r.user?.name}</p>
                    <p className="text-xs text-gray-500">{r.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.product?.name?.slice(0, 30) || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{r.reason?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{r.refundAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
                      {r.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
