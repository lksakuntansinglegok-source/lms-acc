import React, { useState } from 'react';
import {
  Student,
  StudentProgress,
  QuizResult,
  Task,
  Submission,
  OralSubmission,
  PresentationSubmission
} from '../types';
import { api } from '../services/api';
import {
  Users,
  AlertTriangle,
  Award,
  TrendingUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronRight,
  FileSpreadsheet,
  FileCode2,
  Mic,
  Video,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  progressList: StudentProgress[];
  quizResults: QuizResult[];
  tasks: Task[];
  submissions: Submission[];
  oralSubmissions: OralSubmission[];
  presentationSubmissions: PresentationSubmission[];
  onNavigateToStudents: () => void;
  onNavigateToReviews: () => void;
  onNavigateToAnalytics?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  progressList,
  quizResults,
  tasks,
  submissions,
  oralSubmissions,
  presentationSubmissions,
  onNavigateToStudents,
  onNavigateToReviews,
  onNavigateToAnalytics
}) => {
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'aktif').length;
  const remedialStudents = students.filter(s => s.status === 'remedial');

  const avgClassProgress = Math.round(
    progressList.reduce((acc, p) => acc + p.overall_progress, 0) / (progressList.length || 1)
  );
  const avgClassScore = Math.round(
    quizResults.reduce((acc, r) => acc + r.score, 0) / (quizResults.length || 1)
  );

  const pendingOralReviews = oralSubmissions.filter(o => o.status === 'pending').length;
  const pendingPresReviews = presentationSubmissions.filter(p => p.status === 'pending').length;
  const pendingTaskReviews = submissions.filter(s => s.status === 'sudah_dikumpulkan').length;

  const handleFetchAIAnalytics = async () => {
    setIsLoadingAI(true);
    try {
      const res = await api.getClassAIAnalytics();
      setAiAnalytics(res.analysis);
    } catch (err) {
      console.error('Failed to get class AI analytics:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{totalStudents}</span>
            <span className="text-xs text-slate-400">({activeStudents} Aktif)</span>
          </div>
        </div>

        {/* Avg Progress */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{avgClassProgress}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Competency-Based</span>
          </div>
        </div>

        {/* Avg Quiz Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Nilai Teori</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{avgClassScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Remedial Attention Needed */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perlu Atensi</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400">{remedialStudents.length}</span>
            <span className="text-xs text-amber-300">Siswa Remedial</span>
          </div>
        </div>
      </div>

      {/* 2. AI EARLY WARNING & CLASS ANALYTICS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AI Early Warning System & Analisis Kelas</h3>
              <p className="text-xs text-slate-400">Monitoring real-time kestabilan pembelajaran seluruh siswa</p>
            </div>
          </div>

          <button
            onClick={handleFetchAIAnalytics}
            disabled={isLoadingAI}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            {isLoadingAI ? 'Memproses Analisis AI...' : 'Analisis Ulang dengan AI'}
          </button>
        </div>

        {/* AI Warning Alerts */}
        <div className="space-y-2 text-xs">
          {aiAnalytics ? (
            <div className="space-y-3">
              <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <strong>Ringkasan Performa:</strong> {aiAnalytics.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Early Warning Alerts:
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiAnalytics.early_warnings?.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Rekomendasi Guru:
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiAnalytics.teacher_recommendations?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-amber-200">
                <strong>⚠️ Peringatan Awal:</strong> {remedialStudents.length} siswa terdeteksi memiliki nilai ujian di bawah passing grade (75%) dan membutuhkan intervensi remedial.
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-300">
                <strong>📋 Antrean Penilaian:</strong> Terdapat {pendingOralReviews} rekaman oral dan {pendingPresReviews} video presentasi yang menunggu review guru.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PENDING REVIEWS ACTION & REMEDIAL STUDENTS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Submissions Alert Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Antrean Penilaian Guru
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="flex items-center gap-2 text-slate-300">
                  <Mic className="w-4 h-4 text-emerald-400" /> Wawancara Oral AI
                </span>
                <span className="font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                  {pendingOralReviews} Belum Dinilai
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="flex items-center gap-2 text-slate-300">
                  <Video className="w-4 h-4 text-purple-400" /> Video Presentasi
                </span>
                <span className="font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                  {pendingPresReviews} Belum Dinilai
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="flex items-center gap-2 text-slate-300">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" /> PJDM & AOL Tasks
                </span>
                <span className="font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                  {pendingTaskReviews} Belum Dinilai
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToReviews}
            className="w-full mt-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <span>Buka Modul Penilaian Guru</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Remedial / Needing Attention Students */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Siswa Membutuhkan Perhatian Khusus
            </h3>
            <button
              onClick={onNavigateToStudents}
              className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua Siswa ({students.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {remedialStudents.map(student => {
              const prog = progressList.find(p => p.student_id === student.student_id);
              return (
                <div
                  key={student.student_id}
                  className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={student.nama}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{student.nama}</div>
                      <div className="text-[11px] text-slate-400">Kelas: {student.kelas} • Absen #{student.nomor_absen}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">
                        {prog?.overall_progress || 0}% Overall
                      </div>
                      <span className="text-[10px] text-rose-400 font-semibold">Remedial Wajib</span>
                    </div>

                    <button
                      onClick={onNavigateToStudents}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
                    >
                      Buka Profil
                    </button>
                  </div>
                </div>
              );
            })}

            {remedialStudents.length === 0 && (
              <div className="p-4 bg-slate-800/40 rounded-xl text-xs text-emerald-400 text-center font-semibold">
                🎉 Luar biasa! Seluruh siswa saat ini memenuhi standar passing grade tanpa status remedial.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. RECENT STUDENT ORAL INTERVIEW AUDIO RECORDINGS FOR TEACHER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" />
              Rekaman Wawancara Oral Lisan Siswa Terkini (Dengarkan & Koreksi)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dengarkan rekaman jawaban audio lisan siswa secara langsung dan berikan penilaian/koreksi.
            </p>
          </div>

          <button
            onClick={onNavigateToReviews}
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            Lihat Semua ({oralSubmissions.length})
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {oralSubmissions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
            Belum ada rekaman lisan yang masuk dari siswa.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oralSubmissions.slice(0, 4).map(sub => {
              const st = students.find(s => s.student_id === sub.student_id);
              return (
                <div key={sub.oral_submission_id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={st?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                        alt={st?.nama || 'Siswa'}
                        className="w-8 h-8 rounded-lg object-cover border border-emerald-400"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{st?.nama || 'Siswa SMK'}</h4>
                        <span className="text-[10px] text-slate-400">Kelas: {st?.kelas || 'XI AKL'} • Waktu: {sub.submitted_at || 'Baru Saja'}</span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                      Nilai: {sub.teacher_score ?? 'Belum'}
                    </span>
                  </div>

                  {/* Audio Controls */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Audio Rekaman Suara Siswa:
                    </div>
                    <audio src={sub.audio_url} controls className="w-full h-8 rounded-lg border border-slate-800 bg-slate-900" />
                  </div>

                  <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    "{sub.transcript || 'Siswa merekam jawaban audio lisan.'}"
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={onNavigateToReviews}
                      className="px-3 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      Koreksi & Beri Nilai Guru
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
