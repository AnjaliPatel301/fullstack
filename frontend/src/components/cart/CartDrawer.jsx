import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/helpers';
import Button from '../ui/Button';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || item.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : subtotal > 0 ? 99 : 0;

  const handleCheckout = () => { closeCart(); navigate('/checkout'); };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FiShoppingCart className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
                {items.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{items.length}</span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping bar */}
            {subtotal < 999 && subtotal > 0 && (
              <div className="px-5 py-3 bg-red-50">
                <div className="flex justify-between text-xs text-red-700 mb-1">
                  <span>Add {formatPrice(999 - subtotal)} more for free delivery!</span>
                  <span>{Math.round((subtotal / 999) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mb-6">Add items to get started</p>
                  <Link to="/shop" onClick={closeCart}>
                    <Button variant="primary">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const product = item.product || {};
                    const price = product.price || item.price || 0;
                    return (
                      <motion.div key={item._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
                        <img src={product.images?.[0] || item.image} alt={product.name || item.name}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name || item.name}</h4>
                          <div className="flex gap-2 text-xs text-gray-500 mb-2">
                            {item.size && <span className="bg-white px-2 py-0.5 rounded-full border">{item.size}</span>}
                            {item.color && <span className="bg-white px-2 py-0.5 rounded-full border">{item.color}</span>}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{formatPrice(price)}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">Total: {formatPrice(price * item.quantity)}</span>
                            <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total</span><span>{formatPrice(subtotal + shipping)}</span>
                  </div>
                </div>
                <Button variant="primary" fullWidth onClick={handleCheckout} size="lg">
                  Proceed to Checkout <FiArrowRight className="w-4 h-4" />
                </Button>
                <button onClick={closeCart} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">Continue Shopping</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
