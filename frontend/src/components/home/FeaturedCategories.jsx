import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiStar, FiWatch } from 'react-icons/fi';

const categories = [
  {
    id: 'men',
    label: "Men's Fashion",
    icon: FiUser,
    color: 'white',
    iconBg: 'bg-red-500/20',
    count: '500+ styles',
    img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80',
  },
  {
    id: 'women',
    label: "Women's Fashion",
    icon: FiShoppingBag,
    color: 'white',
    iconBg: 'bg-red-500/20',
    count: '800+ styles',
    img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80',
  },
  {
    id: 'kids',
    label: 'Kids Fashion',
    icon: FiStar,
    color: 'white',
    iconBg: 'bg-red-400/20',
    count: '300+ styles',
    img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    icon: FiWatch,
    color: 'white',
    iconBg: 'bg-red-500/20',
    count: '200+ items',
    img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
          <p className="text-gray-500">Find your perfect style across our curated collections</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link
                  to={`/shop/${cat.id}`}
                  className="group block relative overflow-hidden rounded-md aspect-[3/4] shadow-lg cursor-pointer"
                >
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-10 group-hover:opacity-70 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-white">

                    {/* Real Icon with glassmorphism background */}
                    <div className={`mb-3 p-3 rounded-2xl backdrop-blur-sm border border-white/30 ${cat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>

                    <h3 className="font-display font-bold text-lg text-center leading-tight drop-shadow-md">
                      {cat.label}
                    </h3>
                    <p className="text-white/80 text-sm mt-1 drop-shadow">{cat.count}</p>
                    <span className="mt-3 text-xs bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                      Shop Now →
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}