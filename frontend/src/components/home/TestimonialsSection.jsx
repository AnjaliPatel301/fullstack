import { motion } from 'framer-motion';
import RatingStars from '../ui/RatingStars';

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, avatar: 'PS', color: 'bg-pink-500', text: 'Absolutely love LuxeFit! The quality of clothes is amazing and they arrived within 2 days. The checkout experience with Razorpay was super smooth. Will definitely shop again!' },
  { name: 'Arjun Mehta', city: 'Delhi', rating: 5, avatar: 'AM', color: 'bg-blue-500', text: 'Best online clothing store I\'ve used. The size guide is spot on, no returns needed. The premium hoodie I ordered is incredibly soft and true to size. Highly recommend!' },
  { name: 'Kavya Nair', city: 'Bangalore', rating: 5, avatar: 'KN', color: 'bg-red-500', text: 'The floral wrap dress I bought got so many compliments! Fast delivery, beautiful packaging, and the quality is better than expected. LuxeFit is now my go-to fashion destination.' },
  { name: 'Rohit Kumar', city: 'Pune', rating: 4, avatar: 'RK', color: 'bg-green-500', text: 'Great value for money. The slim fit chinos fit perfectly and look very professional. The coupon code WELCOME10 worked great on my first order. Customer service was helpful too.' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-red-50 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
          <p className="text-gray-500">Join 50,000+ happy shoppers who love LuxeFit</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <RatingStars rating={4.9} size="lg" />
            <span className="font-bold text-gray-800 text-lg">4.9</span>
            <span className="text-gray-400">from 12,000+ reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{t.avatar}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </div>
              <RatingStars rating={t.rating} />
              <p className="text-gray-600 text-sm leading-relaxed mt-3 line-clamp-4">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
