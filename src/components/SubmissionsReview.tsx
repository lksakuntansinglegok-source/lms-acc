import React, { useState } from 'react';
import {
  Submission,
  OralSubmission,
  PresentationSubmission,
  Student,
  Topic
} from '../types';
import { api } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import {
  CheckCircle2,
  Mic,
  Video,
  FileSpreadsheet,
  Play,
  Award,
  Send,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface SubmissionsReviewProps {
  students: Student[];
  submissions: Submission[];
  oralSubmissions: OralSubmission[];
  presentationSubmissions: PresentationSubmission[];
  topics?: Topic[];
  onRefreshData: () => void;
}

export const SubmissionsReview: React.FC<SubmissionsReviewProps> = ({
  students,
  submissions,
  oralSubmissions,
  presentationSubmissions,
  topics = [],
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'oral' | 'presentation' | 'pjdm'>('oral');

  // Grading Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'oral' | 'presentation' | 'task' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStudentName = (id: string) => {
    return students.find(s => s.student_id === id)?.nama || 'Siswa SMK';
  };

  const handleGradeTask = async (sub: Submission) => {
    await api.updateSubmission(sub.submission_id, {
      score: scoreInput,
      feedback: feedbackInput,
      status: 'sudah_dinilai'
    });
    onRefreshData();
    setEditingId(null);
  };

  const handleGradeOral = async (oral: OralSubmission) => {
    await api.updateOralSubmission(oral.oral_submission_id, {
      teacher_score: scoreInput,
      feedback: feedbackInput,
      status: 'reviewed'
    });
    onRefreshData();
    setEditingId(null);
  };

  const handleGradePresentation = async (pres: PresentationSubmission) => {
    await api.updatePresentationSubmission(pres.presentation_id, {
      score: scoreInput,
      feedback: feedbackInput,
      status: 'reviewed'
    });
    onRefreshData();
    setEditingId(null);
  };

  const confirmDeleteTarget = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'oral') {
        await api.deleteOralSubmission(deleteTarget.id);
      } else if (deleteTarget.type === 'presentation') {
        await api.deletePresentationSubmission(deleteTarget.id);
      } else if (deleteTarget.type === 'task') {
        await api.deleteSubmission(deleteTarget.id);
      }
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete submission:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          Modul Penilaian Guru (Task, Oral AI & Video Reviews)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review hasil rekaman wawancara lisan, video presentasi, dan spreadsheet PJDM/AOL seluruh siswa.
        </p>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('oral')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'oral' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            Wawancara Oral AI ({oralSubmissions.length})
          </button>

          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'presentation' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            Video Presentasi ({presentationSubmissions.length})
          </button>

          <button
            onClick={() => setActiveTab('pjdm')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pjdm' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Spreadsheet PJDM & AOL ({submissions.length})
          </button>
        </div>
      </div>

      {/* 1. ORAL SUBMISSIONS REVIEW */}
      {activeTab === 'oral' && (
        <div className="space-y-4">
          {oralSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Belum ada jawaban wawancara lisan yang dikumpulkan oleh siswa.
            </div>
          ) : (
            oralSubmissions.map(o => {
              const topicObj = topics.find(t => t.topic_id === o.topic_id);
              return (
                <div key={o.oral_submission_id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-emerald-500/30 transition shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                          Wawancara Oral
                        </span>
                        <h3 className="font-bold text-sm text-white">{getStudentName(o.student_id)}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Topik: <strong className="text-slate-200">{topicObj?.nama_topik || o.topic_id}</strong> | Waktu Dikirim: {o.submitted_at || 'Terbaru'} | Durasi: {o.duration_seconds || 35}s
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rekomendasi Skor AI</span>
                        <span className="text-lg font-black text-emerald-400">{o.ai_score ?? 85}/100</span>
                      </div>
                      <div className="text-right pl-3 border-l border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Nilai Guru</span>
                        <span className="text-lg font-black text-amber-400">{o.teacher_score ?? 'Belum'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Player for Teacher to Listen */}
                  <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        Rekaman Audio Siswa (Klik Play untuk Mendengarkan):
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Format: WebM / OGG Audio</span>
                    </div>

                    <audio src={o.audio_url} controls className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900" />

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Transkrip Teks Jawaban Lisan:</span>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{o.transcript || 'Siswa merekam jawaban suara lisan.'}"
                      </p>
                    </div>
                  </div>

                  {/* AI Evaluation Rubric Breakdown if available */}
                  {o.ai_eval && (
                    <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                      <div className="font-semibold text-slate-300">Ringkasan Analisis AI Assessor:</div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{o.ai_eval.summary_feedback}</p>
                    </div>
                  )}

                  {/* Grade Control / Correction Form */}
                  {editingId === o.oral_submission_id ? (
                    <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 text-xs shadow-inner">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        Form Koreksi & Penilaian Guru:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Nilai Final Guru (0-100):</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreInput}
                            onChange={e => setScoreInput(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 text-amber-300 rounded-lg p-2 font-black text-sm outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">Catatan Koreksi & Feedback Guru:</label>
                          <input
                            type="text"
                            value={feedbackInput}
                            onChange={e => setFeedbackInput(e.target.value)}
                            placeholder="Tuliskan catatan apresiasi, koreksi konsep, atau masukan untuk siswa..."
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleGradeOral(o)}
                          className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Simpan Nilai & Feedback Guru
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <div className="text-xs text-slate-300">
                        {o.feedback ? (
                          <span>Feedback Guru: <strong className="text-emerald-300 italic">"{o.feedback}"</strong></span>
                        ) : (
                          <span className="text-slate-500 italic">Belum ada catatan koreksi guru.</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(o.oral_submission_id);
                            setScoreInput(o.teacher_score || o.ai_score || 85);
                            setFeedbackInput(o.feedback || '');
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition cursor-pointer flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Koreksi & Beri Nilai
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: o.oral_submission_id, type: 'oral' })}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-rose-500/10"
                          title="Hapus Submission Oral"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. PRESENTATION SUBMISSIONS REVIEW */}
      {activeTab === 'presentation' && (
        <div className="space-y-4">
          {presentationSubmissions.map(p => (
            <div key={p.presentation_id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-white">{getStudentName(p.student_id)}</h3>
                <span className="text-xs text-purple-400 font-bold">{p.submitted_at}</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div>
                  <strong className="text-purple-300">1. Link Presentasi Topik Materi:</strong>{' '}
                  <a href={p.video_url} target="_blank" rel="noreferrer" className="text-purple-400 underline font-mono break-all hover:text-purple-300">
                    {p.video_url || '(Tidak dilampirkan)'}
                  </a>
                </div>
                {p.audio_url && (
                  <div className="space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-400 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5" />
                        2. Rekaman Suara Jawaban Studi Kasus:
                      </strong>
                      {!p.audio_url.startsWith('data:audio') && (
                        <a
                          href={p.audio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-300 underline font-mono text-[11px] hover:text-amber-200"
                        >
                          Buka Link Eksternal
                        </a>
                      )}
                    </div>
                    {/* INLINE AUDIO PLAYER FOR TEACHER */}
                    <audio
                      controls
                      src={p.audio_url}
                      className="w-full h-9 rounded-lg bg-slate-900 border border-slate-800"
                    />
                  </div>
                )}
                {p.catatan && (
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 mt-1">
                    <strong>Catatan Tambahan:</strong> {p.catatan}
                  </div>
                )}
              </div>

              {editingId === p.presentation_id ? (
                <div className="p-3 bg-slate-950 border border-purple-500/30 rounded-xl space-y-2 text-xs">
                  <input
                    type="number"
                    value={scoreInput}
                    onChange={e => setScoreInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2"
                  />
                  <button
                    onClick={() => handleGradePresentation(p)}
                    className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded"
                  >
                    Simpan Nilai Video
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setEditingId(p.presentation_id);
                      setScoreInput(p.score || 85);
                    }}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-pointer"
                  >
                    Beri Nilai ({p.score ?? 'Belum Dinilai'})
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: p.presentation_id, type: 'presentation' })}
                    className="p-2 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    title="Hapus Submission Presentasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. PJDM & AOL SUBMISSIONS */}
      {activeTab === 'pjdm' && (
        <div className="space-y-4">
          {submissions.map(s => (
            <div key={s.submission_id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-white">{getStudentName(s.student_id)}</h3>
                <span className="text-xs text-blue-400 font-bold">{s.submitted_at}</span>
              </div>

              <div className="text-xs text-slate-300">
                <strong>Link Task Spreadsheet:</strong>{' '}
                <a href={s.link} target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">
                  {s.link}
                </a>
              </div>

              {s.catatan_siswa && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-400 block text-[11px]">Catatan & Durasi Pengerjaan Siswa:</span>
                  <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{s.catatan_siswa}</pre>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setEditingId(s.submission_id);
                    setScoreInput(s.score || 90);
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-pointer"
                >
                  Beri Nilai ({s.score ?? 'Belum Dinilai'})
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: s.submission_id, type: 'task' })}
                  className="p-2 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  title="Hapus Submission Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Submission Siswa"
        message="Apakah Anda yakin ingin menghapus data pengumpulan ini? Data nilai dan file submission akan dihapus permanen."
        isDeleting={isDeleting}
        onConfirm={confirmDeleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
