import { motion } from 'framer-motion';

const brands = [
  { name: 'Nike', logo:'/adidas.jpg' },
  { name: 'Adidas', logo: '/amozon.webp' },
  { name: 'Levi\'s', logo: '/filipcard.png' },
  { name: 'Zara', logo: '/myntra.png'},
  { name: 'H&M', logo: '/nike.png' },
  { name: 'Mango', logo: '/zara.jpg'},
];

export default function BrandShowcase() {
  return (
    <section className="py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center text-gray-400 font-medium text-sm uppercase tracking-widest mb-10">
          Trusted Brands & Partners
        </motion.p>
        <div className="flex items-center justify-center flex-wrap gap-8 md:gap-16">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="cursor-pointer"
            >
              <img src={brand.logo} alt={brand.name} className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
