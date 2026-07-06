import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiShield, FiSlash } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import { formatDateShort } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getAll({ search: search || undefined, limit: 30 });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Make ${user.name} a ${newRole}?`)) return;
    try {
      await userAPI.updateRole(user._id, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      toast.success('Role updated');
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const toggleStatus = async (user) => {
    try {
      await userAPI.toggleStatus(user._id);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">{total} total users</p>
        </div>

        <div className="relative mb-6 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FiX className="w-4 h-4" /></button>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['User', 'Email', 'Phone', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded" /></td></tr>
                ))
              ) : users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs px-2.5 py-1 ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs px-2.5 py-1 ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggleRole(user)} title="Toggle Admin" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiShield className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(user)} title="Toggle Active" className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <FiSlash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
