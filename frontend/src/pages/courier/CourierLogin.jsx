import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiTruck, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCourierStore } from '../../store/courierStore';

export default function CourierLogin() {
  const navigate = useNavigate();
  const { courierLogin, isLoading } = useCourierStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await courierLogin(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/courier/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiTruck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Courier Partner Login</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your deliveries</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                placeholder="courier@example.com"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Not registered yet?{' '}
            <Link to="/courier/register" className="text-blue-600 hover:text-blue-800 font-medium">Apply as Courier Partner</Link>
          </p>
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">← Back to Store</Link>
        </div>
      </div>
    </div>
  );
}
