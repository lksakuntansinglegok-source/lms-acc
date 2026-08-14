import React, { useState, useRef, useEffect } from 'react';
import { Topic, Material, PresentationSubmission } from '../types';
import { PRESENTATION_TOPICS_60 } from '../data/presentationTopicsData';
import { api } from '../services/api';
import {
  Video,
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  FileText,
  ExternalLink,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Search,
  Layers,
  HelpCircle,
  AlertCircle,
  Radio,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';

interface PresentationModuleProps {
  studentId: string;
  topics: Topic[];
  materials: Material[];
  existingSubmissions: PresentationSubmission[];
  onSubmitted: (sub: PresentationSubmission) => void;
  onBack: () => void;
}

export const PresentationModule: React.FC<PresentationModuleProps> = ({
  studentId,
  topics,
  materials,
  existingSubmissions,
  onSubmitted,
  onBack
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('top_01');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'uncompleted' | 'completed' | 'HOTS' | 'MIDDLE'>('all');
  
  // Submission Form State
  const [presentationLink, setPresentationLink] = useState('');
  const [audioLink, setAudioLink] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // In-Browser Audio Recording State
  const [audioMode, setAudioMode] = useState<'direct' | 'link'>('direct');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Active Presentation Topic Item
  const activePresTopic = PRESENTATION_TOPICS_60.find(p => p.topic_id === selectedTopicId) || PRESENTATION_TOPICS_60[0];
  const activeMaterial = materials.find(m => m.topic_id === selectedTopicId);

  // Schema properties with fallback
  const topicRequiredPoints = activePresTopic.required_points || activePresTopic.poin_utama || [];
  const topicCaseStudy = activePresTopic.middle_hots_case_study || activePresTopic.soal_studi_kasus || '';

  // Check existing submission for this active topic
  const existingSub = existingSubmissions.find(p => p.topic_id === selectedTopicId);

  // Calculate answered stats
  const answeredTopicIds = new Set(existingSubmissions.map(s => s.topic_id));
  const totalAnswered = answeredTopicIds.size;

  // Filtered 60 topics
  const filteredTopics = PRESENTATION_TOPICS_60.filter(pt => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      pt.judul_topik.toLowerCase().includes(q) ||
      pt.topic_id.toLowerCase().includes(q) ||
      pt.deskripsi.toLowerCase().includes(q)
    );
    if (!matchesSearch) return false;

    const isAnswered = answeredTopicIds.has(pt.topic_id);
    if (filterType === 'uncompleted') return !isAnswered;
    if (filterType === 'completed') return isAnswered;
    if (filterType === 'HOTS') return pt.tipe_soal === 'HOTS';
    if (filterType === 'MIDDLE') return pt.tipe_soal === 'MIDDLE';
    return true;
  });

  // Clean up recording on unmount or topic change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSelectTopic = (topicId: string) => {
    // Reset recording if active
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    setMicError(null);
    
    setSelectedTopicId(topicId);
    setIsEditing(false);
    setPresentationLink('');
    setAudioLink('');
    setCatatan('');
  };

  // Start Direct Microphone Recording
  const startRecording = async () => {
    setMicError(null);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const actualType = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualType });
        const objUrl = URL.createObjectURL(blob);
        setRecordedAudioUrl(objUrl);

        // Convert blob to Data URL so it is directly sent to server
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioLink(base64data);
        };
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setMicError(
        'Akses mikrofon tidak dapat dibuka atau ditolak oleh browser. Pastikan izin mikrofon telah diaktifkan, atau gunakan mode "Tempel Link Audio".'
      );
      setIsRecording(false);
    }
  };

  // Stop Direct Microphone Recording
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Reset or Delete recorded audio
  const handleResetRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    setAudioLink('');
    audioChunksRef.current = [];
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentationLink) return;
    if (!audioLink) {
      alert('Mohon rekam suara jawaban Anda terlebih dahulu atau tempelkan link audio studi kasus!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitPresentation({
        student_id: studentId,
        topic_id: selectedTopicId,
        video_url: presentationLink,
        audio_url: audioLink,
        catatan
      });
      onSubmitted(res);
      setPresentationLink('');
      setAudioLink('');
      setCatatan('');
      setRecordedAudioUrl(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to submit presentation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              Standard LKS & Praktisi
            </span>
            <span className="text-xs text-slate-400 font-medium">60 Topik Akuntansi SMK</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-400" />
            Modul & Pengumpulan Presentasi Topik
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilih topik materi, pemaparan poin utama, rekam suara jawaban studi kasus secara langsung, dan kirim tugas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Progres Topik</span>
            <span className="text-sm font-black text-emerald-400">
              {totalAnswered} / 60 Topik Terjawab
            </span>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: TOPICS LIST (SCROLLABLE) & TOPIC CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SCROLLABLE TOPICS LIST */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Pilih Topik Materi ({filteredTopics.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              ✓ = Terjawab
            </span>
          </div>

          {/* FILTER PILLS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Semua ({PRESENTATION_TOPICS_60.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('uncompleted')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                filterType === 'uncompleted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Belum ({60 - totalAnswered})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('completed')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                filterType === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Terjawab ({totalAnswered})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('HOTS')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                filterType === 'HOTS'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-rose-400 hover:text-rose-300 border border-rose-500/30'
              }`}
            >
              HOTS
            </button>
            <button
              type="button"
              onClick={() => setFilterType('MIDDLE')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                filterType === 'MIDDLE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-blue-400 hover:text-blue-300 border border-blue-500/30'
              }`}
            >
              MIDDLE
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari dari 60 topik akuntansi..."
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-purple-500"
            />
          </div>

          {/* SCROLLABLE LIST CONTAINER */}
          <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar flex-1">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Topik tidak ditemukan.
              </div>
            ) : (
              filteredTopics.map(pt => {
                const isSelected = pt.topic_id === selectedTopicId;
                const isAnswered = answeredTopicIds.has(pt.topic_id);

                return (
                  <div
                    key={pt.id}
                    onClick={() => handleSelectTopic(pt.topic_id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500/50 shadow-md'
                        : isAnswered
                        ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200 hover:border-emerald-500/60'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          pt.tipe_soal === 'HOTS' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {pt.tipe_soal || 'MIDDLE'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{pt.topic_id.replace('top_', '')}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold truncate leading-snug">
                        {pt.judul_topik}
                      </h4>
                    </div>

                    {/* STATUS CHECKMARK INDICATOR */}
                    <div className="shrink-0 pt-0.5">
                      {isAnswered ? (
                        <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-lg text-[10px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Terjawab</span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                          Belum
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE TOPIC DETAILS & DUAL SUBMISSION FORM */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* ACTIVE TOPIC HEADER CARD */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                  Detail Materi Presentasi
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {activePresTopic.judul_topik}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Target: {activePresTopic.target_durasi || '3-5 Menit'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activePresTopic.deskripsi}
            </p>

            {/* REQUIRED POINTS (POIN-POIN WAJIB DIPAPARKAN SISWA) */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-400" />
                Required Points (Poin Wajib Dipaparkan):
              </h4>
              <div className="space-y-1.5 text-xs text-slate-200">
                {topicRequiredPoints.map((poin, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{poin}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MIDDLE/HOTS CASE STUDY (SOAL STUDI KASUS JURI LKS & PRAKTISI AKUNTANSI) */}
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Middle / HOTS Case Study (Studi Kasus LKS & Praktisi)
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  activePresTopic.tipe_soal === 'HOTS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  Tipe: {activePresTopic.tipe_soal || 'MIDDLE'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {topicCaseStudy}
              </div>
            </div>

            {/* EXTRA MATERIAL LINKS IF AVAILABLE */}
            {activeMaterial && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {activeMaterial.link_materi && (
                  <a
                    href={activeMaterial.link_materi}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Modul Pembelajaran
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* SUBMISSION FORM CARD */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Send className="w-4 h-4 text-purple-400" />
              Pengumpulan Tugas Presentasi & Rekaman Suara Jawaban
            </h3>

            {existingSub && !isEditing ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Sudah Terjawab / Dikumpulkan ({existingSub.submitted_at})
                  </span>
                  {existingSub.score !== undefined && (
                    <span className="text-sm font-black text-amber-400">
                      Nilai Guru: {existingSub.score}/100
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs text-slate-200 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">1. Link Presentasi Topik:</span>
                    <a
                      href={existingSub.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-300 underline font-mono flex items-center gap-1 mt-0.5 hover:text-purple-200 truncate"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      {existingSub.video_url}
                    </a>
                  </div>

                  {existingSub.audio_url && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-amber-300 font-semibold block text-[10px] flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-amber-400" />
                        2. Rekaman Suara Jawaban Studi Kasus:
                      </span>
                      
                      {/* INLINE HTML5 AUDIO PLAYER */}
                      <audio
                        controls
                        src={existingSub.audio_url}
                        className="w-full h-10 mt-1 rounded-lg border border-slate-800 bg-slate-900"
                      />

                      {!existingSub.audio_url.startsWith('data:audio') && (
                        <a
                          href={existingSub.audio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-300 underline font-mono flex items-center gap-1 text-[11px] hover:text-amber-200 truncate mt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          Buka Tautan Rekaman Audio Luar
                        </a>
                      )}
                    </div>
                  )}

                  {existingSub.catatan && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                      <strong>Catatan Siswa:</strong> {existingSub.catatan}
                    </div>
                  )}
                </div>

                {existingSub.feedback && (
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <strong className="text-emerald-400 block mb-0.5">Feedback Evaluasi Guru:</strong>
                    {existingSub.feedback}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setPresentationLink(existingSub.video_url || '');
                      setAudioLink(existingSub.audio_url || '');
                      if (existingSub.audio_url) {
                        setRecordedAudioUrl(existingSub.audio_url);
                      }
                      setCatatan(existingSub.catatan || '');
                      setIsEditing(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    Ubah Kiriman Tugas
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. PRESENTATION LINK */}
                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-400" />
                    1. Link Presentasi Topik Materi yang Dipilih: *
                  </label>
                  <input
                    type="url"
                    required
                    value={presentationLink}
                    onChange={e => setPresentationLink(e.target.value)}
                    placeholder="Tempel link Google Slides / PPT / Google Drive Video Presentasi..."
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-purple-500 placeholder-slate-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Bisa berupa link Google Slides, PDF Canva, Google Drive, atau YouTube Unlisted.
                  </p>
                </div>

                {/* 2. DIRECT VOICE RECORDING OR LINK */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-amber-400" />
                      2. Rekaman Suara Jawaban Soal Studi Kasus: *
                    </label>

                    {/* SWITCH MODE TOGGLE */}
                    <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setAudioMode('direct')}
                        className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                          audioMode === 'direct'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        Rekam Langsung
                      </button>
                      <button
                        type="button"
                        onClick={() => setAudioMode('link')}
                        className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                          audioMode === 'link'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        Tempel Link
                      </button>
                    </div>
                  </div>

                  {/* DIRECT RECORDING UI */}
                  {audioMode === 'direct' ? (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      {micError && (
                        <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{micError}</span>
                        </div>
                      )}

                      {!isRecording && !recordedAudioUrl && (
                        <div className="text-center py-4 space-y-3">
                          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                            <Mic className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              Rekam Jawaban Studi Kasus Anda Menggunakan Mikrofon
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Jelaskan analisis dan solusi studi kasus topik #{activePresTopic.topic_id.replace('top_', '')} secara lisan (1-3 menit).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={startRecording}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-950/50 flex items-center gap-2 mx-auto cursor-pointer"
                          >
                            <Mic className="w-4 h-4" />
                            Mulai Rekam Suara Langsung
                          </button>
                        </div>
                      )}

                      {/* ACTIVE RECORDING STATE */}
                      {isRecording && (
                        <div className="text-center py-4 space-y-3">
                          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
                            <div className="relative w-14 h-14 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-900/50">
                              <Radio className="w-7 h-7 animate-pulse" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                              Sedang Merekam Suara Jawaban...
                            </span>
                            <div className="text-2xl font-black text-white font-mono">
                              {formatTime(recordingSeconds)}
                            </div>
                          </div>

                          {/* ANIMATED AUDIO WAVE BARS */}
                          <div className="flex items-center justify-center gap-1 h-8">
                            {[16, 28, 12, 32, 20, 26, 14, 30, 22, 18, 32, 14].map((h, idx) => (
                              <div
                                key={idx}
                                style={{ height: `${h}px` }}
                                className="w-1.5 bg-amber-400 rounded-full animate-pulse"
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-950/60 flex items-center gap-2 mx-auto cursor-pointer"
                          >
                            <Square className="w-4 h-4 fill-white" />
                            Hentikan Rekaman
                          </button>
                        </div>
                      )}

                      {/* RECORDED PREVIEW STATE */}
                      {recordedAudioUrl && !isRecording && (
                        <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Rekaman Suara Berhasil Disimpan ({formatTime(recordingSeconds)})
                            </span>
                            <button
                              type="button"
                              onClick={handleResetRecording}
                              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Rekam Ulang
                            </button>
                          </div>

                          {/* HTML5 AUDIO PLAYER PREVIEW */}
                          <audio
                            controls
                            src={recordedAudioUrl}
                            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950"
                          />

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Format: Audio Browser (WebM/MP4)</span>
                            <span className="text-emerald-400 font-semibold">Siap Dikirim Bersama Tugas ✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* EXTERNAL LINK MODE */
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        value={audioLink.startsWith('data:audio') ? '' : audioLink}
                        onChange={e => setAudioLink(e.target.value)}
                        placeholder="Tempel link Google Drive Voice Note / Vocaroo / Audio Jawaban Studi Kasus..."
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-amber-500 placeholder-slate-600"
                      />
                      <p className="text-[10px] text-slate-500">
                        Upload audio rekaman jawaban studi kasus ke Google Drive atau Vocaroo, dan tempelkan link publiknya di sini.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. NOTES */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Catatan Tambahan untuk Guru/Juri (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    placeholder="Tuliskan catatan penjelasan tambahan mengenai pengerjaan Anda..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-purple-500 placeholder-slate-600"
                  />
                </div>

                {/* SUBMIT BUTTONS */}
                <div className="flex items-center gap-3 pt-1">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || isRecording}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl text-white transition cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                      isRecording
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/50'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Mengirim Tugas...' : 'Kirim Link Presentasi & Rekaman Suara Jawaban'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
