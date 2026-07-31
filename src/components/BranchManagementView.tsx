import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { Branch } from '../types';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Trash2, 
  Edit, 
  Check, 
  Store 
} from 'lucide-react';

export const BranchManagementView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(sqliteDB.getBranches());
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const refresh = () => {
    setBranches(sqliteDB.getBranches());
  };

  const openAddModal = () => {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setIsPrimary(false);
    setShowModal(true);
  };

  const openEditModal = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setCode(b.code);
    setAddress(b.address);
    setPhone(b.phone);
    setIsPrimary(b.isPrimary);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    sqliteDB.saveBranch({
      id: editingBranch?.id,
      name,
      code: code.toUpperCase(),
      address,
      phone,
      isPrimary,
    });

    setShowModal(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    sqliteDB.deleteBranch(id);
    refresh();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Multi-Branch Locations Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure store branches, branch codes, address registers, and primary hub selection.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(b => (
          <div 
            key={b.id} 
            className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 space-y-4 shadow-xs relative transition ${
              b.isPrimary 
                ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20' 
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {b.isPrimary && (
              <span className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Primary Hub
              </span>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{b.name}</h3>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
                  CODE: {b.code}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{b.address || 'Address not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{b.phone || 'Phone not specified'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <button
                onClick={() => openEditModal(b)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Details
              </button>

              {!b.isPrimary && branches.length > 1 && (
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              {editingBranch ? 'Edit Shop Branch' : 'Add New Shop Branch'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Branch Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Indiranagar Express Store"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Branch Code (Short)</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. IND"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Branch physical address..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={e => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded-md text-emerald-600 accent-emerald-600"
              />
              <label htmlFor="isPrimary" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Set as Primary Hub / Main Branch
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Save Branch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
