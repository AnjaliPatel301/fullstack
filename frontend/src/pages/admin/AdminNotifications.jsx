import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', type: 'push', targetRole: 'all' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    notificationAPI.adminGetAll().then(d => setNotifications(d.notifications || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) return toast.error('Title and message required');
    setSending(true);
    try {
      await notificationAPI.adminSend(form);
      toast.success('Notification sent!');
      setForm({ title: '', message: '', type: 'push', targetRole: 'all' });
      const data = await notificationAPI.adminGetAll();
      setNotifications(data.notifications || []);
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notification Management</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Send Notification */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiBell className="w-5 h-5" /> Send Notification</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Big Sale Started!"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Message</label>
                  <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} placeholder="Notification message..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="push">Push Notification</option>
                    <option value="email">Email Notification</option>
                    <option value="sms">SMS Notification</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Target Audience</label>
                  <select value={form.targetRole} onChange={e => setForm({...form, targetRole: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="all">All Users</option>
                    <option value="user">Customers Only</option>
                    <option value="seller">Sellers Only</option>
                    <option value="courier">Courier Partners Only</option>
                  </select>
                </div>
                <button onClick={handleSend} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  <FiSend className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>

              {/* Quick templates */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-2">Quick Templates:</p>
                <div className="space-y-2">
                  {[
                    { title: 'Big Sale Started!', message: 'Flat 50% OFF on all items! Shop now.' },
                    { title: 'New Arrivals', message: 'Fresh collection just landed. Check it out!' },
                    { title: 'Weekend Offer', message: 'Special weekend deals available now.' },
                  ].map(t => (
                    <button key={t.title} onClick={() => setForm({...form, title: t.title, message: t.message})}
                      className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 transition-colors">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-gray-500">{t.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notification History */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold">Notification History</h2>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No notifications sent yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(n => (
                    <motion.div key={n._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              n.type === 'push' ? 'bg-blue-100 text-blue-700' :
                              n.type === 'email' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>{n.type}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{n.targetRole}</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                          <p className="text-gray-600 text-sm">{n.message}</p>
                        </div>
                        <p className="text-xs text-gray-400 ml-4">{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
