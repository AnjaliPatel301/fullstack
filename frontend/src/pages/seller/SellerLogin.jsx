import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';
import toast from 'react-hot-toast';

export default function SellerLogin() {
  const navigate = useNavigate();
  const { login, isLoading } = useSellerStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form);
    if (result.success) {
      toast.success('Welcome back to your seller dashboard!');
      navigate('/seller/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Seller Portal</h1>
          <p className="text-indigo-200 mt-1 text-sm">LuxeFit Marketplace</p>
        </div>

        <div className="p-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-5">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" value={form.email} onChange={set('email')} required
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" value={form.password} onChange={set('password')} required
                  placeholder="Your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg text-sm mt-2">
              {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Not a seller yet?{' '}
              <Link to="/seller/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Apply Now →
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Customer or Admin?{' '}
              <Link to="/login" className="text-gray-600 hover:text-gray-800 underline">Login here</Link>
            </p>
          </div>

          <div className="mt-6 bg-indigo-50 rounded-xl p-4 text-xs text-indigo-700">
            <strong>Note:</strong> Only approved sellers can access the dashboard. If your status is pending, please wait for admin approval.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
