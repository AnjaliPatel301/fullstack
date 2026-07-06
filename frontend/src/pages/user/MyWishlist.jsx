import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';

export default function MyWishlist() {
  const { items, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist().finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addToCart({ productId: product._id, quantity: 1, size: product.sizes?.[0], color: product.colors?.[0] });
      toast.success('Added to cart!');
    } catch (err) { toast.error(err.message); }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>
      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
      items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <FiHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Your wishlist is empty</p>
          <Link to="/shop" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">Explore products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map(item => {
            const product = item.product || item;
            return (
              <div key={item._id || product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Link to={`/product/${product._id}`}>
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img src={product.images?.[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-900 text-white py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">
                      <FiShoppingCart className="w-3 h-3" /> Add to Cart
                    </button>
                    <button onClick={() => handleRemove(product._id)}
                      className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
