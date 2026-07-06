import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { productAPI } from '../../services/api';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

export default function ProductSection({ title, subtitle, params = {}, link = '/shop', limit = 8 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ ...params, limit })
      .then(data => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
          <Link to={link} className="hidden md:flex items-center gap-2 text-red-600 font-semibold hover:gap-3 transition-all">
            View All <FiArrowRight />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: limit }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.map((product, i) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to={link} className="inline-flex items-center gap-2 text-red-600 font-semibold border border-red-200 rounded-xl px-6 py-3 hover:bg-red-50 transition-all">
            View All <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
