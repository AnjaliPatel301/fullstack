import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiShoppingCart, FiTruck, FiRefreshCw, FiShield,
  FiShare2, FiMapPin, FiChevronRight, FiZoomIn, FiX,
  FiChevronLeft, FiChevronRight as FiChevronRightIcon
} from 'react-icons/fi';
import { productAPI, reviewAPI, locationAPI } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import RatingStars from '../components/ui/RatingStars';
import Button from '../components/ui/Button';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';

const COLOR_HEX = {
  Black: '#111827', White: '#f9fafb', Gray: '#6b7280', Navy: '#1e3a5f',
  Blue: '#3b82f6', Red: '#ef4444', Pink: '#ec4899', Green: '#22c55e',
  Yellow: '#eab308', Brown: '#92400e', Beige: '#d4b896', Orange: '#f97316',
  Purple: '#a855f7', Maroon: '#7f1d1d', Olive: '#65a30d', Teal: '#14b8a6',
  Burgundy: '#6b1e2b', Mustard: '#d97706', Coral: '#f8705a', Cream: '#fffbeb',
};

// ─── Fullscreen Lightbox ──────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx(i => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10 transition-colors">
        <FiX className="w-7 h-7" />
      </button>
      <button
        onClick={e => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)); }}
        className={`absolute left-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <FiChevronLeft className="w-8 h-8" />
      </button>
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          src={images[idx]}
          alt=""
          className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl select-none"
          onClick={e => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>
      <button
        onClick={e => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)); }}
        className={`absolute right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors ${idx === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <FiChevronRightIcon className="w-8 h-8" />
      </button>
      <div className="absolute bottom-6 flex gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
            className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`} />
        ))}
      </div>
      <div className="absolute bottom-6 right-6 text-white/60 text-sm">
        {idx + 1} / {images.length}
      </div>
    </motion.div>
  );
}

// ─── Enhanced Image Gallery ───────────────────────────────────────────────────
function ImageGallery({ images, selectedColor, onLightbox }) {
  const [activeImg, setActiveImg] = useState(0);
  const galleryRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => { setActiveImg(0); }, [selectedColor]);

  // Mouse wheel horizontal scroll on thumbnail bar
  const handleWheel = useCallback((e) => {
    if (galleryRef.current) {
      e.preventDefault();
      galleryRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  // Touch swipe on main image
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveImg(i => Math.min(images.length - 1, i + 1));
      else setActiveImg(i => Math.max(0, i - 1));
    }
    touchStartX.current = null;
  };

  const goLeft = () => setActiveImg(i => Math.max(0, i - 1));
  const goRight = () => setActiveImg(i => Math.min(images.length - 1, i + 1));

  if (!images || images.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-2xl aspect-[3/4] flex items-center justify-center text-gray-300">
        <span className="text-6xl">📷</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 w-full">
      {/* Vertical Thumbnails */}
      {images.length > 1 && (
        <div
          ref={galleryRef}
          onWheel={handleWheel}
          className="hidden lg:flex flex-col gap-2 w-20 flex-shrink-0 max-h-[580px] overflow-y-auto no-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                activeImg === i
                  ? 'border-red-500 shadow-md shadow-red-100'
                  : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
              }`}
            >
              <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 relative">
        <div
          className="relative bg-white rounded-2xl overflow-hidden aspect-[3/4] shadow-sm group cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => onLightbox(activeImg)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`${selectedColor}-${activeImg}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={images[activeImg] || 'https://via.placeholder.com/600?text=No+Image'}
              alt="Product"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
          </AnimatePresence>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); goLeft(); }}
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-600 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 ${activeImg === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); goRight(); }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-600 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 ${activeImg === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <FiChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <FiZoomIn className="w-3.5 h-3.5" /> Click to zoom
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {activeImg + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Mobile horizontal thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar lg:hidden pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImg === i ? 'border-red-500' : 'border-gray-200 opacity-60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="hidden lg:flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`rounded-full transition-all ${i === activeImg ? 'w-5 h-2 bg-red-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productAPI.getOne(id),
      reviewAPI.getByProduct(id),
    ]).then(([productData, reviewData]) => {
      const p = productData.product;
      setProduct(p);
      setReviews(reviewData.reviews || []);

      // Initialise variant or legacy color
      const activeVariants = p?.variants?.filter(v => v.isActive) || [];
      if (activeVariants.length > 0) {
        const defaultV = activeVariants.find(v => v.isDefault) || activeVariants[0];
        setSelectedVariant(defaultV);
        setSelectedColor(defaultV.colorName);
        setSelectedSize(defaultV.sizes?.[0] || '');
      } else {
        setSelectedColor(p?.colors?.[0] || '');
        setSelectedSize(p?.sizes?.[0] || '');
      }

      if (p?.category) {
        productAPI.getAll({ category: p.category, limit: 5 })
          .then(d => setRelated(d.products?.filter(x => x._id !== id).slice(0, 4) || []));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Derive display data from selected variant or legacy fields
  const activeVariants = product?.variants?.filter(v => v.isActive) || [];
  const hasVariants = activeVariants.length > 0;

  const getDisplayImages = () => {
    if (!product) return [];
    if (hasVariants && selectedVariant) {
      if (selectedVariant.images?.length > 0) return selectedVariant.images;
    }
    // legacy colorImages
    if (selectedColor && product.colorImages) {
      const colorImgs = product.colorImages[selectedColor];
      if (colorImgs && colorImgs.length > 0) return colorImgs;
    }
    return product.images || [];
  };

  const displayImages = getDisplayImages();

  const displayPrice = hasVariants && selectedVariant
    ? selectedVariant.price
    : (product?.isFlashSale && product?.flashSalePrice ? product.flashSalePrice : product?.price);

  const displayOriginalPrice = hasVariants && selectedVariant
    ? (selectedVariant.originalPrice || product?.originalPrice)
    : product?.originalPrice;

  const displayStock = hasVariants && selectedVariant ? selectedVariant.stock : product?.stock || 0;
  const displaySizes = hasVariants && selectedVariant ? selectedVariant.sizes : product?.sizes || [];
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  const handleColorChange = (colorName, variant) => {
    setSelectedColor(colorName);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedSize(variant.sizes?.[0] || '');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (!selectedSize && displaySizes.length > 0) { toast.error('Please select a size'); return; }
    addToCart(product._id, qty, selectedSize, selectedColor);
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return; }
    setCheckingPin(true);
    try {
      const data = await locationAPI.checkPincode(pincode);
      setDeliveryInfo(data);
    } catch { toast.error('Could not check pincode'); }
    finally { setCheckingPin(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const data = await reviewAPI.create(id, reviewForm);
      setReviews(prev => [data.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductCardSkeleton />
          <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="pt-28 text-center py-20 text-gray-500">Product not found</div>;

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxStart !== null && (
          <Lightbox images={displayImages} startIndex={lightboxStart} onClose={() => setLightboxStart(null)} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to={`/shop/${product.category}`} className="hover:text-red-600 capitalize">{product.category}</Link>
          {product.subCategory && (
            <><FiChevronRight className="w-3 h-3" /><span>{product.subCategory}</span></>
          )}
          <FiChevronRight className="w-3 h-3" />
          <span className="text-gray-800 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

          {/* ─── Enhanced Image Gallery ─── */}
          <div className="lg:col-span-6">
            <div className="relative">
              <ImageGallery
                images={displayImages}
                selectedColor={selectedColor}
                onLightbox={(idx) => setLightboxStart(idx)}
              />
              {/* Wishlist overlay */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
                  inWishlist ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-500 hover:text-pink-500'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              {/* Discount badge */}
              {discount > 0 && (
                <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discount}% OFF
                </span>
              )}
              {product.isFlashSale && !hasVariants && (
                <span className="absolute top-10 left-3 z-10 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  FLASH SALE
                </span>
              )}
            </div>
          </div>

          {/* ─── Product Info ─── */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-600 font-semibold text-sm uppercase tracking-wide">{product.brand}</span>
                {product.subCategory && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{product.subCategory}</span>}
                {product.productType && <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{product.productType}</span>}
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <RatingStars rating={product.ratings} size="md" />
                <span className="text-sm text-gray-500">{product.numReviews} ratings</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`price-${selectedColor}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-baseline gap-3 flex-wrap"
                >
                  <span className="text-4xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
                  {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                    <span className="text-xl text-gray-400 line-through">{formatPrice(displayOriginalPrice)}</span>
                  )}
                  {discount > 0 && (
                    <span className="text-base text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">{discount}% off</span>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* ─── Color/Variant Selector ─── */}
            {hasVariants ? (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">
                  Color: <span className="font-semibold text-red-600">{selectedColor}</span>
                  {selectedVariant?.sku && <span className="text-xs text-gray-400 font-normal ml-2">SKU: {selectedVariant.sku}</span>}
                </p>
                <div className="flex flex-wrap gap-3">
                  {activeVariants.map(variant => {
                    const isSelected = selectedColor === variant.colorName;
                    const hasImg = variant.images?.length > 0;
                    return (
                      <button
                        key={variant._id}
                        onClick={() => handleColorChange(variant.colorName, variant)}
                        title={variant.colorName}
                        className="relative flex flex-col items-center gap-1.5 group"
                      >
                        <div className={`w-12 h-12 rounded-xl border-3 transition-all overflow-hidden shadow-sm ${
                          isSelected
                            ? 'border-red-500 ring-2 ring-red-200 scale-105'
                            : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                        }`}>
                          {hasImg ? (
                            <img src={variant.images[0]} alt={variant.colorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: variant.colorCode || COLOR_HEX[variant.colorName] || '#ccc' }} />
                          )}
                        </div>
                        <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-800'}`}>
                          {variant.colorName}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant?.images?.length > 0 && (
                  <motion.p
                    key={selectedColor}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-600 mt-2 font-medium"
                  >
                    ✓ Showing {selectedVariant.images.length} photos in {selectedColor}
                  </motion.p>
                )}
              </div>
            ) : product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">
                  Color: <span className="font-semibold text-red-600">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => {
                    const hex = COLOR_HEX[color] || '#ccc';
                    const hasColorImages = product.colorImages && product.colorImages[color]?.length > 0;
                    const isSelected = selectedColor === color;
                    return (
                      <button key={color} onClick={() => handleColorChange(color, null)} title={color}
                        className="relative flex flex-col items-center gap-1.5 group">
                        <div className={`w-12 h-12 rounded-xl border-3 transition-all overflow-hidden shadow-sm ${
                          isSelected ? 'border-red-500 ring-2 ring-red-200 scale-105' : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                        }`}>
                          {hasColorImages
                            ? <img src={product.colorImages[color][0]} alt={color} className="w-full h-full object-cover" />
                            : <div className="w-full h-full" style={{ backgroundColor: hex }} />
                          }
                        </div>
                        <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-800'}`}>{color}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {displaySizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Size: <span className="font-semibold text-red-600">{selectedSize}</span></p>
                  <button className="text-xs text-red-600 hover:underline font-medium">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displaySizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`min-w-12 px-4 py-2.5 text-sm rounded-xl border-2 font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-100'
                          : 'border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50'
                      }`}
                    >{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Stock */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 text-lg font-bold transition-colors">−</button>
                <span className="px-5 py-3 font-bold text-gray-800 border-x-2 border-gray-200 tabular-nums min-w-12 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(displayStock, q + 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 text-lg font-bold transition-colors">+</button>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`stock-${selectedColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium"
                >
                  {displayStock > 0 ? (
                    displayStock < 10
                      ? <span className="text-orange-600">Only {displayStock} left!</span>
                      : <span className="text-green-600">In Stock ({displayStock})</span>
                  ) : <span className="text-red-500 font-bold">Out of Stock</span>}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary" size="lg"
                onClick={handleAddToCart}
                loading={cartLoading}
                disabled={displayStock === 0}
                className="flex-1 h-14 text-base font-bold"
              >
                <FiShoppingCart className="w-5 h-5" /> Add to Cart
              </Button>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-4 rounded-xl border-2 transition-all h-14 w-14 flex items-center justify-center ${
                  inWishlist ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              <button className="p-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all h-14 w-14 flex items-center justify-center">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery check */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-blue-600" /> Check Delivery Availability
              </p>
              <div className="flex gap-2">
                <input
                  type="text" value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit pincode"
                  className="input-field py-2.5 flex-1 text-sm"
                />
                <Button variant="outline" size="sm" onClick={checkPincode} loading={checkingPin}>Check</Button>
              </div>
              {deliveryInfo && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm">
                  {deliveryInfo.serviceable
                    ? <p className="text-green-600 font-medium">✅ {deliveryInfo.message} to {deliveryInfo.city}, {deliveryInfo.state}</p>
                    : <p className="text-red-500">❌ Delivery not available for this pincode</p>
                  }
                </motion.div>
              )}
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FiTruck, text: 'Free delivery above ₹999', sub: '2-5 days' },
                { icon: FiRefreshCw, text: '30-day returns', sub: 'Easy returns' },
                { icon: FiShield, text: 'Secure payment', sub: '100% safe' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="text-center p-3 bg-white rounded-xl border border-gray-100">
                  <Icon className="w-5 h-5 text-red-600 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-gray-800">{text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-12">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
              { id: 'details', label: 'Product Details' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab.id ? 'text-red-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full font-medium border border-red-100">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Brand', value: product.brand },
                  { label: 'Category', value: product.category },
                  { label: 'Sub-Category', value: product.subCategory },
                  { label: 'Type', value: product.productType },
                  { label: 'SKU', value: hasVariants && selectedVariant ? selectedVariant.sku : product.sku },
                  { label: 'Available Sizes', value: displaySizes.join(', ') || product.sizes?.join(', ') },
                  { label: 'Available Colors', value: hasVariants ? activeVariants.map(v => v.colorName).join(', ') : product.colors?.join(', ') },
                  { label: 'Stock', value: `${displayStock} units` },
                ].filter(i => i.value).map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-semibold text-gray-800 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {reviews.map(review => (
                      <div key={review._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {review.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{review.user?.name}</p>
                            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                          </div>
                          <RatingStars rating={review.rating} />
                        </div>
                        <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
                {reviews.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-4xl mb-3">⭐</p>
                    <p className="font-medium">No reviews yet. Be the first to review!</p>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} type="button"
                              onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                              className={`text-3xl transition-all hover:scale-110 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'}`}
                            >★</button>
                          ))}
                        </div>
                      </div>
                      <input type="text" placeholder="Review title" value={reviewForm.title}
                        onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                        required className="input-field" />
                      <textarea placeholder="Share your experience with this product..."
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                        required rows={4} className="input-field resize-none" />
                      <Button type="submit" loading={submittingReview} variant="primary">Submit Review</Button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
