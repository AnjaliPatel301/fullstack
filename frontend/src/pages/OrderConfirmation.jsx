import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOne(id).then(data => setOrder(data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-28 min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="pt-28 min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
          <p className="text-gray-500 mb-2">Thank you for shopping with LuxeFit!</p>
          {order && <p className="text-red-600 font-semibold mb-8">Order #{order.orderNumber}</p>}

          {order && (
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiPackage className="text-red-600" /> Order Details</h3>
              <div className="space-y-3 mb-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image || item.product?.images?.[0]} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size && `Size: ${item.size}`} {item.color && `• ${item.color}`} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Total Paid</span><span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Payment</span><span className="text-green-600 font-medium capitalize">{order.isPaid ? '✅ Paid' : 'Pending'}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivering to</span><span>{order.shippingAddress?.city}, {order.shippingAddress?.state}</span></div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/orders" className="flex-1 btn-outline py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <FiPackage className="w-4 h-4" /> Track Orders
            </Link>
            <Link to="/shop" className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              Continue Shopping <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
