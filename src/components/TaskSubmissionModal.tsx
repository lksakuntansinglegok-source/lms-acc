import React, { useState, useEffect } from 'react';
import { Task, Submission } from '../types';
import { api } from '../services/api';
import { X, Send, FileSpreadsheet, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface TaskSubmissionModalProps {
  task: Task;
  studentId: string;
  existingSub?: Submission;
  onClose: () => void;
  onSubmitted: (sub: Submission) => void;
}

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
  task,
  studentId,
  existingSub,
  onClose,
  onSubmitted
}) => {
  const [link, setLink] = useState(existingSub?.link || '');
  const [catatan, setCatatan] = useState(existingSub?.catatan_siswa || '');
  const [waktu1, setWaktu1] = useState('');
  const [waktu2, setWaktu2] = useState('');
  const [waktu3, setWaktu3] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingSub?.catatan_siswa) {
      const raw = existingSub.catatan_siswa;
      const m1 = raw.match(/1\. Jurnal s\.d\. Rekap:\s*(.*)/);
      const m2 = raw.match(/2\. Posting BB s\.d\. Neraca Saldo:\s*(.*)/);
      const m3 = raw.match(/3\. AJP s\.d\. Laporan Keuangan:\s*(.*)/);
      if (m1) setWaktu1(m1[1].trim());
      if (m2) setWaktu2(m2[1].trim());
      if (m3) setWaktu3(m3[1].trim());
    }
  }, [existingSub]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    setIsSubmitting(true);

    const timeLogs = [
      waktu1 ? `1. Jurnal s.d. Rekap: ${waktu1}` : null,
      waktu2 ? `2. Posting BB s.d. Neraca Saldo: ${waktu2}` : null,
      waktu3 ? `3. AJP s.d. Laporan Keuangan: ${waktu3}` : null
    ].filter(Boolean);

    let finalCatatan = catatan;
    if (timeLogs.length > 0) {
      const timeHeader = `[Catatan Waktu Pengerjaan]\n${timeLogs.join('\n')}`;
      const cleanCatatan = catatan.replace(/\[Catatan Waktu Pengerjaan\][\s\S]*?(?=\[Catatan Tambahan\]|$)/g, '').trim();
      finalCatatan = cleanCatatan ? `${timeHeader}\n\n[Catatan Tambahan]\n${cleanCatatan}` : timeHeader;
    }

    try {
      const res = await api.submitTask({
        student_id: studentId,
        task_id: task.task_id,
        topic_id: task.topic_id,
        link,
        catatan_siswa: finalCatatan
      });
      onSubmitted(res);
      onClose();
    } catch (err) {
      console.error('Failed to submit task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {task.task_type} Task
          </span>
          <h3 className="text-lg font-bold text-white mt-1">{task.judul}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.deskripsi}</p>
        </div>

        {/* Material & Template Links */}
        {(task.link_materi || task.link_tugas) && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            {task.link_materi && (
              <a
                href={task.link_materi}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Buka Panduan & Modul Materi Task
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {task.link_tugas && (
              <a
                href={task.link_tugas}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Buka Template Task Spreadsheet / AOL
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Existing Submission Details if any */}
        {existingSub && existingSub.status === 'sudah_dinilai' ? (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Sudah Dinilai Guru
              </span>
              <span className="text-sm font-black text-amber-400">Nilai: {existingSub.score}/100</span>
            </div>
            <p><strong>Link Tugas:</strong> <a href={existingSub.link} target="_blank" rel="noreferrer" className="text-blue-400 underline">{existingSub.link}</a></p>
            {existingSub.catatan_siswa && (
              <p className="bg-slate-900/80 p-2 rounded border border-slate-800 font-mono text-[11px] whitespace-pre-wrap">
                {existingSub.catatan_siswa}
              </p>
            )}
            {existingSub.feedback && <p className="bg-slate-900 p-2 rounded border border-slate-800"><strong>Feedback Guru:</strong> {existingSub.feedback}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Link Hasil Pekerjaan (Google Sheets / Drive Share Link): *
              </label>
              <input
                type="url"
                required
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Waktu Pengerjaan Siklus Akuntansi */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Catatan Waktu Pengerjaan Siklus Akuntansi:
              </label>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    1. Waktu Pengerjaan Jurnal s.d. Rekap:
                  </label>
                  <input
                    type="text"
                    value={waktu1}
                    onChange={e => setWaktu1(e.target.value)}
                    placeholder="Contoh: 45 Menit / 08.00 - 08.45"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    2. Waktu Pengerjaan Posting BB s.d. Neraca Saldo:
                  </label>
                  <input
                    type="text"
                    value={waktu2}
                    onChange={e => setWaktu2(e.target.value)}
                    placeholder="Contoh: 30 Menit / 08.45 - 09.15"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    3. Waktu Pengerjaan AJP s.d. Laporan Keuangan:
                  </label>
                  <input
                    type="text"
                    value={waktu3}
                    onChange={e => setWaktu3(e.target.value)}
                    placeholder="Contoh: 60 Menit / 09.15 - 10.15"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Catatan Pekerjaan Tambahan:
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Tuliskan catatan pengerjaan atau penjelasan tambahan jika ada..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Tugas & Durasi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
