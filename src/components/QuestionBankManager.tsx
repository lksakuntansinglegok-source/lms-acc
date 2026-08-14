import React, { useState } from 'react';
import { Question, Topic, Task, PracticalExercise, PresentationTopicItem } from '../types';
import { PRESENTATION_TOPICS_60 } from '../data/presentationTopicsData';
import { api } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import {
  HelpCircle,
  Search,
  Sparkles,
  Filter,
  Plus,
  BookOpen,
  CheckCircle2,
  X,
  Trash2,
  FileSpreadsheet,
  Video,
  ExternalLink,
  FileText,
  Clock,
  ArrowRight,
  Download,
  Layers,
  Award,
  Mic,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface QuestionBankManagerProps {
  questions: Question[];
  topics: Topic[];
  tasks?: Task[];
  currentUserRole?: 'teacher' | 'student';
  onRefreshData: () => void;
  onStartTask?: (task: Task) => void;
  onNavigateView?: (view: string) => void;
}

// Initial Practical Exercises Catalog
const DEFAULT_PRACTICAL_EXERCISES: PracticalExercise[] = [
  {
    id: 'prak_01',
    topic_id: 'top_01',
    tipe_praktik: 'PJDM',
    judul: 'Praktik PJDM: Analisis 10 Transaksi Bengkel Jaya',
    deskripsi: 'Input 10 transaksi bisnis Bengkel Jaya ke spreadsheet PJDM, posting jurnal umum, dan pastikan Neraca Saldo seimbang.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-bengkel-jaya/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-pjdm-topik01/view',
    deadline: '2026-08-20',
    max_score: 100,
    kompetensi: 'Pengoperasian Jurnal Dasar & Memori (PJDM)'
  },
  {
    id: 'prak_02',
    topic_id: 'top_19',
    tipe_praktik: 'Persediaan',
    judul: 'Praktik Kartu Persediaan Perpetual FIFO PT Sejahtera',
    deskripsi: 'Susun kartu persediaan barang dagang 3 lapis pembelian dan penjualan menggunakan metode FIFO Perpetual & hitung HPP.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-fifo-perpetual/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-fifo/view',
    deadline: '2026-08-25',
    max_score: 100,
    kompetensi: 'Penilaian Persediaan Barang Dagang'
  },
  {
    id: 'prak_03',
    topic_id: 'top_17',
    tipe_praktik: 'Kas Kecil',
    judul: 'Praktik Petty Cash Imprest Fund & Rekonsiliasi Bank 4 Kolom',
    deskripsi: 'Kelola 12 voucher pengeluaran kas kecil metode dana tetap (Imprest) dan selesaikan lembar kerja rekonsiliasi bank PT Akurat.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-petty-cash-reconciliation/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-kas-bank/view',
    deadline: '2026-08-28',
    max_score: 100,
    kompetensi: 'Pengelolaan Kas & Rekonsiliasi Bank'
  },
  {
    id: 'prak_04',
    topic_id: 'top_01',
    tipe_praktik: 'AOL',
    judul: 'Simulasi Akuntansi Online (AOL): Setup Master Barang & Penjualan',
    deskripsi: 'Login ke modul AOL, input master data pelanggan dan barang, lalu posting 5 faktur penjualan kredit.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/01',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-01/view',
    deadline: '2026-08-30',
    max_score: 100,
    kompetensi: 'Akuntansi Online & Komputer Akuntansi'
  },
  {
    id: 'prak_05',
    topic_id: 'top_06',
    tipe_praktik: 'Kertas Kerja',
    judul: 'Praktik Kertas Kerja 10 Kolom & Laporan Keuangan Perusahaan Jasa',
    deskripsi: 'Input jurnal penyesuaian akhir periode ke Kertas Kerja 10 kolom dan susun Laporan Laba Rugi serta Laporan Posisi Keuangan.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-kertas-kerja-10-kolom/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-kertas-kerja/view',
    deadline: '2026-09-02',
    max_score: 100,
    kompetensi: 'Siklus Akuntansi & Laporan Keuangan'
  }
];

// Initial Presentation Topics Catalog
const DEFAULT_PRESENTATION_TOPICS: PresentationTopicItem[] = [
  {
    id: 'pres_top_01',
    topic_id: 'top_01',
    judul_topik: 'Topik #1: Analisis Pengaruh Transaksi Keuangan pada Persamaan Dasar Akuntansi',
    deskripsi: 'Presentasikan analisis komprehensif mengenai bagaimana transaksi investasi awal, utang bank, dan beban operasional memengaruhi keseimbangan Aset = Liabilitas + Ekuitas.',
    poin_utama: [
      '1. Definisi dan komponen utama Aset, Liabilitas, dan Ekuitas.',
      '2. Simulasi 3 studi kasus transaksi nyata pada perusahaan jasa SMK.',
      '3. Pembuktian matematis bahwa kedua sisi neraca selalu seimbang.',
      '4. Solusi pencegahan kesalahan pencatatan transaksi.'
    ],
    link_template_slide: 'https://docs.google.com/presentation/d/1sample-slide-persamaan-akuntansi/edit',
    link_panduan: 'https://drive.google.com/file/d/sample-panduan-presentasi-topik1/view',
    target_durasi: '3 - 5 Menit',
    rubrik: [
      { aspek: 'Penguasaan Materi Persamaan', bobot: 30 },
      { aspek: 'Ketepatan Logika Transaksi', bobot: 25 },
      { aspek: 'Komunikasi & Kejelasan Bahasa', bobot: 25 },
      { aspek: 'Kualitas Slide & Alur Presentasi', bobot: 20 }
    ]
  },
  {
    id: 'pres_top_02',
    topic_id: 'top_19',
    judul_topik: 'Topik #2: Evaluasi Dampak Inflasi pada Metode Persediaan FIFO vs Average',
    deskripsi: 'Bandingkan dan evaluasi dampak penerapan metode FIFO vs Average terhadap HPP (COGS), Laba Bersih, dan Nilai Persediaan Akhir saat harga barang melonjak.',
    poin_utama: [
      '1. Perbedaan mekanisme pencatatan FIFO Perpetual vs Average.',
      '2. Simulasi perhitungan persediaan saat periode harga naik (inflasi).',
      '3. Analisis dampak laba bersih dan efisiensi beban pajak perusahaan.',
      '4. Rekomendasi metode terbaik bagi UMKM / Toko Ritel SMK.'
    ],
    link_template_slide: 'https://docs.google.com/presentation/d/1sample-slide-fifo-average/edit',
    link_panduan: 'https://drive.google.com/file/d/sample-panduan-presentasi-topik19/view',
    target_durasi: '4 - 6 Menit',
    rubrik: [
      { aspek: 'Analisis Komparasi Metode', bobot: 35 },
      { aspek: 'Ketepatan Angka & HPP', bobot: 25 },
      { aspek: 'Kemampuan Menjelaskan Grafik/Tabel', bobot: 20 },
      { aspek: 'Rekomendasi & Kesimpulan Logis', bobot: 20 }
    ]
  },
  {
    id: 'pres_top_03',
    topic_id: 'top_17',
    judul_topik: 'Topik #3: Prosedur Dana Kas Kecil Imprest vs Fluctuating & Rekonsiliasi Bank',
    deskripsi: 'Demonstrasikan alur pengelolaan voucher pengeluaran dana kas kecil dan langkah penyesuaian selisih saldo bank pada laporan perusahaan.',
    poin_utama: [
      '1. Prosedur pembentukan, pengeluaran, dan pengisian kembali dana kas kecil.',
      '2. Perbandingan sistem Dana Tetap (Imprest) vs Dana Tidak Tetap (Fluctuating).',
      '3. Penyebab perbedaan saldo catatan bank vs perusahaan (deposit in transit, NSF check, biaya adm).',
      '4. Langkah penyusunan jurnal penyesuaian rekonsiliasi bank.'
    ],
    link_template_slide: 'https://docs.google.com/presentation/d/1sample-slide-kas-kecil-bank/edit',
    link_panduan: 'https://drive.google.com/file/d/sample-panduan-presentasi-topik17/view',
    target_durasi: '3 - 5 Menit',
    rubrik: [
      { aspek: 'Sistematika Prosedur Kas', bobot: 30 },
      { aspek: 'Penjelasan Jurnal Penyesuaian', bobot: 30 },
      { aspek: 'Retorika & Rasa Percaya Diri', bobot: 20 },
      { aspek: 'Visualisasi Dokumen & Voucher', bobot: 20 }
    ]
  },
  {
    id: 'pres_top_04',
    topic_id: 'top_27',
    judul_topik: 'Topik #4: Analisis Rasio Keuangan & Solvabilitas Laporan Keuangan Perusahaan',
    deskripsi: 'Lakukan analisis rasio likuiditas (Current Ratio, Quick Ratio) dan solvabilitas (Debt to Equity Ratio) pada Laporan Posisi Keuangan perusahaan SMK.',
    poin_utama: [
      '1. Rumus dan metodologi perhitungan Current Ratio, Quick Ratio, dan DER.',
      '2. Interpretasi angka rasio dan tolok ukur kesehatan keuangan industri.',
      '3. Identifikasi potensi risiko kegagalan bayar utang jangka pendek.',
      '4. Solusi strategi penyehatan posisi arus kas perusahaan.'
    ],
    link_template_slide: 'https://docs.google.com/presentation/d/1sample-slide-rasio-keuangan/edit',
    link_panduan: 'https://drive.google.com/file/d/sample-panduan-presentasi-topik27/view',
    target_durasi: '4 - 6 Menit',
    rubrik: [
      { aspek: 'Kedalaman Analisis Rasio', bobot: 35 },
      { aspek: 'Ketepatan Formula & Angka', bobot: 25 },
      { aspek: 'Penyampaian Solusi Keuangan', bobot: 20 },
      { aspek: 'Kualitas Slide & Desain Visual', bobot: 20 }
    ]
  }
];

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questions,
  topics,
  tasks = [],
  currentUserRole = 'teacher',
  onRefreshData,
  onStartTask,
  onNavigateView
}) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'teori' | 'praktik' | 'presentasi'>('teori');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPracticeType, setSelectedPracticeType] = useState<string>('all');

  // Data State for Practical & Presentation (with localStorage persistence)
  const [practicalList, setPracticalList] = useState<PracticalExercise[]>(() => {
    const saved = localStorage.getItem('lms_practical_list');
    return saved ? JSON.parse(saved) : DEFAULT_PRACTICAL_EXERCISES;
  });
  const [presentationTopicsList, setPresentationTopicsList] = useState<PresentationTopicItem[]>(() => {
    const saved = localStorage.getItem('lms_presentation_topics');
    return saved ? JSON.parse(saved) : PRESENTATION_TOPICS_60;
  });

  // Student Practical Link Submissions State
  const [studentPracticalSubmissions, setStudentPracticalSubmissions] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('lms_student_practical_submissions');
    return saved ? JSON.parse(saved) : {};
  });
  const [practicalInputs, setPracticalInputs] = useState<Record<string, string>>({});
  const [practicalTimeInputs, setPracticalTimeInputs] = useState<Record<string, { waktu1: string; waktu2: string; waktu3: string }>>({});

  const getSubData = (pId: string) => {
    const raw = studentPracticalSubmissions[pId];
    if (!raw) return null;
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return { link: raw, waktu1: '', waktu2: '', waktu3: '' };
      }
    }
    return { link: raw, waktu1: '', waktu2: '', waktu3: '' };
  };

  // Foldable List State for Practical & Presentation List
  const [expandedPracticalIds, setExpandedPracticalIds] = useState<Record<string, boolean>>({});
  const [expandedPresTopicIds, setExpandedPresTopicIds] = useState<Record<string, boolean>>({});

  const togglePracticalExpand = (id: string) => {
    setExpandedPracticalIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllPractical = () => {
    const map: Record<string, boolean> = {};
    practicalList.forEach(p => { map[p.id] = true; });
    setExpandedPracticalIds(map);
  };

  const collapseAllPractical = () => {
    setExpandedPracticalIds({});
  };

  const togglePresTopicExpand = (id: string) => {
    setExpandedPresTopicIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllPresTopics = () => {
    const map: Record<string, boolean> = {};
    presentationTopicsList.forEach(pt => { map[pt.id] = true; });
    setExpandedPresTopicIds(map);
  };

  const collapseAllPresTopics = () => {
    setExpandedPresTopicIds({});
  };

  // Direct Audio Recorder State for Oral Interview Question
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(() => {
    return localStorage.getItem('lms_interview_audio_url') || null;
  });
  const [isAudioSubmitted, setIsAudioSubmitted] = useState<boolean>(() => {
    return localStorage.getItem('lms_interview_audio_submitted') === 'true';
  });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<any>(null);

  // AI Question Generator Modal
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genTopicName, setGenTopicName] = useState(topics[0]?.nama_topik || 'Persamaan Dasar Akuntansi');
  const [genDifficulty, setGenDifficulty] = useState<'MIDDLE' | 'HOTS'>('HOTS');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);

  // AI Bulk 40 Questions Import Modal (Teacher Only)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Add Practical Modal
  const [isAddPracticalOpen, setIsAddPracticalOpen] = useState(false);
  const [prakTitle, setPrakTitle] = useState('');
  const [prakTopicId, setPrakTopicId] = useState(topics[0]?.topic_id || 'top_01');
  const [prakType, setPrakType] = useState<'PJDM' | 'AOL' | 'Kas Kecil' | 'Persediaan' | 'Kertas Kerja'>('PJDM');
  const [prakDesc, setPrakDesc] = useState('');
  const [prakSpreadsheetLink, setPrakSpreadsheetLink] = useState('');
  const [prakGuideLink, setPrakGuideLink] = useState('');

  // Add Presentation Topic Modal
  const [isAddPresTopicOpen, setIsAddPresTopicOpen] = useState(false);
  const [presTitle, setPresTitle] = useState('');
  const [presTopicId, setPresTopicId] = useState(topics[0]?.topic_id || 'top_01');
  const [presDesc, setPresDesc] = useState('');
  const [presPointsText, setPresPointsText] = useState('');
  const [presSlideLink, setPresSlideLink] = useState('');

  // Delete State
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [deletingPracticalId, setDeletingPracticalId] = useState<string | null>(null);
  const [deletingPresTopicId, setDeletingPresTopicId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.pertanyaan_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.kompetensi && q.kompetensi.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopicId === 'all' || q.topic_id === selectedTopicId;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  // Filter Practical
  const filteredPractical = practicalList.filter(p => {
    const matchesSearch =
      p.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicId === 'all' || p.topic_id === selectedTopicId;
    const matchesType = selectedPracticeType === 'all' || p.tipe_praktik === selectedPracticeType;

    return matchesSearch && matchesTopic && matchesType;
  });

  // Filter Presentation
  const filteredPresentationTopics = presentationTopicsList.filter(pt => {
    const matchesSearch =
      pt.judul_topik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicId === 'all' || pt.topic_id === selectedTopicId;

    return matchesSearch && matchesTopic;
  });

  const handleGenerateAIQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.generateAIQuestions({
        topic_name: genTopicName,
        difficulty: genDifficulty,
        count: 1
      });
      if (res.questions && res.questions.length > 0) {
        setGeneratedQuestion(res.questions[0]);
      }
    } catch (err) {
      console.error('Failed to generate AI question:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedQuestion = async () => {
    if (!generatedQuestion) return;
    try {
      const targetTopic = topics.find(t => t.nama_topik === genTopicName) || topics[0];
      await api.createQuestion({
        topic_id: targetTopic.topic_id,
        difficulty: genDifficulty,
        pertanyaan_id: generatedQuestion.pertanyaan_id,
        question_en: generatedQuestion.question_en,
        option_a: generatedQuestion.option_a,
        option_b: generatedQuestion.option_b,
        option_c: generatedQuestion.option_c,
        option_d: generatedQuestion.option_d,
        correct_answer: generatedQuestion.correct_answer,
        explanation_id: generatedQuestion.explanation_id,
        explanation_en: generatedQuestion.explanation_en
      });
      onRefreshData();
      setIsGeneratorOpen(false);
      setGeneratedQuestion(null);
    } catch (err) {
      console.error('Failed to save generated question:', err);
    }
  };

  const handleGenerateBulkQuestions = async () => {
    setIsGeneratingBulk(true);
    setImportSuccessMsg(null);
    try {
      const res = await api.generateBulkAIQuestions({ count: 40, difficulty: 'MIDDLE_AND_HOTS' });
      if (res.questions && res.questions.length > 0) {
        setBulkQuestions(res.questions);
        setSelectedQuestionIds(new Set(res.questions.map(q => q.question_id)));
      }
    } catch (err) {
      console.error('Failed to generate bulk AI questions:', err);
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  const handleToggleSelectAllBulk = () => {
    if (selectedQuestionIds.size === bulkQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(bulkQuestions.map(q => q.question_id)));
    }
  };

  const handleToggleSelectQuestion = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedQuestionIds(next);
  };

  const handleSaveBulkImport = async () => {
    const questionsToImport = bulkQuestions.filter(q => selectedQuestionIds.has(q.question_id));
    if (questionsToImport.length === 0) return;

    setIsImporting(true);
    try {
      const res = await api.bulkCreateQuestions(questionsToImport);
      setImportSuccessMsg(`Berhasil mengimpor ${res.count || questionsToImport.length} soal Middle & HOTS ke Bank Soal!`);
      onRefreshData();
      setTimeout(() => {
        setIsBulkImportOpen(false);
        setBulkQuestions([]);
        setImportSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to bulk import questions:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!deletingQuestionId) return;
    setIsDeleting(true);
    try {
      await api.deleteQuestion(deletingQuestionId);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete question:', err);
    } finally {
      setIsDeleting(false);
      setDeletingQuestionId(null);
    }
  };

  // Audio Recorder Functions for Oral Interview Question
  const startAudioRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        localStorage.setItem('lms_interview_audio_url', audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access unavailable or denied, falling back to simulated recorder timer", err);
      // Fallback timer simulation for sandboxed/iframe environments
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const stopAudioRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else if (!recordedAudioUrl) {
      // Fallback simulated audio url
      const sampleAudioUrl = 'https://actions.google.com/sounds/v1/ambiences/office_voices.ogg';
      setRecordedAudioUrl(sampleAudioUrl);
      localStorage.setItem('lms_interview_audio_url', sampleAudioUrl);
    }
  };

  const handleSubmitAudioInterview = () => {
    setIsAudioSubmitted(true);
    localStorage.setItem('lms_interview_audio_submitted', 'true');
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const confirmDeletePractical = () => {
    if (!deletingPracticalId) return;
    setIsDeleting(true);
    const updated = practicalList.filter(p => p.id !== deletingPracticalId);
    setPracticalList(updated);
    localStorage.setItem('lms_practical_list', JSON.stringify(updated));
    setIsDeleting(false);
    setDeletingPracticalId(null);
  };

  const confirmDeletePresTopic = () => {
    if (!deletingPresTopicId) return;
    setIsDeleting(true);
    const updated = presentationTopicsList.filter(pt => pt.id !== deletingPresTopicId);
    setPresentationTopicsList(updated);
    localStorage.setItem('lms_presentation_topics', JSON.stringify(updated));
    setIsDeleting(false);
    setDeletingPresTopicId(null);
  };

  const handleAddPractical = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prakTitle || !prakSpreadsheetLink) return;
    const newItem: PracticalExercise = {
      id: 'prak_' + Date.now(),
      topic_id: prakTopicId,
      judul: prakTitle,
      tipe_praktik: prakType,
      deskripsi: prakDesc || 'Latihan praktik akuntansi mandiri.',
      link_spreadsheet: prakSpreadsheetLink,
      link_petunjuk: prakGuideLink,
      deadline: '2026-09-15',
      max_score: 100,
      kompetensi: 'Praktik Keahlian Akuntansi'
    };
    const updated = [newItem, ...practicalList];
    setPracticalList(updated);
    localStorage.setItem('lms_practical_list', JSON.stringify(updated));
    setIsAddPracticalOpen(false);
    setPrakTitle('');
    setPrakSpreadsheetLink('');
    setPrakGuideLink('');
    setPrakDesc('');
  };

  const handleAddPresTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presTitle) return;
    const pointsArr = presPointsText
      ? presPointsText.split('\n').filter(p => p.trim())
      : ['1. Pemaparan teori dasar', '2. Kasus jurnal', '3. Kesimpulan'];

    const newItem: PresentationTopicItem = {
      id: 'pres_top_' + Date.now(),
      topic_id: presTopicId,
      judul_topik: presTitle,
      deskripsi: presDesc || 'Topik presentasi pilihan akuntansi.',
      required_points: pointsArr,
      middle_hots_case_study: 'Studi kasus analisis praktis akuntansi.',
      poin_utama: pointsArr,
      soal_studi_kasus: 'Studi kasus analisis praktis akuntansi.',
      tipe_soal: 'MIDDLE',
      link_template_slide: presSlideLink || 'https://docs.google.com/presentation',
      target_durasi: '3 - 5 Menit',
      rubrik: [
        { aspek: 'Penguasaan Materi', bobot: 35 },
        { aspek: 'Penyampaian & Komunikasi', bobot: 35 },
        { aspek: 'Kualitas Slide PPT', bobot: 30 }
      ]
    };
    const updated = [newItem, ...presentationTopicsList];
    setPresentationTopicsList(updated);
    localStorage.setItem('lms_presentation_topics', JSON.stringify(updated));
    setIsAddPresTopicOpen(false);
    setPresTitle('');
    setPresDesc('');
    setPresPointsText('');
    setPresSlideLink('');
  };

  const getTopicName = (id: string) => {
    return topics.find(t => t.topic_id === id)?.nama_topik || 'Topik Akuntansi';
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            {currentUserRole === 'teacher'
              ? 'Bank Soal, Link Praktik & Topik Presentasi Akuntansi'
              : 'Bank Soal Teori & Link Praktik Akuntansi'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUserRole === 'teacher'
              ? 'Pusat soal teori bilingual, tautan lembar kerja praktik (PJDM/AOL/Kas Kecil), serta panduan topik presentasi kasus akuntansi.'
              : 'Pusat latihan soal teori akuntansi bilingual dan tautan lembar kerja praktik (PJDM/AOL/Kas Kecil).'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUserRole === 'teacher' && activeTab === 'teori' && (
            <>
              <button
                onClick={() => {
                  setIsBulkImportOpen(true);
                  if (bulkQuestions.length === 0) {
                    handleGenerateBulkQuestions();
                  }
                }}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Layers className="w-4 h-4" />
                Bulk Import 40 Soal AI
              </button>

              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Generate Soal AI
              </button>
            </>
          )}

          {currentUserRole === 'teacher' && activeTab === 'praktik' && (
            <button
              onClick={() => setIsAddPracticalOpen(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Tambah Link Soal Praktik
            </button>
          )}

          {currentUserRole === 'teacher' && activeTab === 'presentasi' && (
            <button
              onClick={() => setIsAddPresTopicOpen(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Tambah Topik Presentasi
            </button>
          )}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center border-b border-slate-800 space-x-2 pb-2">
        <button
          onClick={() => setActiveTab('teori')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'teori'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Soal Teori Akuntansi ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('praktik')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'praktik'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Link Soal Praktik ({practicalList.length})
        </button>

        {currentUserRole === 'teacher' && (
          <button
            onClick={() => setActiveTab('presentasi')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'presentasi'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            Topik-Topik Presentasi ({presentationTopicsList.length})
          </button>
        )}
      </div>

      {/* SEARCH & FILTERS BAR */}
      {activeTab !== 'praktik' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'teori'
                  ? 'Cari soal teori ID/EN...'
                  : 'Cari judul & topik presentasi...'
              }
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
            >
              <option value="all">Semua Topik Akuntansi ({topics.length} Topik Pilihan)</option>
              {topics.map(t => (
                <option key={t.topic_id} value={t.topic_id}>
                  Topik #{t.urutan}: {t.nama_topik}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'teori' && (
            <div>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="all">Semua Tingkat Kesulitan</option>
                <option value="MIDDLE">MIDDLE</option>
                <option value="HOTS">HOTS (Higher Order Thinking)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 1: SOAL TEORI ================= */}
      {activeTab === 'teori' && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Tidak ada soal teori yang cocok dengan filter.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div key={q.question_id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-400">Soal #{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-400">• {getTopicName(q.topic_id)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        q.difficulty === 'HOTS'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      Tingkat: {q.difficulty}
                    </span>
                    {currentUserRole === 'teacher' && (
                      <button
                        onClick={() => setDeletingQuestionId(q.question_id)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white leading-relaxed">{q.pertanyaan_id}</p>
                  <p className="text-xs italic text-emerald-300/80 mt-1 font-sans font-medium">"{q.question_en}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                  <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'A' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    A. {q.option_a}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'B' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    B. {q.option_b}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'C' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    C. {q.option_c}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${q.correct_answer === 'D' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    D. {q.option_d}
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-400">Pembahasan & Kunci Jawaban ({q.correct_answer}):</span>
                  <p className="text-slate-300">{q.explanation_id}</p>
                  <p className="text-emerald-300/80 italic">"{q.explanation_en}"</p>
                </div>

                {/* Student Action */}
                {currentUserRole === 'student' && onStartTask && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const targetTask = tasks.find(t => t.topic_id === q.topic_id && t.task_type === 'Teori');
                        if (targetTask) {
                          onStartTask(targetTask);
                        } else if (onNavigateView) {
                          onNavigateView('quiz_runner');
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Kerjakan Kuis Teori Topik Ini
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TAB 2: LINK SOAL PRAKTIK ================= */}
      {activeTab === 'praktik' && (
        <div className="space-y-4">
          {/* TOOLBAR LIPAT / BUKA SEMUA LIST */}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="font-bold text-slate-300">
              Daftar Link Soal Praktik ({filteredPractical.length} Item)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={expandAllPractical}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Buka Semua Detail
              </button>
              <button
                onClick={collapseAllPractical}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                Lipat Semua
              </button>
            </div>
          </div>

          {filteredPractical.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Belum ada link soal praktik untuk filter ini.
            </div>
          ) : (
            filteredPractical.map(p => {
              const isExpanded = !!expandedPracticalIds[p.id];
              return (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition shadow-sm">
                  {/* FOLDABLE HEADER ROW */}
                  <div
                    onClick={() => togglePracticalExpand(p.id)}
                    className="p-4 bg-slate-900 hover:bg-slate-800/80 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition select-none"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
                      </div>

                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase shrink-0">
                        {p.tipe_praktik}
                      </span>

                      <div className="truncate min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{p.judul}</h3>
                        <p className="text-[11px] text-slate-400 truncate">• {getTopicName(p.topic_id)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
                      {studentPracticalSubmissions[p.id] ? (
                        <span className="text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                          ✓ Dikumpulkan
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs font-mono bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {p.deadline || 'Sesuai Jadwal'}
                        </span>
                      )}

                      {currentUserRole === 'teacher' && (
                        <button
                          onClick={() => setDeletingPracticalId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Hapus Link Soal Praktik"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDABLE BODY CONTENT */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                      <p className="text-xs text-slate-300 leading-relaxed">{p.deskripsi}</p>

                      {/* SINGLE DRIVE LINK FOR SOAL & JOBSHEET */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <a
                          href={p.link_spreadsheet || p.link_petunjuk || 'https://drive.google.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                          Buka Link Drive Soal & Jobsheet Praktik
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* FORM PENGUMPULAN LINK PEKERJAAN SISWA */}
                      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 mt-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Pengumpulan Link Pekerjaan Siswa (Google Drive / Spreadsheet Hasil):
                          </span>
                          {studentPracticalSubmissions[p.id] && (
                            <span className="text-emerald-300 font-bold bg-emerald-950 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                              ✓ Pekerjaan Dikumpulkan
                            </span>
                          )}
                        </div>

                        {(() => {
                          const subData = getSubData(p.id);
                          if (subData) {
                            return (
                              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  <div className="truncate max-w-full">
                                    <span className="text-slate-400 font-semibold block text-[10px]">Tautan Terkirim:</span>
                                    <a
                                      href={subData.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-300 underline font-semibold truncate flex items-center gap-1 hover:text-emerald-200 mt-0.5"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                      {subData.link}
                                    </a>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const copy = { ...studentPracticalSubmissions };
                                      delete copy[p.id];
                                      setStudentPracticalSubmissions(copy);
                                      localStorage.setItem('lms_student_practical_submissions', JSON.stringify(copy));
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer shrink-0 border border-slate-700"
                                  >
                                    Ubah Link / Waktu
                                  </button>
                                </div>

                                {(subData.waktu1 || subData.waktu2 || subData.waktu3) && (
                                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Catatan Waktu Pengerjaan Siswa:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[10px] font-medium">1. Jurnal s.d. Rekap:</span>
                                        <span className="text-emerald-300 font-bold text-xs">{subData.waktu1 || '-'}</span>
                                      </div>
                                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[10px] font-medium">2. Posting BB s.d. Neraca Saldo:</span>
                                        <span className="text-emerald-300 font-bold text-xs">{subData.waktu2 || '-'}</span>
                                      </div>
                                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 block text-[10px] font-medium">3. AJP s.d. Laporan Keuangan:</span>
                                        <span className="text-emerald-300 font-bold text-xs">{subData.waktu3 || '-'}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                const inputVal = practicalInputs[p.id]?.trim();
                                if (!inputVal) return;
                                const times = practicalTimeInputs[p.id] || { waktu1: '', waktu2: '', waktu3: '' };
                                const payload = JSON.stringify({
                                  link: inputVal,
                                  waktu1: times.waktu1 || '',
                                  waktu2: times.waktu2 || '',
                                  waktu3: times.waktu3 || '',
                                  submitted_at: new Date().toISOString()
                                });
                                const updated = { ...studentPracticalSubmissions, [p.id]: payload };
                                setStudentPracticalSubmissions(updated);
                                localStorage.setItem('lms_student_practical_submissions', JSON.stringify(updated));
                              }}
                              className="space-y-3"
                            >
                              <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Link Google Drive / Google Sheets Hasil Pekerjaan: *
                                </label>
                                <input
                                  type="url"
                                  required
                                  placeholder="Tempel/Paste link Google Drive atau Google Sheets hasil pekerjaan Anda di sini..."
                                  value={practicalInputs[p.id] || ''}
                                  onChange={e => setPracticalInputs({ ...practicalInputs, [p.id]: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 placeholder-slate-500"
                                />
                              </div>

                              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  Catatan Waktu Pengerjaan Siklus Akuntansi:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                                      1. Jurnal s.d. Rekap
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Contoh: 45 Menit / 08.00 - 08.45"
                                      value={practicalTimeInputs[p.id]?.waktu1 || ''}
                                      onChange={e =>
                                        setPracticalTimeInputs({
                                          ...practicalTimeInputs,
                                          [p.id]: {
                                            ...(practicalTimeInputs[p.id] || { waktu1: '', waktu2: '', waktu3: '' }),
                                            waktu1: e.target.value
                                          }
                                        })
                                      }
                                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 placeholder-slate-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                                      2. Posting BB s.d. Neraca Saldo
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Contoh: 30 Menit / 08.45 - 09.15"
                                      value={practicalTimeInputs[p.id]?.waktu2 || ''}
                                      onChange={e =>
                                        setPracticalTimeInputs({
                                          ...practicalTimeInputs,
                                          [p.id]: {
                                            ...(practicalTimeInputs[p.id] || { waktu1: '', waktu2: '', waktu3: '' }),
                                            waktu2: e.target.value
                                          }
                                        })
                                      }
                                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 placeholder-slate-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                                      3. AJP s.d. Laporan Keuangan
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Contoh: 60 Menit / 09.15 - 10.15"
                                      value={practicalTimeInputs[p.id]?.waktu3 || ''}
                                      onChange={e =>
                                        setPracticalTimeInputs({
                                          ...practicalTimeInputs,
                                          [p.id]: {
                                            ...(practicalTimeInputs[p.id] || { waktu1: '', waktu2: '', waktu3: '' }),
                                            waktu3: e.target.value
                                          }
                                        })
                                      }
                                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 placeholder-slate-600"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                  Kumpulkan Pekerjaan & Durasi
                                </button>
                              </div>
                            </form>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= TAB 3: TOPIK PRESENTASI & WAWANCARA SUARA ================= */}
      {activeTab === 'presentasi' && currentUserRole === 'teacher' && (
        <div className="space-y-6">
          {/* SPECIAL SECTION: SOAL WAWANCARA TEORI & LISAN WITH DIRECT AUDIO RECORDER */}
          <div className="p-6 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Mic className="w-40 h-40 text-purple-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div>
                <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                  🎙️ Soal Wawancara Presentasi (Middle & HOTS) Berbasis Studi Kasus
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  Topik Wawancara: {topics.find(t => t.topic_id === (selectedTopicId === 'all' ? 'top_01' : selectedTopicId))?.nama_topik || 'Persamaan Dasar Akuntansi'}
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl shrink-0 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Target Suara: 3 - 5 Menit
              </span>
            </div>

            {/* STUDI KASUS DISPLAY */}
            <div className="p-4 bg-slate-950/90 border border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>Studi Kasus Pembahasan Topik Ini:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "PT LKS Utama Indonesia sedang melakukan audit siklus keuangan dan evaluasi laporan keuangan harian. Teknisi akuntansi diminta menganalisis keterkaitan antar dokumen sumber, pencatatan jurnal, hingga pengaruhnya terhadap posisi saldo akhir. Evaluasi ini menjadi dasar wawancara lisan Anda."
              </p>
            </div>

            {/* MIDDLE & HOTS INTERVIEW QUESTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. MIDDLE QUESTION */}
              <div className="p-4 bg-slate-950/80 border border-blue-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-300 uppercase bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded">
                    1. Soal Wawancara Level MIDDLE
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                  "Jelaskan alur prosedur pencatatan dasar dan penyesuaian transaksi untuk topik {topics.find(t => t.topic_id === (selectedTopicId === 'all' ? 'top_01' : selectedTopicId))?.nama_topik} dalam konteks studi kasus PT LKS Utama!"
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-blue-300">Kunci Jawaban Guru:</strong> Penjelasan prosedural, konsep debit/kredit, dan pengaruhnya pada laporan keuangan.
                </div>
              </div>

              {/* 2. HOTS QUESTION */}
              <div className="p-4 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-300 uppercase bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded">
                    2. Soal Wawancara Level HOTS (Analitis & Evaluatif)
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                  "Analisislah dampak keandalan laporan keuangan dan potensi risiko perpajakan/kas jika ditemukan ketidaksesuaian pencatatan pada topik {topics.find(t => t.topic_id === (selectedTopicId === 'all' ? 'top_01' : selectedTopicId))?.nama_topik}, serta berikan solusi koreksinya!"
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-rose-300">Kunci Jawaban Guru:</strong> Evaluasi risiko, dampak finansial/pajak, dan pembuatan jurnal koreksi/penyesuaian yang tepat.
                </div>
              </div>
            </div>

            {/* DIRECT AUDIO RECORDER COMPONENT */}
            <div className="p-5 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : isAudioSubmitted ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold text-slate-200">
                    {isRecording ? 'Sedang Merekam Suara...' : isAudioSubmitted ? 'Pekerjaan Suara Dikumpulkan ✓' : recordedAudioUrl ? 'Rekaman Suara Siap' : 'Belum Merekam Suara'}
                  </span>
                </div>

                <div className="text-sm font-mono font-bold text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-500/30">
                  ⏱️ {formatTime(recordingSeconds)}
                </div>
              </div>

              {/* RECORDER CONTROLS */}
              <div className="flex flex-wrap items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startAudioRecording}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/50"
                  >
                    <Mic className="w-4 h-4" />
                    {recordedAudioUrl ? 'Rekam Ulang Suara' : 'Mulai Rekam Suara Langsung'}
                  </button>
                ) : (
                  <button
                    onClick={stopAudioRecording}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg animate-pulse"
                  >
                    <div className="w-3 h-3 bg-slate-950 rounded-sm" />
                    Hentikan Rekaman
                  </button>
                )}

                {recordedAudioUrl && !isRecording && (
                  <div className="flex-1 min-w-[240px] flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                    <audio controls src={recordedAudioUrl} className="w-full h-8" />
                  </div>
                )}
              </div>

              {recordedAudioUrl && !isAudioSubmitted && (
                <div className="pt-2">
                  <button
                    onClick={handleSubmitAudioInterview}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Kumpulkan Rekaman Suara Wawancara Siswa
                  </button>
                </div>
              )}

              {isAudioSubmitted && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Rekaman suara Anda telah berhasil tersimpan dan terkirim untuk dinilai oleh Guru/Pelatih LKS.</span>
                </div>
              )}
            </div>
          </div>

          {/* TOOLBAR LIPAT / BUKA SEMUA LIST TOPIK PRESENTASI */}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="font-bold text-slate-300">
              Daftar Topik Presentasi ({filteredPresentationTopics.length} Item)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={expandAllPresTopics}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Buka Semua Detail
              </button>
              <button
                onClick={collapseAllPresTopics}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                Lipat Semua
              </button>
            </div>
          </div>

          {/* LIST OF PRESENTATION TOPICS */}
          {filteredPresentationTopics.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Belum ada topik presentasi untuk filter ini.
            </div>
          ) : (
            filteredPresentationTopics.map(pt => {
              const isExpanded = !!expandedPresTopicIds[pt.id];
              return (
                <div key={pt.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition shadow-sm">
                  {/* FOLDABLE HEADER ROW */}
                  <div
                    onClick={() => togglePresTopicExpand(pt.id)}
                    className="p-4 bg-slate-900 hover:bg-slate-800/80 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition select-none"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4" />}
                      </div>

                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase shrink-0">
                        Presentasi
                      </span>

                      <div className="truncate min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{pt.judul_topik}</h3>
                        <p className="text-[11px] text-slate-400 truncate">• {getTopicName(pt.topic_id)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
                      <span className="px-3 py-1 text-xs font-bold rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        Target: {pt.target_durasi || '3-5 Menit'}
                      </span>

                      {currentUserRole === 'teacher' && (
                        <button
                          onClick={() => setDeletingPresTopicId(pt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Hapus Topik Presentasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDABLE BODY CONTENT */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                      <p className="text-xs text-slate-300 leading-relaxed">{pt.deskripsi}</p>

                      {/* POIN UTAMA PRESENTASI */}
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Layers className="w-4 h-4" />
                          Required Points (Poin Wajib Dipaparkan dalam Video):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                          {(pt.required_points || pt.poin_utama || []).map((poin, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{poin}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(pt.middle_hots_case_study || pt.soal_studi_kasus) && (
                        <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                          <div className="font-bold text-amber-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-amber-400" />
                              Middle / HOTS Case Study (Perspektif Juri LKS, Praktisi & Dosen):
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              pt.tipe_soal === 'HOTS' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              Soal {pt.tipe_soal || 'MIDDLE'}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                            {pt.middle_hots_case_study || pt.soal_studi_kasus}
                          </p>
                        </div>
                      )}

                      {/* LINKS & ACTION BUTTONS */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {pt.link_template_slide && (
                          <a
                            href={pt.link_template_slide}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-purple-400" />
                            Download / Buka Template Slide PPT
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {pt.link_panduan && (
                          <a
                            href={pt.link_panduan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            Panduan Presentasi
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= MODAL 1: AI QUESTION GENERATOR ================= */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsGeneratorOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              AI Question Generator (Bilingual Gemini 3.6 Flash)
            </h3>

            <form onSubmit={handleGenerateAIQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Topik Akuntansi SMK:</label>
                <select
                  value={genTopicName}
                  onChange={e => setGenTopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none cursor-pointer"
                >
                  {topics.map(t => (
                    <option key={t.topic_id} value={t.nama_topik}>
                      {t.nama_topik}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Level Kesulitan:</label>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setGenDifficulty('MIDDLE')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${genDifficulty === 'MIDDLE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    MIDDLE
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenDifficulty('HOTS')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${genDifficulty === 'HOTS' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
                  >
                    HOTS (Analitis)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Gemini AI Sedang Menyusun Soal...' : 'Generate Soal Bilingual Now'}
              </button>
            </form>

            {/* Generated Question Preview */}
            {generatedQuestion && (
              <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-emerald-400">Hasil Generate Soal AI:</div>
                <p className="text-white font-medium">{generatedQuestion.pertanyaan_id}</p>
                <p className="text-emerald-300 italic">"{generatedQuestion.question_en}"</p>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={handleSaveGeneratedQuestion}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 cursor-pointer"
                  >
                    Simpan ke Bank Soal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TAMBAH LINK SOAL PRAKTIK ================= */}
      {isAddPracticalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddPracticalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Tambah Link Soal Praktik Baru
            </h3>

            <form onSubmit={handleAddPractical} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Judul Soal Praktik:</label>
                <input
                  type="text"
                  required
                  value={prakTitle}
                  onChange={e => setPrakTitle(e.target.value)}
                  placeholder="misal: Praktik PJDM Rekonsiliasi Kas PT Sukses"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Topik Akuntansi:</label>
                  <select
                    value={prakTopicId}
                    onChange={e => setPrakTopicId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {topics.map(t => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.nama_topik}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipe Praktik:</label>
                  <select
                    value={prakType}
                    onChange={e => setPrakType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="PJDM">PJDM (Jurnal Dasar)</option>
                    <option value="AOL">AOL (Akuntansi Online)</option>
                    <option value="Kas Kecil">Kas Kecil & Bank</option>
                    <option value="Persediaan">Kartu Persediaan</option>
                    <option value="Kertas Kerja">Kertas Kerja 10 Kolom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Link Google Drive (Soal & Jobsheet Praktik):</label>
                <input
                  type="url"
                  required
                  value={prakSpreadsheetLink}
                  onChange={e => setPrakSpreadsheetLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/... atau https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  *Cukup cantumkan 1 tautan Google Drive / Sheets yang berisi berkas soal, bukti transaksi, dan jobsheet pengerjaan siswa.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Deskripsi Singkat Instuksi:</label>
                <textarea
                  rows={3}
                  value={prakDesc}
                  onChange={e => setPrakDesc(e.target.value)}
                  placeholder="Petunjuk instruksi pengerjakan tugas praktik untuk siswa..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPracticalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl bg-emerald-500 text-slate-950 cursor-pointer"
                >
                  Simpan Link Praktik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: TAMBAH TOPIK PRESENTASI ================= */}
      {isAddPresTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddPresTopicOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-400" />
              Tambah Topik Presentasi Baru
            </h3>

            <form onSubmit={handleAddPresTopic} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Judul Topik Presentasi:</label>
                <input
                  type="text"
                  required
                  value={presTitle}
                  onChange={e => setPresTitle(e.target.value)}
                  placeholder="misal: Topik #5: Analisis Penyesuaian Beban Dibayar Dimuka"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Topik Utama Akuntansi:</label>
                <select
                  value={presTopicId}
                  onChange={e => setPresTopicId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none cursor-pointer"
                >
                  {topics.map(t => (
                    <option key={t.topic_id} value={t.topic_id}>
                      {t.nama_topik}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Deskripsi / Studi Kasus:</label>
                <textarea
                  rows={2}
                  value={presDesc}
                  onChange={e => setPresDesc(e.target.value)}
                  placeholder="Gambarkan kasus yang perlu dipresentasikan oleh siswa..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Poin-Poin Utama Wajib Dipaparkan (1 baris per poin):</label>
                <textarea
                  rows={4}
                  value={presPointsText}
                  onChange={e => setPresPointsText(e.target.value)}
                  placeholder="1. Pengenalan konsep penyesuaian&#10;2. Jurnal debit kredit&#10;3. Pengaruh ke laporan laba rugi"
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Link Template Slide PPT / Google Slides (Opsional):</label>
                <input
                  type="url"
                  value={presSlideLink}
                  onChange={e => setPresSlideLink(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPresTopicOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl bg-emerald-500 text-slate-950 cursor-pointer"
                >
                  Simpan Topik Presentasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL BULK IMPORT 40 SOAL AI ================= */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsBulkImportOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Bulk Import 40 Soal AI (Middle & HOTS)
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Guru Fitur Khusus
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Layanan Gemini AI menyusun 40 soal berkualitas tinggi (20 Middle + 20 HOTS) melingkupi 30 topik Akuntansi SMK.
                </p>
              </div>
            </div>

            {importSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {importSuccessMsg}
              </div>
            )}

            {isGeneratingBulk ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>
                  <p className="text-sm font-bold text-white">Gemini AI Sedang Menyusun 40 Soal Akuntansi...</p>
                  <p className="text-xs text-slate-400 mt-1">Mengombinasikan tingkat kesulitan Middle & HOTS untuk 30 Topik Akuntansi SMK.</p>
                </div>
              </div>
            ) : bulkQuestions.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <p className="text-xs text-slate-400">
                  Klik tombol di bawah ini untuk memulai proses pembuatan 40 soal otomatis dengan Gemini AI.
                </p>
                <button
                  onClick={handleGenerateBulkQuestions}
                  className="px-6 py-3 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer inline-flex items-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate 40 Soal AI Sekarang
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col space-y-3">
                {/* Metrics & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs shrink-0">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.size === bulkQuestions.length && bulkQuestions.length > 0}
                        onChange={handleToggleSelectAllBulk}
                        className="rounded accent-purple-500 cursor-pointer"
                      />
                      Pilih Semua ({selectedQuestionIds.size}/{bulkQuestions.length} Soal)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 font-bold border border-slate-800">
                      Total: {bulkQuestions.length} Soal
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      Middle: {bulkQuestions.filter(q => q.difficulty === 'MIDDLE').length}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      HOTS: {bulkQuestions.filter(q => q.difficulty === 'HOTS').length}
                    </span>
                  </div>
                </div>

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {bulkQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIds.has(q.question_id);
                    return (
                      <div
                        key={q.question_id}
                        className={`p-3.5 rounded-xl border transition text-xs space-y-2 ${
                          isSelected
                            ? 'bg-slate-900 border-purple-500/50'
                            : 'bg-slate-950 border-slate-800/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectQuestion(q.question_id)}
                              className="rounded accent-purple-500 cursor-pointer mt-0.5"
                            />
                            <span className="font-bold text-slate-400">#{idx + 1}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                              {getTopicName(q.topic_id)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                q.difficulty === 'HOTS'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 italic font-mono shrink-0">
                            Kompetensi: {q.kompetensi}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-white">{q.pertanyaan_id}</p>
                          <p className="text-emerald-400/90 text-[11px] italic mt-0.5">"{q.question_en}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                          <div className={`p-2 rounded-lg border ${q.correct_answer === 'A' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                            A. {q.option_a}
                          </div>
                          <div className={`p-2 rounded-lg border ${q.correct_answer === 'B' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                            B. {q.option_b}
                          </div>
                          <div className={`p-2 rounded-lg border ${q.correct_answer === 'C' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                            C. {q.option_c}
                          </div>
                          <div className={`p-2 rounded-lg border ${q.correct_answer === 'D' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                            D. {q.option_d}
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 text-[11px] text-slate-400">
                          <span className="font-bold text-emerald-400">Pembahasan: </span>
                          {q.explanation_id}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={handleGenerateBulkQuestions}
                    disabled={isGeneratingBulk}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Regenerate 40 Soal
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkImportOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBulkImport}
                      disabled={isImporting || selectedQuestionIds.size === 0}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {isImporting ? 'Mengimpor Soal...' : `Impor ${selectedQuestionIds.size} Soal Terpilih ke Bank Soal`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE QUESTION MODAL */}
      <ConfirmModal
        isOpen={!!deletingQuestionId}
        title="Hapus Soal Bank Soal"
        message="Apakah Anda yakin ingin menghapus soal teori ini? Soal tidak akan ditampilkan dalam kuis atau latihan siswa lagi."
        isDeleting={isDeleting}
        onConfirm={confirmDeleteQuestion}
        onClose={() => setDeletingQuestionId(null)}
      />

      {/* CONFIRM DELETE PRACTICAL MODAL */}
      <ConfirmModal
        isOpen={!!deletingPracticalId}
        title="Hapus Link Soal Praktik"
        message="Apakah Anda yakin ingin menghapus link soal praktik ini dari katalog?"
        isDeleting={isDeleting}
        onConfirm={confirmDeletePractical}
        onClose={() => setDeletingPracticalId(null)}
      />

      {/* CONFIRM DELETE PRESENTATION TOPIC MODAL */}
      <ConfirmModal
        isOpen={!!deletingPresTopicId}
        title="Hapus Topik Presentasi"
        message="Apakah Anda yakin ingin menghapus topik presentasi ini dari katalog?"
        isDeleting={isDeleting}
        onConfirm={confirmDeletePresTopic}
        onClose={() => setDeletingPresTopicId(null)}
      />
    </div>
  );
};
