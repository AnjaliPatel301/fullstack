import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit2, FiX, FiCheck, FiChevronDown, FiChevronUp, FiTag, FiLock, FiPlus } from 'react-icons/fi';
import { categoryAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const MAIN_CATEGORY_ORDER = ['men', 'women', 'kids', 'accessories'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Type (subcategory) form state per category
  const [newTypes, setNewTypes] = useState({});
  const [addingType, setAddingType] = useState({});
  const [editingType, setEditingType] = useState({}); // { catId: { oldType, newVal } }

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryAPI.getAllAdmin();
      // Sort in fixed order
      const raw = data.categories || [];
      const ordered = MAIN_CATEGORY_ORDER
        .map(slug => raw.find(c => c.slug === slug))
        .filter(Boolean);
      // Append any extras not in fixed order
      const extras = raw.filter(c => !MAIN_CATEGORY_ORDER.includes(c.slug));
      setCategories([...ordered, ...extras]);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Subcategory (Type) CRUD ──────────────────────────────────────
  const handleAddType = async (catId) => {
    const type = (newTypes[catId] || '').trim();
    if (!type) return;
    setAddingType(p => ({ ...p, [catId]: true }));
    try {
      const data = await categoryAPI.addType(catId, type);
      setCategories(prev => prev.map(c => c._id === catId ? data.category : c));
      setNewTypes(p => ({ ...p, [catId]: '' }));
      toast.success(`"${type}" subcategory added!`);
    } catch (err) { toast.error(err.message || 'Failed to add subcategory'); }
    finally { setAddingType(p => ({ ...p, [catId]: false })); }
  };

  const handleDeleteType = async (catId, type) => {
    if (!window.confirm(`Delete subcategory "${type}"?`)) return;
    try {
      const data = await categoryAPI.removeType(catId, type);
      setCategories(prev => prev.map(c => c._id === catId ? data.category : c));
      toast.success(`"${type}" removed`);
    } catch (err) { toast.error(err.message || 'Failed to remove subcategory'); }
  };

  const startRenameType = (catId, type) => {
    setEditingType(p => ({ ...p, [catId]: { oldType: type, newVal: type } }));
  };

  const handleRenameType = async (catId) => {
    const et = editingType[catId];
    if (!et || !et.newVal.trim() || et.newVal === et.oldType) {
      setEditingType(p => { const n = { ...p }; delete n[catId]; return n; });
      return;
    }
    try {
      const data = await categoryAPI.renameType(catId, et.oldType, et.newVal.trim());
      setCategories(prev => prev.map(c => c._id === catId ? data.category : c));
      toast.success('Subcategory renamed!');
      setEditingType(p => { const n = { ...p }; delete n[catId]; return n; });
    } catch (err) {
      toast.error(err.message || 'Failed to rename');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await categoryAPI.update(cat._id, { isActive: !cat.isActive });
      toast.success(cat.isActive ? 'Category hidden' : 'Category activated');
      fetchCategories();
    } catch (err) { toast.error(err.message || 'Failed to update'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">4 fixed main categories — manage subcategories dynamically</p>
          </div>
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
            <FiLock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Main categories are fixed. Add unlimited subcategories under each.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-sm font-bold">i</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">How to use:</p>
            <p className="text-xs text-blue-600 mt-1">
              The 4 main categories (Men's Fashion, Women's Fashion, Kids Fashion, Accessories) are fixed and cannot be deleted.
              Expand any category to add, rename, or remove subcategories. These subcategories appear automatically in the Navbar and product filters.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-50 rounded w-64" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cat.isActive ? 'border-gray-100' : 'border-gray-200 opacity-75'}`}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Fixed badge */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-base">{cat.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">/{cat.slug}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <FiLock className="w-3 h-3" /> Fixed
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.types?.length || 0} subcategories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        cat.isActive
                          ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                          : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </button>
                    {/* Expand/collapse */}
                    <button
                      onClick={() => setExpandedId(expandedId === cat._id ? null : cat._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Manage subcategories"
                    >
                      {expandedId === cat._id ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Subcategory Tags (collapsed preview) */}
                {expandedId !== cat._id && cat.types?.length > 0 && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {cat.types.slice(0, 8).map(type => (
                      <span key={type} className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-100">
                        <FiTag className="w-2.5 h-2.5" /> {type}
                      </span>
                    ))}
                    {cat.types.length > 8 && (
                      <button
                        onClick={() => setExpandedId(cat._id)}
                        className="text-xs text-red-500 font-medium hover:underline px-2"
                      >
                        +{cat.types.length - 8} more →
                      </button>
                    )}
                  </div>
                )}

                {/* Expanded Subcategory Manager */}
                <AnimatePresence>
                  {expandedId === cat._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-100 bg-gray-50/50"
                    >
                      <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Subcategories ({cat.types?.length || 0})
                          </h4>
                          <span className="text-xs text-gray-400">Click pencil to rename, trash to delete</span>
                        </div>

                        {/* Existing types */}
                        {cat.types?.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {cat.types.map(type => (
                              <div key={type} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2 gap-2">
                                {editingType[cat._id]?.oldType === type ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      autoFocus
                                      value={editingType[cat._id].newVal}
                                      onChange={e => setEditingType(p => ({ ...p, [cat._id]: { ...p[cat._id], newVal: e.target.value } }))}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') handleRenameType(cat._id);
                                        if (e.key === 'Escape') setEditingType(p => { const n = { ...p }; delete n[cat._id]; return n; });
                                      }}
                                      className="flex-1 text-xs border border-red-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400"
                                    />
                                    <button onClick={() => handleRenameType(cat._id)} className="text-green-500 hover:text-green-700 flex-shrink-0">
                                      <FiCheck className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingType(p => { const n = { ...p }; delete n[cat._id]; return n; })} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                      <FiX className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs text-gray-700 font-medium flex-1 truncate">{type}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button onClick={() => startRenameType(cat._id, type)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded">
                                        <FiEdit2 className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => handleDeleteType(cat._id, type)} className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded">
                                        <FiTrash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-sm mb-4 bg-white rounded-xl border border-dashed border-gray-200">
                            No subcategories yet. Add your first one below.
                          </div>
                        )}

                        {/* Add new subcategory */}
                        <div className="flex gap-2">
                          <input
                            value={newTypes[cat._id] || ''}
                            onChange={e => setNewTypes(p => ({ ...p, [cat._id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleAddType(cat._id)}
                            placeholder={`Add subcategory to ${cat.name}... e.g. Sarees`}
                            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                          />
                          <button
                            onClick={() => handleAddType(cat._id)}
                            disabled={addingType[cat._id]}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex-shrink-0"
                          >
                            <FiPlus className="w-4 h-4" />
                            {addingType[cat._id] ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          New subcategories appear automatically in Navbar and product filters.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
