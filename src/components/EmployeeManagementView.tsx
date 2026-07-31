import React, { useState } from 'react';
import { Employee, EmployeeRole, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  UserCheck, 
  UserPlus, 
  ShieldAlert, 
  KeyRound, 
  Phone, 
  Edit, 
  X, 
  Calendar, 
  BadgeCheck,
  Lock,
  LogOut
} from 'lucide-react';

interface EmployeeManagementViewProps {
  settings: ShopSettings;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({ settings }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => sqliteDB.getEmployees());
  const currentUser = sqliteDB.getCurrentUser();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);

  const refreshEmployees = () => {
    setEmployees(sqliteDB.getEmployees());
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee?.name || !editingEmployee?.phone || !editingEmployee?.pin) return;

    sqliteDB.saveEmployee({
      ...editingEmployee,
      name: editingEmployee.name,
      phone: editingEmployee.phone,
      role: editingEmployee.role || 'Cashier',
      pin: editingEmployee.pin,
    });

    setShowAddModal(false);
    setEditingEmployee(null);
    refreshEmployees();
  };

  const handleSwitchUser = (emp: Employee) => {
    sqliteDB.setCurrentUser(emp);
    refreshEmployees();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Employee Management & Role Security
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure staff roles, 4-digit security PIN access, and switch active terminal operators.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEmployee({ role: 'Cashier', pin: '1234' });
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Active Logged-in Staff Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg">
            {currentUser?.name.charAt(0) || 'A'}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded-md">
              Current Session
            </span>
            <h3 className="text-base font-bold mt-0.5">{currentUser?.name || 'Administrator'}</h3>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              Role: {currentUser?.role || 'Owner / Manager'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-emerald-100">PIN Protection Active</p>
          <p className="text-xs font-mono font-bold bg-black/20 px-3 py-1 rounded-lg mt-1 inline-block">
            PIN: ****
          </p>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div 
            key={emp.id} 
            className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 space-y-3 shadow-xs transition relative ${
              currentUser?.id === emp.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500">{emp.id}</span>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-1">{emp.name}</h3>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                  emp.role === 'Owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                  emp.role === 'Manager' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                  emp.role === 'Cashier' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {emp.role}
                </span>
              </div>

              <button
                onClick={() => {
                  setEditingEmployee(emp);
                  setShowAddModal(true);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined: {emp.joiningDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-500">PIN: {emp.pin}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Monthly Salary: {settings.currencySymbol}{emp.salary.toLocaleString()}
              </span>

              {currentUser?.id !== emp.id && (
                <button
                  onClick={() => handleSwitchUser(emp)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-[11px] transition"
                >
                  Switch Session
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingEmployee?.id ? 'Edit Staff Profile' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingEmployee?.name || ''}
                  onChange={e => setEditingEmployee(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kavitha S"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee?.phone || ''}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Mobile number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Security PIN (4 digits) *</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={editingEmployee?.pin || ''}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Role Permission</label>
                  <select
                    value={editingEmployee?.role || 'Cashier'}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, role: e.target.value as EmployeeRole }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Owner">Owner (Full Admin Access)</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier (POS & Billing)</option>
                    <option value="Inventory Staff">Inventory Staff</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Salary ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={editingEmployee?.salary || 20000}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, salary: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
