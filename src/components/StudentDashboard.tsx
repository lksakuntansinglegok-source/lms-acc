import React, { useState } from 'react';
import {
  Student,
  StudentProgress,
  Task,
  Submission,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  Topic
} from '../types';
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
  Calendar,
  AlertCircle,
  PlayCircle
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

  // Sort tasks by strict sequence: 1. Teori, 2. PJDM, 3. AOL, 4. Presentasi (& Oral)
  const TYPE_ORDER: Record<string, number> = {
    'Teori': 1,
    'PJDM': 2,
    'AOL': 3,
    'Presentasi': 4,
    'Oral': 5
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const orderA = TYPE_ORDER[a.task_type] || 99;
    const orderB = TYPE_ORDER[b.task_type] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.urutan - b.urutan;
  });

  // Calculate exact task completion statistics for overall summary
  const totalTasksCount = tasks.length || 1;
  const completedTasksList = sortedTasks.filter(t => getTaskStatus(t) === 'SELESAI');
  const completedTasksCount = completedTasksList.length;
  const overallCompletedPct = Math.round((completedTasksCount / totalTasksCount) * 100);

  // Category specific calculations strictly ordered: 1. Teori, 2. PJDM, 3. AOL, 4. Presentasi/Oral
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

  // Oral assessment daily status calculation (2 per day)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOralCount = oralSubmissions.filter(s => s.submitted_at && s.submitted_at.startsWith(todayStr)).length;
  const DAILY_ORAL_TARGET = 2;

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

  return (
    <div className="space-y-6">
      {/* 1. WELCOME HERO BANNER (Ringkas & pas tanpa harus scroll berlebihan) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-xl p-3 sm:p-4 text-white border border-emerald-500/20 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <img
              src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
              alt={student.nama}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-emerald-400 shadow shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  Selamat Datang, {student.nama} 👋
                </h2>
                {student.status === 'remedial' && (
                  <span className="px-2 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Remedial
                  </span>
                )}
              </div>
              <p className="text-emerald-300/90 text-[11px] font-medium mt-0.5">
                Kelas: <span className="font-bold text-white">{student.kelas}</span> • Absen #{student.nomor_absen} • AKL
              </p>
            </div>
          </div>

          {/* Level & XP compact pill */}
          <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-300">Level {student.level}</span>
            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full"
                style={{ width: `${Math.min(100, (student.xp % 400) / 4)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-300 font-semibold">{student.xp} XP</span>
          </div>
        </div>
      </div>

      {/* 2. RINGKASAN PERSENTASE AKUMULASI PEKERJAAN SISWA (Tepat berada di bawah gambar/banner selamat datang) */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 shadow-md space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Ringkasan Persentase Akumulasi Pekerjaan Siswa
              </h3>
              <p className="text-[10px] text-slate-400">
                Menghitung akumulasi {completedTasksCount} dari total {totalTasksCount} penugasan yang telah disediakan guru
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{overallCompletedPct}%</span>
            <span className="text-[10px] text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md font-semibold">
              {completedTasksCount} / {totalTasksCount} Selesai
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2 p-0.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallCompletedPct}%` }}
          />
        </div>

        {/* 4 CATEGORY BREAKDOWN CARDS IN STRICT SEQUENTIAL ORDER: 1. Teori Utama, 2. PJDM, 3. AOL, 4. Presentasi & Materi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-0.5">
          {/* 1. Teori Utama */}
          <div className="p-2 bg-slate-950 border border-emerald-500/30 rounded-lg space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-emerald-400 uppercase">1. Teori Utama</span>
              <span className="text-[8px] text-emerald-300 font-semibold">{completedTeori >= 5 ? 'Lengkap' : `${5 - completedTeori} lagi`}</span>
            </div>
            <div className="text-xs font-black text-white">{completedTeori}/{teoriTasks.length} ({teoriPct}%)</div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${teoriPct}%` }} />
            </div>
          </div>

          {/* 2. PJDM */}
          <div className="p-2 bg-slate-950 border border-blue-500/30 rounded-lg space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-blue-400 uppercase">2. Praktik PJDM</span>
              <span className="text-[8px] text-blue-300 font-semibold">{completedPjdm > 0 ? 'Selesai' : completedTeori >= 5 ? 'Terbuka' : 'Kunci: 5 Teori'}</span>
            </div>
            <div className="text-xs font-black text-white">{completedPjdm}/{pjdmTasks.length} ({pjdmPct}%)</div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${pjdmPct}%` }} />
            </div>
          </div>

          {/* 3. AOL */}
          <div className="p-2 bg-slate-950 border border-indigo-500/30 rounded-lg space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-indigo-400 uppercase">3. Praktik AOL</span>
              <span className="text-[8px] text-indigo-300 font-semibold">{completedAol > 0 ? 'Selesai' : completedPjdm > 0 ? 'Terbuka' : 'Kunci: PJDM'}</span>
            </div>
            <div className="text-xs font-black text-white">{completedAol}/{aolTasks.length} ({aolPct}%)</div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-indigo-400 h-full transition-all duration-300" style={{ width: `${aolPct}%` }} />
            </div>
          </div>

          {/* 4. Presentasi & Materi */}
          <div className="p-2 bg-slate-950 border border-purple-500/30 rounded-lg space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-purple-400 uppercase">4. Presentasi & Materi</span>
              <span className="text-[8px] text-purple-300 font-semibold">{completedPresOral > 0 ? 'Selesai' : 'Tahap Akhir'}</span>
            </div>
            <div className="text-xs font-black text-white">{completedPresOral}/{presOralTasks.length} ({presOralPct}%)</div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-purple-400 h-full transition-all duration-300" style={{ width: `${presOralPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAFTAR PENUGASAN DENGAN URUTAN PRIORITAS: TEORI UTAMA (1-5) -> PRAKTIK PJDM -> PRAKTIK AOL -> PRESENTASI */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Prioritas Utama Siswa
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                🔥 Jalur Pembelajaran & Daftar Penugasan Wajib
              </h3>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Selesaikan <strong>5 Teori Utama</strong> secara berurutan terlebih dahulu untuk membuka akses ke <strong>Praktik PJDM</strong> dan <strong>AOL</strong>.
            </p>
          </div>

          {/* TASK FILTER TABS */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 shrink-0">
            <button
              onClick={() => setTaskFilter('today_pending')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                taskFilter === 'today_pending'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Belum Selesai ({urgentTasks.length})</span>
            </button>

            <button
              onClick={() => setTaskFilter('all')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                taskFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Semua ({sortedTasks.length})</span>
            </button>

            <button
              onClick={() => setTaskFilter('completed')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer flex items-center gap-1 ${
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

        {/* STEP-BY-STEP SEQUENTIAL PRIORITY TRACKER BAR */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Urutan Prioritas Wajib Belajar:
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              {completedTeori}/5 Teori Selesai • PJDM: {completedPjdm > 0 ? '✅' : (completedTeori === 5 ? '🔓 Siap' : '🔒 Terkunci')} • AOL: {completedAol > 0 ? '✅' : (completedPjdm > 0 ? '🔓 Siap' : '🔒 Terkunci')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-[9px]">
            {/* Step 1: Persediaan */}
            {(() => {
              const q1 = quizResults.find(r => r.topic_id === 'top_01');
              const isDone = q1 && !q1.remedial_required;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : '1.'}
                    <span className="truncate">Persediaan</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : 'Teori 1'}</span>
                </div>
              );
            })()}

            {/* Step 2: Piutang Usaha */}
            {(() => {
              const q1 = quizResults.find(r => r.topic_id === 'top_01');
              const q2 = quizResults.find(r => r.topic_id === 'top_02');
              const isDone = q2 && !q2.remedial_required;
              const isLocked = !q1 || q1.remedial_required;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : isLocked ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : isLocked ? <Lock className="w-3 h-3 shrink-0" /> : '2.'}
                    <span className="truncate">Piutang</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : isLocked ? 'Terkunci' : 'Teori 2'}</span>
                </div>
              );
            })()}

            {/* Step 3: Kas Kecil */}
            {(() => {
              const q2 = quizResults.find(r => r.topic_id === 'top_02');
              const q3 = quizResults.find(r => r.topic_id === 'top_03');
              const isDone = q3 && !q3.remedial_required;
              const isLocked = !q2 || q2.remedial_required;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : isLocked ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : isLocked ? <Lock className="w-3 h-3 shrink-0" /> : '3.'}
                    <span className="truncate">Kas Kecil</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : isLocked ? 'Terkunci' : 'Teori 3'}</span>
                </div>
              );
            })()}

            {/* Step 4: Kas Bank */}
            {(() => {
              const q3 = quizResults.find(r => r.topic_id === 'top_03');
              const q4 = quizResults.find(r => r.topic_id === 'top_04');
              const isDone = q4 && !q4.remedial_required;
              const isLocked = !q3 || q3.remedial_required;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : isLocked ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : isLocked ? <Lock className="w-3 h-3 shrink-0" /> : '4.'}
                    <span className="truncate">Kas Bank</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : isLocked ? 'Terkunci' : 'Teori 4'}</span>
                </div>
              );
            })()}

            {/* Step 5: Aset Tetap */}
            {(() => {
              const q4 = quizResults.find(r => r.topic_id === 'top_04');
              const q5 = quizResults.find(r => r.topic_id === 'top_05');
              const isDone = q5 && !q5.remedial_required;
              const isLocked = !q4 || q4.remedial_required;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : isLocked ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : isLocked ? <Lock className="w-3 h-3 shrink-0" /> : '5.'}
                    <span className="truncate">Aset Tetap</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : isLocked ? 'Terkunci' : 'Teori 5'}</span>
                </div>
              );
            })()}

            {/* Step 6: Praktik PJDM */}
            {(() => {
              const isDone = completedPjdm > 0;
              const isLocked = completedTeori < 5;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-blue-950/60 border-blue-500/60 text-blue-300' : isLocked ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'bg-blue-950/30 border-blue-500/40 text-blue-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" /> : isLocked ? <Lock className="w-3 h-3 shrink-0" /> : '6.'}
                    <span className="truncate">PJDM</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : isLocked ? 'Kunci: 5 Teori' : 'Praktik'}</span>
                </div>
              );
            })()}

            {/* Step 7: Praktik AOL */}
            {(() => {
              const isDone = completedAol > 0;
              const isLocked = completedTeori < 5 || completedPjdm === 0;
              return (
                <div className={`p-1.5 rounded border text-center transition ${isDone ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300' : isLocked ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'}`}>
                  <div className="font-extrabold flex items-center justify-center gap-1">
                    {isDone ? <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" /> : isLocked ? <Lock className="w-3 h-3 shrink-0" /> : '7.'}
                    <span className="truncate">AOL</span>
                  </div>
                  <span className="text-[8px] opacity-80">{isDone ? 'Selesai' : isLocked ? 'Kunci: PJDM' : 'Praktik'}</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* LIST OF TASKS IN STRICT ORDER */}
        <div className="space-y-1.5">
          {displayedTasks.length === 0 ? (
            <div className="p-3 text-center bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-[11px]">
              {taskFilter === 'today_pending'
                ? '🎉 Seluruh penugasan saat ini telah selesai dikerjakan!'
                : 'Belum ada penugasan dalam kategori ini.'}
            </div>
          ) : (
            displayedTasks.map((task, idx) => {
              const statusInfo = getTaskStatusInfo(task);
              const status = statusInfo.status;
              const isUrgent = status === 'TERLAMBAT' || status === 'REMEDIAL' || status === 'SEDANG_DIKERJAKAN';

              return (
                <div
                  key={task.task_id}
                  className={`p-2.5 rounded-lg border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
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
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded border flex items-center justify-center font-extrabold text-[10px] shrink-0 mt-0.5 ${
                        isUrgent ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                        <span className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase rounded border ${
                          task.task_type === 'Teori'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : task.task_type === 'PJDM'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : task.task_type === 'AOL'
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : 'bg-purple-950 text-purple-300 border-purple-800'
                        }`}>
                          {task.task_type}
                        </span>
                        <h4 className="font-bold text-[11px] sm:text-xs text-white truncate">{task.judul}</h4>
                      </div>

                      <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">{task.deskripsi}</p>

                      {/* Detail reason or prerequisite message */}
                      {status === 'LOCKED' && (
                        <p className="text-[9.5px] text-amber-400/90 font-medium mt-0.5 flex items-center gap-1">
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>{statusInfo.reason}</span>
                        </p>
                      )}

                      <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400 flex-wrap gap-y-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Deadline: <strong className="text-amber-300">{task.deadline}</strong>
                        </span>
                        {task.wajib && (
                          <span className="text-rose-400 font-extrabold text-[9px]">
                            • Wajib
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Action Button */}
                  <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    {status === 'SELESAI' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Selesai
                      </span>
                    )}

                    {status === 'REMEDIAL' && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Remedial
                      </span>
                    )}

                    {status === 'TERLAMBAT' && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Terlambat
                      </span>
                    )}

                    {status === 'LOCKED' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded flex items-center gap-1 cursor-not-allowed">
                        <Lock className="w-3 h-3" />
                        Terkunci
                      </span>
                    )}

                    {status !== 'LOCKED' && (
                      <button
                        onClick={() => onStartTask(task)}
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded transition flex items-center gap-1 cursor-pointer shadow ${
                          status === 'REMEDIAL'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        <span>
                          {status === 'SELESAI'
                            ? 'Lihat Hasil'
                            : status === 'REMEDIAL'
                            ? 'Kerjakan Remedial'
                            : 'Kerjakan'}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. AI PERSONAL RECOMMENDATION & REFLECTION ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl p-3 shadow-md relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Rekomendasi Belajar Personal AI</h3>
              <p className="text-[10px] text-slate-400">Analisis otomatis kekuatan dan area peningkatan Anda</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {progress.recommendations && progress.recommendations.length > 0 ? (
              progress.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-slate-800/80 border border-slate-700/80 p-2 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <p className="text-[10px] font-medium text-slate-200 leading-relaxed">{rec}</p>
                </div>
              ))
            ) : (
              <div className="p-2.5 bg-slate-800/50 rounded-lg text-[10px] text-slate-300">
                Lanjutkan pengerjaan tugas berikutnya untuk mendapatkan analisis rekomendasi AI yang presisi.
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={onOpenSocraticTutor}
              className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1 cursor-pointer shadow"
            >
              <Brain className="w-3 h-3" />
              Tanya "Pak Guru AI"
            </button>
            <button
              onClick={onOpenReflectionJournal}
              className="px-2.5 py-1 text-[10px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              Tulis Refleksi Hari Ini
            </button>
          </div>
        </div>

        {/* ACHIEVEMENTS / GAMIFICATION BADGES */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Pencapaian & Badge
              </h3>
              <span className="text-[9px] text-amber-400 font-bold bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.2 rounded">
                {student.badges?.length || 0} Terbuka
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(student.badges || []).map((badge, idx) => (
                <div key={idx} className="p-1.5 bg-slate-800/80 border border-slate-700 rounded flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Flame className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-200 line-clamp-1">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[9px] text-slate-400">
            Selesaikan soal HOTS untuk membuka Badge berikutnya!
          </div>
        </div>
      </div>
    </div>
  );
};
