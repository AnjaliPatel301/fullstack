import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';
import sellerApiInstance from 'axios';
import axios from 'axios';

// We need to call the auth update-password route using the seller's JWT token
const sellerAxios = axios.create({ baseURL: '/api/v1' });
sellerAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxefit_seller_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function SellerProfile() {
  const { seller, sellerUser } = useSellerStore();
  const [form, setForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (error) setError('');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }

    setSaving(true);
    try {
      await sellerAxios.put('/auth/update-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-indigo-600" /> Account Information
          </h3>
          <div className="space-y-4">
            {[
              { icon: FiUser, label: 'Full Name', value: sellerUser?.name },
              { icon: FiMail, label: 'Email', value: sellerUser?.email },
              { icon: FiPhone, label: 'Phone', value: sellerUser?.phone || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl space-y-1">
            <p className="text-xs text-indigo-700 font-medium">Shop: {seller?.shopName}</p>
            <p className="text-xs text-indigo-500">Status: <span className="capitalize font-semibold">{seller?.status}</span></p>
            <p className="text-xs text-indigo-500">Slug: /{seller?.shopSlug}</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FiLock className="w-5 h-5 text-indigo-600" /> Change Password
          </h3>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { label: 'Current Password', field: 'currentPassword', placeholder: 'Enter current password' },
              { label: 'New Password', field: 'newPassword', placeholder: 'Min 6 characters' },
              { label: 'Confirm New Password', field: 'confirmPassword', placeholder: 'Re-enter new password' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="password" value={form[field]} onChange={set(field)} required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white" />
              </div>
            ))}
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 text-sm transition-colors">
              <FiSave className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </SellerLayout>
  );
}
