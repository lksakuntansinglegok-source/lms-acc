import React from 'react';
import {
  GraduationCap,
  RefreshCw,
  Sparkles,
  Database,
  UserCheck,
  Shield,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { User, Role, Student, AppNotification } from '../types';
import { NotificationPopover } from './NotificationPopover';

export interface HeaderProps {
  currentUser?: User;
  onSwitchUser?: (user: User) => void;
  users?: User[];
  onSyncSheets?: () => void;
  isSyncing?: boolean;
  activeRole?: Role;

  // Props passed from App.tsx
  students?: Student[];
  currentRole?: 'student' | 'teacher';
  authenticatedRole?: 'student' | 'teacher';
  selectedStudentId?: string;
  loggedInEmail?: string;
  onRoleChange?: (role: 'student' | 'teacher') => void;
  onStudentChange?: (studentId: string) => void;
  onLogout?: () => void;

  // In-App Notifications
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onNotificationClick?: (notif: AppNotification) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  users = [],
  onSyncSheets,
  isSyncing = false,
  activeRole,
  students = [],
  currentRole,
  authenticatedRole,
  selectedStudentId,
  loggedInEmail,
  onRoleChange,
  onStudentChange,
  onLogout,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onNotificationClick
}) => {
  const effectiveAuthRole = authenticatedRole || currentRole || activeRole || currentUser?.role || 'student';
  const effectiveRole = currentRole || effectiveAuthRole;
  const selectedStudent = students.find(s => s.student_id === selectedStudentId) || students[0];

  let displayName = 'Pengguna LMS';
  let displaySubtitle = '';
  let avatarUrl: string | undefined = undefined;

  if (effectiveRole === 'teacher') {
    displayName = loggedInEmail === 'lksakuntansinglegok@gmail.com' ? 'Guru / Pelatih LKS' : 'Dra. Endang Rahayu, M.Pd.';
    displaySubtitle = loggedInEmail || 'lksakuntansinglegok@gmail.com';
  } else if (selectedStudent) {
    displayName = selectedStudent.nama;
    displaySubtitle = `${selectedStudent.kelas || 'SMK AKL'} • ${loggedInEmail || selectedStudent.email || 'Siswa'}`;
    avatarUrl = selectedStudent.avatar;
  } else if (currentUser) {
    displayName = currentUser.nama || 'Pengguna';
    displaySubtitle = currentUser.role === 'teacher' ? 'Admin / Guru' : currentUser.kelas || 'Siswa SMK';
    avatarUrl = currentUser.avatar;
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm shrink-0">
      <div className="w-full px-3 sm:px-5 h-12 flex items-center justify-between gap-2">
        {/* Brand / Context Title */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm shadow-emerald-900/40 shrink-0">
            <GraduationCap className="w-4 h-4 text-slate-950" />
          </div>
          <div className="flex items-center space-x-2 truncate">
            <h1 className="font-extrabold text-sm tracking-tight text-white truncate">LMS Akuntansi SMK</h1>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              PJDM • AOL
            </span>
          </div>
        </div>

        {/* Controls & Quick Switchers */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Google Sheets Sync Quick Button */}
          {onSyncSheets && effectiveRole === 'teacher' && (
            <button
              onClick={onSyncSheets}
              disabled={isSyncing}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Sinkronkan data dengan Google Spreadsheet"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden lg:inline">Sheets Sync</span>
              <RefreshCw className={`w-2.5 h-2.5 text-slate-400 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          {/* Role Switcher & Access Badges */}
          {effectiveAuthRole === 'teacher' ? (
            <div className="flex items-center space-x-1.5">
              {/* Teacher can toggle to preview Student View */}
              {onRoleChange && (
                <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => onRoleChange('teacher')}
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded transition cursor-pointer flex items-center gap-1 ${
                      effectiveRole === 'teacher'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tampilan Guru / Admin"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Guru</span>
                  </button>

                  <button
                    onClick={() => onRoleChange('student')}
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded transition cursor-pointer flex items-center gap-1 ${
                      effectiveRole === 'student'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Pratinjau Tampilan Siswa"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Siswa</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-[11px] font-bold text-emerald-400">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Siswa SMK</span>
            </div>
          )}

          {/* Student Dropdown Selector (Teacher in preview mode) */}
          {effectiveAuthRole === 'teacher' && effectiveRole === 'student' && students.length > 0 && onStudentChange && (
            <select
              value={selectedStudentId || selectedStudent?.student_id || ''}
              onChange={e => onStudentChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-[11px] font-bold text-emerald-300 rounded-lg px-2 py-1 outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
            >
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.nama} ({s.kelas || 'AKL'})
                </option>
              ))}
            </select>
          )}

          {/* In-App Notifications Bell */}
          <NotificationPopover
            notifications={notifications}
            onMarkAsRead={onMarkNotificationAsRead || (() => {})}
            onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
            onDeleteNotification={onDeleteNotification || (() => {})}
            onNotificationClick={onNotificationClick}
            currentRole={effectiveRole as 'student' | 'teacher'}
          />

          {/* Active Profile Pill */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 pl-1.5 pr-2.5 py-0.5 rounded-lg border border-slate-700 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-5 h-5 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-extrabold text-white">
                {displayName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden md:block max-w-[120px] truncate">
              <div className="text-[11px] font-bold text-slate-200 truncate">{displayName}</div>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/15 border border-slate-700 hover:border-rose-500/30 rounded-lg transition cursor-pointer"
              title="Keluar ke Halaman Awal"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

