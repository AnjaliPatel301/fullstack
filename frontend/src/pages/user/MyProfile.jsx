import { useState, useEffect } from 'react';
import { FiUser, FiSave, FiPlus, FiTrash2, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { userAPI } from '../../services/api';

export default function MyProfile() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', phone: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', avatar: user.avatar || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await userAPI.updateProfile(form);
      setUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const data = await userAPI.addAddress(addrForm);
      setAddresses(data.addresses || []);
      setAddrForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      setShowAddrForm(false);
      toast.success('Address added!');
    } catch (err) { toast.error(err.message); }
    finally { setSavingAddr(false); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const data = await userAPI.deleteAddress(id);
      setAddresses(data.addresses || []);
      toast.success('Address removed');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Profile</h2>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiUser className="w-4 h-4" /> Personal Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="w-6 h-6 text-gray-400" />}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Profile Photo URL</label>
              <input type="url" value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})} placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '-'}</span>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FiMapPin className="w-4 h-4" /> Saved Addresses</h3>
          <button onClick={() => setShowAddrForm(!showAddrForm)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <FiPlus className="w-4 h-4" /> Add Address
          </button>
        </div>
        {showAddrForm && (
          <form onSubmit={handleAddAddress} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Street / Area', key: 'street', type: 'text' },
                { label: 'City', key: 'city', type: 'text' },
                { label: 'State', key: 'state', type: 'text' },
                { label: 'Pincode', key: 'pincode', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type} value={addrForm[f.key]} onChange={e => setAddrForm({...addrForm, [f.key]: e.target.value})} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm({...addrForm, isDefault: e.target.checked})} className="rounded" />
              Set as default address
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={savingAddr}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                {savingAddr ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowAddrForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </form>
        )}
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No saved addresses</p>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr._id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{addr.name}</p>
                    {addr.isDefault && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600">{addr.phone}</p>
                  <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 hover:text-red-700 p-1">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
