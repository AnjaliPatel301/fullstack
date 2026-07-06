import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiX, FiChevronRight } from 'react-icons/fi';
import { COLORS, SORT_OPTIONS } from '../../utils/helpers';
import { categoryAPI } from '../../services/api';

const FilterSection = ({ title, children, defaultOpen = true, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3">
        <span className="flex items-center gap-2">
          {title}
          {badge && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">{badge}</span>}
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductFilters({ params, onUpdate, onClear }) {
  const [priceRange, setPriceRange] = useState({ min: params.minPrice || '', max: params.maxPrice || '' });
  // Dynamic categories from DB
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI.getAll()
      .then(data => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const handlePriceApply = () => {
    onUpdate({ minPrice: priceRange.min, maxPrice: priceRange.max });
  };

  const selectedCategory = params.category;
  const selectedSubCategory = params.subCategory;

  // Find the currently selected category object to get its subcategories
  const categoryData = selectedCategory
    ? categories.find(c => c.slug === selectedCategory)
    : null;

  const filterBadges = [
    params.subCategory && { key: 'subCategory', label: params.subCategory },
    params.size && { key: 'size', label: `Size: ${params.size}` },
    params.color && { key: 'color', label: params.color },
    (params.minPrice || params.maxPrice) && { key: 'price', label: `₹${params.minPrice || 0} - ₹${params.maxPrice || '∞'}` },
  ].filter(Boolean);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38'];

  // Dynamic sizes based on category
  const getSizes = () => {
    if (!selectedCategory) return allSizes;
    if (selectedCategory === 'men') return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38'];
    if (selectedCategory === 'women') return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34'];
    if (selectedCategory === 'kids') return ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y', '14Y', 'UK1', 'UK2', 'UK3', 'UK4', 'UK5'];
    return allSizes;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-base">Filters</h3>
        {filterBadges.length > 0 && (
          <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 rounded-full px-3 py-1 hover:bg-red-50 transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Active filter badges */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
          {filterBadges.map(badge => (
            <span key={badge.key} className="flex items-center gap-1.5 bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full font-medium border border-red-100">
              {badge.label}
              <button
                onClick={() => onUpdate({
                  [badge.key === 'price' ? 'minPrice' : badge.key]: '',
                  ...(badge.key === 'price' ? { maxPrice: '' } : {}),
                })}
                className="hover:text-red-500 ml-0.5"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-1.5">
          {SORT_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="radio" name="sort" value={opt.value}
                checked={params.sort === opt.value}
                onChange={() => onUpdate({ sort: opt.value })}
                className="w-4 h-4 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-red-600 transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category — dynamic from DB */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="radio" name="category" value={cat.slug}
                checked={params.category === cat.slug}
                onChange={() => onUpdate({ category: params.category === cat.slug ? '' : cat.slug, subCategory: '' })}
                className="w-4 h-4 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-red-600 transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Subcategory — shown only when a category is selected, loaded from DB */}
      {categoryData && categoryData.types?.length > 0 && (
        <FilterSection title={`${categoryData.name} Type`} badge="Filter" defaultOpen>
          <div className="space-y-1">
            {categoryData.types.map((subType) => {
              const isSelected = selectedSubCategory === subType;
              return (
                <button
                  key={subType}
                  onClick={() => onUpdate({ subCategory: isSelected ? '' : subType })}
                  className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <span className="w-2 h-2 rounded-sm bg-white" />}
                  </span>
                  {subType}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Min (₹)</label>
              <input
                type="number" value={priceRange.min}
                onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Max (₹)</label>
              <input
                type="number" value={priceRange.max}
                onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                placeholder="∞"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Under ₹500', min: '', max: '500' },
              { label: '₹500–₹1000', min: '500', max: '1000' },
              { label: '₹1000–₹3000', min: '1000', max: '3000' },
              { label: 'Above ₹3000', min: '3000', max: '' },
            ].map(range => (
              <button
                key={range.label}
                onClick={() => { setPriceRange({ min: range.min, max: range.max }); onUpdate({ minPrice: range.min, maxPrice: range.max }); }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                  priceRange.min === range.min && priceRange.max === range.max
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            Apply Price Filter
          </button>
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {getSizes().map(size => (
            <button
              key={size}
              onClick={() => onUpdate({ size: params.size === size ? '' : size })}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                params.size === size
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => {
            const colorMap = {
              Black: '#111827', White: '#f9fafb', Gray: '#6b7280', Navy: '#1e3a5f',
              Blue: '#3b82f6', Red: '#ef4444', Pink: '#ec4899', Green: '#22c55e',
              Yellow: '#eab308', Brown: '#92400e', Beige: '#d4b896', Orange: '#f97316',
              Purple: '#a855f7', Maroon: '#7f1d1d', Olive: '#65a30d', Teal: '#14b8a6',
              Burgundy: '#6b1e2b', Mustard: '#d97706', Coral: '#f8705a', Cream: '#fffbeb',
            };
            const hex = colorMap[color] || '#ccc';
            return (
              <button
                key={color}
                onClick={() => onUpdate({ color: params.color === color ? '' : color })}
                title={color}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium transition-all ${
                  params.color === color
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-red-400'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: hex }}
                />
                {color}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}
