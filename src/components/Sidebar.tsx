import React from 'react';
import { TabType } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackagePlus, 
  Receipt, 
  BarChart3, 
  Barcode, 
  DatabaseBackup, 
  Settings,
  AlertTriangle,
  Users,
  Truck,
  FileCheck,
  TrendingDown,
  UserCheck,
  Clock,
  RotateCcw,
  Zap,
  ShieldCheck,
  DollarSign,
  Building2,
  Trash2,
  Activity,
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  lowStockCount,
}) => {
  const navGroups: {
    title: string;
    items: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[];
  }[] = [
    {
      title: 'Sales & POS Terminal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
        { id: 'cash_register', label: 'Cash Drawer Shifts', icon: DollarSign },
        { id: 'sales_history', label: 'Sales History', icon: Receipt },
        { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
      ]
    },
    {
      title: 'Inventory & Supply Chain',
      items: [
        { id: 'products', label: 'Products Inventory', icon: Package },
        { id: 'smart_reorder', label: 'Smart Reorder', icon: Zap },
        { id: 'stock_in', label: 'Quick Restock', icon: PackagePlus },
        { id: 'purchase_orders', label: 'Purchase Orders', icon: FileCheck },
        { id: 'inventory_intel', label: 'Smart Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'CRM & Accounting',
      items: [
        { id: 'customers', label: 'Customers & Dues', icon: Users },
        { id: 'suppliers', label: 'Suppliers Directory', icon: Truck },
        { id: 'expenses', label: 'Shop Expenses', icon: TrendingDown },
        { id: 'price_history', label: 'Price Changes Log', icon: History },
        { id: 'reports', label: 'Reports & P&L', icon: BarChart3 },
      ]
    },
    {
      title: 'Enterprise & System',
      items: [
        { id: 'branches', label: 'Branch Locations', icon: Building2 },
        { id: 'employees', label: 'Staff & Security PIN', icon: UserCheck },
        { id: 'attendance', label: 'Daily Attendance', icon: Clock },
        { id: 'barcodes', label: 'Label Designer', icon: Barcode },
        { id: 'recycle_bin', label: 'Recycle Bin', icon: Trash2 },
        { id: 'health_monitor', label: 'System Health', icon: Activity },
        { id: 'audit_logs', label: 'Security Trail', icon: ShieldCheck },
        { id: 'backup', label: 'Backup & Restore', icon: DatabaseBackup },
        { id: 'settings', label: 'Shop Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="no-print w-60 h-full bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-3 space-y-4">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.id === 'products' && lowStockCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                    }`}>
                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                      {lowStockCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 m-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Offline Desktop POS
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Local SQLite Engine Active. Enterprise Ready.
        </p>
      </div>
    </aside>
  );
};

