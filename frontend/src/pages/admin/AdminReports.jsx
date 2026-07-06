import { useState, useEffect } from 'react';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report', icon: '💰' },
  { value: 'orders', label: 'Orders Report', icon: '📦' },
  { value: 'sellers', label: 'Seller Performance', icon: '🏪' },
  { value: 'products', label: 'Product Performance', icon: '👗' },
  { value: 'customers', label: 'Customer Report', icon: '👥' },
  { value: 'commissions', label: 'Commission Report', icon: '💸' },
];

export default function AdminReports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchReport = async () => {
    if (!dateRange.start || !dateRange.end) return toast.error('Select date range');
    setLoading(true);
    try {
      const result = await adminAPI.getSalesReport({ type: reportType, ...dateRange });
      setData(result.data || []);
      setSummary(result.summary || {});
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const downloadCSV = () => {
    if (!data?.length) return;
    const cols = Object.keys(data[0]);
    const csv = [cols.join(','), ...data.map(row => cols.map(c => `"${String(row[c] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${reportType}-report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_TYPES.map(rt => (
                  <button key={rt.value} onClick={() => setReportType(rt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${reportType === rt.value ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                    <span>{rt.icon}</span> {rt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[7, 30, 90].map(d => (
                    <button key={d} onClick={() => setQuickRange(d)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      Last {d}d
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-xs" />
                  </div>
                  <span className="text-gray-400 text-xs">to</span>
                  <div className="relative flex-1">
                    <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-xs" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-3">
              <button onClick={fetchReport} disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              {data?.length > 0 && (
                <button onClick={downloadCSV}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FiDownload className="w-4 h-4" /> Download CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(summary).map(([key, val]) => (
              <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {typeof val === 'number' ? (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('amount') ? `₹${val.toLocaleString('en-IN')}` : val.toLocaleString('en-IN')) : val}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        {data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {data.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No data for selected period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0]).map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                          {h.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
