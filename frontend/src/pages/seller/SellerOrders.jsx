import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiPackage, FiPrinter, FiFileText } from 'react-icons/fi';
import { sellerAPI } from '../../services/api';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:            { label: 'Pending',             color: 'bg-yellow-100 text-yellow-700', badge: '🕐' },
  confirmed:          { label: 'Accepted',             color: 'bg-blue-100 text-blue-700',     badge: '👍' },
  packed:             { label: 'Packed',                color: 'bg-purple-100 text-purple-700', badge: '📦' },
  ready_for_pickup:   { label: 'Ready For Pickup',       color: 'bg-indigo-100 text-indigo-700', badge: '🚪' },
  picked_up:          { label: 'Picked Up',              color: 'bg-indigo-100 text-indigo-700', badge: '🏃' },
  shipped:            { label: 'Shipped',                color: 'bg-indigo-100 text-indigo-700', badge: '🚚' },
  reached_sorting_center: { label: 'At Sorting Center',  color: 'bg-indigo-100 text-indigo-700', badge: '🏭' },
  in_transit:         { label: 'In Transit',              color: 'bg-indigo-100 text-indigo-700', badge: '🚛' },
  reached_destination_city: { label: 'Reached City',      color: 'bg-indigo-100 text-indigo-700', badge: '🏙️' },
  out_for_delivery:   { label: 'Out For Delivery',        color: 'bg-orange-100 text-orange-700', badge: '📮' },
  delivered:          { label: 'Delivered',                color: 'bg-green-100 text-green-700',   badge: '✅' },
  cancelled:          { label: 'Cancelled',                 color: 'bg-red-100 text-red-700',       badge: '❌' },
  returned:           { label: 'Returned',                  color: 'bg-red-100 text-red-700',       badge: '↩️' },
  refunded:           { label: 'Refunded',                  color: 'bg-red-100 text-red-700',       badge: '💸' },
  failed_delivery:    { label: 'Delivery Failed',            color: 'bg-red-100 text-red-700',       badge: '⚠️' },
};

