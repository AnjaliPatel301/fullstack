import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTag, FiTruck, FiCreditCard, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderAPI, paymentAPI, couponAPI } from '../services/api';
import { formatPrice, calculateShipping } from '../utils/helpers';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const STEPS = ['Cart Review', 'Shipping', 'Payment'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.product?.price || i.price || 0) * i.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax - couponDiscount;

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setAddress({ name: def.name || user.name, phone: def.phone || user.phone || '', street: def.street || '', city: def.city || '', state: def.state || '', pincode: def.pincode || '' });
    } else {
      setAddress(a => ({ ...a, name: user?.name || '', phone: user?.phone || '' }));
    }
  }, [user]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const data = await couponAPI.validate({ code: couponCode, orderAmount: subtotal });
      setCouponData(data.coupon);
      setCouponDiscount(data.discount);
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`);
    } catch (err) { toast.error(err.message || 'Invalid coupon'); }
    finally { setApplyingCoupon(false); }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!address[field]) { toast.error(`Please enter ${field}`); return; }
    }
    if (address.pincode.length !== 6) { toast.error('Enter valid 6-digit pincode'); return; }
    setStep(2);
  };

  const handlePayment = async () => {
    setPlacingOrder(true);
    try {
      const orderItems = items.map(i => ({
        product: i.product._id || i.product,
        name: i.product.name,
        image: i.product.images?.[0],
        price: i.product.price || i.price,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));

      const orderData = await orderAPI.create({
        items: orderItems,
        shippingAddress: address,
        coupon: couponData?._id,
        couponDiscount,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      });

      const paymentData = await paymentAPI.createOrder({ amount: total, orderId: orderData.order._id });

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'LuxeFit',
        description: `Order #${orderData.order.orderNumber}`,
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👗</text></svg>',
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.verify({ ...response, orderId: orderData.order._id });
            toast.success('Payment successful! 🎉');
            navigate(`/order-confirmation/${orderData.order._id}`);
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || address.phone },
        theme: { color: '#9333ea' },
        modal: { ondismiss: () => { setPlacingOrder(false); toast('Payment cancelled'); } },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <Button variant="primary" onClick={() => navigate('/shop')}>Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-red-600 text-white' : i === step ? 'bg-red-100 text-red-600 ring-2 ring-red-600' : 'bg-gray-200 text-gray-500'}`}>
                  {i < step ? <FiCheck className="w-4 h-4" /> : i + 1}
                </div>
                <span className="font-medium text-sm hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 transition-all ${i < step ? 'bg-red-600' : 'bg-gray-200'}`} style={{ width: '60px' }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 0: Cart review */}
              {step === 0 && (
                <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-800 text-lg mb-5 flex items-center gap-2"><FiShoppingBag className="text-red-600" /> Order Items ({items.length})</h2>
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item._id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl">
                        <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-20 h-20 object-cover rounded-xl" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.product?.name}</p>
                          <div className="flex gap-2 text-xs text-gray-500 mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>• {item.color}</span>}
                            <span>• Qty: {item.quantity}</span>
                          </div>
                          <p className="font-bold text-gray-900 mt-1">{formatPrice((item.product?.price || item.price) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiTag className="text-red-600" /> Apply Coupon</p>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code" className="input-field flex-1 text-sm" />
                      <Button variant="outline" onClick={applyCoupon} loading={applyingCoupon} size="sm">Apply</Button>
                    </div>
                    {couponData && <p className="text-green-600 text-sm mt-2 font-medium">✅ Coupon "{couponData.code}" applied! You save {formatPrice(couponDiscount)}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['WELCOME10', 'LUXE20', 'FLAT500'].map(code => (
                        <button key={code} onClick={() => setCouponCode(code)}
                          className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full font-medium hover:bg-red-100 transition-colors">{code}</button>
                      ))}
                    </div>
                  </div>

                  <Button variant="primary" fullWidth size="lg" onClick={() => setStep(1)} className="mt-6">Continue to Shipping</Button>
                </motion.div>
              )}

              {/* Step 1: Address */}
              {step === 1 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-800 text-lg mb-5 flex items-center gap-2"><FiTruck className="text-red-600" /> Shipping Address</h2>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'name', label: 'Full Name', placeholder: 'Your full name', span: 1 },
                        { key: 'phone', label: 'Phone Number', placeholder: '10-digit mobile', span: 1 },
                        { key: 'street', label: 'Street Address', placeholder: 'House no., Area, Street', span: 2 },
                        { key: 'city', label: 'City', placeholder: 'City', span: 1 },
                        { key: 'state', label: 'State', placeholder: 'State', span: 1 },
                        { key: 'pincode', label: 'PIN Code', placeholder: '6-digit pincode', span: 1 },
                      ].map(({ key, label, placeholder, span }) => (
                        <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                          <input type={key === 'pincode' ? 'text' : 'text'} value={address[key]}
                            onChange={e => setAddress(p => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder} required className="input-field text-sm" maxLength={key === 'pincode' ? 6 : undefined} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <Button variant="ghost" onClick={() => setStep(0)} type="button">← Back</Button>
                      <Button variant="primary" type="submit" fullWidth size="lg">Continue to Payment</Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-800 text-lg mb-5 flex items-center gap-2"><FiCreditCard className="text-red-600" /> Payment</h2>

                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                    <p className="font-medium text-red-800 mb-1">Delivering to:</p>
                    <p className="text-sm text-red-700">{address.name} • {address.phone}</p>
                    <p className="text-sm text-red-700">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"><FiCheck className="w-3 h-3 text-white" /></div>
                      <p className="font-medium text-gray-800">Pay via Razorpay</p>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">UPI, Cards, Net Banking, Wallets — all supported</p>
                    <div className="flex gap-2 ml-8 mt-2">
                      {['UPI', 'Visa', 'Mastercard', 'RuPay'].map(m => (
                        <span key={m} className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-medium text-gray-600">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                    <Button variant="primary" fullWidth size="lg" loading={placingOrder} onClick={handlePayment}>
                      Pay {formatPrice(total)} →
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-sm h-fit sticky top-28">
            <h3 className="font-semibold text-gray-800 mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({items.length} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({couponData?.code})</span><span>-{formatPrice(couponDiscount)}</span></div>}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
              {shipping === 0 && <p className="text-green-600 text-xs mt-1">🎉 You get free delivery!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
