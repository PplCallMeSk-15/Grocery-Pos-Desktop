import React, { useState } from 'react';
import { Product, ShopSettings, Sale } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  PackageX, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Calendar 
} from 'lucide-react';

interface InventoryIntelligenceViewProps {
  settings: ShopSettings;
}

export const InventoryIntelligenceView: React.FC<InventoryIntelligenceViewProps> = ({ settings }) => {
  const products = sqliteDB.getProducts();
  const sales = sqliteDB.getSales();

  const [activeTab, setActiveTab] = useState<'fast' | 'slow' | 'dead' | 'expiring' | 'low'>('fast');

  // Compute product sales quantities
  const productSalesMap: Record<string, number> = {};
  sales.forEach(s => {
    s.items.forEach(i => {
      productSalesMap[i.productId] = (productSalesMap[i.productId] || 0) + i.quantity;
    });
  });

  // Fast moving: top 5 highest sales
  const fastMovingProducts = [...products]
    .sort((a, b) => (productSalesMap[b.id] || 0) - (productSalesMap[a.id] || 0))
    .slice(0, 8);

  // Slow moving: 1-2 sales
  const slowMovingProducts = products.filter(p => (productSalesMap[p.id] || 0) > 0 && (productSalesMap[p.id] || 0) <= 2);

  // Dead stock: zero sales
  const deadStockProducts = products.filter(p => !productSalesMap[p.id] || productSalesMap[p.id] === 0);

  // Low stock
  const lowStockProducts = products.filter(p => p.quantity <= (p.minStockLevel || settings.lowStockThreshold));

  // Expiring soon (<30 days)
  const expiringProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate).getTime();
    const thirtyDays = Date.now() + 30 * 24 * 3600 * 1000;
    return exp <= thirtyDays;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500" />
          Smart Inventory Intelligence & Shelf Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Automated stock forecasting: Identify fast-selling items, dead stock, low stock reorders, and shelf locations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'fast' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Fast Moving Items ({fastMovingProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'slow' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Slow Moving ({slowMovingProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dead')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dead' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <PackageX className="w-4 h-4" />
          <span>Dead Stock ({deadStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('low')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'low' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Reorders ({lowStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'expiring' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Expiry Risk ({expiringProducts.length})</span>
        </button>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'fast' ? fastMovingProducts :
          activeTab === 'slow' ? slowMovingProducts :
          activeTab === 'dead' ? deadStockProducts :
          activeTab === 'low' ? lowStockProducts :
          expiringProducts).map(product => (
            <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500">{product.category}</span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-1">{product.name}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span>Shelf: {product.shelfLocation || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">In Stock</span>
                  <span className={`text-base font-bold ${
                    product.quantity <= settings.lowStockThreshold ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {product.quantity} {product.unit || 'pcs'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Sold Units: <strong className="text-emerald-600">{productSalesMap[product.id] || 0}</strong></span>
                <span>Selling Price: <strong>{settings.currencySymbol}{product.sellingPrice}</strong></span>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};
