import React, { useState } from 'react';
import { Product, ShopSettings } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Barcode, 
  AlertTriangle, 
  Filter, 
  X, 
  Check, 
  Calendar, 
  DollarSign, 
  Truck, 
  Tag,
  Sparkles
} from 'lucide-react';

interface ProductManagementViewProps {
  products: Product[];
  settings: ShopSettings;
  onSaveProduct: (productData: Partial<Product> & { name: string; barcode: string; purchasePrice: number; sellingPrice: number; quantity: number }) => void;
  onDeleteProduct: (id: string) => void;
  onOpenBarcodeGenerator: (product: Product) => void;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onOpenBarcodeGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out' | 'expiring'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains & Atta',
    barcode: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    supplierName: '',
    expiryDate: '',
    unit: 'pcs',
  });

  const currency = settings.currencySymbol || '₹';

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grains & Atta',
      barcode: `${Math.floor(8900000000000 + Math.random() * 90000000000)}`,
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      supplierName: '',
      expiryDate: '',
      unit: 'pcs',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
      supplierName: product.supplierName || '',
      expiryDate: product.expiryDate || '',
      unit: product.unit || 'pcs',
    });
    setIsModalOpen(true);
  };

  const handleGenerateBarcode = () => {
    const randomBarcode = `${Math.floor(8900000000000 + Math.random() * 90000000000)}`;
    setFormData(prev => ({ ...prev, barcode: randomBarcode }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.purchasePrice || !formData.sellingPrice || !formData.quantity) {
      alert('Please fill in all required product fields.');
      return;
    }

    onSaveProduct({
      id: editingProduct ? editingProduct.id : undefined,
      name: formData.name,
      category: formData.category,
      barcode: formData.barcode,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity),
      supplierName: formData.supplierName,
      expiryDate: formData.expiryDate || undefined,
      unit: formData.unit,
    });

    setIsModalOpen(false);
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    let matchesFilter = true;
    if (filterType === 'low') {
      matchesFilter = p.quantity > 0 && p.quantity <= (p.minStockLevel || settings.lowStockThreshold);
    } else if (filterType === 'out') {
      matchesFilter = p.quantity <= 0;
    } else if (filterType === 'expiring') {
      if (!p.expiryDate) matchesFilter = false;
      else {
        const exp = new Date(p.expiryDate).getTime();
        matchesFilter = exp <= (Date.now() + 30 * 24 * 3600 * 1000);
      }
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.supplierName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);

    return matchesCategory && matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Product Inventory Management ({products.length} SKUs)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage product pricing, stock quantities, barcodes, suppliers, and expiry dates.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-md hover:shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, barcode, or supplier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterType === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Items ({products.length})
            </button>

            <button
              onClick={() => setFilterType('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterType === 'low'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              Low Stock
            </button>

            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterType === 'out'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              Out of Stock
            </button>

            <button
              onClick={() => setFilterType('expiring')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterType === 'expiring'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}
            >
              Expiring Soon
            </button>
          </div>

        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-700/60 scrollbar-none">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="p-3.5">ID / Barcode</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Cost Price</th>
                <th className="p-3.5 text-right">Sell Price</th>
                <th className="p-3.5 text-right">Margin %</th>
                <th className="p-3.5 text-center">In Stock</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const marginPercent = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0;
                  const isLow = p.quantity <= (p.minStockLevel || settings.lowStockThreshold);
                  const isOut = p.quantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                      <td className="p-3.5">
                        <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{p.id}</div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {p.barcode}
                        </div>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-100 max-w-xs">
                        {p.name}
                        {p.expiryDate && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-normal mt-0.5">
                            Exp: {p.expiryDate}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {currency}{p.purchasePrice}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currency}{p.sellingPrice}
                      </td>

                      <td className="p-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        +{marginPercent}%
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                          isOut
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {p.quantity} {p.unit || 'pcs'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                        {p.supplierName || 'General'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenBarcodeGenerator(p)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
                            title="Print Barcode Label"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Inventory'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Sunflower Oil 1L"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="category-suggestions">
                    <option value="Grains & Atta" />
                    <option value="Rice & Pulses" />
                    <option value="Oils & Ghee" />
                    <option value="Spices & Salt" />
                    <option value="Beverages" />
                    <option value="Snacks & Biscuits" />
                    <option value="Dairy & Bakery" />
                    <option value="Personal Care" />
                    <option value="Household" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Type
                  </label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="packet">Packet</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Litre (L)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="bag">Bag / Sack</option>
                    <option value="box">Box / Carton</option>
                  </select>
                </div>
              </div>

              {/* Barcode Field with Auto Generator */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Barcode Number *</span>
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="text-emerald-600 hover:underline font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto Generate
                  </button>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Scan USB barcode or auto-generate"
                  value={formData.barcode}
                  onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="125"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fortune Wholesalers"
                    value={formData.supplierName}
                    onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                >
                  Save Product
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
