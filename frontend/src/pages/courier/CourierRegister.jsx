import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { courierAPI } from '../../services/api';

export default function CourierRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', deliveryPersonName: '', email: '', password: '', mobile: '', vehicleNumber: '', serviceAreas: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courierAPI.register({
        ...form,
        serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Registration submitted! Await admin approval.');
      navigate('/courier/login');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const fields = [
    { label: 'Courier Company Name *', key: 'companyName', type: 'text', placeholder: 'e.g. BlueDart, Delhivery' },
    { label: 'Your Full Name *', key: 'deliveryPersonName', type: 'text', placeholder: 'Your name' },
    { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'you@email.com' },
    { label: 'Password *', key: 'password', type: 'password', placeholder: '••••••••' },
    { label: 'Mobile Number *', key: 'mobile', type: 'tel', placeholder: '+91 9999999999' },
    { label: 'Vehicle Number (Optional)', key: 'vehicleNumber', type: 'text', placeholder: 'MH 01 AB 1234' },
    { label: 'Service Areas (comma separated)', key: 'serviceAreas', type: 'text', placeholder: 'Mumbai, Pune, Nashik' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiTruck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Courier Partner Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Register to start delivering orders</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                placeholder={f.placeholder} required={f.label.includes('*')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
            After registration, your account will be reviewed by our admin team. You'll be notified once approved.
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <Link to="/courier/login" className="text-blue-600 hover:text-blue-800 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
