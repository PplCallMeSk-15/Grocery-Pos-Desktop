import React, { useRef, useState } from 'react';
import { DatabaseBackup, Download, Upload, RotateCcw, ShieldCheck, HardDrive, CheckCircle2, AlertTriangle, Trash2, Sparkles } from 'lucide-react';

interface BackupRestoreViewProps {
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => boolean;
  onResetToSampleData: () => void;
  onClearAllData: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  onExportBackup,
  onImportBackup,
  onResetToSampleData,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<'clear' | 'sample' | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportBackup(content);
        if (success) {
          setStatusMsg({ type: 'success', text: 'Database successfully restored from backup file!' });
        } else {
          setStatusMsg({ type: 'error', text: 'Invalid database backup file format. Restore failed.' });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <DatabaseBackup className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Offline Database Backup & Restore Manager
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Because this software runs 100% locally on your computer without cloud servers, generate regular backups to protect your business data.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Export Backup Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Export Database Backup File
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Download complete local SQLite database backup (<code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">grocery_backup.db</code>) containing all product catalogs, stock logs, customer invoices, and shop settings.
            </p>
          </div>

          <button
            onClick={onExportBackup}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup File Now</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl w-fit mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Restore Database from File
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a previously saved backup file to restore complete inventory, products, sales history, and configuration onto this or another computer.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.db,.sqlite"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select & Restore Backup File</span>
          </button>
        </div>

      </div>

      {/* Fresh Start / Clean Slate Option for Real Store Owners */}
      <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Fresh Store Start (Wipe All Demo Data)
              <span className="text-[10px] uppercase bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-extrabold px-2 py-0.5 rounded-full">
                New Store Owner
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Permanently wipe all pre-populated sample products, sales history, demo customers, and expenses to start completely fresh for your real store.
            </p>
          </div>
        </div>

        <button
          onClick={() => setConfirmModal('clear')}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shrink-0 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Wipe Demo Data & Start Fresh
        </button>
      </div>

      {/* Demo Sample Data Reset Option */}
      <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Reset & Reload Sample Grocery Dataset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reload initial demo grocery inventory (Atta, Sunflower Oil, Tata Salt, Pulses, Biscuits) for testing purposes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setConfirmModal('sample')}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 transition cursor-pointer"
        >
          Load Sample Demo Data
        </button>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {confirmModal === 'clear' ? (
                <>
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  Wipe All Demo Data & Start Fresh?
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  Reload Sample Grocery Dataset?
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmModal === 'clear'
                ? 'Are you sure you want to wipe all demo sample data? All sample products, sales history, demo customers, and expenses will be cleared so you can enter your real store data from scratch.'
                : 'Are you sure you want to reload the initial sample grocery dataset (Atta, Sunflower Oil, Tata Salt, Pulses, Biscuits)?'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === 'clear') {
                    onClearAllData();
                    setStatusMsg({ type: 'success', text: 'Clean slate activated! All demo sample data wiped. You can now add your real store products!' });
                  } else {
                    onResetToSampleData();
                    setStatusMsg({ type: 'success', text: 'Database reset to sample grocery items!' });
                  }
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer ${
                  confirmModal === 'clear' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmModal === 'clear' ? 'Yes, Wipe & Start Fresh' : 'Yes, Reload Sample Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
