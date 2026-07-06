import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiShoppingBag, FiImage, FiMapPin, FiPhone, FiFileText, FiCreditCard } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import { useSellerStore } from '../../store/sellerStore';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';

export default function SellerShopSettings() {
  const { seller, updateSeller } = useSellerStore();
  const [form, setForm] = useState({
    shopName: '', description: '', phone: '', address: '', logo: '', banner: '',
    bankHolder: '', bankNumber: '', bankIfsc: '', bankName: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (seller) {
      setForm({
        shopName: seller.shopName || '',
        description: seller.description || '',
        phone: seller.phone || '',
        address: seller.address || '',
        logo: seller.logo || '',
        banner: seller.banner || '',
        bankHolder: seller.bankDetails?.accountHolder || '',
        bankNumber: seller.bankDetails?.accountNumber || '',
        bankIfsc: seller.bankDetails?.ifscCode || '',
        bankName: seller.bankDetails?.bankName || '',
      });
    }
  }, [seller]);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await sellerAPI.updateShop({
        shopName: form.shopName,
        description: form.description,
        phone: form.phone,
        address: form.address,
        logo: form.logo,
        banner: form.banner,
        bankDetails: {
          accountHolder: form.bankHolder,
          accountNumber: form.bankNumber,
          ifscCode: form.bankIfsc,
          bankName: form.bankName,
        },
      });
      updateSeller(data.seller);
      toast.success('Shop settings updated!');
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const Field = ({ label, field, type = 'text', placeholder, textarea }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea value={form[field]} onChange={set(field)} rows={3} placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white resize-none" />
      ) : (
        <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white" />
      )}
    </div>
  );

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your shop profile and information</p>
        </div>
        {seller?.shopSlug && (
          <a href={`/api/v1/seller/shop/${seller.shopSlug}`} target="_blank" rel="noreferrer"
            className="text-sm text-indigo-600 hover:underline font-medium">
            View Public Shop →
          </a>
        )}
      </div>

      {/* Shop logo preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
            {form.logo ? (
              <img src={form.logo} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{seller?.shopName?.charAt(0) || '🛍️'}</span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{form.shopName || 'Your Shop'}</h2>
            <p className="text-sm text-gray-500">/{seller?.shopSlug}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              ✓ Approved Seller
            </span>
          </div>
        </div>
        {form.banner && (
          <div className="mt-4 h-28 rounded-xl overflow-hidden">
            <img src={form.banner} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        <Section title="Basic Information" icon={FiShoppingBag}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Shop Name *" field="shopName" placeholder="Your shop name" />
            <Field label="Phone Number" field="phone" placeholder="+91 98765 43210" />
            <div className="sm:col-span-2">
              <Field label="Description" field="description" textarea placeholder="Tell customers about your shop..." />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address" field="address" placeholder="Full shop address" />
            </div>
          </div>
        </Section>

        <Section title="Branding" icon={FiImage}>
          <div className="space-y-4">
            <Field label="Shop Logo URL" field="logo" placeholder="https://your-logo-url.com/logo.png" />
            <Field label="Shop Banner URL" field="banner" placeholder="https://your-banner-url.com/banner.jpg" />
            <p className="text-xs text-gray-400">Use direct image URLs (Cloudinary, Imgur, etc.). Recommended: Logo 200×200, Banner 1200×300.</p>
          </div>
        </Section>

        <Section title="Bank Details (for Withdrawals)" icon={FiCreditCard}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Account Holder Name" field="bankHolder" placeholder="Full name as in bank" />
            <Field label="Bank Name" field="bankName" placeholder="HDFC / SBI / ICICI" />
            <Field label="Account Number" field="bankNumber" placeholder="Your account number" />
            <Field label="IFSC Code" field="bankIfsc" placeholder="HDFC0001234" />
          </div>
          <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-3 rounded-xl">
            ⚠️ Bank details are used for withdrawal processing. Ensure they are accurate. All withdrawals are subject to admin approval.
          </p>
        </Section>

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg text-sm">
          <FiSave className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </form>
    </SellerLayout>
  );
}
