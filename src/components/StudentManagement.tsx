import React, { useState, useRef } from 'react';
import { Student, StudentProgress, QuizResult } from '../types';
import { api } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
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
  Image as ImageIcon
} from 'lucide-react';

interface StudentManagementProps {
  students: Student[];
  progressList: StudentProgress[];
  quizResults: QuizResult[];
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

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Manajemen Siswa & Akses Sandi Mandiri
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Key className="w-3 h-3" />
              Foto & Sandi Terekam Guru
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau foto profil dan kata sandi yang dibuat oleh masing-masing siswa secara mandiri, lakukan reset sandi jika diperlukan, dan kelola profil belajar.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Siswa Baru
        </button>
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
              {filteredStudents.map(student => {
                const prog = progressList.find(p => p.student_id === student.student_id);
                const overall = prog?.overall_progress || 0;
                const isRevealed = Boolean(revealedPasswords[student.student_id]);
                const passwordValue = student.password || 'siswa123';
                const isCopied = copiedStudentId === student.student_id;

                return (
                  <tr key={student.student_id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="relative group cursor-pointer" onClick={() => setSelectedStudent(student)}>
                          <img
                            src={student.avatar || PRESET_AVATARS[0].url}
                            alt={student.nama}
                            className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30 group-hover:border-emerald-400 transition"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white hover:text-emerald-300 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                            {student.nama}
                          </div>
                          <div className="text-[10px] text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">{student.kelas || 'XI AKL 1'}</div>
                      <div className="text-[10px] text-slate-500">Absen #{student.nomor_absen || '-'}</div>
                    </td>

                    {/* PASSWORD COLUMN */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-mono text-xs font-bold text-white">
                          {isRevealed ? passwordValue : '••••••••'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(student.student_id)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition ml-1"
                          title={isRevealed ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi Siswa'}
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyPassword(student.student_id, passwordValue)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition"
                          title="Salin Sandi Siswa"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      
                      {student.password_updated_at && (
                        <div className="text-[9px] text-emerald-500/80 mt-0.5">
                          Siswa mengatur sandi sendiri
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-amber-400">Lv. {student.level || 1}</span>
                      <div className="text-[10px] text-slate-500">{student.xp || 0} XP</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="w-28 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            overall >= 75
                              ? 'bg-emerald-500'
                              : overall >= 50
                              ? 'bg-blue-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${overall}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">{overall}%</span>
                    </td>

                    <td className="px-4 py-3.5">
                      {student.status === 'remedial' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Remedial
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Tuntas
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingPasswordStudent(student);
                          setCustomResetPassword(student.password || 'siswa123');
                          setPasswordActionFeedback(null);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 rounded-lg transition"
                        title="Atur / Reset Sandi Siswa"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setDetailAvatarPreview(student.avatar || PRESET_AVATARS[0].url);
                          setIsEditingAvatarInDetail(false);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        title="Lihat Detail Profil Siswa"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingStudentId(student.student_id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT/RESET PASSWORD MODAL */}
      {editingPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setEditingPasswordStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Kelola Kata Sandi Siswa</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src={editingPasswordStudent.avatar || PRESET_AVATARS[0].url}
                alt={editingPasswordStudent.nama}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <div className="text-xs font-bold text-white">{editingPasswordStudent.nama}</div>
                <div className="text-[11px] text-slate-400">
                  {editingPasswordStudent.kelas} • No. Absen #{editingPasswordStudent.nomor_absen}
                </div>
              </div>
            </div>

            {passwordActionFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordActionFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ubah Kata Sandi Akses Masuk:
                </label>
                <input
                  type="text"
                  required
                  value={customResetPassword}
                  onChange={e => setCustomResetPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru..."
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-amber-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Kata sandi ini dapat langsung digunakan siswa saat memilih profilnya di halaman login.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingPasswordStudent(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isResettingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Simpan Perubahan Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Tambah Siswa Baru</h3>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              {/* Avatar Picker for New Student */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Foto Profil Siswa:</label>
                <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <img
                    src={newAvatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_AVATARS.slice(0, 4).map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setNewAvatar(av.url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border ${
                            newAvatar === av.url ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={av.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Unggah Foto dari Perangkat
                    </button>
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setNewAvatar(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Lengkap Siswa: *</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Kelas:</label>
                  <select
                    value={newKelas}
                    onChange={e => setNewKelas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none"
                  >
                    <option value="XI AKL 1">XI AKL 1</option>
                    <option value="XI AKL 2">XI AKL 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nomor Absen:</label>
                  <input
                    type="number"
                    value={newAbsen}
                    onChange={e => setNewAbsen(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email Belajar Siswa:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="rizky@student.smk.id"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Kata Sandi Awal (Opsional):</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Default: siswa123 (Siswa dapat ubah sendiri saat masuk)"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Jika dikosongkan, siswa dapat langsung menentukan kata sandi sendiri saat memilih profilnya di halaman login.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <img
                    src={detailAvatarPreview || selectedStudent.avatar || PRESET_AVATARS[0].url}
                    alt={selectedStudent.nama}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingAvatarInDetail(!isEditingAvatarInDetail)}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-lg transition cursor-pointer"
                    title="Ubah Foto Profil Siswa"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStudent.nama}</h3>
                  <p className="text-xs text-slate-400">Kelas: {selectedStudent.kelas} • Absen #{selectedStudent.nomor_absen} • {selectedStudent.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                      Level {selectedStudent.level || 1} ({selectedStudent.xp || 0} XP)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingAvatarInDetail(!isEditingAvatarInDetail)}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold"
                    >
                      {isEditingAvatarInDetail ? 'Batal Ganti Foto' : 'Ganti Foto Siswa'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar Edit Selector in Detail Modal */}
            {isEditingAvatarInDetail && (
              <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Pilih / Unggah Foto Profil Baru untuk {selectedStudent.nama}:
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setDetailAvatarPreview(av.url)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                        detailAvatarPreview === av.url ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => detailFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    Unggah dari Komputer
                  </button>
                  <input
                    ref={detailFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-200"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
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
