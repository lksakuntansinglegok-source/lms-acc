import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  Mic,
  Video,
  TrendingUp,
  Users,
  BarChart2,
  BookOpen,
  Award,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  Shield,
  UserCheck,
  LogOut,
  X,
  Database,
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';
import { User, Student, Role } from '../types';

export interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
  currentUserRole: 'student' | 'teacher';
  authenticatedRole: 'student' | 'teacher';
  students?: Student[];
  selectedStudentId?: string;
  loggedInEmail?: string;
  onRoleChange?: (role: 'student' | 'teacher') => void;
  onStudentChange?: (studentId: string) => void;
  onSyncSheets?: () => void;
  isSyncing?: boolean;
  onLogout?: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingTasksCount?: number;
  todayOralCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  currentUserRole,
  authenticatedRole,
  students = [],
  selectedStudentId,
  loggedInEmail,
  onRoleChange,
  onStudentChange,
  onSyncSheets,
  isSyncing = false,
  onLogout,
  isOpenMobile,
  setIsOpenMobile,
  pendingTasksCount = 0,
  todayOralCount = 0
}) => {
  const selectedStudent = students.find(s => s.student_id === selectedStudentId) || students[0];

  let displayName = 'Pengguna LMS';
  let displaySubtitle = '';
  let avatarUrl: string | undefined = undefined;

  if (currentUserRole === 'teacher') {
    displayName = loggedInEmail === 'lksakuntansinglegok@gmail.com' ? 'Guru / Pelatih LKS' : 'Dra. Endang Rahayu, M.Pd.';
    displaySubtitle = loggedInEmail || 'lksakuntansinglegok@gmail.com';
  } else if (selectedStudent) {
    displayName = selectedStudent.nama;
    displaySubtitle = `${selectedStudent.kelas || 'SMK AKL'} • ${loggedInEmail || selectedStudent.email || 'Siswa'}`;
    avatarUrl = selectedStudent.avatar;
  }

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setIsOpenMobile(false);
  };

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }

  const studentNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Siswa',
      icon: LayoutDashboard,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount} Tugas` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    },
    {
      id: 'questions',
      label: 'Bank Soal & Praktik',
      icon: HelpCircle
    },
    {
      id: 'presentation_module',
      label: 'Presentasi & Materi',
      icon: Video
    },
    {
      id: 'student_progress',
      label: 'Detail Progress & Refleksi',
      icon: TrendingUp
    }
  ];

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard Guru', icon: LayoutDashboard },
    { id: 'students', label: 'Manajemen Siswa', icon: Users },
    { id: 'comparison', label: 'Perbandingan Siswa', icon: BarChart2 },
    { id: 'questions', label: 'Bank Soal Bilingual', icon: HelpCircle },
    { id: 'reviews', label: 'Penilaian Guru', icon: Award },
    { id: 'sheets_settings', label: 'Google Sheets & Audit', icon: FileSpreadsheet }
  ];

  const navItems = currentUserRole === 'student' ? studentNavItems : teacherNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* TOP BRAND HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/40 shrink-0">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white">LMS Akuntansi</h1>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">SMK AKL • PJDM, AOL & Oral</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE BADGE & SWITCHERS */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-950/40">
          <div className="flex items-center justify-between">
            {authenticatedRole === 'teacher' ? (
              <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Akses: Guru / Admin
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Akses: Siswa SMK
              </span>
            )}

            {/* Sync Sheets Quick Icon */}
            {onSyncSheets && authenticatedRole === 'teacher' && (
              <button
                onClick={onSyncSheets}
                disabled={isSyncing}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg transition cursor-pointer"
                title="Sinkronkan Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Teacher Mode Toggle (Preview Student Mode) */}
          {authenticatedRole === 'teacher' && onRoleChange && (
            <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                onClick={() => onRoleChange('teacher')}
                className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  currentUserRole === 'teacher' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3 h-3" />
                Guru
              </button>
              <button
                onClick={() => onRoleChange('student')}
                className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  currentUserRole === 'student' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                Siswa
              </button>
            </div>
          )}

          {/* Student Selector if Teacher is previewing student mode */}
          {authenticatedRole === 'teacher' && currentUserRole === 'student' && students.length > 0 && onStudentChange && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Siswa Pratinjau:
              </label>
              <select
                value={selectedStudentId || selectedStudent?.student_id || ''}
                onChange={e => onStudentChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer truncate"
              >
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.nama} ({s.kelas || 'AKL'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Utama Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40 font-extrabold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-400 group-hover:scale-110 transition'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                      isActive ? 'bg-slate-900 text-emerald-300 border-emerald-400' : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM USER PROFILE & LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-400 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-white truncate">{displayName}</div>
                <div className="text-[10px] text-emerald-400 truncate">{displaySubtitle}</div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 rounded-xl transition cursor-pointer shrink-0 ml-1"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
