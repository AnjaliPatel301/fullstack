import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { bannerAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

const emptyForm = { title: '', image: '', mobileImage: '', redirectLink: '', type: 'desktop', category: '', sortOrder: 0, startDate: '', endDate: '' };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerAPI.adminGetAll();
      setBanners(data.banners || []);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (b) => {
    setForm({ title: b.title, image: b.image, mobileImage: b.mobileImage || '', redirectLink: b.redirectLink || '', type: b.type, category: b.category || '', sortOrder: b.sortOrder || 0, startDate: b.startDate ? b.startDate.slice(0, 10) : '', endDate: b.endDate ? b.endDate.slice(0, 10) : '' });
    setEditId(b._id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) return toast.error('Title and image URL are required');
    setSaving(true);
    try {
      if (editId) {
        await bannerAPI.adminUpdate(editId, form);
        toast.success('Banner updated!');
      } else {
        await bannerAPI.adminCreate(form);
        toast.success('Banner created!');
      }
      setShowModal(false);
      fetchBanners();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await bannerAPI.adminToggle(id);
      fetchBanners();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await bannerAPI.adminDelete(id);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <button onClick={openCreate} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
            <FiPlus className="w-4 h-4" /> Add Banner
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {banners.map(banner => (
              <motion.div key={banner._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative">
                  <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" onError={e => e.target.src = 'https://via.placeholder.com/400x200?text=Banner'} />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{banner.type}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                  {banner.redirectLink && <p className="text-xs text-blue-600 mb-2 truncate">{banner.redirectLink}</p>}
                  {banner.startDate && <p className="text-xs text-gray-500">From: {new Date(banner.startDate).toLocaleDateString('en-IN')}</p>}
                  {banner.endDate && <p className="text-xs text-gray-500">Until: {new Date(banner.endDate).toLocaleDateString('en-IN')}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(banner)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                      <FiEdit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleToggle(banner._id)} className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800">
                      {banner.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 ml-auto">
                      <FiTrash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">{editId ? 'Edit Banner' : 'Add Banner'}</h2>
              <div className="space-y-4">
                {[
                  { label: 'Title *', key: 'title', type: 'text' },
                  { label: 'Desktop Image URL *', key: 'image', type: 'url' },
                  { label: 'Mobile Image URL', key: 'mobileImage', type: 'url' },
                  { label: 'Redirect Link', key: 'redirectLink', type: 'url' },
                  { label: 'Sort Order', key: 'sortOrder', type: 'number' },
                  { label: 'Start Date', key: 'startDate', type: 'date' },
                  { label: 'End Date', key: 'endDate', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-600 mb-1 block">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {['desktop','mobile','category','festival'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {form.image && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
