import React, { useState } from 'react';
import { Sale, ShopSettings } from '../types';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  RotateCcw, 
  Calendar, 
  DollarSign, 
  XCircle, 
  CheckCircle2, 
  Filter
} from 'lucide-react';

interface SalesHistoryViewProps {
  sales: Sale[];
  settings: ShopSettings;
  onViewInvoice: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  settings,
  onViewInvoice,
  onCancelSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  const currency = settings.currencySymbol || '₹';

  const filteredSales = sales.filter(s => {
    const matchesPayment = paymentFilter === 'All' || s.paymentMode === paymentFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q));
    return matchesPayment && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Sales & Invoice History ({sales.length} Bills)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View past invoices, reprint thermal/A4 bills, or process customer returns.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, customer name, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Payment:</span>
          {['All', 'Cash', 'UPI', 'Card', 'Credit'].map(mode => (
            <button
              key={mode}
              onClick={() => setPaymentFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                paymentFilter === mode
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5 text-center">Items</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">Discount</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-center">Payment</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    No sales invoices found.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {sale.invoiceNumber}
                    </td>

                    <td className="p-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(sale.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {sale.customerName || 'Walk-in Customer'}
                      {sale.customerPhone && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{sale.customerPhone}</div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-mono text-[11px]">
                        {sale.items.length} items
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {currency}{sale.subtotal}
                    </td>

                    <td className="p-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      -{currency}{sale.discountAmount}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {currency}{sale.totalAmount}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sale.paymentMode === 'Cash'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : sale.paymentMode === 'UPI'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {sale.paymentMode}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {sale.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View
                        </button>

                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition border border-emerald-200 dark:border-emerald-800"
                          title="Print Receipt / Bill"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Print
                        </button>

                        {sale.status === 'Completed' && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel invoice ${sale.invoiceNumber}? Items will be returned to stock inventory.`)) {
                                onCancelSale(sale.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Cancel / Refund Sale"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
