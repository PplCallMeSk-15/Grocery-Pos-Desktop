import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { Lock, KeyRound, ShieldAlert, X } from 'lucide-react';

interface PinLockModalProps {
  onUnlock: () => void;
  onClose?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ onUnlock, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleVerify = () => {
    if (pin.length !== 4) return;

    const employee = sqliteDB.verifyEmployeePin(pin);
    if (employee) {
      onUnlock();
    } else {
      setError('Invalid Employee Security PIN!');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Terminal Security Lock</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your 4-digit staff PIN to unlock POS</p>
        </div>

        {/* PIN Display Dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition ${
                pin.length > i
                  ? 'bg-emerald-600 border-emerald-600 scale-110'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-slate-800 dark:text-slate-100 text-base transition"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl font-bold text-slate-600 dark:text-slate-300 text-xs"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl font-bold text-slate-800 dark:text-slate-100 text-base"
          >
            0
          </button>
          <button
            onClick={handleVerify}
            className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};
