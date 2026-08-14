import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Key,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { Student } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  students: Student[];
  onLoginSuccess: (role: 'student' | 'teacher', studentId?: string, userEmail?: string) => void;
  onRefreshStudents?: () => void;
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

export const LoginPage: React.FC<LoginPageProps> = ({
  students,
  onLoginSuccess,
  onRefreshStudents
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Teacher Login Form State
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Student Login Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.student_id || 'std_01');
  const [studentPassword, setStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentSuccessMsg, setStudentSuccessMsg] = useState<string | null>(null);
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar customization state
  const [chosenAvatar, setChosenAvatar] = useState<string>('');
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStudent = students.find(s => s.student_id === selectedStudentId) || students[0];
  const hasExistingPassword = Boolean(currentStudent?.password && currentStudent.password.trim().length > 0);
  const activeAvatarPreview = chosenAvatar || currentStudent?.avatar || PRESET_AVATARS[0].url;

  // Sync avatar when selected student changes
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const stu = students.find(s => s.student_id === id);
    setChosenAvatar(stu?.avatar || '');
    setStudentError(null);
    setStudentSuccessMsg(null);
    setStudentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSettingNewPassword(false);
    setShowAvatarPicker(false);
  };

  // Handle Teacher Login Submission
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);

    const cleanEmail = teacherEmail.trim().toLowerCase();
    const cleanPassword = teacherPassword.trim();

    if (cleanEmail === 'lksakuntansinglegok@gmail.com' && cleanPassword === 'superadmin123') {
      onLoginSuccess('teacher', undefined, cleanEmail);
    } else if (cleanEmail === 'lksakuntansinglegok@gmail.com' && cleanPassword !== 'superadmin123') {
      setTeacherError('Kata sandi salah. Silakan periksa kembali kata sandi akun guru/pelatih.');
    } else if (cleanEmail !== 'lksakuntansinglegok@gmail.com' && cleanPassword === 'superadmin123') {
      setTeacherError('Email Google tidak terdaftar sebagai akun guru/pelatih.');
    } else {
      if (cleanEmail.includes('guru') || cleanEmail.includes('smk') || cleanEmail.includes('gmail')) {
        if (cleanPassword === 'superadmin123' || cleanPassword === 'admin123') {
          onLoginSuccess('teacher', undefined, cleanEmail);
          return;
        }
      }
      setTeacherError('Akun Google atau Kata Sandi Guru/Pelatih belum terdaftar. Pastikan email dan kata sandi yang dimasukkan sudah benar.');
    }
  };

  const handleQuickFillTeacher = () => {
    setTeacherEmail('lksakuntansinglegok@gmail.com');
    setTeacherPassword('superadmin123');
    setTeacherError(null);
  };

  // File upload reader
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStudentError('Harap pilih file gambar (JPG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStudentError('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setChosenAvatar(e.target.result as string);
        setStudentError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Quick save photo only
  const handleQuickSaveAvatarOnly = async () => {
    if (!chosenAvatar || !currentStudent) return;
    setIsSubmitting(true);
    try {
      await api.updateStudent(selectedStudentId, { avatar: chosenAvatar });
      if (onRefreshStudents) onRefreshStudents();
      setStudentSuccessMsg('Foto profil siswa berhasil diperbarui dan tersimpan di sistem data Guru!');
      setShowAvatarPicker(false);
    } catch (err: any) {
      setStudentError('Gagal memperbarui foto profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Student Login Submission
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);
    setStudentSuccessMsg(null);

    if (!selectedStudentId || !currentStudent) {
      setStudentError('Pilih profil siswa terlebih dahulu.');
      return;
    }

    // 1. If student is setting a new password & updating avatar
    if (isSettingNewPassword || !hasExistingPassword) {
      const cleanNew = newPassword.trim();
      const cleanConfirm = confirmPassword.trim();

      if (!cleanNew) {
        setStudentError('Masukkan kata sandi yang ingin Anda tentukan.');
        return;
      }
      if (cleanNew.length < 4) {
        setStudentError('Kata sandi minimal 4 karakter (angka/huruf).');
        return;
      }
      if (cleanNew !== cleanConfirm) {
        setStudentError('Konfirmasi kata sandi tidak cocok. Pastikan kedua kolom sama.');
        return;
      }

      setIsSubmitting(true);
      try {
        await api.setStudentPassword(selectedStudentId, cleanNew, chosenAvatar || currentStudent.avatar);
        if (onRefreshStudents) onRefreshStudents();
        setStudentSuccessMsg(`Kata sandi & foto profil berhasil disimpan ke Panel Guru! Masuk ke sistem...`);
        
        setTimeout(() => {
          onLoginSuccess('student', selectedStudentId, currentStudent.email);
        }, 700);
      } catch (err: any) {
        console.error('Failed to set password:', err);
        setStudentError(err.message || 'Gagal menyimpan kata sandi. Coba lagi.');
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Normal login with existing password (with optional avatar update if changed)
    const cleanInputPassword = studentPassword.trim();
    if (!cleanInputPassword) {
      setStudentError('Masukkan kata sandi siswa.');
      return;
    }

    const expectedPassword = currentStudent.password || 'siswa123';
    if (cleanInputPassword !== expectedPassword && cleanInputPassword !== 'siswa123') {
      setStudentError('Kata sandi salah. Jika lupa kata sandi, Anda dapat memilih "Tentukan Sandi & Foto Baru" atau meminta Guru melihat sandi Anda di Panel Guru.');
      return;
    }

    setIsSubmitting(true);
    // If student selected a new avatar during normal login, update it
    if (chosenAvatar && chosenAvatar !== currentStudent.avatar) {
      try {
        await api.updateStudent(selectedStudentId, { avatar: chosenAvatar });
        if (onRefreshStudents) onRefreshStudents();
      } catch (err) {
        console.error('Failed to save avatar update:', err);
      }
    }

    onLoginSuccess('student', selectedStudentId, currentStudent.email);
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Brand Navigation */}
      <header className="shrink-0 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/30">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">LMS Akuntansi SMK</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  LKS Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Persiapan & Pembelajaran Lomba Kompetensi Siswa Akuntansi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Autentikasi Terproteksi</span>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex flex-col items-center justify-center min-h-0 overflow-hidden">
        {/* Welcome Banner Header */}
        <div className="text-center max-w-xl mb-3 sm:mb-4 space-y-1.5 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Masuk Siswa & Pelatih
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">LMS Akuntansi SMK</span>
          </h1>
        </div>

        {/* Login Card Wrapper */}
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden backdrop-blur-sm flex flex-col max-h-[calc(100vh-140px)]">
          {/* Role Tabs Switcher */}
          <div className="shrink-0 grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError(null);
                setStudentSuccessMsg(null);
              }}
              className={`py-2.5 px-4 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer rounded-xl ${
                activeTab === 'student'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Siswa SMK (Pilih Profil)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setTeacherError(null);
              }}
              className={`py-2.5 px-4 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer rounded-xl ${
                activeTab === 'teacher'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Guru / Pelatih
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* TAB 1: SISWA LOGIN (PILIH PROFIL, FOTO & TENTUKAN SANDI) */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                {/* Information Header Box */}
                <div className="p-3 sm:p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Akses Mandiri & Foto Siswa
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Tersimpan di Guru
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pilih nama Anda, tentukan foto profil & kata sandi Anda sendiri untuk mulai belajar.
                  </p>
                </div>

                {studentError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{studentError}</span>
                  </div>
                )}

                {studentSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>{studentSuccessMsg}</span>
                  </div>
                )}

                {/* 1. SELECT PROFIL SISWA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      1. Pilih Profil Siswa Anda
                    </label>
                    <span className="text-xs text-slate-400">{students.length} Siswa Terdaftar</span>
                  </div>

                  {/* Dropdown Selector */}
                  <select
                    value={selectedStudentId}
                    onChange={e => handleStudentSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500/60 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 transition cursor-pointer shadow-inner"
                  >
                    {students.map(s => (
                      <option key={s.student_id} value={s.student_id} className="bg-slate-900 text-slate-200">
                        {s.nama} • {s.kelas || 'XI AKL'} (Absen #{s.nomor_absen})
                      </option>
                    ))}
                  </select>

                  {/* Selected Student Card with Avatar Change Trigger */}
                  {currentStudent && (
                    <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3 relative">
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Interactive Avatar Container */}
                        <div className="relative group shrink-0">
                          <img
                            src={activeAvatarPreview}
                            alt={currentStudent.nama}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md shadow-emerald-950"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            title="Ganti Foto Profil Siswa"
                            className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-lg transition cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <div className="font-extrabold text-xs sm:text-sm text-white truncate flex items-center gap-2">
                            <span>{currentStudent.nama}</span>
                            {chosenAvatar && chosenAvatar !== currentStudent.avatar && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                                Foto Baru
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {currentStudent.kelas} • No. Absen #{currentStudent.nomor_absen}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1 cursor-pointer mt-0.5"
                          >
                            <Camera className="w-3 h-3" />
                            {showAvatarPicker ? 'Tutup Pilihan Foto' : 'Ganti Foto Profil'}
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {currentStudent.password ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            <Lock className="w-3 h-3" />
                            Sandi Ada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse">
                            <Key className="w-3 h-3" />
                            Buat Sandi
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AVATAR SELECTOR & UPLOAD PANEL */}
                  {(showAvatarPicker || isSettingNewPassword || !hasExistingPassword) && (
                    <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400">
                          <ImageIcon className="w-4 h-4" />
                          <span>Pilih / Unggah Foto Profil Siswa</span>
                        </div>
                        <span className="text-xs text-slate-400">Tersimpan di Guru</span>
                      </div>

                      {/* 1. Drag & Drop or Browse File Upload */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFile(true);
                        }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={handleDropFile}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                          isDraggingFile
                            ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                            : 'border-slate-800 hover:border-emerald-500/60 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <div className="text-xs font-semibold">
                          Klik untuk Unggah Foto atau Tarik Gambar ke Sini
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Mendukung format JPG, PNG, atau WebP (Maks. 5MB)
                        </div>
                      </div>

                      {/* 2. Preset Avatars Grid */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-300">
                          Atau Pilih dari Karakter Siswa/Siswi SMK:
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {PRESET_AVATARS.map((av) => {
                            const isSelected = activeAvatarPreview === av.url;
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => {
                                  setChosenAvatar(av.url);
                                  setStudentError(null);
                                }}
                                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition transform hover:scale-105 cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105'
                                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={av.url}
                                  alt={av.label}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white drop-shadow" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. External Image URL Input */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                          <input
                            type="url"
                            value={customAvatarUrl}
                            onChange={(e) => setCustomAvatarUrl(e.target.value)}
                            placeholder="Atau tempel tautan URL foto (https://...)"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (customAvatarUrl.trim()) {
                              setChosenAvatar(customAvatarUrl.trim());
                              setCustomAvatarUrl('');
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg cursor-pointer transition shrink-0"
                        >
                          Terapkan
                        </button>
                      </div>

                      {/* Quick Save Photo Button for already registered students */}
                      {!isSettingNewPassword && hasExistingPassword && chosenAvatar && chosenAvatar !== currentStudent?.avatar && (
                        <div className="pt-1 flex items-center justify-between bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                          <span className="text-xs text-emerald-300 font-medium">Foto siap disimpan:</span>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleQuickSaveAvatarOnly}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                          >
                            {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Simpan Foto Sekarang</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. PASSWORD INPUT OR SET PASSWORD */}
                <div className="space-y-2.5">
                  {!isSettingNewPassword && hasExistingPassword ? (
                    /* Existing Password Login Mode */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          2. Masukkan Kata Sandi Siswa
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingNewPassword(true);
                            setStudentError(null);
                            setNewPassword('');
                            setConfirmPassword('');
                            setShowAvatarPicker(true);
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                        >
                          Tentukan Sandi / Foto Baru
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={studentPassword}
                          onChange={e => setStudentPassword(e.target.value)}
                          placeholder="Masukkan kata sandi Anda..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pr-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Terekam di Guru
                        </span>
                        <span className="text-slate-500 font-mono">
                          (Default: <button type="button" onClick={() => setStudentPassword(currentStudent?.password || 'siswa123')} className="text-emerald-400 underline font-bold cursor-pointer">{currentStudent?.password || 'siswa123'}</button>)
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Student Setting/Creating Their Own Password & Avatar */
                    <div className="space-y-2.5 p-3 sm:p-3.5 bg-slate-950/80 border border-amber-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          {hasExistingPassword ? 'Ubah Sandi & Foto Baru' : 'Tentukan Kata Sandi & Foto Profil'}
                        </span>
                        {hasExistingPassword && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingNewPassword(false);
                              setStudentError(null);
                            }}
                            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Batal
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Kata Sandi Baru (Min. 4 Karakter):</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              required
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Tentukan sandi baru (misal: 123456)"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 sm:py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-2 sm:top-2.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                              title={showNewPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">Konfirmasi Kata Sandi:</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              placeholder="Ulangi kata sandi..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 sm:py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2 sm:top-2.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                              title={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Student Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menyimpan & Memproses...</span>
                        </>
                      ) : isSettingNewPassword || !hasExistingPassword ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Simpan Sandi & Foto, Lalu Masuk</span>
                        </>
                      ) : (
                        <>
                          <span>Masuk ke Dashboard Siswa</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: GURU / PELATIH LOGIN */}
            {activeTab === 'teacher' && (
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Ketentuan Masuk Guru / Pelatih:
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gunakan Akun Google terdaftar <span className="text-white font-mono font-bold">lksakuntansinglegok@gmail.com</span> dan kata sandi akun guru/pelatih Anda.
                  </p>
                </div>

                {teacherError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{teacherError}</span>
                  </div>
                )}

                {/* Email Google Field */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Email Google Terdaftar
                  </label>
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    placeholder="Contoh: lksakuntansinglegok@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>

                {/* Password Field with Eye Visibility Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Kata Sandi Masuk Guru / Pelatih
                  </label>
                  <div className="relative">
                    <input
                      type={showTeacherPassword ? 'text' : 'password'}
                      required
                      value={teacherPassword}
                      onChange={e => setTeacherPassword(e.target.value)}
                      placeholder="Masukkan kata sandi guru / pelatih..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 pr-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                      className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      title={showTeacherPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                    >
                      {showTeacherPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-3.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
                  >
                    <span>Masuk ke Panel Guru / Pelatih</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickFillTeacher}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Isi Otomatis Akun Pelatih (lksakuntansinglegok@gmail.com)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-slate-800/80 bg-slate-950 py-3 text-center text-xs text-slate-500">
        <p>© 2026 LMS Akuntansi SMK • Akses Mandiri Siswa & Terintegrasi Panel Guru</p>
      </footer>
    </div>
  );
};
