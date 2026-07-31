import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  Zap, 
  ShoppingCart, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  FileSpreadsheet, 
  Sparkles,
  Layers,
  Search
} from 'lucide-react';

export const SmartReorderView: React.FC = () => {
  const suggestions = sqliteDB.getSmartReorderSuggestions();
  const currency = sqliteDB.getSettings().currencySymbol || '₹';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>(suggestions.map(s => s.productId));
  const [createdPoSuccess, setCreatedPoSuccess] = useState(false);

  const filtered = suggestions.filter(s => 
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCost = filtered
    .filter(s => selectedItems.includes(s.productId))
    .reduce((acc, s) => acc + s.estimatedCost, 0);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGeneratePOs = () => {
    const toOrder = suggestions.filter(s => selectedItems.includes(s.productId));
    if (toOrder.length === 0) return;

    // Group by supplier
    const grouped: Record<string, typeof toOrder> = {};
    toOrder.forEach(item => {
      const sup = item.supplierName || 'General Supplier';
      if (!grouped[sup]) grouped[sup] = [];
      grouped[sup].push(item);
    });

    // Create Purchase Orders for each supplier
    Object.entries(grouped).forEach(([supplierName, items]) => {
      const poItems = items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        qty: i.suggestedQty,
        purchasePrice: i.estimatedCost / i.suggestedQty,
      }));

      sqliteDB.savePurchaseOrder({
        supplierId: 'SUP-01',
        supplierName,
        items: poItems,
        totalAmount: items.reduce((acc, i) => acc + i.estimatedCost, 0),
        status: 'Ordered',
        notes: 'Generated via Smart Reorder Engine (Auto-replenishment)',
      });
    });

    setCreatedPoSuccess(true);
    setTimeout(() => setCreatedPoSuccess(false), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Smart Inventory Reorder Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculates 30-day velocity, lead time, and min/max stock thresholds to prevent stockouts automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try { window.print(); } catch (e) { console.warn('Print error:', e); }
            }}
            className="no-print px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Order Sheet
          </button>
          <button
            onClick={handleGeneratePOs}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            Create Purchase Orders ({selectedItems.length})
          </button>
        </div>
      </div>

      {createdPoSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Purchase Orders successfully generated and placed in Purchase Order management!</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">Low Stock Items</div>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">{suggestions.length} Products</div>
          </div>
        </div>

        <div className="bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-sky-700 dark:text-sky-400 font-medium">Selected Vendors</div>
            <div className="text-xl font-bold text-sky-900 dark:text-sky-200 mt-0.5">
              {new Set(suggestions.filter(s => selectedItems.includes(s.productId)).map(s => s.supplierName)).size} Suppliers
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Est. Reorder Cost</div>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
              {currency}{totalCost.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Table */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search product or supplier..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => setSelectedItems(suggestions.map(s => s.productId))}
              className="hover:text-emerald-600 font-semibold"
            >
              Select All
            </button>
            <span>|</span>
            <button
              onClick={() => setSelectedItems([])}
              className="hover:text-rose-600 font-semibold"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-700/60 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3 rounded-l-xl w-10">Select</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Daily Velocity</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">Suggested Reorder Qty</th>
                <th className="p-3 rounded-r-xl">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    All stock levels are optimal! No items require reordering at this time.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.productId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(s.productId)}
                        onChange={() => toggleSelect(s.productId)}
                        className="w-4 h-4 rounded-md text-emerald-600 accent-emerald-600"
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{s.productName}</td>
                    <td className="p-3 text-slate-500">{s.supplierName}</td>
                    <td className="p-3 font-bold text-rose-600">{s.currentStock}</td>
                    <td className="p-3 text-slate-500">{s.minStockLevel}</td>
                    <td className="p-3">{s.avgDailySales} pcs/day</td>
                    <td className="p-3 text-slate-500">{s.leadTimeDays} days</td>
                    <td className="p-3 font-bold text-emerald-600">{s.suggestedQty} pcs</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">
                      {currency}{s.estimatedCost.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
