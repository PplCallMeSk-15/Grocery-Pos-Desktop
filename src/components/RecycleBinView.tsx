import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { RecycleBinItem } from '../types';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Users, 
  Truck, 
  TrendingDown 
} from 'lucide-react';

export const RecycleBinView: React.FC = () => {
  const [items, setItems] = useState<RecycleBinItem[]>(sqliteDB.getRecycleBin());
  const [successMsg, setSuccessMsg] = useState('');

  const refresh = () => {
    setItems(sqliteDB.getRecycleBin());
  };

  const handleRestore = (id: string, title: string) => {
    const ok = sqliteDB.restoreFromRecycleBin(id);
    if (ok) {
      setSuccessMsg(`Successfully restored "${title}" back to active database!`);
      setTimeout(() => setSuccessMsg(''), 3500);
      refresh();
    }
  };

  const handleEmpty = () => {
    sqliteDB.emptyRecycleBin();
    refresh();
    setSuccessMsg('Recycle bin emptied successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getItemIcon = (type: RecycleBinItem['type']) => {
    switch (type) {
      case 'Product': return <Package className="w-4 h-4 text-emerald-600" />;
      case 'Customer': return <Users className="w-4 h-4 text-sky-600" />;
      case 'Supplier': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'Expense': return <TrendingDown className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-600" />
            Recycle Bin & Safe Recovery Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Safely holds accidentally deleted products, customers, suppliers, and expense records with instant 1-click restoration.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleEmpty}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Empty Recycle Bin
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Recycle Bin Items List */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Deleted Items ({items.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-700/60 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3 rounded-l-xl">Type</th>
                <th className="p-3">Item Title / ID</th>
                <th className="p-3">Deleted Date</th>
                <th className="p-3">Deleted By</th>
                <th className="p-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    Recycle bin is completely clean! No deleted records found.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        {getItemIcon(item.type)}
                        <span>{item.type}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                      {item.title}
                      <div className="font-mono text-[10px] text-slate-400">{item.originalId}</div>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(item.deletedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 text-slate-500">{item.deletedBy}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRestore(item.id, item.title)}
                        className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold text-xs transition inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore Record
                      </button>
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
