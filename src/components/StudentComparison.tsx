import React, { useState, useEffect } from 'react';
import { Student, StudentProgress, StudentTeacherEvaluation } from '../types';
import { INITIAL_STUDENT_EVALUATIONS } from '../data/initialEvaluations';
import {
  BarChart2,
  CheckCircle2,
  Edit3,
  BookOpen,
  Brain,
  Monitor,
  Target,
  Sparkles,
  Save,
  X,
  Printer,
  RotateCcw,
  Award,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  UserCheck,
  FileText,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';

interface StudentComparisonProps {
  students: Student[];
  progressList: StudentProgress[];
}

export const StudentComparison: React.FC<StudentComparisonProps> = ({
  students,
  progressList
}) => {
  // Selected students (2 to 5 students)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([
    students[0]?.student_id || 'std_01',
    students[1]?.student_id || 'std_02',
    students[5]?.student_id || 'std_06'
  ]);

  // Class Filter for Selector
  const [classFilter, setClassFilter] = useState<string>('all');

  // Active Tab: 'evaluations' (Catatan Khusus 4 Aspek), 'progress' (Matriks Tugas LMS), 'visual_chart' (Grafik Perbandingan)
  const [activeTab, setActiveTab] = useState<'evaluations' | 'progress' | 'visual_chart'>('evaluations');

  // Teacher Evaluations State (persisted to localStorage)
  const [evaluations, setEvaluations] = useState<Record<string, StudentTeacherEvaluation>>(() => {
    try {
      const saved = localStorage.getItem('lms_student_teacher_evaluations');
      if (saved) {
        return { ...INITIAL_STUDENT_EVALUATIONS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse saved evaluations', e);
    }
    return INITIAL_STUDENT_EVALUATIONS;
  });

  // Save to localStorage when evaluations change
  const saveEvaluationsToStorage = (newEvals: Record<string, StudentTeacherEvaluation>) => {
    setEvaluations(newEvals);
    try {
      localStorage.setItem('lms_student_teacher_evaluations', JSON.stringify(newEvals));
    } catch (e) {
      console.error('Failed to save evaluations', e);
    }
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modal State for Editing Teacher Evaluation
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<string>('');

  // Form State for Editing Modal
  const [formMateriScore, setFormMateriScore] = useState<number>(80);
  const [formMateriLevel, setFormMateriLevel] = useState<string>('Baik');
  const [formMateriCatatan, setFormMateriCatatan] = useState<string>('');

  const [formMentalScore, setFormMentalScore] = useState<number>(80);
  const [formMentalLevel, setFormMentalLevel] = useState<string>('Percaya Diri');
  const [formMentalCatatan, setFormMentalCatatan] = useState<string>('');

  const [formAplikasiScore, setFormAplikasiScore] = useState<number>(80);
  const [formAplikasiLevel, setFormAplikasiLevel] = useState<string>('Kompeten');
  const [formAplikasiCatatan, setFormAplikasiCatatan] = useState<string>('');

  const [formKetelitianScore, setFormKetelitianScore] = useState<number>(80);
  const [formKetelitianLevel, setFormKetelitianLevel] = useState<string>('Teliti');
  const [formKetelitianCatatan, setFormKetelitianCatatan] = useState<string>('');

  const [formRekomendasi, setFormRekomendasi] = useState<string>('');
  const [formKesiapanLks, setFormKesiapanLks] = useState<'Siap Utama' | 'Cadangan Unggulan' | 'Dalam Pembinaan' | 'Perlu Pemantapan'>('Dalam Pembinaan');
  const [formTargetFokus, setFormTargetFokus] = useState<string>('');
  const [isGeneratingAiNotes, setIsGeneratingAiNotes] = useState<boolean>(false);

  // Helper to open edit modal
  const handleOpenEditModal = (studentId: string) => {
    const currentEval = evaluations[studentId] || {
      student_id: studentId,
      penguasaan_materi: { score: 75, level: 'Baik', catatan: 'Pemahaman konsep akuntansi cukup baik.' },
      mental: { score: 75, level: 'Cukup Tenang', catatan: 'Mampu menjaga konsentrasi saat mengerjakan tugas.' },
      penguasaan_aplikasi: { score: 75, level: 'Kompeten', catatan: 'Terampil mengoperasikan Spreadsheet dan AOL.' },
      ketelitian: { score: 75, level: 'Teliti', catatan: 'Pengerjaan jurnal dan buku besar rapi.' },
      rekomendasi_khusus: 'Tingkatkan latihan studi kasus lanjutan.',
      status_kesiapan_lks: 'Dalam Pembinaan',
      target_fokus: 'Pemantapan Siklus Akuntansi',
      updated_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updated_by: 'Guru Pembimbing'
    };

    setEditingStudentId(studentId);
    setFormMateriScore(currentEval.penguasaan_materi.score);
    setFormMateriLevel(currentEval.penguasaan_materi.level);
    setFormMateriCatatan(currentEval.penguasaan_materi.catatan);

    setFormMentalScore(currentEval.mental.score);
    setFormMentalLevel(currentEval.mental.level);
    setFormMentalCatatan(currentEval.mental.catatan);

    setFormAplikasiScore(currentEval.penguasaan_aplikasi.score);
    setFormAplikasiLevel(currentEval.penguasaan_aplikasi.level);
    setFormAplikasiCatatan(currentEval.penguasaan_aplikasi.catatan);

    setFormKetelitianScore(currentEval.ketelitian.score);
    setFormKetelitianLevel(currentEval.ketelitian.level);
    setFormKetelitianCatatan(currentEval.ketelitian.catatan);

    setFormRekomendasi(currentEval.rekomendasi_khusus);
    setFormKesiapanLks(currentEval.status_kesiapan_lks || 'Dalam Pembinaan');
    setFormTargetFokus(currentEval.target_fokus || '');
    setIsEditModalOpen(true);
  };

  // Save Modal Form
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;

    const updated: StudentTeacherEvaluation = {
      student_id: editingStudentId,
      penguasaan_materi: {
        score: formMateriScore,
        level: formMateriLevel,
        catatan: formMateriCatatan
      },
      mental: {
        score: formMentalScore,
        level: formMentalLevel,
        catatan: formMentalCatatan
      },
      penguasaan_aplikasi: {
        score: formAplikasiScore,
        level: formAplikasiLevel,
        catatan: formAplikasiCatatan
      },
      ketelitian: {
        score: formKetelitianScore,
        level: formKetelitianLevel,
        catatan: formKetelitianCatatan
      },
      rekomendasi_khusus: formRekomendasi,
      status_kesiapan_lks: formKesiapanLks,
      target_fokus: formTargetFokus,
      updated_at: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      updated_by: 'Guru Pembimbing LKS'
    };

    const newMap = { ...evaluations, [editingStudentId]: updated };
    saveEvaluationsToStorage(newMap);
    setIsEditModalOpen(false);

    const studentObj = students.find(s => s.student_id === editingStudentId);
    showToast(`Catatan khusus untuk ${studentObj?.nama || 'Siswa'} berhasil disimpan.`);
  };

  // AI Auto-Generator for Student Notes based on their real stats
  const handleGenerateAiNotes = () => {
    setIsGeneratingAiNotes(true);
    const targetStudent = students.find(s => s.student_id === editingStudentId);
    const targetProg = progressList.find(p => p.student_id === editingStudentId);

    setTimeout(() => {
      const overall = targetProg?.overall_progress || 75;
      const pjdm = targetProg?.pjdm_progress || 75;
      const aol = targetProg?.aol_progress || 75;
      const theory = targetProg?.theory_progress || 75;
      const oral = targetProg?.oral_progress || 70;
      const name = targetStudent?.nama || 'Siswa';

      let matScore = Math.min(98, Math.max(50, Math.round(theory * 0.9 + 10)));
      let menScore = Math.min(98, Math.max(50, Math.round(oral * 0.85 + 12)));
      let appScore = Math.min(98, Math.max(50, Math.round((pjdm + aol) / 2)));
      let ketScore = Math.min(98, Math.max(50, Math.round((pjdm * 0.6 + theory * 0.4))));

      let matLvl = matScore >= 88 ? 'Sangat Baik' : matScore >= 78 ? 'Baik' : matScore >= 68 ? 'Cukup' : 'Perlu Bimbingan';
      let menLvl = menScore >= 88 ? 'Sangat Tangguh' : menScore >= 78 ? 'Percaya Diri' : menScore >= 68 ? 'Cukup Tenang' : 'Cemas / Ragu';
      let appLvl = appScore >= 88 ? 'Sangat Mahir' : appScore >= 78 ? 'Kompeten' : appScore >= 68 ? 'Cukup' : 'Butuh Latihan';
      let ketLvl = ketScore >= 88 ? 'Sangat Teliti' : ketScore >= 78 ? 'Teliti' : ketScore >= 68 ? 'Cukup Teliti' : 'Sering Teledor / Kurang Balance';

      let kesiapan: 'Siap Utama' | 'Cadangan Unggulan' | 'Dalam Pembinaan' | 'Perlu Pemantapan' =
        overall >= 85 ? 'Siap Utama' : overall >= 75 ? 'Cadangan Unggulan' : overall >= 60 ? 'Dalam Pembinaan' : 'Perlu Pemantapan';

      setFormMateriScore(matScore);
      setFormMateriLevel(matLvl);
      setFormMateriCatatan(
        matScore >= 85
          ? `Pemahaman ${name} pada siklus akuntansi perusahaan dagang dan manufaktur sangat solid. Mampu menganalisis jurnal penyesuaian kompleks dan konsep akrual dengan argumentasi akurat.`
          : `Memahami konsep akuntansi dasar dengan baik. Masih memerlukan pengulangan pada akun kontra aset dan rekonsiliasi fiskal koreksi positif/negatif.`
      );

      setFormMentalScore(menScore);
      setFormMentalLevel(menLvl);
      setFormMentalCatatan(
        menScore >= 85
          ? `Ketenangan dan kepercayaan diri sangat prima saat sesi wawancara dan presentasi. Mampu berpikir cepat saat diberikan pertanyaan studi kasus tak terduga.`
          : `Cukup tenang dan fokus, namun perlu dilatih menghadapi tekanan simulasi waktu lomba agar tidak ragu-ragu saat menjawab pertanyaan lisan.`
      );

      setFormAplikasiScore(appScore);
      setFormAplikasiLevel(appLvl);
      setFormAplikasiCatatan(
        appScore >= 85
          ? `Sangat mahir mengoperasikan Accurate Online (AOL) dan Spreadsheet/Excel. Kecepatan entri transaksi dan penggunaan formula penyeimbang neraca sangat efisien.`
          : `Mampu mengoperasikan modul dasar transaksi AOL. Perlu memperbanyak latihan penggunaan tombol pintas (keyboard shortcut) untuk meningkatkan kecepatan kerja.`
      );

      setFormKetelitianScore(ketScore);
      setFormKetelitianLevel(ketLvl);
      setFormKetelitianCatatan(
        ketScore >= 85
          ? `Tingkat ketelitian sangat tinggi. Neraca saldo dan laporan keuangan seimbang pada percobaan pertama tanpa adanya kesalahan angka terbalik (transposisi).`
          : `Cukup teliti, namun perlu dibiasakan memeriksa kembali akun-akun penyesuaian akhir periode sebelum mencetak lembar kerja.`
      );

      setFormRekomendasi(
        overall >= 80
          ? `Pertahankan konsistensi latihan simulasi tanding pra-LKS. Berikan pengayaan soal HOTS analisis laporan keuangan dan perpajakan badan.`
          : `Jadwalkan pendampingan intensif pada materi jurnal penyesuaian dan drill kecepatan entri transaksi AOL selama 2 pekan ke depan.`
      );

      setFormKesiapanLks(kesiapan);
      setFormTargetFokus(
        overall >= 85 ? 'Kandidat Utama LKS Tingkat Provinsi' : overall >= 75 ? 'Cadangan Unggulan LKS & UKK' : 'Pemantapan Siklus Akuntansi & Remedial'
      );

      setIsGeneratingAiNotes(false);
      showToast('✨ Rekomendasi catatan evaluasi cerdas AI berhasil dirumuskan!');
    }, 600);
  };

  // Toggle selection
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      if (selectedStudentIds.length > 1) {
        setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
      } else {
        showToast('Minimal 1 atau 2 siswa harus dipilih untuk perbandingan.');
      }
    } else {
      if (selectedStudentIds.length < 5) {
        setSelectedStudentIds(prev => [...prev, studentId]);
      } else {
        showToast('Maksimal 5 siswa dapat dibandingkan sekaligus.');
      }
    }
  };

  // Quick preset selector
  const selectAllXI_AKL_1 = () => {
    const akl1Ids = students.filter(s => s.kelas.includes('AKL 1')).map(s => s.student_id).slice(0, 5);
    if (akl1Ids.length > 0) setSelectedStudentIds(akl1Ids);
  };

  const selectTopCandidates = () => {
    // Select top 3 students based on evaluation average
    const sorted = [...students].sort((a, b) => {
      const evalA = evaluations[a.student_id];
      const evalB = evaluations[b.student_id];
      const avgA = evalA ? (evalA.penguasaan_materi.score + evalA.mental.score + evalA.penguasaan_aplikasi.score + evalA.ketelitian.score) / 4 : 0;
      const avgB = evalB ? (evalB.penguasaan_materi.score + evalB.mental.score + evalB.penguasaan_aplikasi.score + evalB.ketelitian.score) / 4 : 0;
      return avgB - avgA;
    });
    setSelectedStudentIds(sorted.slice(0, 3).map(s => s.student_id));
  };

  const filteredStudentsForSelector = classFilter === 'all'
    ? students
    : students.filter(s => s.kelas.toLowerCase().includes(classFilter.toLowerCase()));

  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.student_id));

  // Print Comparison Report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-white ml-2 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 text-emerald-400">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Perbandingan Siswa & Penilaian Khusus Guru
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Evaluasi komparatif multi-dimensi untuk persiapan <strong>LKS Akuntansi & UKK</strong>. Guru dapat memberikan catatan khusus dan penilaian mendalam pada <strong>4 Aspek Utama</strong>: Penguasaan Materi, Kesiapan Mental, Penguasaan Aplikasi (AOL/MYOB/Excel), dan Ketelitian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
              title="Cetak Laporan Perbandingan"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Cetak / Ekspor Laporan
            </button>
            <button
              onClick={selectTopCandidates}
              className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-purple-400" />
              Top 3 Kandidat LKS
            </button>
          </div>
        </div>

        {/* STUDENT SELECTOR PANEL */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pilih Siswa yang Ingin Dibandingkan ({selectedStudentIds.length}/5 Siswa Dipilih):</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Filter Kelas:</span>
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Semua Kelas ({students.length} Siswa)</option>
                <option value="AKL 1">XI AKL 1</option>
                <option value="AKL 2">XI AKL 2</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredStudentsForSelector.map(s => {
              const isSelected = selectedStudentIds.includes(s.student_id);
              const evaluation = evaluations[s.student_id];
              const avgScore = evaluation
                ? Math.round(
                    (evaluation.penguasaan_materi.score +
                      evaluation.mental.score +
                      evaluation.penguasaan_aplikasi.score +
                      evaluation.ketelitian.score) /
                      4
                  )
                : 0;

              return (
                <button
                  key={s.student_id}
                  onClick={() => toggleStudentSelection(s.student_id)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-2xl border transition flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSelected ? '✓' : '+'}
                  </div>
                  <span>{s.nama}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.kelas}
                  </span>
                  {avgScore > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                      isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                    }`}>
                      {avgScore}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'evaluations'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Catatan Khusus 4 Aspek Penilaian Guru
          </button>

          <button
            onClick={() => setActiveTab('visual_chart')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'visual_chart'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Grafik Komparasi 4 Dimensi
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Matriks Progres Tugas LMS (PJDM / AOL / Oral)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATATAN KHUSUS 4 ASPEK PENILAIAN GURU (PRIMARY FEATURE) */}
      {/* ========================================================================= */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          {/* COMPARISON CARDS GRID (1 COLUMN PER STUDENT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {selectedStudents.map(student => {
              const evaluation = evaluations[student.student_id] || {
                student_id: student.student_id,
                penguasaan_materi: { score: 75, level: 'Baik', catatan: 'Pemahaman konsep akuntansi cukup baik.' },
                mental: { score: 75, level: 'Cukup Tenang', catatan: 'Mampu menjaga konsentrasi saat mengerjakan tugas.' },
                penguasaan_aplikasi: { score: 75, level: 'Kompeten', catatan: 'Terampil mengoperasikan Spreadsheet dan AOL.' },
                ketelitian: { score: 75, level: 'Teliti', catatan: 'Pengerjaan jurnal dan buku besar rapi.' },
                rekomendasi_khusus: 'Tingkatkan latihan studi kasus lanjutan.',
                status_kesiapan_lks: 'Dalam Pembinaan',
                target_fokus: 'Pemantapan Siklus Akuntansi',
                updated_at: '-',
                updated_by: 'Guru Pembimbing'
              };

              const avgScore = Math.round(
                (evaluation.penguasaan_materi.score +
                  evaluation.mental.score +
                  evaluation.penguasaan_aplikasi.score +
                  evaluation.ketelitian.score) /
                  4
              );

              return (
                <div
                  key={student.student_id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-purple-500/40 transition"
                >
                  {/* STUDENT HEADER */}
                  <div className="space-y-3 border-b border-slate-800 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={student.nama}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/30 shrink-0"
                        />
                        <div>
                          <h3 className="text-base font-bold text-white leading-snug">{student.nama}</h3>
                          <p className="text-xs text-slate-400 font-semibold">{student.kelas} • Absen #{student.nomor_absen}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEditModal(student.student_id)}
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                        title="Beri / Ubah Penilaian Khusus"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                        Edit Nilai
                      </button>
                    </div>

                    {/* STATUS KESIAPAN LKS & RATA-RATA SKOR */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                          evaluation.status_kesiapan_lks === 'Siap Utama'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : evaluation.status_kesiapan_lks === 'Cadangan Unggulan'
                            ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                            : evaluation.status_kesiapan_lks === 'Dalam Pembinaan'
                            ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {evaluation.status_kesiapan_lks || 'Dalam Pembinaan'}
                      </span>

                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-400 font-semibold">Rata-rata:</span>
                        <span className="text-sm font-black text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                          {avgScore} / 100
                        </span>
                      </div>
                    </div>

                    {evaluation.target_fokus && (
                      <p className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                        <strong className="text-purple-400 font-bold">Target Fokus:</strong> {evaluation.target_fokus}
                      </p>
                    )}
                  </div>

                  {/* 4 DIMENSIONS DETAIL CARDS */}
                  <div className="space-y-3.5 flex-1 text-xs">
                    {/* 1. PENGUASAAN MATERI */}
                    <div className="p-3.5 bg-slate-950/80 border border-blue-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-blue-300">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <span>1. Penguasaan Materi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/40">
                            {evaluation.penguasaan_materi.level}
                          </span>
                          <span className="text-xs font-black text-white">{evaluation.penguasaan_materi.score}</span>
                        </div>
                      </div>
                      {/* Score Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${evaluation.penguasaan_materi.score}%` }}
                        />
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                        "{evaluation.penguasaan_materi.catatan}"
                      </p>
                    </div>

                    {/* 2. MENTAL & SIKAP */}
                    <div className="p-3.5 bg-slate-950/80 border border-rose-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-rose-300">
                          <Brain className="w-4 h-4 text-rose-400" />
                          <span>2. Kesiapan Mental & Sikap</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-500/40">
                            {evaluation.mental.level}
                          </span>
                          <span className="text-xs font-black text-white">{evaluation.mental.score}</span>
                        </div>
                      </div>
                      {/* Score Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${evaluation.mental.score}%` }}
                        />
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                        "{evaluation.mental.catatan}"
                      </p>
                    </div>

                    {/* 3. PENGUASAAN APLIKASI */}
                    <div className="p-3.5 bg-slate-950/80 border border-indigo-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                          <Monitor className="w-4 h-4 text-indigo-400" />
                          <span>3. Penguasaan Aplikasi (AOL/Excel)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                            {evaluation.penguasaan_aplikasi.level}
                          </span>
                          <span className="text-xs font-black text-white">{evaluation.penguasaan_aplikasi.score}</span>
                        </div>
                      </div>
                      {/* Score Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${evaluation.penguasaan_aplikasi.score}%` }}
                        />
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                        "{evaluation.penguasaan_aplikasi.catatan}"
                      </p>
                    </div>

                    {/* 4. KETELITIAN & AKURASI */}
                    <div className="p-3.5 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <Target className="w-4 h-4 text-emerald-400" />
                          <span>4. Ketelitian & Kerapian</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            {evaluation.ketelitian.level}
                          </span>
                          <span className="text-xs font-black text-white">{evaluation.ketelitian.score}</span>
                        </div>
                      </div>
                      {/* Score Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${evaluation.ketelitian.score}%` }}
                        />
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                        "{evaluation.ketelitian.catatan}"
                      </p>
                    </div>
                  </div>

                  {/* REKOMENDASI PEMBINAAN GURU */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                    <strong className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Rekomendasi & Tindak Lanjut Guru:
                    </strong>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {evaluation.rekomendasi_khusus}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span>Penilai: {evaluation.updated_by || 'Guru'}</span>
                      <span>{evaluation.updated_at}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRAFIK KOMPARASI 4 DIMENSI */}
      {/* ========================================================================= */}
      {activeTab === 'visual_chart' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Perbandingan Skor 4 Dimensi Antar Siswa
            </h3>
            <span className="text-xs text-slate-400">Skala 0 - 100 Poin Penilaian Guru</span>
          </div>

          {/* 4 DIMENSIONS BAR CHARTS */}
          <div className="space-y-6">
            {/* DIMENSION 1: PENGUASAAN MATERI */}
            <div className="p-4 bg-slate-950 border border-blue-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  1. Penguasaan Materi (Konsep Akuntansi, Siklus, & Jurnal)
                </span>
              </div>
              <div className="space-y-2">
                {selectedStudents.map(student => {
                  const ev = evaluations[student.student_id]?.penguasaan_materi || { score: 75, level: 'Baik' };
                  return (
                    <div key={student.student_id} className="flex items-center gap-3 text-xs">
                      <span className="w-32 truncate font-semibold text-slate-200">{student.nama}</span>
                      <div className="flex-1 bg-slate-800 h-5 rounded-xl overflow-hidden relative">
                        <div
                          className="bg-blue-500 h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${ev.score}%` }}
                        >
                          <span className="text-[10px] font-black text-slate-950">{ev.score}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-300 font-bold w-24 text-right">{ev.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DIMENSION 2: KESIAPAN MENTAL */}
            <div className="p-4 bg-slate-950 border border-rose-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-rose-400" />
                  2. Kesiapan Mental & Sikap (Ketenangan, Daya Juang, & Wawancara Oral)
                </span>
              </div>
              <div className="space-y-2">
                {selectedStudents.map(student => {
                  const ev = evaluations[student.student_id]?.mental || { score: 75, level: 'Percaya Diri' };
                  return (
                    <div key={student.student_id} className="flex items-center gap-3 text-xs">
                      <span className="w-32 truncate font-semibold text-slate-200">{student.nama}</span>
                      <div className="flex-1 bg-slate-800 h-5 rounded-xl overflow-hidden relative">
                        <div
                          className="bg-rose-500 h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${ev.score}%` }}
                        >
                          <span className="text-[10px] font-black text-slate-950">{ev.score}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-rose-300 font-bold w-24 text-right">{ev.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DIMENSION 3: PENGUASAAN APLIKASI */}
            <div className="p-4 bg-slate-950 border border-indigo-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-400" />
                  3. Penguasaan Aplikasi Komputer Akuntansi (AOL, MYOB, & Spreadsheet)
                </span>
              </div>
              <div className="space-y-2">
                {selectedStudents.map(student => {
                  const ev = evaluations[student.student_id]?.penguasaan_aplikasi || { score: 75, level: 'Kompeten' };
                  return (
                    <div key={student.student_id} className="flex items-center gap-3 text-xs">
                      <span className="w-32 truncate font-semibold text-slate-200">{student.nama}</span>
                      <div className="flex-1 bg-slate-800 h-5 rounded-xl overflow-hidden relative">
                        <div
                          className="bg-indigo-500 h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${ev.score}%` }}
                        >
                          <span className="text-[10px] font-black text-slate-950">{ev.score}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-300 font-bold w-24 text-right">{ev.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DIMENSION 4: KETELITIAN & AKURASI */}
            <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  4. Ketelitian & Kerapian (Keseimbangan Neraca & Pencegahan Error)
                </span>
              </div>
              <div className="space-y-2">
                {selectedStudents.map(student => {
                  const ev = evaluations[student.student_id]?.ketelitian || { score: 75, level: 'Teliti' };
                  return (
                    <div key={student.student_id} className="flex items-center gap-3 text-xs">
                      <span className="w-32 truncate font-semibold text-slate-200">{student.nama}</span>
                      <div className="flex-1 bg-slate-800 h-5 rounded-xl overflow-hidden relative">
                        <div
                          className="bg-emerald-500 h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${ev.score}%` }}
                        >
                          <span className="text-[10px] font-black text-slate-950">{ev.score}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold w-24 text-right">{ev.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MATRIKS PROGRES TUGAS LMS (PJDM / AOL / TEORI / PRESENTASI / ORAL) */}
      {/* ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 overflow-x-auto">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Matriks Progres Kurikulum Akuntansi & Penugasan LMS
          </h3>

          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Modul Pembelajaran</th>
                {selectedStudents.map(s => (
                  <th key={s.student_id} className="px-4 py-3.5 text-center">
                    <div className="font-bold text-white text-xs">{s.nama}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">{s.kelas}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="px-4 py-3.5 font-bold text-blue-400">1. PJDM (Jurnal Dasar & Spreadsheet)</td>
                {selectedStudents.map(s => {
                  const prog = progressList.find(p => p.student_id === s.student_id);
                  return (
                    <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                      {prog?.pjdm_progress || 0}%
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="px-4 py-3.5 font-bold text-indigo-400">2. AOL (Accurate Online & Komputer)</td>
                {selectedStudents.map(s => {
                  const prog = progressList.find(p => p.student_id === s.student_id);
                  return (
                    <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                      {prog?.aol_progress || 0}%
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="px-4 py-3.5 font-bold text-emerald-400">3. Teori Akuntansi & Kuis 60 Topik</td>
                {selectedStudents.map(s => {
                  const prog = progressList.find(p => p.student_id === s.student_id);
                  return (
                    <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                      {prog?.theory_progress || 0}%
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="px-4 py-3.5 font-bold text-purple-400">4. Presentasi Video Studi Kasus</td>
                {selectedStudents.map(s => {
                  const prog = progressList.find(p => p.student_id === s.student_id);
                  return (
                    <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                      {prog?.presentation_progress || 0}%
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="px-4 py-3.5 font-bold text-rose-400">5. Wawancara Lisan (Oral AI Interview)</td>
                {selectedStudents.map(s => {
                  const prog = progressList.find(p => p.student_id === s.student_id);
                  return (
                    <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                      {prog?.oral_progress || 0}%
                    </td>
                  );
                })}
              </tr>

              <tr className="bg-slate-950 font-black">
                <td className="px-4 py-4 text-emerald-400 uppercase">OVERALL PROGRESS LMS</td>
                {selectedStudents.map(s => {
                  const prog = progressList.find(p => p.student_id === s.student_id);
                  return (
                    <td key={s.student_id} className="px-4 py-4 text-center text-amber-400 text-sm font-extrabold">
                      {prog?.overall_progress || 0}%
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT / BERI CATATAN KHUSUS GURU (4 ASPEK LENGKAP) */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Penilaian & Catatan Khusus Siswa
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {students.find(s => s.student_id === editingStudentId)?.nama || 'Siswa'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Berikan penilaian komprehensif pada 4 aspek: Penguasaan Materi, Mental, Penguasaan Aplikasi, dan Ketelitian.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAiNotes}
                  disabled={isGeneratingAiNotes}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  title="Generate otomatis catatan evaluasi cerdas berdasarkan nilai LMS"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAiNotes ? 'Merumuskan AI...' : 'Bantu Rumuskan Catatan AI'}</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              {/* STATUS KESIAPAN & TARGET */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status Kesiapan Lomba / UKK:</label>
                  <select
                    value={formKesiapanLks}
                    onChange={e => setFormKesiapanLks(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 outline-none focus:border-purple-500 cursor-pointer font-semibold"
                  >
                    <option value="Siap Utama">🏆 Siap Utama (Kandidat Juara 1)</option>
                    <option value="Cadangan Unggulan">🥈 Cadangan Unggulan</option>
                    <option value="Dalam Pembinaan">📘 Dalam Pembinaan Rutin</option>
                    <option value="Perlu Pemantapan">⚠️ Perlu Pemantapan & Remedial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Fokus Pembinaan:</label>
                  <input
                    type="text"
                    value={formTargetFokus}
                    onChange={e => setFormTargetFokus(e.target.value)}
                    placeholder="misal: LKS Provinsi / UKK Akuntansi / Olimpiade"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 1. ASPEK PENGUASAAN MATERI */}
              <div className="p-4 bg-slate-950 border border-blue-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-300 text-xs">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>1. Penguasaan Materi (Konsep, Teori, Jurnal, & Siklus)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Skor (0-100):</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formMateriScore}
                      onChange={e => setFormMateriScore(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-blue-500/40 text-white rounded-lg p-1 text-center font-bold"
                    />
                    <select
                      value={formMateriLevel}
                      onChange={e => setFormMateriLevel(e.target.value)}
                      className="bg-slate-900 border border-blue-500/40 text-blue-300 rounded-lg p-1 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Perlu Bimbingan">Perlu Bimbingan</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={formMateriCatatan}
                  onChange={e => setFormMateriCatatan(e.target.value)}
                  placeholder="Catatan guru mengenai penguasaan teori, jurnal penyesuaian, laporan laba rugi, dan pemahaman SAK..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              {/* 2. ASPEK MENTAL & SIKAP */}
              <div className="p-4 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300 text-xs">
                    <Brain className="w-4 h-4 text-rose-400" />
                    <span>2. Kesiapan Mental & Sikap (Ketenangan, Daya Juang, & Presentasi)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Skor (0-100):</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formMentalScore}
                      onChange={e => setFormMentalScore(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-rose-500/40 text-white rounded-lg p-1 text-center font-bold"
                    />
                    <select
                      value={formMentalLevel}
                      onChange={e => setFormMentalLevel(e.target.value)}
                      className="bg-slate-900 border border-rose-500/40 text-rose-300 rounded-lg p-1 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Sangat Tangguh">Sangat Tangguh</option>
                      <option value="Percaya Diri">Percaya Diri</option>
                      <option value="Cukup Tenang">Cukup Tenang</option>
                      <option value="Cemas / Ragu">Cemas / Ragu</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={formMentalCatatan}
                  onChange={e => setFormMentalCatatan(e.target.value)}
                  placeholder="Catatan guru mengenai daya tahan mental di bawah tekanan waktu, artikulasi saat wawancara, dan rasa percaya diri..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-rose-500 text-xs leading-relaxed"
                />
              </div>

              {/* 3. ASPEK PENGUASAAN APLIKASI */}
              <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <span>3. Penguasaan Aplikasi (Accurate Online, MYOB, & Spreadsheet Excel)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Skor (0-100):</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formAplikasiScore}
                      onChange={e => setFormAplikasiScore(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-indigo-500/40 text-white rounded-lg p-1 text-center font-bold"
                    />
                    <select
                      value={formAplikasiLevel}
                      onChange={e => setFormAplikasiLevel(e.target.value)}
                      className="bg-slate-900 border border-indigo-500/40 text-indigo-300 rounded-lg p-1 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Sangat Mahir">Sangat Mahir</option>
                      <option value="Kompeten">Kompeten</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Butuh Latihan">Butuh Latihan</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={formAplikasiCatatan}
                  onChange={e => setFormAplikasiCatatan(e.target.value)}
                  placeholder="Catatan guru mengenai kelancaran input transaksi di AOL, rumus formula Excel, kecepatan navigasi menu..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-indigo-500 text-xs leading-relaxed"
                />
              </div>

              {/* 4. ASPEK KETELITIAN & AKURASI */}
              <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>4. Ketelitian & Kerapian (Keseimbangan Saldo & Ketepatan Angka)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Skor (0-100):</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formKetelitianScore}
                      onChange={e => setFormKetelitianScore(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-emerald-500/40 text-white rounded-lg p-1 text-center font-bold"
                    />
                    <select
                      value={formKetelitianLevel}
                      onChange={e => setFormKetelitianLevel(e.target.value)}
                      className="bg-slate-900 border border-emerald-500/40 text-emerald-300 rounded-lg p-1 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Sangat Teliti">Sangat Teliti</option>
                      <option value="Teliti">Teliti</option>
                      <option value="Cukup Teliti">Cukup Teliti</option>
                      <option value="Sering Teledor / Kurang Balance">Sering Teledor</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={formKetelitianCatatan}
                  onChange={e => setFormKetelitianCatatan(e.target.value)}
                  placeholder="Catatan guru mengenai keseimbangan neraca lajur, ketepatan angka bukti memorial, dan pencegahan salah saji..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 text-xs leading-relaxed"
                />
              </div>

              {/* REKOMENDASI KHUSUS & PEMBINAAN */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Rekomendasi Khusus Guru & Strategi Pembinaan Lanjutan:
                </label>
                <textarea
                  rows={2}
                  required
                  value={formRekomendasi}
                  onChange={e => setFormRekomendasi(e.target.value)}
                  placeholder="Langkah tindak lanjut, materi yang harus diperdalam, atau saran jadwal latihan simulasi khusus..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500 text-xs leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-slate-950 text-xs cursor-pointer shadow-lg transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan Penilaian Khusus Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
