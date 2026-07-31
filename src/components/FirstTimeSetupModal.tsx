import React, { useState } from 'react';
import { ShopSettings } from '../types';
import { Store, User, MapPin, Phone, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface FirstTimeSetupModalProps {
  isOpen: boolean;
  onSave: (settings: Partial<ShopSettings>) => void;
  onClearAllData?: (settings: Partial<ShopSettings>) => void;
  initialSettings: ShopSettings;
}

export const FirstTimeSetupModal: React.FC<FirstTimeSetupModalProps> = ({
  isOpen,
  onSave,
  onClearAllData,
  initialSettings,
}) => {
  const [dataMode, setDataMode] = useState<'clean' | 'sample'>('clean');
  const [formData, setFormData] = useState({
    shopName: initialSettings.shopName || '',
    ownerName: initialSettings.ownerName || '',
    address: initialSettings.address || '',
    phone: initialSettings.phone || '',
    gstNumber: initialSettings.gstNumber || '',
    invoicePrefix: initialSettings.invoicePrefix || 'INV',
    currencySymbol: initialSettings.currencySymbol || '₹',
    receiptType: initialSettings.receiptType || 'thermal',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopName || !formData.phone) {
      alert('Please fill in required shop name and phone number.');
      return;
    }

    const settingsObj = {
      ...formData,
      isSetupCompleted: true,
    };

    if (dataMode === 'clean' && onClearAllData) {
      onClearAllData(settingsObj);
    } else {
      onSave(settingsObj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to Offline Grocery POS</h2>
              <p className="text-xs text-emerald-100 mt-0.5">Set up your grocery shop profile to start managing stock and billing</p>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 font-black text-8xl pointer-events-none select-none">
            POS
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                Shop Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Valley Supermarket"
                value={formData.shopName}
                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Owner Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Shop Address
            </label>
            <input
              type="text"
              placeholder="e.g. Shop #14, Main Market Road, Bangalore"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                GST Number (Optional)
              </label>
              <input
                type="text"
                placeholder="29XXXXX0000X1Z5"
                value={formData.gstNumber}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Invoice & Print Preferences
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={e => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Bill Format
                </label>
                <select
                  value={formData.receiptType}
                  onChange={e => setFormData({ ...formData, receiptType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium"
                >
                  <option value="thermal">Thermal (80mm)</option>
                  <option value="a4">A4 Full Page</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Database Initialization Mode
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  dataMode === 'clean' 
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Clean Slate (Fresh Start)
                  </span>
                  <input
                    type="radio"
                    name="dataMode"
                    value="clean"
                    checked={dataMode === 'clean'}
                    onChange={() => setDataMode('clean')}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Recommended for real store owners. Starts with empty inventory so you can enter your own real products from scratch.
                </p>
              </label>

              <label 
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  dataMode === 'sample' 
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-sky-600" />
                    Pre-loaded Demo Data
                  </span>
                  <input
                    type="radio"
                    name="dataMode"
                    value="sample"
                    checked={dataMode === 'sample'}
                    onChange={() => setDataMode('sample')}
                    className="w-4 h-4 accent-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pre-loads 15 sample grocery items (Atta, Oil, Pulses, Biscuits) for immediate feature testing & software demonstration.
                </p>
              </label>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold">Local SQLite Data Storage</p>
              <p className="text-[11px] opacity-90">All invoices, product catalogs, and profits will be stored offline on this computer.</p>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete First Time Setup & Open POS
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
