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
import { User, Role, Student } from '../types';

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
  onLogout
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
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/40 shrink-0">
            <GraduationCap className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">LMS Akuntansi SMK</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                AI-Powered
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Sekolah Menengah Kejuruan • PJDM, AOL, Oral Assessment & Teori
            </p>
          </div>
        </div>

        {/* Controls & Switchers */}
        <div className="flex items-center space-x-3">
          {/* Google Sheets Sync Quick Button (if provided) */}
          {onSyncSheets && (
            <button
              onClick={onSyncSheets}
              disabled={isSyncing}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Sinkronkan data dengan Google Spreadsheet"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Sheets Sync</span>
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          {/* Role Switcher & Access Badges */}
          {effectiveAuthRole === 'teacher' ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-300">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Akses: Pelatih LKS</span>
              </div>

              {/* Teacher can toggle to preview Student View */}
              {onRoleChange && (
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => onRoleChange('teacher')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      effectiveRole === 'teacher'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tampilan Guru / Admin"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mode Guru</span>
                  </button>

                  <button
                    onClick={() => onRoleChange('student')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      effectiveRole === 'student'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Pratinjau Tampilan Siswa"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pratinjau Siswa</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Student Account: Strictly display Student Access Badge only (NO Switcher) */
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Akses: Siswa SMK</span>
            </div>
          )}

          {/* Student Dropdown Selector (Only available for Teacher in student preview mode) */}
          {effectiveAuthRole === 'teacher' && effectiveRole === 'student' && students.length > 0 && onStudentChange && (
            <select
              value={selectedStudentId || selectedStudent?.student_id || ''}
              onChange={e => onStudentChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
            >
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.nama} ({s.kelas || 'AKL'})
                </option>
              ))}
            </select>
          )}

          {/* Legacy User Switcher (if users array provided) */}
          {users.length > 0 && currentUser && onSwitchUser && (
            <select
              value={currentUser.user_id || ''}
              onChange={e => {
                const found = users.find(u => u.user_id === e.target.value);
                if (found) onSwitchUser(found);
              }}
              className="bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-semibold rounded-xl px-2 py-1.5 outline-none cursor-pointer max-w-[160px] truncate"
            >
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.nama}
                </option>
              ))}
            </select>
          )}

          {/* Active Profile Badge */}
          <div className="flex items-center space-x-2 bg-slate-800/80 pl-2 pr-3 py-1 rounded-full border border-slate-700 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                {displayName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 line-clamp-1">{displayName}</div>
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                {displaySubtitle}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 rounded-full transition cursor-pointer"
              title="Keluar ke Halaman Awal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

