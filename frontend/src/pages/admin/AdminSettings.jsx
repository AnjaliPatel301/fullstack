import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

const tabs = ['General', 'Payment', 'Shipping', 'Tax', 'SEO', 'Email'];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.get().then(d => setSettings(d.settings || {})).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setSettings(s => ({...s, [key]: val}));

  const renderField = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <input type={type} value={settings[key] || ''} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
    </div>
  );

  const renderToggle = (label, key, description) => (
    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button onClick={() => set(key, !settings[key])} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[key] ? 'bg-gray-900' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="flex gap-6">
            {/* Tabs */}
            <div className="w-48 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {activeTab === 'General' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">General Settings</h2>
                  {renderField('Website Name', 'siteName', 'text', 'LuxeFit')}
                  {renderField('Logo URL', 'logo', 'url', 'https://...')}
                  {renderField('Favicon URL', 'favicon', 'url', 'https://...')}
                  {renderField('Contact Email', 'contactEmail', 'email', 'admin@example.com')}
                  {renderField('Contact Phone', 'contactPhone', 'text', '+91 9999999999')}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Business Address</label>
                    <textarea value={settings.address || ''} onChange={e => set('address', e.target.value)} rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                </div>
              )}
              {activeTab === 'Payment' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Payment Settings</h2>
                  {renderToggle('Cash on Delivery (COD)', 'codEnabled', 'Allow customers to pay on delivery')}
                  {renderField('Razorpay Key ID', 'razorpayKeyId', 'text', 'rzp_...')}
                  {renderField('Razorpay Key Secret', 'razorpayKeySecret', 'password', '***')}
                  {renderField('UPI ID', 'upiId', 'text', 'yourname@upi')}
                </div>
              )}
              {activeTab === 'Shipping' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Shipping Settings</h2>
                  {renderField('Default Shipping Charge (₹)', 'defaultShippingCharge', 'number', '50')}
                  {renderField('Free Shipping Threshold (₹)', 'freeShippingThreshold', 'number', '499')}
                </div>
              )}
              {activeTab === 'Tax' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Tax Settings</h2>
                  {renderField('GST Percentage (%)', 'gstPercentage', 'number', '18')}
                  <p className="text-sm text-gray-500">Category-specific taxes can be configured per category in the Category Management section.</p>
                </div>
              )}
              {activeTab === 'SEO' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">SEO Settings</h2>
                  {renderField('Meta Title', 'metaTitle', 'text', 'LuxeFit - Premium Fashion')}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Meta Description</label>
                    <textarea value={settings.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} rows={3}
                      placeholder="Website description for search engines..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                </div>
              )}
              {activeTab === 'Email' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Email (SMTP) Settings</h2>
                  {renderField('SMTP Host', 'smtpHost', 'text', 'smtp.gmail.com')}
                  {renderField('SMTP Port', 'smtpPort', 'number', '587')}
                  {renderField('SMTP Username', 'smtpUser', 'email', 'your@email.com')}
                  {renderField('SMTP Password', 'smtpPass', 'password', '***')}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
