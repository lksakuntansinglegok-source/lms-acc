import React, { useState, useRef } from 'react';
import {
  Student,
  StudentProgress,
  QuizResult,
  Task,
  Topic,
  Submission,
  OralSubmission,
  PresentationSubmission
} from '../types';
import { api } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import { generateAndDownloadXlsBackup } from '../utils/exportXlsBackup';
import {
  Users,
  Search,
  Plus,
  Filter,
  UserCheck,
  AlertTriangle,
  Award,
  ChevronRight,
  X,
  CheckCircle2,
  Trash2,
  Edit2,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  GraduationCap,
  FileSpreadsheet,
  Download,
  ShieldAlert,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface StudentManagementProps {
  students: Student[];
  progressList: StudentProgress[];
  quizResults: QuizResult[];
  tasks?: Task[];
  topics?: Topic[];
  submissions?: Submission[];
  oralSubmissions?: OralSubmission[];
  presentationSubmissions?: PresentationSubmission[];
  onRefreshData: () => void;
}

const PRESET_AVATARS = [
  { id: 'av_01', label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_02', label: 'Siswi 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_03', label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_04', label: 'Siswi 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_05', label: 'Siswa 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_06', label: 'Siswi 3', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_07', label: 'Siswa 4', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_08', label: 'Siswi 4', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' }
];

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  progressList,
  quizResults,
  tasks = [],
  topics = [],
  submissions = [],
  oralSubmissions = [],
  presentationSubmissions = [],
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add Student Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newKelas, setNewKelas] = useState('XI AKL 1');
  const [newAbsen, setNewAbsen] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAvatar, setNewAvatar] = useState(PRESET_AVATARS[0].url);

  // Password Management State
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);
  const [editingPasswordStudent, setEditingPasswordStudent] = useState<Student | null>(null);
  const [customResetPassword, setCustomResetPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordActionFeedback, setPasswordActionFeedback] = useState<string | null>(null);

  // Detail Modal Avatar Editing
  const [isEditingAvatarInDetail, setIsEditingAvatarInDetail] = useState(false);
  const [detailAvatarPreview, setDetailAvatarPreview] = useState<string>('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const detailFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Delete State
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Single Student Progress State
  const [resettingStudent, setResettingStudent] = useState<Student | null>(null);
  const [isResettingSingle, setIsResettingSingle] = useState(false);

  // Full System Reset & XLS Backup (Superadmin Protected)
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [wipePassword, setWipePassword] = useState('');
  const [isRevealedWipePassword, setIsRevealedWipePassword] = useState(false);
  const [wipeError, setWipeError] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [isDownloadingOnly, setIsDownloadingOnly] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Filter logic
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.password && student.password.toLowerCase().includes(searchQuery.toLowerCase()));

    const prog = progressList.find(p => p.student_id === student.student_id);
    const overall = prog?.overall_progress || 0;

    if (!matchesSearch) return false;

    if (filterStatus === 'remedial') return student.status === 'remedial';
    if (filterStatus === 'low') return overall < 50;
    if (filterStatus === 'mid') return overall >= 50 && overall <= 75;
    if (filterStatus === 'high') return overall > 75;

    return true;
  });

  const togglePasswordVisibility = (studentId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleCopyPassword = (studentId: string, passwordText: string) => {
    navigator.clipboard.writeText(passwordText);
    setCopiedStudentId(studentId);
    setTimeout(() => setCopiedStudentId(null), 2000);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama) return;
    try {
      await api.createStudent({
        nama: newNama,
        kelas: newKelas,
        nomor_absen: Number(newAbsen),
        email: newEmail || `${newNama.toLowerCase().replace(/\s+/g, '.')}@student.smk.id`,
        password: newPassword.trim() || 'siswa123',
        avatar: newAvatar
      });
      onRefreshData();
      setIsAddModalOpen(false);
      setNewNama('');
      setNewPassword('');
      setNewAvatar(PRESET_AVATARS[0].url);
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordStudent || !customResetPassword.trim()) return;

    setIsResettingPassword(true);
    setPasswordActionFeedback(null);
    try {
      await api.setStudentPassword(editingPasswordStudent.student_id, customResetPassword.trim());
      onRefreshData();
      setPasswordActionFeedback(`Kata sandi untuk ${editingPasswordStudent.nama} berhasil diubah ke "${customResetPassword.trim()}".`);
      setTimeout(() => {
        setEditingPasswordStudent(null);
        setCustomResetPassword('');
        setPasswordActionFeedback(null);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to reset student password:', err);
      setPasswordActionFeedback('Gagal mengubah kata sandi.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSaveAvatarInDetail = async () => {
    if (!selectedStudent || !detailAvatarPreview) return;
    setIsSavingAvatar(true);
    try {
      await api.updateStudent(selectedStudent.student_id, { avatar: detailAvatarPreview });
      setSelectedStudent({ ...selectedStudent, avatar: detailAvatarPreview });
      onRefreshData();
      setIsEditingAvatarInDetail(false);
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const confirmDeleteStudent = async () => {
    if (!deletingStudentId) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(deletingStudentId);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setIsDeleting(false);
      setDeletingStudentId(null);
    }
  };

  const confirmResetSingleStudent = async () => {
    if (!resettingStudent) return;
    setIsResettingSingle(true);
    try {
      const res = await api.resetStudentToZero(resettingStudent.student_id);
      onRefreshData();
      setResetSuccessMessage(res.message || `Progres ${resettingStudent.nama} berhasil di-reset mulai dari nol.`);
      if (selectedStudent?.student_id === resettingStudent.student_id) {
        setSelectedStudent(res.student || null);
      }
      setTimeout(() => setResetSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to reset student:', err);
    } finally {
      setIsResettingSingle(false);
      setResettingStudent(null);
    }
  };

  // Export Backup .xls Only (Standalone Download)
  const handleDownloadBackupOnly = () => {
    setIsDownloadingOnly(true);
    try {
      const filename = generateAndDownloadXlsBackup({
        students,
        tasks,
        topics,
        submissions,
        quizResults,
        oralSubmissions,
        presentationSubmissions,
        progressList
      });
      setResetSuccessMessage(`Berhasil mengunduh berkas backup .xls: "${filename}".`);
      setTimeout(() => setResetSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to export backup .xls:', err);
    } finally {
      setIsDownloadingOnly(false);
    }
  };

  // Wipe All Students & All Student Work with Superadmin Confirmation and .xls backup
  const handleWipeAllStudentsAndWork = async () => {
    if (wipePassword.trim() !== 'superadmin123') {
      setWipeError('Kata sandi konfirmasi salah. Masukkan kata sandi superadmin yang valid ("superadmin123").');
      return;
    }

    setWipeError(null);
    setIsWiping(true);

    try {
      // 1. Generate & download the .xls backup file first
      const downloadedFilename = generateAndDownloadXlsBackup({
        students,
        tasks,
        topics,
        submissions,
        quizResults,
        oralSubmissions,
        presentationSubmissions,
        progressList
      });

      // 2. Call backend API to purge all students & all student work
      const res = await api.wipeAllStudentsAndWork('superadmin123');

      // 3. Refresh parent data
      onRefreshData();

      // 4. Update UI states
      setIsWipeModalOpen(false);
      setWipePassword('');
      setSelectedStudent(null);
      setResetSuccessMessage(
        `Backup berkas "${downloadedFilename}" (.xls) berhasil diunduh dan seluruh data siswa (${res.deletedStudentsCount || students.length} siswa) beserta seluruh hasil pekerjaannya telah berhasil dihapus dari sistem.`
      );
      setTimeout(() => setResetSuccessMessage(null), 8000);
    } catch (err: any) {
      console.error('Failed to wipe all students and work:', err);
      setWipeError(err?.message || 'Gagal menghapus data siswa. Pastikan koneksi server aktif.');
    } finally {
      setIsWiping(false);
    }
  };

  const isPasswordValid = wipePassword.trim() === 'superadmin123';

  return (
    <div className="space-y-6">
      {/* SUCCESS TOAST FOR RESET / BACKUP */}
      {resetSuccessMessage && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 font-semibold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{resetSuccessMessage}</span>
          </div>
          <button
            onClick={() => setResetSuccessMessage(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Manajemen Siswa & Reset Data Siswa
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Key className="w-3 h-3" />
              Foto & Sandi Terekam Guru
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau akun siswa, unduh backup spreadsheet (.xls), atau lakukan reset total menghapus seluruh data siswa dan hasil pekerjaan dengan otorisasi Superadmin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Standalone Backup .xls Download Button */}
          <button
            onClick={handleDownloadBackupOnly}
            disabled={isDownloadingOnly || students.length === 0}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unduh seluruh data siswa, link pengumpulan tugas, kuis, dan wawancara ke dalam berkas Excel (.xls)"
          >
            {isDownloadingOnly ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
            <span>Backup .xls</span>
          </button>

          {/* Wipe All Students & All Work Button */}
          <button
            onClick={() => {
              setWipePassword('');
              setWipeError(null);
              setIsWipeModalOpen(true);
            }}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition cursor-pointer flex items-center gap-2 shadow-sm"
            title="Hapus seluruh siswa dan seluruh hasil pekerjaan siswa dengan backup otomatis .xls dan verifikasi password superadmin"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Hapus Seluruh Siswa (Reset Total)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, sandi, atau kelas..."
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">Semua Siswa ({students.length})</option>
            <option value="remedial">Status Remedial Wajib</option>
            <option value="low">Progress &lt; 50%</option>
            <option value="mid">Progress 50% - 75%</option>
            <option value="high">Progress &gt; 75%</option>
          </select>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase tracking-wider text-[10px] text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Siswa & Foto Profil</th>
                <th className="px-4 py-3">Kelas / Absen</th>
                <th className="px-4 py-3">Kata Sandi Masuk (Terekam)</th>
                <th className="px-4 py-3">Level & XP</th>
                <th className="px-4 py-3">Progress Overall</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">Belum ada data siswa</p>
                      <p className="text-[11px] text-slate-500">
                        Sistem dalam keadaan bersih. Klik tombol <strong>Tambah Siswa Baru</strong> untuk mendaftarkan siswa baru.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Siswa Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const prog = progressList.find(p => p.student_id === student.student_id);
                  const overall = prog?.overall_progress || 0;
                  const isRevealed = Boolean(revealedPasswords[student.student_id]);
                  const passwordValue = student.password || 'siswa123';
                  const isCopied = copiedStudentId === student.student_id;

                  return (
                    <tr key={student.student_id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar || PRESET_AVATARS[0].url}
                            alt={student.nama}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{student.nama}</div>
                            <div className="text-[11px] text-slate-400">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-200">{student.kelas}</span>
                        <div className="text-[10px] text-slate-500">Absen No. {student.nomor_absen}</div>
                      </td>

                      {/* Password Column with Reveal, Copy & Edit */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-200 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-md">
                            {isRevealed ? passwordValue : '••••••••'}
                          </span>

                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(student.student_id)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition"
                            title={isRevealed ? 'Sembunyikan Sandi' : 'Lihat Sandi'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyPassword(student.student_id, passwordValue)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition"
                            title="Salin Sandi"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPasswordStudent(student);
                              setCustomResetPassword(passwordValue);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-400 transition"
                            title="Ubah Sandi Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Lv. {student.level || 1}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {student.xp || 0} XP
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Selesai</span>
                            <span className="font-bold text-slate-200">{overall}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                overall >= 75
                                  ? 'bg-emerald-500'
                                  : overall >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${overall}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            student.status === 'remedial'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {student.status === 'remedial' ? 'Remedial' : 'Aktif'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setResettingStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                          title="Reset progres siswa ini mulai dari nol"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(student.student_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                          title="Hapus siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPERADMIN FULL WIPE & .XLS BACKUP MODAL */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-left">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/40 text-rose-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Hapus Seluruh Siswa & Reset Total</h3>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md">
                      Superadmin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Penghapusan bersih akun siswa dan seluruh hasil pekerjaan dengan backup berkas Excel (.xls)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWipeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Description & Backup Information Card */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Otomatis Mengunduh Backup Lengkap (.xls):</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Sebelum seluruh data siswa dihapus, sistem akan <strong>secara otomatis membuat dan mengunduh berkas Excel (.xls)</strong> yang terbagi ke dalam 5 lembar kerja (worksheet):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-bold text-emerald-300 block mb-0.5">1. Data Siswa & Sandi</span>
                  ID, Nama, Kelas, No. Absen, Email, Sandi Mandiri, Level, XP.
                </div>
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-bold text-blue-300 block mb-0.5">2. Link Pengumpulan Tugas</span>
                  Link Google Sheets PJDM, AOL, Video Kasus, Catatan Siswa, Skor & Feedback.
                </div>
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-bold text-purple-300 block mb-0.5">3. Hasil Ujian Teori</span>
                  Nilai Akhir, Benar/Salah, Nilai Middle, Nilai HOTS, Status Remedial.
                </div>
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-bold text-amber-300 block mb-0.5">4. Wawancara & Presentasi</span>
                  Link Video/Audio, Transkrip Jawaban, Nilai AI & Guru LKS.
                </div>
              </div>

              <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300 text-[10.5px]">
                <span className="font-bold text-rose-300 block mb-0.5">5. Catatan & Kemajuan Siswa</span>
                Progres materi per bidang, Catatan Kekuatan, Kelemahan, dan Rekomendasi Guru.
              </div>

              {/* Warning box */}
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-200 text-[11px] space-y-1 mt-2">
                <p className="font-bold flex items-center gap-1 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  Perhatian Tindakan Permanen:
                </p>
                <p className="text-[10.5px] leading-relaxed">
                  Tindakan ini akan <strong>menghapus seluruh {students.length} data siswa</strong> dan <strong>seluruh riwayat pekerjaan</strong> (tugas, kuis, rekaman wawancara, presentasi) dari database. Pastikan berkas .xls tersimpan dengan aman di komputer Anda.
                </p>
              </div>
            </div>

            {/* Password input section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Konfirmasi Kata Sandi Superadmin:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={isRevealedWipePassword ? 'text' : 'password'}
                  value={wipePassword}
                  onChange={e => {
                    setWipePassword(e.target.value);
                    if (wipeError) setWipeError(null);
                  }}
                  placeholder="Ketik kata sandi konfirmasi (superadmin123)..."
                  className={`w-full pl-9 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white outline-none transition font-mono ${
                    isPasswordValid
                      ? 'border-emerald-500 focus:border-emerald-400 bg-emerald-950/20'
                      : wipeError
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-slate-700 focus:border-rose-500'
                  }`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && isPasswordValid && !isWiping) {
                      handleWipeAllStudentsAndWork();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsRevealedWipePassword(!isRevealedWipePassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {isRevealedWipePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Status feedback */}
              {isPasswordValid ? (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Kata sandi superadmin cocok. Siap melakukan backup dan reset total.</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">
                  Ketik kata sandi <code className="text-rose-400 font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800">superadmin123</code> untuk mengaktifkan tombol eksekusi.
                </div>
              )}

              {wipeError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-lg text-[11px] text-rose-300 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{wipeError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
              <button
                type="button"
                disabled={isWiping}
                onClick={() => setIsWipeModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={!isPasswordValid || isWiping}
                onClick={handleWipeAllStudentsAndWork}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isWiping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengunduh .xls & Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <Trash2 className="w-4 h-4" />
                    <span>Unduh Backup .xls & Hapus Seluruh Siswa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET SINGLE STUDENT MODAL */}
      {resettingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/20 rounded-xl">
                <RotateCcw className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Siswa Mulai Nol</h3>
                <p className="text-xs text-slate-400">Kembalikan pembelajaran ke kondisi awal</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Apakah Anda yakin ingin mereset progres belajar untuk <span className="font-bold text-white">{resettingStudent.nama}</span>?
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Semua hasil kuis teori (topik 1 - 5) akan dikosongkan.</li>
                <li>Semua pengerjaan tugas PJDM, AOL, & Video akan direset.</li>
                <li>Level akan kembali ke <strong>Level 1</strong>, XP kembali ke <strong>0</strong>.</li>
                <li>Siswa dapat memulai alur belajar dari Pertemuan 1 seperti siswa baru.</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={isResettingSingle}
                onClick={() => setResettingStudent(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResettingSingle}
                onClick={confirmResetSingleStudent}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                {isResettingSingle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Ya, Reset ke Nol</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Tambah Siswa Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Kelas</label>
                  <select
                    value={newKelas}
                    onChange={e => setNewKelas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="XI AKL 1">XI AKL 1</option>
                    <option value="XI AKL 2">XI AKL 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Nomor Absen</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newAbsen}
                    onChange={e => setNewAbsen(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Siswa (Opsional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Otomatis digenerate jika kosong"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Kata Sandi Masuk Awal</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Default: siswa123 (dapat diganti oleh siswa)"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Pilih Foto Avatar Siswa</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map(avatar => (
                    <button
                      type="button"
                      key={avatar.id}
                      onClick={() => setNewAvatar(avatar.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer p-0.5 ${
                        newAvatar === avatar.url ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-12 object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PASSWORD MODAL */}
      {editingPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Ubah Kata Sandi Siswa</h3>
              </div>
              <button
                onClick={() => setEditingPasswordStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Ubah atau setel ulang kata sandi masuk untuk siswa <strong className="text-white">{editingPasswordStudent.nama}</strong> ({editingPasswordStudent.kelas}).
            </p>

            <form onSubmit={handleSaveResetPassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Kata Sandi Baru</label>
                <input
                  type="text"
                  required
                  value={customResetPassword}
                  onChange={e => setCustomResetPassword(e.target.value)}
                  placeholder="Ketik kata sandi baru..."
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              {passwordActionFeedback && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{passwordActionFeedback}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPasswordStudent(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5"
                >
                  {isResettingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Simpan Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Profil & Data Belajar Siswa</h3>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setIsEditingAvatarInDetail(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Card */}
            <div className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="relative group">
                <img
                  src={selectedStudent.avatar || PRESET_AVATARS[0].url}
                  alt={selectedStudent.nama}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDetailAvatarPreview(selectedStudent.avatar || PRESET_AVATARS[0].url);
                    setIsEditingAvatarInDetail(!isEditingAvatarInDetail);
                  }}
                  className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{selectedStudent.nama}</h4>
                <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700 text-[10px] font-semibold rounded-md">
                    {selectedStudent.kelas} (No. {selectedStudent.nomor_absen})
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-md">
                    Lv. {selectedStudent.level || 1} • {selectedStudent.xp || 0} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar Editor inside Detail Modal */}
            {isEditingAvatarInDetail && (
              <div className="p-3.5 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    Pilih Foto Profil Baru:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAvatarInDetail(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map(avatar => (
                    <button
                      type="button"
                      key={avatar.id}
                      onClick={() => setDetailAvatarPreview(avatar.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer p-0.5 ${
                        detailAvatarPreview === avatar.url ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-12 object-cover rounded-lg" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => detailFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Foto Lokal</span>
                  </button>

                  <input
                    ref={detailFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setDetailAvatarPreview(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isSavingAvatar}
                    onClick={handleSaveAvatarInDetail}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
                  >
                    {isSavingAvatar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Simpan Foto Baru</span>
                  </button>
                </div>
              </div>
            )}

            {/* Credential Card */}
            <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Key className="w-4 h-4" />
                  Kata Sandi Akses Masuk Siswa:
                </div>
                <div className="mt-1 font-mono text-sm font-black text-white flex items-center gap-2">
                  <span>{selectedStudent.password || 'siswa123'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyPassword(selectedStudent.student_id, selectedStudent.password || 'siswa123')}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition"
                    title="Salin Sandi"
                  >
                    {copiedStudentId === selectedStudent.student_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPasswordStudent(selectedStudent);
                  setCustomResetPassword(selectedStudent.password || 'siswa123');
                }}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-lg transition cursor-pointer"
              >
                Ubah Sandi
              </button>
            </div>

            {/* Middle vs HOTS Split */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Rerata Nilai Middle</span>
                <div className="text-2xl font-black text-white mt-1">84%</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rerata Nilai HOTS</span>
                <div className="text-2xl font-black text-white mt-1">71%</div>
              </div>
            </div>

            {/* Badges Gallery */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Badge Terbuka:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.badges?.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg">
                    🏆 {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setResettingStudent(selectedStudent);
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                title="Hapus seluruh progres belajar dan mulai siswa ini dari awal lagi"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                Reset Siswa Ini ke Nol
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE INDIVIDUAL STUDENT MODAL */}
      <ConfirmModal
        isOpen={!!deletingStudentId}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa ini? Semua progress dan riwayat pengerjaan siswa akan terhapus.`}
        isDeleting={isDeleting}
        onConfirm={confirmDeleteStudent}
        onClose={() => setDeletingStudentId(null)}
      />
    </div>
  );
};
