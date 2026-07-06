import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { commissionAPI, adminAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

export default function AdminCommission() {
  const [commissions, setCommissions] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalPct, setGlobalPct] = useState('10');
  const [catForm, setCatForm] = useState({ category: '', percentage: '' });
  const [sellerForm, setSellerForm] = useState({ sellerId: '', percentage: '' });
  const [saving, setSaving] = useState(false);

  const categories = ['Men\'s Fashion', 'Women\'s Fashion', 'Kids Fashion', 'Accessories', 'Footwear', 'Ethnic Wear', 'Sports', 'Electronics'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [commData, sellersData] = await Promise.all([
        commissionAPI.getAll(),
        adminAPI.getAllSellers({ limit: 100 }),
      ]);
      setCommissions(commData.commissions || []);
      setSellers(sellersData.sellers || []);
      const global = commData.commissions?.find(c => c.type === 'global');
      if (global) setGlobalPct(String(global.percentage));
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveGlobal = async () => {
    setSaving(true);
    try {
      await commissionAPI.setGlobal({ percentage: Number(globalPct) });
      toast.success('Global commission saved!');
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const saveCategoryComm = async () => {
    if (!catForm.category || !catForm.percentage) return toast.error('Fill all fields');
    setSaving(true);
    try {
      await commissionAPI.setCategory({ category: catForm.category, percentage: Number(catForm.percentage) });
      toast.success('Category commission saved!');
      setCatForm({ category: '', percentage: '' });
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const saveSellerComm = async () => {
    if (!sellerForm.sellerId || !sellerForm.percentage) return toast.error('Fill all fields');
    setSaving(true);
    try {
      await commissionAPI.setSeller({ sellerId: sellerForm.sellerId, percentage: Number(sellerForm.percentage) });
      toast.success('Seller commission saved!');
      setSellerForm({ sellerId: '', percentage: '' });
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteComm = async (id) => {
    try {
      await commissionAPI.delete(id);
      toast.success('Commission deleted');
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commission Management</h1>
        <p className="text-gray-500 text-sm mb-6">Priority: Seller Commission {'>'} Category Commission {'>'} Global Commission</p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Global Commission */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Global Commission</h2>
            <p className="text-sm text-gray-500 mb-3">Applied to all products by default</p>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input type="number" min="0" max="100" value={globalPct} onChange={e => setGlobalPct(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
              <button onClick={saveGlobal} disabled={saving}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                Save
              </button>
            </div>
          </div>

          {/* Category Commission */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Commission</h2>
            <select value={catForm.category} onChange={e => setCatForm({...catForm, category: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input type="number" min="0" max="100" placeholder="%" value={catForm.percentage}
                  onChange={e => setCatForm({...catForm, percentage: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
              <button onClick={saveCategoryComm} disabled={saving}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
                Set
              </button>
            </div>
          </div>

          {/* Seller Commission */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seller Commission</h2>
            <select value={sellerForm.sellerId} onChange={e => setSellerForm({...sellerForm, sellerId: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3">
              <option value="">Select Seller</option>
              {sellers.map(s => <option key={s._id} value={s._id}>{s.shopName}</option>)}
            </select>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input type="number" min="0" max="100" placeholder="%" value={sellerForm.percentage}
                  onChange={e => setSellerForm({...sellerForm, percentage: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8" />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
              <button onClick={saveSellerComm} disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                Set
              </button>
            </div>
          </div>
        </div>

        {/* Existing Commissions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">All Commission Rules</h2>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No commission rules set</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Type', 'Target', 'Commission %', 'Last Updated', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.type === 'global' ? 'bg-gray-100 text-gray-700' :
                        c.type === 'category' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.category || c.seller?.shopName || 'All Products'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{c.percentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.updatedAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {c.type !== 'global' && (
                        <button onClick={() => deleteComm(c._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      )}
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
