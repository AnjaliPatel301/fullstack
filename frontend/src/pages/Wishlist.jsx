import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/helpers';
import Button from '../components/ui/Button';

export default function Wishlist() {
  const { wishlist, fetchWishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => { fetchWishlist(); }, []);

  const products = wishlist?.products || [];

  return (
    <div className="pt-28 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiHeart className="w-6 h-6 text-pink-500 fill-current" />
          <h1 className="font-display text-3xl font-bold text-gray-900">My Wishlist ({products.length})</h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <Link to="/shop" className="btn-primary py-3 px-8 rounded-xl text-sm inline-flex items-center gap-2">
              Explore Products <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Link to={`/product/${product._id}`}>
                    <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                  <button onClick={() => toggleWishlist(product._id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-red-600 font-medium mb-1">{product.brand}</p>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 hover:text-red-600 transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.originalPrice && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.originalPrice)}</span>}
                    </div>
                  </div>
                  <Button variant="primary" fullWidth size="sm" className="mt-3"
                    onClick={() => addToCart(product._id, 1, product.sizes?.[0], product.colors?.[0])}>
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
