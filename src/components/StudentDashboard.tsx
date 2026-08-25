import React, { useState } from 'react';
import {
  Student,
  StudentProgress,
  Task,
  Submission,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  Topic,
  AppNotification,
  CurriculumMeeting
} from '../types';
import { INITIAL_CURRICULUM_MEETINGS } from '../data/initialCurriculum';
import { StudentNotificationBanner } from './StudentNotificationBanner';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Trophy,
  Flame,
  BookOpen,
  Mic,
  Video,
  FileSpreadsheet,
  FileCode2,
  Brain,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  PlayCircle,
  LayoutGrid,
  List,
  Search,
  Layers,
  Tag,
  Info
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  progress: StudentProgress;
  tasks: Task[];
  submissions: Submission[];
  quizResults: QuizResult[];
  oralSubmissions: OralSubmission[];
  presentationSubmissions: PresentationSubmission[];
  topics?: Topic[];
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onNotificationClick?: (notif: AppNotification) => void;
  onStartTask: (task: Task) => void;
  onOpenSocraticTutor: () => void;
  onOpenReflectionJournal: () => void;
  onNavigateView?: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  progress,
  tasks,
  submissions,
  quizResults,
  oralSubmissions,
  presentationSubmissions,
  topics = [],
  notifications = [],
  onMarkNotificationAsRead,
  onNotificationClick,
  onStartTask,
  onOpenSocraticTutor,
  onOpenReflectionJournal,
  onNavigateView
}) => {
  const [taskFilter, setTaskFilter] = useState<'today_pending' | 'all' | 'completed'>('today_pending');

  // Status helper for a given task with detailed reason
  const getTaskStatusInfo = (task: Task) => {
    // 1. Check if already completed
    if (task.task_type === 'PJDM' || task.task_type === 'AOL') {
      const sub = submissions.find(s => s.task_id === task.task_id);
      if (sub?.status === 'sudah_dinilai' || sub?.status === 'sudah_dikumpulkan') {
        return { status: 'SELESAI', reason: 'Tugas telah dikumpulkan dan selesai' };
      }
    } else if (task.task_type === 'Teori') {
      const q = quizResults.find(r => r.topic_id === task.topic_id);
      if (q && !q.remedial_required) {
        return { status: 'SELESAI', reason: `Lulus kuis teori dengan skor ${q.score}` };
      }
      if (q && q.remedial_required) {
        return { status: 'REMEDIAL', reason: `Skor ${q.score} belum mencapai KKM (75). Wajib remedial.` };
      }
    } else if (task.task_type === 'Presentasi') {
      const p = presentationSubmissions.find(ps => ps.topic_id === task.topic_id);
      if (p) return { status: 'SELESAI', reason: 'Video presentasi telah dikumpulkan' };
    } else if (task.task_type === 'Oral') {
      const o = oralSubmissions.find(os => os.topic_id === task.topic_id);
      if (o) return { status: 'SELESAI', reason: 'Wawancara oral telah dikumpulkan' };
    }

    // 2. Check 5 Core Theory Completion for PJDM & AOL
    const theoryTasks = tasks.filter(t => t.task_type === 'Teori');
    const completedTheoryCount = theoryTasks.filter(t => {
      const q = quizResults.find(r => r.topic_id === t.topic_id);
      return q && !q.remedial_required;
    }).length;

    const allTheoriesDone = theoryTasks.length > 0 && completedTheoryCount === theoryTasks.length;

    // Check PJDM prerequisite
    if (task.task_type === 'PJDM') {
      if (!allTheoriesDone) {
        return {
          status: 'LOCKED',
          reason: `Wajib menyelesaikan 5 Teori Utama (1. Persediaan, 2. Piutang Usaha, 3. Kas Kecil, 4. Kas Bank, 5. Aset Tetap) terlebih dahulu (${completedTheoryCount}/${theoryTasks.length} selesai).`
        };
      }
    }

    // Check AOL prerequisite (Requires all Theories + PJDM)
    if (task.task_type === 'AOL') {
      if (!allTheoriesDone) {
        return {
          status: 'LOCKED',
          reason: 'Wajib menyelesaikan 5 Teori Utama terlebih dahulu sebelum mengerjakan AOL.'
        };
      }
      const pjdmTasks = tasks.filter(t => t.task_type === 'PJDM');
      const isPjdmDone = pjdmTasks.every(pt =>
        submissions.some(s => s.task_id === pt.task_id && (s.status === 'sudah_dinilai' || s.status === 'sudah_dikumpulkan'))
      );
      if (!isPjdmDone) {
        return {
          status: 'LOCKED',
          reason: 'Wajib menyelesaikan Praktik PJDM terlebih dahulu sebelum membuka Praktik AOL.'
        };
      }
    }

    // Check generic prerequisite_task_id
    if (task.prerequisite_task_id) {
      const prereqTask = tasks.find(t => t.task_id === task.prerequisite_task_id);
      if (prereqTask) {
        const isPrereqDone =
          submissions.some(s => s.task_id === prereqTask.task_id && s.status !== 'belum_dikumpulkan') ||
          quizResults.some(q => q.topic_id === prereqTask.topic_id && !q.remedial_required) ||
          oralSubmissions.some(o => o.topic_id === prereqTask.topic_id) ||
          presentationSubmissions.some(p => p.topic_id === prereqTask.topic_id);

        if (!isPrereqDone) {
          return {
            status: 'LOCKED',
            reason: `Terkunci: Wajib menyelesaikan "${prereqTask.judul}" terlebih dahulu.`
          };
        }
      }
    }

    // 3. Check deadline
    if (new Date(task.deadline) < new Date()) {
      return { status: 'TERLAMBAT', reason: 'Melewati batas waktu deadline' };
    }

    return { status: 'SEDANG_DIKERJAKAN', reason: 'Tugas siap dikerjakan' };
  };

  const getTaskStatus = (task: Task) => getTaskStatusInfo(task).status;

  // Sort tasks sequentially by Pertemuan (Meeting) 1 to N, then by urutan
  const sortedTasks = [...tasks].sort((a, b) => {
    const pertA = a.pertemuan || 1;
    const pertB = b.pertemuan || 1;
    if (pertA !== pertB) return pertA - pertB;
    return (a.urutan || 0) - (b.urutan || 0);
  });

  // Calculate exact task completion statistics for overall summary
  const totalTasksCount = tasks.length || 1;
  const completedTasksList = sortedTasks.filter(t => getTaskStatus(t) === 'SELESAI');
  const completedTasksCount = completedTasksList.length;
  const overallCompletedPct = Math.round((completedTasksCount / totalTasksCount) * 100);

  // Category specific calculations strictly ordered
  const teoriTasks = tasks.filter(t => t.task_type === 'Teori');
  const completedTeori = teoriTasks.filter(t => getTaskStatus(t) === 'SELESAI').length;
  const teoriPct = teoriTasks.length > 0 ? Math.round((completedTeori / teoriTasks.length) * 100) : 0;

  const pjdmTasks = tasks.filter(t => t.task_type === 'PJDM');
  const completedPjdm = pjdmTasks.filter(t => getTaskStatus(t) === 'SELESAI').length;
  const pjdmPct = pjdmTasks.length > 0 ? Math.round((completedPjdm / pjdmTasks.length) * 100) : 0;

  const aolTasks = tasks.filter(t => t.task_type === 'AOL');
  const completedAol = aolTasks.filter(t => getTaskStatus(t) === 'SELESAI').length;
  const aolPct = aolTasks.length > 0 ? Math.round((completedAol / aolTasks.length) * 100) : 0;

  const presOralTasks = tasks.filter(t => t.task_type === 'Presentasi' || t.task_type === 'Oral');
  const completedPresOral = presOralTasks.filter(t => getTaskStatus(t) === 'SELESAI').length;
  const presOralPct = presOralTasks.length > 0 ? Math.round((completedPresOral / presOralTasks.length) * 100) : 0;

  // Loaded Curriculum Meetings from teacher's configuration
  const [curriculumMeetings] = useState<CurriculumMeeting[]>(() => {
    try {
      const saved = localStorage.getItem('lms_curriculum_meetings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CURRICULUM_MEETINGS;
  });

  // View layout mode: 'cards' or 'list'
  const [viewLayoutMode, setViewLayoutMode] = useState<'cards' | 'list'>('cards');
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');
  const [collapsedMeetingIds, setCollapsedMeetingIds] = useState<Record<string, boolean>>({});

  const toggleMeetingCollapse = (id: string) => {
    setCollapsedMeetingIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Distinct list of meetings (Pertemuan) configured by teachers
  const meetingNumbersFromCurriculum = curriculumMeetings.map(m => m.pertemuan_ke);
  const meetingNumbersFromTasks = tasks.map(t => Number(t.pertemuan || 1));
  const distinctPertemuan: number[] = Array.from(
    new Set<number>([...meetingNumbersFromCurriculum, ...meetingNumbersFromTasks])
  ).sort((a: number, b: number) => a - b);
  const [selectedPertemuanFilter, setSelectedPertemuanFilter] = useState<number | 'all'>('all');

  // Filter pending / urgent tasks
  const urgentTasks = sortedTasks.filter(t => {
    const status = getTaskStatus(t);
    return status === 'SEDANG_DIKERJAKAN' || status === 'TERLAMBAT' || status === 'REMEDIAL';
  });

  let displayedTasks = sortedTasks;
  if (taskFilter === 'today_pending') {
    displayedTasks = urgentTasks;
  } else if (taskFilter === 'completed') {
    displayedTasks = completedTasksList;
  }

  // Secondary filter by selected Pertemuan if chosen
  if (selectedPertemuanFilter !== 'all') {
    displayedTasks = displayedTasks.filter(t => (t.pertemuan || 1) === selectedPertemuanFilter);
  }

  // Search filter
  if (taskSearchQuery.trim()) {
    const q = taskSearchQuery.toLowerCase();
    displayedTasks = displayedTasks.filter(t =>
      t.judul.toLowerCase().includes(q) ||
      (t.deskripsi && t.deskripsi.toLowerCase().includes(q)) ||
      (t.pertemuan_judul && t.pertemuan_judul.toLowerCase().includes(q)) ||
      t.task_type.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-3">
      {/* IN-APP NOTIFICATION BANNER (If unread notifications exist) */}
      {notifications.length > 0 && (
        <StudentNotificationBanner
          notifications={notifications}
          onMarkAsRead={onMarkNotificationAsRead || (() => {})}
          onNotificationClick={onNotificationClick || (() => {})}
        />
      )}

      {/* 1. COMPACT WELCOME & ACCUMULATED PROGRESS BAR (Full-Width Top Strip) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 rounded-xl p-2.5 sm:p-3 text-white border border-emerald-500/30 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
        {/* Student Profile Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
            alt={student.nama}
            className="w-9 h-9 rounded-lg object-cover border border-emerald-400 shadow shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate">
                {student.nama}
              </h2>
              {student.status === 'remedial' ? (
                <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Remedial
                </span>
              ) : (
                <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Aktif
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-300/90 font-semibold truncate">
              Kelas: <span className="text-white font-bold">{student.kelas}</span> • Absen #{student.nomor_absen} • AKL
            </p>
          </div>
        </div>

        {/* Level XP & Global Progress in a single compact row */}
        <div className="flex items-center space-x-3 self-end md:self-auto flex-wrap gap-y-1">
          {/* Level & XP */}
          <div className="flex items-center space-x-1.5 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-black text-amber-300">Lvl {student.level}</span>
            <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full"
                style={{ width: `${Math.min(100, (student.xp % 400) / 4)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-300 font-bold">{student.xp} XP</span>
          </div>

          {/* Overall Task Progress */}
          <div className="flex items-center space-x-2 bg-slate-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-300">Kemajuan:</span>
            <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallCompletedPct}%` }}
              />
            </div>
            <span className="text-xs font-black text-emerald-400">{overallCompletedPct}%</span>
            <span className="text-[9px] text-slate-400">({completedTasksCount}/{totalTasksCount})</span>
          </div>
        </div>
      </div>

      {/* 2. 4-STEP PIPELINE CARDS (Compact Horizontal Sequence Strip) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        {/* 1. Teori Utama */}
        <div className="p-2 bg-slate-900 border border-emerald-500/30 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-emerald-400 uppercase">1. Teori (1-5)</span>
            <span className="text-[8px] text-emerald-300 font-bold">{completedTeori >= 5 ? 'Lengkap ✅' : `${5 - completedTeori} belum`}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-black text-white">
            <span>{completedTeori}/{teoriTasks.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold">{teoriPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${teoriPct}%` }} />
          </div>
        </div>

        {/* 2. PJDM */}
        <div className="p-2 bg-slate-900 border border-blue-500/30 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-blue-400 uppercase">2. Praktik PJDM</span>
            <span className="text-[8px] text-blue-300 font-bold">{completedPjdm > 0 ? 'Selesai ✅' : completedTeori >= 5 ? 'Terbuka 🔓' : 'Kunci 🔒'}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-black text-white">
            <span>{completedPjdm}/{pjdmTasks.length}</span>
            <span className="text-[10px] text-blue-400 font-bold">{pjdmPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${pjdmPct}%` }} />
          </div>
        </div>

        {/* 3. AOL */}
        <div className="p-2 bg-slate-900 border border-indigo-500/30 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-indigo-400 uppercase">3. Praktik AOL</span>
            <span className="text-[8px] text-indigo-300 font-bold">{completedAol > 0 ? 'Selesai ✅' : completedPjdm > 0 ? 'Terbuka 🔓' : 'Kunci 🔒'}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-black text-white">
            <span>{completedAol}/{aolTasks.length}</span>
            <span className="text-[10px] text-indigo-400 font-bold">{aolPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-400 h-full transition-all duration-300" style={{ width: `${aolPct}%` }} />
          </div>
        </div>

        {/* 4. Presentasi & Oral */}
        <div className="p-2 bg-slate-900 border border-purple-500/30 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-purple-400 uppercase">4. Presentasi & Oral</span>
            <span className="text-[8px] text-purple-300 font-bold">{completedPresOral > 0 ? 'Selesai ✅' : 'Tahap Akhir'}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-black text-white">
            <span>{completedPresOral}/{presOralTasks.length}</span>
            <span className="text-[10px] text-purple-400 font-bold">{presOralPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full transition-all duration-300" style={{ width: `${presOralPct}%` }} />
          </div>
        </div>
      </div>

      {/* 3. MAIN BENTO GRID (2 COLUMNS: MAXIMIZED FULL WIDTH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN (7 COLS): LEARNING PATH & TASK QUEUE */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 shadow-md space-y-2.5">
            {/* Header with Title & View Mode Toggle (Card vs List) */}
            <div className="flex flex-col gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    Alur Penugasan
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                    Penugasan Runtun Sesuai Urutan Pertemuan Guru
                  </h3>
                </div>

                {/* View Mode Toggle Switch (Card vs List) */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 gap-0.5 shrink-0 text-[10px]">
                  <button
                    onClick={() => setViewLayoutMode('cards')}
                    className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                      viewLayoutMode === 'cards'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Kartu Bento per Pertemuan"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Tampilan Kartu</span>
                  </button>

                  <button
                    onClick={() => setViewLayoutMode('list')}
                    className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                      viewLayoutMode === 'list'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Daftar Runtun (List View)"
                  >
                    <List className="w-3 h-3" />
                    <span>Tampilan List</span>
                  </button>
                </div>
              </div>

              {/* Search & Status Filters Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                {/* Search input */}
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari tugas / materi..."
                    value={taskSearchQuery}
                    onChange={e => setTaskSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-[10.5px] rounded-lg pl-7 pr-2.5 py-1 outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 gap-0.5 shrink-0 text-[10px]">
                  <button
                    onClick={() => setTaskFilter('today_pending')}
                    className={`px-2 py-0.5 font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                      taskFilter === 'today_pending'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Belum ({urgentTasks.length})</span>
                  </button>

                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2 py-0.5 font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                      taskFilter === 'all'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Semua ({sortedTasks.length})</span>
                  </button>

                  <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-2 py-0.5 font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                      taskFilter === 'completed'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Selesai ({completedTasksList.length})</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Pertemuan Selector Horizontal Scroll */}
              {distinctPertemuan.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none text-[9.5px]">
                  <span className="text-slate-400 font-semibold shrink-0">Pilih Pertemuan:</span>
                  <button
                    onClick={() => setSelectedPertemuanFilter('all')}
                    className={`px-2 py-0.5 rounded-md font-bold transition shrink-0 cursor-pointer ${
                      selectedPertemuanFilter === 'all'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua Pertemuan
                  </button>
                  {distinctPertemuan.map(pNum => (
                    <button
                      key={pNum}
                      onClick={() => setSelectedPertemuanFilter(pNum)}
                      className={`px-2 py-0.5 rounded-md font-bold transition shrink-0 cursor-pointer ${
                        selectedPertemuanFilter === pNum
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Pertemuan {pNum}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ==================================================================== */}
            {/* VIEW MODE 1: CARD VIEW (KARTU BENTO PER PERTEMUAN)                    */}
            {/* ==================================================================== */}
            {viewLayoutMode === 'cards' ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {displayedTasks.length === 0 ? (
                  <div className="p-4 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs space-y-1">
                    <p className="font-semibold text-slate-300">
                      {taskFilter === 'today_pending'
                        ? '🎉 Seluruh penugasan saat ini telah selesai dikerjakan!'
                        : 'Belum ada penugasan dalam kategori atau pencarian ini.'}
                    </p>
                    {curriculumMeetings.length === 0 && (
                      <p className="text-[10px] text-amber-400/90">
                        Guru sedang menata ulang alur kurikulum & pertemuan. Silakan tunggu jadwal diperbarui oleh guru.
                      </p>
                    )}
                  </div>
                ) : (
                  distinctPertemuan
                    .filter(pNum => selectedPertemuanFilter === 'all' || selectedPertemuanFilter === pNum)
                    .map(pNum => {
                      const meetingTasks = displayedTasks.filter(t => (t.pertemuan || 1) === pNum);
                      if (meetingTasks.length === 0) return null;

                      const curriculumMeeting = curriculumMeetings.find(m => m.pertemuan_ke === pNum);
                      const isCollapsed = !!collapsedMeetingIds[`meet_${pNum}`];
                      const completedInMeeting = meetingTasks.filter(t => getTaskStatus(t) === 'SELESAI').length;
                      const meetingPct = Math.round((completedInMeeting / meetingTasks.length) * 100);

                      return (
                        <div
                          key={`meeting_card_${pNum}`}
                          className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl overflow-hidden transition-all shadow-sm"
                        >
                          {/* Card Header per Pertemuan */}
                          <div
                            onClick={() => toggleMeetingCollapse(`meet_${pNum}`)}
                            className="p-2.5 bg-slate-900/90 hover:bg-slate-850 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-800/80 select-none transition"
                          >
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase rounded shrink-0">
                                Pertemuan {pNum}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-xs text-white truncate">
                                    {curriculumMeeting?.judul_pertemuan || `Pertemuan ${pNum}: Modul Pembinaan LKS`}
                                  </h4>
                                  {curriculumMeeting?.target_durasi_menit && (
                                    <span className="text-[9px] text-slate-400 font-medium shrink-0 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                                      {curriculumMeeting.target_durasi_menit} Menit
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Meeting Progress & Collapse Toggle */}
                            <div className="flex items-center space-x-2 shrink-0">
                              <div className="hidden sm:flex items-center space-x-1 text-[9px]">
                                <span className="font-bold text-slate-300">
                                  {completedInMeeting}/{meetingTasks.length} Selesai
                                </span>
                                <span className={`font-black ${meetingPct === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  ({meetingPct}%)
                                </span>
                              </div>

                              <button className="p-0.5 text-slate-400 hover:text-white transition">
                                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Meeting Body (Visible if not collapsed) */}
                          {!isCollapsed && (
                            <div className="p-2.5 space-y-2">
                              {/* Competencies & Teacher Guidance */}
                              {(curriculumMeeting?.target_kompetensi || curriculumMeeting?.catatan_instruktur) && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[9px] bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                                  {curriculumMeeting?.target_kompetensi && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="text-slate-400 font-bold">Target:</span>
                                      {curriculumMeeting.target_kompetensi.map((komp, kIdx) => (
                                        <span
                                          key={kIdx}
                                          className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[8.5px] font-semibold"
                                        >
                                          {komp}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {curriculumMeeting?.catatan_instruktur && (
                                    <span className="text-amber-300/90 font-medium italic truncate max-w-xs">
                                      💡 Guru: {curriculumMeeting.catatan_instruktur}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Task List Inside This Pertemuan Card */}
                              <div className="space-y-1.5">
                                {meetingTasks.map((task, idx) => {
                                  const statusInfo = getTaskStatusInfo(task);
                                  const status = statusInfo.status;
                                  const isUrgent =
                                    status === 'TERLAMBAT' || status === 'REMEDIAL' || status === 'SEDANG_DIKERJAKAN';

                                  return (
                                    <div
                                      key={task.task_id}
                                      className={`p-2 rounded-lg border transition-all duration-150 flex items-center justify-between gap-2 ${
                                        status === 'SELESAI'
                                          ? 'bg-emerald-950/20 border-emerald-800/40 opacity-85'
                                          : status === 'REMEDIAL'
                                          ? 'bg-amber-950/40 border-amber-500/60 shadow'
                                          : status === 'TERLAMBAT'
                                          ? 'bg-rose-950/40 border-rose-500/60 shadow'
                                          : status === 'LOCKED'
                                          ? 'bg-slate-900/60 border-slate-800 opacity-60'
                                          : 'bg-slate-900 border-emerald-500/40 shadow-sm hover:border-emerald-400'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        <div
                                          className={`w-5 h-5 rounded border flex items-center justify-center font-extrabold text-[9px] shrink-0 ${
                                            isUrgent
                                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                              : 'bg-slate-950 border-slate-700 text-slate-400'
                                          }`}
                                        >
                                          {idx + 1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                                            <span
                                              className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded border shrink-0 ${
                                                task.task_type === 'Teori'
                                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                                  : task.task_type === 'PJDM'
                                                  ? 'bg-blue-950 text-blue-300 border-blue-800'
                                                  : task.task_type === 'AOL'
                                                  ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                                                  : 'bg-purple-950 text-purple-300 border-purple-800'
                                              }`}
                                            >
                                              {task.task_type}
                                            </span>
                                            <h5 className="font-bold text-[11px] text-white truncate">{task.judul}</h5>
                                          </div>

                                          <div className="flex items-center space-x-2 text-[9px] text-slate-400 mt-0.5">
                                            <span className="flex items-center gap-1 font-semibold text-slate-300">
                                              <Clock className="w-2.5 h-2.5 text-amber-400" />
                                              {task.deadline}
                                            </span>
                                            {status === 'LOCKED' && (
                                              <span className="text-amber-400 font-semibold truncate max-w-[220px]">
                                                • {statusInfo.reason}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Button */}
                                      <div className="shrink-0">
                                        {status === 'SELESAI' && (
                                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            Selesai
                                          </span>
                                        )}

                                        {status === 'LOCKED' && (
                                          <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded flex items-center gap-1 cursor-not-allowed">
                                            <Lock className="w-2.5 h-2.5" />
                                            Kunci
                                          </span>
                                        )}

                                        {status !== 'LOCKED' && status !== 'SELESAI' && (
                                          <button
                                            onClick={() => onStartTask(task)}
                                            className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition flex items-center gap-1 cursor-pointer shadow ${
                                              status === 'REMEDIAL'
                                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                                            }`}
                                          >
                                            <span>{status === 'REMEDIAL' ? 'Remedial' : 'Kerjakan'}</span>
                                            <ChevronRight className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            ) : (
              /* ==================================================================== */
              /* VIEW MODE 2: LIST VIEW (DAFTAR RUNTUN TABEL/ROW)                      */
              /* ==================================================================== */
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {displayedTasks.length === 0 ? (
                  <div className="p-4 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
                    {taskFilter === 'today_pending'
                      ? '🎉 Seluruh penugasan saat ini telah selesai dikerjakan!'
                      : 'Belum ada penugasan dalam kategori ini.'}
                  </div>
                ) : (
                  displayedTasks.map((task, idx) => {
                    const statusInfo = getTaskStatusInfo(task);
                    const status = statusInfo.status;
                    const isUrgent =
                      status === 'TERLAMBAT' || status === 'REMEDIAL' || status === 'SEDANG_DIKERJAKAN';

                    return (
                      <div
                        key={task.task_id}
                        className={`p-2 rounded-lg border transition-all duration-150 flex items-center justify-between gap-2 ${
                          status === 'SELESAI'
                            ? 'bg-emerald-950/20 border-emerald-800/40 opacity-85'
                            : status === 'REMEDIAL'
                            ? 'bg-amber-950/40 border-amber-500/60 shadow'
                            : status === 'TERLAMBAT'
                            ? 'bg-rose-950/40 border-rose-500/60 shadow'
                            : status === 'LOCKED'
                            ? 'bg-slate-950/60 border-slate-800 opacity-60'
                            : 'bg-slate-950 border-emerald-500/40 shadow-sm hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center font-extrabold text-[9px] shrink-0 ${
                              isUrgent
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                              {/* Pertemuan Badge */}
                              <span className="px-1.5 py-0.2 text-[8px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                                Pertemuan {task.pertemuan || 1}
                              </span>
                              <span
                                className={`px-1 py-0.2 text-[8px] font-extrabold uppercase rounded border shrink-0 ${
                                  task.task_type === 'Teori'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : task.task_type === 'PJDM'
                                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                                    : task.task_type === 'AOL'
                                    ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                                    : 'bg-purple-950 text-purple-300 border-purple-800'
                                }`}
                              >
                                {task.task_type}
                              </span>
                              <h4 className="font-bold text-[11px] text-white truncate">{task.judul}</h4>
                            </div>

                            <div className="flex items-center space-x-2 text-[9px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1 font-semibold text-slate-300">
                                <Clock className="w-2.5 h-2.5 text-amber-400" />
                                {task.deadline}
                              </span>
                              {task.pertemuan_judul && (
                                <span className="text-emerald-400/90 font-medium truncate max-w-[180px]">
                                  • {task.pertemuan_judul}
                                </span>
                              )}
                              {status === 'LOCKED' && (
                                <span className="text-amber-400 font-semibold truncate max-w-[200px]">
                                  • {statusInfo.reason}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {status === 'SELESAI' && (
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Selesai
                            </span>
                          )}

                          {status === 'LOCKED' && (
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded flex items-center gap-1 cursor-not-allowed">
                              <Lock className="w-2.5 h-2.5" />
                              Kunci
                            </span>
                          )}

                          {status !== 'LOCKED' && status !== 'SELESAI' && (
                            <button
                              onClick={() => onStartTask(task)}
                              className={`px-2 py-0.5 text-[10px] font-extrabold rounded transition flex items-center gap-1 cursor-pointer shadow ${
                                status === 'REMEDIAL'
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              }`}
                            >
                              <span>{status === 'REMEDIAL' ? 'Remedial' : 'Kerjakan'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): UNIFIED COMPACT FAST-ACCESS & AI WIDGET */}
        <div className="lg:col-span-5 flex flex-col space-y-2">
          {/* 1. Akses 1-Klik Modul Praktik & AI */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-2.5 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="font-black text-xs text-white">Akses Cepat Modul & AI</h3>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                1-Klik Buka
              </span>
            </div>

            {/* 4 Quick Access Grid Buttons (Ultra-compact & high-density) */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* PJDM & AOL */}
              <button
                onClick={() => onNavigateView ? onNavigateView('questions') : null}
                className="p-1.5 bg-slate-950 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-400 rounded-lg text-left transition cursor-pointer flex items-center space-x-2 group"
                title="Buka Kasus Praktik Spreadsheet & Akuntansi"
              >
                <div className="w-7 h-7 rounded-md bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-white text-[10.5px] truncate">PJDM & AOL</div>
                  <div className="text-[8.5px] text-blue-300 font-semibold truncate">Praktik Komputer</div>
                </div>
              </button>

              {/* Oral Interview AI */}
              <button
                onClick={() => onNavigateView ? onNavigateView('oral_interview') : null}
                className="p-1.5 bg-slate-950 hover:bg-slate-800/90 border border-purple-500/30 hover:border-purple-400 rounded-lg text-left transition cursor-pointer flex items-center space-x-2 group"
                title="Mulai Uji Wawancara Oral AI Bilingual"
              >
                <div className="w-7 h-7 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Mic className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-white text-[10.5px] truncate">Oral AI</div>
                  <div className="text-[8.5px] text-purple-300 font-semibold truncate">Wawancara Lisan</div>
                </div>
              </button>

              {/* Presentasi Kasus */}
              <button
                onClick={() => onNavigateView ? onNavigateView('presentation_module') : null}
                className="p-1.5 bg-slate-950 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 rounded-lg text-left transition cursor-pointer flex items-center space-x-2 group"
                title="Buka Modul Presentasi & Upload Rekaman"
              >
                <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-white text-[10.5px] truncate">Presentasi</div>
                  <div className="text-[8.5px] text-amber-300 font-semibold truncate">Video & Slide</div>
                </div>
              </button>

              {/* Socratic Tutor Pak Guru AI */}
              <button
                onClick={onOpenSocraticTutor}
                className="p-1.5 bg-slate-950 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 rounded-lg text-left transition cursor-pointer flex items-center space-x-2 group"
                title="Tanya & Diskusi dengan Pak Guru AI"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-white text-[10.5px] truncate">Pak Guru AI</div>
                  <div className="text-[8.5px] text-emerald-300 font-semibold truncate">Tutor Socratic</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Rekomendasi AI & Jurnal Refleksi */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <div className="flex items-center space-x-1">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="font-bold text-[11px] text-white">Insight Belajar AI</h3>
              </div>
              <button
                onClick={onOpenReflectionJournal}
                className="px-2 py-0.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded text-[9px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                title="Tulis Jurnal Refleksi Harian"
              >
                <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />
                <span>Jurnal Refleksi</span>
              </button>
            </div>

            {/* AI Recommendation Message (Single compact block) */}
            <div className="bg-slate-950 border border-slate-800/80 p-1.5 rounded-lg flex items-start space-x-1.5 text-[9.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
              <p className="text-slate-200 leading-snug line-clamp-2">
                {progress.recommendations && progress.recommendations.length > 0
                  ? progress.recommendations[0]
                  : 'Fokus pada penyelesaian Teori 1-5 untuk membuka simulasi PJDM & AOL.'}
              </p>
            </div>

            {/* Badges / Lencana Pencapaian Bar */}
            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span className="text-[9.5px] font-extrabold text-slate-300">Lencana:</span>
              </div>
              <div className="flex items-center space-x-1">
                {(student.badges && student.badges.length > 0 ? student.badges.slice(0, 3) : ['Pemula AKL', 'Aktif Belajar']).map((badge, idx) => (
                  <span key={idx} className="px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded text-[8px] font-bold flex items-center gap-0.5">
                    <Flame className="w-2 h-2 text-amber-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
