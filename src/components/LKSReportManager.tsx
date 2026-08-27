import React, { useState, useEffect } from 'react';
import { LKSReportSubmission, Student, Teacher } from '../types';
import { api } from '../services/api';
import { INITIAL_LKS_REPORTS } from '../data/initialData';
import {
  FileSpreadsheet,
  Clock,
  TrendingUp,
  TrendingDown,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Send,
  Timer,
  FileCode,
  DollarSign
} from 'lucide-react';

interface LKSReportManagerProps {
  currentUserRole?: 'student' | 'teacher';
  currentStudent?: Student | null;
  onRefreshData?: () => void;
}

// Rekomendasi Nama PT / Studi Kasus LKS Standar Nasional & Provinsi
const SUGGESTED_LKS_PT = [
  'PT Jaya Sentosa Abadi',
  'PT Sejahtera Logistik Mandiri',
  'PT Berkah Niaga Nusantara',
  'PT Cahaya Abadi Elektrindo',
  'PT Surya Graha Mandiri',
  'PT Gemilang Citra Perkasa',
  'PT Multi Sarana Industri',
  'PT Harapan Prima Usaha'
];

export const LKSReportManager: React.FC<LKSReportManagerProps> = ({
  currentUserRole = 'student',
  currentStudent,
  onRefreshData
}) => {
  // Reports State
  const [reports, setReports] = useState<LKSReportSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('lms_lks_reports');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LKS_REPORTS;
  });

  // Filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'PJDM' | 'AOL' | 'Kombinasi'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'needs_revision'>('all');

  // Modal State for New / Edit Report
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // Form Fields State
  const [formPtName, setFormPtName] = useState('');
  const [formTipe, setFormTipe] = useState<'Praktik Manual (PJDM)' | 'Praktik AOL (Accurate Online)' | 'Kombinasi Manual & AOL'>('Praktik Manual (PJDM)');
  const [formStatusLabaRugi, setFormStatusLabaRugi] = useState<'Laba Bersih' | 'Rugi Bersih' | 'Impas (Break Even)'>('Laba Bersih');
  const [formNominalLabaRugi, setFormNominalLabaRugi] = useState<string>('150000000');
  const [formJam, setFormJam] = useState<number>(1);
  const [formMenit, setFormMenit] = useState<number>(30);
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formPertemuan, setFormPertemuan] = useState<number | ''>(1);
  const [formFileUrl, setFormFileUrl] = useState<string>('');
  const [formCatatan, setFormCatatan] = useState<string>('');

  // Live Timer State inside modal
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Teacher Review Modal State
  const [reviewModalReport, setReviewModalReport] = useState<LKSReportSubmission | null>(null);
  const [teacherScoreInput, setTeacherScoreInput] = useState<number>(90);
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');
  const [teacherStatusInput, setTeacherStatusInput] = useState<'reviewed' | 'needs_revision'>('reviewed');

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stopwatch effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Sync with localStorage
  const saveReports = (updated: LKSReportSubmission[]) => {
    setReports(updated);
    try {
      localStorage.setItem('lms_lks_reports', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save LKS reports', e);
    }
    if (onRefreshData) onRefreshData();
  };

  // Apply timer to form
  const handleApplyTimerToForm = () => {
    const totalMinutes = Math.max(1, Math.round(timerSeconds / 60));
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    setFormJam(h);
    setFormMenit(m);
    setIsTimerRunning(false);
    showToast(`⏱️ Waktu stopwatch (${h} Jam ${m} Menit) disematkan ke formulir.`);
  };

  // Open Create Modal
  const handleOpenCreateModal = (ptPreset?: string) => {
    setEditingReportId(null);
    setFormPtName(ptPreset || '');
    setFormTipe('Praktik Manual (PJDM)');
    setFormStatusLabaRugi('Laba Bersih');
    setFormNominalLabaRugi('150000000');
    setFormJam(1);
    setFormMenit(45);
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormPertemuan(1);
    setFormFileUrl('');
    setFormCatatan('');
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rep: LKSReportSubmission) => {
    setEditingReportId(rep.id);
    setFormPtName(rep.pt_name);
    setFormTipe(rep.tipe_pengerjaan);
    setFormStatusLabaRugi(rep.status_laba_rugi);
    setFormNominalLabaRugi(String(rep.nilai_laba_rugi));
    const totalM = rep.waktu_pengerjaan_menit || 60;
    setFormJam(Math.floor(totalM / 60));
    setFormMenit(totalM % 60);
    setFormTanggal(rep.tanggal_pengerjaan);
    setFormPertemuan(rep.pertemuan_ke || '');
    setFormFileUrl(rep.file_url_or_link || '');
    setFormCatatan(rep.catatan_rekonsiliasi || '');
    setTimerSeconds(totalM * 60);
    setIsTimerRunning(false);
    setIsModalOpen(true);
  };

  // Submit / Save Report
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPtName.trim()) {
      showToast('⚠️ Mohon isi nama Entitas / PT soal LKS.');
      return;
    }

    const totalMinutes = Math.max(1, formJam * 60 + formMenit);
    const parsedNominal = Math.abs(parseFloat(formNominalLabaRugi.replace(/[^0-9.-]+/g, '')) || 0);

    const reportPayload: Partial<LKSReportSubmission> = {
      student_id: currentStudent?.student_id || 'std_01',
      student_name: currentStudent?.nama || 'Andi Saputra',
      student_kelas: currentStudent?.kelas || 'XI AKL 1',
      pt_name: formPtName.trim(),
      tipe_pengerjaan: formTipe,
      status_laba_rugi: formStatusLabaRugi,
      nilai_laba_rugi: parsedNominal,
      waktu_pengerjaan_menit: totalMinutes,
      tanggal_pengerjaan: formTanggal,
      pertemuan_ke: formPertemuan ? Number(formPertemuan) : undefined,
      file_url_or_link: formFileUrl.trim(),
      catatan_rekonsiliasi: formCatatan.trim(),
      status: 'pending'
    };

    try {
      if (editingReportId) {
        const updatedList = reports.map(r =>
          r.id === editingReportId ? { ...r, ...reportPayload, updated_at: new Date().toISOString() } : r
        );
        saveReports(updatedList);
        await api.updateLKSReport(editingReportId, reportPayload).catch(() => {});
        showToast('✅ Laporan LKS berhasil diperbarui!');
      } else {
        const newRep: LKSReportSubmission = {
          id: 'lks_rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          ...(reportPayload as LKSReportSubmission),
          created_at: new Date().toISOString()
        };
        const updatedList = [newRep, ...reports];
        saveReports(updatedList);
        await api.createLKSReport(reportPayload).catch(() => {});
        showToast('🎉 Laporan hasil pengerjaan LKS berhasil dikirim ke guru!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving report:', err);
      showToast('⚠️ Gagal menyimpan laporan. Mohon coba lagi.');
    }
  };

  // Delete Report
  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Hapus laporan hasil praktik LKS ini?')) return;
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
    await api.deleteLKSReport(id).catch(() => {});
    showToast('🗑️ Laporan berhasil dihapus.');
  };

  // Open Teacher Review
  const handleOpenReviewModal = (rep: LKSReportSubmission) => {
    setReviewModalReport(rep);
    setTeacherScoreInput(rep.teacher_score || 90);
    setTeacherFeedbackInput(rep.teacher_feedback || '');
    setTeacherStatusInput((rep.status as any) || 'reviewed');
  };

  // Submit Teacher Review
  const handleSubmitReview = async () => {
    if (!reviewModalReport) return;
    const updated = reports.map(r => {
      if (r.id === reviewModalReport.id) {
        return {
          ...r,
          teacher_score: teacherScoreInput,
          teacher_feedback: teacherFeedbackInput,
          status: teacherStatusInput,
          updated_at: new Date().toISOString()
        };
      }
      return r;
    });

    saveReports(updated);
    await api.reviewLKSReport(reviewModalReport.id, {
      teacher_score: teacherScoreInput,
      teacher_feedback: teacherFeedbackInput,
      status: teacherStatusInput
    }).catch(() => {});

    showToast(`✅ Nilai & Feedback Laporan ${reviewModalReport.pt_name} berhasil disimpan!`);
    setReviewModalReport(null);
  };

  // Filtered List
  const userFilteredReports = reports.filter(r => {
    // If student, show this student's reports
    if (currentUserRole === 'student' && currentStudent) {
      if (r.student_id !== currentStudent.student_id) return false;
    }

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'PJDM' && !r.tipe_pengerjaan.includes('Manual')) return false;
      if (filterType === 'AOL' && !r.tipe_pengerjaan.includes('AOL')) return false;
      if (filterType === 'Kombinasi' && !r.tipe_pengerjaan.includes('Kombinasi')) return false;
    }

    // Status filter
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPt = r.pt_name.toLowerCase().includes(q);
      const matchCatatan = r.catatan_rekonsiliasi?.toLowerCase().includes(q);
      const matchStudent = r.student_name?.toLowerCase().includes(q);
      return matchPt || matchCatatan || matchStudent;
    }

    return true;
  });

  // Calculate Summary Metrics
  const totalSubmissions = userFilteredReports.length;
  const manualCount = userFilteredReports.filter(r => r.tipe_pengerjaan.includes('Manual')).length;
  const aolCount = userFilteredReports.filter(r => r.tipe_pengerjaan.includes('AOL')).length;
  const reviewedCount = userFilteredReports.filter(r => r.status === 'reviewed').length;
  const avgMinutes = totalSubmissions > 0
    ? Math.round(userFilteredReports.reduce((acc, curr) => acc + (curr.waktu_pengerjaan_menit || 0), 0) / totalSubmissions)
    : 0;

  return (
    <div className="space-y-4">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs animate-bounce font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & CALL TO ACTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 rounded-2xl p-4 sm:p-5 border border-indigo-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-md flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Laporan Praktik LKS Siswa
            </span>
            {currentUserRole === 'teacher' && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                Mode Peninjauan Guru
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
            Pelaporan Nilai Laba/Rugi & Durasi Pengerjaan Soal LKS "PT ..."
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Laporkan hasil perhitungan laba/rugi bersih, catatan rekonsiliasi, dan waktu pengerjaan nyata dari studi kasus LKS (Praktik Manual PJDM Spreadsheet dan Database Accurate Online AOL).
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lapor Hasil Praktik Baru</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Total Laporan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Total Laporan Terdata</span>
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-lg font-black text-white">{totalSubmissions} Laporan</p>
          <p className="text-[10px] text-indigo-300">{reviewedCount} telah diverifikasi guru</p>
        </div>

        {/* Manual PJDM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Praktik Manual (PJDM)</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-emerald-400">{manualCount} Berkas</p>
          <p className="text-[10px] text-slate-400">Spreadsheet / Kertas Kerja</p>
        </div>

        {/* AOL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Praktik AOL Accurate</span>
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-lg font-black text-blue-400">{aolCount} Database</p>
          <p className="text-[10px] text-slate-400">Cloud Accounting Accurate</p>
        </div>

        {/* Average Duration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Rata-rata Waktu</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-black text-amber-400">
            {Math.floor(avgMinutes / 60)}j {avgMinutes % 60}m
          </p>
          <p className="text-[10px] text-slate-400">Target LKS: ≤ 120 Menit</p>
        </div>
      </div>

      {/* 3. FILTER, SEARCH & PRESET SUGGESTIONS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama PT (e.g. PT Jaya Sentosa), nama siswa, atau catatan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Filter Tipe */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 text-xs shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 font-bold rounded transition cursor-pointer ${
                filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Tipe
            </button>
            <button
              onClick={() => setFilterType('PJDM')}
              className={`px-3 py-1 font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                filterType === 'PJDM' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Manual (PJDM)</span>
            </button>
            <button
              onClick={() => setFilterType('AOL')}
              className={`px-3 py-1 font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                filterType === 'AOL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>AOL</span>
            </button>
          </div>

          {/* Filter Status */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 text-xs shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 font-bold rounded transition cursor-pointer ${
                filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 font-bold rounded transition cursor-pointer ${
                filterStatus === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('reviewed')}
              className={`px-2.5 py-1 font-bold rounded transition cursor-pointer ${
                filterStatus === 'reviewed' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Diverifikasi
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] border-t border-slate-800/80">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Pintasan Entitas Soal LKS:
          </span>
          {SUGGESTED_LKS_PT.slice(0, 5).map(pt => (
            <button
              key={pt}
              onClick={() => handleOpenCreateModal(pt)}
              className="px-2 py-0.5 rounded-full bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 text-[10.5px] transition cursor-pointer"
            >
              + {pt}
            </button>
          ))}
        </div>
      </div>

      {/* 4. LIST OF REPORTS (CARDS & DETAIL TABLES) */}
      <div className="space-y-3">
        {userFilteredReports.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <h4 className="text-sm font-bold text-slate-300">Belum Ada Laporan Hasil Praktik LKS</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Silakan klik tombol <strong>"+ Lapor Hasil Praktik Baru"</strong> di atas untuk memasukkan nominal laba/rugi, durasi waktu pengerjaan, dan catatan rekonsiliasi studi kasus PT LKS.
            </p>
            <button
              onClick={() => handleOpenCreateModal()}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Laporan Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {userFilteredReports.map(report => {
              const isProfit = report.status_laba_rugi === 'Laba Bersih';
              const isManual = report.tipe_pengerjaan.includes('Manual');
              const hours = Math.floor(report.waktu_pengerjaan_menit / 60);
              const mins = report.waktu_pengerjaan_menit % 60;

              return (
                <div
                  key={report.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 shadow-md flex flex-col justify-between gap-3 transition"
                >
                  {/* Top Row: PT Name, Type Badge, Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                              isManual
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                                : 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                            }`}
                          >
                            {isManual ? 'Manual PJDM' : 'Accurate AOL'}
                          </span>
                          {report.pertemuan_ke && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                              Pertemuan {report.pertemuan_ke}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5 truncate pt-0.5">
                          <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{report.pt_name}</span>
                        </h3>
                        {currentUserRole === 'teacher' && (
                          <p className="text-[10px] text-slate-400 font-semibold">
                            Oleh: <span className="text-emerald-400 font-bold">{report.student_name}</span> ({report.student_kelas})
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0 text-right">
                        {report.status === 'reviewed' ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Diverifikasi {report.teacher_score !== undefined && `(${report.teacher_score})`}
                          </span>
                        ) : report.status === 'needs_revision' ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-md inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Perlu Revisi
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Menunggu Review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Results: Net Profit/Loss & Completion Time */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                      {/* Laba / Rugi Bersih */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          {isProfit ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                          )}
                          Hasil {report.status_laba_rugi}:
                        </span>
                        <p
                          className={`font-black text-xs sm:text-sm tracking-tight ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          Rp {report.nilai_laba_rugi.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Waktu Pengerjaan */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Waktu Pengerjaan:
                        </span>
                        <p className="font-black text-xs sm:text-sm text-amber-300">
                          {hours > 0 ? `${hours} Jam ` : ''}
                          {mins} Menit
                        </p>
                      </div>
                    </div>

                    {/* Catatan Rekonsiliasi & Penyesuaian */}
                    {report.catatan_rekonsiliasi && (
                      <div className="text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 text-slate-300">
                        <span className="text-slate-400 font-bold">Catatan Kertas Kerja: </span>
                        <span className="italic">{report.catatan_rekonsiliasi}</span>
                      </div>
                    )}

                    {/* Feedback Guru jika ada */}
                    {report.teacher_feedback && (
                      <div className="text-[11px] bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/40 text-emerald-200">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Review Guru {report.teacher_score !== undefined && `(Nilai ${report.teacher_score})`}:
                        </span>
                        <p className="italic mt-0.5">"{report.teacher_feedback}"</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[10.5px]">
                    <div className="flex items-center space-x-2 text-slate-400 truncate">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {report.tanggal_pengerjaan}
                      </span>
                      {report.file_url_or_link && (
                        <a
                          href={report.file_url_or_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 underline"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          Link Berkas
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {currentUserRole === 'teacher' ? (
                        <button
                          onClick={() => handleOpenReviewModal(report)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3 h-3" />
                          <span>Beri Nilai & Feedback</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(report)}
                            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Edit Laporan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. MODAL FORM: TAMBAH / EDIT LAPORAN PRAKTIK SISWA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-xl w-full p-4 sm:p-5 text-white shadow-2xl space-y-4 my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {editingReportId ? 'Edit Laporan Praktik LKS' : 'Form Pelaporan Hasil Praktik LKS'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Input nilai laba/rugi, durasi pengerjaan, dan catatan rekonsiliasi studi kasus PT LKS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReport} className="space-y-3.5 text-xs">
              {/* Nama Entitas / Kasus PT */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Nama Entitas / Soal Kasus LKS PT: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Jaya Sentosa Abadi / PT Sejahtera Logistik"
                  value={formPtName}
                  onChange={e => setFormPtName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 outline-none focus:border-indigo-500 text-xs"
                />
                {/* Suggestions Quick Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto pt-1 scrollbar-none">
                  <span className="text-[10px] text-slate-500 shrink-0">Pilih Cepat:</span>
                  {SUGGESTED_LKS_PT.slice(0, 4).map(pt => (
                    <button
                      type="button"
                      key={pt}
                      onClick={() => setFormPtName(pt)}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] rounded text-slate-300 shrink-0 cursor-pointer"
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipe Pengerjaan & Pertemuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tipe */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Tipe Praktik:</label>
                  <select
                    value={formTipe}
                    onChange={e => setFormTipe(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs cursor-pointer"
                  >
                    <option value="Praktik Manual (PJDM)">Praktik Manual (PJDM / Spreadsheet)</option>
                    <option value="Praktik AOL (Accurate Online)">Praktik Accurate Online (AOL)</option>
                    <option value="Kombinasi Manual & AOL">Kombinasi Manual & AOL</option>
                  </select>
                </div>

                {/* Pertemuan */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Terkait Pertemuan Kurikulum:</label>
                  <select
                    value={formPertemuan}
                    onChange={e => setFormPertemuan(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs cursor-pointer"
                  >
                    <option value="">Studi Kasus Mandiri (Di luar pertemuan)</option>
                    <option value="1">Pertemuan 1</option>
                    <option value="2">Pertemuan 2</option>
                    <option value="3">Pertemuan 3</option>
                    <option value="4">Pertemuan 4</option>
                    <option value="5">Pertemuan 5</option>
                    <option value="6">Pertemuan 6</option>
                  </select>
                </div>
              </div>

              {/* Hasil Laba / Rugi Bersih */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-emerald-400 font-black flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Nilai Laba/Rugi Bersih yang Dihasilkan: <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setFormStatusLabaRugi('Laba Bersih')}
                      className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                        formStatusLabaRugi === 'Laba Bersih'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Laba Bersih
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatusLabaRugi('Rugi Bersih')}
                      className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                        formStatusLabaRugi === 'Rugi Bersih'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Rugi Bersih
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 148750000"
                    value={formNominalLabaRugi}
                    onChange={e => setFormNominalLabaRugi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white font-extrabold text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Terbilang:{' '}
                  <span className="text-slate-200 font-semibold">
                    {formStatusLabaRugi} Rp {Number(formNominalLabaRugi || 0).toLocaleString('id-ID')}
                  </span>
                </p>
              </div>

              {/* Waktu Pengerjaan & Live Timer Helper */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-amber-400 font-black flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Waktu / Durasi Pengerjaan: <span className="text-rose-400">*</span>
                  </label>

                  {/* Stopwatch helper trigger */}
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="text-slate-400 font-mono">
                      {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 cursor-pointer ${
                        isTimerRunning ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                      <span>{isTimerRunning ? 'Jeda' : 'Stopwatch'}</span>
                    </button>
                    {timerSeconds > 0 && (
                      <button
                        type="button"
                        onClick={handleApplyTimerToForm}
                        className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer"
                        title="Terapkan waktu stopwatch ke form"
                      >
                        Pakai
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-1.5 bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={formJam}
                      onChange={e => setFormJam(Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-slate-700 text-white font-bold text-center rounded py-1"
                    />
                    <span className="text-slate-300 font-semibold">Jam</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formMenit}
                      onChange={e => setFormMenit(Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-slate-700 text-white font-bold text-center rounded py-1"
                    />
                    <span className="text-slate-300 font-semibold">Menit</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 pt-1 text-[10px]">
                  <span className="text-slate-500">Preset:</span>
                  {[45, 60, 90, 120, 150].map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => {
                        setFormJam(Math.floor(m / 60));
                        setFormMenit(m % 60);
                      }}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 cursor-pointer"
                    >
                      {m} Menit
                    </button>
                  ))}
                </div>
              </div>

              {/* Tanggal & Link File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Tanggal Pengerjaan:</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={e => setFormTanggal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Link Berkas / Drive / File Backup:</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... atau link sheet"
                    value={formFileUrl}
                    onChange={e => setFormFileUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Catatan Rekonsiliasi & Tahapan Penyelesaian */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Catatan Rekonsiliasi / Jurnal Penyesuaian & Kendala:
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan temuan saldo akun, jurnal penyesuaian khusus (depresiasi, persediaan akhir, rekonsiliasi kas/bank), atau kendala yang dihadapi..."
                  value={formCatatan}
                  onChange={e => setFormCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 text-xs placeholder-slate-600"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingReportId ? 'Simpan Perubahan' : 'Kirim Laporan ke Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL REVIEW GURU (VERIFIKASI & FEEDBACK NILAI) */}
      {reviewModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-5 text-white shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Verifikasi Laporan LKS: {reviewModalReport.pt_name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Siswa: <span className="text-emerald-300 font-bold">{reviewModalReport.student_name}</span> ({reviewModalReport.student_kelas})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalReport(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Report Summary Snapshot */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tipe Praktik:</span>
                <span className="text-white font-bold">{reviewModalReport.tipe_pengerjaan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hasil {reviewModalReport.status_laba_rugi}:</span>
                <span className="text-emerald-400 font-black">
                  Rp {reviewModalReport.nilai_laba_rugi.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Waktu Pengerjaan:</span>
                <span className="text-amber-400 font-black">{reviewModalReport.waktu_pengerjaan_menit} Menit</span>
              </div>
              {reviewModalReport.catatan_rekonsiliasi && (
                <div className="pt-1 text-[11px] text-slate-300 border-t border-slate-800">
                  <span className="text-slate-500 font-bold">Catatan Siswa:</span> {reviewModalReport.catatan_rekonsiliasi}
                </div>
              )}
            </div>

            {/* Input Nilai & Feedback */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Nilai Praktik (0 - 100):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={teacherScoreInput}
                  onChange={e => setTeacherScoreInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-black text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Status Verifikasi:</label>
                <select
                  value={teacherStatusInput}
                  onChange={e => setTeacherStatusInput(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="reviewed">Diverifikasi & Lulus (Reviewed)</option>
                  <option value="needs_revision">Perlu Revisi / Penyesuaian Ulang</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Feedback & Catatan Guru:</label>
                <textarea
                  rows={3}
                  placeholder="Berikan masukan terkait akurasi laba rugi, kecepatan waktu pengerjaan, dan kerapian kertas kerja..."
                  value={teacherFeedbackInput}
                  onChange={e => setTeacherFeedbackInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500 text-xs placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setReviewModalReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Verifikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
