import React from 'react';
import { DashboardMetrics, Sale, Product, ShopSettings, TabType } from '../types';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  Receipt, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Eye,
  QrCode,
  CreditCard,
  Coins,
  Wallet
} from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  recentSales: Sale[];
  lowStockProducts: Product[];
  settings: ShopSettings;
  onNavigate: (tab: TabType) => void;
  onViewInvoice: (sale: Sale) => void;
  onQuickAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentSales,
  lowStockProducts,
  settings,
  onNavigate,
  onViewInvoice,
  onQuickAddProduct,
}) => {
  const currency = settings.currencySymbol || '₹';

  // Calculate Today's Payment Mode Breakdown
  const todayStr = new Date().toDateString();
  const todaySales = recentSales.filter(s => new Date(s.dateTime).toDateString() === todayStr && s.status === 'Completed');
  const todayCash = todaySales.filter(s => s.paymentMode === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0);
  const todayUpi = todaySales.filter(s => s.paymentMode === 'UPI').reduce((acc, s) => acc + s.totalAmount, 0);
  const todayCard = todaySales.filter(s => s.paymentMode === 'Card').reduce((acc, s) => acc + s.totalAmount, 0);
  const todayCredit = todaySales.filter(s => s.paymentMode === 'Credit').reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Shop Overview & Performance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time sales, inventory status, and profit tracking from local database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-md hover:shadow-emerald-500/20 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open Billing Counter (F2)</span>
          </button>

          <button
            onClick={() => onNavigate('stock_in')}
            className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Incoming Stock</span>
          </button>

          <button
            onClick={onQuickAddProduct}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-xs flex items-center gap-1.5 transition"
          >
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>New Product Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today Sales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {currency}{metrics.todaySalesAmount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong>{metrics.todaySalesCount}</strong> completed transactions today</span>
            </p>
          </div>
        </div>

        {/* Today Profit */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Net Profit
            </span>
            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {currency}{metrics.todayProfit.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Overall Profit: <strong className="text-teal-600 dark:text-teal-400">{currency}{metrics.totalProfitAllTime.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Total Products & Available Stock */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Products / Items
            </span>
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {metrics.totalProductsCount} <span className="text-xs font-normal text-slate-500">SKUs</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Available Stock Qty: <strong>{metrics.totalAvailableStock}</strong> units</span>
            </p>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Low Stock Alert
            </span>
            <div className={`p-2.5 rounded-xl ${
              metrics.lowStockCount > 0 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
              {metrics.lowStockCount}
              {metrics.lowStockCount > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  Needs Reorder
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1 font-medium"
            >
              View Inventory Table <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Today's Payment Collection Breakdown Grid */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Today's Payment Collections & Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-bold">
            Total Revenue: {currency}{metrics.todaySalesAmount.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Today Cash */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span>Today's Cash</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
              {currency}{todayCash.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">In Cash Drawer</p>
          </div>

          {/* Today UPI */}
          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-800 dark:text-purple-300">
              <span>Today's UPI</span>
              <QrCode className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
              {currency}{todayUpi.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Dynamic QR Payments</p>
          </div>

          {/* Today Card */}
          <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-800 dark:text-sky-300">
              <span>Today's Card</span>
              <CreditCard className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
              {currency}{todayCard.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">POS Machine</p>
          </div>

          {/* Today Credit */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
              <span>Today's Credit</span>
              <Wallet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
              {currency}{todayCredit.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Customer Dues</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert List & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bills (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  Recent Invoices & Transactions
                </h3>
              </div>
              <button
                onClick={() => onNavigate('sales_history')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View Full Sales History <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSales.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 space-y-2">
                <Receipt className="w-10 h-10 mx-auto stroke-1 opacity-60" />
                <p className="text-sm font-medium">No sales recorded yet today.</p>
                <p className="text-xs">Click "Open Billing Counter" to process your first customer transaction.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="pb-2.5">Invoice #</th>
                      <th className="pb-2.5">Time</th>
                      <th className="pb-2.5">Customer</th>
                      <th className="pb-2.5 text-center">Items</th>
                      <th className="pb-2.5 text-right">Amount</th>
                      <th className="pb-2.5 text-center">Mode</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                    {recentSales.slice(0, 6).map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {sale.invoiceNumber}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {new Date(sale.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                          {sale.customerName || 'Walk-in Customer'}
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-mono text-[11px]">
                            {sale.items.length}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {currency}{sale.totalAmount}
                        </td>
                        <td className="py-3 text-center">
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
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onViewInvoice(sale)}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition"
                            title="View / Print Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Urgent Reorder Panel (1 Column) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  Low Stock Products
                </h3>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {lowStockProducts.length} items
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto stroke-1 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Levels Healthy!</p>
                <p className="text-xs">All inventory items are above the minimum threshold limit.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {lowStockProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Supplier: {product.supplierName || 'General'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {product.quantity} left
                      </div>
                      <button
                        onClick={() => onNavigate('stock_in')}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 block"
                      >
                        + Add Stock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Threshold: &le; {settings.lowStockThreshold} units</span>
            <button
              onClick={() => onNavigate('settings')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Configure Limit
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
