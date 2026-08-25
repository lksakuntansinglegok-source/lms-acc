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
  ChevronUp,
  Check,
  CheckSquare,
  Square,
  Zap,
  Sliders,
  Edit3,
  Edit,
  Loader2,
  Info,
  RotateCcw,
  MessageSquare,
  Sparkle,
  LayoutGrid,
  List,
  Table,
  Eye
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

// Initial Practical Exercises Catalog (Focused on PJDM and AOL)
const DEFAULT_PRACTICAL_EXERCISES: PracticalExercise[] = [
  {
    id: 'prak_01',
    topic_id: 'top_01',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Analisis 10 Transaksi & Siklus Jurnal Bengkel Jaya',
    deskripsi: 'Input 10 transaksi bisnis Bengkel Jaya ke spreadsheet PJDM, posting jurnal umum, buku besar, dan pastikan Neraca Saldo seimbang.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-bengkel-jaya/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-pjdm-topik01/view',
    deadline: '2026-09-15',
    max_score: 100,
    kompetensi: 'Pengoperasian Jurnal Dasar & Memori (PJDM)'
  },
  {
    id: 'prak_02',
    topic_id: 'top_01',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Setup Master Data Barang, Pelanggan & Faktur Penjualan',
    deskripsi: 'Login ke modul software Accurate Online (AOL), buat master data pelanggan dan barang dagang, lalu posting 5 faktur penjualan kredit.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/01',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-01/view',
    deadline: '2026-09-20',
    max_score: 100,
    kompetensi: 'Akuntansi Online (AOL) & Komputer Akuntansi'
  },
  {
    id: 'prak_03',
    topic_id: 'top_01',
    tipe_praktik: 'PJDM & AOL',
    target_types: ['PJDM', 'AOL'],
    judul: 'Praktik PJDM & AOL: Rekonsiliasi Bank & Kertas Kerja Laporan Keuangan',
    deskripsi: 'Kerjakan lembar kerja rekonsiliasi kas bank 4 kolom pada spreadsheet PJDM dan lakukan sinkronisasi mutasi rekening koran pada modul kas bank AOL.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-petty-cash-reconciliation/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-kas-bank/view',
    deadline: '2026-09-25',
    max_score: 100,
    kompetensi: 'Siklus Akuntansi Manual PJDM & Digital AOL'
  },
  {
    id: 'prak_04',
    topic_id: 'top_01',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Kartu Persediaan FIFO Perpetual & Jurnal Penyesuaian',
    deskripsi: 'Susun kartu persediaan barang dagang perpetual FIFO, hitung HPP, dan catat ayat jurnal penyesuaian (AJP) akhir periode.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-fifo-perpetual/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-fifo/view',
    deadline: '2026-09-28',
    max_score: 100,
    kompetensi: 'Penilaian Persediaan & Penyesuaian PJDM'
  },
  {
    id: 'prak_05',
    topic_id: 'top_01',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Siklus Pembelian, PPN Masukan & Pembayaran Kas/Bank',
    deskripsi: 'Proses pesanan pembelian (PO), penerimaan barang dagang, faktur pembelian dengan PPN, serta pembayaran via kas/bank di AOL.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/02',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-02/view',
    deadline: '2026-09-30',
    max_score: 100,
    kompetensi: 'Siklus Pembelian & Kas Bank Accurate Online'
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

  // AI Question Generator State (Manual Topic, Difficulty Selection & Bilingual Support)
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genTopicMode, setGenTopicMode] = useState<'manual' | 'preset'>('manual');
  const [genManualTopic, setGenManualTopic] = useState('Jurnal Penyesuaian Beban & Pendapatan');
  const [genPresetTopicId, setGenPresetTopicId] = useState(topics[0]?.topic_id || 'top_01');
  const [genDifficulty, setGenDifficulty] = useState<'LOTS' | 'MIDDLE' | 'HOTS' | 'KOMBINASI'>('HOTS');
  const [genCount, setGenCount] = useState<number>(5);
  const [genCustomInstructions, setGenCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestionsList, setGeneratedQuestionsList] = useState<Question[]>([]);
  const [selectedGenQuestionIds, setSelectedGenQuestionIds] = useState<Set<string>>(new Set());
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);
  const [genErrorMsg, setGenErrorMsg] = useState<string | null>(null);
  const [isSavingGenQuestions, setIsSavingGenQuestions] = useState(false);

  // AI Bulk 40 Questions Import Modal (Teacher Only)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Add Practical Modal (2 Checklist Options: PJDM & AOL)
  const [isAddPracticalOpen, setIsAddPracticalOpen] = useState(false);
  const [prakTitle, setPrakTitle] = useState('');
  const [prakIsPjdm, setPrakIsPjdm] = useState(true);
  const [prakIsAol, setPrakIsAol] = useState(false);
  const [prakDesc, setPrakDesc] = useState('');
  const [prakSpreadsheetLink, setPrakSpreadsheetLink] = useState('');
  const [prakGuideLink, setPrakGuideLink] = useState('');
  const [isSavingPractical, setIsSavingPractical] = useState(false);

  // Add Presentation Topic Modal & State
  const [isAddPresTopicOpen, setIsAddPresTopicOpen] = useState(false);
  const [presTitle, setPresTitle] = useState('');
  const [presTopicId, setPresTopicId] = useState(topics[0]?.topic_id || 'top_01');
  const [presDesc, setPresDesc] = useState('');
  const [presPointsText, setPresPointsText] = useState('');
  const [presCaseStudy, setPresCaseStudy] = useState('');
  const [presTipeSoal, setPresTipeSoal] = useState<'MIDDLE' | 'HOTS'>('HOTS');
  const [presSlideLink, setPresSlideLink] = useState('');
  const [presGuideLink, setPresGuideLink] = useState('');
  const [presDuration, setPresDuration] = useState('3-5 Menit');
  const [presMiddleQuestion, setPresMiddleQuestion] = useState('');
  const [presMiddleQuestionEn, setPresMiddleQuestionEn] = useState('');
  const [presMiddleExpected, setPresMiddleExpected] = useState('');
  const [presHotsQuestion, setPresHotsQuestion] = useState('');
  const [presHotsQuestionEn, setPresHotsQuestionEn] = useState('');
  const [presHotsExpected, setPresHotsExpected] = useState('');
  const [isGeneratingPresInterviewAddModal, setIsGeneratingPresInterviewAddModal] = useState(false);

  // Edit Presentation Topic Modal & State
  const [isEditPresTopicOpen, setIsEditPresTopicOpen] = useState(false);
  const [editingPresTopicId, setEditingPresTopicId] = useState<string | null>(null);
  const [editPresTitle, setEditPresTitle] = useState('');
  const [editPresTopicId, setEditPresTopicId] = useState(topics[0]?.topic_id || 'top_01');
  const [editPresDesc, setEditPresDesc] = useState('');
  const [editPresPointsText, setEditPresPointsText] = useState('');
  const [editPresCaseStudy, setEditPresCaseStudy] = useState('');
  const [editPresTipeSoal, setEditPresTipeSoal] = useState<'MIDDLE' | 'HOTS'>('HOTS');
  const [editPresSlideLink, setEditPresSlideLink] = useState('');
  const [editPresGuideLink, setEditPresGuideLink] = useState('');
  const [editPresDuration, setEditPresDuration] = useState('3-5 Menit');
  const [editPresMiddleQuestion, setEditPresMiddleQuestion] = useState('');
  const [editPresMiddleQuestionEn, setEditPresMiddleQuestionEn] = useState('');
  const [editPresMiddleExpected, setEditPresMiddleExpected] = useState('');
  const [editPresHotsQuestion, setEditPresHotsQuestion] = useState('');
  const [editPresHotsQuestionEn, setEditPresHotsQuestionEn] = useState('');
  const [editPresHotsExpected, setEditPresHotsExpected] = useState('');
  const [isGeneratingEditInterviewModal, setIsGeneratingEditInterviewModal] = useState(false);

  // Inline AI Interview Generation for Specific Topic Card
  const [generatingInterviewTopicId, setGeneratingInterviewTopicId] = useState<string | null>(null);
  const [isResetDefaultTopicsModalOpen, setIsResetDefaultTopicsModalOpen] = useState(false);
  const [presSuccessToast, setPresSuccessToast] = useState<string | null>(null);

  // Presentation Filters & View Modes
  const [presSearchQuery, setPresSearchQuery] = useState('');
  const [presTopicFilter, setPresTopicFilter] = useState('all');
  const [presLevelFilter, setPresLevelFilter] = useState<'all' | 'MIDDLE' | 'HOTS'>('all');
  const [presInterviewFilter, setPresInterviewFilter] = useState<'all' | 'has_interview' | 'no_interview'>('all');
  const [presViewMode, setPresViewMode] = useState<'list' | 'card' | 'table'>('list');
  const [previewPresTopic, setPreviewPresTopic] = useState<PresentationTopicItem | null>(null);

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

  // Filter Practical (PJDM & AOL)
  const [practicalSearchQuery, setPracticalSearchQuery] = useState('');
  const filteredPractical = practicalList.filter(p => {
    const q = (practicalSearchQuery || searchQuery).toLowerCase();
    const matchesSearch =
      p.judul.toLowerCase().includes(q) ||
      p.deskripsi.toLowerCase().includes(q);
    
    let matchesType = true;
    if (selectedPracticeType === 'PJDM') {
      matchesType =
        p.tipe_praktik === 'PJDM' ||
        p.tipe_praktik === 'PJDM & AOL' ||
        (p.target_types && p.target_types.includes('PJDM')) ||
        p.judul.toUpperCase().includes('PJDM');
    } else if (selectedPracticeType === 'AOL') {
      matchesType =
        p.tipe_praktik === 'AOL' ||
        p.tipe_praktik === 'PJDM & AOL' ||
        (p.target_types && p.target_types.includes('AOL')) ||
        p.judul.toUpperCase().includes('AOL');
    }

    return matchesSearch && matchesType;
  });

  // Filter Presentation
  const filteredPresentationTopics = presentationTopicsList.filter(pt => {
    const q = (presSearchQuery || searchQuery).toLowerCase();
    const matchesSearch =
      pt.judul_topik.toLowerCase().includes(q) ||
      pt.deskripsi.toLowerCase().includes(q) ||
      (pt.middle_hots_case_study && pt.middle_hots_case_study.toLowerCase().includes(q)) ||
      (pt.soal_studi_kasus && pt.soal_studi_kasus.toLowerCase().includes(q)) ||
      pt.topic_id.toLowerCase().includes(q);

    const effTopicFilter = presTopicFilter !== 'all' ? presTopicFilter : (selectedTopicId !== 'all' ? selectedTopicId : 'all');
    const matchesTopic = effTopicFilter === 'all' || pt.topic_id === effTopicFilter;
    const matchesLevel = presLevelFilter === 'all' || pt.tipe_soal === presLevelFilter;
    
    const hasInterview = !!(pt.interview_questions?.middle_question || pt.interview_questions?.hots_question);
    const matchesInterview =
      presInterviewFilter === 'all'
        ? true
        : presInterviewFilter === 'has_interview'
        ? hasInterview
        : !hasInterview;

    return matchesSearch && matchesTopic && matchesLevel && matchesInterview;
  });

  const getEffectiveTopicName = () => {
    if (genTopicMode === 'manual') {
      return genManualTopic.trim() || 'Akuntansi Keuangan SMK';
    }
    const preset = topics.find(t => t.topic_id === genPresetTopicId);
    return preset ? preset.nama_topik : 'Akuntansi Keuangan SMK';
  };

  const getEffectiveTopicId = () => {
    if (genTopicMode === 'preset') {
      return genPresetTopicId;
    }
    const entered = genManualTopic.trim().toLowerCase();
    const matched = topics.find(t => t.nama_topik.toLowerCase() === entered);
    return matched ? matched.topic_id : (topics[0]?.topic_id || 'top_01');
  };

  const handleGenerateAIQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const topicName = getEffectiveTopicName();
    if (!topicName) {
      setGenErrorMsg('Mohon masukkan topik akuntansi terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setGenSuccessMsg(null);
    setGenErrorMsg(null);

    try {
      const res = await api.generateAIQuestions({
        topic_name: topicName,
        topic_id: getEffectiveTopicId(),
        difficulty: genDifficulty,
        count: genCount,
        custom_instructions: genCustomInstructions.trim() || undefined,
        bilingual: true
      });

      if (res.questions && res.questions.length > 0) {
        setGeneratedQuestionsList(res.questions);
        setSelectedGenQuestionIds(new Set(res.questions.map(q => q.question_id)));
      } else {
        setGenErrorMsg('Tidak ada soal yang dihasilkan. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error('Failed to generate AI questions:', err);
      setGenErrorMsg('Gagal membuat soal AI: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelectGenQuestion = (qId: string) => {
    const newSet = new Set(selectedGenQuestionIds);
    if (newSet.has(qId)) {
      newSet.delete(qId);
    } else {
      newSet.add(qId);
    }
    setSelectedGenQuestionIds(newSet);
  };

  const handleToggleSelectAllGen = () => {
    if (selectedGenQuestionIds.size === generatedQuestionsList.length) {
      setSelectedGenQuestionIds(new Set());
    } else {
      setSelectedGenQuestionIds(new Set(generatedQuestionsList.map(q => q.question_id)));
    }
  };

  const handleSaveSelectedGeneratedQuestions = async () => {
    const selectedQuestions = generatedQuestionsList.filter(q => selectedGenQuestionIds.has(q.question_id));
    if (selectedQuestions.length === 0) {
      setGenErrorMsg('Pilih setidaknya satu soal untuk disimpan ke Bank Soal.');
      return;
    }

    setIsSavingGenQuestions(true);
    setGenErrorMsg(null);
    try {
      const effectiveTopicId = getEffectiveTopicId();
      for (const q of selectedQuestions) {
        await api.createQuestion({
          topic_id: q.topic_id || effectiveTopicId,
          difficulty: q.difficulty || (genDifficulty === 'KOMBINASI' ? 'HOTS' : genDifficulty),
          pertanyaan_id: q.pertanyaan_id,
          question_en: q.question_en,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation_id: q.explanation_id,
          explanation_en: q.explanation_en,
          kompetensi: q.kompetensi || `Kompetensi ${getEffectiveTopicName()}`
        });
      }

      onRefreshData();
      setGenSuccessMsg(`Berhasil menambahkan ${selectedQuestions.length} soal teori akuntansi (${getEffectiveTopicName()}) ke Bank Soal!`);
      // Clear saved from preview or reset
      setGeneratedQuestionsList(prev => prev.filter(q => !selectedGenQuestionIds.has(q.question_id)));
      setSelectedGenQuestionIds(new Set());
    } catch (err: any) {
      console.error('Failed to save generated questions:', err);
      setGenErrorMsg('Gagal menyimpan soal ke Bank Soal: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsSavingGenQuestions(false);
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

  const handleAddPractical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prakTitle.trim() || !prakSpreadsheetLink.trim()) return;

    if (!prakIsPjdm && !prakIsAol) {
      alert('Harap centang minimal salah satu tipe praktik (PJDM atau AOL) untuk ditugaskan.');
      return;
    }

    setIsSavingPractical(true);

    const selectedTypes: ('PJDM' | 'AOL')[] = [];
    if (prakIsPjdm) selectedTypes.push('PJDM');
    if (prakIsAol) selectedTypes.push('AOL');

    const tipeStr: 'PJDM' | 'AOL' | 'PJDM & AOL' =
      selectedTypes.length === 2 ? 'PJDM & AOL' : selectedTypes[0];

    const createdTaskIds: string[] = [];

    // Auto-create individual student tasks in Learning Path / Task List for each checked type
    try {
      if (prakIsPjdm) {
        const pjdmTitle = selectedTypes.length === 2
          ? `[PJDM] ${prakTitle}`
          : (prakTitle.toLowerCase().includes('pjdm') ? prakTitle : `Praktik PJDM: ${prakTitle}`);

        const createdPjdm = await api.createTask({
          topic_id: 'top_01',
          task_type: 'PJDM',
          judul: pjdmTitle,
          deskripsi: prakDesc || 'Latihan praktik keahlian siklus akuntansi manual/spreadsheet mandiri.',
          link_tugas: prakSpreadsheetLink,
          link_materi: prakGuideLink || prakSpreadsheetLink,
          deadline: '2026-09-30',
          wajib: true,
          urutan: (tasks?.length || 0) + 1
        });
        if (createdPjdm?.task_id) createdTaskIds.push(createdPjdm.task_id);
      }

      if (prakIsAol) {
        const aolTitle = selectedTypes.length === 2
          ? `[AOL] ${prakTitle}`
          : (prakTitle.toLowerCase().includes('aol') ? prakTitle : `Praktik AOL: ${prakTitle}`);

        const createdAol = await api.createTask({
          topic_id: 'top_01',
          task_type: 'AOL',
          judul: aolTitle,
          deskripsi: prakDesc || 'Latihan simulasi akuntansi online (AOL) mandiri menggunakan software komputer akuntansi.',
          link_tugas: prakSpreadsheetLink,
          link_materi: prakGuideLink || prakSpreadsheetLink,
          deadline: '2026-09-30',
          wajib: true,
          urutan: (tasks?.length || 0) + (prakIsPjdm ? 2 : 1)
        });
        if (createdAol?.task_id) createdTaskIds.push(createdAol.task_id);
      }
    } catch (err) {
      console.error('Error auto-creating tasks for practical:', err);
    }

    const newItem: PracticalExercise = {
      id: 'prak_' + Date.now(),
      topic_id: 'all',
      judul: prakTitle,
      tipe_praktik: tipeStr,
      target_types: selectedTypes,
      deskripsi: prakDesc || 'Latihan praktik akuntansi mandiri.',
      link_spreadsheet: prakSpreadsheetLink,
      link_petunjuk: prakGuideLink,
      deadline: '2026-09-30',
      max_score: 100,
      kompetensi: selectedTypes.length === 2
        ? 'Praktik Keahlian PJDM & AOL'
        : selectedTypes[0] === 'PJDM'
        ? 'Pengoperasian Jurnal Dasar & Memori (PJDM)'
        : 'Akuntansi Online (AOL) & Komputer Akuntansi',
      task_ids: createdTaskIds
    };

    const updated = [newItem, ...practicalList];
    setPracticalList(updated);
    localStorage.setItem('lms_practical_list', JSON.stringify(updated));

    setIsSavingPractical(false);
    setIsAddPracticalOpen(false);
    setPrakTitle('');
    setPrakSpreadsheetLink('');
    setPrakGuideLink('');
    setPrakDesc('');
    setPrakIsPjdm(true);
    setPrakIsAol(false);

    // Refresh application data so new tasks appear on student dashboard immediately
    if (onRefreshData) onRefreshData();
  };

  const handleAddPresTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presTitle) return;
    const pointsArr = presPointsText
      ? presPointsText.split('\n').filter(p => p.trim())
      : [
          '1. Pemaparan konsep & urgensi dalam tata kelola keuangan',
          '2. Mekanisme jurnal, pengakuan, dan perhitungan',
          '3. Penyajian dalam Laporan Keuangan sesuai SAK/PSAK',
          '4. Evaluasi kendala, mitigasi fraud & solusi akuntansi'
        ];

    let interviewObj: any = undefined;
    if (presMiddleQuestion || presHotsQuestion) {
      interviewObj = {
        middle_question: presMiddleQuestion.trim() || 'Jelaskan konsep dasar dan pencatatan debit/kredit terkait topik ini!',
        middle_question_en: presMiddleQuestionEn.trim() || undefined,
        middle_expected_points: presMiddleExpected ? presMiddleExpected.split('\n').filter(p => p.trim()) : undefined,
        hots_question: presHotsQuestion.trim() || 'Bagaimanakah evaluasi kritis dan mitigasi risiko bila terjadi anomali pada pos ini?',
        hots_question_en: presHotsQuestionEn.trim() || undefined,
        hots_expected_points: presHotsExpected ? presHotsExpected.split('\n').filter(p => p.trim()) : undefined
      };
    }

    const newItem: PresentationTopicItem = {
      id: 'pres_top_' + Date.now(),
      topic_id: presTopicId,
      judul_topik: presTitle,
      deskripsi: presDesc || 'Modul presentasi dan analisis studi kasus akuntansi.',
      required_points: pointsArr,
      middle_hots_case_study: presCaseStudy.trim() || 'Studi kasus analisis praktis akuntansi.',
      poin_utama: pointsArr,
      soal_studi_kasus: presCaseStudy.trim() || 'Studi kasus analisis praktis akuntansi.',
      tipe_soal: presTipeSoal,
      link_template_slide: presSlideLink.trim() || 'https://docs.google.com/presentation/d/sample-template/edit',
      link_panduan: presGuideLink.trim() || 'https://drive.google.com/file/d/sample-panduan/view',
      target_durasi: presDuration.trim() || '3-5 Menit',
      rubrik: [
        { aspek: 'Penguasaan Materi & Ketepatan Konsep', bobot: 35 },
        { aspek: 'Kualitas Analisis Kasus (Middle/HOTS)', bobot: 35 },
        { aspek: 'Penyampaian, Artikulasi & Slide PPT', bobot: 30 }
      ],
      interview_questions: interviewObj
    };

    const updated = [newItem, ...presentationTopicsList];
    setPresentationTopicsList(updated);
    localStorage.setItem('lms_presentation_topics', JSON.stringify(updated));
    setIsAddPresTopicOpen(false);

    // Reset Form
    setPresTitle('');
    setPresDesc('');
    setPresPointsText('');
    setPresCaseStudy('');
    setPresSlideLink('');
    setPresGuideLink('');
    setPresDuration('3-5 Menit');
    setPresMiddleQuestion('');
    setPresMiddleQuestionEn('');
    setPresMiddleExpected('');
    setPresHotsQuestion('');
    setPresHotsQuestionEn('');
    setPresHotsExpected('');

    setPresSuccessToast('Topik presentasi baru berhasil ditambahkan ke katalog!');
    setTimeout(() => setPresSuccessToast(null), 3000);
  };

  const handleOpenEditPresTopic = (pt: PresentationTopicItem) => {
    setEditingPresTopicId(pt.id);
    setEditPresTitle(pt.judul_topik || '');
    setEditPresTopicId(pt.topic_id || topics[0]?.topic_id || 'top_01');
    setEditPresDesc(pt.deskripsi || '');
    setEditPresPointsText((pt.required_points || pt.poin_utama || []).join('\n'));
    setEditPresCaseStudy(pt.middle_hots_case_study || pt.soal_studi_kasus || '');
    setEditPresTipeSoal((pt.tipe_soal === 'HOTS' || pt.tipe_soal === 'MIDDLE') ? pt.tipe_soal : 'HOTS');
    setEditPresSlideLink(pt.link_template_slide || '');
    setEditPresGuideLink(pt.link_panduan || '');
    setEditPresDuration(pt.target_durasi || '3-5 Menit');

    if (pt.interview_questions) {
      setEditPresMiddleQuestion(pt.interview_questions.middle_question || '');
      setEditPresMiddleQuestionEn(pt.interview_questions.middle_question_en || '');
      setEditPresMiddleExpected((pt.interview_questions.middle_expected_points || []).join('\n'));
      setEditPresHotsQuestion(pt.interview_questions.hots_question || '');
      setEditPresHotsQuestionEn(pt.interview_questions.hots_question_en || '');
      setEditPresHotsExpected((pt.interview_questions.hots_expected_points || []).join('\n'));
    } else {
      setEditPresMiddleQuestion('');
      setEditPresMiddleQuestionEn('');
      setEditPresMiddleExpected('');
      setEditPresHotsQuestion('');
      setEditPresHotsQuestionEn('');
      setEditPresHotsExpected('');
    }

    setIsEditPresTopicOpen(true);
  };

  const handleSaveEditPresTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPresTopicId || !editPresTitle) return;

    const pointsArr = editPresPointsText
      ? editPresPointsText.split('\n').filter(p => p.trim())
      : ['1. Konsep dasar', '2. Pencatatan jurnal', '3. Penyajian laporan'];

    let interviewObj: any = undefined;
    if (editPresMiddleQuestion || editPresHotsQuestion) {
      interviewObj = {
        middle_question: editPresMiddleQuestion.trim(),
        middle_question_en: editPresMiddleQuestionEn.trim() || undefined,
        middle_expected_points: editPresMiddleExpected ? editPresMiddleExpected.split('\n').filter(p => p.trim()) : undefined,
        hots_question: editPresHotsQuestion.trim(),
        hots_question_en: editPresHotsQuestionEn.trim() || undefined,
        hots_expected_points: editPresHotsExpected ? editPresHotsExpected.split('\n').filter(p => p.trim()) : undefined
      };
    }

    const updated = presentationTopicsList.map(pt => {
      if (pt.id !== editingPresTopicId) return pt;
      return {
        ...pt,
        judul_topik: editPresTitle,
        topic_id: editPresTopicId,
        deskripsi: editPresDesc,
        required_points: pointsArr,
        poin_utama: pointsArr,
        middle_hots_case_study: editPresCaseStudy,
        soal_studi_kasus: editPresCaseStudy,
        tipe_soal: editPresTipeSoal,
        link_template_slide: editPresSlideLink,
        link_panduan: editPresGuideLink,
        target_durasi: editPresDuration,
        interview_questions: interviewObj
      };
    });

    setPresentationTopicsList(updated);
    localStorage.setItem('lms_presentation_topics', JSON.stringify(updated));
    setIsEditPresTopicOpen(false);
    setEditingPresTopicId(null);

    setPresSuccessToast(`Perubahan pada "${editPresTitle}" berhasil disimpan!`);
    setTimeout(() => setPresSuccessToast(null), 3000);
  };

  // Generate 2 Interview Questions (Middle & HOTS) for single card
  const handleGenerateInterviewForTopic = async (pt: PresentationTopicItem) => {
    setGeneratingInterviewTopicId(pt.id);
    try {
      const res = await api.generateInterviewQuestions({
        topic_name: pt.judul_topik,
        topic_id: pt.topic_id,
        description: pt.deskripsi,
        case_study: pt.middle_hots_case_study || pt.soal_studi_kasus
      });

      if (res.interview_questions) {
        const updated = presentationTopicsList.map(item => {
          if (item.id !== pt.id) return item;
          return {
            ...item,
            interview_questions: res.interview_questions
          };
        });

        setPresentationTopicsList(updated);
        localStorage.setItem('lms_presentation_topics', JSON.stringify(updated));

        // Auto-expand this card so user sees the 2 generated questions
        setExpandedPresTopicIds(prev => ({ ...prev, [pt.id]: true }));

        setPresSuccessToast(`Berhasil men-generate 2 soal wawancara (Middle & HOTS) untuk ${pt.judul_topik}!`);
        setTimeout(() => setPresSuccessToast(null), 3500);
      }
    } catch (err: any) {
      console.error('Failed to generate interview questions:', err);
      alert('Gagal membuat soal wawancara AI: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setGeneratingInterviewTopicId(null);
    }
  };

  // Generate in Add Modal
  const handleGenerateInterviewForAddModal = async () => {
    if (!presTitle) {
      alert('Mohon isi Judul Topik terlebih dahulu.');
      return;
    }
    setIsGeneratingPresInterviewAddModal(true);
    try {
      const res = await api.generateInterviewQuestions({
        topic_name: presTitle,
        topic_id: presTopicId,
        description: presDesc,
        case_study: presCaseStudy
      });
      if (res.interview_questions) {
        setPresMiddleQuestion(res.interview_questions.middle_question || '');
        setPresMiddleQuestionEn(res.interview_questions.middle_question_en || '');
        setPresMiddleExpected((res.interview_questions.middle_expected_points || []).join('\n'));
        setPresHotsQuestion(res.interview_questions.hots_question || '');
        setPresHotsQuestionEn(res.interview_questions.hots_question_en || '');
        setPresHotsExpected((res.interview_questions.hots_expected_points || []).join('\n'));
      }
    } catch (err: any) {
      console.error('Failed to generate interview in modal:', err);
      alert('Gagal membuat soal wawancara AI: ' + (err.message || 'Error'));
    } finally {
      setIsGeneratingPresInterviewAddModal(false);
    }
  };

  // Generate in Edit Modal
  const handleGenerateInterviewForEditModal = async () => {
    if (!editPresTitle) {
      alert('Mohon isi Judul Topik terlebih dahulu.');
      return;
    }
    setIsGeneratingEditInterviewModal(true);
    try {
      const res = await api.generateInterviewQuestions({
        topic_name: editPresTitle,
        topic_id: editPresTopicId,
        description: editPresDesc,
        case_study: editPresCaseStudy
      });
      if (res.interview_questions) {
        setEditPresMiddleQuestion(res.interview_questions.middle_question || '');
        setEditPresMiddleQuestionEn(res.interview_questions.middle_question_en || '');
        setEditPresMiddleExpected((res.interview_questions.middle_expected_points || []).join('\n'));
        setEditPresHotsQuestion(res.interview_questions.hots_question || '');
        setEditPresHotsQuestionEn(res.interview_questions.hots_question_en || '');
        setEditPresHotsExpected((res.interview_questions.hots_expected_points || []).join('\n'));
      }
    } catch (err: any) {
      console.error('Failed to generate interview in edit modal:', err);
      alert('Gagal membuat soal wawancara AI: ' + (err.message || 'Error'));
    } finally {
      setIsGeneratingEditInterviewModal(false);
    }
  };

  // Reset Default 60 Topics
  const handleResetDefaultTopics = () => {
    setPresentationTopicsList(PRESENTATION_TOPICS_60);
    localStorage.setItem('lms_presentation_topics', JSON.stringify(PRESENTATION_TOPICS_60));
    setIsResetDefaultTopicsModalOpen(false);
    setPresSuccessToast('Daftar topik presentasi telah di-reset kembali ke 60 Topik Standar LKS!');
    setTimeout(() => setPresSuccessToast(null), 3000);
  };

  const getTopicName = (id: string) => {
    if (!id || id === 'all') return 'Praktik Siklus Akuntansi';
    return topics.find(t => t.topic_id === id)?.nama_topik || 'Topik Akuntansi';
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            Bank Soal & Modul Pembelajaran AKL (3 Kategori Utama)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pusat soal teori bilingual berbobot HOTS, lembar kerja praktik komputer akuntansi (PJDM & AOL), serta bahan presentasi lengkap dengan soal wawancara berstandar Juri LKS SMK.
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
                Generator Soal AI
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

      {/* TABS NAVIGATION (3 CLEAR CHOICES FOR STUDENTS & TEACHERS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('teori')}
          className={`p-3 rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer font-bold text-xs ${
            activeTab === 'teori'
              ? 'bg-emerald-500 text-slate-950 shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Soal Teori Akuntansi ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('praktik')}
          className={`p-3 rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer font-bold text-xs ${
            activeTab === 'praktik'
              ? 'bg-blue-500 text-slate-950 shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Soal Praktik PJDM & AOL ({practicalList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presentasi')}
          className={`p-3 rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer font-bold text-xs ${
            activeTab === 'presentasi'
              ? 'bg-purple-500 text-slate-950 shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>3. Bahan Presentasi & Wawancara Juri LKS ({presentationTopicsList.length})</span>
        </button>
      </div>

      {/* AI GENERATOR BANNER FOR TEACHERS (TEORI AKUNTANSI) */}
      {currentUserRole === 'teacher' && activeTab === 'teori' && (
        <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                Generator Soal Teori Akuntansi Kustom
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Manual Topic & Difficulty Selector
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Guru dapat memasukkan topik akuntansi apa saja secara manual dan menentukan tingkat kognitif soal (<span className="text-emerald-400 font-semibold">LOTS</span>, <span className="text-blue-400 font-semibold">MIDDLE</span>, atau <span className="text-rose-400 font-semibold">HOTS</span>).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Buka AI Generator
          </button>
        </div>
      )}

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
                <option value="LOTS">LOTS (Low Order Thinking Skills)</option>
                <option value="MIDDLE">MIDDLE (Standar Prosedural)</option>
                <option value="HOTS">HOTS (Higher Order Thinking Skills)</option>
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
          {/* SEARCH & FILTER BAR UNTUK SOAL PRAKTIK (PJDM & AOL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={practicalSearchQuery}
                onChange={e => setPracticalSearchQuery(e.target.value)}
                placeholder="Cari judul soal praktik (PJDM / AOL)..."
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={selectedPracticeType}
                onChange={e => setSelectedPracticeType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="all">Semua Tipe Praktik (PJDM & AOL)</option>
                <option value="PJDM">PJDM (Jurnal & Siklus Manual)</option>
                <option value="AOL">AOL (Akuntansi Online)</option>
              </select>
            </div>
          </div>

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
              const isBothTypes = p.tipe_praktik === 'PJDM & AOL' || (p.target_types && p.target_types.length === 2);
              const isAolOnly = p.tipe_praktik === 'AOL' || (p.target_types?.length === 1 && p.target_types[0] === 'AOL');
              const isPjdmOnly = p.tipe_praktik === 'PJDM' || (p.target_types?.length === 1 && p.target_types[0] === 'PJDM');

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

                      {/* BADGES FOR PJDM AND AOL */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isBothTypes ? (
                          <>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                              PJDM
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                              AOL
                            </span>
                          </>
                        ) : isAolOnly ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                            AOL
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                            PJDM
                          </span>
                        )}
                      </div>

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

                        {/* Direct launcher to student task modal if in student mode */}
                        {currentUserRole === 'student' && onStartTask && (
                          <div className="flex items-center gap-2">
                            {tasks.filter(t => (t.task_type === 'PJDM' || t.task_type === 'AOL') && (t.judul.includes(p.judul) || p.task_ids?.includes(t.task_id))).map(t => (
                              <button
                                key={t.task_id}
                                onClick={() => onStartTask(t)}
                                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow ${
                                  t.task_type === 'PJDM'
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Buka Form Penugasan {t.task_type} Siswa
                              </button>
                            ))}
                          </div>
                        )}
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

      {/* ================= TAB 3: TOPIK PRESENTASI & WAWANCARA SUARA JURI LKS ================= */}
      {activeTab === 'presentasi' && (
        <div className="space-y-6">
          {/* SPECIAL SECTION: SOAL WAWANCARA TEORI & LISAN WITH DIRECT AUDIO RECORDER */}
          <div className="p-6 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Mic className="w-40 h-40 text-purple-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div>
                <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Uji Wawancara Lisan Dewan Juri LKS SMK (Middle & HOTS)
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  Materi Pengujian Wawancara: {topics.find(t => t.topic_id === (selectedTopicId === 'all' ? 'top_01' : selectedTopicId))?.nama_topik || 'Persamaan Dasar Akuntansi'}
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl shrink-0 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Target Rekam Jawaban: 3 - 5 Menit
              </span>
            </div>

            {/* STUDI KASUS DISPLAY */}
            <div className="p-4 bg-slate-950/90 border border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span>Studi Kasus Pembahasan & Pengujian Juri:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "Sebagai peserta LKS SMK Bidang Akuntansi, Anda bertindak sebagai Konsultan & Teknisi Akuntansi Junior yang sedang diaudit oleh Dewan Juri. Dewan Juri akan menguji ketepatan penguasaan standar akuntansi, logika jurnal, penyajian laporan keuangan, serta kemampuan analisis kritis atas anomali transaksi berikut."
              </p>
            </div>

            {/* MIDDLE & HOTS INTERVIEW QUESTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. MIDDLE QUESTION */}
              <div className="p-4 bg-slate-950/80 border border-blue-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-300 uppercase bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    Pertanyaan Juri #1 (Teknis & Prosedural - Middle)
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                  "Juri LKS bertanya: 'Saudara peserta LKS, jelaskan secara runtut dasar hukum SAK/PSAK, mekanisme debit-kredit, serta prosedur pencatatan transaksi untuk topik {topics.find(t => t.topic_id === (selectedTopicId === 'all' ? 'top_01' : selectedTopicId))?.nama_topik} agar laporan posisi keuangan bebas dari salah saji material!'"
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-blue-300">Rubrik Penilaian Juri:</strong> Ketepatan definisi, sistematika alur pencatatan jurnal, penggolongan akun, dan artikulasi bahasa teknis akuntansi.
                </div>
              </div>

              {/* 2. HOTS QUESTION */}
              <div className="p-4 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-300 uppercase bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    Pertanyaan Juri #2 (Analisis & Evaluasi - HOTS)
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                  "Juri LKS bertanya: 'Jika dalam simulasi perusahaan ditemukan ketidaksesuaian atau potensi fraud pada pos {topics.find(t => t.topic_id === (selectedTopicId === 'all' ? 'top_01' : selectedTopicId))?.nama_topik}, evaluasi bagaimana dampaknya terhadap laba bersih, beban pajak terutang, serta berikan rekomendasi solusi pengendalian internal (SOP)!'"
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-rose-300">Rubrik Penilaian Juri:</strong> Logika berpikir kritis (problem solving), perhitungan dampak finansial, pembuatan jurnal penyesuaian/koreksi, dan mitigasi risiko.
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

          {/* SUCCESS TOAST NOTIFICATION */}
          {presSuccessToast && (
            <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{presSuccessToast}</span>
              </div>
              <button
                onClick={() => setPresSuccessToast(null)}
                className="text-emerald-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TOOLBAR: SEARCH, FILTERS & ACTION BUTTONS */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={presSearchQuery}
                  onChange={e => setPresSearchQuery(e.target.value)}
                  placeholder="Cari judul topik, studi kasus, atau kata kunci presentasi..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl outline-none focus:border-purple-500 transition placeholder:text-slate-500"
                />
                {presSearchQuery && (
                  <button
                    onClick={() => setPresSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons: Add & Reset */}
              {currentUserRole === 'teacher' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsAddPresTopicOpen(true)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950/50"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Topik Baru
                  </button>
                  <button
                    onClick={() => setIsResetDefaultTopicsModalOpen(true)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                    title="Reset ke 60 Topik Standar LKS"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Reset 60 Topik
                  </button>
                </div>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Topic Selector */}
                <select
                  value={presTopicFilter}
                  onChange={e => setPresTopicFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">Semua Kategori Topik ({presentationTopicsList.length})</option>
                  {topics.map(t => (
                    <option key={t.topic_id} value={t.topic_id}>
                      {t.nama_topik}
                    </option>
                  ))}
                </select>

                {/* Level Filter */}
                <select
                  value={presLevelFilter}
                  onChange={e => setPresLevelFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">Semua Level (Middle & HOTS)</option>
                  <option value="MIDDLE">Level MIDDLE</option>
                  <option value="HOTS">Level HOTS (Analitis)</option>
                </select>

                {/* AI Interview Filter */}
                <select
                  value={presInterviewFilter}
                  onChange={e => setPresInterviewFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">Semua Status Wawancara</option>
                  <option value="has_interview">✨ Ada 2 Soal Wawancara AI</option>
                  <option value="no_interview">Belum Ada Wawancara</option>
                </select>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPresViewMode('list')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                      presViewMode === 'list'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Daftar Terlipat (Accordion)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Daftar Terlipat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresViewMode('card')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                      presViewMode === 'card'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Grid Kartu (Card View)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Grid Kartu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresViewMode('table')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                      presViewMode === 'table'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Tampilan Tabel Ringkas"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tabel Ringkas</span>
                  </button>
                </div>
              </div>

              {/* Expand / Collapse All (Only for list view) */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">
                  Menampilkan <strong className="text-white">{filteredPresentationTopics.length}</strong> topik
                </span>
                {presViewMode === 'list' && (
                  <>
                    <button
                      onClick={expandAllPresTopics}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                      Buka Semua
                    </button>
                    <button
                      onClick={collapseAllPresTopics}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      Lipat Semua
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* LIST / CARD / TABLE VIEW OF PRESENTATION TOPICS */}
          {filteredPresentationTopics.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <p className="font-semibold text-slate-300">Tidak ada topik presentasi yang cocok dengan kriteria pencarian/filter.</p>
              <button
                onClick={() => {
                  setPresSearchQuery('');
                  setPresTopicFilter('all');
                  setPresLevelFilter('all');
                  setPresInterviewFilter('all');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : presViewMode === 'card' ? (
            /* ================= CARD / GRID VIEW ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPresentationTopics.map(pt => {
                const isGeneratingThis = generatingInterviewTopicId === pt.id;
                const hasInterviewQuestions = !!(pt.interview_questions?.middle_question || pt.interview_questions?.hots_question);

                return (
                  <div
                    key={pt.id}
                    className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-sm hover:shadow-lg group"
                  >
                    <div className="space-y-3">
                      {/* Card Header Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-lg">
                            {pt.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase border ${
                              pt.tipe_soal === 'HOTS'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            {pt.tipe_soal || 'MIDDLE'}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {pt.target_durasi || '3-5 Menit'}
                        </span>
                      </div>

                      {/* Topic Title */}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition line-clamp-2 leading-snug">
                          {pt.judul_topik}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          • {getTopicName(pt.topic_id)}
                        </p>
                      </div>

                      {/* Description / Summary Preview */}
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        {pt.middle_hots_case_study || pt.soal_studi_kasus || pt.deskripsi}
                      </p>

                      {/* Status AI Interview Badge */}
                      <div className="flex items-center justify-between text-[11px]">
                        {hasInterviewQuestions ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            2 Soal Wawancara AI ✓
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Belum ada 2 soal wawancara
                          </span>
                        )}
                        <span className="text-slate-400">
                          {(pt.required_points || pt.poin_utama || []).length} Poin Wajib
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPresTopic(pt)}
                        className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        Buka Detail & Wawancara
                      </button>

                      <div className="flex items-center gap-1">
                        {currentUserRole === 'teacher' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleGenerateInterviewForTopic(pt)}
                              disabled={isGeneratingThis}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Generate 2 Soal Wawancara AI"
                            >
                              {isGeneratingThis ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPresTopic(pt)}
                              className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Edit Topik"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingPresTopicId(pt.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Hapus Topik"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : presViewMode === 'table' ? (
            /* ================= TABLE VIEW ================= */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                    <tr>
                      <th className="p-3.5">ID / No</th>
                      <th className="p-3.5">Materi & Judul Topik</th>
                      <th className="p-3.5">Level</th>
                      <th className="p-3.5">Durasi</th>
                      <th className="p-3.5">Status Wawancara AI</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredPresentationTopics.map(pt => {
                      const isGeneratingThis = generatingInterviewTopicId === pt.id;
                      const hasInterviewQuestions = !!(pt.interview_questions?.middle_question || pt.interview_questions?.hots_question);

                      return (
                        <tr
                          key={pt.id}
                          className="hover:bg-slate-850/60 transition cursor-pointer"
                          onClick={() => setPreviewPresTopic(pt)}
                        >
                          <td className="p-3.5 font-mono font-bold text-purple-400 whitespace-nowrap">
                            {pt.id}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white hover:text-purple-300 transition">
                              {pt.judul_topik}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {getTopicName(pt.topic_id)}
                            </div>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase border ${
                                pt.tipe_soal === 'HOTS'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                  : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                              }`}
                            >
                              {pt.tipe_soal || 'MIDDLE'}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-slate-400">
                            {pt.target_durasi || '3-5 Menit'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {hasInterviewQuestions ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[10px]">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                2 Soal AI ✓
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px] italic">
                                Belum Ada
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewPresTopic(pt)}
                                className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Detail
                              </button>
                              {currentUserRole === 'teacher' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateInterviewForTopic(pt)}
                                    disabled={isGeneratingThis}
                                    className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
                                    title="AI Interview"
                                  >
                                    {isGeneratingThis ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                    ) : (
                                      <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditPresTopic(pt)}
                                    className="p-1 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ================= LIST / ACCORDION VIEW (DEFAULT) ================= */
            filteredPresentationTopics.map((pt, idx) => {
              const isExpanded = !!expandedPresTopicIds[pt.id];
              const isGeneratingThis = generatingInterviewTopicId === pt.id;
              const hasInterviewQuestions = !!(pt.interview_questions?.middle_question || pt.interview_questions?.hots_question);

              return (
                <div
                  key={pt.id}
                  className={`bg-slate-900 border rounded-2xl overflow-hidden transition shadow-sm ${
                    isExpanded ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 'border-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  {/* FOLDABLE HEADER ROW */}
                  <div
                    onClick={() => togglePresTopicExpand(pt.id)}
                    className="p-4 bg-slate-900 hover:bg-slate-850 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition select-none"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4" />}
                      </div>

                      {/* Level Badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase shrink-0 border ${
                        pt.tipe_soal === 'HOTS'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                      }`}>
                        {pt.tipe_soal || 'MIDDLE'}
                      </span>

                      {/* Status Wawancara AI Badge */}
                      {hasInterviewQuestions ? (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          2 Wawancara AI ✓
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          Wawancara Belum Ada
                        </span>
                      )}

                      <div className="truncate min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                          <span>{pt.judul_topik}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">• {getTopicName(pt.topic_id)}</p>
                      </div>
                    </div>

                    {/* Right-Side Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-auto" onClick={e => e.stopPropagation()}>
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {pt.target_durasi || '3-5 Menit'}
                      </span>

                      {/* AI Interview Generator Button */}
                      {currentUserRole === 'teacher' && (
                        <button
                          type="button"
                          onClick={() => handleGenerateInterviewForTopic(pt)}
                          disabled={isGeneratingThis}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          title="Generate 2 Soal Wawancara AI (Middle & HOTS)"
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              <span className="text-[11px]">Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px]">AI 2 Wawancara</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Edit Topic Button */}
                      {currentUserRole === 'teacher' && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditPresTopic(pt)}
                          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition cursor-pointer"
                          title="Edit Topik Presentasi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Topic Button */}
                      {currentUserRole === 'teacher' && (
                        <button
                          type="button"
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
                    <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/50">
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{pt.deskripsi}</p>

                      {/* POIN UTAMA PRESENTASI */}
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Layers className="w-4 h-4" />
                          Required Points (Poin Wajib Dipaparkan dalam Video Presentasi):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                          {(pt.required_points || pt.poin_utama || []).map((poin, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{poin}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* STUDI KASUS */}
                      {(pt.middle_hots_case_study || pt.soal_studi_kasus) && (
                        <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                          <div className="font-bold text-amber-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-amber-400" />
                              Middle / HOTS Case Study (Perspektif Juri LKS, Praktisi & Dosen):
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              pt.tipe_soal === 'HOTS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}>
                              Kasus {pt.tipe_soal || 'MIDDLE'}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                            {pt.middle_hots_case_study || pt.soal_studi_kasus}
                          </p>
                        </div>
                      )}

                      {/* 2 SOAL WAWANCARA (MIDDLE & HOTS) GENERATED WITH AI */}
                      <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-purple-500/20 text-purple-300">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-purple-300">
                              2 Soal Wawancara Lisan (Level Middle & HOTS):
                            </span>
                          </div>

                          {currentUserRole === 'teacher' && (
                            <button
                              type="button"
                              onClick={() => handleGenerateInterviewForTopic(pt)}
                              disabled={isGeneratingThis}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                            >
                              {isGeneratingThis ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
                                  <span>Sedang Mengenerate...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <span>{hasInterviewQuestions ? 'Generate Ulang Soal AI' : 'Generate 2 Soal Wawancara AI'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {hasInterviewQuestions ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* 1. MIDDLE QUESTION */}
                            <div className="p-3.5 bg-slate-900/90 border border-blue-500/30 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-blue-300 uppercase bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded">
                                  1. Soal Wawancara Level MIDDLE
                                </span>
                              </div>
                              <p className="font-semibold text-slate-100 leading-relaxed">
                                "{pt.interview_questions?.middle_question}"
                              </p>
                              {pt.interview_questions?.middle_question_en && (
                                <p className="text-[11px] text-slate-400 italic">
                                  "{pt.interview_questions.middle_question_en}"
                                </p>
                              )}
                              {pt.interview_questions?.middle_expected_points && pt.interview_questions.middle_expected_points.length > 0 && (
                                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                                  <strong className="text-blue-400 font-bold block">Poin Kunci Jawaban Guru:</strong>
                                  <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                                    {pt.interview_questions.middle_expected_points.map((ptk, pIdx) => (
                                      <li key={pIdx}>{ptk}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* 2. HOTS QUESTION */}
                            <div className="p-3.5 bg-slate-900/90 border border-rose-500/30 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-rose-300 uppercase bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded">
                                  2. Soal Wawancara Level HOTS (Analitis)
                                </span>
                              </div>
                              <p className="font-semibold text-slate-100 leading-relaxed">
                                "{pt.interview_questions?.hots_question}"
                              </p>
                              {pt.interview_questions?.hots_question_en && (
                                <p className="text-[11px] text-slate-400 italic">
                                  "{pt.interview_questions.hots_question_en}"
                                </p>
                              )}
                              {pt.interview_questions?.hots_expected_points && pt.interview_questions.hots_expected_points.length > 0 && (
                                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                                  <strong className="text-rose-400 font-bold block">Poin Kunci Jawaban Guru:</strong>
                                  <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                                    {pt.interview_questions.hots_expected_points.map((ptk, pIdx) => (
                                      <li key={pIdx}>{ptk}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
                            <p className="text-xs text-slate-400">
                              Topik ini belum memiliki 2 butir soal wawancara terstandarisasi (Middle & HOTS).
                            </p>
                            {currentUserRole === 'teacher' && (
                              <button
                                type="button"
                                onClick={() => handleGenerateInterviewForTopic(pt)}
                                disabled={isGeneratingThis}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                              >
                                {isGeneratingThis ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                                    <span>Sedang Membuat Soal AI...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generate 2 Soal Wawancara AI (Middle & HOTS) Sekarang</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* LINKS & ACTION BUTTONS */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                        <div className="flex flex-wrap items-center gap-2">
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

                        {currentUserRole === 'teacher' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPresTopic(pt)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-purple-400" />
                              Edit Topik
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingPresTopicId(pt.id)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              Hapus
                            </button>
                          </div>
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

      {/* ================= MODAL: PREVIEW PRESENTATION TOPIC (FOR CARD & TABLE VIEWS) ================= */}
      {previewPresTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-lg">
                    {previewPresTopic.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase border ${
                      previewPresTopic.tipe_soal === 'HOTS'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {previewPresTopic.tipe_soal || 'MIDDLE'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                    <Clock className="w-3.5 h-3.5" />
                    {previewPresTopic.target_durasi || '3-5 Menit'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {previewPresTopic.judul_topik}
                </h3>
                <p className="text-xs text-slate-400">• {getTopicName(previewPresTopic.topic_id)}</p>
              </div>

              <button
                onClick={() => setPreviewPresTopic(null)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed font-sans">{previewPresTopic.deskripsi}</p>

              {/* Required Points */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Poin Wajib Dipaparkan dalam Presentasi:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  {(previewPresTopic.required_points || previewPresTopic.poin_utama || []).map((poin, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{poin}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Study */}
              {(previewPresTopic.middle_hots_case_study || previewPresTopic.soal_studi_kasus) && (
                <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      Studi Kasus Juri LKS ({previewPresTopic.tipe_soal || 'MIDDLE'}):
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    {previewPresTopic.middle_hots_case_study || previewPresTopic.soal_studi_kasus}
                  </p>
                </div>
              )}

              {/* 2 Interview Questions */}
              {previewPresTopic.interview_questions?.middle_question || previewPresTopic.interview_questions?.hots_question ? (
                <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-3">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    2 Soal Wawancara Lisan (Level Middle & HOTS):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Middle */}
                    {previewPresTopic.interview_questions.middle_question && (
                      <div className="p-3 bg-slate-900 border border-blue-500/30 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-blue-300 uppercase bg-blue-950 px-1.5 py-0.5 rounded">
                          Level Middle
                        </span>
                        <p className="text-white font-semibold">"{previewPresTopic.interview_questions.middle_question}"</p>
                        {previewPresTopic.interview_questions.middle_expected_points && (
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            <strong>Kunci Jawaban Guru:</strong>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {previewPresTopic.interview_questions.middle_expected_points.map((ptk, pIdx) => (
                                <li key={pIdx}>{ptk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* HOTS */}
                    {previewPresTopic.interview_questions.hots_question && (
                      <div className="p-3 bg-slate-900 border border-rose-500/30 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-300 uppercase bg-rose-950 px-1.5 py-0.5 rounded">
                          Level HOTS (Analitis)
                        </span>
                        <p className="text-white font-semibold">"{previewPresTopic.interview_questions.hots_question}"</p>
                        {previewPresTopic.interview_questions.hots_expected_points && (
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            <strong>Kunci Jawaban Guru:</strong>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {previewPresTopic.interview_questions.hots_expected_points.map((ptk, pIdx) => (
                                <li key={pIdx}>{ptk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Links */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {previewPresTopic.link_template_slide && (
                  <a
                    href={previewPresTopic.link_template_slide}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                    Buka Template Slide PPT
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {previewPresTopic.link_panduan && (
                  <a
                    href={previewPresTopic.link_panduan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    Panduan Presentasi
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewPresTopic(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: AI QUESTION GENERATOR ================= */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative space-y-5 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    AI Question Generator
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Gemini 3.7 Flash
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Generate soal teori akuntansi bilingual (ID & EN) dari topik manual maupun kurikulum dengan kontrol tingkat kesulitan kognitif.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsGeneratorOpen(false);
                  setGenSuccessMsg(null);
                  setGenErrorMsg(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Notifications */}
              {genSuccessMsg && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{genSuccessMsg}</span>
                  </div>
                  <button onClick={() => setGenSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {genErrorMsg && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{genErrorMsg}</span>
                  </div>
                  <button onClick={() => setGenErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Step 1: Input Topic Selection */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    1. Topik Akuntansi:
                  </label>
                  <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setGenTopicMode('manual')}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        genTopicMode === 'manual'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✍️ Ketik Topik Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenTopicMode('preset')}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        genTopicMode === 'preset'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📋 Pilih dari 30 Topik
                    </button>
                  </div>
                </div>

                {genTopicMode === 'manual' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={genManualTopic}
                      onChange={e => setGenManualTopic(e.target.value)}
                      placeholder="Masukkan nama topik, contoh: Jurnal Penyesuaian Beban Dibayar Dimuka..."
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400">Contoh Cepat:</span>
                      {[
                        'Jurnal Penyesuaian Beban & Pendapatan',
                        'Rekonsiliasi Bank 4 Kolom',
                        'Akuntansi Kas Kecil Imprest',
                        'Persediaan FIFO Perpetual',
                        'Penyusutan Aset Tetap Garis Lurus',
                        'Kertas Kerja 10 Kolom',
                        'Jurnal Penutup & Pembalik',
                        'Pajak PPN & PPh 21'
                      ].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setGenManualTopic(chip)}
                          className="px-2 py-0.5 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 rounded-md transition cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <select
                      value={genPresetTopicId}
                      onChange={e => setGenPresetTopicId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {topics.map(t => (
                        <option key={t.topic_id} value={t.topic_id}>
                          Topik #{t.urutan}: {t.nama_topik}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 2: Difficulty Level Selection */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  2. Tingkat Kesulitan Soal:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenDifficulty('LOTS')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      genDifficulty === 'LOTS'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-emerald-400">LOTS</span>
                      {genDifficulty === 'LOTS' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Pemahaman konsep dasar, definisi & klasifikasi akun.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenDifficulty('MIDDLE')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      genDifficulty === 'MIDDLE'
                        ? 'bg-blue-500/15 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-blue-400">MIDDLE</span>
                      {genDifficulty === 'MIDDLE' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Prosedur transaksi, penjurnalan & perhitungan nilai standar.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenDifficulty('HOTS')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      genDifficulty === 'HOTS'
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-rose-400">HOTS</span>
                      {genDifficulty === 'HOTS' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Studi kasus kompleks, koreksi salah jurnal & analisis distorsi laporan.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenDifficulty('KOMBINASI')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      genDifficulty === 'KOMBINASI'
                        ? 'bg-purple-500/15 border-purple-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-purple-400">KOMBINASI</span>
                      {genDifficulty === 'KOMBINASI' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Campuran seimbang soal Middle dan soal HOTS analitis.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: Count and Custom Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Jumlah Soal:
                  </label>
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                    {[5, 10, 15, 20].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setGenCount(cnt)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                          genCount === cnt
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Fokus Khusus / Instruksi Guru (Opsional):
                  </label>
                  <input
                    type="text"
                    value={genCustomInstructions}
                    onChange={e => setGenCustomInstructions(e.target.value)}
                    placeholder="Contoh: Fokus pada kasus retur penjualan tunai atau angka transaksi ratusan juta..."
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Action Button: Generate Now */}
              <button
                type="button"
                onClick={() => handleGenerateAIQuestion()}
                disabled={isGenerating}
                className="w-full py-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Gemini AI Sedang Menyusun Soal Akuntansi Bilingual...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Generate {genCount} Soal {genDifficulty} untuk "{getEffectiveTopicName()}"</span>
                  </>
                )}
              </button>

              {/* Generated Questions Preview Cards */}
              {generatedQuestionsList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllGen}
                        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                      >
                        {selectedGenQuestionIds.size === generatedQuestionsList.length ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="font-semibold">
                          Pilih Semua ({selectedGenQuestionIds.size}/{generatedQuestionsList.length})
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSelectedGeneratedQuestions}
                      disabled={isSavingGenQuestions || selectedGenQuestionIds.size === 0}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                    >
                      {isSavingGenQuestions ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Simpan ({selectedGenQuestionIds.size}) Soal ke Bank Soal</span>
                    </button>
                  </div>

                  {/* Question Cards */}
                  <div className="space-y-3">
                    {generatedQuestionsList.map((q, idx) => {
                      const isSelected = selectedGenQuestionIds.has(q.question_id);
                      return (
                        <div
                          key={q.question_id || idx}
                          onClick={() => handleToggleSelectGenQuestion(q.question_id)}
                          className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                            isSelected
                              ? 'bg-slate-950 border-emerald-500/60 shadow-md'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">Soal #{idx + 1}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                q.difficulty === 'HOTS'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : q.difficulty === 'LOTS'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {q.difficulty}
                              </span>
                              {q.kompetensi && (
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {q.kompetensi}
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                          </div>

                          {/* Question Text */}
                          <div className="space-y-1 text-xs">
                            <p className="text-white font-medium leading-relaxed">
                              {q.pertanyaan_id}
                            </p>
                            <p className="text-emerald-300/90 italic text-[11px] leading-relaxed">
                              "{q.question_en}"
                            </p>
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                              const optField = `option_${optKey.toLowerCase()}` as keyof Question;
                              const optVal = q[optField] as string;
                              const isCorrect = q.correct_answer === optKey;

                              return (
                                <div
                                  key={optKey}
                                  className={`p-2 rounded-lg text-xs border flex items-start gap-2 ${
                                    isCorrect
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                                      : 'bg-slate-900 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                    isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {optKey}
                                  </span>
                                  <span className="leading-snug">{optVal}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-[11px]">
                            <div className="font-bold text-emerald-400 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              Pembahasan & Analisis:
                            </div>
                            <p className="text-slate-300 leading-relaxed">{q.explanation_id}</p>
                            {q.explanation_en && (
                              <p className="text-slate-400 italic text-[10px] leading-relaxed border-t border-slate-800 pt-1">
                                {q.explanation_en}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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

            <form onSubmit={handleAddPractical} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Judul Soal Praktik:</label>
                <input
                  type="text"
                  required
                  value={prakTitle}
                  onChange={e => setPrakTitle(e.target.value)}
                  placeholder="misal: Rekonsiliasi Kas Bank & Penyesuaian PT Sukses"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* 2 PILIHAN CHECKLIST TIPE PRAKTIK: PJDM & AOL */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Tipe Praktik (Pilih salah satu atau keduanya untuk dikerjakan siswa): *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. CHECKLIST PJDM */}
                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                      prakIsPjdm
                        ? 'bg-blue-950/50 border-blue-500 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={prakIsPjdm}
                      onChange={e => setPrakIsPjdm(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-500 focus:ring-blue-400 border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          PJDM
                        </span>
                        <span className={prakIsPjdm ? 'text-blue-300 font-extrabold' : 'text-slate-300'}>
                          Jurnal Dasar & Manual
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Lembar kerja spreadsheet siklus akuntansi (Jurnal Umum, Buku Besar, Neraca Saldo, Laporan).
                      </p>
                    </div>
                  </label>

                  {/* 2. CHECKLIST AOL */}
                  <label
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                      prakIsAol
                        ? 'bg-indigo-950/50 border-indigo-500 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={prakIsAol}
                      onChange={e => setPrakIsAol(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          AOL
                        </span>
                        <span className={prakIsAol ? 'text-indigo-300 font-extrabold' : 'text-slate-300'}>
                          Akuntansi Online
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Simulasi software komputer akuntansi online (Accurate Online / master data & transaksi).
                      </p>
                    </div>
                  </label>
                </div>

                {!prakIsPjdm && !prakIsAol && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                    ⚠️ Harap centang minimal salah satu tipe praktik (PJDM atau AOL).
                  </p>
                )}

                <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Otomatis membuat penugasan dan slot pengumpulan di halaman siswa sesuai tipe yang dicentang.
                  </span>
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
                  *Cantumkan tautan Google Drive / Sheets yang berisi berkas soal, bukti transaksi, dan jobsheet pengerjaan siswa.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Deskripsi Singkat Instruksi:</label>
                <textarea
                  rows={3}
                  value={prakDesc}
                  onChange={e => setPrakDesc(e.target.value)}
                  placeholder="Petunjuk instruksi pengerjaan tugas praktik untuk siswa..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPracticalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPractical || (!prakIsPjdm && !prakIsAol)}
                  className="px-4 py-2 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 cursor-pointer flex items-center gap-1.5 shadow"
                >
                  {isSavingPractical ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan & Menugaskan...
                    </>
                  ) : (
                    'Simpan & Terbitkan Penugasan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: TAMBAH TOPIK PRESENTASI ================= */}
      {isAddPresTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Tambah Topik Presentasi Baru
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      LKS Akuntansi
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Masukkan judul topik, studi kasus, poin pemaparan, serta generate 2 butir soal wawancara.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPresTopicOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPresTopic} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Judul Topik Presentasi:</label>
                  <input
                    type="text"
                    required
                    value={presTitle}
                    onChange={e => setPresTitle(e.target.value)}
                    placeholder="misal: Topik #61: Rekonsiliasi Fiskal & PPh Badan"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori Topik Akuntansi:</label>
                  <select
                    value={presTopicId}
                    onChange={e => setPresTopicId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {topics.map(t => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.nama_topik}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Level & Target Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan Studi Kasus:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPresTipeSoal('MIDDLE')}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        presTipeSoal === 'MIDDLE'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>MIDDLE (Aplikasi)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresTipeSoal('HOTS')}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        presTipeSoal === 'HOTS'
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>HOTS (Analitis/Juri)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Durasi Presentasi:</label>
                  <input
                    type="text"
                    value={presDuration}
                    onChange={e => setPresDuration(e.target.value)}
                    placeholder="3-5 Menit"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi Singkat Topik:</label>
                <textarea
                  rows={2}
                  value={presDesc}
                  onChange={e => setPresDesc(e.target.value)}
                  placeholder="Gambarkan ringkasan konsep akuntansi yang harus dipahami siswa..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* Case Study */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Studi Kasus Analisis (Perspektif Juri & Praktisi):</label>
                <textarea
                  rows={2}
                  value={presCaseStudy}
                  onChange={e => setPresCaseStudy(e.target.value)}
                  placeholder="Kasus transaksi nyata perusahaan yang memerlukan analisis kritis siswa..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* Required Points */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Poin-Poin Wajib Dipaparkan (1 baris per poin):</label>
                <textarea
                  rows={3}
                  value={presPointsText}
                  onChange={e => setPresPointsText(e.target.value)}
                  placeholder="1. Pemaparan konsep & urgensi&#10;2. Mekanisme jurnal penyesuaian&#10;3. Penyajian dalam laporan keuangan&#10;4. Mitigasi risiko & solusi"
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* SECTION: 2 INTERVIEW QUESTIONS WITH AI GENERATOR */}
              <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>2 Soal Wawancara AI (Middle & HOTS)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateInterviewForAddModal}
                    disabled={isGeneratingPresInterviewAddModal || !presTitle}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingPresInterviewAddModal ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Otomatis dengan AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Middle Question */}
                <div className="space-y-2 p-3 bg-slate-900 border border-blue-500/30 rounded-lg">
                  <span className="text-[10px] font-extrabold text-blue-300 uppercase bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded inline-block">
                    1. Soal Wawancara Middle (Konseptual & Prosedural)
                  </span>
                  <input
                    type="text"
                    value={presMiddleQuestion}
                    onChange={e => setPresMiddleQuestion(e.target.value)}
                    placeholder="Pertanyaan bahasa Indonesia..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={presMiddleQuestionEn}
                    onChange={e => setPresMiddleQuestionEn(e.target.value)}
                    placeholder="English question (optional)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 italic text-[11px] rounded-lg p-2 outline-none"
                  />
                  <textarea
                    rows={2}
                    value={presMiddleExpected}
                    onChange={e => setPresMiddleExpected(e.target.value)}
                    placeholder="Poin-poin kunci jawaban guru (1 baris per poin)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg p-2 outline-none"
                  />
                </div>

                {/* HOTS Question */}
                <div className="space-y-2 p-3 bg-slate-900 border border-rose-500/30 rounded-lg">
                  <span className="text-[10px] font-extrabold text-rose-300 uppercase bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded inline-block">
                    2. Soal Wawancara HOTS (Analitis & Evaluatif)
                  </span>
                  <input
                    type="text"
                    value={presHotsQuestion}
                    onChange={e => setPresHotsQuestion(e.target.value)}
                    placeholder="Pertanyaan analitis / evaluatif bahasa Indonesia..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 outline-none focus:border-rose-500"
                  />
                  <input
                    type="text"
                    value={presHotsQuestionEn}
                    onChange={e => setPresHotsQuestionEn(e.target.value)}
                    placeholder="English analytical question (optional)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 italic text-[11px] rounded-lg p-2 outline-none"
                  />
                  <textarea
                    rows={2}
                    value={presHotsExpected}
                    onChange={e => setPresHotsExpected(e.target.value)}
                    placeholder="Poin-poin kunci jawaban guru (1 baris per poin)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Link Template Slide PPT (Opsional):</label>
                  <input
                    type="url"
                    value={presSlideLink}
                    onChange={e => setPresSlideLink(e.target.value)}
                    placeholder="https://docs.google.com/presentation/d/..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Link Panduan Presentasi (Opsional):</label>
                  <input
                    type="url"
                    value={presGuideLink}
                    onChange={e => setPresGuideLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddPresTopicOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg transition"
                >
                  Simpan Topik Presentasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: EDIT TOPIK PRESENTASI ================= */}
      {isEditPresTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Edit Topik Presentasi
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ID: {editingPresTopicId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perbarui judul, studi kasus, durasi, rubrik, atau sesuaikan 2 butir soal wawancara AI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditPresTopicOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPresTopic} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Judul Topik Presentasi:</label>
                  <input
                    type="text"
                    required
                    value={editPresTitle}
                    onChange={e => setEditPresTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kategori Topik Akuntansi:</label>
                  <select
                    value={editPresTopicId}
                    onChange={e => setEditPresTopicId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {topics.map(t => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.nama_topik}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Level & Target Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan Studi Kasus:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPresTipeSoal('MIDDLE')}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        editPresTipeSoal === 'MIDDLE'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>MIDDLE (Aplikasi)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPresTipeSoal('HOTS')}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        editPresTipeSoal === 'HOTS'
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>HOTS (Analitis/Juri)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Durasi Presentasi:</label>
                  <input
                    type="text"
                    value={editPresDuration}
                    onChange={e => setEditPresDuration(e.target.value)}
                    placeholder="3-5 Menit"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi Singkat Topik:</label>
                <textarea
                  rows={2}
                  value={editPresDesc}
                  onChange={e => setEditPresDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* Case Study */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Studi Kasus Analisis (Perspektif Juri & Praktisi):</label>
                <textarea
                  rows={2}
                  value={editPresCaseStudy}
                  onChange={e => setEditPresCaseStudy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* Required Points */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Poin-Poin Wajib Dipaparkan (1 baris per poin):</label>
                <textarea
                  rows={3}
                  value={editPresPointsText}
                  onChange={e => setEditPresPointsText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* SECTION: 2 INTERVIEW QUESTIONS WITH AI GENERATOR */}
              <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>2 Soal Wawancara AI (Middle & HOTS)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateInterviewForEditModal}
                    disabled={isGeneratingEditInterviewModal || !editPresTitle}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingEditInterviewModal ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Regenerating AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Regenerate dengan AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Middle Question */}
                <div className="space-y-2 p-3 bg-slate-900 border border-blue-500/30 rounded-lg">
                  <span className="text-[10px] font-extrabold text-blue-300 uppercase bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded inline-block">
                    1. Soal Wawancara Middle (Konseptual & Prosedural)
                  </span>
                  <input
                    type="text"
                    value={editPresMiddleQuestion}
                    onChange={e => setEditPresMiddleQuestion(e.target.value)}
                    placeholder="Pertanyaan bahasa Indonesia..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={editPresMiddleQuestionEn}
                    onChange={e => setEditPresMiddleQuestionEn(e.target.value)}
                    placeholder="English question (optional)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 italic text-[11px] rounded-lg p-2 outline-none"
                  />
                  <textarea
                    rows={2}
                    value={editPresMiddleExpected}
                    onChange={e => setEditPresMiddleExpected(e.target.value)}
                    placeholder="Poin-poin kunci jawaban guru (1 baris per poin)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg p-2 outline-none"
                  />
                </div>

                {/* HOTS Question */}
                <div className="space-y-2 p-3 bg-slate-900 border border-rose-500/30 rounded-lg">
                  <span className="text-[10px] font-extrabold text-rose-300 uppercase bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded inline-block">
                    2. Soal Wawancara HOTS (Analitis & Evaluatif)
                  </span>
                  <input
                    type="text"
                    value={editPresHotsQuestion}
                    onChange={e => setEditPresHotsQuestion(e.target.value)}
                    placeholder="Pertanyaan analitis / evaluatif bahasa Indonesia..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 outline-none focus:border-rose-500"
                  />
                  <input
                    type="text"
                    value={editPresHotsQuestionEn}
                    onChange={e => setEditPresHotsQuestionEn(e.target.value)}
                    placeholder="English analytical question (optional)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 italic text-[11px] rounded-lg p-2 outline-none"
                  />
                  <textarea
                    rows={2}
                    value={editPresHotsExpected}
                    onChange={e => setEditPresHotsExpected(e.target.value)}
                    placeholder="Poin-poin kunci jawaban guru (1 baris per poin)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Link Template Slide PPT (Opsional):</label>
                  <input
                    type="url"
                    value={editPresSlideLink}
                    onChange={e => setEditPresSlideLink(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Link Panduan Presentasi (Opsional):</label>
                  <input
                    type="url"
                    value={editPresGuideLink}
                    onChange={e => setEditPresGuideLink(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditPresTopicOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg transition"
                >
                  Simpan Perubahan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: RESET DEFAULT 60 TOPICS ================= */}
      {isResetDefaultTopicsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset ke 60 Topik Standar?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh daftar topik presentasi ke <strong>60 Topik Standar Kurikulum LKS Akuntansi</strong> dan menghapus perubahan atau topik kustom yang Anda tambahkan.
            </p>
            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsResetDefaultTopicsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDefaultTopics}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition cursor-pointer"
              >
                Ya, Reset 60 Topik
              </button>
            </div>
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
