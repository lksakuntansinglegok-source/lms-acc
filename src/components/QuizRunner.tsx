import React, { useState, useEffect } from 'react';
import { Question, Topic, QuizResult } from '../types';
import {
  Clock,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface QuizRunnerProps {
  topic: Topic;
  questions: Question[];
  studentId: string;
  onFinishQuiz: (result: Partial<QuizResult>) => void;
  onBack: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  topic,
  questions,
  studentId,
  onFinishQuiz,
  onBack
}) => {
  // Lang mode: 'bilingual' | 'id' | 'en'
  const [langMode, setLangMode] = useState<'bilingual' | 'id' | 'en'>('bilingual');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.question_id]: option
    }));
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;

    let correctCount = 0;
    let middleCorrect = 0;
    let middleTotal = 0;
    let hotsCorrect = 0;
    let hotsTotal = 0;

    questions.forEach(q => {
      const isCorrect = userAnswers[q.question_id] === q.correct_answer;
      if (q.difficulty === 'HOTS') {
        hotsTotal++;
        if (isCorrect) hotsCorrect++;
      } else {
        middleTotal++;
        if (isCorrect) middleCorrect++;
      }
      if (isCorrect) correctCount++;
    });

    const totalQ = questions.length || 1;
    const scorePercentage = Math.round((correctCount / totalQ) * 100);
    const middleScore = middleTotal > 0 ? Math.round((middleCorrect / middleTotal) * 100) : scorePercentage;
    const hotsScore = hotsTotal > 0 ? Math.round((hotsCorrect / hotsTotal) * 100) : scorePercentage;
    const remedialReq = scorePercentage < (topic.passing_grade || 75);

    const resultObj: QuizResult = {
      result_id: 'res_' + Date.now(),
      student_id: studentId,
      topic_id: topic.topic_id,
      score: scorePercentage,
      total_questions: totalQ,
      correct: correctCount,
      wrong: totalQ - correctCount,
      duration_seconds: 1200 - timeLeft,
      submitted_at: new Date().toLocaleString('id-ID'),
      middle_score: middleScore,
      hots_score: hotsScore,
      remedial_required: remedialReq,
      user_answers: userAnswers
    };

    setIsSubmitted(true);
    setFinalResult(resultObj);
    onFinishQuiz(resultObj);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </button>
          <h2 className="text-xl font-black text-white">Ujian Teori: {topic.nama_topik}</h2>
          <p className="text-xs text-slate-400">Passing Grade: {topic.passing_grade || 75}% • Middle & HOTS Competency Test</p>
        </div>

        {/* Controls: Timer & Language switcher */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 flex items-center space-x-1">
            <button
              onClick={() => setLangMode('bilingual')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                langMode === 'bilingual' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual (ID+EN)
            </button>
            <button
              onClick={() => setLangMode('id')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                langMode === 'id' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Indonesia
            </button>
            <button
              onClick={() => setLangMode('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                langMode === 'en' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Countdown timer */}
          {!isSubmitted && (
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* QUIZ IN-PROGRESS VIEW */}
      {!isSubmitted && currentQ && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Question Card */}
          <div className="md:col-span-3 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Soal #{currentIndex + 1} dari {questions.length}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    currentQ.difficulty === 'HOTS'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  Tingkat: {currentQ.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                {(langMode === 'bilingual' || langMode === 'id') && (
                  <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                    {currentQ.pertanyaan_id}
                  </p>
                )}
                {(langMode === 'bilingual' || langMode === 'en') && (
                  <p className="text-xs sm:text-sm italic text-emerald-300/90 leading-relaxed font-sans">
                    "{currentQ.question_en}"
                  </p>
                )}
              </div>

              {/* Options A, B, C, D */}
              <div className="mt-6 space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map(opt => {
                  const optionKey = `option_${opt.toLowerCase()}` as keyof Question;
                  const optionText = currentQ[optionKey];
                  const isSelected = userAnswers[currentQ.question_id] === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectAnswer(opt)}
                      className={`w-full p-4 rounded-xl text-left border transition flex items-start space-x-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white font-semibold'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {opt}
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed mt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  Selesaikan Ujian
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Question Palette Drawer */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Navigasi Soal</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.question_id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.question_id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition border cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-500/50'
                        : isAnswered
                        ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-600/50 border border-blue-500" />
                <span>Sudah Dijawab ({Object.keys(userAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                <span>Belum Dijawab ({questions.length - Object.keys(userAnswers).length})</span>
              </div>
            </div>

            <button
              onClick={handleSubmitQuiz}
              className="w-full mt-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-md"
            >
              Kirim Jawaban Sekarang
            </button>
          </div>
        </div>
      )}

      {/* QUIZ RESULTS & DETAILED PEMBAHASAN REPORT */}
      {isSubmitted && finalResult && (
        <div className="space-y-6">
          {/* Result Summary Card */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border shadow-xl text-white ${
              finalResult.remedial_required
                ? 'bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 border-amber-500/40'
                : 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/40'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                      finalResult.remedial_required
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {finalResult.remedial_required ? 'Remedial Wajib' : 'LULUS UJIAN'}
                  </span>
                  <span className="text-xs text-slate-300">Waktu: {Math.floor(finalResult.duration_seconds / 60)} menit</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Hasil Nilai Akhir: <span className="text-amber-400">{finalResult.score}%</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Target Passing Grade: {topic.passing_grade || 75}% • Jumlah Soal Benar: {finalResult.correct} dari {finalResult.total_questions}
                </p>
              </div>

              {/* Middle vs HOTS Breakdowns */}
              <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-center px-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Nilai Middle</div>
                  <div className="text-lg font-extrabold text-blue-400">{finalResult.middle_score}%</div>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center px-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Nilai HOTS</div>
                  <div className="text-lg font-extrabold text-rose-400">{finalResult.hots_score}%</div>
                </div>
              </div>
            </div>

            {/* Alert if Remedial */}
            {finalResult.remedial_required && (
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-300">Perhatian Remedial Required:</strong> Nilai Anda di bawah passing grade ({topic.passing_grade || 75}%). Silakan pelajari kembali pembahasan di bawah ini dan ambil ujian ulang remedial.
                </div>
              </div>
            )}
          </div>

          {/* Detailed Pembahasan / Explanations for all questions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Pembahasan Lengkap Bilingual
            </h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAns = finalResult.user_answers?.[q.question_id];
                const isCorrect = userAns === q.correct_answer;

                return (
                  <div
                    key={q.question_id}
                    className={`p-5 rounded-xl border ${
                      isCorrect ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-rose-950/20 border-rose-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-300">Soal #{idx + 1}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 font-bold text-xs">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Benar
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Salah
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-200">{q.pertanyaan_id}</p>
                    <p className="text-xs italic text-emerald-300/80 mt-1 font-sans">"{q.question_en}"</p>

                    <div className="mt-3 text-xs space-y-1">
                      <div className="text-slate-400">
                        Jawaban Anda: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{userAns || 'Tidak Dijawab'}</strong>
                      </div>
                      <div className="text-slate-300">
                        Jawaban Benar: <strong className="text-emerald-400">{q.correct_answer}</strong>
                      </div>
                    </div>

                    {/* Pembahasan Box */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-2 text-xs">
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <HelpCircle className="w-4 h-4" />
                        Pembahasan (Bahasa Indonesia):
                      </div>
                      <p className="text-slate-300 leading-relaxed">{q.explanation_id}</p>
                      <div className="pt-2 border-t border-slate-700/60 font-bold text-emerald-300 flex items-center gap-1">
                        Explanation (English):
                      </div>
                      <p className="text-slate-300 italic leading-relaxed font-sans">{q.explanation_en}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              Selesai & Kembali ke Dashboard
            </button>

            {finalResult.remedial_required && (
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setUserAnswers({});
                  setTimeLeft(1200);
                  setCurrentIndex(0);
                }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi Ujian Remedial
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
