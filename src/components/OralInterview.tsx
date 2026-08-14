import React, { useState, useRef, useEffect } from 'react';
import { Topic, OralQuestion, OralSubmission, AIEvalDetail } from '../types';
import { api } from '../services/api';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  CheckCircle2,
  Award,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';

interface OralInterviewProps {
  studentId: string;
  topics: Topic[];
  oralQuestions: OralQuestion[];
  studentOralSubmissions?: OralSubmission[];
  onSubmitted: (submission: OralSubmission) => void;
  onBack: () => void;
}

export const OralInterview: React.FC<OralInterviewProps> = ({
  studentId,
  topics,
  oralQuestions,
  studentOralSubmissions = [],
  onSubmitted,
  onBack
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.topic_id || 'top_01');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  // Local state of student submissions
  const [localSubmissions, setLocalSubmissions] = useState<OralSubmission[]>(studentOralSubmissions);

  useEffect(() => {
    setLocalSubmissions(studentOralSubmissions);
  }, [studentOralSubmissions]);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIEvalDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const currentTopicObj = topics.find(t => t.topic_id === selectedTopicId) || topics[0];

  // Generate 5 mandatory questions for every topic
  const get5TopicQuestions = (topicId: string, topicName: string) => {
    const existing = oralQuestions.filter(q => q.topic_id === topicId);
    
    // Standard 5 mandatory question templates for accounting topics
    const templates = [
      {
        num: 1,
        title: 'Konsep & Definisi Dasar',
        question_id: `Jelaskan definisi utama, fungsi, dan pentingnya pemahaman konsep "${topicName}" dalam siklus akuntansi keuangan!`,
        question_en: `Explain the core definition, purpose, and importance of understanding "${topicName}" in the accounting cycle!`
      },
      {
        num: 2,
        title: 'Analisis Dampak Laporan Keuangan',
        question_id: `Bagaimana analisis Anda terhadap dampak transaksi pada topik "${topicName}" terhadap Posisi Keuangan (Neraca) atau Laporan Laba Rugi?`,
        question_en: `How do you analyze the impact of transactions in "${topicName}" on the Balance Sheet or Income Statement?`
      },
      {
        num: 3,
        title: 'Prosedur Penjurnalan & Posting',
        question_id: `Uraikan aturan debit/kredit serta langkah-langkah prosedural yang harus diterapkan saat mencatat transaksi terkait "${topicName}"!`,
        question_en: `Describe debit/credit rules and procedural steps required when recording transactions related to "${topicName}"!`
      },
      {
        num: 4,
        title: 'Deteksi Kesalahan & Pengendalian',
        question_id: `Apabila terjadi kekeliruan atau ketidakseimbangan pencatatan pada "${topicName}", jelaskan langkah audit dan jurnal koreksi yang tepat!`,
        question_en: `If errors or imbalances occur in "${topicName}", explain the proper audit steps and correcting journal entries!`
      },
      {
        num: 5,
        title: 'Studi Kasus HOTS Analitis',
        question_id: `Berikan analisis kritis Anda mengenai studi kasus nyata pengelolaan "${topicName}" pada perusahaan serta saran perbaikan efisiensinya!`,
        question_en: `Provide your critical analysis of a real case study managing "${topicName}" in a company and your efficiency recommendations!`
      }
    ];

    return templates.map((tmpl, idx) => {
      const match = existing[idx];
      return {
        oral_question_id: match ? match.oral_question_id : `oral_q_${topicId}_${idx + 1}`,
        topic_id: topicId,
        question_number: idx + 1,
        category_title: tmpl.title,
        question_id: match ? match.question_id : tmpl.question_id,
        question_en: match ? match.question_en : tmpl.question_en
      };
    });
  };

  const topicQuestions = get5TopicQuestions(selectedTopicId, currentTopicObj?.nama_topik || 'Persamaan Dasar Akuntansi');
  const activeQuestion = topicQuestions[selectedQuestionIndex] || topicQuestions[0];

  // Calculate daily requirement progress (2 questions per day)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAnsweredSubs = localSubmissions.filter(s => {
    if (!s.submitted_at) return false;
    return s.submitted_at.startsWith(todayStr);
  });
  const todayCount = todayAnsweredSubs.length;
  const DAILY_TARGET = 2;

  // Topic Completion Progress (out of 5 mandatory questions)
  const topicAnsweredSubs = localSubmissions.filter(s => s.topic_id === selectedTopicId);
  const topicAnsweredCount = topicAnsweredSubs.length;

  // Check if a specific question in this topic is answered
  const isQuestionAnswered = (qId: string) => {
    return localSubmissions.some(s => s.oral_question_id === qId || (s.topic_id === selectedTopicId && s.oral_question_id?.endsWith(`_${activeQuestion.question_number}`)));
  };

  const getQuestionSubmission = (qId: string) => {
    return localSubmissions.find(s => s.oral_question_id === qId);
  };

  // Reset recording state when question index changes
  const handleSelectQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setAudioBlob(null);
    setAudioUrl(null);
    setAiResult(null);
    setTranscriptText('');
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setSelectedQuestionIndex(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setAiResult(null);
    setTranscriptText('');
  };

  // Start Voice Recording
  const startRecording = async () => {
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        if (!transcriptText) {
          setTranscriptText(
            `Menurut analisis lisan saya untuk pertanyaan #${activeQuestion.question_number} mengenai ${currentTopicObj?.nama_topik}, hal ini berpengaruh langsung pada pencatatan akuntansi dan Laporan Posisi Keuangan secara sistematis.`
          );
        }
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access unavailable, using simulated audio recording:', err);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    } else {
      setAudioUrl('https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg');
      setTranscriptText(
        `Menurut analisis lisan saya untuk pertanyaan #${activeQuestion.question_number} mengenai ${currentTopicObj?.nama_topik}, hal ini berpengaruh langsung pada pencatatan akuntansi dan Laporan Posisi Keuangan secara sistematis.`
      );
    }
  };

  // Trigger AI Assessment
  const handleEvaluateAI = async () => {
    if (!activeQuestion) return;
    setIsEvaluatingAI(true);
    try {
      const res = await api.evaluateAIOral({
        question_text: activeQuestion.question_id,
        student_transcript: transcriptText || 'Jawaban wawancara lisan siswa.',
        topic_name: currentTopicObj?.nama_topik
      });
      setAiResult(res.eval);
    } catch (err) {
      console.error('Failed to run AI evaluation:', err);
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!activeQuestion) return;
    setIsSubmitting(true);

    try {
      let evalObj = aiResult;
      if (!evalObj) {
        const evalRes = await api.evaluateAIOral({
          question_text: activeQuestion.question_id,
          student_transcript: transcriptText,
          topic_name: currentTopicObj?.nama_topik
        });
        evalObj = evalRes.eval;
      }

      const newSub: Partial<OralSubmission> = {
        student_id: studentId,
        topic_id: selectedTopicId,
        oral_question_id: activeQuestion.oral_question_id,
        audio_url: audioUrl || 'https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg',
        transcript: transcriptText,
        duration_seconds: recordingSeconds || 35,
        ai_score: evalObj.recommended_score,
        teacher_score: evalObj.recommended_score,
        ai_eval: evalObj,
        feedback: evalObj.summary_feedback,
        status: 'pending'
      };

      const created = await api.submitOral(newSub);
      setLocalSubmissions(prev => [...prev, created]);
      onSubmitted(created);

      // Auto advance to next question if available
      if (selectedQuestionIndex < 4) {
        setSelectedQuestionIndex(prev => prev + 1);
        setAudioBlob(null);
        setAudioUrl(null);
        setAiResult(null);
        setTranscriptText('');
      }
    } catch (err) {
      console.error('Failed to submit oral answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingSubForActiveQ = getQuestionSubmission(activeQuestion.oral_question_id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. HEADER & DAILY REQUIREMENT CARD */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Mic className="w-6 h-6 text-emerald-400" />
              AI Oral Assessment (Wawancara Lisan Akuntansi)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Rekam suara Anda untuk menjawab 5 pertanyaan wajib per topik. Target harian siswa: 2 soal/hari.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            Kembali
          </button>
        </div>

        {/* DAILY COMMITMENT & TOPIC PROGRESS STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Target Harian Box */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider block">
                  Kewajiban Target Harian Siswa
                </span>
                <span className="text-base font-black text-white">
                  2 Soal Wawancara / Hari
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-300 block">
                Hari Ini: <span className="text-emerald-400 text-base">{todayCount} / {DAILY_TARGET}</span>
              </span>
              {todayCount >= DAILY_TARGET ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Target Hari Ini Tercapai!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md mt-1">
                  <Clock className="w-3 h-3" /> Kurang {DAILY_TARGET - todayCount} Soal Hari Ini
                </span>
              )}
            </div>
          </div>

          {/* Progres Topik Box */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/40">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-purple-400 tracking-wider block">
                  Total Soal Wajib Per Topik
                </span>
                <span className="text-sm font-bold text-white truncate max-w-[180px] block">
                  Topik #{currentTopicObj.urutan}: {currentTopicObj.nama_topik}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-300 block">
                Progres Topik: <span className="text-purple-400 text-base">{topicAnsweredCount} / 5</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Semua 5 Soal Wajib Dijawab
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOPIC NAVIGATOR PILLS (No Dropdown) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Pilih Topik Akuntansi Pembelajaran:</span>
          <span className="text-emerald-400 text-[11px] font-semibold">{topics.length} Topik Tersedia</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {topics.map(t => {
            const isSelected = t.topic_id === selectedTopicId;
            const tSubs = localSubmissions.filter(s => s.topic_id === t.topic_id);
            const isCompleted = tSubs.length >= 5;

            return (
              <button
                key={t.topic_id}
                onClick={() => handleSelectTopic(t.topic_id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>#{t.urutan} {t.nama_topik}</span>
                {isCompleted ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-slate-900 text-emerald-300' : 'bg-slate-900 text-slate-400'}`}>
                    {tSubs.length}/5
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 5 MANDATORY QUESTIONS STEPPER & WORKFLOW */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg uppercase">
              5 Soal Wajib Topik #{currentTopicObj.urutan}
            </span>
            <h3 className="text-sm font-bold text-white">{currentTopicObj.nama_topik}</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Setiap Hari Wajib Menjawab Minimal 2 Soal
          </span>
        </div>

        {/* 5 QUESTION STEP BUTTONS */}
        <div className="grid grid-cols-5 gap-2">
          {topicQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIndex === idx;
            const isDone = isQuestionAnswered(q.oral_question_id);

            return (
              <button
                key={q.oral_question_id}
                onClick={() => handleSelectQuestion(idx)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg scale-102'
                    : isDone
                    ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 hover:bg-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-xs font-extrabold uppercase">Soal #{q.question_number}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] truncate max-w-full font-semibold opacity-90 hidden sm:block">
                  {q.category_title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE QUESTION CARD & RECORDING WORKFLOW */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 space-y-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                Pertanyaan #{activeQuestion.question_number} dari 5 ({activeQuestion.category_title})
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-relaxed">
                "{activeQuestion.question_id}"
              </h3>
            </div>

            {existingSubForActiveQ && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sudah Dijawab
              </span>
            )}
          </div>

          <p className="text-xs italic text-emerald-300/80 font-sans">
            "{activeQuestion.question_en}"
          </p>

          {/* AUDIO RECORDING CONTROLS */}
          <div className="pt-2 space-y-4">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              {!isRecording && !audioUrl && (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950/50 cursor-pointer animate-pulse"
                >
                  <Mic className="w-5 h-5" />
                  🎙️ Mulai Rekam Jawaban Lisan Soal #{activeQuestion.question_number}
                </button>
              )}

              {isRecording && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-rose-400 font-mono font-extrabold text-sm animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Sedang Merekam: {recordingSeconds}s</span>
                  </div>

                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    ⏹️ Selesai Rekam
                  </button>
                </div>
              )}

              {audioUrl && !isRecording && (
                <div className="flex items-center space-x-3 flex-wrap gap-y-2 justify-center">
                  <audio src={audioUrl} controls className="h-9 rounded-lg border border-slate-700" />

                  <button
                    onClick={() => {
                      setAudioUrl(null);
                      setAudioBlob(null);
                      setAiResult(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    🔄 Rekam Ulang
                  </button>
                </div>
              )}
            </div>

            {/* TRANSCRIPT & AI EVALUATION PREVIEW */}
            {audioUrl && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Transkrip Teks Jawaban Lisan:
                  </label>
                  <textarea
                    rows={3}
                    value={transcriptText}
                    onChange={e => setTranscriptText(e.target.value)}
                    placeholder="Transkrip otomatis rekaman suara Anda..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
                  />
                </div>

                {!aiResult && (
                  <button
                    onClick={handleEvaluateAI}
                    disabled={isEvaluatingAI}
                    className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {isEvaluatingAI ? 'AI Sedang Evaluasi Jawaban...' : 'Cek Evaluasi Otomatis AI'}
                  </button>
                )}

                {/* AI RESULT DISPLAY */}
                {aiResult && (
                  <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-xs text-white">Rekomendasi Skor AI Assessor</h4>
                      </div>
                      <span className="text-lg font-black text-emerald-400">{aiResult.recommended_score}/100</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <strong>Feedback AI:</strong> {aiResult.summary_feedback}
                    </p>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting}
                  className="w-full py-3 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Mengirim Jawaban ke Guru...' : `📤 Kirim Jawaban Soal #${activeQuestion.question_number} ke Guru`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
