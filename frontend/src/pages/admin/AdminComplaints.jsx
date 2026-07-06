import { useState, useEffect } from 'react';
import { FiMessageSquare, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { complaintAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

const statusColors = {
  open: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: '', adminResponse: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const d = await complaintAPI.adminGetAll(); setComplaints(d.complaints || []); }
    catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await complaintAPI.adminUpdate(selected._id, form);
      toast.success('Complaint updated!');
      setSelected(null);
      fetch();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complaint Management</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
          complaints.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No complaints yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['User', 'Category', 'Description', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{c.user?.name}</p>
                      <p className="text-xs text-gray-500">{c.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{c.category?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{c.description}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(c); setForm({ status: c.status, adminResponse: c.adminResponse || '' }); }}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                        <FiEye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Complaint Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="space-y-3 mb-4">
                <div><span className="text-xs text-gray-500">User:</span> <strong>{selected.user?.name}</strong></div>
                <div><span className="text-xs text-gray-500">Category:</span> <strong className="capitalize">{selected.category?.replace(/_/g, ' ')}</strong></div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Description:</p>
                  <p className="text-sm text-gray-700">{selected.description}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {['open','in_progress','resolved','closed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Admin Response</label>
                  <textarea value={form.adminResponse} onChange={e => setForm({...form, adminResponse: e.target.value})} rows={3}
                    placeholder="Respond to the customer..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdate} disabled={saving}
                    className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
