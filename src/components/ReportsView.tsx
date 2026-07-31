import React, { useState } from 'react';
import { Sale, Product, ShopSettings } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Calendar, 
  PieChart, 
  Award, 
  FileText, 
  Printer
} from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
  settings: ShopSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  products,
  settings,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const currency = settings.currencySymbol || '₹';

  // Date filtering logic
  const now = new Date();
  const filteredSales = sales.filter(s => {
    if (s.status !== 'Completed') return false;
    const saleDate = new Date(s.dateTime);

    if (timeRange === 'today') {
      return saleDate.toDateString() === now.toDateString();
    } else if (timeRange === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return saleDate >= sevenDaysAgo;
    } else if (timeRange === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return saleDate >= thirtyDaysAgo;
    }
    return true;
  });

  // Calculate totals
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + s.totalProfit, 0);
  const totalDiscount = filteredSales.reduce((acc, s) => acc + s.discountAmount, 0);
  const totalTax = filteredSales.reduce((acc, s) => acc + s.taxAmount, 0);
  const totalTransactions = filteredSales.length;

  // Best Selling Products Aggregation
  const itemSalesMap: { [productName: string]: { qty: number; revenue: number; profit: number } } = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      if (!itemSalesMap[item.productName]) {
        itemSalesMap[item.productName] = { qty: 0, revenue: 0, profit: 0 };
      }
      itemSalesMap[item.productName].qty += item.quantity;
      itemSalesMap[item.productName].revenue += item.totalPrice;
      const profitPerUnit = item.unitSellingPrice - item.unitPurchasePrice;
      itemSalesMap[item.productName].profit += profitPerUnit * item.quantity;
    });
  });

  const bestSellers = Object.entries(itemSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // Payment Breakdown
  const paymentBreakdown = {
    Cash: filteredSales.filter(s => s.paymentMode === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0),
    UPI: filteredSales.filter(s => s.paymentMode === 'UPI').reduce((acc, s) => acc + s.totalAmount, 0),
    Card: filteredSales.filter(s => s.paymentMode === 'Card').reduce((acc, s) => acc + s.totalAmount, 0),
    Credit: filteredSales.filter(s => s.paymentMode === 'Credit').reduce((acc, s) => acc + s.totalAmount, 0),
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvStr = `Invoice Number,Date Time,Customer Name,Customer Phone,Items Count,Subtotal,Discount,Tax,Grand Total,Payment Mode,Profit\n`;
    filteredSales.forEach(s => {
      csvStr += `"${s.invoiceNumber}","${s.dateTime}","${s.customerName || ''}","${s.customerPhone || ''}",${s.items.length},${s.subtotal},${s.discountAmount},${s.taxAmount},${s.totalAmount},"${s.paymentMode}",${s.totalProfit}\n`;
    });

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grocery_sales_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Offline Sales & Profit Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed performance breakdown, gross profit margins, and best-selling product analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Toggle */}
          <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex text-xs font-medium">
            {(['today', 'week', 'month', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Total Gross Revenue</div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {currency}{totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">{totalTransactions} completed sales</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Total Net Profit</div>
          <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-2">
            {currency}{totalProfit.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Margin: <strong>{totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Total Discounts Given</div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-2">
            {currency}{totalDiscount.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Customer savings offered</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">GST / Tax Collected</div>
          <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400 mt-2">
            {currency}{totalTax.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Tax liability summary</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 10 Best Selling Items (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Top 10 Best-Selling Grocery Items
            </h3>
          </div>

          {bestSellers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              No sales data found for selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-400">
                    <th className="pb-2"># Rank</th>
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2 text-center">Qty Sold</th>
                    <th className="pb-2 text-right">Total Revenue</th>
                    <th className="pb-2 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                  {bestSellers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 font-bold font-mono text-slate-500">#{idx + 1}</td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="py-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {item.qty} units
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currency}{item.revenue}
                      </td>
                      <td className="py-3 text-right font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {currency}{item.profit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Mode Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Payment Method Revenue
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(paymentBreakdown).map(([mode, amt]) => {
                const percent = totalRevenue > 0 ? Math.round((amt / totalRevenue) * 100) : 0;

                return (
                  <div key={mode} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{mode} Payments</span>
                      <span className="font-mono text-emerald-600 font-bold">{currency}{amt} ({percent}%)</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
