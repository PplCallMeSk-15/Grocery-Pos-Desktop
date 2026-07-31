import React, { useState } from 'react';
import { ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  Search, 
  X, 
  Package, 
  Receipt, 
  Users, 
  Truck, 
  UserCheck, 
  ChevronRight 
} from 'lucide-react';

interface GlobalSearchModalProps {
  settings: ShopSettings;
  onClose: () => void;
  onNavigate: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ settings, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const products = sqliteDB.getProducts();
  const sales = sqliteDB.getSales();
  const customers = sqliteDB.getCustomers();
  const suppliers = sqliteDB.getSuppliers();

  const cleanQuery = query.toLowerCase().trim();

  const matchingProducts = cleanQuery ? products.filter(p => 
    p.name.toLowerCase().includes(cleanQuery) || 
    p.barcode.includes(cleanQuery) ||
    p.category.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchingSales = cleanQuery ? sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(cleanQuery) ||
    (s.customerName && s.customerName.toLowerCase().includes(cleanQuery)) ||
    (s.customerPhone && s.customerPhone.includes(cleanQuery))
  ).slice(0, 4) : [];

  const matchingCustomers = cleanQuery ? customers.filter(c => 
    c.name.toLowerCase().includes(cleanQuery) || 
    c.phone.includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchingSuppliers = cleanQuery ? suppliers.filter(s => 
    s.name.toLowerCase().includes(cleanQuery) || 
    s.companyName.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center z-50 pt-20 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-4 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, invoice #, customers, suppliers... (Ctrl + K)"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto space-y-4 text-xs">
          {!cleanQuery ? (
            <div className="text-center py-8 text-slate-400">
              Type to search across entire store database...
            </div>
          ) : (
            <>
              {/* Products */}
              {matchingProducts.length > 0 && (
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-emerald-500" /> Products Inventory
                  </p>
                  {matchingProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { onNavigate('products'); onClose(); }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode} • Stock: {p.quantity}</div>
                      </div>
                      <span className="font-bold text-emerald-600">{settings.currencySymbol}{p.sellingPrice}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices */}
              {matchingSales.length > 0 && (
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-sky-500" /> Sales Receipts
                  </p>
                  {matchingSales.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => { onNavigate('sales_history'); onClose(); }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/50 cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{s.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{s.customerName} • {new Date(s.dateTime).toLocaleDateString()}</div>
                      </div>
                      <span className="font-bold text-sky-600">{settings.currencySymbol}{s.totalAmount}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {matchingCustomers.length > 0 && (
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-500" /> Customers
                  </p>
                  {matchingCustomers.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { onNavigate('customers'); onClose(); }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</div>
                        <div className="text-[10px] text-slate-400">Phone: {c.phone}</div>
                      </div>
                      <span className="font-bold text-purple-600">{c.tag}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
