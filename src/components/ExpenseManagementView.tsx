import React, { useState } from 'react';
import { Expense, ExpenseCategory, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  TrendingDown, 
  PieChart, 
  Calendar, 
  DollarSign 
} from 'lucide-react';

interface ExpenseManagementViewProps {
  settings: ShopSettings;
}

export const ExpenseManagementView: React.FC<ExpenseManagementViewProps> = ({ settings }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => sqliteDB.getExpenses());
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Rent');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank' | 'Card'>('Cash');
  const [notes, setNotes] = useState('');

  const refreshExpenses = () => {
    setExpenses(sqliteDB.getExpenses());
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) return;

    sqliteDB.saveExpense({
      title,
      category,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      paymentMode,
      notes,
    });

    setShowAddModal(false);
    setTitle('');
    setAmount('');
    setNotes('');
    refreshExpenses();
  };

  const handleDeleteExpense = (id: string) => {
    sqliteDB.deleteExpense(id);
    refreshExpenses();
  };

  const filteredExpenses = categoryFilter === 'ALL' 
    ? expenses 
    : expenses.filter(e => e.category === categoryFilter);

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenseAmount = expenses
    .filter(e => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-600" />
            Shop Expense Management & Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log shop rent, electricity, employee salaries, and operating expenses. Automatically calculates net profit!
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Expense Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Expenses</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {settings.currencySymbol}{todayExpenseAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Recorded Expenses</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {settings.currencySymbol}{totalExpenseAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expense Entries</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {expenses.length} records
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto">
        {['ALL', 'Rent', 'Electricity', 'Salary', 'Internet', 'Transport', 'Miscellaneous'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === cat
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No expense records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{exp.title}</div>
                      {exp.notes && <div className="text-[10px] text-slate-400 mt-0.5">{exp.notes}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{exp.paymentMode}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400 text-sm">
                      {settings.currencySymbol}{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Record Shop Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. BESCOM Electricity Bill"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Rent">Shop Rent</option>
                    <option value="Electricity">Electricity / Utilities</option>
                    <option value="Salary">Staff Salary</option>
                    <option value="Internet">Internet / Phone</option>
                    <option value="Transport">Transport / Freight</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank">Bank NEFT / IMPS</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Receipt #4412"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 shadow-sm"
                >
                  Save Expense Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