// After 'ready_for_pickup' the courier takes over — seller has no further action.
const SELLER_STAGE_ORDER = ['pending', 'confirmed', 'packed', 'ready_for_pickup'];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await sellerAPI.getOrders({ status: statusFilter || undefined });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const runAction = async (orderId, fn, successMsg) => {
    setUpdatingId(orderId);
    try {
      await fn(orderId);
      toast.success(successMsg);
      fetchOrders();
    } catch (err) { toast.error(err.message || 'Failed to update'); }
    finally { setUpdatingId(null); }
  };

  const handleAccept = (id) => runAction(id, sellerAPI.acceptOrder, 'Order accepted');
  const handlePack = (id) => runAction(id, sellerAPI.packOrder, 'Order marked as packed');
  const handleReadyForPickup = (id) => runAction(id, sellerAPI.readyForPickup, 'Order marked ready for pickup');

  const handleReject = async (id) => {
    setUpdatingId(id);
    try {
      await sellerAPI.rejectOrder(id, { reason: rejectReason });
      toast.success('Order rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchOrders();
    } catch (err) { toast.error(err.message || 'Failed to reject'); }
    finally { setUpdatingId(null); }
  };

  const openPrintWindow = (title, rows) => {
    const win = window.open('', '_blank', 'width=700,height=800');
    win.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 18px; border-bottom: 2px solid #111; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 6px 0; vertical-align: top; }
        td.label { color: #666; width: 160px; }
        .items { margin-top: 16px; border-top: 1px solid #ddd; padding-top: 8px; }
      </style></head>
      <body onload="window.print()">
        <h1>${title}</h1>
        ${rows}
      </body></html>
    `);
    win.document.close();
  };

  const handlePrintInvoice = async (orderId) => {
    try {
      const { invoice } = await sellerAPI.getOrderInvoice(orderId);
      const itemRows = invoice.items.map(i => `<tr><td>${i.name} (x${i.quantity})</td><td style="text-align:right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td></tr>`).join('');
      openPrintWindow(`Invoice — ${invoice.orderNumber}`, `
        <table>
          <tr><td class="label">Order Number</td><td>${invoice.orderNumber}</td></tr>
          <tr><td class="label">Order Date</td><td>${new Date(invoice.orderDate).toLocaleString('en-IN')}</td></tr>
          <tr><td class="label">Sold By</td><td>${invoice.shopName || ''}</td></tr>
          <tr><td class="label">Customer</td><td>${invoice.customer?.name || ''} (${invoice.customer?.phone || ''})</td></tr>
          <tr><td class="label">Ship To</td><td>${invoice.shippingAddress?.street}, ${invoice.shippingAddress?.city}, ${invoice.shippingAddress?.state} - ${invoice.shippingAddress?.pincode}</td></tr>
          <tr><td class="label">Payment</td><td>${invoice.paymentMethod?.toUpperCase()} — ${invoice.isPaid ? 'Paid' : 'Pending'}</td></tr>
        </table>
        <table class="items">${itemRows}
          <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>₹${invoice.itemsTotal.toLocaleString('en-IN')}</strong></td></tr>
        </table>
      `);
    } catch (err) { toast.error(err.message || 'Failed to load invoice'); }
  };

  const handlePrintLabel = async (orderId) => {
    try {
      const { label } = await sellerAPI.getShippingLabel(orderId);
      openPrintWindow(`Shipping Label — ${label.orderNumber}`, `
        <table>
          <tr><td class="label">Order Number</td><td>${label.orderNumber}</td></tr>
          <tr><td class="label">Tracking No.</td><td>${label.trackingNumber || 'Not assigned yet'}</td></tr>
          <tr><td class="label">Courier</td><td>${label.courierCompany || 'Not assigned yet'}</td></tr>
          <tr><td class="label">Ship From</td><td>${label.shopName || ''}</td></tr>
          <tr><td class="label">Ship To</td><td>${label.shippingAddress?.street}, ${label.shippingAddress?.city}, ${label.shippingAddress?.state} - ${label.shippingAddress?.pincode}</td></tr>
          <tr><td class="label">Phone</td><td>${label.customerPhone || ''}</td></tr>
          <tr><td class="label">Items</td><td>${label.itemCount} item(s)</td></tr>
          ${label.codAmount ? `<tr><td class="label">COD Amount</td><td>₹${label.codAmount.toLocaleString('en-IN')}</td></tr>` : ''}
        </table>
      `);
    } catch (err) { toast.error(err.message || 'Failed to load shipping label'); }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{total} orders for your products</p>
        </div>

        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none">
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
        )) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <FiPackage className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Orders for your products will appear here</p>
          </div>
        ) : orders.map(order => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const itemsTotal = order.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
          const canPrint = SELLER_STAGE_ORDER.indexOf(order.status) >= 1 || !SELLER_STAGE_ORDER.includes(order.status);

          return (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cfg.badge}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{fmt(itemsTotal)}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />}
                      <div>
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity} · {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shippingAddress && (
                  <p className="text-xs text-gray-400 mb-3">
                    📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                )}

                {rejectingId === order._id ? (
                  <div className="flex gap-2 items-center">
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (optional)"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    <button onClick={() => handleReject(order._id)} disabled={updatingId === order._id}
                      className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
                      Confirm Reject
                    </button>
                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                      className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleAccept(order._id)} disabled={updatingId === order._id}
                          className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                          {updatingId === order._id ? 'Updating...' : 'Accept Order'}
                        </button>
                        <button onClick={() => setRejectingId(order._id)}
                          className="px-4 py-2 text-sm font-semibold bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                          Reject Order
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => handlePack(order._id)} disabled={updatingId === order._id}
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {updatingId === order._id ? 'Updating...' : 'Pack Order'}
                      </button>
                    )}
                    {order.status === 'packed' && (
                      <button onClick={() => handleReadyForPickup(order._id)} disabled={updatingId === order._id}
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {updatingId === order._id ? 'Updating...' : 'Ready For Pickup'}
                      </button>
                    )}
                    {order.status === 'ready_for_pickup' && (
                      <span className="text-sm text-gray-400 italic px-1 py-2">Waiting for courier pickup…</span>
                    )}

                    {canPrint && (
                      <>
                        <button onClick={() => handlePrintInvoice(order._id)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-1.5">
                          <FiFileText className="w-4 h-4" /> Print Invoice
                        </button>
                        <button onClick={() => handlePrintLabel(order._id)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-1.5">
                          <FiPrinter className="w-4 h-4" /> Shipping Label
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SellerLayout>
  );
}
