import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { SORT_OPTIONS } from '../utils/helpers';

export default function Shop() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [searchInput, setSearchInput] = useState('');

  const getInitialParams = () => {
    const p = {};
    if (category) p.category = category;
    searchParams.forEach((v, k) => { if (v) p[k] = v; });
    return p;
  };

  const [filterParams, setFilterParams] = useState(getInitialParams);
  // Dynamic categories from DB
  const [allCategories, setAllCategories] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productAPI.getAll({ ...filterParams, page, limit: 16 });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [filterParams, page]);
  useEffect(() => {
    if (category) {
      setFilterParams(prev => ({ ...prev, category, subCategory: '', productType: '' }));
      setPage(1);
    }
  }, [category]);

  // Fetch categories from API for dynamic subcategory chips
  useEffect(() => {
    categoryAPI.getAll()
      .then(data => setAllCategories(data.categories || []))
      .catch(() => setAllCategories([]));
  }, []);

  const updateFilter = (newParams) => {
    setFilterParams(prev => {
      const updated = { ...prev };
      Object.entries(newParams).forEach(([k, v]) => {
        if (v) updated[k] = v;
        else delete updated[k];
      });
      return updated;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilterParams(category ? { category } : {});
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) updateFilter({ search: searchInput });
    else updateFilter({ search: '' });
  };

  // Find category object from API data
  const categoryData = filterParams.category
    ? allCategories.find(c => c.slug === filterParams.category)
    : null;

  const title = filterParams.subCategory
    ? filterParams.subCategory
    : filterParams.category
      ? (categoryData?.name || filterParams.category)
      : 'All Products';

  const breadcrumb = [
    filterParams.category && { label: categoryData?.name || filterParams.category },
    filterParams.subCategory && { label: filterParams.subCategory },
  ].filter(Boolean);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5">
          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 flex-wrap">
              <span
                onClick={() => { setFilterParams({}); setPage(1); }}
                className="hover:text-red-600 cursor-pointer"
              >
                All
              </span>
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span>›</span>
                  <span className={i === breadcrumb.length - 1 ? 'text-gray-700 font-medium' : 'hover:text-red-600 cursor-pointer'}>
                    {b.label}
                  </span>
                </span>
              ))}
            </nav>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-500 mt-0.5 text-sm">{total.toLocaleString()} products found</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative flex-1 md:w-72">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="input-field pl-9 py-2.5 text-sm w-full"
                />
                {searchInput && (
                  <button type="button" onClick={() => { setSearchInput(''); updateFilter({ search: '' }); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </form>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors md:hidden"
              >
                <FiFilter className="w-4 h-4" /> Filters
              </button>

              {/* Sort dropdown mobile */}
              <div className="hidden md:flex gap-1 border border-gray-200 rounded-xl p-1">
                <button onClick={() => setLayout('grid')} className={`p-2 rounded-lg transition-colors ${layout === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}><FiGrid /></button>
                <button onClick={() => setLayout('list')} className={`p-2 rounded-lg transition-colors ${layout === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}><FiList /></button>
              </div>
            </div>
          </div>

          {/* Quick Sub-Category chips — dynamic from DB */}
          {categoryData && categoryData.types?.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => updateFilter({ subCategory: '' })}
                className={`flex-shrink-0 text-xs px-4 py-2 rounded-full border font-semibold transition-all ${
                  !filterParams.subCategory
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 bg-white'
                }`}
              >
                All
              </button>
              {categoryData.types.map((subType) => (
                <button
                  key={subType}
                  onClick={() => updateFilter({ subCategory: filterParams.subCategory === subType ? '' : subType })}
                  className={`flex-shrink-0 text-xs px-4 py-2 rounded-full border font-semibold transition-all whitespace-nowrap ${
                    filterParams.subCategory === subType
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 bg-white'
                  }`}
                >
                  {subType}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar — desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <ProductFilters params={filterParams} onUpdate={updateFilter} onClear={clearFilters} />
          </div>

          {/* Mobile filters drawer */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed left-0 top-0 h-full w-80 bg-white z-50 overflow-y-auto p-4 md:hidden shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
                  </div>
                  <ProductFilters params={filterParams} onUpdate={(p) => { updateFilter(p); }} onClear={clearFilters} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 16 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className={
                  layout === 'grid'
                    ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col gap-4'
                }>
                  {products.map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-red-600 text-white shadow-md' : 'border border-gray-200 hover:bg-gray-50'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
