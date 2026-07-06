import HeroSection from '../components/home/HeroSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FlashSaleSection from '../components/home/FlashSaleSection';
import ProductSection from '../components/home/ProductSection';
import BrandShowcase from '../components/home/BrandShowcase';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiRefreshCw, FiShield, FiHeadphones } from 'react-icons/fi';

const perks = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Always here to help' },
];

export default function Home() {
  return (
    <main>
      <HeroSection />

      {/* Perks bar */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCategories />
      <FlashSaleSection />
      <ProductSection title="Featured Products" subtitle="Handpicked styles our team loves" params={{ isFeatured: 'true' }} link="/shop?isFeatured=true" />
      <BrandShowcase />
      <ProductSection title="New Arrivals" subtitle="Fresh drops every week" params={{ sort: '-createdAt' }} link="/shop?sort=-createdAt" />

      {/* Promo banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 to-pink-600 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400" alt="Promo" className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20 hidden md:block" />
            <div className="z-10">
              <p className="text-white/80 font-medium mb-2">Limited Time Offer</p>
              <h2 className="font-display text-4xl font-bold text-white mb-2">Get 20% Off</h2>
              <p className="text-white/80 mb-1">On your first order above ₹2000</p>
              <p className="text-yellow-300 font-bold text-lg">Use code: LUXE20</p>
            </div>
            <Link to="/shop" className="z-10 bg-white text-red-700 font-bold py-4 px-10 rounded-2xl hover:bg-gray-100 transition-all shadow-xl text-lg whitespace-nowrap">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection />
    </main>
  );
}
