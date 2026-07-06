import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiArrowRight } from 'react-icons/fi';
import { productAPI } from '../../services/api';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white text-red-600 font-bold text-2xl md:text-3xl w-14 md:w-16 h-14 md:h-16 rounded-md flex items-center justify-center shadow-lg tabular-nums">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-white/80 text-xs mt-1">{label}</span>
  </div>
);

export default function FlashSaleSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 59 });

  useEffect(() => {
    productAPI.getFlashSale()
      .then(data => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) return { ...prev, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-gray-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-2">
              <FiZap className="w-6 h-6 text-yellow-300 fill-current" />
              <span className="text-yellow-300 font-bold uppercase tracking-widest text-sm">Flash Sale</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-white">Deals End In</h2>
          </motion.div>

          <div className="flex items-center gap-3">
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <span className="text-white text-3xl font-bold mb-4">:</span>
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
            <span className="text-white text-3xl font-bold mb-4">:</span>
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <Link to="/shop?isFlashSale=true"
            className="flex items-center gap-2 bg-white text-red-600 font-bold py-3 px-6 rounded-2xl hover:bg-gray-100 transition-all shadow-lg">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.slice(0, 4).map((product, i) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
