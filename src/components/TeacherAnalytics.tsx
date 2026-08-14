import React, { useState } from 'react';
import { StudentProgress, QuizResult, Topic } from '../types';
import { api } from '../services/api';
import {
  TrendingUp,
  Sparkles,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';

interface TeacherAnalyticsProps {
  progressList: StudentProgress[];
  quizResults: QuizResult[];
  topics: Topic[];
}

export const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
  progressList,
  quizResults,
  topics
}) => {
  const [aiReport, setAiReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRunAIAnalytics = async () => {
    setIsGenerating(true);
    try {
      const res = await api.getClassAIAnalytics();
      setAiReport(res.analysis);
    } catch (err) {
      console.error('Failed to run AI analytics:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const avgOverall = Math.round(
    progressList.reduce((acc, p) => acc + p.overall_progress, 0) / (progressList.length || 1)
  );

  const avgMiddle = Math.round(
    quizResults.reduce((acc, r) => acc + (r.middle_score || r.score), 0) / (quizResults.length || 1)
  );

  const avgHOTS = Math.round(
    quizResults.reduce((acc, r) => acc + (r.hots_score || r.score), 0) / (quizResults.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Analitik Performa Kelas & Strategi Remedial AI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi tingkat penguasaan kompetensi akuntansi dan rekomendasi pengajaran berbasis Gemini.
          </p>
        </div>

        <button
          onClick={handleRunAIAnalytics}
          disabled={isGenerating}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Gemini AI Menganalisis...' : 'Generate Laporan AI Kelas'}
        </button>
      </div>

      {/* METRIC COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Progress Keseluruhan</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{avgOverall}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Garis Waktu Kurikulum SMK</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Penguasaan Middle</span>
          <div className="text-3xl font-black text-blue-400 mt-2">{avgMiddle}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Prosedur & Siklus Jurnal</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Penguasaan HOTS</span>
          <div className="text-3xl font-black text-rose-400 mt-2">{avgHOTS}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Analisis Transaksi & Laporan</p>
        </div>
      </div>

      {/* AI STRATEGY REPORT CARD */}
      {aiReport && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
            <Sparkles className="w-5 h-5" />
            <h3>Hasil Laporan AI Guru Analytics</h3>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <strong>Ringkasan Eksekutif:</strong> {aiReport.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Deteksi Dini Risko (Early Warning Alerts)
              </h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {aiReport.early_warnings?.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Rekomendasi Langkah Pengajaran
              </h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {aiReport.teacher_recommendations?.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
