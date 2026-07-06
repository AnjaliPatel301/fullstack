import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiCheck, FiX, FiPause } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AdminNav } from './AdminDashboard';

const api = axios.create({ baseURL: '/api/v1' });
api.interceptors.request.use(c => { const t = localStorage.getItem('luxefit_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r.data, e => Promise.reject(new Error(e.response?.data?.message || e.message)));

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/courier/admin/all', { params: { status: statusFilter || undefined } });
      setCouriers(data.couriers || []);
    } catch { toast.error('Failed to load couriers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCouriers(); }, [statusFilter]);

  const updateStatus = async (id, status, rejectionReason = '') => {
    setUpdatingId(id);
    try {
      await api.put(`/courier/admin/${id}/status`, { status, rejectionReason });
      toast.success(`Courier ${status}!`);
      fetchCouriers();
    } catch (err) { toast.error(err.message); }
    finally { setUpdatingId(null); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', suspended: 'bg-orange-100 text-orange-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Courier Partner Management</h1>

        <div className="flex gap-3 mb-6 flex-wrap">
          {['', 'pending', 'approved', 'suspended', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : couriers.length === 0 ? (
            <div className="text-center py-12">
              <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No courier partners found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Courier', 'Company', 'Mobile', 'Vehicle', 'Service Areas', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {couriers.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {c.deliveryPersonName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.deliveryPersonName}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.mobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.vehicleNumber || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.serviceAreas?.slice(0, 2).join(', ') || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.status !== 'approved' && (
                          <button onClick={() => updateStatus(c._id, 'approved')} disabled={updatingId === c._id}
                            title="Approve" className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.status === 'approved' && (
                          <button onClick={() => updateStatus(c._id, 'suspended')} disabled={updatingId === c._id}
                            title="Suspend" className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                            <FiPause className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.status !== 'rejected' && (
                          <button onClick={() => updateStatus(c._id, 'rejected')} disabled={updatingId === c._id}
                            title="Reject" className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
