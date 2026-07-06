import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiShoppingBag, FiImage, FiMapPin, FiFileText, FiCheck } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const steps = ['Personal Info', 'Shop Info', 'Review'];

export default function SellerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    shopName: '', shopDescription: '', address: '', logo: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validateStep0 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name required';
    if (!form.email.trim()) e.email = 'Email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.shopName.trim()) e.shopName = 'Shop name required';
    if (!form.address.trim()) e.address = 'Shop address required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await sellerAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        shopName: form.shopName,
        shopDescription: form.shopDescription,
        address: form.address,
        logo: form.logo,
      });
      toast.success('Registration successful! Awaiting admin approval.');
      navigate('/seller/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, type = 'text', field, placeholder, error }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type={type} value={form[field]} onChange={set(field)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 focus:ring-indigo-300 bg-gray-50 focus:bg-white'}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Become a Seller</h1>
              <p className="text-indigo-200 text-sm">Join LuxeFit Marketplace</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < step ? 'bg-green-400 text-white' : i === step ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
                }`}>
                  {i < step ? <FiCheck className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium truncate ${i === step ? 'text-white' : 'text-indigo-200'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-green-400' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
              <InputField label="Full Name *" icon={FiUser} field="name" placeholder="Your full name" error={errors.name} />
              <InputField label="Email *" icon={FiMail} type="email" field="email" placeholder="seller@email.com" error={errors.email} />
              <InputField label="Password *" icon={FiLock} type="password" field="password" placeholder="Min 6 characters" error={errors.password} />
              <InputField label="Confirm Password *" icon={FiLock} type="password" field="confirmPassword" placeholder="Re-enter password" error={errors.confirmPassword} />
              <InputField label="Phone Number" icon={FiPhone} field="phone" placeholder="+91 98765 43210" />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Shop Information</h2>
              <InputField label="Shop Name *" icon={FiShoppingBag} field="shopName" placeholder="e.g. Priya's Fashion Hub" error={errors.shopName} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea value={form.shopDescription} onChange={set('shopDescription')} rows={3}
                    placeholder="Tell buyers about your shop..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white resize-none" />
                </div>
              </div>
              <InputField label="Shop Address *" icon={FiMapPin} field="address" placeholder="City, State, Country" error={errors.address} />
              <InputField label="Shop Logo URL" icon={FiImage} field="logo" placeholder="https://your-logo-url.com/logo.png" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Your Details</h2>
              <div className="bg-indigo-50 rounded-2xl p-5 space-y-3">
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Email', value: form.email },
                  { label: 'Phone', value: form.phone || '—' },
                  { label: 'Shop Name', value: form.shopName },
                  { label: 'Address', value: form.address },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                <strong>⏳ Pending Review:</strong> After registration, your account will be reviewed by our admin team. Only approved sellers can access the dashboard. You'll be notified once approved.
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                  ← Back
                </button>
              ) : (
                <Link to="/seller/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Already a seller? Login</Link>
              )}
            </div>
            <div>
              {step < 2 ? (
                <button onClick={handleNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm shadow-lg">
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity text-sm shadow-lg">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
