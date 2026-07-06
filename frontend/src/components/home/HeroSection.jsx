import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
  {
    id: 1,
    title: 'New Summer Collection',
    subtitle: 'Fresh styles for the season',
    description: 'Discover handpicked summer essentials — breezy fabrics, vibrant colors, and styles that turn heads.',
    cta: 'Shop Women',
    link: '/shop/women',
    badge: 'New Arrivals',
    bg: 'from-red-600 via-pink-500 to-orange-400',
    video: 'https://www.pexels.com/download/video/8738554/',  // 🔁 apna video URL yahan daalo
  },
  {
    id: 2,
    title: "Men's Premium Edition",
    subtitle: 'Dress sharp, feel powerful',
    description: 'Elevate your wardrobe with tailored suits, premium shirts, and sophisticated accessories.',
    cta: 'Shop Men',
    link: '/shop/men',
    badge: 'Trending Now',
    bg: 'from-slate-700 via-gray-800 to-zinc-900',
    video: 'https://www.pexels.com/download/video/8371251/',  // 🔁 apna video URL yahan daalo
  },
  {
    id: 3,
    title: 'Flash Sale — Up to 50% Off',
    subtitle: 'Limited time. Limited stock.',
    description: 'Grab your favorites before they run out. Exclusive deals on top brands and premium styles.',
    cta: 'View Flash Sale',
    link: '/shop?isFlashSale=true',
    badge: '⚡ Flash Sale',
    bg: 'from-red-600 via-rose-500 to-pink-500',
    video: 'https://www.pexels.com/download/video/10329105/',  // 🔁 apna video URL yahan daalo
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => { setDirection(1); setCurrent(c => (c + 1) % slides.length); }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => { setDirection(idx > current ? 1 : -1); setCurrent(idx); };
  const prev = () => { setDirection(-1); setCurrent(c => (c - 1 + slides.length) % slides.length); };
  const next = () => { setDirection(1); setCurrent(c => (c + 1) % slides.length); };

  const slide = slides[current];

  return (
    <section className="relative h-[90vh] min-h-[600px] max-h-[800px] overflow-hidden mt-28">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 100 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}
        >
          {/* ✅ Video — no opacity, full clear */}
          <video
            key={slide.video}
            src={slide.video}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-2xl">
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-xl text-white mb-2 font-medium">{slide.subtitle}</motion.p>
                <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-white mb-8 max-w-lg leading-relaxed">{slide.description}</motion.p>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4">
                  <Link to={slide.link}
                    className="inline-flex items-center gap-2 bg-red-500 text-white  font-bold py-4 px-8 rounded-md hover:bg-red-600 transition-all hover:scale-105 shadow-xl">
                    {slide.cta} <FiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/shop"
                    className="inline-flex items-center gap-2 border-2 border-red-500/50 text-white font-semibold py-4 px-8 rounded-md hover:bg-white/10 transition-all backdrop-blur-sm">
                    Browse All
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10">
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10">
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
        ))}
      </div>
    </section>
  );
}