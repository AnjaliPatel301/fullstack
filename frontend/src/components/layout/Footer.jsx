import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👗</span>
              <span className="font-display text-2xl font-bold text-white">LuxeFit</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">Premium fashion for everyone. Shop the latest trends in men's, women's, and kids clothing. Quality you can feel, style you'll love.</p>
            <div className="flex gap-3">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[['Home', '/'], ["Men's Fashion", '/shop/men'], ["Women's Fashion", '/shop/women'], ['Kids', '/shop/kids'], ['Accessories', '/shop/accessories'], ['Flash Sale', '/shop?isFlashSale=true']].map(([label, to]) => (
                <li key={to}><Link to={to} className="text-sm hover:text-red-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              {['Track Your Order', 'Return & Exchange', 'Size Guide', 'FAQ', 'Privacy Policy', 'Terms & Conditions'].map(item => (
                <li key={item}><a href="#" className="hover:text-red-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-start gap-2"><FiMapPin className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" /><span>123 Fashion Street, Mumbai, Maharashtra 400001</span></div>
              <div className="flex items-center gap-2"><FiPhone className="w-4 h-4 text-red-400" /><a href="tel:+919876543210" className="hover:text-red-400">+91 98765 43210</a></div>
              <div className="flex items-center gap-2"><FiMail className="w-4 h-4 text-red-400" /><a href="mailto:hello@luxefit.com" className="hover:text-red-400">hello@luxefit.com</a></div>
            </div>
            <p className="text-sm font-medium text-white mb-2">Subscribe to our newsletter</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Go</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2024 LuxeFit. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-60 hover:opacity-100 transition-opacity" />
            <span className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-lg">UPI</span>
            <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-lg">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
