import React, { useState } from 'react';
import { AttendanceRecord, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { 
  Clock, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AttendanceViewProps {
  settings: ShopSettings;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ settings }) => {
  const employees = sqliteDB.getEmployees();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => sqliteDB.getAttendance());

  const refreshAttendance = () => {
    setAttendance(sqliteDB.getAttendance());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCheckIn = (empId: string) => {
    sqliteDB.checkInEmployee(empId);
    refreshAttendance();
  };

  const handleCheckOut = (empId: string) => {
    sqliteDB.checkOutEmployee(empId);
    refreshAttendance();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" />
          Employee Daily Attendance & Duty Roster
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track employee check-in, check-out times, late arrivals, and working hours. Date: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{todayStr}</span>
        </p>
      </div>

      {/* Staff Action Cards for Today */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map(emp => {
          const todayRecord = attendance.find(a => a.employeeId === emp.id && a.date === todayStr);

          return (
            <div key={emp.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{emp.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
                </div>

                {todayRecord ? (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    todayRecord.status === 'Late' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {todayRecord.status}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full text-[10px] font-bold">
                    Not Checked In
                  </span>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl text-xs space-y-1 font-mono text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Check In Time:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{todayRecord?.checkInTime || '--:--'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check Out Time:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{todayRecord?.checkOutTime || '--:--'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!todayRecord ? (
                  <button
                    onClick={() => handleCheckIn(emp.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Check In Staff</span>
                  </button>
                ) : !todayRecord.checkOutTime ? (
                  <button
                    onClick={() => handleCheckOut(emp.id)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out Staff</span>
                  </button>
                ) : (
                  <div className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs font-bold text-center rounded-xl">
                    Shift Completed Today
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance History Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 text-sm">
          Recent Attendance Records
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4 text-center">Shift Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No attendance logs generated yet today.
                  </td>
                </tr>
              ) : (
                attendance.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition">
                    <td className="py-3 px-4 font-mono">{att.date}</td>
                    <td className="py-3 px-4 font-bold">{att.employeeName}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{att.checkInTime}</td>
                    <td className="py-3 px-4 font-mono text-amber-600">{att.checkOutTime || 'Active Shift'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {att.status}
                      </span>
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
