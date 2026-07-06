import { useState, useEffect } from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationAPI } from '../../services/api';

export default function MyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getMy();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(n => n.map(x => ({...x, isRead: true})));
      setUnread(0);
      toast.success('All marked as read');
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(n => n.map(x => x._id === id ? {...x, isRead: true} : x));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Notifications {unread > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-bold">{unread}</span>}</h2>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <FiCheckCircle className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>
      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
      notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${n.isRead ? 'border-gray-100 opacity-70' : 'border-blue-100 bg-blue-50/30'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  n.type === 'push' ? 'bg-blue-100 text-blue-700' : n.type === 'email' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>{n.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
