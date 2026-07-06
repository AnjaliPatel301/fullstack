import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiPackage } from 'react-icons/fi';
import { sellerAPI, categoryAPI } from '../../services/api';
import SellerLayout from './SellerLayout';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', subCategory: '', productType: '', brand: '',
  images: '', sizes: '', colors: '', stock: '', sku: '', tags: '',
  isFeatured: false, isFlashSale: false, flashSalePrice: '',
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const selectedCat = categories.find(c => c.slug === form.category);
  const availableSubcats = selectedCat?.types || [];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await sellerAPI.getProducts({ search: search || undefined, limit: 20 });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  useEffect(() => {
    categoryAPI.getAll().then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const set = (key) => (e) =>
    setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const openAdd = () => {
    setForm({ ...emptyForm, category: categories[0]?.slug || '' });
    setEditId(null); setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      images: p.images?.join(', ') || '',
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      tags: p.tags?.join(', ') || '',
    });
    setEditId(p._id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editId) { await sellerAPI.updateProduct(editId, payload); toast.success('Product updated!'); }
      else { await sellerAPI.createProduct(payload); toast.success('Product added!'); }
      setShowForm(false); fetchProducts();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await sellerAPI.deleteProduct(id); toast.success('Product deleted'); fetchProducts(); }
    catch (err) { toast.error(err.message || 'Failed'); }
  };

  const InputField = ({ label, field, type = 'text', placeholder, required, className = '' }) => (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">{label}</label>
      <input type={type} value={form[field]} onChange={set(field)} required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white" />
    </div>
  );

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">{total} products</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md">
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FiX className="w-4 h-4" /></button>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-gray-100 animate-pulse rounded-lg" /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="text-center py-16 text-gray-400">
                    <FiPackage className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No products yet</p>
                    <button onClick={openAdd} className="text-indigo-600 text-sm font-medium mt-2">Add your first product →</button>
                  </div>
                </td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full capitalize">{p.category}</span>
                    {p.subCategory && <span className="ml-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">{p.subCategory}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm text-gray-900">₹{p.price}</p>
                    {p.originalPrice && <p className="text-xs text-gray-400 line-through">₹{p.originalPrice}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock} left
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-2xl my-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-800 text-lg">{editId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Product Name *" field="name" required className="sm:col-span-2" placeholder="e.g. Silk Saree" />
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Description *</label>
                    <textarea value={form.description} onChange={set('description')} required rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white resize-none" />
                  </div>

                  {/* Category — fetched from DB */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Category *</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value, subCategory: '' }))} required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50">
                      <option value="">-- Select --</option>
                      {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Subcategory — dynamic from selected category */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Subcategory</label>
                    {availableSubcats.length > 0 ? (
                      <select value={form.subCategory} onChange={set('subCategory')}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50">
                        <option value="">-- Select --</option>
                        {availableSubcats.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <input value={form.subCategory} onChange={set('subCategory')} placeholder="Subcategory"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                    )}
                  </div>

                  <InputField label="Price (₹) *" field="price" type="number" required placeholder="999" />
                  <InputField label="Original Price (₹)" field="originalPrice" type="number" placeholder="1499" />
                  <InputField label="Stock *" field="stock" type="number" required placeholder="50" />
                  <InputField label="Brand" field="brand" placeholder="LuxeFit" />
                  <InputField label="SKU" field="sku" placeholder="LXF-001" />
                  <InputField label="Product Type" field="productType" placeholder="e.g. Kurta" />
                  <InputField label="Images (comma separated URLs)" field="images" className="sm:col-span-2" placeholder="https://..." />
                  <InputField label="Sizes (comma separated)" field="sizes" placeholder="S, M, L, XL" />
                  <InputField label="Tags" field="tags" placeholder="silk, festive, women" />

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFlashSale} onChange={set('isFlashSale')} className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">Flash Sale</span>
                    </label>
                  </div>
                  {form.isFlashSale && (
                    <InputField label="Flash Sale Price" field="flashSalePrice" type="number" placeholder="699" />
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 text-sm">
                    {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SellerLayout>
  );
}
