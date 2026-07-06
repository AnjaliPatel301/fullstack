import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { couponAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import { formatDateShort } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: 0, maxDiscount: '', usageLimit: 100, isActive: true,
  expiresAt: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try { const data = await couponAPI.getAll(); setCoupons(data.coupons || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '' }); setEditId(c._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount), usageLimit: Number(form.usageLimit), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined, expiresAt: form.expiresAt || undefined };
    try {
      if (editId) { await couponAPI.update(editId, payload); toast.success('Coupon updated!'); }
      else { await couponAPI.create(payload); toast.success('Coupon created!'); }
      setShowForm(false); fetchCoupons();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await couponAPI.delete(id); toast.success('Coupon deleted'); fetchCoupons(); }
    catch (err) { toast.error(err.message); }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-500 mt-1">{coupons.length} total coupons</p>
          </div>
          <Button variant="primary" onClick={openAdd}><FiPlus className="w-4 h-4" /> Add Coupon</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)
          ) : coupons.map(coupon => (
            <motion.div key={coupon._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${coupon.isActive ? 'border-red-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <code className="text-lg font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg">{coupon.code}</code>
                  <p className="text-xs text-gray-500 mt-2">{coupon.description}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(coupon)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-green-100 text-green-700 text-xs px-2.5 py-1">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                </span>
                <span className="badge bg-blue-50 text-blue-700 text-xs px-2.5 py-1">Min ₹{coupon.minOrderAmount}</span>
                <span className="badge bg-gray-100 text-gray-600 text-xs px-2.5 py-1">{coupon.usedCount}/{coupon.usageLimit} used</span>
                <span className={`badge text-xs px-2.5 py-1 ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {coupon.expiresAt && <p className="text-xs text-gray-400 mt-2">Expires: {formatDateShort(coupon.expiresAt)}</p>}
            </motion.div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800">{editId ? 'Edit Coupon' : 'Add Coupon'}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Coupon Code *</label><input value={form.code} onChange={set('code')} required className="input-field text-sm uppercase" placeholder="WELCOME10" /></div>
                  <div className="col-span-2"><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Description</label><input value={form.description} onChange={set('description')} className="input-field text-sm" placeholder="10% off on first order" /></div>
                  <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Discount Type</label>
                    <select value={form.discountType} onChange={set('discountType')} className="input-field text-sm">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Discount Value *</label><input type="number" value={form.discountValue} onChange={set('discountValue')} required min={0} className="input-field text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Min Order (₹)</label><input type="number" value={form.minOrderAmount} onChange={set('minOrderAmount')} min={0} className="input-field text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={set('maxDiscount')} min={0} className="input-field text-sm" placeholder="No limit" /></div>
                  <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Usage Limit</label><input type="number" value={form.usageLimit} onChange={set('usageLimit')} min={1} className="input-field text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Expires At</label><input type="date" value={form.expiresAt} onChange={set('expiresAt')} className="input-field text-sm" /></div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 text-red-600" /><span className="text-sm text-gray-700">Active</span></label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" fullWidth loading={saving}>{editId ? 'Update' : 'Create'} Coupon</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
