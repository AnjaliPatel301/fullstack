import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiPackage, FiShoppingBag, FiDollarSign, FiSettings, FiUser, FiLogOut, FiMenu, FiChevronRight, FiBox, FiStar, FiRefreshCw, FiBell, FiTrendingUp } from 'react-icons/fi';
import { useSellerStore } from '../../store/sellerStore';

const NAV_ITEMS = [
  { to: '/seller/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/seller/products', icon: FiPackage, label: 'My Products' },
  { to: '/seller/inventory', icon: FiBox, label: 'Inventory' },
  { to: '/seller/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/seller/returns', icon: FiRefreshCw, label: 'Returns' },
  { to: '/seller/reviews', icon: FiStar, label: 'Reviews' },
  { to: '/seller/analytics', icon: FiTrendingUp, label: 'Analytics' },
  { to: '/seller/earnings', icon: FiDollarSign, label: 'Earnings' },
  { to: '/seller/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/seller/settings', icon: FiSettings, label: 'Shop Settings' },
  { to: '/seller/profile', icon: FiUser, label: 'Profile' },
];

export function SellerNav() {
  const { seller, sellerUser, logout } = useSellerStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/seller/login'); };

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-2xl overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-700 shrink-0">
        <Link to="/" className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👗</span>
          <div>
            <span className="font-bold text-white text-lg">LuxeFit</span>
            <p className="text-indigo-300 text-xs">Seller Portal</p>
          </div>
        </Link>
        {/* Shop info */}
        <div className="bg-indigo-700/50 rounded-xl p-3">
          {seller?.logo ? (
            <img src={seller.logo} alt={seller.shopName} className="w-8 h-8 rounded-lg object-cover mb-2" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2">
              {seller?.shopName?.charAt(0)}
            </div>
          )}
          <p className="text-white text-sm font-semibold truncate">{seller?.shopName || 'My Shop'}</p>
          <p className="text-indigo-300 text-xs truncate">{sellerUser?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-white text-indigo-700 shadow-md'
                  : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <FiChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-700 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-indigo-300 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700/50 transition-colors mb-1">
          <span>🏠</span> View Store
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-4 py-2 rounded-lg hover:bg-indigo-700/50 transition-colors">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default function SellerLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { seller } = useSellerStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SellerNav />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-40 lg:hidden">
              <SellerNav />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <FiMenu className="w-5 h-5 text-gray-700" />
          </button>
          <span className="font-bold text-gray-800">Seller Dashboard</span>
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {seller?.shopName?.charAt(0)}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
