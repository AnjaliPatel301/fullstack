import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiPlus, FiTrash2, FiCheck, FiEdit2 } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { userAPI, authAPI } from '../services/api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const TABS = ['Profile', 'Addresses', 'Security'];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await userAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message || 'Failed to update'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 chars'); return; }
    setSavingPassword(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to update password'); }
    finally { setSavingPassword(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const data = await userAPI.addAddress(addressForm);
      updateUser({ addresses: data.addresses });
      setAddingAddress(false);
      setAddressForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added!');
    } catch (err) { toast.error(err.message || 'Failed to add address'); }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const data = await userAPI.deleteAddress(addressId);
      updateUser({ addresses: data.addresses });
      toast.success('Address removed');
    } catch (err) { toast.error(err.message || 'Failed to remove address'); }
  };

  return (
    <div className="pt-28 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            {user?.role === 'admin' && <span className="badge bg-red-100 text-red-700 mt-1">Admin</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-6">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><FiUser className="text-red-600" /> Personal Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', icon: FiUser, type: 'text', placeholder: 'Your full name' },
                { key: 'phone', label: 'Phone Number', icon: FiPhone, type: 'tel', placeholder: '+91 98765 43210' },
              ].map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={type} value={profileForm[key]} onChange={e => setProfileForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} className="input-field pl-11" />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" value={user?.email || ''} disabled className="input-field pl-11 bg-gray-50 cursor-not-allowed text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <Button type="submit" loading={savingProfile} size="lg">Save Changes</Button>
            </form>
          </motion.div>
        )}

        {activeTab === 'Addresses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {user?.addresses?.map(addr => (
              <div key={addr._id} className="bg-white rounded-3xl p-5 shadow-sm flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">{addr.name} {addr.isDefault && <span className="badge bg-green-100 text-green-700 ml-2">Default</span>}</p>
                    <p className="text-sm text-gray-500">{addr.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {addingAddress ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Add New Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['name', 'Full Name'], ['phone', 'Phone'], ['street', 'Street Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'PIN Code']].map(([k, l]) => (
                      <div key={k} className={k === 'street' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                        <input type="text" value={addressForm[k]} onChange={e => setAddressForm(p => ({ ...p, [k]: e.target.value }))} required className="input-field text-sm" />
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">Set as default address</span>
                  </label>
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setAddingAddress(false)}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Address</Button>
                  </div>
                </form>
              </div>
            ) : (
              <button onClick={() => setAddingAddress(true)} className="w-full bg-white border-2 border-dashed border-red-300 rounded-3xl p-6 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                <FiPlus className="w-5 h-5" /> Add New Address
              </button>
            )}
          </motion.div>
        )}

        {activeTab === 'Security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><FiLock className="text-red-600" /> Change Password</h2>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="password" value={passwordForm[key]} onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••" required className="input-field pl-11" />
                  </div>
                </div>
              ))}
              <Button type="submit" loading={savingPassword} size="lg">Update Password</Button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
