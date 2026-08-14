import React, { useState } from 'react';
import { Student, StudentProgress, ReflectionJournal, Submission, OralSubmission, PresentationSubmission } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileText,
  Video,
  Mic,
  Send,
  MessageSquare,
  Trash2
} from 'lucide-react';

interface StudentProgressViewProps {
  student: Student;
  progress: StudentProgress;
  submissions: Submission[];
  oralSubmissions: OralSubmission[];
  presentationSubmissions: PresentationSubmission[];
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  student,
  progress,
  submissions,
  oralSubmissions,
  presentationSubmissions
}) => {
  const [refleksiText, setRefleksiText] = useState('');
  const [bagianSulitText, setBagianSulitText] = useState('');
  const [rencanaText, setRencanaText] = useState('');
  const [deletingJournalId, setDeletingJournalId] = useState<string | null>(null);

  const [journals, setJournals] = useState<ReflectionJournal[]>([
    {
      id: 'ref_1',
      student_id: student.student_id,
      topic_id: 'top_01',
      refleksi_hari_ini: 'Hari ini saya memahami perbedaan aset lancar dan aset tetap pada jurnal umum.',
      bagian_tersekat: 'Masih sedikit bingung menghitung penyesuaian penyusutan aset tetap.',
      rencana_perbaikan: 'Akan membaca modul top_22 dan melakukan latihan soal HOTS.',
      created_at: '2026-08-11'
    }
  ]);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refleksiText) return;
    const newRef: ReflectionJournal = {
      id: 'ref_' + Date.now(),
      student_id: student.student_id,
      topic_id: 'top_01',
      refleksi_hari_ini: refleksiText,
      bagian_tersekat: bagianSulitText,
      rencana_perbaikan: rencanaText,
      created_at: new Date().toISOString().split('T')[0]
    };
    setJournals(prev => [newRef, ...prev]);
    setRefleksiText('');
    setBagianSulitText('');
    setRencanaText('');
  };

  const confirmDeleteJournal = () => {
    if (deletingJournalId) {
      setJournals(prev => prev.filter(j => j.id !== deletingJournalId));
      setDeletingJournalId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PROGRESS OVERVIEW HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Detail Progress & Portofolio Digital
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Laporan pencapaian kompetensi, portofolio karya terbaik, dan refleksi pembelajaran mandiri.
        </p>

        {/* Competency Strengths vs Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Kekuatan Kompetensi
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
              {progress.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Area Perlu Ditingkatkan
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
              {progress.weaknesses?.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. STUDENT REFLECTION JOURNAL */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Jurnal Refleksi Pembelajaran (Student Reflection Journal)
        </h3>

        <form onSubmit={handleSaveJournal} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Apa yang saya pahami/pelajari hari ini? *
            </label>
            <input
              type="text"
              required
              value={refleksiText}
              onChange={e => setRefleksiText(e.target.value)}
              placeholder="Contoh: Hari ini saya berhasil menyusun neraca saldo seimbang..."
              className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bagian mana yang masih terasa sulit?
              </label>
              <input
                type="text"
                value={bagianSulitText}
                onChange={e => setBagianSulitText(e.target.value)}
                placeholder="Contoh: Penyesuaian beban dibayar dimuka..."
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Rencana perbaikan saya selanjutnya:
              </label>
              <input
                type="text"
                value={rencanaText}
                onChange={e => setRencanaText(e.target.value)}
                placeholder="Contoh: Mencoba kembali latihan soal HOTS..."
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Simpan Catatan Refleksi
          </button>
        </form>

        {/* Reflection Journal History */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riwayat Refleksi Saya:</h4>
          {journals.map(j => (
            <div key={j.id} className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-1.5 text-xs relative">
              <div className="flex items-center justify-between text-slate-400 font-bold">
                <span>Tanggal: {j.created_at}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono">Topik #1</span>
                  <button
                    onClick={() => setDeletingJournalId(j.id)}
                    className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer transition"
                    title="Hapus Refleksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-slate-200"><strong>Pemahaman:</strong> {j.refleksi_hari_ini}</p>

              {j.bagian_tersekat && (
                <p className="text-amber-300"><strong>Kendala:</strong> {j.bagian_tersekat}</p>
              )}
              {j.rencana_perbaikan && (
                <p className="text-emerald-300"><strong>Rencana:</strong> {j.rencana_perbaikan}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. DIGITAL PORTFOLIO GALLERY */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Portofolio Karya Digital Siswa (Kesiapan Kerja SMK)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PJDM / Task Submissions */}
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-blue-400 font-bold text-xs">
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> PJDM & AOL</span>
              <span>{submissions.length} Karya</span>
            </div>
            {submissions.map(s => (
              <div key={s.submission_id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <a href={s.link} target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono truncate block">
                  {s.link}
                </a>
                <span className="text-[10px] text-slate-400">Score: {s.score ?? 'Pending'}</span>
              </div>
            ))}
          </div>

          {/* Presentation Submissions */}
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-purple-400 font-bold text-xs">
              <span className="flex items-center gap-1"><Video className="w-4 h-4" /> Video Presentasi</span>
              <span>{presentationSubmissions.length} Video</span>
            </div>
            {presentationSubmissions.map(p => (
              <div key={p.presentation_id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <a href={p.video_url} target="_blank" rel="noreferrer" className="text-purple-400 underline font-mono truncate block">
                  {p.video_url}
                </a>
                <span className="text-[10px] text-slate-400">Score: {p.score ?? 'Pending'}</span>
              </div>
            ))}
          </div>

          {/* Oral Submissions */}
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
              <span className="flex items-center gap-1"><Mic className="w-4 h-4" /> Wawancara Oral AI</span>
              <span>{oralSubmissions.length} Rekaman</span>
            </div>
            {oralSubmissions.map(o => (
              <div key={o.oral_submission_id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-300 line-clamp-1">"{o.transcript}"</span>
                <span className="text-[10px] text-emerald-400 font-bold">Skor AI: {o.ai_score ?? 85}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingJournalId}
        title="Hapus Catatan Refleksi"
        message="Apakah Anda yakin ingin menghapus catatan refleksi jurnal ini?"
        onConfirm={confirmDeleteJournal}
        onClose={() => setDeletingJournalId(null)}
      />
    </div>
  );
};
