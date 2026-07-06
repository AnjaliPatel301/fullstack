import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiZap } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import RatingStars from '../ui/RatingStars';
import { formatPrice } from '../../utils/helpers';

export default function ProductCard({ product }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, isLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const inWishlist = isInWishlist(product._id);
  const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : product.discount;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0];
    addToCart(product._id, 1, defaultSize, defaultColor);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    toggleWishlist(product._id);
  };

  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const displayPrice = isFlashSale ? product.flashSalePrice : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group card cursor-pointer"
    >
      <Link to={`/product/${product._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
          {!imgLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=LuxeFit'}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {product.images?.[1] && isHovered && (
            <img src={product.images[1]} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-300" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isFlashSale && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <FiZap className="w-3 h-3" /> SALE
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPercent}%</span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">Out of Stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${inWishlist ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500'} ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'} transition-all duration-300`}>
              <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </motion.button>
            <Link to={`/product/${product._id}`}
              className={`w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'} duration-300 delay-75`}>
              <FiEye className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick add */}
          <motion.button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} disabled:opacity-50`}
          >
            <FiShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Quick Add to Cart'}
          </motion.button>
        </div>

        {/* Details */}
        <div className="p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="text-gray-800 font-medium text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{product.name}</h3>
          <RatingStars rating={product.ratings} showCount count={product.numReviews} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(displayPrice)}</span>
            {product.originalPrice && product.originalPrice > displayPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {/* Size chips */}
          {product.sizes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 4).map(size => (
                <span key={size} className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-500">{size}</span>
              ))}
              {product.sizes.length > 4 && <span className="text-xs text-gray-400">+{product.sizes.length - 4}</span>}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
