import React, { useState } from 'react';
import { AuditLog, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  User, 
  FileSpreadsheet 
} from 'lucide-react';

interface AuditLogsViewProps {
  settings: ShopSettings;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ settings }) => {
  const [logs, setLogs] = useState<AuditLog[]>(() => sqliteDB.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => 
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Security Audit Trail & Activity Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable local security audit log recording cash register transactions, stock adjustments, logins, and system changes.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs by user or action..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No security audit records logged yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition font-mono text-[11px]">
                    <td className="py-3 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{log.user}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.details}</td>
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
